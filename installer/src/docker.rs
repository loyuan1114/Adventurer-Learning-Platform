use std::sync::{Arc, Mutex};
use std::process::Command;

pub fn check_docker() -> Result<bool, String> {
    let output = Command::new("docker").arg("--version").output()
        .map_err(|e| format!("Failed to run docker: {}", e))?;
    Ok(output.status.success())
}

pub fn install_docker(log: &Arc<Mutex<Vec<String>>>) -> Result<(), String> {
    macro_rules! lg { ($msg:expr) => {{ log.lock().unwrap().push($msg.to_string()); }}; }

    if cfg!(target_os = "windows") {
        lg!("Trying winget...");
        let r = Command::new("winget").args(["install","Docker.DockerDesktop",
            "--accept-package-agreements","--accept-source-agreements"]).output();
        if let Ok(o) = r { if o.status.success() { return Ok(()); } }

        lg!("winget not available, trying direct download...");
        let url = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe";
        let tmp = std::env::temp_dir().join("DockerDesktopInstaller.exe");
        download_file(url, &tmp, log)?;
        lg!("Running Docker installer...");
        let _ = Command::new(&tmp).args(["install","--quiet","--accept-license"]).spawn();
        lg!("Installer launched. Please restart PC after installation.");
        Ok(())
    } else if cfg!(target_os = "macos") {
        lg!("Please install Docker Desktop for Mac:");
        lg!("https://www.docker.com/products/docker-desktop/");
        let _ = open::that("https://www.docker.com/products/docker-desktop/");
        Err("Install Docker Desktop manually, then relaunch installer".into())
    } else {
        lg!("Installing Docker via official script...");
        let r = Command::new("sh").arg("-c")
            .arg("curl -fsSL https://get.docker.com | sh").output()
            .map_err(|e| format!("Failed: {}", e))?;
        if r.status.success() {
            lg!("Docker installed. Adding user to docker group...");
            let _ = Command::new("sudo").args(["usermod","-aG","docker"])
                .arg(std::env::var("USER").unwrap_or_default()).output();
            Ok(())
        } else {
            Err(String::from_utf8_lossy(&r.stderr).to_string())
        }
    }
}

pub fn download_file(url: &str, dest: &std::path::Path, log: &Arc<Mutex<Vec<String>>>) -> Result<(), String> {
    macro_rules! lg { ($msg:expr) => {{ log.lock().unwrap().push($msg.to_string()); }}; }
    lg!(&format!("Downloading {}...", url));
    let body = reqwest::blocking::get(url).map_err(|e| e.to_string())?
        .bytes().map_err(|e| e.to_string())?;
    std::fs::write(dest, &body).map_err(|e| e.to_string())?;
    Ok(())
}
