// import React, { useEffect, useRef, useState } from "react";
// import { useParams } from "react-router-dom";
// import { Card, Typography, message, Input, Button, List, Space, Tooltip } from "antd";
// import socket from "../../socket";
// import "./WatchStream.css";
// import { SendOutlined, CopyOutlined } from "@ant-design/icons";

// const { Title, Paragraph } = Typography;

// const WatchStream = () => {
//   const { id } = useParams();
//   const videoRef = useRef(null);
//   const chatEndRef = useRef(null);
//   const [streamInfo, setStreamInfo] = useState(null);
//   const [error, setError] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [messageInput, setMessageInput] = useState("");
//   const peerConnectionRef = useRef(null);

//   const servers = {
//     iceServers: [
//       { urls: "stun:global.xirsys.net" },
//       {
//         urls: "turn:global.xirsys.net:3478?transport=udp",
//         username: "Manikanta",
//         credential: "786edebc-19dc-11f0-8c4a-0242ac130003",
//       },
//       {
//         urls: "turn:global.xirsys.net:3478?transport=tcp",
//         username: "Manikanta",
//         credential: "786edebc-19dc-11f0-8c4a-0242ac130003",
//       },
//     ],
//   };

//   useEffect(() => {
//     socket.emit("join-stream", { streamId: id });
//     socket.emit("get-stream-info", { streamId: id });

//     socket.on("stream-info", (data) => {
//       if (data) {
//         setStreamInfo(data);
//         message.success(`Joined stream: ${data.streamTitle}`);
//         setupPeerConnection();
//       } else {
//         setError("Stream not found or ended.");
//       }
//     });

//     socket.on("stream-ended", () => {
//       setError("The stream has ended.");
//       if (videoRef.current) videoRef.current.srcObject = null;
//       if (peerConnectionRef.current) {
//         peerConnectionRef.current.close();
//         peerConnectionRef.current = null;
//       }
//     });

//     return () => {
//       socket.off("stream-info");
//       socket.off("stream-ended");
//       socket.off("offer");
//       socket.off("ice-candidate");
//       socket.off("chat-message");
//       if (peerConnectionRef.current) {
//         peerConnectionRef.current.close();
//         peerConnectionRef.current = null;
//       }
//     };
//   }, [id]);

//   const setupPeerConnection = () => {
//     console.log("VIEWER: Setting up PeerConnection for streamId:", id);
//     peerConnectionRef.current = new RTCPeerConnection(servers);

//     peerConnectionRef.current.oniceconnectionstatechange = () => {
//       console.log("ICE connection state:", peerConnectionRef.current.iceConnectionState);
//     };

//     peerConnectionRef.current.onconnectionstatechange = () => {
//       console.log("Overall connection state:", peerConnectionRef.current.connectionState);
//     };

//     peerConnectionRef.current.ontrack = (event) => {
//       console.log("Received track:", event.streams[0]);
//       if (videoRef.current) {
//         videoRef.current.srcObject = event.streams[0];
//       }
//     };

//     peerConnectionRef.current.onicecandidate = (event) => {
//       if (event.candidate) {
//         console.log("VIEWER: Sending ICE candidate:", event.candidate);
//         socket.emit("ice-candidate", {
//           streamId: id,
//           candidate: event.candidate,
//         });
//       }
//     };

//     socket.on("offer", async ({ offer }) => {
//       console.log("VIEWER: Received offer:", offer);
//       try {
//         await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
//         const answer = await peerConnectionRef.current.createAnswer();
//         await peerConnectionRef.current.setLocalDescription(answer);
//         console.log("VIEWER: Sending answer");
//         socket.emit("answer", { streamId: id, answer });
//       } catch (err) {
//         console.error("VIEWER: Failed to process offer:", err);
//       }
//     });

//     socket.on("ice-candidate", async ({ candidate }) => {
//       console.log("VIEWER: Received ICE candidate:", candidate);
//       try {
//         if (candidate) {
//           await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//       } catch (err) {
//         console.error("VIEWER: Failed to add ICE candidate:", err);
//       }
//     });
//   };

//   useEffect(() => {
//     socket.on("chat-message", (msg) => setMessages((prev) => [...prev, msg]));
//     return () => {
//       socket.off("chat-message");
//     };
//   }, []);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = () => {
//     if (messageInput.trim()) {
//       const chatData = {
//         streamId: id,
//         userId: "Viewer",
//         username: "Viewer",
//         message: messageInput,
//         time: new Date().toLocaleTimeString(),
//       };
//       socket.emit("chat-message", chatData);
//       setMessageInput("");
//     }
//   };

//   const handleCopyLink = () => {
//     const fullLink = `${window.location.origin}/livestreamingplatform/watch/${id}`;
//     navigator.clipboard.writeText(fullLink).then(() => {
//       message.success("Stream link copied to clipboard!");
//     });
//   };

//   return (
//     <Card style={{ margin: "20px" }}>
//       {streamInfo && !error ? (
//         <>
//           <Title level={3}>{streamInfo.streamTitle}</Title>
//           <div style={{ marginBottom: 10 }}>
//             <Paragraph
//               copyable={{ text: `${window.location.origin}/livestreamingplatform/watch/${id}` }}
//               style={{ marginBottom: 4 }}
//             >
//               <strong>🔗 Share Stream:</strong> {`${window.location.origin}/livestreamingplatform/watch/${id}`}
//             </Paragraph>
//             <Tooltip title="Copy full stream link">
//               <Button size="small" icon={<CopyOutlined />} onClick={handleCopyLink}>
//                 Copy Link
//               </Button>
//             </Tooltip>
//           </div>
//           <video
//             ref={videoRef}
//             autoPlay
//             playsInline
//             controls
//             style={{ width: "100%", backgroundColor: "#000" }}
//           />
//           <Card className="watch-chat-box" style={{ marginTop: 20 }}>
//             <Title level={4} className="chat-title">
//               Live Chat
//             </Title>
//             <List
//               className="chat-messages"
//               dataSource={messages}
//               renderItem={(msg, index) => (
//                 <List.Item key={index}>
//                   <strong>{msg.username}</strong>: {msg.message}
//                   <em style={{ fontSize: "0.8em", color: "#999", marginLeft: "5px" }}>{msg.time}</em>
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
//                 autoComplete="off"
//               />
//               <Button type="primary" icon={<SendOutlined />} onClick={sendMessage} />
//             </Space.Compact>
//           </Card>
//         </>
//       ) : (
//         <>
//           <Title level={4}>Loading stream...</Title>
//           {error && <p style={{ color: "red" }}>{error}</p>}
//         </>
//       )}
//     </Card>
//   );
// };

// export default WatchStream;


// src/components/WatchStream.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Typography,
  message,
  Input,
  Button,
  List,
  Space,
  Tooltip,
} from "antd";
import { SendOutlined, CopyOutlined } from "@ant-design/icons";
import socket from "../../socket";
import "./WatchStream.css";

const { Title, Paragraph } = Typography;

export default function WatchStream() {
  const { id } = useParams();
  const videoRef = useRef(null);
  const chatEndRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const iceServersRef = useRef([
    { urls: "stun:stun.l.google.com:19302" },
  ]);

  const [streamInfo, setStreamInfo] = useState(null);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  // 1) get ICE servers
  useEffect(() => {
    socket.on("ice-servers", (list) => {
      iceServersRef.current = list;
    });
    return () => socket.off("ice-servers");
  }, []);

  // 2) join + initial info
  useEffect(() => {
    socket.emit("join-stream", { streamId: id });
    socket.emit("get-stream-info", { streamId: id });

    socket.on("stream-info", (data) => {
      if (data) {
        setStreamInfo(data);
        message.success(`Joined stream: ${data.streamTitle}`);
        setupPeerConnection();
      } else {
        setError("Stream not found or has ended.");
      }
    });

    socket.on("stream-ended", () => {
      setError("The stream has ended.");
      if (videoRef.current) videoRef.current.srcObject = null;
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
    });

    return () => {
      socket.off("stream-info");
      socket.off("stream-ended");
      socket.off("offer");
      socket.off("ice-candidate");
      socket.off("chat-message");
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
    };
  }, [id]);

  // 3) chat listener
  useEffect(() => {
    socket.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => socket.off("chat-message");
  }, []);

  // scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // PeerConnection setup
  const setupPeerConnection = () => {
    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: iceServersRef.current,
    });

    peerConnectionRef.current.oniceconnectionstatechange = () => {
      console.log(
        "ICE state:",
        peerConnectionRef.current.iceConnectionState
      );
    };

    peerConnectionRef.current.onconnectionstatechange = () => {
      console.log(
        "Conn state:",
        peerConnectionRef.current.connectionState
      );
    };

    peerConnectionRef.current.ontrack = (evt) => {
      videoRef.current.srcObject = evt.streams[0];
    };

    peerConnectionRef.current.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", {
          streamId: id,
          candidate: e.candidate,
        });
      }
    };

    socket.on("offer", async ({ offer }) => {
      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit("answer", { streamId: id, answer });
      } catch (err) {
        console.error("Offer handling error:", err);
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (err) {
        console.error("addICE error:", err);
      }
    });
  };

  // send chat
  const sendMessage = () => {
    if (!messageInput.trim()) return;
    const chatData = {
      streamId: id,
      userId: "Viewer",
      username: "Viewer",
      message: messageInput,
      time: new Date().toLocaleTimeString(),
    };
    socket.emit("chat-message", chatData);
    setMessageInput("");
  };

  // copy link
  const handleCopy = () => {
    const link = `${window.location.origin}/livestreamingplatform/watch/${id}`;
    navigator.clipboard.writeText(link).then(() => {
      message.success("Link copied!");
    });
  };

  return (
    <Card style={{ margin: 20 }}>
      {streamInfo && !error ? (
        <>
          <Title level={3}>{streamInfo.streamTitle}</Title>
          <Paragraph copyable>
            <strong>🔗 Share:</strong>{" "}
            {`${window.location.origin}/livestreamingplatform/watch/${id}`}
          </Paragraph>
          <Tooltip title="Copy full link">
            <Button icon={<CopyOutlined />} onClick={handleCopy}>
              Copy Link
            </Button>
          </Tooltip>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            controls
            style={{ width: "100%", background: "#000" }}
          />
          <Card className="watch-chat-box" style={{ marginTop: 20 }}>
            <Title level={4}>Live Chat</Title>
            <List
              className="chat-messages"
              dataSource={messages}
              renderItem={(msg, i) => (
                <List.Item key={i}>
                  <strong>{msg.username}</strong>: {msg.message}{" "}
                  <em style={{ marginLeft: 5, fontSize: 12, color: "#666" }}>
                    {msg.time}
                  </em>
                </List.Item>
              )}
            />
            <div ref={chatEndRef} />
            <Space.Compact className="chat-input" style={{ marginTop: 8 }}>
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onPressEnter={sendMessage}
                autoComplete="off"
              />
              <Button icon={<SendOutlined />} onClick={sendMessage} />
            </Space.Compact>
          </Card>
        </>
      ) : (
        <>
          <Title level={4}>Loading…</Title>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </>
      )}
    </Card>
  );
}
