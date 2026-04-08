import { startChatClient } from "./ChatClient";
import { DEFAULT_CLIENT_HOST, PORT as DEFAULT_PORT } from "../config";

const args = process.argv.slice(2);
const host = args[0] || DEFAULT_CLIENT_HOST;
const port = args[1] ? parseInt(args[1]) : DEFAULT_PORT;

startChatClient(host, port);
