import { createChatServer } from "./ChatServer";
import { HOST, PORT } from "../config";

const server = createChatServer(HOST, PORT);
server.start();
