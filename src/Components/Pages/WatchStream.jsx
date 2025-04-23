// import React, { useEffect, useRef, useState } from "react";
// import { useParams } from "react-router-dom";
// import { Card, Typography, message, Input, Button, List, Space, Tooltip } from "antd";
// import { SendOutlined, CopyOutlined } from "@ant-design/icons";
// import socket from "../../socket";
// import "./WatchStream.css";

// const { Title, Paragraph } = Typography;

// const WatchStream = () => {
//   const { id } = useParams();
//   const videoRef = useRef(null);
//   const chatEndRef = useRef(null);
//   const peerConnectionRef = useRef(null);

//   const [streamInfo, setStreamInfo] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [messageInput, setMessageInput] = useState("");
//   const [error, setError] = useState("");


//   const ICE_SERVERS = {
//     iceServers: [
//       { urls: "stun:stun.l.google.com:19302" },         
//       { urls: "stun:global.xirsys.net:3478" },         
//       {                                                
//         urls: "turn:global.xirsys.net:3478?transport=udp",
//         username: "Mani",
//         credential: "71742688-1f41-11f0-8c62-0242ac130003",
//       },
//       {                                                
//         urls: "turn:global.xirsys.net:3478?transport=tcp",
//         username: "Mani",
//         credential: "71742688-1f41-11f0-8c62-0242ac130003",
//       },
//       {                                                
//         urls: "turns:global.xirsys.net:443?transport=tcp",
//         username: "Mani",
//         credential: "71742688-1f41-11f0-8c62-0242ac130003",
//       },
//     ],
//   };
  

//   const setupPeerConnection = (streamerSocketId) => {
//     if (peerConnectionRef.current) return;

//     const pc = new RTCPeerConnection(ICE_SERVERS);
//     peerConnectionRef.current = pc;
//     {
//       const pc = peerConnectionRef.current;
//       pc.onicegatheringstatechange = () =>
//         console.log("[WebRTC][start] gathering state:", pc.iceGatheringState);
//       pc.oniceconnectionstatechange = () =>
//         console.log("[WebRTC][start] ice state:", pc.iceConnectionState);
//     }

//     pc.onicecandidate = (e) => {
//       if (e.candidate && streamerSocketId) {
//         console.log("[WebRTC] sending ICE to streamer:", e.candidate);
//         socket.emit("ice-candidate", {
//           streamId: id,
//           candidate: e.candidate,
//           target: streamerSocketId,
//         });
//       } else {
//         console.warn("[WebRTC] ICE candidate not sent; no streamerSocketId");
//       }
//     };

//     pc.ontrack = (event) => {
//       console.log("[WebRTC] track received:", event.streams);
//       if (event.streams[0] && videoRef.current) {
//         videoRef.current.srcObject = event.streams[0];
//       }
//     };

//     pc.onconnectionstatechange = () => {
//       console.log("[WebRTC] connectionState:", pc.connectionState);
//     };

//     socket.on("offer", async ({ offer, from }) => {
//       console.log("[Socket] offer from streamer:", offer);
//       try {
//         await pc.setRemowteDescription(new RTCSessionDescription(offer));
//         const answer = await pc.createAnswer();
//         if (pc.signalingState === "have-remote-offer") {
//           await pc.setLocalDescription(answer);
//           console.log("[WebRTC] created & set local answer:", answer);
//           socket.emit("answer", { streamId: id, answer, target: from });
//         }
//       } catch (err) {
//         console.error("[WebRTC] error handling offer:", err);
//       }
//     });

//     socket.on("ice-candidate", async ({ candidate }) => {
//       try {
//         await pc.addIceCandidate(new RTCIceCandidate(candidate));
//         console.log("[WebRTC] added ICE from streamer:", candidate);
//       } catch (e) {
//         console.error("[WebRTC] addIceCandidate failed:", e);
//       }
//     });
//   };

//   useEffect(() => {
//     socket.emit("join-stream", { streamId: id });
//     console.log("[Socket] join-stream emitted:", id);

//     socket.on("stream-info", (data) => {
//       if (!data) {
//         setError("Stream not found or has ended.");
//         return;
//       }
//       setStreamInfo(data);
//       message.success(`Joined stream: ${data.streamTitle}`);
//       console.log("[Socket] received stream-info:", data);
//       setupPeerConnection(data.streamerSocketId);
//     });

//     socket.on("stop-stream", () => {
//       setError("The stream has been stopped.");
//       cleanupStream();
//     });

//     socket.on("stream-ended", () => {
//       setError("The stream has ended.");
//       cleanupStream();
//     });

//     return () => {
//       socket.emit("leave-stream", { streamId: id });
//       socket.off("stream-info");
//       socket.off("stop-stream");
//       socket.off("stream-ended");
//       socket.off("offer");
//       socket.off("ice-candidate");
//       cleanupStream();
//     };
//   }, [id]);

//   const cleanupStream = () => {
//     if (videoRef.current) videoRef.current.srcObject = null;
//     if (peerConnectionRef.current) {
//       peerConnectionRef.current.close();
//       peerConnectionRef.current = null;
//     }
//   };

//   useEffect(() => {
//     socket.on("chat-message", (msg) => {
//       console.log("[Socket] chat-message:", msg);
//       setMessages((prev) => [...prev, msg]);
//     });
//     return () => socket.off("chat-message");
//   }, []);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = () => {
//     if (!messageInput.trim()) return;
//     socket.emit("chat-message", {
//       streamId: id,
//       userId: "Viewer",
//       username: "Viewer",
//       message: messageInput,
//       time: new Date().toLocaleTimeString(),
//     });
//     setMessageInput("");
//   };

//   const handleCopyLink = () => {
//     const link = `${window.location.origin}/livestreamingplatform/watch/${id}`;
//     navigator.clipboard.writeText(link).then(() => message.success("Copied link!"));
//   };

//   return (
//     <Card style={{ margin: "20px" }}>
//       {streamInfo && !error ? (
//         <>
//           <Title level={3}>{streamInfo.streamTitle}</Title>
//           <div style={{ marginBottom: 10 }}>
//             <Paragraph
//               copyable={{
//                 text: `${window.location.origin}/livestreamingplatform/watch/${id}`,
//               }}
//               style={{ marginBottom: 4 }}
//             >
//               <strong>🔗 Share Stream:</strong>{" "}
//               {`${window.location.origin}/livestreamingplatform/watch/${id}`}
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
//               renderItem={(msg, i) => (
//                 <List.Item key={i}>
//                   <strong>{msg.username}</strong>: {msg.message}{" "}
//                   <em style={{ fontSize: "0.8em", color: "#999", marginLeft: 5 }}>
//                     {msg.time}
//                   </em>
//                 </List.Item>
//               )}
//             />
//             <div ref={chatEndRef} />
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
//           <Title level={4}>Loading stream…</Title>
//           {error && <p style={{ color: "red" }}>{error}</p>}
//         </>
//       )}
//     </Card>
//   );
// };

// export default WatchStream;




// WatchStream.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";          // ← import useNavigate
import { Card, Typography, message, Input, Button, List, Space, Tooltip } from "antd";
import { SendOutlined, CopyOutlined, LogoutOutlined } from "@ant-design/icons";  // ← import LogoutOutlined
import socket from "../../socket";
import "./WatchStream.css";

const { Title, Paragraph } = Typography;

const WatchStream = () => {
  const { id } = useParams();
  const navigate = useNavigate();                                    // ← initialize navigate
  const videoRef = useRef(null);
  const chatEndRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const [streamInfo, setStreamInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [error, setError] = useState("");

  const ICE_SERVERS = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:global.xirsys.net:3478" },
      {
        urls: "turn:global.xirsys.net:3478?transport=udp",
        username: "Mani",
        credential: "71742688-1f41-11f0-8c62-0242ac130003",
      },
      {
        urls: "turn:global.xirsys.net:3478?transport=tcp",
        username: "Mani",
        credential: "71742688-1f41-11f0-8c62-0242ac130003",
      },
      {
        urls: "turns:global.xirsys.net:443?transport=tcp",
        username: "Mani",
        credential: "71742688-1f41-11f0-8c62-0242ac130003",
      },
    ],
  };

  const setupPeerConnection = (streamerSocketId) => {
    if (peerConnectionRef.current) return;

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    // Log ICE states
    pc.onicegatheringstatechange = () =>
      console.log("[WebRTC][watcher] gathering state:", pc.iceGatheringState);
    pc.oniceconnectionstatechange = () =>
      console.log("[WebRTC][watcher] ice state:", pc.iceConnectionState);

    pc.onicecandidate = (e) => {
      if (e.candidate && streamerSocketId) {
        socket.emit("ice-candidate", {
          streamId: id,
          candidate: e.candidate,
          target: streamerSocketId,
        });
      }
    };

    pc.ontrack = (event) => {
      if (videoRef.current && event.streams[0]) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle offer → answer
    socket.on("offer", async ({ offer, from }) => {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        if (pc.signalingState === "have-remote-offer") {
          await pc.setLocalDescription(answer);
          socket.emit("answer", { streamId: id, answer, target: from });
        }
      } catch (err) {
        console.error("[WebRTC] error handling offer:", err);
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("[WebRTC] addIceCandidate failed:", e);
      }
    });
  };

  // Clean up PC + video
  const cleanupStream = () => {
    if (videoRef.current) videoRef.current.srcObject = null;
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  // Emit leave + cleanup + navigate away
  const leaveStream = () => {
    socket.emit("leave-stream", { streamId: id });
    cleanupStream();
    message.info("Left the stream");
    navigate("/browse");  // ← adjust to your browse or home route
  };

  useEffect(() => {
    socket.emit("join-stream", { streamId: id });
    console.log("[Socket] join-stream emitted:", id);

    socket.on("stream-info", (data) => {
      if (!data) {
        setError("Stream not found or has ended.");
        return;
      }
      setStreamInfo(data);
      message.success(`Joined stream: ${data.streamTitle}`);
      setupPeerConnection(data.streamerSocketId);
    });

    socket.on("stop-stream", () => {
      setError("The stream has been stopped.");
      cleanupStream();
    });
    socket.on("stream-ended", () => {
      setError("The stream has ended.");
      cleanupStream();
    });

    return () => {
      socket.emit("leave-stream", { streamId: id });
      socket.off("stream-info");
      socket.off("stop-stream");
      socket.off("stream-ended");
      socket.off("offer");
      socket.off("ice-candidate");
      cleanupStream();
    };
  }, [id]);

  useEffect(() => {
    socket.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => socket.off("chat-message");
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    socket.emit("chat-message", {
      streamId: id,
      userId: "Viewer",
      username: "Viewer",
      message: messageInput,
      time: new Date().toLocaleTimeString(),
    });
    setMessageInput("");
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/livestreamingplatform/watch/${id}`;
    navigator.clipboard.writeText(link).then(() => message.success("Copied link!"));
  };

  return (
    <Card style={{ margin: "20px", position: "relative" }}>
      <Button
        icon={<LogoutOutlined />}
        style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}
        onClick={leaveStream}
      >
        Leave Stream
      </Button>

      {streamInfo && !error ? (
        <>
          <Title level={3}>{streamInfo.streamTitle}</Title>
          <div style={{ marginBottom: 10 }}>
            <Paragraph
              copyable={{
                text: `${window.location.origin}/livestreamingplatform/watch/${id}`,
              }}
              style={{ marginBottom: 4 }}
            >
              <strong>🔗 Share Stream:</strong>{" "}
              {`${window.location.origin}/livestreamingplatform/watch/${id}`}
            </Paragraph>
            <Tooltip title="Copy full stream link">
              <Button size="small" icon={<CopyOutlined />} onClick={handleCopyLink}>
                Copy Link
              </Button>
            </Tooltip>
          </div>
          <video ref={videoRef} autoPlay playsInline controls style={{ width: "100%", backgroundColor: "#000" }} />
          <Card className="watch-chat-box" style={{ marginTop: 20 }}>
            <Title level={4} className="chat-title">
              Live Chat
            </Title>
            <List
              className="chat-messages"
              dataSource={messages}
              renderItem={(msg, i) => (
                <List.Item key={i}>
                  <strong>{msg.username}</strong>: {msg.message}{" "}
                  <em style={{ fontSize: "0.8em", color: "#999", marginLeft: 5 }}>
                    {msg.time}
                  </em>
                </List.Item>
              )}
            />
            <div ref={chatEndRef} />
            <Space.Compact className="chat-input">
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
        </>
      ) : (
        <>
          <Title level={4}>Loading stream…</Title>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </>
      )}
    </Card>
  );
};

export default WatchStream;
