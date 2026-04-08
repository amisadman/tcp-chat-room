import net from "net";

export interface ClientNode {
  socket: net.Socket;
  nickname: string;
}
