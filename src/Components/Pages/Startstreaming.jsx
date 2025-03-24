// import React, { useState, useRef, useEffect } from "react";
// import io from "socket.io-client";
// import baseurl from "../base"

// const socket = io(`${baseurl}`); // Replace with your backend URL

// const StartStreaming = () => {
//   const [stream, setStream] = useState(null);
//   const [screenSharing, setScreenSharing] = useState(false);
//   const videoRef = useRef(null);
//   const peerConnection = useRef(null);
//   const [streamTitle, setStreamTitle] = useState("");
//   const [isStreaming, setIsStreaming] = useState(false);

//   const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

//   useEffect(() => {
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
//       videoRef.current.srcObject = userStream;
//       setIsStreaming(true);

//       peerConnection.current = new RTCPeerConnection(servers);
//       userStream.getTracks().forEach((track) => {
//         peerConnection.current.addTrack(track, userStream);
//       });

//       peerConnection.current.onicecandidate = (event) => {
//         if (event.candidate) {
//           socket.emit("candidate", event.candidate);
//         }
//       };

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
//     if (!screenSharing) {
//       const screenStream = await navigator.mediaDevices.getDisplayMedia({
//         video: true,
//       });
//       const sender = peerConnection.current.getSenders().find((s) => s.track.kind === "video");
//       sender.replaceTrack(screenStream.getVideoTracks()[0]);
//       setScreenSharing(true);
//     } else {
//       const userStream = await navigator.mediaDevices.getUserMedia({ video: true });
//       const sender = peerConnection.current.getSenders().find((s) => s.track.kind === "video");
//       sender.replaceTrack(userStream.getVideoTracks()[0]);
//       setScreenSharing(false);
//     }
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
//       {!isStreaming ? (
//         <button onClick={startStreaming}>Start Streaming</button>
//       ) : (
//         <button onClick={stopStreaming}>Stop Streaming</button>
//       )}
//       {isStreaming && (
//         <div>
//           <button onClick={toggleScreenShare}>
//             {screenSharing ? "Stop Screen Share" : "Share Screen"}
//           </button>
//         </div>
//       )}
//       <video ref={videoRef} autoPlay playsInline muted />
//     </div>
//   );
// };

// export default StartStreaming;


import React, { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import baseurl from "../base";

const StartStreaming = () => {
  const [stream, setStream] = useState(null);
  const [screenSharing, setScreenSharing] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef(null);
  const peerConnection = useRef(null);
  const socketRef = useRef(null); // ✅ Store socket instance in useRef

  const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  useEffect(() => {
    // ✅ Initialize socket inside useEffect
    socketRef.current = io(baseurl);

    // ✅ Setup socket event listeners
    socketRef.current.on("offer", async (offer) => {
      if (!peerConnection.current) return;
      await peerConnection.current.setRemoteDescription(offer);
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socketRef.current.emit("answer", answer);
    });

    socketRef.current.on("candidate", (candidate) => {
      if (!peerConnection.current) return;
      peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    // ✅ Cleanup function to avoid memory leaks
    return () => {
      socketRef.current.off("offer");
      socketRef.current.off("candidate");
      socketRef.current.disconnect(); // Close socket connection on unmount
    };
  }, []);

  const startStreaming = async () => {
    if (!streamTitle) {
      alert("Please enter a stream title!");
      return;
    }

    try {
      const userStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStream(userStream);
      if (videoRef.current) videoRef.current.srcObject = userStream;
      setIsStreaming(true);

      peerConnection.current = new RTCPeerConnection(servers);
      userStream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, userStream);
      });

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit("candidate", event.candidate);
        }
      };

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socketRef.current.emit("offer", offer, streamTitle);
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };

  const stopStreaming = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setIsStreaming(false);
    socketRef.current.emit("stop-stream");
  };

  const toggleScreenShare = async () => {
    try {
      if (!screenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

        const sender = peerConnection.current
          .getSenders()
          .find((s) => s.track.kind === "video");

        if (sender) {
          await sender.replaceTrack(screenStream.getVideoTracks()[0]);
          setScreenSharing(true);
        }
      } else {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        const sender = peerConnection.current
          .getSenders()
          .find((s) => s.track.kind === "video");

        if (sender) {
          await sender.replaceTrack(userStream.getVideoTracks()[0]);
          setScreenSharing(false);
        }
      }
    } catch (error) {
      console.error("Error toggling screen share:", error);
    }
  };

  return (
    <div>
      <h2>Start Streaming</h2>
      {!isStreaming && (
        <input
          type="text"
          placeholder="Enter Stream Title"
          value={streamTitle}
          onChange={(e) => setStreamTitle(e.target.value)}
        />
      )}
      {!isStreaming ? (
        <button onClick={startStreaming}>Start Streaming</button>
      ) : (
        <button onClick={stopStreaming}>Stop Streaming</button>
      )}
      {isStreaming && (
        <div>
          <button onClick={toggleScreenShare}>
            {screenSharing ? "Stop Screen Share" : "Share Screen"}
          </button>
        </div>
      )}
      <video ref={videoRef} autoPlay playsInline muted />
    </div>
  );
};

export default StartStreaming;
