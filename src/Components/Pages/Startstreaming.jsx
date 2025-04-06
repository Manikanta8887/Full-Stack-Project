// // // StartStreaming.jsx
// // import React, { useEffect, useRef, useState } from "react";
// // import { useSelector } from "react-redux";
// // import { Button, Card, Space, message, Typography, Input, Row, Col, List } from "antd";
// // import {
// //   VideoCameraOutlined,
// //   StopOutlined,
// //   SendOutlined,
// //   FullscreenOutlined,
// //   FullscreenExitOutlined,
// //   SoundOutlined,
// //   SoundFilled,
// //   VideoCameraOutlined as CameraOnIcon,
// //   VideoCameraAddOutlined as CameraOffIcon,
// //   DesktopOutlined,
// // } from "@ant-design/icons";
// // import socket from "../../socket";
// // import "./Startstreaming.css";

// // const { Title } = Typography;

// // const StartStreaming = () => {
// //   const firebaseUser = useSelector((state) => state.user.firebaseUser);
// //   const videoRef = useRef(null);
// //   const chatEndRef = useRef(null);

// //   const [stream, setStream] = useState(null);
// //   const [originalVideoTrack, setOriginalVideoTrack] = useState(null);
// //   const [isStreaming, setIsStreaming] = useState(false);
// //   const [streamTitle, setStreamTitle] = useState("");
// //   const [error, setError] = useState("");
// //   const [messages, setMessages] = useState([]);
// //   const [messageInput, setMessageInput] = useState("");
// //   const [isFullScreen, setIsFullScreen] = useState(false);
// //   const [isMuted, setIsMuted] = useState(false);
// //   const [isCameraOn, setIsCameraOn] = useState(true);
// //   const [isScreenSharing, setIsScreenSharing] = useState(false);

// //   const peerConnectionRef = useRef(null);
// //   const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

// //   // Listen for incoming chat messages (for streamer chat)
// //   useEffect(() => {
// //     socket.on("chat-message", (msg) => setMessages((prev) => [...prev, msg]));
// //     return () => socket.off("chat-message");
// //   }, []);

// //   // Scroll to the end of chat on new message
// //   useEffect(() => {
// //     if (chatEndRef.current) {
// //       chatEndRef.current.scrollIntoView({ behavior: "smooth" });
// //     }
// //   }, [messages]);

// //   // Instead of cleaning up stream on unmount (which stops streaming on internal navigation),
// //   // we add a beforeunload event so that the stream stops only when the user closes the browser.
// //   useEffect(() => {
// //     const handleBeforeUnload = (e) => {
// //       if (isStreaming) {
// //         stopStream();
// //       }
// //     };
// //     window.addEventListener("beforeunload", handleBeforeUnload);
// //     return () => window.removeEventListener("beforeunload", handleBeforeUnload);
// //   }, [isStreaming, stream]);

// //   const toggleFullScreen = () => {
// //     if (!isFullScreen && videoRef.current) {
// //       videoRef.current.requestFullscreen();
// //     } else {
// //       document.exitFullscreen();
// //     }
// //     setIsFullScreen((prev) => !prev);
// //   };

// //   const toggleMute = () => {
// //     if (stream) {
// //       stream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
// //       setIsMuted((prev) => !prev);
// //     }
// //   };

// //   const toggleCamera = () => {
// //     if (stream) {
// //       stream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
// //       setIsCameraOn((prev) => !prev);
// //     }
// //   };

// //   const toggleScreenShare = async () => {
// //     try {
// //       const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
// //       const screenTrack = screenStream.getVideoTracks()[0];
// //       const sender = peerConnectionRef.current
// //         ?.getSenders()
// //         .find((s) => s.track.kind === "video");

// //       if (!sender) return;

// //       // Store original track if not already stored
// //       if (!originalVideoTrack) {
// //         setOriginalVideoTrack(stream.getVideoTracks()[0]);
// //       }

// //       sender.replaceTrack(screenTrack);
// //       videoRef.current.srcObject = new MediaStream([screenTrack, ...stream.getAudioTracks()]);
// //       setIsScreenSharing(true);

// //       // Revert back when screen sharing stops
// //       screenTrack.onended = () => {
// //         if (originalVideoTrack) {
// //           sender.replaceTrack(originalVideoTrack);
// //           videoRef.current.srcObject = stream;
// //         }
// //         setIsScreenSharing(false);
// //       };
// //     } catch (err) {
// //       console.error("Error sharing screen:", err);
// //       message.error("Screen sharing failed");
// //     }
// //   };

// //   const startStream = async () => {
// //     if (!streamTitle.trim()) {
// //       message.warning("Please enter a stream title.");
// //       return;
// //     }
// //     try {
// //       const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
// //       videoRef.current.srcObject = mediaStream;
// //       setStream(mediaStream);
// //       setOriginalVideoTrack(mediaStream.getVideoTracks()[0]);
// //       setIsStreaming(true);
// //       message.success("Streaming started");

// //       // Setup peer connection for WebRTC
// //       peerConnectionRef.current = new RTCPeerConnection(servers);
// //       mediaStream.getTracks().forEach((track) => {
// //         peerConnectionRef.current.addTrack(track, mediaStream);
// //       });

// //       peerConnectionRef.current.onicecandidate = (event) => {
// //         if (event.candidate) {
// //           console.log("ICE candidate:", event.candidate);
// //         }
// //       };

// //       // Emit event to backend that stream is started
// //       socket.emit("start-stream", {
// //         streamTitle,
// //         streamerId: firebaseUser ? firebaseUser.uid : "Guest",
// //         streamerName: firebaseUser?.displayName || "Guest",
// //         profilePic: firebaseUser?.photoURL || null,
// //       });
// //     } catch (err) {
// //       console.error("Stream start error:", err);
// //       setError("Failed to access camera/mic.");
// //       message.error("Permission denied or no camera/mic available.");
// //     }
// //   };

// //   const stopStream = () => {
// //     if (stream) {
// //       stream.getTracks().forEach((track) => track.stop());
// //     }
// //     if (peerConnectionRef.current) {
// //       peerConnectionRef.current.close();
// //       peerConnectionRef.current = null;
// //     }
// //     setStream(null);
// //     setOriginalVideoTrack(null);
// //     setIsStreaming(false);
// //     setIsCameraOn(true);
// //     setIsMuted(false);
// //     setIsScreenSharing(false);
// //     if (videoRef.current) videoRef.current.srcObject = null;
// //     message.info("Streaming stopped");

// //     socket.emit("stop-stream", {
// //       streamerId: firebaseUser ? firebaseUser.uid : "Guest",
// //     });
// //   };

// //   const sendMessage = () => {
// //     if (messageInput.trim()) {
// //       const chatData = {
// //         streamId: firebaseUser ? firebaseUser.uid : "Guest", // Assuming streamer room id is uid
// //         userId: firebaseUser ? firebaseUser.uid : "Guest",
// //         username: firebaseUser ? firebaseUser.displayName : "Guest",
// //         message: messageInput,
// //         time: new Date().toLocaleTimeString(),
// //       };
// //       socket.emit("chat-message", chatData);
// //       setMessageInput("");
// //     }
// //   };

// //   return (
// //     <Row justify="center" align="middle" className="start-streaming-container">
// //       <Col xs={24} md={16}>
// //         <Card bordered={false} className="stream-card">
// //           <Title level={3} className="stream-title">Start Live Streaming</Title>
// //           <Space direction="vertical" size="large" className="stream-controls">
// //             <Input
// //               placeholder="Enter Stream Title"
// //               value={streamTitle}
// //               onChange={(e) => setStreamTitle(e.target.value)}
// //               size="large"
// //             />
// //             <video ref={videoRef} className="stream-video" autoPlay playsInline muted />
// //             {error && <p className="error-text">{error}</p>}
// //             <Space>
// //               {!isStreaming ? (
// //                 <Button type="primary" icon={<VideoCameraOutlined />} size="large" onClick={startStream}>
// //                   Start Streaming
// //                 </Button>
// //               ) : (
// //                 <Button type="danger" icon={<StopOutlined />} size="large" onClick={stopStream}>
// //                   Stop Streaming
// //                 </Button>
// //               )}
// //             </Space>
// //             {isStreaming && (
// //               <Space style={{ marginTop: 10 }}>
// //                 <Button onClick={toggleFullScreen}>
// //                   {isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
// //                 </Button>
// //                 <Button onClick={toggleMute}>
// //                   {isMuted ? <SoundOutlined /> : <SoundFilled />}
// //                 </Button>
// //                 <Button onClick={toggleCamera}>
// //                   {isCameraOn ? <CameraOnIcon /> : <CameraOffIcon />}
// //                 </Button>
// //                 <Button onClick={toggleScreenShare} icon={<DesktopOutlined />}>
// //                   Share Screen
// //                 </Button>
// //               </Space>
// //             )}
// //           </Space>
// //         </Card>
// //       </Col>

// //       <Col xs={24} md={8}>
// //         {isStreaming && (
// //           <Card className="chat-box">
// //             <Title level={4} className="chat-title">Live Chat</Title>
// //             <List
// //               className="chat-messages"
// //               dataSource={messages}
// //               renderItem={(msg, index) => (
// //                 <List.Item key={index}>
// //                   <strong>{msg.username}</strong>: {msg.message}
// //                   <em style={{ fontSize: "0.8em", color: "#999", marginLeft: "5px" }}>
// //                     {msg.time}
// //                   </em>
// //                 </List.Item>
// //               )}
// //             />
// //             <div ref={chatEndRef}></div>
// //             <Space.Compact className="chat-input">
// //               <Input
// //                 placeholder="Type a message..."
// //                 value={messageInput}
// //                 onChange={(e) => setMessageInput(e.target.value)}
// //                 onPressEnter={sendMessage}
// //               />
// //               <Button type="primary" icon={<SendOutlined />} onClick={sendMessage} />
// //             </Space.Compact>
// //           </Card>
// //         )}
// //       </Col>
// //     </Row>
// //   );
// // };

// // export default StartStreaming;

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
//     socket.on("answer", async ({ answer }) => {
//       await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
//     });
//     socket.on("ice-candidate", async ({ candidate }) => {
//       try {
//         await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//       } catch (e) {
//         console.error("Error adding ICE candidate:", e);
//       }
//     });

//     return () => {
//       socket.off("chat-message");
//       socket.off("answer");
//       socket.off("ice-candidate");
//     };
//   }, []);

//   useEffect(() => {
//     if (chatEndRef.current) {
//       chatEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   useEffect(() => {
//     const handleBeforeUnload = (e) => {
//       if (isStreaming) {
//         stopStream();
//       }
//     };
//     window.addEventListener("beforeunload", handleBeforeUnload);
//     return () => window.removeEventListener("beforeunload", handleBeforeUnload);
//   }, [isStreaming, stream]);

//   const toggleFullScreen = () => {
//     if (!isFullScreen && videoRef.current) {
//       videoRef.current.requestFullscreen();
//     } else {
//       document.exitFullscreen();
//     }
//     setIsFullScreen((prev) => !prev);
//   };

//   const toggleMute = () => {
//     if (stream) {
//       stream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
//       setIsMuted((prev) => !prev);
//     }
//   };

//   const toggleCamera = () => {
//     if (stream) {
//       stream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
//       setIsCameraOn((prev) => !prev);
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

//       if (!originalVideoTrack) {
//         setOriginalVideoTrack(stream.getVideoTracks()[0]);
//       }

//       sender.replaceTrack(screenTrack);
//       videoRef.current.srcObject = new MediaStream([screenTrack, ...stream.getAudioTracks()]);
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
//           socket.emit("ice-candidate", {
//             streamId: firebaseUser.uid,
//             candidate: event.candidate,
//           });
//         }
//       };

//       const offer = await peerConnectionRef.current.createOffer();
//       await peerConnectionRef.current.setLocalDescription(offer);

//       socket.emit("offer", {
//         streamId: firebaseUser.uid,
//         offer,
//       });

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
//     if (videoRef.current) videoRef.current.srcObject = null;
//     message.info("Streaming stopped");

//     socket.emit("stop-stream", {
//       streamerId: firebaseUser ? firebaseUser.uid : "Guest",
//     });
//   };

//   const sendMessage = () => {
//     if (messageInput.trim()) {
//       const chatData = {
//         streamId: firebaseUser ? firebaseUser.uid : "Guest",
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
//             <video ref={videoRef} className="stream-video" autoPlay playsInline muted />
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


// StartStreaming.jsx
import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setIsStreaming, setStreamTitle } from "../../store/streamSlice";
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
  const isStreaming = useSelector((state) => state.stream.isStreaming);
  const streamTitle = useSelector((state) => state.stream.streamTitle);

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

  const peerConnectionRef = useRef(null);
  const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  useEffect(() => {
    socket.on("chat-message", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("answer", async ({ answer }) => {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    });
    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Error adding ICE candidate:", e);
      }
    });

    return () => {
      socket.off("chat-message");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isStreaming) {
        stopStream();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isStreaming]);

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
      const sender = peerConnectionRef.current
        ?.getSenders()
        .find((s) => s.track.kind === "video");

      if (!sender) return;

      if (!originalVideoTrack) {
        setOriginalVideoTrack(stream.getVideoTracks()[0]);
      }

      sender.replaceTrack(screenTrack);
      videoRef.current.srcObject = new MediaStream([screenTrack, ...stream.getAudioTracks()]);
      setIsScreenSharing(true);

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
      dispatch(setIsStreaming(true));
      message.success("Streaming started");

      peerConnectionRef.current = new RTCPeerConnection(servers);
      mediaStream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, mediaStream);
      });

      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            streamId: firebaseUser.uid,
            candidate: event.candidate,
          });
        }
      };

      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      socket.emit("offer", {
        streamId: firebaseUser.uid,
        offer,
      });

      socket.emit("start-stream", {
        streamTitle,
        streamerId: firebaseUser ? firebaseUser.uid : "Guest",
        streamerName: firebaseUser?.displayName || "Guest",
        profilePic: firebaseUser?.photoURL || null,
      });
    } catch (err) {
      console.error("Stream start error:", err);
      setError("Failed to access camera/mic.");
      message.error("Permission denied or no camera/mic available.");
    }
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setStream(null);
    setOriginalVideoTrack(null);
    dispatch(setIsStreaming(false));
    setIsCameraOn(true);
    setIsMuted(false);
    setIsScreenSharing(false);
    if (videoRef.current) videoRef.current.srcObject = null;
    message.info("Streaming stopped");

    socket.emit("stop-stream", {
      streamerId: firebaseUser ? firebaseUser.uid : "Guest",
    });
  };

  const sendMessage = () => {
    if (messageInput.trim()) {
      const chatData = {
        streamId: firebaseUser ? firebaseUser.uid : "Guest",
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
      <Col xs={24} md={16}>
        <Card bordered={false} className="stream-card">
          <Title level={3} className="stream-title">Start Live Streaming</Title>
          <Space direction="vertical" size="large" className="stream-controls">
            <Input
              placeholder="Enter Stream Title"
              value={streamTitle}
              onChange={(e) => dispatch(setStreamTitle(e.target.value))}
              size="large"
            />
            <video ref={videoRef} className="stream-video" autoPlay playsInline muted />
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
        )}
      </Col>
    </Row>
  );
};

export default StartStreaming;
