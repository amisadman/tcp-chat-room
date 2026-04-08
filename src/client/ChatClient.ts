import net from "net";
import readline from "readline";

export const startChatClient = (host: string, port: number) => {
  const client = new net.Socket();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  client.connect(port, host, () => {
    console.log(`Connected to chat server at ${host}:${port}`);
  });

  client.on("data", (data: Buffer) => {
    const msg = data.toString();
    // Clear current line if we receive a prompt/message from other
    process.stdout.write(msg);
  });

  client.on("close", () => {
    console.log("Server connection closed");
    process.exit(0);
  });

  client.on("error", (err: Error) => {
    console.error(`Connection error: ${err.message}`);
    process.exit(1);
  });

  rl.on("line", (input: string) => {
    if (input.trim() !== "") {
      client.write(`${input}\n`);
    } else {
      // If empty input, just restore prompt if needed
      process.stdout.write("> ");
    }
  });

  return client;
};
