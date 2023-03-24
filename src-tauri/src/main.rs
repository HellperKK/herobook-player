use std::fs;

#[tauri::command]
fn load() -> String {
    fs::read_to_string("data.json").expect("data.json not found")
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![load])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
