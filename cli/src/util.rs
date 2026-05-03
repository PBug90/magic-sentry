use std::mem::MaybeUninit;
use std::ptr;

/// Reads a value from a potentially unaligned pointer using byte-by-byte volatile reads.
///
/// This is the correct primitive for fields of `#[repr(C, packed)]` structs that live in
/// shared memory written by an external process (WC3):
/// - **Volatile per byte**: the compiler must re-fetch each byte from memory on every call
///   and cannot cache or hoist the read across loop iterations in release builds.
/// - **Alignment-safe**: reads u8 at a time, so no alignment requirement on `src`.
///
/// # Safety
/// `src` must point to `size_of::<T>()` readable bytes of shared memory for the
/// lifetime of the call.
pub unsafe fn vread_unaligned<T>(src: *const T) -> T {
    let mut buf = MaybeUninit::<T>::uninit();
    let dst = buf.as_mut_ptr() as *mut u8;
    let src = src as *const u8;
    for i in 0..std::mem::size_of::<T>() {
        dst.add(i).write(ptr::read_volatile(src.add(i)));
    }
    buf.assume_init()
}

pub fn race_str(r: u8) -> &'static str {
    match r {
        1 => "Human",
        2 => "Orc",
        3 => "Undead",
        4 => "NightElf",
        5 => "Demon",
        _ => "Unknown",
    }
}

pub fn result_str(r: u8) -> &'static str {
    match r {
        0 => "Victory",
        1 => "Defeat",
        2 => "Tie",
        _ => "Neutral",
    }
}

pub fn fmt_time(ms: u64) -> String {
    let s = ms / 1000;
    let m = s / 60;
    let h = m / 60;
    if h > 0 {
        format!("{h}:{:02}:{:02}", m % 60, s % 60)
    } else {
        format!("{m}:{:02}", s % 60)
    }
}

/// Extracts a human-readable map name from a WC3 map path by returning the
/// longest alphanumeric token (containing at least one letter) in the filename.
///
/// `"Maps\\(4)LostTemple.w3m"`        → `"LostTemple"`
/// `"Maps\\(2)ConcealedHill1.09.w3x"` → `"ConcealedHill1"`
pub fn short_map_name(raw: &str) -> String {
    // Take just the filename (after last path separator).
    let filename = raw
        .rfind(|c| c == '/' || c == '\\')
        .map_or(raw, |i| &raw[i + 1..]);

    // Strip known WC3 file extensions.
    let base = ["w3x", "w3m", "w3n"]
        .iter()
        .find_map(|ext| filename.strip_suffix(&format!(".{ext}")))
        .unwrap_or(filename);

    // Split on non-alphanumeric characters, pick the longest token that
    // contains at least one letter, then strip any remaining digits.
    let name = base
        .split(|c: char| !c.is_alphanumeric())
        .filter(|s| !s.is_empty() && s.chars().any(|c| c.is_alphabetic()))
        .max_by_key(|s| s.len())
        .unwrap_or(base);

    name.chars().filter(|c| !c.is_numeric()).collect()
}
