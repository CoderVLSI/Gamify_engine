import WebSocket from "ws";

export type EditorCommand = {
  type: string;
  payload: Record<string, unknown>;
};

export class EditorClient {
  constructor(private readonly url = "ws://127.0.0.1:47621") {}

  send(command: EditorCommand): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(this.url);
      socket.once("open", () => socket.send(JSON.stringify(command)));
      socket.once("message", (message) => {
        socket.close();
        resolve(JSON.parse(String(message)));
      });
      socket.once("error", reject);
    });
  }
}
