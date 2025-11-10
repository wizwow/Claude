# Reactive SSH Client 🚀

Un client SSH ultra personalizzabile e reattivo con interfaccia moderna.

## ✨ Caratteristiche

### Core Features
- **Terminal Interattivo**: Basato su xterm.js con supporto completo ANSI
- **Temi Personalizzabili**: 4 temi predefiniti (Default Dark, Monokai, Dracula, Solarized Dark)
- **Editor Overlay**: Editor Monaco integrato con overlay sul terminale
- **Sidebar Informativa**: Monitoraggio real-time di CPU, RAM, e path corrente
- **Popup Reattivi**: Sistema di notifiche in tempo reale
- **Autocompletamento**: Suggerimenti comandi basati sulla cronologia
- **Shortcuts**: Sistema di scorciatoie tastiera completamente personalizzabile

### Personalizzazione
- **Font**: Dimensione e famiglia personalizzabile
- **Colori**: Palette colori completa per ogni elemento del terminale
- **Comportamenti Frecce**: Configurabile se freccia su/giù naviga cronologia o scrolla
- **Profili**: Salva configurazioni diverse per server diversi
- **Posizione Sidebar**: Sinistra o destra

## 🛠️ Stack Tecnologico

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool ultra veloce
- **xterm.js** - Emulatore terminale
- **Monaco Editor** - Editor di codice (stesso di VS Code)
- **RxJS** - Programmazione reattiva
- **ssh2** - Libreria SSH (pronto per integrazione Electron)

## 🚀 Quick Start

### Installazione

```bash
cd ssh-client
npm install
```

### Sviluppo

```bash
npm run dev
```

Apri http://localhost:3000/

### Build

```bash
npm run build
```

## ⌨️ Shortcuts di Default

| Shortcut | Azione |
|----------|--------|
| `Ctrl+Shift+E` | Apri editor overlay |
| `Ctrl+Shift+T` | Nuova tab (coming soon) |
| `Ctrl+Shift+W` | Chiudi tab (coming soon) |
| `Ctrl+Shift+P` | Command palette (coming soon) |
| `Ctrl+Shift+B` | Toggle sidebar (coming soon) |
| `Ctrl+Shift+N` | Notifica test |
| `Ctrl+,` | Impostazioni (coming soon) |
| `Arrow Up/Down` | Naviga cronologia comandi |
| `Tab` | Autocompletamento |

## 📁 Struttura Progetto

```
ssh-client/
├── src/
│   ├── components/
│   │   ├── Terminal/      # Componente terminale xterm.js
│   │   ├── Sidebar/       # Info sistema real-time
│   │   ├── Editor/        # Overlay editor Monaco
│   │   └── Popup/         # Sistema notifiche
│   ├── services/
│   │   ├── ssh/           # SSH connection manager
│   │   ├── autocomplete/  # Command history & suggestions
│   │   ├── monitoring/    # System info monitoring
│   │   ├── editor/        # Editor overlay manager
│   │   ├── popup/         # Popup service
│   │   ├── profiles/      # Profile manager
│   │   └── shortcuts/     # Keyboard shortcuts
│   ├── stores/            # State management (RxJS)
│   ├── themes/            # Temi colori predefiniti
│   ├── profiles/          # Profili SSH
│   └── types/             # TypeScript types
├── public/
└── index.html
```

## 🎨 Temi Disponibili

1. **Default Dark** - Tema scuro moderno
2. **Monokai** - Classico tema Monokai
3. **Dracula** - Popolare tema Dracula
4. **Solarized Dark** - Solarized scuro

## 🔧 Configurazione Profili

I profili SSH vengono salvati in localStorage e mantengono:
- Credenziali connessione (host, port, username)
- Tema personalizzato
- Impostazioni UI (font, colori, sidebar)
- Shortcuts personalizzati

## 📝 TODO / Roadmap

- [ ] Integrazione Electron per app desktop nativa
- [ ] Connessione SSH reale (attualmente mock)
- [ ] SFTP integrato
- [ ] Port forwarding (local/remote)
- [ ] Multi-tab support
- [ ] Command palette
- [ ] Ricerca nel terminale
- [ ] Split panes
- [ ] Sessioni salvate
- [ ] Registrazione sessioni
- [ ] Plugin system

## 🐛 Note di Sviluppo

Attualmente l'applicazione è una web app React che **simula** le connessioni SSH.
Per un'implementazione completa, è necessario:

1. **Integrare Electron** (problema attuale: 403 Forbidden nel download)
2. **Usare ssh2 nel processo main** di Electron
3. **IPC per comunicazione** renderer ↔ main
4. **System info reali** tramite systeminformation nel processo main

Alternativa: **Tauri** invece di Electron (più leggero, Rust-based)

## 📄 Licenza

MIT

## 🤝 Contributing

Contribuzioni benvenute! Apri una issue o PR.

---

Made with ❤️ and TypeScript
