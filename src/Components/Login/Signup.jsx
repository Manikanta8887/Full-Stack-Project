import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.png";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { Auth, app } from "../Firebase/Firebaseconfig";
import { Button, Input, Form } from "antd";
import { SyncOutlined, CloseOutlined } from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const [userdetails, setUserdetails] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (password) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const handleChange = (e) => setUserdetails({ ...userdetails, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const { username, email, password } = userdetails;
    if (!username.trim()) return toast.error("Username is required.");
    if (!isValidEmail(email)) return toast.error("Enter a valid email.");
    if (!isValidPassword(password)) return toast.error("Password: 8+ chars, letters, numbers, specials");

    setLoading(true);

    try {
      const db = getFirestore(app);
      const userCredential = await createUserWithEmailAndPassword(Auth, email, password);
      const user = userCredential.user;
  
      await updateProfile(user, { displayName: username });
      await addDoc(collection(db, "users"), {
        userId: user.uid,
        name: username,
        email: email,
        createdAt: new Date(),
      });

      toast.success("Signup successful! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      const errorMsg =
        error.code === "auth/email-already-in-use" ? "Email already exists."
        : error.code === "auth/weak-password" ? "Password is too weak."
        : error.message;
      toast.error(errorMsg);
    } finally {
      setLoading(false);  
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <span onClick={() => navigate("/")} className="close-btn">
          <CloseOutlined />
        </span>
        <div className="logo-container">
          <img src={Logo} alt="Logo" className="logo-img1" />
        </div>

        <h2 className="signup-title">Create Your Account</h2>
        <Form onFinish={handleSubmit} layout="vertical">
          <Form.Item label="Username" className="form-item">
            <Input
              name="username"
              onChange={handleChange}
              value={userdetails.username}
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item label="Email" className="form-item">
            <Input
              type="email"
              name="email"
              onChange={handleChange}
              value={userdetails.email}
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item label="Password" className="form-item">
            <Input.Password
              name="password"
              onChange={handleChange}
              value={userdetails.password}
              autoComplete="new-password"
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} className="signup-btn">
            {loading ? "Signup" : "Signup"}
          </Button>
        </Form>

        <p className="redirect-text">
          Already have an account? <Link to="/login" className="redirect-link">Login</Link>
        </p>
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
};

export default Signup;
