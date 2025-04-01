import React, { useState, useEffect } from 'react';
import { Layout, Menu, Input, Button, Avatar, Row, Col, Typography, Space, Badge } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { setFirebaseUser, logoutUser } from '../Redux/Store';
import {
  MenuFoldOutlined, MenuUnfoldOutlined, HomeOutlined, VideoCameraOutlined,
  UserOutlined, BellOutlined, FireOutlined,
} from '@ant-design/icons';
import Logo from '../../assets/logo1.png';
import './Main.css';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content, Footer } = Layout;
const { Title } = Typography;
const { Search } = Input;

const LiveStreamingPlatform = () => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const [selectedKey, setSelectedKey] = useState("/livestreamingplatform");
  const auth = getAuth();
  const dispatch = useDispatch();
  const firebaseUser = useSelector((state) => state.auth.firebaseUser);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSelectedKey(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setFirebaseUser({ 
          uid: user.uid, 
          email: user.email, 
          displayName: user.displayName, 
          photoURL: user.photoURL || null, 
        }));
      } else {
        dispatch(setFirebaseUser(null));
      }
    });
  
    return () => unsubscribe();
  }, [auth, dispatch]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logoutUser());
      navigate('/login'); 
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const channels = [
    { id: 'channel1', name: 'Channel 1' },
    { id: 'channel2', name: 'Channel 2' },
    { id: 'channel3', name: 'Channel 3' },
    { id: 'channel4', name: 'Channel 4' },
    { id: 'channel5', name: 'Channel 5' },
    { id: 'channel6', name: 'Channel 6' }
  ];

  return (
    <Layout className="live-streaming-layout">
      <Sider trigger={null} collapsible collapsed={collapsed} className="custom-sider">
        <div className="demo-logo-vertical">
          <img src={Logo} alt="Logo" className="logo-img" />
          {!collapsed && (
            <Title level={4} className="logo-text" style={{ color: 'white' }}>
              Touch Live
            </Title>
          )}
        </div>

        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]} onClick={({ key }) => navigate(key)}
          items={[
            { key: '/livestreamingplatform', icon: <HomeOutlined />, label: 'Browse' },
            { key: '/livestreamingplatform/stream/:id', icon: <VideoCameraOutlined />, label: 'Start Streaming' },
            { key: '/livestreamingplatform/following', icon: <FireOutlined />, label: 'Following' },
            { key: '/livestreamingplatform/profile', icon: <UserOutlined />, label: 'Profile' },
          ]}
        />

        {!collapsed && (
          <div className="recommended-section">
            <Title level={5} className="recommended-title" style={{ color: 'white' }}>
              RECOMMENDED
            </Title>
            <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]} onClick={({ key }) => navigate(key)}
              items={channels.map((channel) => ({
                key: `/livestreamingplatform/channel/${channel.id}`,
                icon: <Avatar size="small" icon={<UserOutlined />} style={{ color: 'white' }} />,
                label: channel.name,
              }))}
            />

            <div className="auth-button-container" style={{ padding: '16px', textAlign: 'center' }}>
              {firebaseUser ? (
                <Button type="primary" danger block onClick={handleLogout}>
                  Logout
                </Button>
              ) : (
                <Button type="primary" block onClick={() => navigate('/login')}>
                  Login
                </Button>
              )}
            </div>
          </div>
        )}
      </Sider>

      <Layout>
        <Header className="custom-header">
          <Row align="middle" justify="space-between" className="header-row" style={{ width: '100%' }}>
            <Col flex="none">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="toggle-btn"
              />
            </Col>

            <Col flex="auto" style={{ display: 'flex', justifyContent: 'center' }}>
              <Search
                placeholder="Search streams..."
                size="large"
                enterButton
                className="search-input"
                style={{ width: '100%', maxWidth: '400px' }}
              />
            </Col>

            <Col flex="none">
              <Space size="large">
                {firebaseUser ? (
                  <Avatar 
                    src={firebaseUser.photoURL} 
                    icon={!firebaseUser.photoURL && <UserOutlined />} 
                    alt="Profile"
                  />
                ) : (
                  <Avatar icon={<UserOutlined />} />
                )}
                <Badge count={3}>
                  <BellOutlined style={{ fontSize: '20px', color: '#fff' }} />
                </Badge>
              </Space>
            </Col>
          </Row>
        </Header>

        <Content className="custom-content">
          <Outlet />
        </Content>

        <Footer className="custom-footer">
          © 2025 Touch Live. All Rights Reserved.
        </Footer>
      </Layout>
    </Layout>
  );
};

export default LiveStreamingPlatform;
