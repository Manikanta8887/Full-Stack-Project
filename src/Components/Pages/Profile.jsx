// import React, { useEffect, useState } from "react";
// import { Form, Input, Button, Avatar, Upload, message, Typography } from "antd";
// import { UploadOutlined } from "@ant-design/icons";
// import { useSelector, useDispatch } from "react-redux";
// import { updateUser } from "../Redux/userSlice.js";
// import axios from "axios";
// import { auth } from "../Firebase/Firebaseconfig.js";
// import { useNavigate } from "react-router-dom";
// import "./Profile.css";

// const { Title } = Typography;

// const ProfilePage = () => {
//   const user = useSelector((state) => state.user);
//   const firebaseUser = user.firebaseUser;
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [form] = Form.useForm();
//   const [loading, setLoading] = useState(false);
//   const [profilePic, setProfilePic] = useState(firebaseUser?.photoURL || user.profilePic || "");

//   useEffect(() => {
//     if (!firebaseUser) {
//       navigate("/login"); // Redirect if not logged in
//       return;
//     }

//     form.setFieldsValue({
//       username: firebaseUser.displayName || "",
//       email: firebaseUser.email || "",
//       bio: user.bio || "",
//     });

//     setProfilePic(firebaseUser.photoURL || user.profilePic || "");
//   }, [firebaseUser, user.bio, form, user.profilePic, navigate]);

//   const handleUpdate = async (values) => {
//     if (!firebaseUser) {
//       message.error("No user data available.");
//       return;
//     }
//     setLoading(true);
//     try {
//       const updatedUser = { ...firebaseUser, ...values, profilePic, bio: values.bio };
//       await axios.put(`/api/users/${user.id || firebaseUser.uid}`, updatedUser);
//       dispatch(updateUser(updatedUser));
//       message.success("Profile updated successfully!");
//     } catch (error) {
//       message.error("Failed to update profile.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleProfilePicUpload = (info) => {
//     if (info.file.status === "done") {
//       const imageUrl = info.file?.response?.imageUrl || profilePic;
//       setProfilePic(imageUrl);
//       message.success("Profile picture updated!");
//     } else if (info.file.status === "error") {
//       message.error("Failed to upload profile picture.");
//     }
//   };

//   return (
//     <div className="profile-container">
//       <div className="profile-box">
//         <Title level={2}>Profile</Title>
//         <Avatar size={100} src={profilePic || "/default-avatar.png"} />
//         <Upload
//           name="profilePic"
//           action="/api/upload"
//           showUploadList={false}
//           onChange={handleProfilePicUpload}
//         >
//           <Button icon={<UploadOutlined />}>Change Profile Picture</Button>
//         </Upload>

//         <Form form={form} layout="vertical" onFinish={handleUpdate}>
//           <Form.Item
//             label="Username"
//             name="username"
//             rules={[{ required: true, message: "Enter your username" }]}
//           >
//             <Input />
//           </Form.Item>
//           <Form.Item label="Email" name="email">
//             <Input disabled />
//           </Form.Item>
//           <Form.Item label="Bio" name="bio">
//             <Input.TextArea rows={3} placeholder="Tell us about yourself..." />
//           </Form.Item>

//           <Form.Item>
//             <Button type="primary" htmlType="submit" loading={loading} block>
//               Update Profile
//             </Button>
//           </Form.Item>
//         </Form>
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;


// ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { Form, Input, Button, Avatar, Upload, message, Typography, Row, Col } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../Redux/userSlice.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const { Title } = Typography;

const ProfilePage = () => {
  const user = useSelector((state) => state.user);
  const firebaseUser = user.firebaseUser;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState(firebaseUser?.photoURL || user.profilePic || "");

  useEffect(() => {
    if (!firebaseUser) {
      navigate("/login");
      return;
    }
    form.setFieldsValue({
      username: firebaseUser.displayName || "",
      email: firebaseUser.email || "",
      bio: user.bio || "",
    });
    setProfilePic(firebaseUser.photoURL || user.profilePic || "");
  }, [firebaseUser, user.bio, form, user.profilePic, navigate]);

  const handleUpdate = async (values) => {
    if (!firebaseUser) {
      message.error("No user data available.");
      return;
    }
    setLoading(true);
    try {
      const updatedUser = { ...firebaseUser, ...values, profilePic, bio: values.bio };
      await axios.put(`/api/users/${user.id || firebaseUser.uid}`, updatedUser);
      dispatch(updateUser(updatedUser));
      message.success("Profile updated successfully!");
    } catch (error) {
      message.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

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
          <Avatar size={100} src={profilePic || "/default-avatar.png"} />
          <Upload
            name="profilePic"
            action="/api/upload"
            showUploadList={false}
            onChange={handleProfilePicUpload}
          >
            <Button icon={<UploadOutlined />}>Change Profile Picture</Button>
          </Upload>
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
        </div>
      </Col>
    </Row>
  );
};

export default ProfilePage;
