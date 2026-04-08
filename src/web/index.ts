import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import net from "net";
import path from "path";
import http from "http";
import { HOST as TCP_HOST, PORT as TCP_PORT } from "../config";

const WEB_PORT = 8080;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Handle WebSockets
wss.on("connection", (ws: WebSocket) => {
  console.log("New Browser GUI Client Connected");

  // Create a TCP Socket to match this WebSocket
  const tcpClient = new net.Socket();
  
  tcpClient.connect(TCP_PORT, TCP_HOST, () => {
    console.log("Bridge connected to TCP Server");
  });

  // When TCP sends data, forward it to the WebSocket
  tcpClient.on("data", (data) => {
    const message = data.toString();
    ws.send(message);
  });

  tcpClient.on("close", () => {
    ws.close();
  });

  tcpClient.on("error", (err) => {
    console.error(`Bridge TCP Error: ${err.message}`);
    ws.close();
  });

  // When WebSocket sends data, forward it to TCP
  ws.on("message", (message) => {
    // ws.on("message") raw data is a buffer, convert to string
    tcpClient.write(`${message.toString()}\n`);
  });

  ws.on("close", () => {
    console.log("Browser GUI Client Disconnected");
    tcpClient.destroy();
  });
});

server.listen(WEB_PORT, () => {
  console.log(`Web GUI Server is running at http://localhost:${WEB_PORT}`);
});
