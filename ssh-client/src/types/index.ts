// Theme types
export interface Theme {
  name: string;
  colors: {
    background: string;
    foreground: string;
    cursor: string;
    selection: string;
    black: string;
    red: string;
    green: string;
    yellow: string;
    blue: string;
    magenta: string;
    cyan: string;
    white: string;
    brightBlack: string;
    brightRed: string;
    brightGreen: string;
    brightYellow: string;
    brightBlue: string;
    brightMagenta: string;
    brightCyan: string;
    brightWhite: string;
  };
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  cursorBlink: boolean;
}

// SSH Profile types
export interface SSHProfile {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  authMethod: 'password' | 'key' | 'agent';
  privateKeyPath?: string;
  password?: string;
  theme?: string;
  customSettings?: Partial<ProfileSettings>;
}

export interface ProfileSettings {
  theme: string;
  fontSize: number;
  fontFamily: string;
  arrowUpBehavior: 'history' | 'scroll' | 'custom';
  arrowDownBehavior: 'history' | 'scroll' | 'custom';
  enableAutocomplete: boolean;
  showSidebar: boolean;
  sidebarPosition: 'left' | 'right';
  shortcuts: Record<string, string>;
}

// System info types
export interface SystemInfo {
  cpu: {
    usage: number;
    temperature?: number;
  };
  memory: {
    used: number;
    total: number;
    percent: number;
  };
  currentPath: string;
  uptime: number;
}

// Autocomplete types
export interface CommandHistory {
  command: string;
  timestamp: number;
  cwd: string;
}

// Popup types
export interface PopupConfig {
  id: string;
  type: 'info' | 'warning' | 'error' | 'custom';
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

// Editor overlay types
export interface EditorOverlay {
  id: string;
  filePath: string;
  content: string;
  language: string;
  isVisible: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

// SSH Connection state
export interface SSHConnection {
  id: string;
  profile: SSHProfile;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  error?: string;
  stream?: any;
}
