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
// const MAX_STORAGE = 1024 * 1024 * 1024; // 1 GB

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
//   const [showBioInput, setShowBioInput] = useState(false);


//   useEffect(() => {
//     const targetUid = isPublic ? uid : loggedIn?.uid;
//     if (!targetUid) return navigate("/login");
//     if (isPublic) {
//       axios
//         .get(`/api/profile/${uid}`)
//         .then((res) => setProfileData(res.data))
//         .catch(() => message.error("Failed to load profile data."));
//     } else {
//       setProfileData(loggedIn);
//       form.setFieldsValue({ bio: loggedIn.bio });
//     }
//     axios
//       .get(`/api/videos/${targetUid}`)
//       .then((res) => setVideos(res.data.videos || []))
//       .catch(() => setVideos([]));
//   }, [uid, loggedIn, isPublic, form, navigate]);

//   // Storage calc
//   const usedBytes = useMemo(
//     () => videos.reduce((sum, v) => sum + (v.sizeInBytes || 0), 0),
//     [videos]
//   );
//   const usedMB = (usedBytes / (1024 * 1024)).toFixed(1);
//   const percent = ((usedBytes / MAX_STORAGE) * 100).toFixed(1);

//   // Upload handlers
//   const beforeUpload = (file) => {
//     if (usedBytes + file.size > MAX_STORAGE) {
//       message.error("Uploading this would exceed your 1 GB quota.");
//       return Upload.LIST_IGNORE;
//     }
//     return true;
//   };
//   const handleVideoUpload = ({ file }) => {
//     if (file.status === "uploading") setUploading(true);
//     else if (file.status === "done") {
//       setVideos((prev) => [...prev, file.response.video]);
//       message.success("Video uploaded!");
//       setUploading(false);
//     } else if (file.status === "error") {
//       message.error("Video upload failed.");
//       setUploading(false);
//     }
//   };

//   const onBioFinish = async ({ bio }) => {
//     try {
//       const updated = { ...loggedIn, bio };
//       await axios.put(`/api/users/${loggedIn.uid}`, updated);
//       dispatch(updateUser(updated));
//       message.success("Bio updated!");
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
//     <div className="profile-container">

//       <div className="profile-header">
//         <Avatar
//           className="profile-avatar"
//           size={100}
//           src={profileData?.photoURL || "/default-avatar.png"}
//           icon={<UserOutlined />}
//         />
//         <div className="profile-info">
//           <h3>{profileData?.displayName || profileData?.name || "Streamer"}</h3>
//           <p>{profileData?.bio || "Hey there! I'm using Touch Live."}</p>
//         </div>
//         {!isPublic && (
//           <div className="profile-upload-btn">
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

//             <Button
//               type="default"
//               style={{ marginLeft: "10px" }}
//               onClick={() => setShowBioInput(!showBioInput)}
//             >
//               {showBioInput ? "Cancel Bio Edit" : "Edit Bio"}
//             </Button>
//           </div>

//         )}
//       </div>
//       {!isPublic && showBioInput && (
//         <Form
//           className="bio-form"
//           form={form}
//           layout="vertical"
//           onFinish={onBioFinish}
//           style={{ marginTop: "20px" }}
//         >
//           <Form.Item name="bio" label="Edit Your Bio">
//             <Input.TextArea rows={3} />
//           </Form.Item>
//           <Form.Item>
//             <Button type="primary" htmlType="submit" block>
//               Save Bio
//             </Button>
//           </Form.Item>
//         </Form>
//       )}


//       {/* Storage */}
//       <div className="profile-storage">
//         <Progress percent={Number(percent)} />
//         <div className="profile-storage-text">
//           Used {usedMB} MB of {Math.round(MAX_STORAGE / (1024 * 1024))} MB ({percent}
//           %)
//         </div>
//       </div>

//       {/* Videos */}
//       <Title level={4}>Your Videos</Title>
//       <div className="video-gallery">
//         {videos.length === 0 && <p>No videos uploaded yet.</p>}
//         {videos.map((v) => (
//           <div key={v.public_id} className="video-box">
//             <img
//               src={v.coverImage}
//               alt="cover"
//               onClick={() => playVideo(v.public_id)}
//             />
//             <video
//               id={v.public_id}
//               src={v.url}
//               controls
//               onClick={(e) => e.stopPropagation()}
//               onPlay={(e) => (e.target.style.display = "block")}
//             />
//           </div>
//         ))}
//       </div>

//     </div>
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
  Progress,
} from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../Redux/userSlice.js";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./Profile.css";

const { Title } = Typography;
const MAX_STORAGE = 1024 * 1024 * 1024; // 1 GB

export default function ProfilePage() {
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

  // Load profile + videos
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

  // Compute storage usage
  const usedBytes = useMemo(
    () => videos.reduce((sum, v) => sum + (v.sizeInBytes || 0), 0),
    [videos]
  );
  const usedMB = (usedBytes / (1024 * 1024)).toFixed(1);
  const percent = ((usedBytes / MAX_STORAGE) * 100).toFixed(1);

  // Prevent over‐quota uploads
  const beforeUpload = (file) => {
    if (usedBytes + file.size > MAX_STORAGE) {
      message.error("This upload would exceed your 1 GB quota.");
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  // Handle AntD Upload events
  const handleVideoUpload = ({ file }) => {
    if (file.status === "uploading") {
      setUploading(true);
    } else if (file.status === "done") {
      setVideos((prev) => [...prev, file.response.video]);
      message.success("Video uploaded!");
      setUploading(false);
    } else if (file.status === "error") {
      message.error("Video upload failed.");
      setUploading(false);
    }
  };

  // Save bio
  const onBioFinish = async ({ bio }) => {
    try {
      const updated = { ...loggedIn, bio };
      await axios.put(`/api/users/${loggedIn.uid}`, updated);
      dispatch(updateUser(updated));
      message.success("Bio updated!");
    } catch {
      message.error("Failed to update bio.");
    }
  };

  // Play clicked video
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
          <div className="profile-upload-btn">
            <Upload
              accept="video/*"
              beforeUpload={beforeUpload}
              showUploadList={false}
              customRequest={async ({ file, onProgress, onError, onSuccess }) => {
                const fd = new FormData();
                fd.append("video", file);

                try {
                  const res = await axios.post(
                    `/api/upload-video/${loggedIn.uid}`,
                    fd,
                    {
                      headers: { "Content-Type": "multipart/form-data" },
                      onUploadProgress: ({ loaded, total }) =>
                        onProgress({ percent: Math.round((loaded / total) * 100) }),
                    }
                  );
                  onSuccess(res.data, file);
                } catch (err) {
                  onError(err);
                }
              }}
              onChange={handleVideoUpload}
            >
              <Button icon={<UploadOutlined />} loading={uploading}>
                Upload Video
              </Button>
            </Upload>

            <Button
              style={{ marginLeft: 10 }}
              onClick={() => setShowBioInput((v) => !v)}
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
          style={{ marginBottom: 20 }}
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

      <div className="profile-storage">
        <Progress percent={Number(percent)} />
        <div className="profile-storage-text">
          Used {usedMB} MB of {Math.round(MAX_STORAGE / (1024 * 1024))} MB (
          {percent}%)
        </div>
      </div>

      <Title level={4}>Your Videos</Title>
      <div className="video-gallery">
        {videos.length === 0 && <p>No videos uploaded yet.</p>}
        {videos.map((v) => (
          <div key={v.public_id} className="video-box">
            <img src={v.coverImage} alt="cover" onClick={() => playVideo(v.public_id)} />
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
}
