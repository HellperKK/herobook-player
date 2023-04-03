use base64::{engine::general_purpose, Engine as _};
use std::fs;

#[tauri::command]
fn load() -> String {
    if let Ok(content) = fs::read_to_string("data.json") {
        content
    } else {
        "".to_string()
    }
}

#[tauri::command]
fn load_image(file_name: String) -> String {
    let true_file_name = format!("./assets/images/{}", file_name);
    if let Ok(content) = fs::read(&true_file_name) {
        let base64_content = general_purpose::STANDARD.encode(content);
        let formated = format!("data:image/png;base64,{}", base64_content);
        formated
    } else {
        println!("could not open {}", true_file_name);
        "".to_string()
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![load, load_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
