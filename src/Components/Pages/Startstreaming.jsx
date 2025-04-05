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


import React, { useEffect, useRef, useState } from "react";
import { Button, Input, Card, List, Row, Col } from "antd";
import {
  AudioMutedOutlined,
  AudioOutlined,
  VideoCameraAddOutlined,
  VideoCameraOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  DesktopOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // your backend URL

const StartStreaming = ({ user }) => {
  const [streaming, setStreaming] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [localStream, setLocalStream] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  const videoRef = useRef();
  const chatEndRef = useRef();

  useEffect(() => {
    socket.on("chat-message", (message) => {
      setChatMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("chat-message");
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const startStreaming = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      videoRef.current.srcObject = stream;
      setLocalStream(stream);
      setStreaming(true);

      socket.emit("start-stream", {
        userId: user?.uid,
        userName: user?.displayName || "Guest",
        profilePicture: user?.photoURL || "default.png",
        streamTitle,
      });
    } catch (error) {
      console.error("Error starting stream:", error);
    }
  };

  const stopStreaming = () => {
    localStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    setStreaming(false);

    socket.emit("stop-stream", {
      userId: user?.uid,
    });
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = localStream.getVideoTracks()[0];

        sender.stop();
        const tracks = [...localStream.getAudioTracks(), screenTrack];
        const newStream = new MediaStream(tracks);
        videoRef.current.srcObject = newStream;
        setLocalStream(newStream);

        setScreenSharing(true);
      } catch (error) {
        console.error("Error sharing screen:", error);
      }
    } else {
      startStreaming();
      setScreenSharing(false);
    }
  };

  const sendMessage = () => {
    if (messageInput.trim()) {
      const message = {
        userName: user?.displayName || "Guest",
        text: messageInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      socket.emit("chat-message", message);
      setMessageInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <Row justify="center" style={{ padding: "20px" }}>
      <Col xs={24} md={16}>
        {!streaming ? (
          <Card title="Start Your Stream" style={{ textAlign: "center" }}>
            <Input
              placeholder="Enter Stream Title"
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Button
              type="primary"
              size="large"
              onClick={startStreaming}
              disabled={!streamTitle}
            >
              Start Streaming
            </Button>
          </Card>
        ) : (
          <Card title={`Streaming: ${streamTitle}`}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: "100%", maxHeight: "400px", backgroundColor: "#000" }}
            />
            <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
              <Button
                icon={audioEnabled ? <AudioOutlined /> : <AudioMutedOutlined />}
                onClick={toggleAudio}
              />
              <Button
                icon={videoEnabled ? <VideoCameraOutlined /> : <VideoCameraAddOutlined />}
                onClick={toggleVideo}
              />
              <Button
                icon={<FullscreenOutlined />}
                onClick={toggleFullscreen}
              />
              <Button
                icon={<DesktopOutlined />}
                onClick={toggleScreenShare}
              />
              <Button danger onClick={stopStreaming}>
                Stop Streaming
              </Button>
            </div>

            {/* Chat Box */}
            <Card
              title="Live Chat"
              size="small"
              style={{ marginTop: "20px", maxHeight: "300px", overflowY: "auto" }}
            >
              <List
                dataSource={chatMessages}
                renderItem={(item) => (
                  <List.Item>
                    <strong>{item.userName}:</strong> {item.text}
                    <em style={{ fontSize: "0.8em", color: "#888", marginLeft: "8px" }}>
                      {item.time}
                    </em>
                  </List.Item>
                )}
              />
              <div style={{ marginTop: 10, display: "flex", gap: "8px" }}>
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  allowClear
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={sendMessage}
                >
                  Send
                </Button>
              </div>
              <div ref={chatEndRef}></div>
            </Card>
          </Card>
        )}
      </Col>
    </Row>
  );
};

export default StartStreaming;
