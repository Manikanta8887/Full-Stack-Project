
import React, { useState, useEffect } from "react";
import { Card, Input, Row, Col, Typography, message } from "antd";
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
    // Request the current stream lists from the backend via socket.
    socket.emit("get-streams");

    socket.on("stream-list", (data) => {
      setLiveStreams(data.liveStreams);
      setPastStreams(data.pastStreams);
    });

    // Listen for live updates (active streams update)
    socket.on("update-streams", (streams) => {
      setLiveStreams(streams);
    });

    // Listen for start/stop events for user notifications
    socket.on("start-stream", (newStream) => {
      message.success(`"${newStream.streamTitle}" is now live!`);
    });
    socket.on("stop-stream", (endedStream) => {
      message.info(`"${endedStream.streamTitle}" has ended.`);
      // Optionally update past streams here if needed.
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
              <Link to={stream.streamLink || `/livestreamingplatform/stream/${stream.id}`}>
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
                    description={`By ${stream.streamerName || stream.streamerId || "Unknown"}`}
                  />
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
                cover={
                  <img
                    alt="Past Stream"
                    src={stream.thumbnail || "/default-stream.jpg"}
                  />
                }
              >
                <Card.Meta
                  title={stream.streamTitle}
                  description={`By ${stream.streamerName || stream.streamerId || "Unknown"} on ${new Date(
                    stream.endTime
                  ).toLocaleDateString()}`}
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
