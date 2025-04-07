import React, { useEffect, useState } from "react";
import { Form, Input, Button, Avatar, Upload, message, Typography, Row, Col, List, Card } from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../Redux/userSlice.js";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import "./Profile.css";

const { Title } = Typography;

const ProfilePage = () => {
  const { uid } = useParams(); // uid for public profile view
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loggedInUser = useSelector((state) => state.user.firebaseUser);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [pastStreams, setPastStreams] = useState([]);

  // If uid exists and is not the logged in user, we're in public view mode.
  const isPublicProfile = uid && uid !== loggedInUser?.uid;

  useEffect(() => {
    if (isPublicProfile) {
      // Fetch public profile data for the given uid
      axios
        .get(`/api/profile/${uid}`)
        .then((res) => {
          setProfileData(res.data);
          setProfilePic(res.data.profilePic);
        })
        .catch((err) => {
          message.error("Failed to load profile data.");
          console.error(err);
        });
      // Fetch past streams for this streamer
      axios
        .get(`/api/streams/past/${uid}`)
        .then((res) => {
          setPastStreams(res.data);
        })
        .catch((err) => {
          console.error("Error fetching past streams:", err);
        });
    } else {
      if (!loggedInUser) {
        navigate("/login");
        return;
      }
      // For logged-in user, use Redux profile data
      setProfileData(loggedInUser);
      setProfilePic(loggedInUser.photoURL);
      form.setFieldsValue({
        username: loggedInUser.displayName || "",
        email: loggedInUser.email || "",
        bio: loggedInUser.bio || "",
      });
      // Optionally, fetch past streams for the logged-in user
      axios
        .get(`/api/streams/past/${loggedInUser.uid}`)
        .then((res) => {
          setPastStreams(res.data);
        })
        .catch((err) => {
          console.error("Error fetching past streams:", err);
        });
    }
  }, [uid, loggedInUser, isPublicProfile, form, navigate]);

  // Handle profile update for logged-in user only
  const handleUpdate = async (values) => {
    if (!loggedInUser) {
      message.error("No user data available.");
      return;
    }
    setLoading(true);
    try {
      const updatedUser = { ...loggedInUser, ...values, profilePic, bio: values.bio };
      await axios.put(`/api/users/${loggedInUser.uid}`, updatedUser);
      dispatch(updateUser(updatedUser));
      message.success("Profile updated successfully!");
    } catch (error) {
      message.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // Handle profile picture upload
  const handleProfilePicUpload = (info) => {
    if (info.file.status === "done") {
      const imageUrl = info.file?.response?.imageUrl || profilePic;
      setProfilePic(imageUrl);
      message.success("Profile picture updated!");
    } else if (info.file.status === "error") {
      message.error("Failed to upload profile picture.");
    }
  };

  return (
    <Row justify="center" align="middle" className="profile-container">
      <Col xs={24} sm={20} md={16} lg={12}>
        <div className="profile-box">
          <Title level={2}>Profile</Title>
          <Avatar size={100} src={profilePic || "/default-avatar.png"} icon={<UserOutlined />} />
          {!isPublicProfile && (
            <Upload
              name="profilePic"
              action="/api/upload"
              showUploadList={false}
              onChange={handleProfilePicUpload}
            >
              <Button icon={<UploadOutlined />}>Change Profile Picture</Button>
            </Upload>
          )}
          {isPublicProfile ? (
            <>
              <Title level={3}>{profileData?.name || "Streamer"}</Title>
              <p>{profileData?.bio}</p>
            </>
          ) : (
            <Form form={form} layout="vertical" onFinish={handleUpdate}>
              <Form.Item label="Username" name="username" rules={[{ required: true, message: "Enter your username" }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Email" name="email">
                <Input disabled />
              </Form.Item>
              <Form.Item label="Bio" name="bio">
                <Input.TextArea rows={3} placeholder="Tell us about yourself..." />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  Update Profile
                </Button>
              </Form.Item>
            </Form>
          )}
          <Title level={3} style={{ marginTop: 20 }}>
            Past Streams
          </Title>
          {pastStreams.length === 0 ? (
            <p>No past streams available</p>
          ) : (
            <List
              grid={{ gutter: 16, column: 2 }}
              dataSource={pastStreams}
              renderItem={(stream) => (
                <List.Item>
                  <Card
                    hoverable
                    cover={
                      <img alt="Past Stream" src={stream.thumbnail || "/default-stream.jpg"} />
                    }
                  >
                    <Card.Meta
                      title={stream.streamTitle}
                      description={`Ended on ${new Date(stream.endTime).toLocaleDateString()}`}
                    />
                    <div style={{ marginTop: 8 }}>
                      <Link to={`/livestreamingplatform/watch/${stream.streamerId}`}>
                        View Stream
                      </Link>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          )}
        </div>
      </Col>
    </Row>
  );
};

export default ProfilePage;
