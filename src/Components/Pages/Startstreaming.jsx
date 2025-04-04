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




// LiveStreamingPlatform.jsx
import React, { useEffect, useState } from "react";
import { Layout, Menu, Input, Button, Avatar, Row, Col, Typography, Space, Badge } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { setFirebaseUser, logoutUser } from "../Redux/Store";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  VideoCameraOutlined,
  UserOutlined,
  BellOutlined,
  FireOutlined,
} from "@ant-design/icons";
import Logo from "../../assets/logo1.png";
import "./Main.css";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const { Header, Sider, Content, Footer } = Layout;
const { Title } = Typography;
const { Search } = Input;

const LiveStreamingPlatform = () => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const [selectedKey, setSelectedKey] = useState("/livestreamingplatform");
  const auth = getAuth();
  const dispatch = useDispatch();
  const firebaseUser = useSelector((state) => state.user.firebaseUser);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSelectedKey(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(
          setFirebaseUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL || null,
          })
        );
      } else {
        dispatch(setFirebaseUser(null));
      }
    });
    return () => unsubscribe();
  }, [auth, dispatch]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logoutUser());
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const channels = [
    { id: "channel1", name: "Channel 1" },
    { id: "channel2", name: "Channel 2" },
    { id: "channel3", name: "Channel 3" },
    { id: "channel4", name: "Channel 4" },
    { id: "channel5", name: "Channel 5" },
    { id: "channel6", name: "Channel 6" },
  ];

  return (
    <Layout className="live-streaming-layout">
      <Sider trigger={null} collapsible collapsed={collapsed} className="custom-sider">
        <div className="demo-logo-vertical">
          <img src={Logo} alt="Logo" className="logo-img" />
          {!collapsed && (
            <Title level={4} className="logo-text" style={{ color: "white" }}>
              Touch Live
            </Title>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => navigate(key)}
          items={[
            { key: "/livestreamingplatform", icon: <HomeOutlined />, label: "Browse" },
            { key: "/livestreamingplatform/stream/:id", icon: <VideoCameraOutlined />, label: "Start Streaming" },
            { key: "/livestreamingplatform/following", icon: <FireOutlined />, label: "Following" },
            { key: "/livestreamingplatform/profile", icon: <UserOutlined />, label: "Profile" },
          ]}
        />
        {!collapsed && (
          <div className="recommended-section">
            <Title level={5} className="recommended-title" style={{ color: "white" }}>
              RECOMMENDED
            </Title>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[selectedKey]}
              onClick={({ key }) => navigate(key)}
              items={channels.map((channel) => ({
                key: `/livestreamingplatform/channel/${channel.id}`,
                icon: <Avatar size="small" icon={<UserOutlined />} style={{ color: "white" }} />,
                label: channel.name,
              }))}
            />
            <div className="auth-button-container" style={{ padding: "16px", textAlign: "center" }}>
              {firebaseUser ? (
                <Button type="primary" danger block onClick={handleLogout}>
                  Logout
                </Button>
              ) : (
                <Button type="primary" block onClick={() => navigate("/login")}>
                  Login
                </Button>
              )}
            </div>
          </div>
        )}
      </Sider>
      <Layout>
        <Header className="custom-header">
          <Row align="middle" justify="space-between" className="header-row" style={{ width: "100%" }}>
            <Col flex="none">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="toggle-btn"
              />
            </Col>
            <Col flex="auto" style={{ display: "flex", justifyContent: "center" }}>
              <Search
                placeholder="Search streams..."
                size="large"
                enterButton
                className="search-input"
                style={{ width: "100%", maxWidth: "400px" }}
              />
            </Col>
            <Col flex="none">
              <Space size="large">
                {firebaseUser ? (
                  <Avatar src={firebaseUser.photoURL} icon={!firebaseUser.photoURL && <UserOutlined />} alt="Profile" />
                ) : (
                  <Avatar icon={<UserOutlined />} />
                )}
                <Badge count={3}>
                  <BellOutlined style={{ fontSize: "20px", color: "#fff" }} />
                </Badge>
              </Space>
            </Col>
          </Row>
        </Header>
        <Content className="custom-content">
          <Outlet />
        </Content>
        <Footer className="custom-footer">© 2025 Touch Live. All Rights Reserved.</Footer>
      </Layout>
    </Layout>
  );
};

export default LiveStreamingPlatform;
