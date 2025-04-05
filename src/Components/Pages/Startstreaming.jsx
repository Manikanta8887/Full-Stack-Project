// import React, { useEffect, useRef, useState } from "react";
// import { useSelector } from "react-redux";
// import { Button, Card, Space, message, Typography, Input, Row, Col, List } from "antd";
// import {
//   VideoCameraOutlined,
//   StopOutlined,
//   SendOutlined,
//   FullscreenOutlined,
//   FullscreenExitOutlined,
//   SoundOutlined,
//   SoundFilled,
//   VideoCameraOutlined as CameraOnIcon,
//   VideoCameraAddOutlined as CameraOffIcon,
//   DesktopOutlined,
// } from "@ant-design/icons";
// import socket from "../../socket";
// import "./Startstreaming.css";

// const { Title } = Typography;

// const StartStreaming = () => {
//   const firebaseUser = useSelector((state) => state.user.firebaseUser);
//   const videoRef = useRef(null);
//   const chatEndRef = useRef(null);

//   const [stream, setStream] = useState(null);
//   const [originalVideoTrack, setOriginalVideoTrack] = useState(null);
//   const [isStreaming, setIsStreaming] = useState(false);
//   const [streamTitle, setStreamTitle] = useState("");
//   const [error, setError] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [messageInput, setMessageInput] = useState("");
//   const [isFullScreen, setIsFullScreen] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isCameraOn, setIsCameraOn] = useState(true);
//   const [isScreenSharing, setIsScreenSharing] = useState(false);

//   const peerConnectionRef = useRef(null);
//   const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

//   useEffect(() => {
//     socket.on("chat-message", (msg) => setMessages((prev) => [...prev, msg]));
//     return () => socket.off("chat-message");
//   }, []);

//   useEffect(() => {
//     if (chatEndRef.current) {
//       chatEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   useEffect(() => {
//     return () => {
//       if (stream) {
//         stream.getTracks().forEach((track) => track.stop());
//       }
//       if (peerConnectionRef.current) {
//         peerConnectionRef.current.close();
//       }
//     };
//   }, []);

//   const toggleFullScreen = () => {
//     if (!isFullScreen && videoRef.current) {
//       videoRef.current.requestFullscreen();
//     } else {
//       document.exitFullscreen();
//     }
//     setIsFullScreen(!isFullScreen);
//   };

//   const toggleMute = () => {
//     if (stream) {
//       stream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
//       setIsMuted(!isMuted);
//     }
//   };

//   const toggleCamera = () => {
//     if (stream) {
//       stream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
//       setIsCameraOn(!isCameraOn);
//     }
//   };

//   const toggleScreenShare = async () => {
//     try {
//       const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
//       const screenTrack = screenStream.getVideoTracks()[0];
//       const sender = peerConnectionRef.current
//         ?.getSenders()
//         .find((s) => s.track.kind === "video");

//       if (!sender) return;

//       // Store original track if not already stored
//       if (!originalVideoTrack) {
//         setOriginalVideoTrack(stream.getVideoTracks()[0]);
//       }

//       sender.replaceTrack(screenTrack);
//       videoRef.current.srcObject = new MediaStream([
//         screenTrack,
//         ...stream.getAudioTracks(),
//       ]);
//       setIsScreenSharing(true);

//       screenTrack.onended = () => {
//         if (originalVideoTrack) {
//           sender.replaceTrack(originalVideoTrack);
//           videoRef.current.srcObject = stream;
//         }
//         setIsScreenSharing(false);
//       };
//     } catch (err) {
//       console.error("Error sharing screen:", err);
//       message.error("Screen sharing failed");
//     }
//   };

//   const startStream = async () => {
//     if (!streamTitle.trim()) {
//       message.warning("Please enter a stream title.");
//       return;
//     }
//     try {
//       const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//       videoRef.current.srcObject = mediaStream;
//       setStream(mediaStream);
//       setOriginalVideoTrack(mediaStream.getVideoTracks()[0]);
//       setIsStreaming(true);
//       message.success("Streaming started");

//       peerConnectionRef.current = new RTCPeerConnection(servers);
//       mediaStream.getTracks().forEach((track) => {
//         peerConnectionRef.current.addTrack(track, mediaStream);
//       });

//       peerConnectionRef.current.onicecandidate = (event) => {
//         if (event.candidate) {
//           console.log("ICE candidate:", event.candidate);
//         }
//       };

//       socket.emit("start-stream", {
//         streamTitle,
//         streamerId: firebaseUser ? firebaseUser.uid : "Guest",
//         streamerName: firebaseUser?.displayName || "Guest",
//         profilePic: firebaseUser?.photoURL || null,
//       });
//     } catch (err) {
//       console.error("Stream start error:", err);
//       setError("Failed to access camera/mic.");
//       message.error("Permission denied or no camera/mic available.");
//     }
//   };

//   const stopStream = () => {
//     if (stream) {
//       stream.getTracks().forEach((track) => track.stop());
//     }
//     if (peerConnectionRef.current) {
//       peerConnectionRef.current.close();
//       peerConnectionRef.current = null;
//     }

//     setStream(null);
//     setOriginalVideoTrack(null);
//     setIsStreaming(false);
//     setIsCameraOn(true);
//     setIsMuted(false);
//     setIsScreenSharing(false);
//     videoRef.current.srcObject = null;
//     message.info("Streaming stopped");

//     socket.emit("stop-stream", {
//       streamerId: firebaseUser ? firebaseUser.uid : "Guest",
//     });
//   };

//   const sendMessage = () => {
//     if (messageInput.trim()) {
//       const chatData = {
//         userId: firebaseUser ? firebaseUser.uid : "Guest",
//         username: firebaseUser ? firebaseUser.displayName : "Guest",
//         message: messageInput,
//         time: new Date().toLocaleTimeString(),
//       };
//       socket.emit("chat-message", chatData);
//       setMessageInput("");
//     }
//   };

//   return (
//     <Row justify="center" align="middle" className="start-streaming-container">
//       <Col xs={24} md={16}>
//         <Card bordered={false} className="stream-card">
//           <Title level={3} className="stream-title">Start Live Streaming</Title>
//           <Space direction="vertical" size="large" className="stream-controls">
//             <Input
//               placeholder="Enter Stream Title"
//               value={streamTitle}
//               onChange={(e) => setStreamTitle(e.target.value)}
//               size="large"
//             />
//             <video
//               ref={videoRef}
//               className="stream-video"
//               autoPlay
//               playsInline
//               muted
//             ></video>
//             {error && <p className="error-text">{error}</p>}
//             <Space>
//               {!isStreaming ? (
//                 <Button
//                   type="primary"
//                   icon={<VideoCameraOutlined />}
//                   size="large"
//                   onClick={startStream}
//                 >
//                   Start Streaming
//                 </Button>
//               ) : (
//                 <Button
//                   type="danger"
//                   icon={<StopOutlined />}
//                   size="large"
//                   onClick={stopStream}
//                 >
//                   Stop Streaming
//                 </Button>
//               )}
//             </Space>
//             {isStreaming && (
//               <Space style={{ marginTop: 10 }}>
//                 <Button onClick={toggleFullScreen}>
//                   {isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
//                 </Button>
//                 <Button onClick={toggleMute}>
//                   {isMuted ? <SoundOutlined /> : <SoundFilled />}
//                 </Button>
//                 <Button onClick={toggleCamera}>
//                   {isCameraOn ? <CameraOnIcon /> : <CameraOffIcon />}
//                 </Button>
//                 <Button onClick={toggleScreenShare} icon={<DesktopOutlined />}>
//                   Share Screen
//                 </Button>
//               </Space>
//             )}
//           </Space>
//         </Card>
//       </Col>

//       <Col xs={24} md={8}>
//         {isStreaming && (
//           <Card className="chat-box">
//             <Title level={4} className="chat-title">Live Chat</Title>
//             <List
//               className="chat-messages"
//               dataSource={messages}
//               renderItem={(msg, index) => (
//                 <List.Item key={index}>
//                   <strong>{msg.username}</strong>: {msg.message}
//                   <em style={{ fontSize: "0.8em", color: "#999", marginLeft: "5px" }}>
//                     {msg.time}
//                   </em>
//                 </List.Item>
//               )}
//             />
//             <div ref={chatEndRef}></div>
//             <Space.Compact className="chat-input">
//               <Input
//                 placeholder="Type a message..."
//                 value={messageInput}
//                 onChange={(e) => setMessageInput(e.target.value)}
//                 onPressEnter={sendMessage}
//               />
//               <Button type="primary" icon={<SendOutlined />} onClick={sendMessage} />
//             </Space.Compact>
//           </Card>
//         )}
//       </Col>
//     </Row>
//   );
// };

// export default StartStreaming;


// src/pages/StartStreaming.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Input,
  message,
  Tooltip,
  Typography,
  Space,
  Modal,
} from "antd";
import {
  AudioMutedOutlined,
  AudioOutlined,
  VideoCameraAddOutlined,
  VideoCameraOutlined,
  DesktopOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  LogoutOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

const { Title } = Typography;
const socket = io("http://localhost:5000");

const StartStreaming = () => {
  const [streamTitle, setStreamTitle] = useState("");
  const [stream, setStream] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const videoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const originalVideoTrack = useRef(null);
  const navigate = useNavigate();

  const firebaseUser = useSelector((state) => state.auth.firebaseUser);
  const user = useSelector((state) => state.auth.user);

  const startStream = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      videoRef.current.srcObject = mediaStream;

      const peerConnection = new RTCPeerConnection();
      peerConnectionRef.current = peerConnection;

      mediaStream.getTracks().forEach((track) =>
        peerConnection.addTrack(track, mediaStream)
      );
      originalVideoTrack.current = mediaStream.getVideoTracks()[0];

      socket.emit("start-stream", {
        streamTitle,
        streamerId: firebaseUser?.uid || "Guest",
        streamerName: firebaseUser?.displayName || user?.name || "Guest",
        profilePic: firebaseUser?.photoURL || "/profile-default.png",
      });

      socket.on("start-stream", (newStream) => {
        setIsStreaming(true);
        localStorage.setItem(
          "activeStream",
          JSON.stringify({
            streamTitle: newStream.streamTitle,
            streamId: newStream.streamerId,
          })
        );
      });

      message.success("Stream started successfully.");
    } catch (error) {
      console.error("Error starting stream:", error);
      message.error("Failed to start stream.");
    }
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    socket.emit("stop-stream", {
      streamerId: firebaseUser?.uid || "Guest",
    });
    setIsStreaming(false);
    localStorage.removeItem("activeStream");
    message.info("Stream stopped.");
    navigate("/livestreamingplatform");
  };

  const handleLeaveStream = () => {
    stopStream();
  };

  const toggleMic = () => {
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsMicOn(track.enabled);
    });
  };

  const toggleCamera = () => {
    stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsCameraOn(track.enabled);
    });
  };

  const toggleScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = peerConnectionRef.current
        ?.getSenders()
        .find((s) => s.track.kind === "video");

      if (sender) {
        sender.replaceTrack(screenTrack);
        setIsScreenSharing(true);
      }

      screenTrack.onended = () => {
        if (sender && originalVideoTrack.current) {
          sender.replaceTrack(originalVideoTrack.current);
          setIsScreenSharing(false);
        }
      };
    } catch (error) {
      message.error("Failed to share screen.");
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      localStorage.removeItem("activeStream");
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      {!isStreaming ? (
        <Modal
          title="Start Streaming"
          open={!isStreaming}
          closable={false}
          footer={null}
        >
          <Input
            placeholder="Enter Stream Title"
            value={streamTitle}
            onChange={(e) => setStreamTitle(e.target.value)}
          />
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={startStream}
            style={{ marginTop: 16 }}
            block
          >
            Start Streaming
          </Button>
        </Modal>
      ) : (
        <>
          <Title level={3}>{streamTitle}</Title>
          <p>Streamer: {firebaseUser?.displayName || "Guest"}</p>

          <video
            ref={videoRef}
            autoPlay
            muted
            style={{ width: "100%", borderRadius: 10 }}
          />

          <Space style={{ marginTop: 20 }} wrap>
            <Tooltip title="Toggle Mic">
              <Button
                icon={isMicOn ? <AudioOutlined /> : <AudioMutedOutlined />}
                onClick={toggleMic}
              />
            </Tooltip>

            <Tooltip title="Toggle Camera">
              <Button
                icon={
                  isCameraOn ? <VideoCameraOutlined /> : <VideoCameraAddOutlined />
                }
                onClick={toggleCamera}
              />
            </Tooltip>

            <Tooltip title="Share Screen">
              <Button icon={<DesktopOutlined />} onClick={toggleScreenShare} />
            </Tooltip>

            <Tooltip title="Toggle Fullscreen">
              <Button
                icon={
                  isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />
                }
                onClick={toggleFullscreen}
              />
            </Tooltip>

            <Tooltip title="Leave Stream">
              <Button
                icon={<LogoutOutlined />}
                danger
                onClick={handleLeaveStream}
              />
            </Tooltip>
          </Space>
        </>
      )}
    </div>
  );
};

export default StartStreaming;
