import React, { useState, useEffect } from 'react';
import { Card, Avatar, Badge, Tag, Row, Col, Typography, Button, Space, Skeleton } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import './Content.css'; 

const { Title } = Typography;
const StreamingContent = () => {
  const featuredStreams = [
    { id: 1, title: "Gaming Championship", streamer: "ProGamer", viewers: 15420, category: "Gaming" },
    { id: 2, title: "Cooking Show Live", streamer: "ChefMaster", viewers: 8750, category: "Cooking" },
    { id: 3, title: "Music Concert", streamer: "MusicArtist", viewers: 12300, category: "Music" },
  ];

  const categories = [
    "Gaming", "Music", "Sports", "Creative", "IRL", "Esports", "Education", "Entertainment"
  ];

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <div className="streaming-content">
      {loading ? (
        <>
          <div className="categories-section">
            <Title level={4}>Categories</Title>
            <Space wrap>
              {categories.map((_, index) => (
                <Skeleton.Button key={index} active shape="round" />
              ))}
            </Space>
          </div>

          <div className="featured-streams-section">
            <Title level={4}>Featured Streams</Title>
            <Row gutter={[16, 16]}>
              {featuredStreams.map(stream => (
                <Col xs={24} sm={12} lg={8} key={stream.id}>
                  <Card
                    hoverable
                    className="stream-card"
                    cover={<Skeleton.Image active className="skeleton-card" />}
                  >
                    <Skeleton active title paragraph={{ rows: 2 }} />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          <div className="recommended-streams-section">
            <Title level={4}>Recommended Streams</Title>
            <Skeleton active paragraph={{ rows: 3 }} />
          </div>
        </>
      ) : (
        <>
          <div className="categories-section">
            <Title level={4}>Categories</Title>
            <Space wrap>
              {categories.map(category => (
                <Button key={category} type="primary" ghost className="category-button">
                  {category}
                </Button>
              ))}
            </Space>
          </div>

          <div className="featured-streams-section">
            <Title level={4}>Featured Streams</Title>
            <Row gutter={[16, 16]}>
              {featuredStreams.map(stream => (
                <Col xs={24} sm={12} lg={8} key={stream.id}>
                  <Card
                    hoverable
                    className="stream-card"
                    cover={
                      <div className="card-cover">
                        <Badge count="LIVE" className="live-badge" />
                        <Tag className="viewers-tag">
                          {stream.viewers.toLocaleString()} viewers
                        </Tag>
                      </div>
                    }
                  >
                    <Card.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={stream.title}
                      description={
                        <>
                          <div>{stream.streamer}</div>
                          <Tag className="category-tag">{stream.category}</Tag>
                        </>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          <div className="recommended-streams-section">
            <Title level={4}>Recommended Streams</Title>
          </div>
        </>
      )}
    </div>
  );
};

export default StreamingContent;
