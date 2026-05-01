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

/// Returns the last alphanumeric word from a WC3 map path, stripping the
/// directory prefix, numeric prefix (e.g. `(4)`), and file extension.
/// `"Maps\\(4)LostTemple.w3m"` → `"LostTemple"`
pub fn short_map_name(raw: &str) -> String {
    let base = raw.rfind('.').map_or(raw, |i| &raw[..i]);
    let end = match base.rfind(|c: char| c.is_alphanumeric()) {
        Some(i) => i + 1,
        None => return raw.to_string(),
    };
    let start = base[..end]
        .rfind(|c: char| !c.is_alphanumeric())
        .map_or(0, |i| i + 1);
    base[start..end].to_string()
}
