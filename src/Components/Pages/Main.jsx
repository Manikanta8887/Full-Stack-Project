import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Input,
  Button,
  Card,
  Avatar,
  Badge,
  Tag,
  Row,
  Col,
  Typography,
  Space,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  VideoCameraOutlined,
  UserOutlined,
  BellOutlined,
  FireOutlined,
  GiftOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import Logo from '../../assets/logo1.png';
import './Main.css';

const { Header, Sider, Content, Footer } = Layout;
const { Title } = Typography;
const { Search } = Input;

const LiveStreamingPlatform = () => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && !collapsed) {
        setCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed]);

  const featuredStreams = [
    { id: 1, title: "Gaming Championship", streamer: "ProGamer", viewers: 15420, category: "Gaming" },
    { id: 2, title: "Cooking Show Live", streamer: "ChefMaster", viewers: 8750, category: "Cooking" },
    { id: 3, title: "Music Concert", streamer: "MusicArtist", viewers: 12300, category: "Music" },
  ];

  const categories = [
    "Gaming", "Music", "Sports", "Creative", "IRL", "Esports", "Education", "Entertainment"
  ];

  return (
    <Layout className="live-streaming-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="custom-sider"
      >
        <div className="demo-logo-vertical">
          <img src={Logo} alt="Logo" className="logo-img" />
          {!collapsed && (
            <Title level={4} className="logo-text" style={{ color: 'white' }}>
              Touch Live
            </Title>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <HomeOutlined />,
              label: 'Browse',
            },
            {
              key: '2',
              icon: <VideoCameraOutlined />,
              label: 'Start Streaming',
            },
            {
              key: '3',
              icon: <FireOutlined />,
              label: 'Following',
            },
          ]}
        />

        {!collapsed && (
          <div className="recommended-section">
            <Title level={5} className="recommended-title" style={{ color: 'white' }}>RECOMMENDED</Title>
            <Menu
              theme="dark"
              mode="inline"
              items={[
                {
                  key: 'channel1',
                  icon: <Avatar size="small" icon={<UserOutlined />} style={{ color: 'white' }} />,
                  label: 'Channel 1',
                },
                {
                  key: 'channel2',
                  icon: <Avatar size="small" icon={<UserOutlined />} style={{ color: 'white' }} />,
                  label: 'Channel 2',
                },
              ]}
            />
          </div>
        )}
      </Sider>

      <Layout>
        <Header className="custom-header">
          <Row align="middle" justify="space-between" className="header-row">
            <Col flex="none" className="header-left">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="toggle-btn"
              />
            </Col>

            <Col flex="auto" className="header-center">
              <Search
                placeholder="Search streams..."
                size="large"
                enterButton
                className="search-input"
              />
            </Col>

            <Col flex="none" className="header-right">
              <Space size="large">
                <Badge count={5}>
                  <BellOutlined style={{ fontSize: '20px' }} />
                </Badge>
                <MessageOutlined style={{ fontSize: '20px' }} />
                <GiftOutlined style={{ fontSize: '20px' }} />
                <Avatar icon={<UserOutlined />} />
              </Space>
            </Col>
          </Row>
        </Header>

        <Content className="custom-content">
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
        </Content>

        <Footer className="custom-footer">
          © 2025 Touch Live. All Rights Reserved.
        </Footer>
      </Layout>
    </Layout>
  );
};

export default LiveStreamingPlatform;
