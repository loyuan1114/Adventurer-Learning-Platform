use std::path::Path;
use std::process::Command;
use std::sync::{Arc, Mutex};

const REPO_URL: &str = "https://github.com/loyuan1114/Adventurer-Learning-Platform/archive/refs/heads/main.zip";

pub fn download_project(dir: &str, log: &Arc<Mutex<Vec<String>>>, progress: &Arc<Mutex<f32>>) -> Result<(), String> {
    macro_rules! lg { ($msg:expr) => {{ log.lock().unwrap().push($msg.to_string()); }}; }
    macro_rules! pg { ($v:expr) => {{ *progress.lock().unwrap() = $v; }}; }

    if Path::new(dir).join("server.js").exists() {
        lg!("Project already exists, skipping download");
        return Ok(());
    }

    let tmp = std::env::temp_dir().join("adv9_main.zip");
    lg!("Downloading from GitHub...");
    pg!(0.35);

    let body = reqwest::blocking::get(REPO_URL).map_err(|e| e.to_string())?
        .bytes().map_err(|e| e.to_string())?;
    std::fs::write(&tmp, &body).map_err(|e| e.to_string())?;
    pg!(0.5);

    lg!("Extracting...");
    let zip_file = std::fs::File::open(&tmp).map_err(|e| e.to_string())?;
    let mut archive = zip::ZipArchive::new(zip_file).map_err(|e| e.to_string())?;

    let parent = Path::new(dir).parent().unwrap_or(Path::new(".")).to_path_buf();
    archive.extract(&parent).map_err(|e| e.to_string())?;

    let extracted = parent.join("Adventurer-Learning-Platform-main");
    if extracted.exists() && !Path::new(dir).exists() {
        std::fs::rename(&extracted, dir).map_err(|e| e.to_string())?;
    }
    pg!(0.65);
    lg!("Extraction complete");
    Ok(())
}

pub fn build_and_start(dir: &str, log: &Arc<Mutex<Vec<String>>>, progress: &Arc<Mutex<f32>>) -> Result<(), String> {
    macro_rules! lg { ($msg:expr) => {{ log.lock().unwrap().push($msg.to_string()); }}; }
    macro_rules! pg { ($v:expr) => {{ *progress.lock().unwrap() = $v; }}; }

    std::env::set_current_dir(dir).map_err(|e| e.to_string())?;

    lg!("Building Docker image (first time takes ~5 min)...");
    pg!(0.75);
    let r = Command::new("docker").args(["build","-t","adv9","."]).output()
        .map_err(|e| format!("docker build failed: {}", e))?;
    if !r.status.success() {
        return Err(String::from_utf8_lossy(&r.stderr).to_string());
    }
    lg!("Build complete");

    lg!("Starting service...");
    pg!(0.9);
    let _ = Command::new("docker").args(["compose","down"]).output();
    let r = Command::new("docker").args(["compose","up","-d"]).output()
        .map_err(|e| format!("docker compose failed: {}", e))?;
    if !r.status.success() {
        return Err(String::from_utf8_lossy(&r.stderr).to_string());
    }

    std::thread::sleep(std::time::Duration::from_secs(3));
    let _ = open::that("http://127.0.0.1:8080");
    lg!("Service started at http://127.0.0.1:8080");
    lg!("Admin: adv9boss / admin123");
    pg!(1.0);
    Ok(())
}
