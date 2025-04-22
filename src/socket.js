import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const socket = io(SOCKET_URL, { transports: ["websocket"] });

socket.on("connect", () => console.log(" Socket connected:", socket.id));
socket.on("connect_error", (err) => console.error(" Socket error:", err));

export default socket;
