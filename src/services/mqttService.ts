import { io, Socket } from "socket.io-client";

export class SocketService {
  private socket: Socket | null = null;

  connect(onMessage: (data: any) => void, onConnect: () => void) {
    this.socket = io("http://localhost:5000"); // ganti sesuai URL server Node.js

    this.socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO server");
      onConnect();
    });

    this.socket.on("mqtt_message", (data) => {
      console.log("📨 Received MQTT data via Socket.IO:", data);
      onMessage(data);
    });

    this.socket.on("disconnect", () => {
      console.log("🔌 Disconnected from server");
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("👋 Disconnected from Socket.IO server");
    }
  }
}
