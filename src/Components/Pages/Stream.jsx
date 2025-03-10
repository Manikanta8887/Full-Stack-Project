import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("https://touchlive-backend.onrender.com"); // Connect to the signaling server

const Stream = () => {
    const localVideoRef = useRef(null); // Video of the user
    const remoteVideoRefs = useRef({}); // Videos of other users
    const peerConnections = {}; // Store peer connections
    const [roomId, setRoomId] = useState(""); // Store Room ID
    const [joined, setJoined] = useState(false); // Check if joined

    useEffect(() => {
        return () => {
            socket.disconnect(); // Disconnect when component unmounts
        };
    }, []);

    // Function to join a room
    const joinRoom = () => {
        if (roomId.trim() === "") return; // Room ID should not be empty
        setJoined(true);
        socket.emit("join-room", roomId); // Notify server about room joining

        // Get user media (camera & mic)
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // When existing users are in the room
            socket.on("existing-users", (users) => {
                users.forEach((userId) => createOffer(userId, stream));
            });

            // When a new user joins
            socket.on("user-joined", ({ userId }) => {
                createOffer(userId, stream);
            });

            // When an offer is received
            socket.on("offer", async ({ userId, offer }) => {
                const peer = createPeer(userId, stream);
                await peer.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                socket.emit("answer", { userId, answer });
            });

            // When an answer is received
            socket.on("answer", ({ userId, answer }) => {
                peerConnections[userId].setRemoteDescription(new RTCSessionDescription(answer));
            });

            // When ICE candidate is received
            socket.on("ice-candidate", ({ userId, candidate }) => {
                peerConnections[userId].addIceCandidate(new RTCIceCandidate(candidate));
            });

            // When a user leaves
            socket.on("user-left", (userId) => {
                if (remoteVideoRefs.current[userId]) {
                    remoteVideoRefs.current[userId].remove();
                    delete remoteVideoRefs.current[userId];
                }
            });
        });
    };

    // Function to create a peer connection
    const createPeer = (userId, stream) => {
        const peer = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        stream.getTracks().forEach(track => peer.addTrack(track, stream));

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", { userId, candidate: event.candidate });
            }
        };

        peer.ontrack = (event) => {
            if (!remoteVideoRefs.current[userId]) {
                const videoElement = document.createElement("video");
                videoElement.autoplay = true;
                videoElement.playsInline = true;
                document.body.appendChild(videoElement);
                remoteVideoRefs.current[userId] = videoElement;
            }
            remoteVideoRefs.current[userId].srcObject = event.streams[0];
        };

        peerConnections[userId] = peer;
        return peer;
    };

    // Function to create an offer
    const createOffer = async (userId, stream) => {
        const peer = createPeer(userId, stream);
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit("offer", { userId, offer, roomId });
    };

    return (
        <div>
            <h2>Live Streaming</h2>
            {!joined ? (
                <div>
                    <input
                        type="text"
                        placeholder="Enter Room ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                    />
                    <button onClick={joinRoom}>Join Room</button>
                </div>
            ) : (
                <video ref={localVideoRef} autoPlay muted />
            )}
        </div>
    );
};

export default Stream;
