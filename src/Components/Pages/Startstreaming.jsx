import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Card, Space, message, Typography, Input, Row, Col, List } from "antd";
import {
  VideoCameraOutlined,
  StopOutlined,
  SendOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  SoundOutlined,
  SoundFilled,
  VideoCameraOutlined as CameraOnIcon,
  VideoCameraAddOutlined as CameraOffIcon,
  DesktopOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";
import "./Startstreaming.css";

const { Title } = Typography;

const StartStreaming = () => {
  const firebaseUser = useSelector((state) => state.user.firebaseUser);
  const videoRef = useRef(null);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  const [stream, setStream] = useState(null);
  const [originalVideoTrack, setOriginalVideoTrack] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const peerConnectionRef = useRef(null);
  const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  useEffect(() => {
    socket.on("chat-message", (msg) => setMessages((prev) => [...prev, msg]));
    return () => socket.off("chat-message");
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [stream]);

  useEffect(() => {
    const activeStream = JSON.parse(localStorage.getItem("activeStream"));
    if (activeStream && !isStreaming) {
      rejoinStream(activeStream);
    }
  }, [isStreaming]);

  const rejoinStream = async ({ streamTitle: savedTitle, streamId }) => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setOriginalVideoTrack(mediaStream.getVideoTracks()[0]);
      setIsStreaming(true);
      setStreamTitle(savedTitle);
      message.success("Rejoined your active stream.");

      peerConnectionRef.current = new RTCPeerConnection(servers);
      mediaStream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, mediaStream);
      });
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            streamId: firebaseUser ? firebaseUser.uid : "Guest",
            candidate: event.candidate,
          });
        }
      };

      socket.emit("rejoin-stream", {
        streamerId: firebaseUser ? firebaseUser.uid : "Guest",
        streamTitle: savedTitle,
      });
    } catch (err) {
      console.error("Error rejoining stream:", err);
      message.error("Failed to rejoin stream.");
    }
  };

  const startStream = async () => {
    if (!streamTitle.trim()) {
      message.warning("Please enter a stream title.");
      return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setOriginalVideoTrack(mediaStream.getVideoTracks()[0]);
      setIsStreaming(true);

      peerConnectionRef.current = new RTCPeerConnection(servers);
      mediaStream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, mediaStream);
      });

      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            streamId: firebaseUser ? firebaseUser.uid : "Guest",
            candidate: event.candidate,
          });
        }
      };

      socket.emit("start-stream", {
        streamerId: firebaseUser ? firebaseUser.uid : "Guest",
        streamTitle,
      });

      localStorage.setItem("activeStream", JSON.stringify({ streamTitle, streamId: firebaseUser?.uid }));

      message.success("Streaming started.");
    } catch (err) {
      console.error("Error starting stream:", err);
      message.error("Failed to start streaming.");
    }
  };

  const leaveStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    socket.emit("leave-stream", {
      streamerId: firebaseUser ? firebaseUser.uid : "Guest",
    });
    localStorage.removeItem("activeStream");
    setIsStreaming(false);
    setStream(null);
    setStreamTitle("");
    message.success("You have left the stream.");
    navigate("/"); // Navigate to home or your desired page
  };

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    const msg = {
      sender: firebaseUser ? firebaseUser.displayName || "Guest" : "Guest",
      text: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };
    socket.emit("chat-message", msg);
    setMessages((prev) => [...prev, msg]);
    setMessageInput("");
  };

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullScreen(false);
    }
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraOn((prev) => !prev);
    }
  };

  const toggleScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];

      const sender = peerConnectionRef.current
        .getSenders()
        .find((s) => s.track.kind === "video");

      if (sender) {
        sender.replaceTrack(screenTrack);
      }

      screenTrack.onended = () => {
        if (originalVideoTrack && sender) {
          sender.replaceTrack(originalVideoTrack);
          setIsScreenSharing(false);
        }
      };

      setIsScreenSharing(true);
    } catch (err) {
      console.error("Error sharing screen:", err);
    }
  };

  return (
    <div className="start-streaming-container">
      <Row gutter={16}>
        <Col xs={24} md={16}>
          <Card className="video-card">
            <video ref={videoRef} autoPlay muted className="video-player" />
            <Space style={{ marginTop: "10px" }}>
              {!isStreaming ? (
                <>
                  <Input
                    placeholder="Enter Stream Title"
                    value={streamTitle}
                    onChange={(e) => setStreamTitle(e.target.value)}
                    style={{ width: "250px" }}
                  />
                  <Button
                    type="primary"
                    icon={<VideoCameraOutlined />}
                    onClick={startStream}
                  >
                    Start Streaming
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="danger"
                    icon={<StopOutlined />}
                    onClick={leaveStream}
                  >
                    Stop Streaming
                  </Button>
                  <Button
                    icon={isMuted ? <SoundFilled /> : <SoundOutlined />}
                    onClick={toggleMute}
                  />
                  <Button
                    icon={isCameraOn ? <CameraOnIcon /> : <CameraOffIcon />}
                    onClick={toggleCamera}
                  />
                  <Button
                    icon={<DesktopOutlined />}
                    onClick={toggleScreenShare}
                  />
                  <Button
                    icon={isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                    onClick={toggleFullScreen}
                  />
                  <Button
                    icon={<LogoutOutlined />}
                    onClick={leaveStream}
                    danger
                  >
                    Leave Stream
                  </Button>
                </>
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Chat" className="chat-card">
            <List
              size="small"
              dataSource={messages}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
            <div ref={chatEndRef} />
            <Space style={{ marginTop: "10px" }}>
              <Input
                placeholder="Type a message"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onPressEnter={sendMessage}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={sendMessage}
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StartStreaming;
