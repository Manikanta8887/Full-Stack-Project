// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Card,
//   Input,
//   Row,
//   Col,
//   Typography,
//   message,
//   Tooltip,
//   Button,
//   Space,
// } from "antd";
// import { CopyOutlined, PlayCircleOutlined } from "@ant-design/icons";
// import { Link } from "react-router-dom";
// import socket from "../../socket";
// import axios from "axios";
// import "./Browse.css";
// import baseurl from "../../base.js";

// const { Title, Paragraph } = Typography;
// const { Search } = Input;

// const VideoCard = ({ vid }) => {
//   const [playing, setPlaying] = useState(false);

//   return (
//     <Card hoverable style={{ height: "100%" }}>
//       <div
//         className="video-card-cover"
//         onClick={()=>setPlaying(true)}
//       >
//         {playing ? (
//           <video
//             src={vid.url}
//             className="browse-video-card"
//             controls
//             preload="auto"
//             autoPlay
//             muted
//           />
//         ) : (
//           <>
//             <img
//               src={vid.coverImage}
//               alt={vid.title}
//               className="browse-video-poster"
//             />
//             <div className="play-overlay">
//               <PlayCircleOutlined />
//             </div>
//           </>
//         )}
//       </div>

//       <Card.Meta
//         title={vid.title || "Untitled Video"}
//         description={
//           <div className="video-uploader">
//             By{" "}
//             <Link to={`/livestreamingplatform/profile/${vid.uploaderId}`}>
//               {vid.uploaderName || "Unknown"}
//             </Link>
//           </div>
//         }
//       />
//     </Card>
//   );
// };

// const Browse = () => {
//   const [liveStreams, setLiveStreams] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [uploadedVideos, setUploadedVideos] = useState([]);

//   // Live streams via Socket.IO
//   useEffect(() => {
//     socket.emit("get-streams");
//     socket.on("stream-list", ({ liveStreams }) => setLiveStreams(liveStreams));
//     socket.on("update-streams", (streams) => setLiveStreams(streams));
//     socket.on("start-stream", ({ streamTitle }) =>
//       message.success(`"${streamTitle}" is now live!`)
//     );
//     socket.on("stop-stream", ({ streamTitle }) =>
//       message.info(`"${streamTitle}" has ended.`)
//     );
//     return () => socket.removeAllListeners();
//   }, []);

//   // Fetch uploaded videos
//   useEffect(() => {
//     axios
//       .get(`${baseurl}/api/videos`)
//       .then((res) => setUploadedVideos(res.data.videos || []))
//       .catch((err) => {
//         console.error("Error fetching uploaded videos:", err);
//         setUploadedVideos([]);
//       });
//   }, []);

//   const filteredLive = useMemo(
//     () =>
//       liveStreams.filter((s) =>
//         s.streamTitle.toLowerCase().includes(searchQuery.toLowerCase())
//       ),
//     [liveStreams, searchQuery]
//   );

//   const handleCopyLink = (streamId) => {
//     const link = `${window.location.origin}/livestreamingplatform/watch/${streamId}`;
//     navigator.clipboard.writeText(link).then(() => {
//       message.success("Stream link copied!");
//     });
//   };

//   return (
//     <div className="browse-container">
//       <Title level={2}>🎥 Live Streams</Title>
//       <Row gutter={[16, 16]}>
//         {filteredLive.length === 0 ? (
//           <p>No live streams available</p>
//         ) : (
//           filteredLive.map((stream) => {
//             const link = `/livestreamingplatform/watch/${stream.id}`;
//             return (
//               <Col xs={24} sm={12} md={8} key={stream.id}>
//                 <Link to={link}>
//                   <Card
//                     hoverable
//                     cover={
//                       <img
//                         alt="Live Stream"
//                         src={stream.thumbnail || "/default-stream.jpg"}
//                       />
//                     }
//                   >
//                     <Card.Meta
//                       title={stream.streamTitle}
//                       description={
//                         <>
//                           <div>By {stream.streamerName || "Unknown"}</div>
//                           <div>👁️ {stream.viewers || 0} viewers</div>
//                         </>
//                       }
//                     />
//                   </Card>
//                 </Link>
//                 <Paragraph
//                   copyable={{ text: `${window.location.origin}${link}` }}
//                   ellipsis
//                   style={{ margin: "8px 0" }}
//                 >
//                   <strong>🔗 Stream Link:</strong> {link}
//                 </Paragraph>
//                 <Space>
//                   <Tooltip title="Copy full stream link">
//                     <Button
//                       icon={<CopyOutlined />}
//                       size="small"
//                       onClick={() => handleCopyLink(stream.id)}
//                     >
//                       Copy Link
//                     </Button>
//                   </Tooltip>
//                 </Space>
//               </Col>
//             );
//           })
//         )}
//       </Row>

//       <Title level={3} style={{ marginTop: 30 }}>
//         📹 Uploaded Videos
//       </Title>
//       <Row gutter={[16, 16]}>
//         {uploadedVideos.map((vid) => (
//           <Col xs={24} md={8} key={vid.public_id}>
//             <VideoCard vid={vid} />
//           </Col>
//         ))}
//       </Row>
//     </div>
//   );
// };

// export default Browse;




import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Card,
  Input,
  Row,
  Col,
  Typography,
  message,
  Tooltip,
  Button,
  Space,
} from "antd";
import { CopyOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import socket from "../../socket";
import axios from "axios";
import "./Browse.css";
import baseurl from "../../base.js";

const { Title, Paragraph } = Typography;
const { Search } = Input;

const VideoCard = ({ vid }) => {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);
  
  // Autoplay when video comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !playing) {
            setPlaying(true);
          }
        });
      },
      { threshold: 0.5 } // 50% of video visible
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, [playing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  return (
    <Card hoverable style={{ height: "100%" }}>
      <div
        className="video-card-cover"
        onClick={() => setPlaying(true)}
        ref={videoRef}
      >
        {playing ? (
          <video
            src={vid.url}
            className="browse-video-card"
            controls
            preload="auto"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <>
            <img
              src={vid.coverImage}
              alt={vid.title}
              className="browse-video-poster"
            />
            <div className="play-overlay" onClick={() => setPlaying(true)}>
              <PlayCircleOutlined />
            </div>
          </>
        )}
      </div>

      <Card.Meta
        title={vid.title || "Untitled Video"}
        description={
          <div className="video-uploader">
            By{" "}
            <Link to={`/livestreamingplatform/profile/${vid.uploaderId}`}>
              {vid.uploaderName || "Unknown"}
            </Link>
          </div>
        }
      />
    </Card>
  );
};

const Browse = () => {
  const [liveStreams, setLiveStreams] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadedVideos, setUploadedVideos] = useState([]);

  // Live streams via Socket.IO
  useEffect(() => {
    socket.emit("get-streams");
    socket.on("stream-list", ({ liveStreams }) => setLiveStreams(liveStreams));
    socket.on("update-streams", (streams) => setLiveStreams(streams));
    socket.on("start-stream", ({ streamTitle }) =>
      message.success(`"${streamTitle}" is now live!`)
    );
    socket.on("stop-stream", ({ streamTitle }) =>
      message.info(`"${streamTitle}" has ended.`)
    );
    return () => socket.removeAllListeners();
  }, []);

  // Fetch uploaded videos
  useEffect(() => {
    axios
      .get(`${baseurl}/api/videos`)
      .then((res) => setUploadedVideos(res.data.videos || []))
      .catch((err) => {
        console.error("Error fetching uploaded videos:", err);
        setUploadedVideos([]);
      });
  }, []);

  const filteredLive = useMemo(
    () =>
      liveStreams.filter((s) =>
        s.streamTitle.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [liveStreams, searchQuery]
  );

  const handleCopyLink = (streamId) => {
    const link = `${window.location.origin}/livestreamingplatform/watch/${streamId}`;
    navigator.clipboard.writeText(link).then(() => {
      message.success("Stream link copied!");
    });
  };

  return (
    <div className="browse-container">
      <Title level={2}>🎥 Live Streams</Title>
      <Row gutter={[16, 16]}>
        {filteredLive.length === 0 ? (
          <p>No live streams available</p>
        ) : (
          filteredLive.map((stream) => {
            const link = `/livestreamingplatform/watch/${stream.id}`;
            return (
              <Col xs={24} sm={12} md={8} key={stream.id}>
                <Link to={link}>
                  <Card
                    hoverable
                    cover={
                      <img
                        alt="Live Stream"
                        src={stream.thumbnail || "/default-stream.jpg"}
                      />
                    }
                  >
                    <Card.Meta
                      title={stream.streamTitle}
                      description={
                        <>
                          <div>By {stream.streamerName || "Unknown"}</div>
                          <div>👁️ {stream.viewers || 0} viewers</div>
                        </>
                      }
                    />
                  </Card>
                </Link>
                <Paragraph
                  copyable={{ text: `${window.location.origin}${link}` }}
                  ellipsis
                  style={{ margin: "8px 0" }}
                >
                  <strong>🔗 Stream Link:</strong> {link}
                </Paragraph>
                <Space>
                  <Tooltip title="Copy full stream link">
                    <Button
                      icon={<CopyOutlined />}
                      size="small"
                      onClick={() => handleCopyLink(stream.id)}
                    >
                      Copy Link
                    </Button>
                  </Tooltip>
                </Space>
              </Col>
            );
          })
        )}
      </Row>

      <Title level={3} style={{ marginTop: 30 }}>
        📹 Uploaded Videos
      </Title>
      <Row gutter={[16, 16]}>
        {uploadedVideos.map((vid) => (
          <Col xs={24} md={8} key={vid.public_id}>
            <VideoCard vid={vid} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Browse;
