// import React, { useEffect, useRef, useState } from "react";
// import { useParams } from "react-router-dom";
// import { Card, Typography, message } from "antd";
// import socket from "../../socket";
// import "./WatchStream.css";

// const { Title } = Typography;

// const WatchStream = () => {
//   const { id } = useParams();
//   const videoRef = useRef(null);
//   const [streamInfo, setStreamInfo] = useState(null);
//   const [error, setError] = useState("");
//   const peerConnectionRef = useRef(null);
  
//   const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

//   useEffect(() => {
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

//     return () => {
//       socket.off("stream-info");
//       if (peerConnectionRef.current) {
//         peerConnectionRef.current.close();
//       }
//     };
//   }, [id]);

//   const setupPeerConnection = () => {
//     peerConnectionRef.current = new RTCPeerConnection(servers);

//     peerConnectionRef.current.ontrack = (event) => {
//       if (videoRef.current) {
//         videoRef.current.srcObject = event.streams[0];
//       }
//     };

//     socket.on("offer", async (offer) => {
//       if (peerConnectionRef.current) {
//         await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
//         const answer = await peerConnectionRef.current.createAnswer();
//         await peerConnectionRef.current.setLocalDescription(answer);
//         socket.emit("answer", { streamId: id, answer });
//       }
//     });

//     socket.on("ice-candidate", async (candidate) => {
//       if (peerConnectionRef.current) {
//         try {
//           await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         } catch (err) {
//           console.error("Error adding received ICE candidate", err);
//         }
//       }
//     });

//     socket.emit("join-stream", { streamId: id });
//   };

//   return (
//     <Card style={{ margin: "20px" }}>
//       {streamInfo ? (
//         <>
//           <Title level={3}>{streamInfo.streamTitle}</Title>
//           <video
//             ref={videoRef}
//             autoPlay
//             playsInline
//             controls
//             style={{ width: "100%", backgroundColor: "#000" }}
//           />
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


// WatchStream.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Typography, message } from "antd";
import socket from "../../socket";
import "./WatchStream.css";

const { Title } = Typography;

const WatchStream = () => {
  const { id } = useParams();
  const videoRef = useRef(null);
  const [streamInfo, setStreamInfo] = useState(null);
  const [error, setError] = useState("");
  const peerConnectionRef = useRef(null);
  const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  useEffect(() => {
    // Request stream information from backend
    socket.emit("get-stream-info", { streamId: id });

    socket.on("stream-info", (data) => {
      if (data) {
        setStreamInfo(data);
        message.success(`Joined stream: ${data.streamTitle}`);
        setupPeerConnection();
      } else {
        setError("Stream not found or ended.");
      }
    });

    // Cleanup listeners and peer connection on unmount
    return () => {
      socket.off("stream-info");
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [id]);

  const setupPeerConnection = () => {
    peerConnectionRef.current = new RTCPeerConnection(servers);

    // Handle remote stream track event
    peerConnectionRef.current.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    // Listen for offer from streamer
    socket.on("offer", async (offer) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(offer);
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit("answer", { streamId: id, answer });
      }
    });

    // Listen for ICE candidates
    socket.on("ice-candidate", async (candidate) => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(candidate);
        } catch (err) {
          console.error("Error adding received ICE candidate", err);
        }
      }
    });

    // Emit join event to backend
    socket.emit("join-stream", { streamId: id });
  };

  return (
    <Card style={{ margin: "20px" }}>
      {streamInfo ? (
        <>
          <Title level={3}>{streamInfo.streamTitle}</Title>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            controls
            style={{ width: "100%", backgroundColor: "#000" }}
          />
        </>
      ) : (
        <>
          <Title level={4}>Loading stream...</Title>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </>
      )}
    </Card>
  );
};

export default WatchStream;
