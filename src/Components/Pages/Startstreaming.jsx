// // // // StartStreaming.jsx
// // // import React, { useEffect, useRef, useState } from "react";
// // // import { useSelector, useDispatch } from "react-redux";
// // // import { setIsStreaming, setStreamTitle } from "../Redux/streamSlice.js";
// // // import { Button, Card, Space, message, Typography, Input, Row, Col, List } from "antd";
// // // import {
// // //   VideoCameraOutlined,
// // //   StopOutlined,
// // //   SendOutlined,
// // //   FullscreenOutlined,
// // //   FullscreenExitOutlined,
// // //   SoundOutlined,
// // //   SoundFilled,
// // //   VideoCameraOutlined as CameraOnIcon,
// // //   VideoCameraAddOutlined as CameraOffIcon,
// // //   DesktopOutlined,
// // // } from "@ant-design/icons";
// // // import socket from "../../socket";
// // // import "./Startstreaming.css";

// // // const { Title } = Typography;

// // // const StartStreaming = () => {
// // //   const dispatch = useDispatch();
// // //   const firebaseUser = useSelector((state) => state.user.firebaseUser);
// // //   const isStreaming = useSelector((state) => state.stream.isStreaming);
// // //   const streamTitle = useSelector((state) => state.stream.streamTitle);

// // //   const videoRef = useRef(null);
// // //   const chatEndRef = useRef(null);

// // //   const [stream, setStream] = useState(null);
// // //   const [originalVideoTrack, setOriginalVideoTrack] = useState(null);
// // //   const [error, setError] = useState("");
// // //   const [messages, setMessages] = useState([]);
// // //   const [messageInput, setMessageInput] = useState("");
// // //   const [isFullScreen, setIsFullScreen] = useState(false);
// // //   const [isMuted, setIsMuted] = useState(false);
// // //   const [isCameraOn, setIsCameraOn] = useState(true);
// // //   const [isScreenSharing, setIsScreenSharing] = useState(false);
// // //   const [viewerCount, setViewerCount] = useState(0); // <-- viewer count state

// // //   const peerConnectionRef = useRef(null);
// // //   const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

// // //   useEffect(() => {
// // //     socket.on("chat-message", (msg) => setMessages((prev) => [...prev, msg]));
// // //     socket.on("answer", async ({ answer }) => {
// // //       await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
// // //     });
// // //     socket.on("ice-candidate", async ({ candidate }) => {
// // //       try {
// // //         await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
// // //       } catch (e) {
// // //         console.error("Error adding ICE candidate:", e);
// // //       }
// // //     });

// // //     // Listen for updated streams to update viewer count
// // //     socket.on("update-streams", (streams) => {
// // //       const myStream = streams.find((s) => s.streamerId === firebaseUser?.uid);
// // //       if (myStream) {
// // //         setViewerCount(myStream.viewers || 0);
// // //       }
// // //     });

// // //     return () => {
// // //       socket.off("chat-message");
// // //       socket.off("answer");
// // //       socket.off("ice-candidate");
// // //       socket.off("update-streams"); // Updated cleanup
// // //     };
// // //   }, [firebaseUser]);

// // //   useEffect(() => {
// // //     if (chatEndRef.current) {
// // //       chatEndRef.current.scrollIntoView({ behavior: "smooth" });
// // //     }
// // //   }, [messages]);

// // //   useEffect(() => {
// // //     const handleBeforeUnload = () => {
// // //       if (isStreaming) {
// // //         stopStream();
// // //       }
// // //     };
// // //     window.addEventListener("beforeunload", handleBeforeUnload);
// // //     return () => window.removeEventListener("beforeunload", handleBeforeUnload);
// // //   }, [isStreaming]);

// // //   useEffect(() => {
// // //   if (isStreaming && !peerConnectionRef.current) {
// // //     rejoinStream();
// // //   }
// // // }, [isStreaming]);


// // //   const toggleFullScreen = () => {
// // //     if (!isFullScreen && videoRef.current) {
// // //       videoRef.current.requestFullscreen();
// // //     } else {
// // //       document.exitFullscreen();
// // //     }
// // //     setIsFullScreen((prev) => !prev);
// // //   };

// // //   const toggleMute = () => {
// // //     if (stream) {
// // //       stream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
// // //       setIsMuted((prev) => !prev);
// // //     }
// // //   };

// // //   const toggleCamera = () => {
// // //     if (stream) {
// // //       stream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
// // //       setIsCameraOn((prev) => !prev);
// // //     }
// // //   };

// // //   const toggleScreenShare = async () => {
// // //     try {
// // //       const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
// // //       const screenTrack = screenStream.getVideoTracks()[0];
// // //       const sender = peerConnectionRef.current
// // //         ?.getSenders()
// // //         .find((s) => s.track.kind === "video");

// // //       if (!sender) return;

// // //       if (!originalVideoTrack) {
// // //         setOriginalVideoTrack(stream.getVideoTracks()[0]);
// // //       }

// // //       sender.replaceTrack(screenTrack);
// // //       videoRef.current.srcObject = new MediaStream([screenTrack, ...stream.getAudioTracks()]);
// // //       setIsScreenSharing(true);

// // //       screenTrack.onended = () => {
// // //         if (originalVideoTrack) {
// // //           sender.replaceTrack(originalVideoTrack);
// // //           videoRef.current.srcObject = stream;
// // //         }
// // //         setIsScreenSharing(false);
// // //       };
// // //     } catch (err) {
// // //       console.error("Error sharing screen:", err);
// // //       message.error("Screen sharing failed");
// // //     }
// // //   };

// // //   const startStream = async () => {
// // //     if (!streamTitle.trim()) {
// // //       message.warning("Please enter a stream title.");
// // //       return;
// // //     }
// // //     try {
// // //       const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
// // //       videoRef.current.srcObject = mediaStream;
// // //       setStream(mediaStream);
// // //       setOriginalVideoTrack(mediaStream.getVideoTracks()[0]);
// // //       dispatch(setIsStreaming(true));
// // //       message.success("Streaming started");

// // //       peerConnectionRef.current = new RTCPeerConnection(servers);
// // //       mediaStream.getTracks().forEach((track) => {
// // //         peerConnectionRef.current.addTrack(track, mediaStream);
// // //       });

// // //       peerConnectionRef.current.onicecandidate = (event) => {
// // //         if (event.candidate) {
// // //           socket.emit("ice-candidate", {
// // //             streamId: firebaseUser.uid,
// // //             candidate: event.candidate,
// // //           });
// // //         }
// // //       };

// // //       const offer = await peerConnectionRef.current.createOffer();
// // //       await peerConnectionRef.current.setLocalDescription(offer);

// // //       socket.emit("offer", {
// // //         streamId: firebaseUser.uid,
// // //         offer,
// // //       });

// // //       socket.emit("start-stream", {
// // //         streamTitle,
// // //         streamerId: firebaseUser ? firebaseUser.uid : "Guest",
// // //         streamerName: firebaseUser?.displayName || "Guest",
// // //         profilePic: firebaseUser?.photoURL || null,
// // //       });
// // //     } catch (err) {
// // //       console.error("Stream start error:", err);
// // //       setError("Failed to access camera/mic.");
// // //       message.error("Permission denied or no camera/mic available.");
// // //     }
// // //   };

// // //   const stopStream = () => {
// // //     if (stream) {
// // //       stream.getTracks().forEach((track) => track.stop());
// // //     }
// // //     if (peerConnectionRef.current) {
// // //       peerConnectionRef.current.close();
// // //       peerConnectionRef.current = null;
// // //     }
// // //     setStream(null);
// // //     setOriginalVideoTrack(null);
// // //     dispatch(setIsStreaming(false));
// // //     setIsCameraOn(true);
// // //     setIsMuted(false);
// // //     setIsScreenSharing(false);
// // //     setViewerCount(0);
// // //     if (videoRef.current) videoRef.current.srcObject = null;
// // //     message.info("Streaming stopped");

// // //     socket.emit("stop-stream", {
// // //       streamerId: firebaseUser ? firebaseUser.uid : "Guest",
// // //     });
// // //   };

// // //   const sendMessage = () => {
// // //     if (messageInput.trim()) {
// // //       const chatData = {
// // //         streamId: firebaseUser ? firebaseUser.uid : "Guest",
// // //         userId: firebaseUser ? firebaseUser.uid : "Guest",
// // //         username: firebaseUser ? firebaseUser.displayName : "Guest",
// // //         message: messageInput,
// // //         time: new Date().toLocaleTimeString(),
// // //       };
// // //       socket.emit("chat-message", chatData);
// // //       setMessageInput("");
// // //     }
// // //   };

// // //   return (
// // //     <Row justify="center" align="middle" className="start-streaming-container">
// // //       <Col xs={24} md={16}>
// // //         <Card bordered={false} className="stream-card">
// // //           <Title level={3} className="stream-title">
// // //             Start Live Streaming {isStreaming && `• ${viewerCount} watching`}
// // //           </Title>
// // //           <Space direction="vertical" size="large" className="stream-controls">
// // //             <Input
// // //               placeholder="Enter Stream Title"
// // //               value={streamTitle}
// // //               onChange={(e) => dispatch(setStreamTitle(e.target.value))}
// // //               size="large"
// // //             />
// // //             <video ref={videoRef} className="stream-video" autoPlay playsInline muted />
// // //             {error && <p className="error-text">{error}</p>}
// // //             <Space>
// // //               {!isStreaming ? (
// // //                 <Button type="primary" icon={<VideoCameraOutlined />} size="large" onClick={startStream}>
// // //                   Start Streaming
// // //                 </Button>
// // //               ) : (
// // //                 <Button type="danger" icon={<StopOutlined />} size="large" onClick={stopStream}>
// // //                   Stop Streaming
// // //                 </Button>
// // //               )}
// // //             </Space>
// // //             {isStreaming && (
// // //               <Space style={{ marginTop: 10 }}>
// // //                 <Button onClick={toggleFullScreen}>
// // //                   {isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
// // //                 </Button>
// // //                 <Button onClick={toggleMute}>
// // //                   {isMuted ? <SoundOutlined /> : <SoundFilled />}
// // //                 </Button>
// // //                 <Button onClick={toggleCamera}>
// // //                   {isCameraOn ? <CameraOnIcon /> : <CameraOffIcon />}
// // //                 </Button>
// // //                 <Button onClick={toggleScreenShare} icon={<DesktopOutlined />}>
// // //                   Share Screen
// // //                 </Button>
// // //               </Space>
// // //             )}
// // //           </Space>
// // //         </Card>
// // //       </Col>

// // //       <Col xs={24} md={8}>
// // //         {isStreaming && (
// // //           <Card className="chat-box">
// // //             <Title level={4} className="chat-title">Live Chat</Title>
// // //             <List
// // //               className="chat-messages"
// // //               dataSource={messages}
// // //               renderItem={(msg, index) => (
// // //                 <List.Item key={index}>
// // //                   <strong>{msg.username}</strong>: {msg.message}
// // //                   <em style={{ fontSize: "0.8em", color: "#999", marginLeft: "5px" }}>
// // //                     {msg.time}
// // //                   </em>
// // //                 </List.Item>
// // //               )}
// // //             />
// // //             <div ref={chatEndRef}></div>
// // //             <Space.Compact className="chat-input">
// // //               <Input
// // //                 placeholder="Type a message..."
// // //                 value={messageInput}
// // //                 onChange={(e) => setMessageInput(e.target.value)}
// // //                 onPressEnter={sendMessage}
// // //               />
// // //               <Button type="primary" icon={<SendOutlined />} onClick={sendMessage} />
// // //             </Space.Compact>
// // //           </Card>
// // //         )}
// // //       </Col>
// // //     </Row>
// // //   );
// // // };

// // // export default StartStreaming;


// // import React, { useEffect, useRef, useState, useCallback } from "react";
// // import { useSelector, useDispatch } from "react-redux";
// // import { setIsStreaming, setStreamTitle } from "../Redux/streamSlice.js";
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
// //   const dispatch = useDispatch();
// //   const firebaseUser = useSelector((state) => state.user.firebaseUser);
// //   const isStreaming = useSelector((state) => state.stream.isStreaming);
// //   const streamTitle = useSelector((state) => state.stream.streamTitle);

// //   const videoRef = useRef(null);
// //   const chatEndRef = useRef(null);

// //   const [stream, setStream] = useState(null);
// //   const [originalVideoTrack, setOriginalVideoTrack] = useState(null);
// //   const [error, setError] = useState("");
// //   const [messages, setMessages] = useState([]);
// //   const [messageInput, setMessageInput] = useState("");
// //   const [isFullScreen, setIsFullScreen] = useState(false);
// //   const [isMuted, setIsMuted] = useState(false);
// //   const [isCameraOn, setIsCameraOn] = useState(true);
// //   const [isScreenSharing, setIsScreenSharing] = useState(false);
// //   const [viewerCount, setViewerCount] = useState(0);

// //   const peerConnectionRef = useRef(null);
// //   const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

// //   // Rejoin logic: if streaming was active but component re-mounted (e.g., after navigation)
// //   const rejoinStream = useCallback(async () => {
// //     try {
// //       const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
// //       videoRef.current.srcObject = mediaStream;
// //       setStream(mediaStream);
// //       setOriginalVideoTrack(mediaStream.getVideoTracks()[0]);
// //       dispatch(setIsStreaming(true));
// //       message.success("Rejoined active stream");

// //       // Re-establish the peer connection
// //       peerConnectionRef.current = new RTCPeerConnection(servers);
// //       mediaStream.getTracks().forEach((track) => {
// //         peerConnectionRef.current.addTrack(track, mediaStream);
// //       });

// //       peerConnectionRef.current.onicecandidate = (event) => {
// //         if (event.candidate) {
// //           socket.emit("ice-candidate", {
// //             streamId: firebaseUser.uid,
// //             candidate: event.candidate,
// //           });
// //         }
// //       };

// //       // Emit rejoin event to backend to fetch the current stream info
// //       socket.emit("rejoin-stream", { streamerId: firebaseUser.uid });
// //     } catch (err) {
// //       console.error("Rejoin stream error:", err);
// //       setError("Failed to rejoin the stream. Please try restarting your stream.");
// //       message.error("Rejoin failed: Permission denied or no camera/mic available.");
// //     }
// //   }, [dispatch, firebaseUser, servers]);

// //   // On component mount, if streaming flag is true but stream is null, attempt rejoin
// //   useEffect(() => {
// //     if (isStreaming && !stream) {
// //       rejoinStream();
// //     }
// //   }, [isStreaming, stream, rejoinStream]);

// //   useEffect(() => {
// //     socket.on("chat-message", (msg) => setMessages((prev) => [...prev, msg]));
// //     socket.on("answer", async ({ answer }) => {
// //       await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
// //     });
// //     socket.on("ice-candidate", async ({ candidate }) => {
// //       try {
// //         await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
// //       } catch (e) {
// //         console.error("Error adding ICE candidate:", e);
// //       }
// //     });

// //     socket.on("update-streams", (streams) => {
// //       const myStream = streams.find((s) => s.streamerId === firebaseUser?.uid);
// //       if (myStream) {
// //         setViewerCount(myStream.viewers || 0);
// //       }
// //     });

// //     return () => {
// //       socket.off("chat-message");
// //       socket.off("answer");
// //       socket.off("ice-candidate");
// //       socket.off("update-streams");
// //     };
// //   }, [firebaseUser]);

// //   useEffect(() => {
// //     if (chatEndRef.current) {
// //       chatEndRef.current.scrollIntoView({ behavior: "smooth" });
// //     }
// //   }, [messages]);

// //   useEffect(() => {
// //     const handleBeforeUnload = () => {
// //       if (isStreaming) {
// //         stopStream();
// //       }
// //     };
// //     window.addEventListener("beforeunload", handleBeforeUnload);
// //     return () => window.removeEventListener("beforeunload", handleBeforeUnload);
// //   }, [isStreaming]);

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

// //       if (!originalVideoTrack) {
// //         setOriginalVideoTrack(stream.getVideoTracks()[0]);
// //       }

// //       sender.replaceTrack(screenTrack);
// //       videoRef.current.srcObject = new MediaStream([screenTrack, ...stream.getAudioTracks()]);
// //       setIsScreenSharing(true);

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
// //       dispatch(setIsStreaming(true));
// //       message.success("Streaming started");

// //       peerConnectionRef.current = new RTCPeerConnection(servers);
// //       mediaStream.getTracks().forEach((track) => {
// //         peerConnectionRef.current.addTrack(track, mediaStream);
// //       });

// //       peerConnectionRef.current.onicecandidate = (event) => {
// //         if (event.candidate) {
// //           socket.emit("ice-candidate", {
// //             streamId: firebaseUser.uid,
// //             candidate: event.candidate,
// //           });
// //         }
// //       };

// //       const offer = await peerConnectionRef.current.createOffer();
// //       await peerConnectionRef.current.setLocalDescription(offer);

// //       socket.emit("offer", {
// //         streamId: firebaseUser.uid,
// //         offer,
// //       });

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
// //     dispatch(setIsStreaming(false));
// //     setIsCameraOn(true);
// //     setIsMuted(false);
// //     setIsScreenSharing(false);
// //     setViewerCount(0);
// //     if (videoRef.current) videoRef.current.srcObject = null;
// //     message.info("Streaming stopped");

// //     socket.emit("stop-stream", {
// //       streamerId: firebaseUser ? firebaseUser.uid : "Guest",
// //     });
// //   };

// //   const sendMessage = () => {
// //     if (messageInput.trim()) {
// //       const chatData = {
// //         streamId: firebaseUser ? firebaseUser.uid : "Guest",
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
// //           <Title level={3} className="stream-title">
// //             Start Live Streaming {isStreaming && `• ${viewerCount} watching`}
// //           </Title>
// //           <Space direction="vertical" size="large" className="stream-controls">
// //             <Input
// //               placeholder="Enter Stream Title"
// //               value={streamTitle}
// //               onChange={(e) => dispatch(setStreamTitle(e.target.value))}
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
// import React, { useEffect, useRef, useState, useCallback } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { setIsStreaming, setStreamTitle } from "../Redux/streamSlice.js";
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
//   const dispatch = useDispatch();
//   const firebaseUser = useSelector((state) => state.user.firebaseUser);
//   const isStreaming = useSelector((state) => state.stream.isStreaming);
//   const streamTitle = useSelector((state) => state.stream.streamTitle);

//   const videoRef = useRef(null);
//   const chatEndRef = useRef(null);

//   const [stream, setStream] = useState(null);
//   const [originalVideoTrack, setOriginalVideoTrack] = useState(null);
//   const [error, setError] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [messageInput, setMessageInput] = useState("");
//   const [isFullScreen, setIsFullScreen] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isCameraOn, setIsCameraOn] = useState(true);
//   const [isScreenSharing, setIsScreenSharing] = useState(false);
//   const [viewerCount, setViewerCount] = useState(0); // <-- viewer count state

//   const peerConnectionRef = useRef(null);
//   const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

//   // --- Socket Listeners ---
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

//     // Listen for updated streams to update viewer count
//     socket.on("update-streams", (streams) => {
//       const myStream = streams.find((s) => s.streamerId === firebaseUser?.uid);
//       if (myStream) {
//         setViewerCount(myStream.viewers || 0);
//       }
//     });

//     // Listen for stream-info on rejoin (to restore chat messages and other data if needed)
//     socket.on("stream-info", (data) => {
//       if (data) {
//         // Optionally, you can restore chat messages:
//         setMessages(data.chatMessages || []);
//         // And update viewer count:
//         setViewerCount(data.viewers || 0);
//       }
//     });

//     return () => {
//       socket.off("chat-message");
//       socket.off("answer");
//       socket.off("ice-candidate");
//       socket.off("update-streams");
//       socket.off("stream-info");
//     };
//   }, [firebaseUser]);

//   useEffect(() => {
//     if (chatEndRef.current) {
//       chatEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   useEffect(() => {
//     const handleBeforeUnload = () => {
//       if (isStreaming) {
//         stopStream();
//       }
//     };
//     window.addEventListener("beforeunload", handleBeforeUnload);
//     return () => window.removeEventListener("beforeunload", handleBeforeUnload);
//   }, [isStreaming]);

//   // --- Rejoin Logic ---
//   const rejoinStream = useCallback(async () => {
//     try {
//       // Reacquire media stream (camera and mic)
//       const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//       videoRef.current.srcObject = mediaStream;
//       setStream(mediaStream);
//       // Reinitialize peer connection and add media tracks
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
//       // Emit rejoin-stream event to the server so that the server can send back the current stream state
//       socket.emit("rejoin-stream", { streamerId: firebaseUser.uid });
//       message.success("Rejoined the live stream.");
//     } catch (err) {
//       console.error("Rejoin stream error:", err);
//       message.error("Failed to rejoin the stream.");
//     }
//   }, [firebaseUser, servers]);

//   useEffect(() => {
//     if (isStreaming && !peerConnectionRef.current) {
//       // When streaming is active but no peer connection exists, attempt to rejoin
//       rejoinStream();
//     }
//   }, [isStreaming, rejoinStream]);

//   // --- UI Controls ---
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

//   // --- Start & Stop Streaming ---
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
//       dispatch(setIsStreaming(true));
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
//     dispatch(setIsStreaming(false));
//     setIsCameraOn(true);
//     setIsMuted(false);
//     setIsScreenSharing(false);
//     setViewerCount(0);
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
//           <Title level={3} className="stream-title">
//             Start Live Streaming {isStreaming && `• ${viewerCount} watching`}
//           </Title>
//           <Space direction="vertical" size="large" className="stream-controls">
//             <Input
//               placeholder="Enter Stream Title"
//               value={streamTitle}
//               onChange={(e) => dispatch(setStreamTitle(e.target.value))}
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
  const [viewerCount, setViewerCount] = useState(0);

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

  const rejoinStream = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);

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

      socket.emit("rejoin-stream", { streamerId: firebaseUser.uid });
      message.success("Rejoined the live stream.");
    } catch (err) {
      console.error("Rejoin stream error:", err);
      message.error("Failed to rejoin the stream.");
    }
  }, [firebaseUser, servers]);

  useEffect(() => {
    if (isStreaming && !peerConnectionRef.current) {
      rejoinStream();
    }
  }, [isStreaming, rejoinStream]);

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
    setViewerCount(0);
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
        role: "Streamer", // ✅ Role added
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
          <Title level={3} className="stream-title">
            Start Live Streaming {isStreaming && `• ${viewerCount} watching`}
          </Title>
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
                  <strong>
                    {msg.username}
                    {msg.role === "Streamer" && (
                      <span style={{ color: "purple", marginLeft: "5px" }}>(Streamer)</span>
                    )}
                  </strong>
                  : {msg.message}
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
