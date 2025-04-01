import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Typography, Avatar, Row, Col, Divider, Spin, Button } from "antd";
import socket from "../../socket";
import "./Channel.css";

const { Title, Text } = Typography;

const ChannelPage = () => {
  const { id } = useParams(); // Channel user id
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [liveStream, setLiveStream] = useState(null);
  const [pastStreams, setPastStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Request channel data for the user with id "id"
    socket.emit("get-channel-data", { userId: id });
    socket.on("channel-data", (data) => {
      setUserData(data.user);
      setLiveStream(data.liveStream);
      setPastStreams(data.pastStreams);
      setLoading(false);
    });

    return () => {
      socket.off("channel-data");
    };
  }, [id]);

  if (loading) {
    return (
      <div className="channel-loading">
        <Spin size="large" />
        <p>Loading channel...</p>
      </div>
    );
  }

  return (
    <div className="channel-container">
      {/* Profile Section */}
      <div className="channel-profile">
        <Avatar size={100} src={userData?.profilePic || "/default-avatar.png"} />
        <Title level={2}>{userData?.name}</Title>
        <Text type="secondary">{userData?.bio || "No bio available"}</Text>
        {liveStream && (
          <Button
            type="primary"
            style={{ marginTop: "10px" }}
            onClick={() => navigate(`/livestreamingplatform/stream/${liveStream.id}`)}
          >
            Join Live Stream
          </Button>
        )}
      </div>

      <Divider />

      {/* Live Stream Section */}
      <div className="live-stream-section">
        <Title level={3} className="live-now">🎥 Live Now</Title>
        {liveStream ? (
          <Card
            hoverable
            className="stream-card"
            cover={<img alt="Live Stream" src={liveStream.thumbnail || "/default-stream.jpg"} />}
            onClick={() => navigate(`/livestreamingplatform/stream/${liveStream.id}`)}
          >
            <Card.Meta title={liveStream.title} description="Currently Live" />
          </Card>
        ) : (
          <Text type="secondary">No live stream currently</Text>
        )}
      </div>

      <Divider />

      {/* Past Streams Section */}
      <Title level={3}>📺 Past Streams</Title>
      {pastStreams.length === 0 ? (
        <Text type="secondary">No past streams available</Text>
      ) : (
        <Row gutter={[16, 16]} justify="center">
          {pastStreams.map((stream) => (
            <Col xs={24} sm={12} md={8} lg={6} key={stream.id}>
              <Card
                hoverable
                className="stream-card"
                cover={<img alt="Past Stream" src={stream.thumbnail || "/default-stream.jpg"} />}
                onClick={() => navigate(`/livestreamingplatform/stream/${stream.id}`)}
              >
                <Card.Meta title={stream.title} description={`On ${stream.date}`} />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default ChannelPage;
