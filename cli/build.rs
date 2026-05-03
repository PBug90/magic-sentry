fn main() {
    // Resource embedding is only meaningful when targeting Windows.
    if std::env::var("CARGO_CFG_TARGET_OS").as_deref() != Ok("windows") {
        return;
    }

    // Re-run this script if the source image changes.
    println!("cargo:rerun-if-changed=../assets/magicsentry.png");

    let manifest_dir = std::env::var("CARGO_MANIFEST_DIR").unwrap();
    let out_dir = std::env::var("OUT_DIR").unwrap();

    let png_path = std::path::Path::new(&manifest_dir).join("../assets/magicsentry.png");
    let ico_path = std::path::Path::new(&out_dir).join("magicsentry.ico");

    build_ico(&png_path, &ico_path);

    let mut res = winresource::WindowsResource::new();
    res.set_icon(ico_path.to_str().unwrap());
    res.compile().unwrap();
}

/// Loads the PNG and produces a multi-size ICO (16, 32, 48, 256 px).
fn build_ico(png: &std::path::Path, ico: &std::path::Path) {
    let img = image::open(png).expect("failed to open magicsentry.png");

    let mut icon_dir = ico::IconDir::new(ico::ResourceType::Icon);
    for size in [16u32, 32, 48, 256] {
        let resized = img.resize(size, size, image::imageops::FilterType::Lanczos3);
        let rgba = resized.to_rgba8();
        let icon_image = ico::IconImage::from_rgba_data(size, size, rgba.into_raw());
        icon_dir.add_entry(ico::IconDirEntry::encode(&icon_image).unwrap());
    }

    let file = std::fs::File::create(ico).unwrap();
    icon_dir.write(file).unwrap();
}
