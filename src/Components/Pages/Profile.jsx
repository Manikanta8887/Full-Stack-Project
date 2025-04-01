// // import React, { useEffect, useState } from "react";
// // import { useSelector, useDispatch } from "react-redux";
// // import axios from "axios";
// // import { updateProfilePic } from "../Redux/Store";
// // import { ToastContainer, toast } from "react-toastify";
// // import "./Profile.css";
// // import baseurl from "../../base.js";

// // const Profile = () => {
// //   const dispatch = useDispatch();
// //   const firebaseUID = useSelector((state) => state.auth.firebaseUser?.uid);
// //   const reduxProfilePic = useSelector((state) => state.auth.profilePic);

// //   const [userData, setUserData] = useState(null);
// //   const [bio, setBio] = useState("");
// //   const defaultPic = "https://i.pinimg.com/736x/51/24/9f/51249f0c2caed9e7c06e4a5453c57857.jpg";
// //   const [newProfilePic, setNewProfilePic] = useState("");
// //   const [showPicInput, setShowPicInput] = useState(false);

// //   useEffect(() => {
// //     if (!firebaseUID) return;

// //     axios
// //       .get(`${baseurl}/api/profile/${firebaseUID}`)
// //       .then((res) => {
// //         setUserData(res.data);
// //         setBio(res.data.bio || "");
// //       })
// //       .catch((err) => {
// //         console.error("Error fetching user:", err);
// //         toast.error("Failed to load profile.");
// //       });
// //   }, [firebaseUID]);

// //   const handleUpdateProfile = () => {
// //     if (showPicInput && newProfilePic.trim() !== "" && !newProfilePic.startsWith("http")) {
// //       toast.error("Invalid Profile Picture URL!");
// //       return;
// //     }

// //     const updateObj = { bio };
// //     if (showPicInput && newProfilePic.trim() !== "") {
// //       updateObj.profilePic = newProfilePic;
// //     }

// //     axios
// //       .put(`${baseurl}/api/profile/${firebaseUID}`, updateObj, {
// //         headers: { "Content-Type": "application/json" },
// //       })
// //       .then((res) => {
// //         setUserData(res.data);
// //         if (updateObj.profilePic) {
// //           dispatch(updateProfilePic(updateObj.profilePic));
// //         }
// //         toast.success("Profile updated successfully!");
// //         setNewProfilePic("");
// //         setShowPicInput(false);
// //       })
// //       .catch((err) => {
// //         console.error("Error updating profile:", err);
// //         toast.error("Failed to update profile.");
// //       });
// //   };

// //   if (!userData) return <p className="loading">Loading profile...</p>;

// //   return (
// //     <div className="container">
// //       <div className="profileBox">
// //         <div className="avatar">
// //           <img
// //             src={reduxProfilePic || userData.profilePic || defaultPic}
// //             alt="Profile"
// //             className="profilePic"
// //           />
// //         </div>
// //         <div className="Buttons">
// //           <button className="button" onClick={() => setShowPicInput(!showPicInput)}>
// //             {showPicInput ? "Cancel Profile Pic Update" : "Update Profile Pic"}
// //           </button>
// //           {showPicInput && (
// //             <input
// //               type="text"
// //               value={newProfilePic}
// //               onChange={(e) => setNewProfilePic(e.target.value)}
// //               placeholder="Enter new profile picture URL"
// //               className="profilePicInput"
// //             />
// //           )}
// //         </div>

// //         <h2>{userData.username}</h2>
// //         <p className="email">{userData.email}</p>
// //         <p className="createdAt">
// //           Joined on: {new Date(userData.createdAt).toLocaleDateString()}
// //         </p>

// //         <textarea
// //           className="bioInput"
// //           value={bio}
// //           onChange={(e) => setBio(e.target.value)}
// //           placeholder="Enter your bio..."
// //         />
      
// //         <button className="button" onClick={handleUpdateProfile}>
// //           Update Profile
// //         </button>
// //       </div>
      
// //       <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
// //     </div>
// //   );
// // };

// // export default Profile;


// import React, { useEffect, useState } from "react";
// import { Form, Input, Button, Avatar, Upload, message, Typography } from "antd";
// import { UploadOutlined } from "@ant-design/icons";
// import { useSelector, useDispatch } from "react-redux";
// import { updateUser } from "../../redux/userSlice";
// import axios from "axios";
// import { auth } from "../../firebase";
// import "./Profile.css";

// const { Title } = Typography;

// const ProfilePage = () => {
//   const user = useSelector((state) => state.user); // Get user from Redux
//   const dispatch = useDispatch();
//   const [form] = Form.useForm();
//   const [loading, setLoading] = useState(false);
//   const [profilePic, setProfilePic] = useState(user?.profilePic || "");

//   useEffect(() => {
//     if (user) {
//       form.setFieldsValue({
//         username: user.username,
//         email: user.email,
//         bio: user.bio,
//       });
//       setProfilePic(user.profilePic || "");
//     }
//   }, [user, form]);

//   const handleUpdate = async (values) => {
//     setLoading(true);
//     try {
//       const updatedUser = { ...user, ...values, profilePic };
//       await axios.put(`/api/users/${user.uid}`, updatedUser);
//       dispatch(updateUser(updatedUser)); // Update Redux state
//       message.success("Profile updated successfully!");
//     } catch (error) {
//       message.error("Failed to update profile.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleProfilePicUpload = (info) => {
//     if (info.file.status === "done") {
//       const imageUrl = info.file.response.imageUrl; // Assuming backend returns URL
//       setProfilePic(imageUrl);
//       message.success("Profile picture updated!");
//     }
//   };

//   return (
//     <div className="profile-container">
//       <div className="profile-box">
//         <Title level={2}>Profile</Title>
//         <Avatar size={100} src={profilePic || "/default-avatar.png"} />
//         <Upload
//           name="profilePic"
//           action="/api/upload" // Backend endpoint for image upload
//           showUploadList={false}
//           onChange={handleProfilePicUpload}
//         >
//           <Button icon={<UploadOutlined />}>Change Profile Picture</Button>
//         </Upload>

//         <Form form={form} layout="vertical" onFinish={handleUpdate}>
//           <Form.Item label="Username" name="username" rules={[{ required: true, message: "Enter your username" }]}>
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


import React, { useEffect, useState } from "react";
import { Form, Input, Button, Avatar, Upload, message, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../Redux/userSlice.js";
import axios from "axios";
import { auth } from "../Firebase/Firebaseconfig.js";
import "./Profile.css";

const { Title } = Typography;

const ProfilePage = () => {
  // Get the entire user slice from Redux
  const user = useSelector((state) => state.user);
  // Destructure firebaseUser from the slice for clarity
  const firebaseUser = user.firebaseUser;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  // Initialize profilePic state based on firebaseUser.photoURL (or fallback to user.profilePic)
  const [profilePic, setProfilePic] = useState(
    firebaseUser ? firebaseUser.photoURL : user.profilePic || ""
  );

  useEffect(() => {
    if (firebaseUser) {
      form.setFieldsValue({
        username: firebaseUser.displayName || "",
        email: firebaseUser.email || "",
        bio: user.bio || "",
      });
      setProfilePic(firebaseUser.photoURL || user.profilePic || "");
    }
  }, [firebaseUser, user.bio, form, user.profilePic]);

  const handleUpdate = async (values) => {
    if (!firebaseUser) {
      message.error("No user data available.");
      return;
    }
    setLoading(true);
    try {
      // Merge values with the current firebaseUser and profilePic
      const updatedUser = { ...firebaseUser, ...values, profilePic, bio: values.bio };
      // Use firebaseUser.uid for the API call
      await axios.put(`/api/users/${firebaseUser.uid}`, updatedUser);
      // Dispatch the updateUser action to update Redux state
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
      const imageUrl = info.file.response.imageUrl; // Assuming backend returns URL
      setProfilePic(imageUrl);
      message.success("Profile picture updated!");
    } else if (info.file.status === "error") {
      message.error("Failed to upload profile picture.");
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-box">
        <Title level={2}>Profile</Title>
        <Avatar size={100} src={profilePic || "/default-avatar.png"} />
        <Upload
          name="profilePic"
          action="/api/upload" // Backend endpoint for image upload
          showUploadList={false}
          onChange={handleProfilePicUpload}
        >
          <Button icon={<UploadOutlined />}>Change Profile Picture</Button>
        </Upload>

        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Enter your username" }]}
          >
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
    </div>
  );
};

export default ProfilePage;
