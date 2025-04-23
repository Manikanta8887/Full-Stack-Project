import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setIsStreaming, setStreamTitle } from "../Redux/streamSlice.js";
import {
  Button,
  Card,
  Space,
  message,
  Typography,
  Input,
  Row,
  Col,
  List,
} from "antd";
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
  const firebaseUser = useSelector((s) => s.user.firebaseUser);
  const reduxStreaming = useSelector((s) => s.stream.isStreaming);
  const reduxTitle = useSelector((s) => s.stream.streamTitle);
  const isStreaming =
    reduxStreaming || localStorage.getItem("isStreaming") === "true";
  const streamTitle =
    reduxTitle || localStorage.getItem("streamTitle") || "";

  const videoRef = useRef(null);
  const chatEndRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const peerConnections = useRef(new Map());

  const [stream, setStream] = useState(null);
  const [origVideoTrack, setOrigVideoTrack] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // const ICE_SERVERS = {
  //   iceServers: [
  //     { urls: "stun:global.xirsys.net:3478" },
  //     {
  //       urls: "turn:global.xirsys.net:3478?transport=udp",
  //       username: "Mani",
  //       credential: "71742688-1f41-11f0-8c62-0242ac130003",
  //     },
  //     {
  //       urls: "turn:global.xirsys.net:3478?transport=tcp",
  //       username: "Mani",
  //       credential: "71742688-1f41-11f0-8c62-0242ac130003",
  //     },
  //   ],
  // };
  const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },         // Google STUN
    { urls: "stun:global.xirsys.net:3478" },         // XirSys STUN
    {                                                // XirSys TURN (UDP)
      urls: "turn:global.xirsys.net:3478?transport=udp",
      username: "Mani",
      credential: "71742688-1f41-11f0-8c62-0242ac130003",
    },
    {                                                // XirSys TURN (TCP)
      urls: "turn:global.xirsys.net:3478?transport=tcp",
      username: "Mani",
      credential: "71742688-1f41-11f0-8c62-0242ac130003",
    },
    {                                                // Secure TURN
      urls: "turns:global.xirsys.net:443?transport=tcp",
      username: "Mani",
      credential: "71742688-1f41-11f0-8c62-0242ac130003",
    },
  ],
};


  useEffect(() => {
    if (reduxStreaming) localStorage.setItem("isStreaming", "true");
    else localStorage.removeItem("isStreaming");
  }, [reduxStreaming]);

  useEffect(() => {
    if (reduxTitle) localStorage.setItem("streamTitle", reduxTitle);
    else localStorage.removeItem("streamTitle");
  }, [reduxTitle]);

  useEffect(() => {
    socket.on("chat-message", (msg) => {
      console.log("[Socket] chat-message:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("answer", async ({ answer, from }) => {
      console.log(`[Socket] answer from viewer ${from}:`, answer);
      const pc = peerConnections.current.get(from);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log(`[WebRTC] setRemoteDescription on PC[${from}]`);
      }
    });

    socket.on("ice-candidate", async ({ candidate, from }) => {
      console.log(`[Socket] ice-candidate from ${from}:`, candidate);
      const pc = peerConnections.current.get(from);
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log(`[WebRTC] added ICE candidate on PC[${from}]`);
        } catch (e) {
          console.error(`[WebRTC] PC[${from}] addIceCandidate failed`, e);
        }
      }
    });

    socket.on("update-streams", (streams) => {
      const mine = streams.find((s) => s.streamerId === firebaseUser?.uid);
      setViewerCount(mine?.viewers || 0);
      console.log("[Socket] update-streams, new count:", mine?.viewers);
    });

    socket.on("viewer-joined", async ({ streamId, viewerId }) => {
      if (streamId !== firebaseUser?.uid) return;
      console.log(`[Socket] viewer-joined: ${viewerId}. Creating PC…`);

      const pc = new RTCPeerConnection(ICE_SERVERS);
      {
        const pc = peerConnectionRef.current;
        pc.onicegatheringstatechange = () =>
          console.log("[WebRTC][start] gathering state:", pc.iceGatheringState);
        pc.oniceconnectionstatechange = () =>
          console.log("[WebRTC][start] ice state:", pc.iceConnectionState);
      }

      pc.onconnectionstatechange = () => {
        console.log(
          `[WebRTC] connectionState for ${viewerId}:`,
          pc.connectionState
        );
      };
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          console.log(`[WebRTC] sending ICE to ${viewerId}:`, e.candidate);
          socket.emit("ice-candidate", {
            streamId: firebaseUser.uid,
            candidate: e.candidate,
            target: viewerId,
          });
        }
      };

      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log(`[WebRTC] offer created for ${viewerId}:`, offer);

      socket.emit("offer", {
        streamId: firebaseUser.uid,
        offer,
        target: viewerId,
      });
      console.log(`[Socket] offer emitted to ${viewerId}`);

      peerConnections.current.set(viewerId, pc);
    });

    return () => {
      socket.off("chat-message");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("update-streams");
      socket.off("viewer-joined");
    };
  }, [firebaseUser, stream]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const rejoin = async () => {
      console.log("[WebRTC] rejoin-stream invoked for:", firebaseUser?.uid);
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        console.log("[Media] obtained userMedia for rejoin");
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setOrigVideoTrack(mediaStream.getVideoTracks()[0]);

        peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS);
        {
          const pc = peerConnectionRef.current;
          pc.onicegatheringstatechange = () =>
            console.log("[WebRTC][start] gathering state:", pc.iceGatheringState);
          pc.oniceconnectionstatechange = () =>
            console.log("[WebRTC][start] ice state:", pc.iceConnectionState);
        }
        console.log(
          "[WebRTC] RTCPeerConnection created for rejoin:",
          peerConnectionRef.current
        );

        peerConnectionRef.current.onconnectionstatechange = () => {
          console.log(
            "[WebRTC] connectionState (rejoin):",
            peerConnectionRef.current.connectionState
          );
        };

        peerConnectionRef.current.ontrack = (e) => {
          console.log("[WebRTC] track event (rejoin):", e);
          videoRef.current.srcObject = e.streams[0];
        };

        mediaStream
          .getTracks()
          .forEach((t) => peerConnectionRef.current.addTrack(t, mediaStream));
        peerConnectionRef.current.onicecandidate = (e) => {
          if (e.candidate) {
            console.log(
              "[WebRTC] sending ICE candidate (rejoin):",
              e.candidate
            );
            socket.emit("ice-candidate", {
              streamId: firebaseUser?.uid,
              candidate: e.candidate,
            });
          }
        };

        socket.emit("rejoin-stream", { streamerId: firebaseUser?.uid });
        console.log("[Socket] rejoin-stream emitted for:", firebaseUser?.uid);
        message.success("Rejoined stream");
      } catch (err) {
        console.error("Rejoin failed", err);
        message.error("Failed to rejoin stream");
      }
    };

    if (isStreaming && !peerConnectionRef.current) {
      dispatch(setIsStreaming(true));
      dispatch(setStreamTitle(streamTitle));
      rejoin();
    }
  }, [isStreaming, streamTitle, dispatch, firebaseUser]);

  const toggleFullScreen = () => {
    console.log("[UI] toggle fullscreen:", !isFullScreen);
    if (!isFullScreen && videoRef.current) videoRef.current.requestFullscreen();
    else document.exitFullscreen();
    setIsFullScreen((prev) => !prev);
  };

  const toggleMute = () => {
    console.log("[UI] toggle mute:", !isMuted);
    if (stream) {
      stream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
      setIsMuted((prev) => !prev);
    }
  };

  const toggleCamera = () => {
    console.log("[UI] toggle camera:", !isCameraOn);
    if (stream) {
      stream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
      setIsCameraOn((prev) => !prev);
    }
  };

  const toggleScreenShare = async () => {
    console.log("[UI] toggle screen share");
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      console.log("[Media] obtained displayMedia for screen share");
      const screenTrack = screenStream.getVideoTracks()[0];
      const allAudioTracks = stream.getAudioTracks();

      peerConnections.current.forEach((pc, viewerId) => {
        const sender = pc.getSenders().find((s) => s.track.kind === "video");
        if (sender) {
          console.log(`[WebRTC] replacing video track for viewer ${viewerId}`);
          sender.replaceTrack(screenTrack);
        }
      });
  
      const primarySender = peerConnectionRef.current
        ?.getSenders()
        .find((s) => s.track.kind === "video");
      if (primarySender) {
        primarySender.replaceTrack(screenTrack);
        console.log("[WebRTC] replaced primary video track with screen");
      }
        videoRef.current.srcObject = new MediaStream([ screenTrack, ...allAudioTracks ]);
      setIsScreenSharing(true);
      message.success("Screen sharing started");
  
      screenTrack.onended = () => {
        console.log("[Media] screen sharing ended, restoring original track");
        peerConnections.current.forEach((pc, viewerId) => {
          const sender = pc.getSenders().find((s) => s.track.kind === "video");
          if (sender && origVideoTrack) {
            console.log(`[WebRTC] restoring video track for viewer ${viewerId}`);
            sender.replaceTrack(origVideoTrack);
          }
        });
        if (primarySender && origVideoTrack) {
          primarySender.replaceTrack(origVideoTrack);
        }
        videoRef.current.srcObject = stream;  
        setIsScreenSharing(false);
        message.success("Screen sharing stopped");
      };
    } catch (err) {
      console.error("Screen share error:", err);
      message.error("Failed to share screen");
    }
  };  

  const startStream = async () => {
    if (!streamTitle.trim()) return message.warning("Enter a stream title");
    console.log("[Action] startStream clicked with title:", streamTitle);
    try {
      setIsLoading(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("[Media] obtained userMedia for startStream");
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setOrigVideoTrack(mediaStream.getVideoTracks()[0]);
      dispatch(setIsStreaming(true));
      dispatch(setStreamTitle(streamTitle));
      message.success("Streaming started");

      peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS);
      {
        const pc = peerConnectionRef.current;
        pc.onicegatheringstatechange = () =>
          console.log("[WebRTC][start] gathering state:", pc.iceGatheringState);
        pc.oniceconnectionstatechange = () =>
          console.log("[WebRTC][start] ice state:", pc.iceConnectionState);
      }
      console.log(
        "[WebRTC] RTCPeerConnection created for startStream:",
        peerConnectionRef.current
      );

      peerConnectionRef.current.onconnectionstatechange = () => {
        console.log(
          "[WebRTC] connectionState (start):",
          peerConnectionRef.current.connectionState
        );
      };

      peerConnectionRef.current.ontrack = (e) => {
        console.log("[WebRTC] track event (start):", e);
        videoRef.current.srcObject = e.streams[0];
      };

      mediaStream
        .getTracks()
        .forEach((t) => peerConnectionRef.current.addTrack(t, mediaStream));
      peerConnectionRef.current.onicecandidate = (e) => {
        if (e.candidate) {
          console.log("[WebRTC] sending ICE candidate (start):", e.candidate);
          socket.emit("ice-candidate", {
            streamId: firebaseUser?.uid || "Guest",
            candidate: e.candidate,
          });
        }
      };

      const offer = await peerConnectionRef.current.createOffer();
      console.log("[WebRTC] offer created:", offer);
      await peerConnectionRef.current.setLocalDescription(offer);
      console.log(
        "[WebRTC] local description set:",
        peerConnectionRef.current.localDescription
      );

      socket.emit("offer", { streamId: firebaseUser?.uid || "Guest", offer });
      console.log("[Socket] offer emitted:", offer);

      socket.emit("start-stream", {
        streamTitle,
        streamerId: firebaseUser?.uid || "Guest",
        streamerName: firebaseUser?.displayName || "Guest",
        profilePic: firebaseUser?.photoURL || null,
      });
      console.log(
        "[Socket] start-stream emitted for:",
        firebaseUser?.uid || "Guest"
      );
    } catch (err) {
      console.error("Start stream error:", err);
      message.error("Unable to start stream (camera/mic permission?)");
    } finally {
      setIsLoading(false);
    }
  };

  const stopStream = () => {
    console.log("[Action] stopStream clicked");
    stream?.getTracks().forEach((t) => t.stop());
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    dispatch(setIsStreaming(false));
    dispatch(setStreamTitle(""));
    localStorage.removeItem("isStreaming");
    localStorage.removeItem("streamTitle");
    setStream(null);
    setOrigVideoTrack(null);
    setIsCameraOn(true);
    setIsMuted(false);
    setIsScreenSharing(false);
    setViewerCount(0);
    if (videoRef.current) videoRef.current.srcObject = null;
    socket.emit("stop-stream", { streamerId: firebaseUser?.uid || "Guest" });
    console.log(
      "[Socket] stop-stream emitted for:",
      firebaseUser?.uid || "Guest"
    );
    message.info("Stream stopped");
  };

  const sendMessage = useCallback(() => {
    if (messageInput.trim()) {
      const chatData = {
        streamId: firebaseUser?.uid || "Guest",
        userId: firebaseUser?.uid || "Guest",
        username: firebaseUser?.displayName || "Guest",
        message: messageInput,
        time: new Date().toLocaleTimeString(),
      };
      console.log("[Socket] sending chat-message:", chatData);
      socket.emit("chat-message", chatData);
      setMessageInput("");
    }
  }, [messageInput, firebaseUser]);

  return (
    <Row justify="center" gutter={[16, 16]} className="start-streaming-container">
      <Col xs={24} md={16}>
        <Card className="stream-card">
          <Title level={3}>
            Start Live Streaming {isStreaming && `• ${viewerCount} watching`}
          </Title>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Input
              placeholder="Enter Stream Title"
              value={streamTitle}
              onChange={(e) => dispatch(setStreamTitle(e.target.value))}
              size="large"
              disabled={!firebaseUser}
              autoComplete="off"
            />
            <video
              ref={videoRef}
              className="stream-video"
              autoPlay
              playsInline
              muted
            />
            {error && <p className="error-text">{error}</p>}
            <Space wrap>
              {!isStreaming ? (
                <Button
                  type="primary"
                  icon={<VideoCameraOutlined />}
                  size="large"
                  onClick={startStream}
                  loading={isLoading}
                  disabled={!firebaseUser}
                >
                  Start Streaming
                </Button>
              ) : (
                <Button
                  type="danger"
                  icon={<StopOutlined />}
                  size="large"
                  onClick={stopStream}
                >
                  Stop Streaming
                </Button>
              )}
            </Space>
            {isStreaming && (
              <Space wrap>
                <Button onClick={toggleFullScreen}>
                  {isFullScreen ? (
                    <FullscreenExitOutlined />
                  ) : (
                    <FullscreenOutlined />
                  )}
                </Button>
                <Button onClick={toggleMute}>
                  {isMuted ? <SoundOutlined /> : <SoundFilled />}
                </Button>
                <Button onClick={toggleCamera}>
                  {isCameraOn ? <CameraOnIcon /> : <CameraOffIcon />}
                </Button>
                <Button onClick={toggleScreenShare} icon={<DesktopOutlined />} />
              </Space>
            )}
            {isStreaming && (
              <>
                <List
                  bordered
                  dataSource={messages}
                  className="chat-box"
                  renderItem={(item) => (
                    <List.Item>
                      <strong>{item.username}</strong>: {item.message}
                    </List.Item>
                  )}
                />
                <div ref={chatEndRef} />
                <Input.Search
                  placeholder="Type a message..."
                  enterButton={<SendOutlined />}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onSearch={sendMessage}
                />
              </>
            )}
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default StartStreaming;
