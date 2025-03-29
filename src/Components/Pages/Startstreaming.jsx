import React, { useState, useRef, useEffect } from "react";
import socket from "../socket";
import baseurl from "../base"; // In case you need it for other purposes

const StartStreaming = () => {
  const [stream, setStream] = useState(null);
  const [screenSharing, setScreenSharing] = useState(false);
  const videoRef = useRef(null);
  const peerConnection = useRef(null);
  const [streamTitle, setStreamTitle] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  useEffect(() => {
    // Listen for incoming offers, ICE candidates, and chat messages.
    socket.on("offer", async (offer) => {
      if (!peerConnection.current) return;
      await peerConnection.current.setRemoteDescription(offer);
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit("answer", answer);
    });

    socket.on("candidate", (candidate) => {
      if (!peerConnection.current) return;
      peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("offer");
      socket.off("candidate");
      socket.off("chat-message");
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
      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
        videoRef.current.play();
      }
      setIsStreaming(true);

      // Set up the peer connection.
      peerConnection.current = new RTCPeerConnection(servers);
      userStream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, userStream);
      });

      // Send ICE candidates to the signaling server.
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("candidate", event.candidate);
        }
      };

      // Create and send an offer.
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit("offer", offer, streamTitle);
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };

  const stopStreaming = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setIsStreaming(false);
    socket.emit("stop-stream");
  };

  const toggleScreenShare = async () => {
    if (!peerConnection.current) return;
    if (!screenSharing) {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const sender = peerConnection.current.getSenders().find(
        (s) => s.track && s.track.kind === "video"
      );
      if (sender) {
        sender.replaceTrack(screenStream.getVideoTracks()[0]);
      }
      setScreenSharing(true);
    } else {
      const userStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const sender = peerConnection.current.getSenders().find(
        (s) => s.track && s.track.kind === "video"
      );
      if (sender) {
        sender.replaceTrack(userStream.getVideoTracks()[0]);
      }
      setScreenSharing(false);
    }
  };

  const sendMessage = () => {
    if (!socket) {
      console.error("Socket not initialized");
      return;
    }
    socket.emit("chat-message", message);
    setMessage("");
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
      <button onClick={isStreaming ? stopStreaming : startStreaming}>
        {isStreaming ? "Stop Streaming" : "Start Streaming"}
      </button>
      {isStreaming && (
        <div>
          <button onClick={toggleScreenShare}>
            {screenSharing ? "Stop Screen Share" : "Share Screen"}
          </button>
        </div>
      )}
      <video ref={videoRef} autoPlay playsInline muted />
      <div>
        <div>
          {messages.map((msg, index) => (
            <p key={index}>{msg}</p>
          ))}
        </div>
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default StartStreaming;
