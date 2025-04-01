import React, { useEffect, useRef, useState } from "react";
import { Button, Card, Space, message, Typography, Input, Row, Col, List } from "antd";
import { VideoCameraOutlined, AudioOutlined, DesktopOutlined, StopOutlined, SendOutlined } from "@ant-design/icons";
import socket from "../../socket"; // Ensure correct import
import "./Startstreaming.css"

const { Title } = Typography;

const StartStreaming = () => {
  const videoRef = useRef(null);
  const chatEndRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [error, setError] = useState("");

  // Chat state
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  useEffect(() => {
    // Listen for incoming chat messages
    socket.on("chat-message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off("chat-message");
    };
  }, []);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    // Auto-scroll to the latest message
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const startStream = async () => {
    if (!streamTitle.trim()) {
      message.warning("Please enter a stream title before starting.");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setStream(mediaStream);
      setIsStreaming(true);
      setError("");
      message.success("Streaming started!");
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setError("Failed to access camera/microphone. Please check permissions.");
      message.error("Error starting stream. Check permissions.");
    }
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setIsStreaming(false);
    message.info("Streaming stopped.");
  };

  const sendMessage = () => {
    if (messageInput.trim()) {
      socket.emit("chat-message", messageInput);
      setMessageInput("");
    }
  };

  return (
    <Row justify="center" align="middle" className="start-streaming-container">
      <Col xs={24} sm={20} md={16} lg={12}>
        <Card bordered={false} className="stream-card">
          <Title level={3} className="stream-title">
            Start Live Streaming
          </Title>

          <Space direction="vertical" size="large" className="stream-controls">
            <Input
              placeholder="Enter Stream Title"
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              size="large"
            />

            <video ref={videoRef} className="stream-video" autoPlay playsInline></video>

            {error && <p className="error-text">{error}</p>}

            <Space>
              {!isStreaming ? (
                <Button type="primary" icon={<VideoCameraOutlined />} size="large" onClick={startStream}>
                  Start Streaming
                </Button>
              ) : (
                <Button type="danger" icon={<StopOutlined />} size="large" onClick={stopStream}>
                  Stop Streaming
                </Button>
              )}
            </Space>
          </Space>
        </Card>

        {/* Chat Box */}
        {isStreaming && (
          <Card className="chat-box">
            <Title level={4} className="chat-title">Live Chat</Title>
            <List
              className="chat-messages"
              dataSource={messages}
              renderItem={(msg, index) => <List.Item key={index}>{msg}</List.Item>}
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
        )}
      </Col>
    </Row>
  );
};

export default StartStreaming;
