use std::env;

pub fn os_name() -> String {
    if cfg!(target_os = "windows") { "Windows".into() }
    else if cfg!(target_os = "macos") { "macOS".into() }
    else if cfg!(target_os = "linux") { "Linux".into() }
    else { "Unknown".into() }
}

pub fn arch_name() -> String {
    match env::consts::ARCH {
        "x86_64" => "x86_64".into(),
        "aarch64" => "ARM64".into(),
        "x86" => "x86".into(),
        other => other.into(),
    }
}

pub fn default_install_dir() -> String {
    if cfg!(target_os = "windows") {
        let home = env::var("USERPROFILE").unwrap_or_else(|_| "C:\\".into());
        format!("{}\\Desktop\\adv9", home)
    } else {
        let home = env::var("HOME").unwrap_or_else(|_| "/tmp".into());
        format!("{}/adv9", home)
    }
}
