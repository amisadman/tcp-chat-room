import net from "net";
import { ClientNode } from "../types";

export const handleClientConnection = (
  socket: net.Socket,
  clients: Set<ClientNode>,
  broadcastFn: (clients: Set<ClientNode>, msg: string, sender: net.Socket | null) => void
) => {
  let clientNode: ClientNode | null = null;
  let isNicknameSet = false;

  console.log(`Client connected: ${socket.remoteAddress}:${socket.remotePort}`);

  // Send a welcome message and prompt for nickname
  socket.write("Welcome to the TCP Chat Room!\n");
  socket.write("Please enter your nickname: ");

  socket.on("data", (data: Buffer) => {
    const message = data.toString().trim();
    if (!message) return;

    if (!isNicknameSet) {
      clientNode = { socket, nickname: message };
      clients.add(clientNode);
      isNicknameSet = true;

      console.log(`Client ${socket.remoteAddress}:${socket.remotePort} registered as ${message}`);

      const welcomeNotice = `*** ${message} has joined the chat! ***\n`;
      broadcastFn(clients, welcomeNotice, socket);
      socket.write(`*** Welcome ${message}! You can start typing now. ***\n> `);
      return;
    }

    if (clientNode) {
      const chatMessage = `[${clientNode.nickname}]: ${message}\n`;
      console.log(`[${clientNode.nickname}]: ${message}`);
      broadcastFn(clients, chatMessage, socket);
      socket.write(`> `);
    }
  });

  socket.on("close", () => {
    if (clientNode) {
      clients.delete(clientNode);
      const leaveNotice = `*** ${clientNode.nickname} has left the chat. ***\n`;
      console.log(`Client disconnected: ${clientNode.nickname}`);
      broadcastFn(clients, leaveNotice, null);
    } else {
      console.log(`Client disconnected: ${socket.remoteAddress}:${socket.remotePort}`);
    }
  });

  socket.on("error", (err: Error) => {
    console.error(`Socket error from ${clientNode?.nickname || "unknown"}: ${err.message}`);
  });
};
