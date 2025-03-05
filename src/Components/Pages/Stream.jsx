import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Input, 
  Select, 
  Switch, 
  Typography, 
  Space, 
  Divider, 
  Form,
  List,
  Avatar,
  Badge,
  Statistic,
  Tooltip,
  Modal,
  Tag,
  message
} from 'antd';
import { 
  SendOutlined, 
  SettingOutlined, 
  EyeOutlined, 
  HeartOutlined, 
  ShareAltOutlined, 
  GiftOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  UserOutlined,
  LockOutlined,
  UnlockOutlined,
  CopyOutlined,
  InfoCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import './Stream.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Stream = () => {
  const { id } = useParams();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamSettings, setStreamSettings] = useState({
    title: '',
    category: '',
    tags: [],
    description: '',
    isPrivate: false,
    allowComments: true,
    enableDonations: true,
    autoRecord: true,
    lowLatencyMode: true,
    quality: '1080p'
  });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [viewers, setViewers] = useState(0);
  const [likes, setLikes] = useState(0);
  const [streamKey, setStreamKey] = useState('xxxx-xxxx-xxxx-xxxx');
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const [cameraAccess, setCameraAccess] = useState(false);
  const [micAccess, setMicAccess] = useState(false);
  const [isRequestingMedia, setIsRequestingMedia] = useState(false);
  
  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    const generateStreamKey = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 16; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result.match(/.{1,4}/g).join('-');
    };
    
    setStreamKey(generateStreamKey());
  }, []);
  
  useEffect(() => {
    requestMediaAccess();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);
  
  const requestMediaAccess = async () => {
    setIsRequestingMedia(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setCameraAccess(true);
      setMicAccess(true);
      setStreamError(null);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setCameraAccess(false);
      setMicAccess(false);
      
      if (error.name === 'NotAllowedError') {
        setStreamError(
          'Camera and microphone access denied. Please allow access in your browser settings and reload the page.'
        );
      } else if (error.name === 'NotFoundError') {
        setStreamError(
          'No camera or microphone found. Please connect your devices and reload the page.'
        );
      } else if (error.name === 'NotReadableError') {
        setStreamError(
          'Your camera or microphone is already in use by another application.'
        );
      } else {
        setStreamError(
          `Could not access media devices: ${error.message}. Please check permissions.`
        );
      }
    } finally {
      setIsRequestingMedia(false);
    }
  };
  
  const handleRetryMediaAccess = async () => {
    setStreamError('Requesting camera and microphone access...');
    setIsRequestingMedia(true);
    
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicAccess(true);
      
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        const combinedStream = new MediaStream([
          ...audioStream.getAudioTracks(),
          ...videoStream.getVideoTracks()
        ]);
        
        if (videoRef.current) {
          videoRef.current.srcObject = combinedStream;
        }
        setCameraAccess(true);
        setStreamError(null);
      } catch (videoError) {
        if (videoRef.current) {
          videoRef.current.srcObject = audioStream;
        }
        setCameraAccess(false);
        setStreamError('Camera access denied, but microphone is working. You can stream with audio only.');
      }
    } catch (error) {
      setCameraAccess(false);
      setMicAccess(false);
      setStreamError(
        'Permission denied. Please enable camera and microphone access in your browser settings.'
      );
    } finally {
      setIsRequestingMedia(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    let viewersInterval;
    let likesInterval;
    if (isStreaming) {viewersInterval = setInterval(() => {
        setViewers(prev => {
          const increment = Math.floor(Math.random() * 3) + 1;
          return prev + increment;
        });
      }, 5000);
      
      likesInterval = setInterval(() => {
        const shouldAddLike = Math.random() > 0.6;
        if (shouldAddLike) {
          setLikes(prev => prev + 1);
          addSystemMessage('Someone liked your stream!');
        }
      }, 8000);
      

      addSystemMessage('Stream started! Waiting for viewers to join...');
      
      // Simulate first viewer joining after a few seconds
      setTimeout(() => {
        setViewers(1);
        addSystemMessage('First viewer has joined your stream!');
      }, 3000);
    }
    
    return () => {
      clearInterval(viewersInterval);
      clearInterval(likesInterval);
    };
  }, [isStreaming]);
  
  const addSystemMessage = (content) => {
    const systemMessage = {
      id: Date.now(),
      author: 'System',
      avatar: null,
      content,
      isSystem: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, systemMessage]);
  };
  
  const handleStartStream = () => {
    if (!streamSettings.title) {
      message.error('Please enter a stream title before starting');
      return;
    }
    
    if (!streamSettings.category) {
      message.error('Please select a category before starting');
      return;
    }
    
    if (!cameraAccess && !micAccess) {
      setConfirmModalVisible(true);
      return;
    }
    
    setIsStreaming(true);
    message.success('Stream started successfully!');
  };
  
  const handleStopStream = () => {
    setConfirmModalVisible(true);
  };
  
  const confirmStopStream = () => {
    setIsStreaming(false);
    setViewers(0);
    setLikes(0);
    setMessages([]);
    setConfirmModalVisible(false);
    message.info('Stream ended');
  };
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now(),
      author: 'You (Streamer)',
      avatar: null,
      content: newMessage,
      isStreamer: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };
  
  const handleSettingsChange = (key, value) => {
    setStreamSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleCopyStreamKey = () => {
    navigator.clipboard.writeText(streamKey);
    message.success('Stream key copied to clipboard');
  };
  
  const qualityOptions = [
    { value: '720p', label: '720p (HD)' },
    { value: '1080p', label: '1080p (Full HD)' },
    { value: '1440p', label: '1440p (QHD)' },
    { value: '2160p', label: '2160p (4K)' }
  ];
  
  const categoryOptions = [
    'Gaming', 'Music', 'Talk Show', 'Sports', 'Creative', 'IRL', 
    'Education', 'Food & Drink', 'Travel', 'Science & Technology'
  ];
  
  return (
    <div className="stream-container">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card className="stream-preview-card">
            <div className="stream-preview">
              {streamError ? (
                <div className="stream-error">
                  <InfoCircleOutlined className="error-icon" />
                  <Text type="danger">{streamError}</Text>
                  <Space direction="vertical" align="center">
                    <Button 
                      type="primary" 
                      icon={<ReloadOutlined />} 
                      onClick={handleRetryMediaAccess}
                      loading={isRequestingMedia}
                    >
                      {isRequestingMedia ? 'Requesting Access...' : 'Retry Access'}
                    </Button>
                    <Text type="secondary">
                      If you're seeing a permission error, check the camera icon in your browser's address bar
                      and make sure it's set to "Allow".
                    </Text>
                    <img 
                      src="/api/placeholder/300/150" 
                      alt="Browser permission example" 
                      className="permission-help-image"
                    />
                  </Space>
                </div>
              ) : (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline
                    className={`preview-video ${isStreaming ? 'live' : ''}`}
                  />
                  {isStreaming && <Badge count="LIVE" className="live-badge" />}
                </>
              )}
            </div>
            
            <div className="stream-controls">
              <Space direction="vertical" className="stream-info">
                <Input 
                  placeholder="Enter stream title" 
                  value={streamSettings.title}
                  onChange={e => handleSettingsChange('title', e.target.value)}
                  disabled={isStreaming}
                  className="stream-title-input"
                  maxLength={100}
                  suffix={
                    <Text type="secondary">
                      {streamSettings.title.length}/100
                    </Text>
                  }
                />
                
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Select
                      placeholder="Select category"
                      style={{ width: '100%' }}
                      value={streamSettings.category || undefined}
                      onChange={value => handleSettingsChange('category', value)}
                      disabled={isStreaming}
                    >
                      {categoryOptions.map(category => (
                        <Option key={category} value={category}>{category}</Option>
                      ))}
                    </Select>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Select
                      placeholder="Stream quality"
                      style={{ width: '100%' }}
                      value={streamSettings.quality}
                      onChange={value => handleSettingsChange('quality', value)}
                      disabled={isStreaming}
                    >
                      {qualityOptions.map(option => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                </Row>
              </Space>
              
              <Space className="stream-buttons">
                {isStreaming ? (
                  <Button 
                    type="primary" 
                    danger
                    size="large"
                    icon={<VideoCameraOutlined />}
                    onClick={handleStopStream}
                  >
                    End Stream
                  </Button>
                ) : (
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<VideoCameraOutlined />}
                    onClick={handleStartStream}
                    disabled={!cameraAccess && !micAccess}
                  >
                    Start Stream
                  </Button>
                )}
                
                <Button 
                  type="default" 
                  icon={<SettingOutlined />}
                  disabled={isStreaming}
                >
                  Settings
                </Button>
              </Space>
            </div>
            
            {isStreaming && (
              <div className="stream-stats">
                <Space size="large">
                  <Statistic 
                    title="Viewers" 
                    value={viewers} 
                    prefix={<EyeOutlined />} 
                  />
                  <Statistic 
                    title="Likes" 
                    value={likes} 
                    prefix={<HeartOutlined />} 
                  />
                  <Statistic 
                    title="Duration" 
                    value={<StreamTimer />} 
                  />
                </Space>
              </div>
            )}
          </Card>
          
          <Card className="stream-details-card">
            <Divider orientation="left">Stream Settings</Divider>
            <Form layout="vertical">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item label="Stream Description">
                    <TextArea 
                      rows={4} 
                      placeholder="Describe your stream..."
                      value={streamSettings.description}
                      onChange={e => handleSettingsChange('description', e.target.value)}
                      disabled={isStreaming}
                    />
                  </Form.Item>
                  
                  <Form.Item label="Tags">
                    <Select
                      mode="tags"
                      style={{ width: '100%' }}
                      placeholder="Add tags (e.g., gaming, music)"
                      value={streamSettings.tags}
                      onChange={value => handleSettingsChange('tags', value)}
                      disabled={isStreaming}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Stream Key">
                    <Input.Password
                      value={streamKey}
                      visibilityToggle={{
                        visible: showStreamKey,
                        onVisibleChange: setShowStreamKey,
                      }}
                      readOnly
                      addonAfter={
                        <Tooltip title="Copy stream key">
                          <CopyOutlined onClick={handleCopyStreamKey} />
                        </Tooltip>
                      }
                    />
                    <Text type="secondary">
                      Use this stream key in your streaming software (OBS, Streamlabs, etc.)
                    </Text>
                  </Form.Item>
                  
                  <div className="stream-options">
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Text>Private Stream</Text>
                        <Switch 
                          checked={streamSettings.isPrivate}
                          onChange={value => handleSettingsChange('isPrivate', value)}
                          disabled={isStreaming}
                        />
                      </Col>
                      <Col span={12}>
                        <Text>Allow Comments</Text>
                        <Switch 
                          checked={streamSettings.allowComments}
                          onChange={value => handleSettingsChange('allowComments', value)}
                        />
                      </Col>
                      <Col span={12}>
                        <Text>Enable Donations</Text>
                        <Switch 
                          checked={streamSettings.enableDonations}
                          onChange={value => handleSettingsChange('enableDonations', value)}
                          disabled={isStreaming}
                        />
                      </Col>
                      <Col span={12}>
                        <Text>Auto-Record</Text>
                        <Switch 
                          checked={streamSettings.autoRecord}
                          onChange={value => handleSettingsChange('autoRecord', value)}
                          disabled={isStreaming}
                        />
                      </Col>
                      <Col span={12}>
                        <Text>Low Latency Mode</Text>
                        <Switch 
                          checked={streamSettings.lowLatencyMode}
                          onChange={value => handleSettingsChange('lowLatencyMode', value)}
                          disabled={isStreaming}
                        />
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card className="chat-card" title="Stream Chat">
            <div className="chat-container">
              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div className="empty-chat">
                    <Text type="secondary">
                      {isStreaming 
                        ? "No messages yet. Your viewers' messages will appear here."
                        : "Chat will be available when you start streaming."}
                    </Text>
                  </div>
                ) : (
                  <List
                    dataSource={messages}
                    renderItem={msg => (
                      <List.Item className={`chat-message ${msg.isSystem ? 'system-message' : ''}`}>
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={
                            <Space>
                              <Text strong>
                                {msg.author}
                              </Text>
                              <Text type="secondary" className="message-time">
                                {msg.timestamp}
                              </Text>
                            </Space>
                          }
                          description={msg.content}
                        />
                      </List.Item>
                    )}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="chat-input">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onPressEnter={handleSendMessage}
                  disabled={!isStreaming || !streamSettings.allowComments}
                  suffix={
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSendMessage}
                      disabled={!isStreaming || !streamSettings.allowComments}
                    />
                  }
                />
              </div>
            </div>
          </Card>
          
          <Card className="stream-info-card" title="Device Status">
            <Space direction="vertical" className="device-status">
              <div className="device-item">
                <Badge status={cameraAccess ? "success" : "error"} />
                <Text>Camera: {cameraAccess ? "Connected" : "Not Connected"}</Text>
                {!cameraAccess && (
                  <Button 
                    type="link" 
                    onClick={handleRetryMediaAccess} 
                    size="small"
                    icon={<ReloadOutlined />}
                    disabled={isRequestingMedia}
                  >
                    Retry
                  </Button>
                )}
              </div>
              <div className="device-item">
                <Badge status={micAccess ? "success" : "error"} />
                <Text>Microphone: {micAccess ? "Connected" : "Not Connected"}</Text>
                {!micAccess && (
                  <Button 
                    type="link" 
                    onClick={handleRetryMediaAccess} 
                    size="small"
                    icon={<ReloadOutlined />}
                    disabled={isRequestingMedia}
                  >
                    Retry
                  </Button>
                )}
              </div>
              <div className="device-item">
                <Badge status={isStreaming ? "processing" : "default"} />
                <Text>Stream Status: {isStreaming ? "Live" : "Offline"}</Text>
              </div>
            </Space>
            
            {isStreaming && (
              <div className="stream-actions">
                <Divider orientation="left">Stream Actions</Divider>
                <Space>
                  <Button icon={<ShareAltOutlined />}>
                    Share Stream
                  </Button>
                  <Button icon={isStreaming && streamSettings.allowComments ? <UnlockOutlined /> : <LockOutlined />} 
                    onClick={() => handleSettingsChange('allowComments', !streamSettings.allowComments)}>
                    {streamSettings.allowComments ? "Disable Chat" : "Enable Chat"}
                  </Button>
                </Space>
              </div>
            )}
          </Card>
        </Col>
      </Row>
      
      <Modal
        title={isStreaming ? "End Stream?" : "Missing Device Access"}
        open={confirmModalVisible}
        onOk={isStreaming ? confirmStopStream : () => setConfirmModalVisible(false)}
        onCancel={() => setConfirmModalVisible(false)}
        okText={isStreaming ? "Yes, End Stream" : "Try Stream Anyway"}
        cancelText="Cancel"
      >
        {isStreaming ? (
          <p>Are you sure you want to end your stream? All viewers will be disconnected.</p>
        ) : (
          <div>
            <p>Your camera and/or microphone are not connected. Please check your device permissions.</p>
            <ul>
              <li>Camera: {cameraAccess ? "✅ Connected" : "❌ Not Connected"}</li>
              <li>Microphone: {micAccess ? "✅ Connected" : "❌ Not Connected"}</li>
            </ul>
            <p>You can still start streaming, but viewers won't be able to see or hear you.</p>
            <Button 
              type="link" 
              icon={<ReloadOutlined />}
              onClick={() => {
                setConfirmModalVisible(false);
                handleRetryMediaAccess();
              }}
            >
              Try to reconnect devices
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

const StreamTimer = () => {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };
  
  return formatTime(seconds);
};

export default Stream;