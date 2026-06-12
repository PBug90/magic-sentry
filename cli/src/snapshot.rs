//! Consistent snapshots of the WC3 observer shared memory.
//!
//! The `War3StatsObserverSharedMemory` block offers no synchronization
//! primitive (no seqlock, generation counter, or mutex), so WC3 can rewrite it
//! while we read. Parsing directly from the live mapping smears the read over
//! the whole sampling pass and makes torn frames likely. Instead we bulk-copy
//! the regions we use into a local buffer and validate with a double read:
//! copy twice, compare bytes, retry on mismatch. Parsing then runs against the
//! immutable local copy.

use std::time::Duration;

use warcraft3_stats_observer::{ObserverData, ObserverGame, PlayerInfo};

const GAME_SIZE: usize = size_of::<ObserverGame>();
const PLAYER_SIZE: usize = size_of::<PlayerInfo>();

/// Total reads (initial + retries) before giving up on a stable pair.
const MAX_CAPTURE_READS: usize = 4;
/// Pause between mismatched reads, giving WC3's write pass time to finish.
const CAPTURE_RETRY_DELAY: Duration = Duration::from_millis(25);

/// Fills `primary` via `fill` until two consecutive reads produce identical
/// bytes, using `scratch` for the comparison read. Performs at most
/// `max_reads` fills, sleeping `retry_delay` between mismatched attempts.
///
/// Returns `true` once a stable pair was observed. Returns `false` if the
/// source never held still; `primary` then contains the newest (possibly
/// torn) read so the caller can degrade gracefully.
pub fn read_until_stable(
    primary: &mut [u8],
    scratch: &mut [u8],
    mut fill: impl FnMut(&mut [u8]),
    max_reads: usize,
    retry_delay: Duration,
) -> bool {
    fill(primary);
    for read in 1..max_reads {
        fill(scratch);
        if primary == scratch {
            return true;
        }
        primary.copy_from_slice(scratch);
        if read + 1 < max_reads && !retry_delay.is_zero() {
            std::thread::sleep(retry_delay);
        }
    }
    false
}

/// Owns the local copy of the observer regions read each tick: the game
/// header plus one `PlayerInfo` block per tracked slot.
pub struct ObserverSnapshot {
    data: Vec<u8>,
    scratch: Vec<u8>,
    player_count: usize,
}

impl ObserverSnapshot {
    pub fn new(player_count: usize) -> Self {
        let len = GAME_SIZE + player_count * PLAYER_SIZE;
        ObserverSnapshot {
            data: vec![0; len],
            scratch: vec![0; len],
            player_count,
        }
    }

    /// Copies the game header and the `player_slots` blocks out of the live
    /// mapping, double-read validated. Returns `false` when no two
    /// consecutive reads matched (the snapshot then holds the newest read).
    ///
    /// Takes a raw pointer on purpose: a `&ObserverData` would let LLVM
    /// assume the pointee is immutable for the duration of the call and fold
    /// the two reads into one, defeating the comparison. WC3 mutates this
    /// memory from another process.
    pub fn capture(&mut self, od: *const ObserverData, player_slots: &[usize]) -> bool {
        assert_eq!(player_slots.len(), self.player_count);
        read_until_stable(
            &mut self.data,
            &mut self.scratch,
            |buf| fill_from(od, player_slots, buf),
            MAX_CAPTURE_READS,
            CAPTURE_RETRY_DELAY,
        )
    }

    pub fn game(&self) -> &ObserverGame {
        // SAFETY: the buffer is at least GAME_SIZE bytes and ObserverGame is
        // #[repr(C, packed)] (align 1), so any byte offset is sufficiently
        // aligned. Same caveat as the live mapping: enum-typed fields may
        // hold invalid discriminants and must be read as raw bytes.
        unsafe { &*(self.data.as_ptr() as *const ObserverGame) }
    }

    /// Returns the snapshot of `player_slots[i]` as passed to [`Self::capture`].
    pub fn player(&self, i: usize) -> &PlayerInfo {
        assert!(i < self.player_count);
        // SAFETY: the buffer holds player_count PLAYER_SIZE blocks after the
        // game header and PlayerInfo is #[repr(C, packed)] (align 1). Same
        // enum-discriminant caveat as `game()`.
        unsafe { &*(self.data.as_ptr().add(GAME_SIZE + i * PLAYER_SIZE) as *const PlayerInfo) }
    }
}

/// Copies the game header and the given player blocks from the live mapping
/// into `buf`, laid out as [ObserverGame][PlayerInfo; n].
fn fill_from(od: *const ObserverData, player_slots: &[usize], buf: &mut [u8]) {
    debug_assert_eq!(buf.len(), GAME_SIZE + player_slots.len() * PLAYER_SIZE);
    // Hide the source pointer from the optimizer so consecutive fills cannot
    // be collapsed into one read of "immutable" memory.
    let od = std::hint::black_box(od);
    // SAFETY: od points at the live mapping, valid for the lifetime of the
    // ObserverHandle held by the caller. addr_of! computes field addresses
    // without creating references to packed fields. Source and buf never
    // overlap (buf is a process-local heap allocation).
    unsafe {
        let game_src = std::ptr::addr_of!((*od).game) as *const u8;
        std::ptr::copy_nonoverlapping(game_src, buf.as_mut_ptr(), GAME_SIZE);
        for (i, &slot) in player_slots.iter().enumerate() {
            let src = std::ptr::addr_of!((*od).players[slot]) as *const u8;
            let dst = buf.as_mut_ptr().add(GAME_SIZE + i * PLAYER_SIZE);
            std::ptr::copy_nonoverlapping(src, dst, PLAYER_SIZE);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// A source that holds still is accepted after exactly two reads.
    #[test]
    fn stable_source_is_accepted_after_two_reads() {
        let mut primary = [0u8; 4];
        let mut scratch = [0u8; 4];
        let mut fills = 0;
        let stable = read_until_stable(
            &mut primary,
            &mut scratch,
            |buf| {
                fills += 1;
                buf.copy_from_slice(&[7, 7, 7, 7]);
            },
            4,
            Duration::ZERO,
        );
        assert!(stable);
        assert_eq!(fills, 2);
        assert_eq!(primary, [7, 7, 7, 7]);
    }

    /// A write between the first two reads is detected and retried; the
    /// stable pair that follows is accepted and the newest data kept.
    #[test]
    fn mid_write_is_retried_until_stable() {
        let mut primary = [0u8; 4];
        let mut scratch = [0u8; 4];
        let mut fills = 0;
        let stable = read_until_stable(
            &mut primary,
            &mut scratch,
            |buf| {
                fills += 1;
                // Read 1 sees the old frame, reads 2+ see the new frame.
                let frame = if fills == 1 { 1 } else { 2 };
                buf.copy_from_slice(&[frame; 4]);
            },
            4,
            Duration::ZERO,
        );
        assert!(stable);
        assert_eq!(fills, 3);
        assert_eq!(primary, [2, 2, 2, 2]);
    }

    /// A source that never holds still gives up after max_reads fills and
    /// reports instability, leaving the newest read in the buffer.
    #[test]
    fn never_stable_source_gives_up_with_newest_read() {
        let mut primary = [0u8; 4];
        let mut scratch = [0u8; 4];
        let mut fills: u8 = 0;
        let stable = read_until_stable(
            &mut primary,
            &mut scratch,
            |buf| {
                fills += 1;
                buf.copy_from_slice(&[fills; 4]);
            },
            4,
            Duration::ZERO,
        );
        assert!(!stable);
        assert_eq!(fills, 4);
        assert_eq!(primary, [4, 4, 4, 4]);
    }
}
