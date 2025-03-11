// import React, { useState, useEffect } from 'react';
// import { Layout, Menu, Input, Button, Avatar, Badge, Row, Col, Typography, Space } from 'antd';
// import {
//   MenuFoldOutlined, MenuUnfoldOutlined, HomeOutlined, VideoCameraOutlined,
//   UserOutlined, BellOutlined, FireOutlined,

// } from '@ant-design/icons';
// import Logo from '../../assets/logo1.png';
// import './Main.css';
// import { Outlet, useLocation, useNavigate } from 'react-router-dom';

// const { Header, Sider, Content, Footer } = Layout;
// const { Title } = Typography;
// const { Search } = Input;

// const LiveStreamingPlatform = () => {
//   const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
//   const [selectedkey, setSelectedkey] = useState("/livestreamingplatform");

//   const location = useLocation();
//   const navigate = useNavigate();

//   useEffect(() => {
//     setSelectedkey(location.pathname);
//   }, [location.pathname]);

//   const handlemenuClick = ({ key }) => {
//     setSelectedkey(key);
//     navigate(key);
//   };

//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth < 768 && !collapsed) {
//         setCollapsed(true);
//       }
//     };
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, [collapsed]);

//   const channels = [
//     { id: 'channel1', name: 'Channel 1' },
//     { id: 'channel2', name: 'Channel 2' },
//     { id: 'channel3', name: 'Channel 3' },
//     { id: 'channel4', name: 'Channel 4' },
//     { id: 'channel5', name: 'Channel 5' },
//     { id: 'channel6', name: 'Channel 6' },
//     { id: 'channel7', name: 'Channel 7' },
//   ];

//   return (
//     <Layout className="live-streaming-layout">
//       <Sider
//         trigger={null}
//         collapsible
//         collapsed={collapsed}
//         className="custom-sider"
//       >
//         <div className="demo-logo-vertical">
//           <img src={Logo} alt="Logo" className="logo-img" />
//           {!collapsed && (
//             <Title level={4} className="logo-text" style={{ color: 'white' }}>
//               Touch Live
//             </Title>
//           )}
//         </div>

//         <Menu
//           theme="dark"
//           mode="inline"
//           selectedKeys={[selectedkey]}
//           onClick={handlemenuClick}
//           items={[
//             {
//               key: '/livestreamingplatform',
//               icon: <HomeOutlined />,
//               label: 'Browse',
//             },
//             {
//               key: '/livestreamingplatform/stream/:id',
//               icon: <VideoCameraOutlined />,
//               label: 'Start Streaming',
//             },
//             {
//               key: '/livestreamingplatform/following',
//               icon: <FireOutlined />,
//               label: 'Following',
//             },
//             {
//               key: '/livestreamingplatform/profile',
//               icon: <UserOutlined />,
//               label: 'Profile',
//             },
//           ]}
//         />

//         {!collapsed && (
//           <div className="recommended-section">
//             <Title level={5} className="recommended-title" style={{ color: 'white' }}>RECOMMENDED</Title>
//             <Menu
//               theme="dark"
//               mode="inline"
//               selectedKeys={[selectedkey]}
//               onClick={handlemenuClick}
//             >
//               {channels.map((channel) => (
//                 <Menu.Item
//                   key={`/livestreamingplatform/channel/${channel.id}`}
//                   icon={<Avatar size="small" icon={<UserOutlined />} style={{ color: 'white' }} />}
//                 >
//                   {channel.name}
//                 </Menu.Item>
//               ))}
//             </Menu>

//           </div>
//         )}
//       </Sider>

//       <Layout>
//         <Header className="custom-header">
//           <Row align="middle" justify="space-between" className="header-row">
//             <Col flex="none" className="header-left">
//               <Button
//                 type="text"
//                 icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
//                 onClick={() => setCollapsed(!collapsed)}
//                 className="toggle-btn"
//               />
//             </Col>

//             <Col flex="auto" className="header-center">
//               <Search
//                 placeholder="Search streams..."
//                 size="large"
//                 enterButton
//                 className="search-input"
//               />
//             </Col>

//             <Col flex="none" className="header-right">
//               <Space size="large">
//                 <Badge count={5}>
//                   <BellOutlined style={{ fontSize: '20px' }} />
//                 </Badge>
//                 <Avatar icon={<UserOutlined />} />
//               </Space>
//             </Col>
//           </Row>
//         </Header>

//         <Content className="custom-content">
//           <Outlet />
//         </Content>

//         <Footer className="custom-footer">
//           © 2025 Touch Live. All Rights Reserved.
//         </Footer>
//       </Layout>
//     </Layout>
//   );
// };

// export default LiveStreamingPlatform;

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Input, Button, Avatar, Badge, Row, Col, Typography, Space } from 'antd';
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
  const [selectedkey, setSelectedkey] = useState("/livestreamingplatform");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSelectedkey(location.pathname);
  }, [location.pathname]);

  const handlemenuClick = ({ key }) => {
    setSelectedkey(key);
    navigate(key);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && !collapsed) {
        setCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed]);

  const channels = [
    { id: 'channel1', name: 'Channel 1' },
    { id: 'channel2', name: 'Channel 2' },
    { id: 'channel3', name: 'Channel 3' },
    { id: 'channel4', name: 'Channel 4' },
    { id: 'channel5', name: 'Channel 5' },
    { id: 'channel6', name: 'Channel 6' },
    { id: 'channel7', name: 'Channel 7' },
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
          selectedKeys={[selectedkey]}
          onClick={handlemenuClick}
          items={[
            {
              key: '/livestreamingplatform',
              icon: <HomeOutlined />,
              label: 'Browse',
            },
            {
              key: '/livestreamingplatform/stream/:id',
              icon: <VideoCameraOutlined />,
              label: 'Start Streaming',
            },
            {
              key: '/livestreamingplatform/following',
              icon: <FireOutlined />,
              label: 'Following',
            },
            {
              key: '/livestreamingplatform/profile',
              icon: <UserOutlined />,
              label: 'Profile',
            },
          ]}
        />

        {!collapsed && (
          <div className="recommended-section">
            <Title level={5} className="recommended-title" style={{ color: 'white' }}>
              RECOMMENDED
            </Title>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[selectedkey]}
              onClick={handlemenuClick}
              items={channels.map((channel) => ({
                key: `/livestreamingplatform/channel/${channel.id}`,
                icon: <Avatar size="small" icon={<UserOutlined />} style={{ color: 'white' }} />,
                label: channel.name,
              }))}
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
                <Avatar icon={<UserOutlined />} />
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
