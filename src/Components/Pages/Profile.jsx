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
  Modal,
} from "antd";
import {
  UploadOutlined,
  UserOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../Redux/userSlice.js";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./Profile.css";
import baseurl from "../../base.js";

const { Title } = Typography;
const MAX_STORAGE = 1024 * 1024 * 1024;

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

  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const targetUid = isPublic ? uid : loggedIn?.uid;
    if (!targetUid) return navigate("/login");

    if (isPublic) {
      axios
        .get(`${baseurl}/api/profile/${uid}`)
        .then((res) => setProfileData(res.data))
        .catch(() => message.error("Failed to load profile data."));
    } else {
      setProfileData(loggedIn);
      form.setFieldsValue({ bio: loggedIn.bio });
    }

    axios
      .get(`${baseurl}/api/videos/${targetUid}`)
      .then((res) => setVideos(res.data.videos || []))
      .catch(() => setVideos([]));
  }, [uid, loggedIn, isPublic, form, navigate]);

  const usedBytes = useMemo(
    () => videos.reduce((sum, v) => sum + (v.sizeInBytes || 0), 0),
    [videos]
  );
  const usedMB = (usedBytes / (1024 * 1024)).toFixed(1);
  const percent = ((usedBytes / MAX_STORAGE) * 100).toFixed(1);

  const openUploadModal = () => setUploadModalVisible(true);
  const closeUploadModal = () => {
    setUploadModalVisible(false);
    setSelectedFile(null);
    setVideoTitle("");
    setUploadProgress(0);
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    return false;
  };

  const submitUpload = async () => {
    if (!selectedFile) {
      message.error("Please select a video file.");
      return;
    }
    setUploading(true);

    const title = videoTitle.trim() || "TouchLive";

    const fd = new FormData();
    fd.append("video", selectedFile);
    fd.append("title", title);

    try {
      const res = await axios.post(
        `${baseurl}/api/videos/upload/${loggedIn.uid}`,
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: ({ loaded, total }) =>
            setUploadProgress(Math.round((loaded / total) * 100)),
        }
      );
      setVideos((prev) => [...prev, res.data.video]);
      message.success("Video uploaded!");
      closeUploadModal();
    } catch (err) {
      console.error(err.response?.data || err.message);
      message.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (public_id) => {
    try {
      await axios.delete(`${baseurl}/api/videos/${encodeURIComponent(public_id)}`);
      setVideos((prev) =>
        prev.filter((v) => v.public_id !== public_id)
      );
      message.success("Video deleted.");
    } catch {
      message.error("Failed to delete video.");
    }
  };

  const beforeUpload = (file) => {
    if (!file?.size || usedBytes + file.size > MAX_STORAGE) {
      message.error("This upload would exceed your 1 GB quota.");
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const onBioFinish = async ({ bio }) => {
    try {
      const updated = { ...loggedIn, bio };
      await axios.put(`${baseurl}/api/users/${loggedIn.uid}`, updated);
      dispatch(updateUser(updated));
      message.success("Bio updated!");
    } catch {
      message.error("Failed to update bio.");
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
          <h3>
            {profileData?.displayName ||
              profileData?.name ||
              "Streamer"}
          </h3>
          <p>
            {profileData?.bio ||
              "Hey there! I'm using Touch Live."}
          </p>
        </div>
        {!isPublic && (
          <div className="profile-upload-btn">
            <Button
              icon={<UploadOutlined />}
              onClick={openUploadModal}
            >
              Upload Video
            </Button>
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
          Used {usedMB} MB of {Math.round(MAX_STORAGE / (1024 * 1024))} MB ({percent}%)
        </div>
      </div>
      <Title level={4}>Your Videos</Title>
      <div className="video-gallery">
        {videos.length === 0 && <p>No videos uploaded yet.</p>}
        {videos.map((v, i) => (
          <div key={v.public_id || i} className="video-box">
            <DeleteOutlined
              className="delete-btn"
              onClick={() => handleDelete(v.public_id)}
            />
            <video
              className="video-card"
              poster={v.coverImage}
              src={v.url}
              controls
              preload="auto"
              autoPlay
              loop
              muted
              playsInline
            />
            <div className="video-meta">
              <h4>{v.title || "Untitled Video"}</h4>
            </div>
          </div>
        ))}
      </div>

      <Modal
        title="Upload a Video"
        open={uploadModalVisible}
        onOk={submitUpload}
        onCancel={closeUploadModal}
        okText={uploading ? "Uploading..." : "Upload"}
        confirmLoading={uploading}
      >
        <Form layout="vertical">
          <Form.Item label="Video Title" required>
            <Input
              placeholder="TouchLive"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
            />
          </Form.Item>

          <Form.Item label="Select Video" required>
            <Upload
              accept="video/*"
              beforeUpload={handleFileSelect}
              showUploadList={false}
              customRequest={() => { dummyRequest }}
            >
              <Button icon={<UploadOutlined />}>Choose File</Button>
            </Upload>
            {selectedFile && (
              <div className="selected-file">{selectedFile.name}</div>
            )}
          </Form.Item>

          {uploadProgress > 0 && (
            <Progress percent={uploadProgress} />
          )}
        </Form>
      </Modal>
    </div>
  );
}
