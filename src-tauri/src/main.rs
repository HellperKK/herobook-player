use base64::{engine::general_purpose, Engine as _};
use std::fs;

#[tauri::command]
fn get_saves() -> Vec<String> {
    match fs::read_dir("./saves") {
        Err(_) => Vec::<String>::new(),

        Ok(entries) => entries
            .filter_map(|e| e.ok())
            .map(|e| e.path().to_string_lossy().into_owned())
            .collect::<Vec<_>>(),
    }
}

#[tauri::command]
fn load_save(id: i32) -> String {
    let file_name = format!("./saves/save{}.json", id);
    if let Ok(content) = fs::read_to_string(file_name) {
        content
    } else {
        "".to_string()
    }
}

#[tauri::command]
fn save(save_id: i32, save_content: &str) -> String {
    let file_name = format!("./saves/save{}.json", save_id);
    let res = fs::write(file_name, save_content);
    if let Err(_) = res {
        return "error".to_string();
    }
    return "done".to_string();
}

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
        .invoke_handler(tauri::generate_handler![
            load, load_image, get_saves, save, load_save
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
