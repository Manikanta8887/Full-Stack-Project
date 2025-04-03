import { io } from "socket.io-client";
import baseurl from "./base";

const socket = io(baseurl, { transports: ["websocket"] });

socket.on("connect", () => {
  console.log("Connected to WebSocket server:", socket.id);
});

export default socket;


