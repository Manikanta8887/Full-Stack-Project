// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import socket from "../../socket"; // Correct relative path

// const Browse = () => {
//   const [liveStreams, setLiveStreams] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     socket.on("update-streams", (streams) => {
//       setLiveStreams(streams);
//     });
//     return () => socket.off("update-streams");
//   }, []);

//   return (
//     <div>
//       <h2>Live Streams</h2>
//       {liveStreams.length === 0 ? <p>No live streams</p> : null}
//       {liveStreams.map((stream, index) => (
//         <div key={index}>
//           <h3>{stream.streamTitle}</h3>
//           <p>Streamer: {stream.id}</p>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Browse;

import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Avatar, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { VideoCameraOutlined } from "@ant-design/icons";
import socket from "../../socket"; // Import Socket.io connection
import "./Browse.css";

const { Title } = Typography;

const Browse = () => {
  const [liveStreams, setLiveStreams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch existing streams when the page loads
    socket.emit("get-live-streams");

    // Listen for updates on active streams
    socket.on("live-streams", (streams) => {
      setLiveStreams(streams);
    });

    return () => {
      socket.off("live-streams");
    };
  }, []);

  return (
    <div className="browse-container">
      <Title level={2} className="browse-title">
        Live Streams 🎥
      </Title>

      {liveStreams.length === 0 ? (
        <div className="no-streams">
          <Spin size="large" />
          <p>No live streams available right now.</p>
        </div>
      ) : (
        <Row gutter={[16, 16]} justify="center">
          {liveStreams.map((stream) => (
            <Col xs={24} sm={12} md={8} lg={6} key={stream.id}>
              <Card
                hoverable
                className="stream-card"
                onClick={() => navigate(`/livestreamingplatform/stream/${stream.id}`)}
                cover={<img alt="Stream Thumbnail" src={stream.thumbnail || "/default-stream.jpg"} />}
              >
                <Card.Meta
                  avatar={<Avatar src={stream.profilePic || "/default-avatar.png"} />}
                  title={stream.title}
                  description={`Streamer: ${stream.streamerName}`}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Browse;

