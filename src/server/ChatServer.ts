import net from "net";
import { ClientNode } from "../types";
import { handleClientConnection } from "./ClientHandler";

export const broadcast = (
  clients: Set<ClientNode>,
  message: string,
  senderSocket: net.Socket | null
) => {
  for (const client of clients) {
    if (client.socket !== senderSocket) {
      client.socket.write(`\r${message}> `);
    }
  }
};

export const createChatServer = (host: string, port: number) => {
  const clients: Set<ClientNode> = new Set();

  const server = net.createServer((socket: net.Socket) => {
    handleClientConnection(socket, clients, broadcast);
  });

  const start = () => {
    server.listen(port, host, () => {
      console.log(`Chat server is running on ${host}:${port}`);
      console.log("Waiting for connections...");
    });
  };

  return { start };
};
