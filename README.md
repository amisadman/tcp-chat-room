# TCP LAN Chat App

A robust, modular TCP-based chat application built with Node.js and TypeScript. This repository contains both the core TCP server and client implementations, alongside a full Web Bridge that powers a browser-based GUI.

## Project Architecture

The project has been refactored into a clear, modular architecture, utilizing modern Functional Programming principles and explicitly passing state across modules.

```text
src/
├── config/
│   └── index.ts          # Centralized configuration (ports, hostnames, etc.)
├── types/
│   └── index.ts          # Shared TypeScript interfaces & types (e.g., ClientNode)
├── server/
│   ├── index.ts          # Server entry point
│   ├── ChatServer.ts     # Core server instance builder (connections, broadcasting)
│   └── ClientHandler.ts  # Handles logic specific to an individual client socket
├── client/
│   ├── index.ts          # Client entry point
│   └── ChatClient.ts     # Implements readline interface and TCP socket connection
└── web/
    ├── index.ts          # Express & WebSocket Bridge proxy server
    └── public/           # Frontend Web UI (HTML, CSS, JS)
```

## How It Works

1. **TCP Initialization:** The core server binds to a specified IP address and continuously listens for incoming raw TCP socket connections.
2. **WebSocket Bridge:** A separate bridge server (`src/web`) hosts the frontend files and simultaneously maintains a WebSocket endpoint. Whenever a browser connects to it via WebSockets, the bridge spins up a fresh `net.Socket` to bridge connection data instantly.
3. **Broadcasting Mechanism:** Every registered message triggers a `broadcast()` action on `ChatServer`, which loops over the generic connection array and dispatches the payload to every other socket attached.

## How to Run the Project

Ensure you have Node.js and npm installed.

```bash
# 1. Install dependencies
npm install

# 2. Boot up both the TCP Core Server AND the Web GUI Server simultaneously
npm start

# 3. View the Chat Web Page
# Open your browser and navigate to http://localhost:8080
```


> **Note:** The server binds to `0.0.0.0` by default making it accessible across your LAN. You can provide the host computer's local IP address as an argument to `npm run client <IP>` if testing terminal chatter from different computers.
