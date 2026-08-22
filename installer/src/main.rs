mod docker;
mod deploy;
mod platform;

use eframe::egui;
use std::sync::{Arc, Mutex};
use std::thread;

fn main() -> eframe::Result<()> {
    let opts = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_inner_size([520.0, 440.0])
            .with_resizable(false)
            .with_title("ADV9 Installer"),
        ..Default::default()
    };
    eframe::run_native("ADV9", opts, Box::new(|cc| {
        let mut s = (*cc.egui_ctx.style()).clone();
        s.spacing.item_spacing = egui::vec2(8.0, 10.0);
        cc.egui_ctx.set_style(s);
        Ok(Box::new(App::new()))
    }))
}

#[derive(Clone, PartialEq)]
enum Step { Welcome, Checking, InstallDocker, Download, Building, Done, Error(String) }

struct App {
    step: Step,
    log: Arc<Mutex<Vec<String>>>,
    progress: Arc<Mutex<f32>>,
    os_info: String,
    install_dir: String,
    rx: Option<std::sync::mpsc::Receiver<Step>>,
}

impl App {
    fn new() -> Self {
        Self {
            step: Step::Welcome,
            log: Arc::new(Mutex::new(Vec::new())),
            progress: Arc::new(Mutex::new(0.0)),
            os_info: format!("{} ({})", platform::os_name(), platform::arch_name()),
            install_dir: platform::default_install_dir(),
            rx: None,
        }
    }

    fn start(&mut self) {
        self.step = Step::Checking;
        self.log.lock().unwrap().clear();
        *self.progress.lock().unwrap() = 0.0;
        let (tx, rx) = std::sync::mpsc::channel();
        self.rx = Some(rx);
        let log = self.log.clone();
        let pg = self.progress.clone();
        let dir = self.install_dir.clone();

        thread::spawn(move || {
            macro_rules! lg { ($m:expr) => {{ log.lock().unwrap().push($m.to_string()); }}; }

            lg!("Checking Docker...");
            *pg.lock().unwrap() = 0.1;
            match docker::check_docker() {
                Ok(true) => lg!("Docker found"),
                Ok(false) => {
                    lg!("Docker not found, installing...");
                    tx.send(Step::InstallDocker).ok();
                    if let Err(e) = docker::install_docker(&log) {
                        tx.send(Step::Error(e)).ok(); return;
                    }
                }
                Err(e) => { tx.send(Step::Error(e)).ok(); return; }
            }

            *pg.lock().unwrap() = 0.3;
            tx.send(Step::Download).ok();
            lg!("Downloading project...");
            if let Err(e) = deploy::download_project(&dir, &log, &pg) {
                tx.send(Step::Error(e)).ok(); return;
            }

            *pg.lock().unwrap() = 0.7;
            tx.send(Step::Building).ok();
            lg!("Building Docker image...");
            if let Err(e) = deploy::build_and_start(&dir, &log, &pg) {
                tx.send(Step::Error(e)).ok(); return;
            }
            tx.send(Step::Done).ok();
        });
    }

    fn log_panel(&self, ui: &mut egui::Ui) {
        let log = self.log.lock().unwrap();
        egui::ScrollArea::vertical().max_height(180.0).show(ui, |ui| {
            for l in log.iter() {
                ui.label(egui::RichText::new(l).size(11.5).monospace());
            }
        });
    }

    fn bar(&self, ui: &mut egui::Ui) {
        ui.add(egui::ProgressBar::new(*self.progress.lock().unwrap()).animate(true));
    }
}

impl eframe::App for App {
    fn update(&mut self, ctx: &egui::Context, _: &mut eframe::Frame) {
        if let Some(rx) = &self.rx {
            while let Ok(s) = rx.try_recv() { self.step = s; }
        }
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.label(egui::RichText::new("\u{2694}\u{FE0F}").size(28.0));
                ui.label(egui::RichText::new("ADV9 \u{5192}\u{967A}\u{8005}\u{5B78}\u{7FD2}\u{5E73}\u{53F0}")
                    .size(20.0).strong().color(egui::Color32::from_rgb(242,193,78)));
            });
            ui.label(egui::RichText::new("\u{4E00}\u{9375}\u{5B89}\u{88DD}\u{5668} v1.0")
                .size(12.0).color(egui::Color32::from_rgb(140,140,140)));
            ui.separator();

            match &self.step {
                Step::Welcome => {
                    ui.add_space(16.0);
                    ui.label(egui::RichText::new("\u{7CFB}\u{7D71}: ").size(13.0).color(egui::Color32::from_rgb(160,160,160)));
                    ui.label(egui::RichText::new(&self.os_info).size(16.0).strong().color(egui::Color32::from_rgb(100,220,160)));
                    ui.label(egui::RichText::new("\u{76EE}\u{9304}: ").size(13.0).color(egui::Color32::from_rgb(160,160,160)));
                    ui.label(egui::RichText::new(&self.install_dir).size(13.0).color(egui::Color32::from_rgb(160,180,220)));
                    ui.add_space(12.0);
                    ui.label("  \u{1F539} \u{6AA2}\u{67E5}\u{4E26}\u{5B89}\u{88DD} Docker");
                    ui.label("  \u{1F539} \u{4E0B}\u{8F09} ADV9 \u{7A0B}\u{5F0F}\u{78BC}");
                    ui.label("  \u{1F539} \u{5EFA}\u{7F6E}\u{4E26}\u{555F}\u{52D5}\u{670D}\u{52D9}");
                    ui.label("  \u{1F539} \u{81EA}\u{52D5}\u{958B}\u{555F}\u{700F}\u{89BD}\u{5668}");
                    ui.add_space(20.0);
                    if ui.add_sized([200.0,44.0], egui::Button::new(
                        egui::RichText::new("\u{1F680} \u{958B}\u{59CB}\u{5B89}\u{88DD}").size(18.0).strong()
                    ).fill(egui::Color32::from_rgb(40,167,69))).clicked() {
                        self.start();
                    }
                }
                Step::Checking => {
                    ui.add_space(30.0); ui.spinner();
                    ui.label(egui::RichText::new("\u{1F50D} \u{6AA2}\u{67E5}\u{4E2D}...").size(16.0));
                    self.log_panel(ui);
                }
                Step::InstallDocker => {
                    ui.add_space(10.0);
                    ui.label(egui::RichText::new("\u{1F4E6} \u{5B89}\u{88DD} Docker...").size(16.0).color(egui::Color32::from_rgb(255,193,7)));
                    self.bar(ui); self.log_panel(ui);
                }
                Step::Download => {
                    ui.add_space(10.0);
                    ui.label(egui::RichText::new("\u{1F4E5} \u{4E0B}\u{8F09} \u{5C08}\u{6848}...").size(16.0).color(egui::Color32::from_rgb(0,150,255)));
                    self.bar(ui); self.log_panel(ui);
                }
                Step::Building => {
                    ui.add_space(10.0);
                    ui.label(egui::RichText::new("\u{1F528} \u{5EFA}\u{7F6E} Docker...").size(16.0).color(egui::Color32::from_rgb(255,152,0)));
                    self.bar(ui); self.log_panel(ui);
                }
                Step::Done => {
                    ui.add_space(20.0);
                    ui.label(egui::RichText::new("\u{2705} \u{5B89}\u{88DD}\u{5B8C}\u{6210}\u{FF01}").size(24.0).strong().color(egui::Color32::from_rgb(40,167,69)));
                    ui.add_space(10.0);
                    ui.label(egui::RichText::new("http://127.0.0.1:8080").size(16.0).color(egui::Color32::from_rgb(100,200,255)));
                    ui.label(egui::RichText::new("\u{5E33}\u{865F}: adv9boss / admin123").size(13.0));
                    self.log_panel(ui);
                    ui.add_space(10.0);
                    if ui.add_sized([160.0,36.0], egui::Button::new(
                        egui::RichText::new("\u{1F310} \u{958B}\u{555F}\u{700F}\u{89BD}\u{5668}").size(14.0)
                    ).fill(egui::Color32::from_rgb(0,123,255))).clicked() {
                        let _ = open::that("http://127.0.0.1:8080");
                    }
                }
                Step::Error(msg) => {
                    ui.add_space(20.0);
                    ui.label(egui::RichText::new("\u{274C} \u{5931}\u{6557}").size(20.0).strong().color(egui::Color32::from_rgb(220,53,69)));
                    ui.add_space(8.0);
                    ui.label(egui::RichText::new(msg).size(13.0).color(egui::Color32::from_rgb(200,150,150)));
                    self.log_panel(ui);
                    ui.add_space(12.0);
                    if ui.add_sized([120.0,32.0], egui::Button::new("\u{21BA} \u{91CD}\u{8A66}")).clicked() {
                        self.step = Step::Welcome;
                    }
                }
            }
        });
    }
}
