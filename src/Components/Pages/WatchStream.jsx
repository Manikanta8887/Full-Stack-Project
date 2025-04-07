// WatchStream.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Typography, message, Input, Button, List, Space, Tooltip } from "antd";
import socket from "../../socket";
import "./WatchStream.css";
import { SendOutlined, CopyOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const WatchStream = () => {
  const { id } = useParams();
  const videoRef = useRef(null);
  const chatEndRef = useRef(null);
  const [streamInfo, setStreamInfo] = useState(null);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const peerConnectionRef = useRef(null);
  const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  useEffect(() => {
    socket.emit("get-stream-info", { streamId: id });

    socket.on("stream-info", (data) => {
      if (data) {
        setStreamInfo(data);
        message.success(`Joined stream: ${data.streamTitle}`);
        setupPeerConnection();
      } else {
        setError("Stream not found or ended.");
      }
    });

    return () => {
      socket.off("stream-info");
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [id]);

  const setupPeerConnection = () => {
    peerConnectionRef.current = new RTCPeerConnection(servers);

    peerConnectionRef.current.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    socket.on("offer", async (offer) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(offer);
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit("answer", { streamId: id, answer });
      }
    });

    socket.on("ice-candidate", async (candidate) => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(candidate);
        } catch (err) {
          console.error("Error adding received ICE candidate", err);
        }
      }
    });

    socket.emit("join-stream", { streamId: id });
  };

  useEffect(() => {
    socket.on("chat-message", (msg) => setMessages((prev) => [...prev, msg]));
    return () => socket.off("chat-message");
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    if (messageInput.trim()) {
      const chatData = {
        streamId: id,
        userId: "Viewer", // Replace with actual user data if available
        username: "Viewer",
        message: messageInput,
        time: new Date().toLocaleTimeString(),
      };
      socket.emit("chat-message", chatData);
      setMessageInput("");
    }
  };

  const handleCopyLink = () => {
    const fullLink = `${window.location.origin}/livestreamingplatform/watch/${id}`;
    navigator.clipboard.writeText(fullLink).then(() => {
      message.success("Stream link copied to clipboard!");
    });
  };

  return (
    <Card style={{ margin: "20px" }}>
      {streamInfo ? (
        <>
          <Title level={3}>{streamInfo.streamTitle}</Title>

          <div style={{ marginBottom: 10 }}>
            <Paragraph copyable={{ text: `${window.location.origin}/livestreamingplatform/watch/${id}` }} style={{ marginBottom: 4 }}>
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
                  <em style={{ fontSize: "0.8em", color: "#999", marginLeft: "5px" }}>
                    {msg.time}
                  </em>
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
