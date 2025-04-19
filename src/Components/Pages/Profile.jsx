// // import React, { useEffect, useState } from "react";
// // import { Form, Input, Button, Avatar, Upload, message, Typography, Row, Col, List, Card } from "antd";
// // import { UploadOutlined, UserOutlined } from "@ant-design/icons";
// // import { useSelector, useDispatch } from "react-redux";
// // import { updateUser } from "../Redux/userSlice.js";
// // import axios from "axios";
// // import { useNavigate, useParams, Link } from "react-router-dom";
// // import "./Profile.css";

// // const { Title } = Typography;

// // const ProfilePage = () => {
// //   const { uid } = useParams(); // uid for public profile view
// //   const dispatch = useDispatch();
// //   const navigate = useNavigate();
// //   const loggedInUser = useSelector((state) => state.user.firebaseUser);
// //   const [form] = Form.useForm();
// //   const [loading, setLoading] = useState(false);
// //   const [profilePic, setProfilePic] = useState("");
// //   const [profileData, setProfileData] = useState(null);
// //   const [pastStreams, setPastStreams] = useState([]);

// //   // If uid exists and is not the logged in user, we're in public view mode.
// //   const isPublicProfile = uid && uid !== loggedInUser?.uid;

// //   useEffect(() => {
// //     if (isPublicProfile) {
// //       // Fetch public profile data for the given uid
// //       axios
// //         .get(`/api/profile/${uid}`)
// //         .then((res) => {
// //           setProfileData(res.data);
// //           setProfilePic(res.data.profilePic);
// //         })
// //         .catch((err) => {
// //           message.error("Failed to load profile data.");
// //           console.error(err);
// //         });
// //       // Fetch past streams for this streamer
// //       axios
// //         .get(`/api/streams/past/${uid}`)
// //         .then((res) => {
// //           setPastStreams(res.data);
// //         })
// //         .catch((err) => {
// //           console.error("Error fetching past streams:", err);
// //         });
// //     } else {
// //       if (!loggedInUser) {
// //         navigate("/login");
// //         return;
// //       }
// //       // For logged-in user, use Redux profile data
// //       setProfileData(loggedInUser);
// //       setProfilePic(loggedInUser.photoURL);
// //       form.setFieldsValue({
// //         username: loggedInUser.displayName || "",
// //         email: loggedInUser.email || "",
// //         bio: loggedInUser.bio || "",
// //       });
// //       // Optionally, fetch past streams for the logged-in user
// //       axios
// //         .get(`/api/streams/past/${loggedInUser.uid}`)
// //         .then((res) => {
// //           setPastStreams(res.data);
// //         })
// //         .catch((err) => {
// //           console.error("Error fetching past streams:", err);
// //         });
// //     }
// //   }, [uid, loggedInUser, isPublicProfile, form, navigate]);

// //   // Handle profile update for logged-in user only
// //   const handleUpdate = async (values) => {
// //     if (!loggedInUser) {
// //       message.error("No user data available.");
// //       return;
// //     }
// //     setLoading(true);
// //     try {
// //       const updatedUser = { ...loggedInUser, ...values, profilePic, bio: values.bio };
// //       await axios.put(`/api/users/${loggedInUser.uid}`, updatedUser);
// //       dispatch(updateUser(updatedUser));
// //       message.success("Profile updated successfully!");
// //     } catch (error) {
// //       message.error("Failed to update profile.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Handle profile picture upload
// //   const handleProfilePicUpload = (info) => {
// //     if (info.file.status === "done") {
// //       const imageUrl = info.file?.response?.imageUrl || profilePic;
// //       setProfilePic(imageUrl);
// //       message.success("Profile picture updated!");
// //     } else if (info.file.status === "error") {
// //       message.error("Failed to upload profile picture.");
// //     }
// //   };

// //   return (
// //     <Row justify="center" align="middle" className="profile-container">
// //       <Col xs={24} sm={20} md={16} lg={12}>
// //         <div className="profile-box">
// //           <Title level={2}>Profile</Title>
// //           <Avatar size={100} src={profilePic || "/default-avatar.png"} icon={<UserOutlined />} />
// //           {!isPublicProfile && (
// //             <Upload
// //               name="profilePic"
// //               action="/api/upload"
// //               showUploadList={false}
// //               onChange={handleProfilePicUpload}
// //             >
// //               <Button icon={<UploadOutlined />}>Change Profile Picture</Button>
// //             </Upload>
// //           )}
// //           {isPublicProfile ? (
// //             <>
// //               <Title level={3}>{profileData?.name || "Streamer"}</Title>
// //               <p>{profileData?.bio}</p>
// //             </>
// //           ) : (
// //             <Form form={form} layout="vertical" onFinish={handleUpdate}>
// //               <Form.Item label="Username" name="username" rules={[{ required: true, message: "Enter your username" }]}>
// //                 <Input />
// //               </Form.Item>
// //               <Form.Item label="Email" name="email">
// //                 <Input disabled />
// //               </Form.Item>
// //               <Form.Item label="Bio" name="bio">
// //                 <Input.TextArea rows={3} placeholder="Tell us about yourself..." />
// //               </Form.Item>
// //               <Form.Item>
// //                 <Button type="primary" htmlType="submit" loading={loading} block>
// //                   Update Profile
// //                 </Button>
// //               </Form.Item>
// //             </Form>
// //           )}
// //           <Title level={3} style={{ marginTop: 20 }}>
// //             Past Streams
// //           </Title>
// //           {pastStreams.length === 0 ? (
// //             <p>No past streams available</p>
// //           ) : (
// //             <List
// //               grid={{ gutter: 16, column: 2 }}
// //               dataSource={pastStreams}
// //               renderItem={(stream) => (
// //                 <List.Item>
// //                   <Card
// //                     hoverable
// //                     cover={
// //                       <img alt="Past Stream" src={stream.thumbnail || "/default-stream.jpg"} />
// //                     }
// //                   >
// //                     <Card.Meta
// //                       title={stream.streamTitle}
// //                       description={`Ended on ${new Date(stream.endTime).toLocaleDateString()}`}
// //                     />
// //                     <div style={{ marginTop: 8 }}>
// //                       <Link to={`/livestreamingplatform/watch/${stream.streamerId}`}>
// //                         View Stream
// //                       </Link>
// //                     </div>
// //                   </Card>
// //                 </List.Item>
// //               )}
// //             />
// //           )}
// //         </div>
// //       </Col>
// //     </Row>
// //   );
// // };

// // export default ProfilePage;


// // src/pages/ProfilePage.jsx
// import React, { useEffect, useState, useMemo } from "react";
// import {
//   Form,
//   Input,
//   Button,
//   Avatar,
//   Upload,
//   message,
//   Typography,
//   Row,
//   Col,
//   Progress,
// } from "antd";
// import { UploadOutlined, UserOutlined } from "@ant-design/icons";
// import { useSelector, useDispatch } from "react-redux";
// import { updateUser } from "../Redux/userSlice.js";
// import axios from "axios";
// import { useNavigate, useParams } from "react-router-dom";
// import "./Profile.css";

// const { Title } = Typography;
// const MAX_STORAGE = 1024 * 1024 * 1024; // 1 GB in bytes

// const ProfilePage = () => {
//   const { uid } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const loggedIn = useSelector((s) => s.user.firebaseUser);
//   const isPublic = uid && uid !== loggedIn?.uid;

//   const [form] = Form.useForm();
//   const [profileData, setProfileData] = useState(null);
//   const [videos, setVideos] = useState([]);
//   const [uploading, setUploading] = useState(false);

//   useEffect(() => {
//     const targetUid = isPublic ? uid : loggedIn?.uid;
//     if (!targetUid) {
//       navigate("/login");
//       return;
//     }

//     if (isPublic) {
//       axios
//         .get(`/api/profile/${uid}`)
//         .then((res) => setProfileData(res.data))
//         .catch(() => message.error("Failed to load profile data."));
//     } else {
//       setProfileData(loggedIn);
//       form.setFieldsValue({
//         username: loggedIn.displayName,
//         email: loggedIn.email,
//         bio: loggedIn.bio,
//       });
//     }

//     // Fetch videos with fallback
//     axios
//       .get(`/api/videos/${targetUid}`)
//       .then((res) => setVideos(res.data.videos || []))
//       .catch(() => {
//         console.error("Error fetching user videos for", targetUid);
//         setVideos([]);
//       });
//   }, [uid, loggedIn, isPublic, form, navigate]);

//   // Compute storage usage
//   const usedBytes = useMemo(
//     () => (videos || []).reduce((sum, v) => sum + (v.sizeInBytes || 0), 0),
//     [videos]
//   );
//   const usedMB = (usedBytes / (1024 * 1024)).toFixed(1);
//   const percent = ((usedBytes / MAX_STORAGE) * 100).toFixed(1);

//   // Upload handlers
//   const beforeUpload = (file) => {
//     if (usedBytes + file.size > MAX_STORAGE) {
//       message.error("Uploading this would exceed your 1 GB quota.");
//       return Upload.LIST_IGNORE;
//     }
//     return true;
//   };
//   const handleVideoUpload = ({ file }) => {
//     if (file.status === "uploading") {
//       setUploading(true);
//     } else if (file.status === "done") {
//       const v = file.response.video;
//       setVideos((prev) => [...prev, v]);
//       message.success("Video uploaded!");
//       setUploading(false);
//     } else if (file.status === "error") {
//       message.error("Video upload failed.");
//       setUploading(false);
//     }
//   };

//   const onFinish = async (vals) => {
//     try {
//       const updated = { ...loggedIn, ...vals };
//       await axios.put(`/api/users/${loggedIn.uid}`, updated);
//       dispatch(updateUser(updated));
//       message.success("Profile updated!");
//     } catch {
//       message.error("Update failed.");
//     }
//   };

//   const playVideo = (id) => {
//     const vid = document.getElementById(id);
//     if (vid) {
//       vid.style.display = "block";
//       vid.play();
//     }
//   };

//   return (
//     <Row justify="center" align="middle" className="profile-container">
//       <Col xs={24} sm={20} md={16} lg={12}>
//         <div className="profile-box">
//           <Title level={2}>Profile</Title>
//           <Avatar
//             size={100}
//             src={profileData?.photoURL || "/default-avatar.png"}
//             icon={<UserOutlined />}
//           />

//           {!isPublic && (
//             <Upload
//               name="video"
//               action={`/api/upload-video/${loggedIn.uid}`}
//               beforeUpload={beforeUpload}
//               onChange={handleVideoUpload}
//               showUploadList={false}
//               accept="video/*"
//             >
//               <Button icon={<UploadOutlined />} loading={uploading}>
//                 Upload Video
//               </Button>
//             </Upload>
//           )}

//           {/* Storage Usage */}
//           <div style={{ margin: "16px 0" }}>
//             <Progress percent={Number(percent)} />
//             <div>
//               Used {usedMB} MB of {Math.round(MAX_STORAGE / (1024 * 1024))} MB (
//               {percent}%)
//             </div>
//           </div>

//           {/* Video Gallery */}
//           <Title level={4}>Your Videos</Title>
//           <div className="video-gallery">
//             { (videos?.length ?? 0) === 0 && <p>No videos uploaded yet.</p> }
//             { (videos || []).map((v) => (
//               <div
//                 key={v.public_id}
//                 className="video-box"
//                 style={{ display: "inline-block", margin: 8 }}
//               >
//                 <img
//                   src={v.coverImage}
//                   alt="cover"
//                   style={{ cursor: "pointer", width: 200 }}
//                   onClick={() => playVideo(v.public_id)}
//                 />
//                 <video
//                   id={v.public_id}
//                   src={v.url}
//                   controls
//                   style={{ display: "none", width: 200 }}
//                   onClick={(e) => e.stopPropagation()}
//                   onPlay={(e) => (e.target.style.display = "block")}
//                 />
//               </div>
//             )) }
//           </div>

//           {/* Profile Form (only for self) */}
//           {!isPublic && (
//             <Form
//               form={form}
//               layout="vertical"
//               onFinish={onFinish}
//               style={{ marginTop: 24 }}
//             >
//               <Form.Item
//                 label="Username"
//                 name="username"
//                 rules={[{ required: true }]}
//               >
//                 <Input />
//               </Form.Item>
//               <Form.Item label="Email" name="email">
//                 <Input disabled />
//               </Form.Item>
//               <Form.Item label="Bio" name="bio">
//                 <Input.TextArea rows={3} />
//               </Form.Item>
//               <Form.Item>
//                 <Button type="primary" htmlType="submit" block>
//                   Update Profile
//                 </Button>
//               </Form.Item>
//             </Form>
//           )}
//         </div>
//       </Col>
//     </Row>
//   );
// };

// export default ProfilePage;

// src/pages/ProfilePage.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  message,
  Typography,
  Row,
  Col,
  Progress,
} from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../Redux/userSlice.js";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./Profile.css";

const { Title } = Typography;
const MAX_STORAGE = 1024 * 1024 * 1024; // 1 GB

const ProfilePage = () => {
  const { uid } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loggedIn = useSelector((s) => s.user.firebaseUser);
  const isPublic = uid && uid !== loggedIn?.uid;

  const [form] = Form.useForm();
  const [profileData, setProfileData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showBioInput, setShowBioInput] = useState(false);


  useEffect(() => {
    const targetUid = isPublic ? uid : loggedIn?.uid;
    if (!targetUid) return navigate("/login");
    if (isPublic) {
      axios
        .get(`/api/profile/${uid}`)
        .then((res) => setProfileData(res.data))
        .catch(() => message.error("Failed to load profile data."));
    } else {
      setProfileData(loggedIn);
      form.setFieldsValue({ bio: loggedIn.bio });
    }
    axios
      .get(`/api/videos/${targetUid}`)
      .then((res) => setVideos(res.data.videos || []))
      .catch(() => setVideos([]));
  }, [uid, loggedIn, isPublic, form, navigate]);

  // Storage calc
  const usedBytes = useMemo(
    () => videos.reduce((sum, v) => sum + (v.sizeInBytes || 0), 0),
    [videos]
  );
  const usedMB = (usedBytes / (1024 * 1024)).toFixed(1);
  const percent = ((usedBytes / MAX_STORAGE) * 100).toFixed(1);

  // Upload handlers
  const beforeUpload = (file) => {
    if (usedBytes + file.size > MAX_STORAGE) {
      message.error("Uploading this would exceed your 1 GB quota.");
      return Upload.LIST_IGNORE;
    }
    return true;
  };
  const handleVideoUpload = ({ file }) => {
    if (file.status === "uploading") setUploading(true);
    else if (file.status === "done") {
      setVideos((prev) => [...prev, file.response.video]);
      message.success("Video uploaded!");
      setUploading(false);
    } else if (file.status === "error") {
      message.error("Video upload failed.");
      setUploading(false);
    }
  };

  const onBioFinish = async ({ bio }) => {
    try {
      const updated = { ...loggedIn, bio };
      await axios.put(`/api/users/${loggedIn.uid}`, updated);
      dispatch(updateUser(updated));
      message.success("Bio updated!");
    } catch {
      message.error("Update failed.");
    }
  };

  const playVideo = (id) => {
    const vid = document.getElementById(id);
    if (vid) {
      vid.style.display = "block";
      vid.play();
    }
  };

  return (
    <div className="profile-container">

      <div className="profile-header">
        <Avatar
          className="profile-avatar"
          size={100}
          src={profileData?.photoURL || "/default-avatar.png"}
          icon={<UserOutlined />}
        />
        <div className="profile-info">
          <h3>{profileData?.displayName || profileData?.name || "Streamer"}</h3>
          <p>{profileData?.bio || "Hey there! I'm using Touch Live."}</p>
        </div>
        {!isPublic && (
          // <div className="profile-upload-btn">
          //   <Upload
          //     name="video"
          //     action={`/api/upload-video/${loggedIn.uid}`}
          //     beforeUpload={beforeUpload}
          //     onChange={handleVideoUpload}
          //     showUploadList={false}
          //     accept="video/*"
          //   >
          //     <Button icon={<UploadOutlined />} loading={uploading}>
          //       Upload Video
          //     </Button>
          //   </Upload>
          // </div>
          <div className="profile-upload-btn">
            <Upload
              name="video"
              action={`/api/upload-video/${loggedIn.uid}`}
              beforeUpload={beforeUpload}
              onChange={handleVideoUpload}
              showUploadList={false}
              accept="video/*"
            >
              <Button icon={<UploadOutlined />} loading={uploading}>
                Upload Video
              </Button>
            </Upload>

            <Button
              type="default"
              style={{ marginLeft: "10px" }}
              onClick={() => setShowBioInput(!showBioInput)}
            >
              {showBioInput ? "Cancel Bio Edit" : "Edit Bio"}
            </Button>
          </div>

        )}
      </div>
      {!isPublic && showBioInput && (
        <Form
          className="bio-form"
          form={form}
          layout="vertical"
          onFinish={onBioFinish}
          style={{ marginTop: "20px" }}
        >
          <Form.Item name="bio" label="Edit Your Bio">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Save Bio
            </Button>
          </Form.Item>
        </Form>
      )}


      {/* Storage */}
      <div className="profile-storage">
        <Progress percent={Number(percent)} />
        <div className="profile-storage-text">
          Used {usedMB} MB of {Math.round(MAX_STORAGE / (1024 * 1024))} MB ({percent}
          %)
        </div>
      </div>

      {/* Videos */}
      <Title level={4}>Your Videos</Title>
      <div className="video-gallery">
        {videos.length === 0 && <p>No videos uploaded yet.</p>}
        {videos.map((v) => (
          <div key={v.public_id} className="video-box">
            <img
              src={v.coverImage}
              alt="cover"
              onClick={() => playVideo(v.public_id)}
            />
            <video
              id={v.public_id}
              src={v.url}
              controls
              onClick={(e) => e.stopPropagation()}
              onPlay={(e) => (e.target.style.display = "block")}
            />
          </div>
        ))}
      </div>

    </div>
  );
};

export default ProfilePage;
