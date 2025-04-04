// // StartStreaming.jsx
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
// } from "@ant-design/icons";
// import socket from "../../socket";
// import "./Startstreaming.css";

// const { Title } = Typography;

// const StartStreaming = () => {
//   const firebaseUser = useSelector((state) => state.user.firebaseUser);
//   const videoRef = useRef(null);
//   const chatEndRef = useRef(null);

//   // Streaming state
//   const [stream, setStream] = useState(null);
//   const [isStreaming, setIsStreaming] = useState(false);
//   const [streamTitle, setStreamTitle] = useState("");
//   const [error, setError] = useState("");

//   // Chat state: each message now includes username, userId, message, and time
//   const [messages, setMessages] = useState([]);
//   const [messageInput, setMessageInput] = useState("");

//   // Control state for additional options
//   const [isFullScreen, setIsFullScreen] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isCameraOn, setIsCameraOn] = useState(true);

//   // WebRTC Peer Connection (basic setup for demonstration)
//   const peerConnectionRef = useRef(null);
//   const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

//   useEffect(() => {
//     // Listen for incoming chat messages (which include sender info)
//     socket.on("chat-message", (msg) => {
//       setMessages((prev) => [...prev, msg]);
//     });
//     return () => {
//       socket.off("chat-message");
//     };
//   }, []);

//   useEffect(() => {
//     // Cleanup media tracks when component unmounts
//     return () => {
//       if (stream) {
//         stream.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, [stream]);

//   useEffect(() => {
//     // Auto-scroll chat to the latest message
//     if (chatEndRef.current) {
//       chatEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   // Fullscreen toggle using the Fullscreen API
//   const toggleFullScreen = () => {
//     if (!isFullScreen) {
//       videoRef.current.requestFullscreen();
//       setIsFullScreen(true);
//     } else {
//       document.exitFullscreen();
//       setIsFullScreen(false);
//     }
//   };

//   // Mute/unmute audio
//   const toggleMute = () => {
//     if (stream) {
//       stream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
//       setIsMuted(!isMuted);
//     }
//   };

//   // Toggle camera on/off
//   const toggleCamera = () => {
//     if (stream) {
//       stream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
//       setIsCameraOn(!isCameraOn);
//     }
//   };

//   // Screen sharing functionality
//   const toggleScreenShare = async () => {
//     try {
//       if (stream) {
//         const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
//         const videoTrack = screenStream.getVideoTracks()[0];
//         const sender = peerConnectionRef.current.getSenders().find((s) => s.track.kind === "video");
//         if (sender) {
//           sender.replaceTrack(videoTrack);
//           // Listen for screen share end
//           videoTrack.onended = () => {
//             // Restore original video stream
//             const originalTrack = stream.getVideoTracks()[0];
//             sender.replaceTrack(originalTrack);
//           };
//         }
//       }
//     } catch (err) {
//       console.error("Error in screen sharing:", err);
//     }
//   };

//   // Start streaming: Capture media, set up WebRTC peer connection, and notify backend via socket
//   const startStream = async () => {
//     if (!streamTitle.trim()) {
//       message.warning("Please enter a stream title before starting.");
//       return;
//     }
//     try {
//       const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//       if (videoRef.current) {
//         videoRef.current.srcObject = mediaStream;
//       }
//       setStream(mediaStream);
//       setIsStreaming(true);
//       setError("");
//       message.success("Streaming started!");

//       // Set up a basic RTCPeerConnection (for demonstration; signaling is simplified)
//       peerConnectionRef.current = new RTCPeerConnection(servers);
//       mediaStream.getTracks().forEach((track) => {
//         peerConnectionRef.current.addTrack(track, mediaStream);
//       });
//       peerConnectionRef.current.onicecandidate = (event) => {
//         if (event.candidate) {
//           // In a complete implementation, send ICE candidates via your signaling server
//           console.log("New ICE candidate:", event.candidate);
//         }
//       };

//       // Notify backend about the new stream
//       socket.emit("start-stream", { streamTitle, streamerId: firebaseUser ? firebaseUser.uid : "Guest" });
//     } catch (err) {
//       console.error("Error accessing media devices:", err);
//       setError("Failed to access camera/microphone. Please check permissions.");
//       message.error("Error starting stream. Check permissions.");
//     }
//   };

//   const stopStream = () => {
//     if (stream) {
//       stream.getTracks().forEach((track) => track.stop());
//     }
//     setStream(null);
//     setIsStreaming(false);
//     message.info("Streaming stopped.");
//     socket.emit("stop-stream");
//   };

//   // Send chat message with sender details
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
//       {/* Video & Controls Column */}
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
//             <video ref={videoRef} className="stream-video" autoPlay playsInline muted></video>
//             {error && <p className="error-text">{error}</p>}
//             <Space>
//               {!isStreaming ? (
//                 <Button type="primary" icon={<VideoCameraOutlined />} size="large" onClick={startStream}>
//                   Start Streaming
//                 </Button>
//               ) : (
//                 <Button type="danger" icon={<StopOutlined />} size="large" onClick={stopStream}>
//                   Stop Streaming
//                 </Button>
//               )}
//             </Space>
//             {/* Additional Control Buttons */}
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
//                 <Button onClick={toggleScreenShare}>Share Screen</Button>
//               </Space>
//             )}
//           </Space>
//         </Card>
//       </Col>
//       {/* Chat Column */}
//       <Col xs={24} md={8}>
//         {isStreaming && (
//           <Card className="chat-box">
//             <Title level={4} className="chat-title">Live Chat</Title>
//             <List
//               className="chat-messages"
//               dataSource={messages}
//               renderItem={(msg, index) => (
//                 <List.Item key={index}>
//                   <strong>{msg.username}</strong>: {msg.message}{" "}
//                   <em style={{ fontSize: "0.8em", color: "#999" }}>{msg.time}</em>
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


// StartStreaming.jsx
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
} from "@ant-design/icons";
import socket from "../../socket";
import "./Startstreaming.css";

const { Title } = Typography;

const StartStreaming = () => {
  const firebaseUser = useSelector((state) => state.user.firebaseUser);
  const videoRef = useRef(null);
  const chatEndRef = useRef(null);

  // Streaming state
  const [stream, setStream] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [error, setError] = useState("");

  // Chat state: each message now includes username, userId, message, and time
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  // Control state for additional options
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // WebRTC Peer Connection (basic setup for demonstration)
  const peerConnectionRef = useRef(null);
  const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  useEffect(() => {
    // Listen for incoming chat messages (which include sender info)
    socket.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off("chat-message");
    };
  }, []);

  useEffect(() => {
    // Cleanup media tracks when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    // Auto-scroll chat to the latest message
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // NEW: Keep connection alive when tab changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isStreaming) {
        console.log("Tab is active again, rejoining stream...");
        // Emit rejoin-stream event (backend should handle this accordingly)
        socket.emit("rejoin-stream", { streamId: socket.id });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isStreaming]);

  // Fullscreen toggle using the Fullscreen API
  const toggleFullScreen = () => {
    if (!isFullScreen) {
      videoRef.current.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // Mute/unmute audio
  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
      setIsMuted(!isMuted);
    }
  };

  // Toggle camera on/off
  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
      setIsCameraOn(!isCameraOn);
    }
  };

  // Screen sharing functionality (existing implementation)
  const toggleScreenShare = async () => {
    try {
      if (stream) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find((s) => s.track.kind === "video");
        if (sender) {
          sender.replaceTrack(videoTrack);
          // Listen for screen share end
          videoTrack.onended = () => {
            // Restore original video stream
            const originalTrack = stream.getVideoTracks()[0];
            sender.replaceTrack(originalTrack);
            setIsScreenSharing(false);
          };
          setIsScreenSharing(true);
        }
      }
    } catch (err) {
      console.error("Error in screen sharing:", err);
    }
  };

  // Start streaming: Capture media, set up WebRTC peer connection, and notify backend via socket
  const startStream = async () => {
    if (!streamTitle.trim()) {
      message.warning("Please enter a stream title before starting.");
      return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setIsStreaming(true);
      setError("");
      message.success("Streaming started!");

      // Set up a basic RTCPeerConnection (for demonstration; signaling is simplified)
      peerConnectionRef.current = new RTCPeerConnection(servers);
      mediaStream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, mediaStream);
      });
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          // In a complete implementation, send ICE candidates via your signaling server
          console.log("New ICE candidate:", event.candidate);
        }
      };

      // Notify backend about the new stream
      socket.emit("start-stream", { streamTitle, streamerId: firebaseUser ? firebaseUser.uid : "Guest" });
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
    socket.emit("stop-stream");
  };

  // Send chat message with sender details
  const sendMessage = () => {
    if (messageInput.trim()) {
      const chatData = {
        streamId: socket.id, // Assuming current stream is identified by socket.id
        userId: firebaseUser ? firebaseUser.uid : "Guest",
        username: firebaseUser ? firebaseUser.displayName : "Guest",
        message: messageInput,
        time: new Date().toLocaleTimeString(),
      };
      socket.emit("chat-message", chatData);
      setMessageInput("");
    }
  };

  return (
    <Row justify="center" align="middle" className="start-streaming-container">
      {/* Video & Controls Column */}
      <Col xs={24} md={16}>
        <Card bordered={false} className="stream-card">
          <Title level={3} className="stream-title">Start Live Streaming</Title>
          <Space direction="vertical" size="large" className="stream-controls">
            <Input
              placeholder="Enter Stream Title"
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              size="large"
            />
            <video ref={videoRef} className="stream-video" autoPlay playsInline muted></video>
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
            {/* Additional Control Buttons */}
            {isStreaming && (
              <Space style={{ marginTop: 10 }}>
                <Button onClick={toggleFullScreen}>
                  {isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                </Button>
                <Button onClick={toggleMute}>
                  {isMuted ? <SoundOutlined /> : <SoundFilled />}
                </Button>
                <Button onClick={toggleCamera}>
                  {isCameraOn ? <CameraOnIcon /> : <CameraOffIcon />}
                </Button>
                <Button onClick={toggleScreenShare}>
                  {isScreenSharing ? "Stop Screen Share" : "Share Screen"}
                </Button>
              </Space>
            )}
          </Space>
        </Card>
      </Col>
      {/* Chat Column */}
      <Col xs={24} md={8}>
        {isStreaming && (
          <Card className="chat-box">
            <Title level={4} className="chat-title">Live Chat</Title>
            <List
              className="chat-messages"
              dataSource={messages}
              renderItem={(msg, index) => (
                <List.Item key={index}>
                  <strong>{msg.username}</strong>: {msg.message}{" "}
                  <em style={{ fontSize: "0.8em", color: "#999" }}>{msg.time}</em>
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
        )}
      </Col>
    </Row>
  );
};

export default StartStreaming;
