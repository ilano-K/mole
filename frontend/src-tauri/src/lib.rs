use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;
use tauri::Manager;
use std::sync::{Arc, Mutex};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init()) // MAKE SURE THIS IS HERE!
        .invoke_handler(tauri::generate_handler![greet]) // Kept your greet command!
        .setup(|app| {
            // 1. Get the path to the bundled Python backend
            let resource_path = app.path().resource_dir().unwrap();
            
            // Depending on how Tauri bundles it, it might be inside a "resources" subfolder
            let backend_path = resource_path.join("resources").join("mole-backend").join("mole-backend.exe");

            // 2. Launch the backend in the background
            let (mut rx, child) = app.shell()
                .command(backend_path.to_str().unwrap())
                .spawn()
                .expect("Failed to spawn backend");

            // Wrap child in a thread-safe container so it can be safely consumed later
            let shared_child = Arc::new(Mutex::new(Some(child)));
            let shared_child_clone = shared_child.clone();

            // 3. Log backend output to the terminal for debugging
            tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
                    if let CommandEvent::Stdout(line) = event {
                        println!("Backend: {}", String::from_utf8_lossy(&line));
                    }
                }
            });

            // 4. Ensure the backend dies when the user closes the app
            let window = app.get_webview_window("main").unwrap();
            window.on_window_event(move |event| {
                if let tauri::WindowEvent::Destroyed = event {
                    // Safely take the child out of the Mutex and kill it exactly once
                    if let Some(child_process) = shared_child_clone.lock().unwrap().take() {
                        let _ = child_process.kill();
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}