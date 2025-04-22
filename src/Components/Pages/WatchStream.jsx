// WatchStream.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Typography, message, Input, Button, List, Space, Tooltip } from "antd";
import { SendOutlined, CopyOutlined } from "@ant-design/icons";
import socket from "../../socket";
import "./WatchStream.css";

const { Title, Paragraph } = Typography;

const WatchStream = () => {
  const { id } = useParams();
  const videoRef = useRef(null);
  const chatEndRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const [streamInfo, setStreamInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [error, setError] = useState("");

  const ICE_SERVERS = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }, // Public STUN
      {
        urls: "turn:global.xirsys.net:3478?transport=udp",
        username: "Mani",
        credential: "71742688-1f41-11f0-8c62-0242ac130003",
      },
      {
        urls: "turn:global.xirsys.net:3478?transport=tcp",
        username: "Mani",
        credential: "71742688-1f41-11f0-8c62-0242ac130003",
      },
    ],
  };

  useEffect(() => {
    socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
    socket.on("connect_error", (err) => console.error("❌ Socket error:", err));

    return () => {
      socket.off("connect");
      socket.off("connect_error");
    };
  }, []);

  useEffect(() => {
    setupPeerConnection(); // Setup BEFORE listening to offer

    socket.on("offer", async ({ offer }) => {
      console.log("📡 Received offer:", offer);
      if (!peerConnectionRef.current) setupPeerConnection();

      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit("answer", { streamId: id, answer });
        console.log("✅ Sent answer");
      } catch (err) {
        console.error("❌ Error during WebRTC negotiation:", err);
      }
    });

    return () => socket.off("offer");
  }, [id]);

  useEffect(() => {
    socket.emit("join-stream", { streamId: id });
    socket.emit("get-stream-info", { streamId: id });

    socket.on("stream-info", (data) => {
      if (!data) {
        setError("Stream not found or has ended.");
        return;
      }
      setStreamInfo(data);
      message.success(`Joined: ${data.streamTitle}`);
      console.log("ℹ️ Stream info:", data);
    });

    socket.on("stop-stream", () => {
      setError("The stream has been stopped by the streamer.");
      cleanupStream();
    });

    socket.on("stream-ended", () => {
      setError("The stream has ended.");
      cleanupStream();
    });

    return () => {
      socket.emit("leave-stream", { streamId: id });

      socket.off("stream-info");
      socket.off("stop-stream");
      socket.off("stream-ended");
      socket.off("ice-candidate");
      socket.off("chat-message");

      cleanupStream();
    };
  }, [id]);

  const cleanupStream = () => {
    if (videoRef.current) videoRef.current.srcObject = null;
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  const setupPeerConnection = () => {
    if (peerConnectionRef.current) return;

    peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS);

    peerConnectionRef.current.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", { streamId: id, candidate: e.candidate });
        console.log("📨 Sent ICE candidate");
      }
    };

    peerConnectionRef.current.oniceconnectionstatechange = () => {
      console.log("🧊 ICE state:", peerConnectionRef.current.iceConnectionState);
    };

    peerConnectionRef.current.onconnectionstatechange = () => {
      console.log("🔗 Connection state:", peerConnectionRef.current.connectionState);
      if (peerConnectionRef.current.connectionState === "connected") {
        console.log("✅ WebRTC connection established!");
      }
    };

    peerConnectionRef.current.ontrack = (event) => {
      console.log("📺 Track received:", event.streams);
      if (event.streams && event.streams[0]) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("📥 Received ICE candidate");
      } catch (err) {
        console.error("❌ Failed to add ICE candidate:", err);
      }
    });
  };

  useEffect(() => {
    socket.on("chat-message", (msg) => setMessages((prev) => [...prev, msg]));
    return () => socket.off("chat-message");
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    socket.emit("chat-message", {
      streamId: id,
      userId: "Viewer",
      username: "Viewer",
      message: messageInput,
      time: new Date().toLocaleTimeString(),
    });

    setMessageInput("");
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/livestreamingplatform/watch/${id}`;
    navigator.clipboard.writeText(link).then(() => message.success("Copied link!"));
  };

  return (
    <Card style={{ margin: "20px" }}>
      {streamInfo && !error ? (
        <>
          <Title level={3}>{streamInfo.streamTitle}</Title>
          <div style={{ marginBottom: 10 }}>
            <Paragraph
              copyable={{ text: `${window.location.origin}/livestreamingplatform/watch/${id}` }}
              style={{ marginBottom: 4 }}
            >
              <strong>🔗 Share Stream:</strong> {`${window.location.origin}/livestreamingplatform/watch/${id}`}
            </Paragraph>
            <Tooltip title="Copy full stream link">
              <Button size="small" icon={<CopyOutlined />} onClick={handleCopyLink}>
                Copy Link
              </Button>
            </Tooltip>
          </div>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            controls
            style={{ width: "100%", backgroundColor: "#000" }}
          />
          <Card className="watch-chat-box" style={{ marginTop: 20 }}>
            <Title level={4} className="chat-title">Live Chat</Title>
            <List
              className="chat-messages"
              dataSource={messages}
              renderItem={(msg, index) => (
                <List.Item key={index}>
                  <strong>{msg.username}</strong>: {msg.message}
                  <em style={{ fontSize: "0.8em", color: "#999", marginLeft: "5px" }}>{msg.time}</em>
                </List.Item>
              )}
            />
            <div ref={chatEndRef}></div>
            <Space.Compact className="chat-input">
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onPressEnter={sendMessage}
                autoComplete="off"
              />
              <Button type="primary" icon={<SendOutlined />} onClick={sendMessage} />
            </Space.Compact>
          </Card>
        </>
      ) : (
        <>
          <Title level={4}>Loading stream...</Title>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </>
      )}
    </Card>
  );
};

export default WatchStream;
