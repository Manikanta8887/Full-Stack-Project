import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setIsStreaming, setStreamTitle } from "../Redux/streamSlice.js";
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
} from "@ant-design/icons";
import socket from "../../socket";
import "./Startstreaming.css";

const { Title } = Typography;

const StartStreaming = () => {
  const dispatch = useDispatch();
  const firebaseUser = useSelector((state) => state.user.firebaseUser);
  const reduxStreaming = useSelector((state) => state.stream.isStreaming);
  const reduxTitle = useSelector((state) => state.stream.streamTitle);

  const isStreaming = reduxStreaming || localStorage.getItem("isStreaming") === "true";
  const streamTitle = reduxTitle || localStorage.getItem("streamTitle") || "";

  const videoRef = useRef(null);
  const chatEndRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [originalVideoTrack, setOriginalVideoTrack] = useState(null);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const peerConnectionRef = useRef(null);
  // Updated ICE servers using Xirsys TURN/STUN configuration
  const servers = {
    iceServers: [
      {
        urls: "stun:global.xirsys.net",
      },
      {
        urls: "turn:global.xirsys.net:3478?transport=udp",
        username: "Manikanta",
        credential: "786edebc-19dc-11f0-8c4a-0242ac130003",
      },
      {
        urls: "turn:global.xirsys.net:3478?transport=tcp",
        username: "Manikanta",
        credential: "786edebc-19dc-11f0-8c4a-0242ac130003",
      },
    ],
  };

  useEffect(() => {
    if (reduxStreaming) localStorage.setItem("isStreaming", "true");
    else localStorage.removeItem("isStreaming");
  }, [reduxStreaming]);

  useEffect(() => {
    if (reduxTitle) localStorage.setItem("streamTitle", reduxTitle);
    else localStorage.removeItem("streamTitle");
  }, [reduxTitle]);

  // SOCKET: Set up signaling listeners
  useEffect(() => {
    socket.on("chat-message", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("answer", async ({ answer }) => {
      console.log("STREAMER: Received answer", answer);
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });
    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Error adding ICE candidate:", e);
      }
    });
    socket.on("update-streams", (streams) => {
      const myStream = streams.find((s) => s.streamerId === firebaseUser?.uid);
      if (myStream) {
        setViewerCount(myStream.viewers || 0);
      }
    });
    socket.on("stream-info", (data) => {
      if (data) {
        setMessages(data.chatMessages || []);
        setViewerCount(data.viewers || 0);
      }
    });
    return () => {
      socket.off("chat-message");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("update-streams");
      socket.off("stream-info");
    };
  }, [firebaseUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Rejoin logic on refresh: if streaming is flagged but no peerConnection exists, attempt to rejoin.
  useEffect(() => {
    const rejoinStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setOriginalVideoTrack(mediaStream.getVideoTracks()[0]);
        peerConnectionRef.current = new RTCPeerConnection(servers);
        mediaStream.getTracks().forEach((track) => {
          peerConnectionRef.current.addTrack(track, mediaStream);
        });
        peerConnectionRef.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              streamId: firebaseUser?.uid,
              candidate: event.candidate,
            });
          }
        };
        socket.emit("rejoin-stream", { streamerId: firebaseUser?.uid });
        message.success("Rejoined the stream after refresh.");
      } catch (err) {
        console.error("Rejoin error:", err);
        message.error("Failed to rejoin stream after refresh.");
      }
    };

    if (isStreaming && !peerConnectionRef.current) {
      dispatch(setIsStreaming(true));
      dispatch(setStreamTitle(streamTitle));
      rejoinStream();
    }
  }, [isStreaming, streamTitle, dispatch, firebaseUser, servers]);

  // UI control functions
  const toggleFullScreen = () => {
    if (!isFullScreen && videoRef.current) {
      videoRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullScreen((prev) => !prev);
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
      setIsMuted((prev) => !prev);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
      setIsCameraOn((prev) => !prev);
    }
  };

  const toggleScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = peerConnectionRef.current?.getSenders().find((s) => s.track.kind === "video");
      if (!sender) return;
      if (!originalVideoTrack) {
        setOriginalVideoTrack(stream.getVideoTracks()[0]);
      }
      sender.replaceTrack(screenTrack);
      videoRef.current.srcObject = new MediaStream([screenTrack, ...stream.getAudioTracks()]);
      setIsScreenSharing(true);
      message.success("Screen sharing started");
      screenTrack.onended = () => {
        if (originalVideoTrack) {
          sender.replaceTrack(originalVideoTrack);
          videoRef.current.srcObject = stream;
        }
        setIsScreenSharing(false);
      };
    } catch (err) {
      console.error("Error sharing screen:", err);
      message.error("Screen sharing failed");
    }
  };

  // Start stream: get user media, create PeerConnection, create and send offer, and emit start-stream event.
  const startStream = async () => {
    if (!streamTitle.trim()) {
      return message.warning("Please enter a stream title.");
    }
    try {
      setIsLoading(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setOriginalVideoTrack(mediaStream.getVideoTracks()[0]);
      dispatch(setIsStreaming(true));
      dispatch(setStreamTitle(streamTitle));
      message.success("Streaming started");

      peerConnectionRef.current = new RTCPeerConnection(servers);
      mediaStream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, mediaStream);
      });

      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            streamId: firebaseUser?.uid || "Guest",
            candidate: event.candidate,
          });
        }
      };

      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      console.log("STREAMER: Emitting offer with streamId:", firebaseUser?.uid);
      socket.emit("offer", { streamId: firebaseUser?.uid || "Guest", offer });
      socket.emit("start-stream", {
        streamTitle,
        streamerId: firebaseUser?.uid || "Guest",
        streamerName: firebaseUser?.displayName || "Guest",
        profilePic: firebaseUser?.photoURL || null,
      });
    } catch (err) {
      console.error("Stream start error:", err);
      setError("Failed to access camera/mic.");
      message.error("Permission denied or no camera/mic available.");
    } finally {
      setIsLoading(false);
    }
  };

  // Stop stream: close media tracks, close PeerConnection, update state and notify backend.
  const stopStream = () => {
    stream?.getTracks().forEach((track) => track.stop());
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    setStream(null);
    setOriginalVideoTrack(null);
    dispatch(setIsStreaming(false));
    dispatch(setStreamTitle(""));
    localStorage.removeItem("isStreaming");
    localStorage.removeItem("streamTitle");
    setIsCameraOn(true);
    setIsMuted(false);
    setIsScreenSharing(false);
    setViewerCount(0);
    if (videoRef.current) videoRef.current.srcObject = null;
    message.info("Streaming stopped");
    socket.emit("stop-stream", {
      streamerId: firebaseUser?.uid || "Guest",
    });
  };

  const sendMessage = useCallback(() => {
    if (messageInput.trim()) {
      const chatData = {
        streamId: firebaseUser?.uid || "Guest",
        userId: firebaseUser?.uid || "Guest",
        username: firebaseUser?.displayName || "Guest",
        message: messageInput,
        time: new Date().toLocaleTimeString(),
      };
      socket.emit("chat-message", chatData);
      setMessageInput("");
    }
  }, [messageInput, firebaseUser]);

  return (
    <Row justify="center" gutter={[16, 16]} className="start-streaming-container">
      <Col xs={24} md={16}>
        <Card bordered className="stream-card">
          <Title level={3} className="stream-title">
            Start Live Streaming {isStreaming && `• ${viewerCount} watching`}
          </Title>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {/* Added autoComplete="off" for the stream title input */}
            <Input
              placeholder="Enter Stream Title"
              value={streamTitle}
              onChange={(e) => dispatch(setStreamTitle(e.target.value))}
              size="large"
              disabled={!firebaseUser}
              autoComplete="off"
            />
            <video ref={videoRef} className="stream-video" autoPlay playsInline muted />
            {error && <p className="error-text">{error}</p>}
            <Space wrap>
              {!isStreaming ? (
                <Button
                  type="primary"
                  icon={<VideoCameraOutlined />}
                  size="large"
                  onClick={startStream}
                  loading={isLoading}
                  disabled={!firebaseUser}
                >
                  Start Streaming
                </Button>
              ) : (
                <Button type="danger" icon={<StopOutlined />} size="large" onClick={stopStream}>
                  Stop Streaming
                </Button>
              )}
            </Space>
            {isStreaming && (
              <Space wrap>
                <Button onClick={toggleFullScreen}>
                  {isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                </Button>
                <Button onClick={toggleMute}>
                  {isMuted ? <SoundOutlined /> : <SoundFilled />}
                </Button>
                <Button onClick={toggleCamera}>
                  {isCameraOn ? <CameraOnIcon /> : <CameraOffIcon />}
                </Button>
                <Button onClick={toggleScreenShare} icon={<DesktopOutlined />}>
                  Share Screen
                </Button>
              </Space>
            )}
          </Space>
        </Card>
      </Col>
      <Col xs={24} md={8}>
        {isStreaming && (
          <Card className="chat-box">
            <Title level={4} className="chat-title">
              Live Chat
            </Title>
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
            <Space.Compact className="chat-input" style={{ marginTop: "8px" }}>
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
        )}
      </Col>
    </Row>
  );
};

export default StartStreaming;
