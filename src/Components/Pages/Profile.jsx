import React, { useState } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Avatar, 
  Typography, 
  Tabs, 
  Button, 
  List, 
  Tag, 
  Statistic, 
  Divider, 
  Space, 
  Empty 
} from 'antd';
import { 
  UserOutlined, 
  EyeOutlined,
  EditOutlined, 
  SettingOutlined, 
  VideoCameraOutlined,
  HeartOutlined,
  TeamOutlined,
  TrophyOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import './Profile.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('1');
  
  // Mock data - replace with actual data in your application
  const userData = {
    username: 'JohnDoe',
    displayName: 'John Doe',
    bio: 'Content creator passionate about gaming and tech. Streaming live 3 times a week!',
    followers: 5842,
    following: 347,
    totalViews: 128400,
    joinDate: 'January 2024',
    achievements: [
      { name: 'Rising Star', color: 'gold' },
      { name: ' 5K Followers', color: 'purple' },
      { name: '100K Views', color: 'blue' }
    ]
  };
  
  const pastStreams = [
    { id: 1, title: 'Apex Legends Season 19 Gameplay', date: '2 days ago', views: 3240, duration: '3h 42m' },
    { id: 2, title: 'Let\'s chat and chill', date: '5 days ago', views: 2187, duration: '1h 15m' },
    { id: 3, title: 'Minecraft Building Challenge', date: '1 week ago', views: 4521, duration: '2h 30m' },
  ];
  
  const scheduledStreams = [
    { id: 1, title: 'Valorant Ranked Games', date: 'Tomorrow at 8 PM', description: 'Trying to reach Diamond rank!' },
    { id: 2, title: 'Q&A Session', date: 'Friday at 7 PM', description: 'Ask me anything about streaming and content creation' },
  ];

  return (
    <div className="profile-container">
      <Row gutter={[24, 24]}>
        {/* Profile Header Section */}
        <Col xs={24}>
          <Card className="profile-header-card">
            <Row gutter={[24, 24]} align="middle" wrap={true}>
              <Col xs={24} sm={8} md={6} lg={4} className="avatar-container">
                <Avatar size={120} icon={<UserOutlined />} className="profile-avatar" />
              </Col>
              
              <Col xs={24} sm={16} md={18} lg={20}>
                <Row>
                  <Col xs={24} sm={16}>
                    <Title level={2} className="profile-name">{userData.displayName}</Title>
                    <Text type="secondary">@{userData.username}</Text>
                    <Paragraph className="profile-bio">{userData.bio}</Paragraph>
                    
                    <Space size="middle" wrap className="profile-tags">
                      <Text><ClockCircleOutlined /> Joined {userData.joinDate}</Text>
                      {userData.achievements.map((achievement, index) => (
                        <Tag color={achievement.color} key={index}>
                          <TrophyOutlined /> {achievement.name}
                        </Tag>
                      ))}
                    </Space>
                  </Col>
                  
                  <Col xs={24} sm={8} className="profile-actions">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button type="primary" icon={<EditOutlined />} block>
                        Edit Profile
                      </Button>
                      <Button icon={<SettingOutlined />} block>
                        Settings
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>
        
        {/* Stats Section */}
        <Col xs={24}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic 
                  title="Followers" 
                  value={userData.followers} 
                  prefix={<TeamOutlined />} 
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic 
                  title="Following" 
                  value={userData.following} 
                  prefix={<HeartOutlined />} 
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic 
                  title="Total Views" 
                  value={userData.totalViews} 
                  prefix={<VideoCameraOutlined />} 
                />
              </Card>
            </Col>
          </Row>
        </Col>
        
        {/* Content Tabs Section */}
        <Col xs={24}>
          <Card className="content-tabs-card">
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              type="card"
              size="large"
            >
              <TabPane tab="Past Streams" key="1">
                {pastStreams.length > 0 ? (
                  <List
                    itemLayout="vertical"
                    dataSource={pastStreams}
                    renderItem={item => (
                      <List.Item
                        key={item.id}
                        actions={[
                          <Text key="views"><EyeOutlined /> {item.views} views</Text>,
                          <Text key="duration"><ClockCircleOutlined /> {item.duration}</Text>,
                          <Text key="date">{item.date}</Text>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar icon={<VideoCameraOutlined />} style={{ backgroundColor: '#ff4d4f' }} />}
                          title={<a href={`/livestreamingplatform/stream/${item.id}`}>{item.title}</a>}
                          description={`Streamed ${item.date}`}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="No past streams found" />
                )}
              </TabPane>
              
              <TabPane tab="Scheduled Streams" key="2">
                {scheduledStreams.length > 0 ? (
                  <List
                    itemLayout="vertical"
                    dataSource={scheduledStreams}
                    renderItem={item => (
                      <List.Item
                        key={item.id}
                        actions={[
                          <Button key="reminder" type="primary" size="small">Set Reminder</Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar icon={<ClockCircleOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                          title={item.title}
                          description={
                            <>
                              <div><Text strong>{item.date}</Text></div>
                              <div>{item.description}</div>
                            </>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="No scheduled streams" />
                )}
              </TabPane>
              
              <TabPane tab="About" key="3">
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <Card title="Channel Info" bordered={false}>
                      <Paragraph>
                        <Text strong>Bio: </Text>{userData.bio}
                      </Paragraph>
                      <Divider />
                      <Paragraph>
                        <Text strong>Joined: </Text>{userData.joinDate}
                      </Paragraph>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card title="Achievements" bordered={false}>
                      {userData.achievements.map((achievement, index) => (
                        <Tag color={achievement.color} key={index} style={{ margin: '5px' }}>
                          <TrophyOutlined /> {achievement.name}
                        </Tag>
                      ))}
                    </Card>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;