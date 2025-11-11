mod system;
mod ssh;

use std::sync::{Arc, Mutex};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let ssh_state = Arc::new(Mutex::new(ssh::SSHState { session: None }));

  tauri::Builder::default()
    .manage(ssh_state)
    .plugin(tauri_plugin_shell::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      system::get_system_info,
      system::get_current_path,
      ssh::ssh_connect,
      ssh::ssh_execute,
      ssh::ssh_disconnect,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
