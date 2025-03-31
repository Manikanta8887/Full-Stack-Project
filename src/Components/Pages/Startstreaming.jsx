// import React, { useState, useRef, useEffect } from "react";
// import socket from "../../socket"; // Correct relative path
// import baseurl from "../../base";  // if needed

// const StartStreaming = () => {
//   const [stream, setStream] = useState(null);
//   const [screenSharing, setScreenSharing] = useState(false);
//   const videoRef = useRef(null);
//   const peerConnection = useRef(null);
//   const [streamTitle, setStreamTitle] = useState("");
//   const [isStreaming, setIsStreaming] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");

//   const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

//   useEffect(() => {
//     // Listen for incoming offers, ICE candidates, and chat messages.
//     socket.on("offer", async (offer) => {
//       if (!peerConnection.current) return;
//       await peerConnection.current.setRemoteDescription(offer);
//       const answer = await peerConnection.current.createAnswer();
//       await peerConnection.current.setLocalDescription(answer);
//       socket.emit("answer", answer);
//     });

//     socket.on("candidate", (candidate) => {
//       if (!peerConnection.current) return;
//       peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//     });

//     socket.on("chat-message", (msg) => {
//       setMessages((prev) => [...prev, msg]);
//     });

//     return () => {
//       socket.off("offer");
//       socket.off("candidate");
//       socket.off("chat-message");
//     };
//   }, []);

//   const startStreaming = async () => {
//     if (!streamTitle) {
//       alert("Please enter a stream title!");
//       return;
//     }

//     try {
//       const userStream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });
//       setStream(userStream);
//       if (videoRef.current) {
//         videoRef.current.srcObject = userStream;
//         videoRef.current.play();
//       }
//       setIsStreaming(true);

//       // Set up the peer connection.
//       peerConnection.current = new RTCPeerConnection(servers);
//       userStream.getTracks().forEach((track) => {
//         peerConnection.current.addTrack(track, userStream);
//       });

//       // Send ICE candidates to the signaling server.
//       peerConnection.current.onicecandidate = (event) => {
//         if (event.candidate) {
//           socket.emit("candidate", event.candidate);
//         }
//       };

//       // Create and send an offer.
//       const offer = await peerConnection.current.createOffer();
//       await peerConnection.current.setLocalDescription(offer);
//       socket.emit("offer", offer, streamTitle);
//     } catch (err) {
//       console.error("Error accessing media devices:", err);
//     }
//   };

//   const stopStreaming = () => {
//     stream?.getTracks().forEach((track) => track.stop());
//     setStream(null);
//     setIsStreaming(false);
//     socket.emit("stop-stream");
//   };

//   const toggleScreenShare = async () => {
//     if (!peerConnection.current) return;
//     if (!screenSharing) {
//       const screenStream = await navigator.mediaDevices.getDisplayMedia({
//         video: true,
//       });
//       const sender = peerConnection.current
//         .getSenders()
//         .find((s) => s.track && s.track.kind === "video");
//       if (sender) {
//         sender.replaceTrack(screenStream.getVideoTracks()[0]);
//       }
//       setScreenSharing(true);
//     } else {
//       const userStream = await navigator.mediaDevices.getUserMedia({ video: true });
//       const sender = peerConnection.current
//         .getSenders()
//         .find((s) => s.track && s.track.kind === "video");
//       if (sender) {
//         sender.replaceTrack(userStream.getVideoTracks()[0]);
//       }
//       setScreenSharing(false);
//     }
//   };

//   const sendMessage = () => {
//     if (!socket) {
//       console.error("Socket not initialized");
//       return;
//     }
//     socket.emit("chat-message", message);
//     setMessage("");
//   };

//   return (
//     <div>
//       <h2>Start Streaming</h2>
//       {!isStreaming && (
//         <input
//           type="text"
//           placeholder="Enter Stream Title"
//           value={streamTitle}
//           onChange={(e) => setStreamTitle(e.target.value)}
//         />
//       )}
//       <button onClick={isStreaming ? stopStreaming : startStreaming}>
//         {isStreaming ? "Stop Streaming" : "Start Streaming"}
//       </button>
//       {isStreaming && (
//         <div>
//           <button onClick={toggleScreenShare}>
//             {screenSharing ? "Stop Screen Share" : "Share Screen"}
//           </button>
//         </div>
//       )}
//       <video ref={videoRef} autoPlay playsInline muted />
//       <div>
//         <div>
//           {messages.map((msg, index) => (
//             <p key={index}>{msg}</p>
//           ))}
//         </div>
//         <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
//         <button onClick={sendMessage}>Send</button>
//       </div>
//     </div>
//   );
// };

// export default StartStreaming;


import React, { useEffect, useRef, useState } from "react";
import { Button, Card, Space, message, Typography, Input, Row, Col, List } from "antd";
import { VideoCameraOutlined, AudioOutlined, DesktopOutlined, StopOutlined, SendOutlined } from "@ant-design/icons";
import socket from "../../socket"; // Ensure correct import
import "./StartStreaming.css";

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
