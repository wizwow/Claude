use serde::{Deserialize, Serialize};
use ssh2::Session;
use std::io::Read;
use std::net::TcpStream;
use std::path::Path;
use std::sync::{Arc, Mutex};
use tauri::State;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SSHConfig {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: Option<String>,
    pub private_key_path: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SSHResponse {
    pub success: bool,
    pub message: String,
    pub data: Option<String>,
}

pub struct SSHState {
    pub session: Option<Arc<Mutex<Session>>>,
}

#[tauri::command]
pub async fn ssh_connect(
    config: SSHConfig,
    state: State<'_, Arc<Mutex<SSHState>>>,
) -> Result<SSHResponse, String> {
    let tcp = TcpStream::connect(format!("{}:{}", config.host, config.port))
        .map_err(|e| format!("Failed to connect: {}", e))?;

    let mut sess = Session::new().map_err(|e| format!("Failed to create session: {}", e))?;
    sess.set_tcp_stream(tcp);
    sess.handshake()
        .map_err(|e| format!("Failed to handshake: {}", e))?;

    // Authenticate
    if let Some(password) = config.password {
        sess.userauth_password(&config.username, &password)
            .map_err(|e| format!("Authentication failed: {}", e))?;
    } else if let Some(key_path) = config.private_key_path {
        sess.userauth_pubkey_file(&config.username, None, Path::new(&key_path), None)
            .map_err(|e| format!("Key authentication failed: {}", e))?;
    } else {
        return Err("No authentication method provided".to_string());
    }

    // Store session
    let mut ssh_state = state.lock().unwrap();
    ssh_state.session = Some(Arc::new(Mutex::new(sess)));

    Ok(SSHResponse {
        success: true,
        message: "Connected successfully".to_string(),
        data: None,
    })
}

#[tauri::command]
pub async fn ssh_execute(
    command: String,
    state: State<'_, Arc<Mutex<SSHState>>>,
) -> Result<SSHResponse, String> {
    let ssh_state = state.lock().unwrap();

    if let Some(session_arc) = &ssh_state.session {
        let session = session_arc.lock().unwrap();

        let mut channel = session
            .channel_session()
            .map_err(|e| format!("Failed to open channel: {}", e))?;

        channel
            .exec(&command)
            .map_err(|e| format!("Failed to execute command: {}", e))?;

        let mut output = String::new();
        channel
            .read_to_string(&mut output)
            .map_err(|e| format!("Failed to read output: {}", e))?;

        channel.wait_close().ok();

        Ok(SSHResponse {
            success: true,
            message: "Command executed".to_string(),
            data: Some(output),
        })
    } else {
        Err("Not connected".to_string())
    }
}

#[tauri::command]
pub async fn ssh_disconnect(state: State<'_, Arc<Mutex<SSHState>>>) -> Result<SSHResponse, String> {
    let mut ssh_state = state.lock().unwrap();
    ssh_state.session = None;

    Ok(SSHResponse {
        success: true,
        message: "Disconnected".to_string(),
        data: None,
    })
}
