// // // // Browse.jsx
// // // import React, { useState, useEffect } from "react";
// // // import { Card, Input, Row, Col, Typography, message } from "antd";
// // // import { Link } from "react-router-dom";
// // // import socket from "../../socket";
// // // import "./Browse.css";

// // // const { Title } = Typography;
// // // const { Search } = Input;

// // // const Browse = () => {
// // //   const [liveStreams, setLiveStreams] = useState([]);
// // //   const [pastStreams, setPastStreams] = useState([]);
// // //   const [searchQuery, setSearchQuery] = useState("");

// // //   useEffect(() => {
// // //     // Request the current stream lists from the backend via socket
// // //     socket.emit("get-streams");

// // //     socket.on("stream-list", (data) => {
// // //       setLiveStreams(data.liveStreams);
// // //       setPastStreams(data.pastStreams);
// // //     });

// // //     // Listen for live updates (active streams update)
// // //     socket.on("update-streams", (streams) => {
// // //       setLiveStreams(streams);
// // //     });

// // //     // Listen for start/stop events for user notifications
// // //     socket.on("start-stream", (newStream) => {
// // //       message.success(`"${newStream.streamTitle}" is now live!`);
// // //     });
// // //     socket.on("stop-stream", (endedStream) => {
// // //       message.info(`"${endedStream.streamTitle}" has ended.`);
// // //     });

// // //     // Cleanup listeners on unmount
// // //     return () => {
// // //       socket.off("stream-list");
// // //       socket.off("update-streams");
// // //       socket.off("start-stream");
// // //       socket.off("stop-stream");
// // //     };
// // //   }, []);

// // //   // Filter live streams based on search query
// // //   const filteredLiveStreams = liveStreams.filter((stream) =>
// // //     stream.streamTitle.toLowerCase().includes(searchQuery.toLowerCase())
// // //   );

// // //   return (
// // //     <div className="browse-container">
// // //       <Title level={2}>🎥 Live Streams</Title>
// // //       <Search
// // //         placeholder="Search streams..."
// // //         onChange={(e) => setSearchQuery(e.target.value)}
// // //         style={{ width: 300, marginBottom: 20 }}
// // //       />
// // //       <Row gutter={[16, 16]}>
// // //         {filteredLiveStreams.length === 0 ? (
// // //           <p>No live streams available</p>
// // //         ) : (
// // //           filteredLiveStreams.map((stream) => (
// // //             <Col xs={24} sm={12} md={8} lg={6} key={stream.id}>
// // //               {/* Link to viewer page */}
// // //               <Link to={`/livestreamingplatform/watch/${stream.id}`}>
// // //                 <Card
// // //                   hoverable
// // //                   cover={
// // //                     <img
// // //                       alt="Live Stream"
// // //                       src={stream.thumbnail || "/default-stream.jpg"}
// // //                     />
// // //                   }
// // //                 >
// // //                   <Card.Meta
// // //                     title={`${stream.streamTitle} (ID: ${stream.id})`}
// // //                     description={`By ${stream.streamerName || stream.streamerId || "Unknown"}`}
// // //                   />
// // //                 </Card>
// // //               </Link>
// // //             </Col>
// // //           ))
// // //         )}
// // //       </Row>

// // //       <Title level={3} style={{ marginTop: 30 }}>📺 Past Streams</Title>
// // //       <Row gutter={[16, 16]}>
// // //         {pastStreams.length === 0 ? (
// // //           <p>No past streams available</p>
// // //         ) : (
// // //           pastStreams.map((stream) => (
// // //             <Col xs={24} sm={12} md={8} lg={6} key={stream.id}>
// // //               <Card
// // //                 hoverable
// // //                 cover={
// // //                   <img
// // //                     alt="Past Stream"
// // //                     src={stream.thumbnail || "/default-stream.jpg"}
// // //                   />
// // //                 }
// // //               >
// // //                 <Card.Meta
// // //                   title={`${stream.streamTitle} (ID: ${stream.id})`}
// // //                   description={`By ${stream.streamerName || stream.streamerId || "Unknown"} on ${new Date(
// // //                     stream.endTime
// // //                   ).toLocaleDateString()}`}
// // //                 />
// // //               </Card>
// // //             </Col>
// // //           ))
// // //         )}
// // //       </Row>
// // //     </div>
// // //   );
// // // };

// // // export default Browse;


// import React, { useState, useEffect } from "react";
// import { Card, Input, Row, Col, Typography, message, Button, Tooltip } from "antd";
// import { Link } from "react-router-dom";
// import { CopyOutlined } from "@ant-design/icons";
// import socket from "../../socket";
// import "./Browse.css";

// const { Title, Paragraph } = Typography;
// const { Search } = Input;

// const Browse = () => {
//   const [liveStreams, setLiveStreams] = useState([]);
//   const [pastStreams, setPastStreams] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     socket.emit("get-streams");

//     socket.on("stream-list", (data) => {
//       setLiveStreams(data.liveStreams);
//       setPastStreams(data.pastStreams);
//     });

//     socket.on("update-streams", (streams) => {
//       setLiveStreams(streams);
//     });

//     socket.on("start-stream", (newStream) => {
//       message.success(`"${newStream.streamTitle}" is now live!`);
//     });
//     socket.on("stop-stream", (endedStream) => {
//       message.info(`"${endedStream.streamTitle}" has ended.`);
//     });

//     return () => {
//       socket.off("stream-list");
//       socket.off("update-streams");
//       socket.off("start-stream");
//       socket.off("stop-stream");
//     };
//   }, []);

//   const filteredLiveStreams = liveStreams.filter((stream) =>
//     stream.streamTitle.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleCopyLink = (streamId) => {
//     const fullLink = `${window.location.origin}/livestreamingplatform/watch/${streamId}`;
//     navigator.clipboard.writeText(fullLink).then(() => {
//       message.success("Stream link copied to clipboard!");
//     });
//   };

//   return (
//     <div className="browse-container">
//       <Title level={2}>🎥 Live Streams</Title>
//       <Search
//         placeholder="Search streams..."
//         onChange={(e) => setSearchQuery(e.target.value)}
//         style={{ width: 300, marginBottom: 20 }}
//       />
//       <Row gutter={[16, 16]}>
//         {filteredLiveStreams.length === 0 ? (
//           <p>No live streams available</p>
//         ) : (
//           filteredLiveStreams.map((stream) => {
//             const streamLink = `/livestreamingplatform/watch/${stream.id}`;
//             const fullLink = `${window.location.origin}${streamLink}`;
//             return (
//               <Col xs={24} sm={12} md={8} lg={6} key={stream.id}>
//                 <Link to={streamLink}>
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
//                       title={`${stream.streamTitle} (ID: ${stream.id})`}
//                       description={`By ${stream.streamerName || stream.streamerId || "Unknown"}`}
//                     />
//                   </Card>
//                 </Link>
//                 <div style={{ marginTop: 8 }}>
//                   <Paragraph copyable={{ text: fullLink }} ellipsis style={{ marginBottom: 4 }}>
//                     <strong>🔗 Stream Link:</strong> {streamLink}
//                   </Paragraph>
//                   <Tooltip title="Copy full link">
//                     <Button
//                       icon={<CopyOutlined />}
//                       size="small"
//                       onClick={() => handleCopyLink(stream.id)}
//                     >
//                       Copy Link
//                     </Button>
//                   </Tooltip>
//                 </div>
//               </Col>
//             );
//           })
//         )}
//       </Row>

//       <Title level={3} style={{ marginTop: 30 }}>📺 Past Streams</Title>
//       <Row gutter={[16, 16]}>
//         {pastStreams.length === 0 ? (
//           <p>No past streams available</p>
//         ) : (
//           pastStreams.map((stream) => (
//             <Col xs={24} sm={12} md={8} lg={6} key={stream.id}>
//               <Card
//                 hoverable
//                 cover={
//                   <img
//                     alt="Past Stream"
//                     src={stream.thumbnail || "/default-stream.jpg"}
//                   />
//                 }
//               >
//                 <Card.Meta
//                   title={`${stream.streamTitle} (ID: ${stream.id})`}
//                   description={`By ${stream.streamerName || stream.streamerId || "Unknown"} on ${new Date(
//                     stream.endTime
//                   ).toLocaleDateString()}`}
//                 />
//               </Card>
//             </Col>
//           ))
//         )}
//       </Row>
//     </div>
//   );
// };

// export default Browse;

import React, { useState, useEffect } from "react";
import { Card, Input, Row, Col, Typography, message, Button, Tooltip, Space } from "antd";
import { Link } from "react-router-dom";
import { CopyOutlined, UserOutlined } from "@ant-design/icons";
import socket from "../../socket";
import "./Browse.css";

const { Title, Paragraph } = Typography;
const { Search } = Input;

const Browse = () => {
  const [liveStreams, setLiveStreams] = useState([]);
  const [pastStreams, setPastStreams] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    socket.emit("get-streams");

    socket.on("stream-list", (data) => {
      setLiveStreams(data.liveStreams);
      setPastStreams(data.pastStreams);
    });

    socket.on("update-streams", (streams) => {
      setLiveStreams(streams);
    });

    socket.on("start-stream", (newStream) => {
      message.success(`"${newStream.streamTitle}" is now live!`);
    });
    socket.on("stop-stream", (endedStream) => {
      message.info(`"${endedStream.streamTitle}" has ended.`);
    });

    return () => {
      socket.off("stream-list");
      socket.off("update-streams");
      socket.off("start-stream");
      socket.off("stop-stream");
    };
  }, []);

  const filteredLiveStreams = liveStreams.filter((stream) =>
    stream.streamTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyLink = (streamId) => {
    const fullLink = `${window.location.origin}/livestreamingplatform/watch/${streamId}`;
    navigator.clipboard.writeText(fullLink).then(() => {
      message.success("Stream link copied to clipboard!");
    });
  };

  return (
    <div className="browse-container">
      <Title level={2}>🎥 Live Streams</Title>
      <Search
        placeholder="Search streams..."
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ width: 300, marginBottom: 20 }}
      />
      <Row gutter={[16, 16]}>
        {filteredLiveStreams.length === 0 ? (
          <p>No live streams available</p>
        ) : (
          filteredLiveStreams.map((stream) => {
            // const streamLink = `/livestreamingplatform/watch/${stream.id}`;
            const streamLink = `/livestreamingplatform/watch/${stream.id}`;

            const fullLink = `${window.location.origin}${streamLink}`;
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={stream.id}>
                <Link to={streamLink}>
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
                      title={`${stream.streamTitle} (ID: ${stream.id})`}
                      description={
                        <>
                          <div>
                            By{" "}
                            <Link to={`/profile/${stream.streamerId}`}>
                              {stream.streamerName || stream.streamerId || "Unknown"}{" "}
                              <UserOutlined />
                            </Link>
                          </div>
                          <div>👁️ {stream.viewers || 0} viewers</div>
                        </>
                      }
                    />
                  </Card>
                </Link>
                <div style={{ marginTop: 8 }}>
                  <Paragraph copyable={{ text: fullLink }} ellipsis style={{ marginBottom: 4 }}>
                    <strong>🔗 Stream Link:</strong> {streamLink}
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
                </div>
              </Col>
            );
          })
        )}
      </Row>

      <Title level={3} style={{ marginTop: 30 }}>📺 Past Streams</Title>
      <Row gutter={[16, 16]}>
        {pastStreams.length === 0 ? (
          <p>No past streams available</p>
        ) : (
          pastStreams.map((stream) => (
            <Col xs={24} sm={12} md={8} lg={6} key={stream.id}>
              <Card
                hoverable
                cover={
                  <img
                    alt="Past Stream"
                    src={stream.thumbnail || "/default-stream.jpg"}
                  />
                }
              >
                <Card.Meta
                  title={`${stream.streamTitle} (ID: ${stream.id})`}
                  description={
                    <>
                      <div>
                        By{" "}
                        <Link to={`/profile/${stream.streamerId}`}>
                          {stream.streamerName || stream.streamerId || "Unknown"}
                        </Link>
                      </div>
                      <div>
                        Ended on {new Date(stream.endTime).toLocaleDateString()}
                      </div>
                    </>
                  }
                />
              </Card>
            </Col>
          ))
        )}
      </Row>
    </div>
  );
};

export default Browse;
