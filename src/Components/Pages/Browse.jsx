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

import React, { useState, useEffect } from "react";
import { Card, Input, Row, Col, Typography } from "antd";
import { Link } from "react-router-dom";
import socket from "../../socket";
import "./Browse.css";

const { Title } = Typography;
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

    return () => {
      socket.off("stream-list");
    };
  }, []);

  const filteredLiveStreams = liveStreams.filter((stream) =>
    stream.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          filteredLiveStreams.map((stream) => (
            <Col xs={24} sm={12} md={8} lg={6} key={stream.id}>
              <Link to={`/livestreamingplatform/stream/${stream.id}`}>
                <Card
                  hoverable
                  cover={<img alt="Live Stream" src={stream.thumbnail || "/default-stream.jpg"} />}
                >
                  <Card.Meta title={stream.title} description={`By ${stream.user}`} />
                </Card>
              </Link>
            </Col>
          ))
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
                cover={<img alt="Past Stream" src={stream.thumbnail || "/default-stream.jpg"} />}
              >
                <Card.Meta title={stream.title} description={`By ${stream.user} on ${stream.date}`} />
              </Card>
            </Col>
          ))
        )}
      </Row>
    </div>
  );
};

export default Browse;

