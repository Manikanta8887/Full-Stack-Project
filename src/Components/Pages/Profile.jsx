import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { updateProfilePic } from "../Redux/Store";
import { ToastContainer, toast } from "react-toastify";
import "./Profile.css";
import baseurl from "../base.js"

const Profile = () => {
  const dispatch = useDispatch();
  const firebaseUID = useSelector((state) => state.auth.firebaseUser?.uid);
  const reduxProfilePic = useSelector((state) => state.auth.profilePic);

  const [userData, setUserData] = useState(null);
  const [bio, setBio] = useState("");
  const [defaultPic] = useState("https://i.pinimg.com/736x/51/24/9f/51249f0c2caed9e7c06e4a5453c57857.jpg");

  const [newProfilePic, setNewProfilePic] = useState("");
  const [showPicInput, setShowPicInput] = useState(false);

  useEffect(() => {
    if (firebaseUID) {
      axios
        .get(`${baseurl}+api/profile/${firebaseUID}`)
        .then((res) => {
          setUserData(res.data);
          setBio(res.data.bio || "");
        })
        .catch((err) => console.error("Error fetching user:", err));
    }
  }, [firebaseUID]);

  const handleUpdateProfile = () => {
    const updateObj = { bio };
    if (showPicInput && newProfilePic.trim() !== "") {
      updateObj.profilePic = newProfilePic;
    }
    axios
      .put(`${baseurl}+api/profile/${firebaseUID}`, updateObj, {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        setUserData(res.data);
        if (updateObj.profilePic) {
          dispatch(updateProfilePic(updateObj.profilePic));
        }
        toast.success("Update Successful!");
        setNewProfilePic("");
        setShowPicInput(false);
      })
      .catch((err) => console.error("Error updating profile:", err));
  };

  if (!userData) return <p className="loading">Loading profile...</p>;

  return (
    <div className="container">
      <div className="profileBox">
        <div className="avatar">
          <img
            src={reduxProfilePic || userData.profilePic || defaultPic}
            alt="Profile"
            className="profilePic"
          />
        </div>
        <div className="Buttons">
          <button className="button" onClick={() => setShowPicInput(!showPicInput)}>
            {showPicInput ? "Cancel Profile Pic Update" : "Update Profile Pic"}
          </button>
          {showPicInput && (
            <input
              type="text"
              value={newProfilePic}
              onChange={(e) => setNewProfilePic(e.target.value)}
              placeholder="Enter new profile picture URL"
              className="profilePicInput"
            />
          )}
        </div>

        <h2>{userData.username}</h2>
        <p className="email">{userData.email}</p>
        <p className="createdAt">
          Joined on: {new Date(userData.createdAt).toLocaleDateString()}
        </p>

        <textarea
          className="bioInput"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Enter your bio..."
        />
      
        <button className="button" onClick={handleUpdateProfile}>
          Update Profile
        </button>
      </div>
      <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
    </div>
  );
};

export default Profile;
