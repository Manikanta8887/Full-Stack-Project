import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input, Button } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone, SyncOutlined } from "@ant-design/icons";
import { signInWithEmailAndPassword, signInWithPopup, signInAnonymously, sendPasswordResetEmail } from "firebase/auth";
import { Auth, GoogleProvider } from "../Firebase/Firebaseconfig";
import Logo from "../../assets/logo.png"; 
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [userdetails, setUserdetails] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState({ email: false, google: false, guest: false });
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleChange = (e) => {
    setUserdetails({ ...userdetails, [e.target.name]: e.target.value });
  };

  const handleEmailLogin = (e) => {
    e.preventDefault();
    setLoading({ ...loading, email: true });

    signInWithEmailAndPassword(Auth, userdetails.email, userdetails.password)
      .then(() => {
        toast.success("User Successfully Logged In");
        setTimeout(() => navigate("/livestreamingplatform", { replace: true }), 2000);
      })
      .catch(() => toast.error("Invalid email or password"))
      .finally(() => setLoading({ ...loading, email: false }));
  };

  const handleGoogleLogin = () => {
    setLoading({ ...loading, google: true });
    signInWithPopup(Auth, GoogleProvider)
      .then(() => {
        toast.success("Google login successful!!!");
        setTimeout(() => navigate("/livestreamingplatform", { replace: true }), 2000);
      })
      .catch(() => toast.error("Google login failed"))
      .finally(() => setLoading({ ...loading, google: false }));
  };

  const handleGuestLogin = () => {
    setLoading({ ...loading, guest: true });
    signInAnonymously(Auth)
      .then(() => {
        toast.success("Logged in as Guest!!!");
        setTimeout(() => navigate("/livestreamingplatform", { replace: true }), 2000);
      })
      .catch(() => toast.error("Guest login failed"))
      .finally(() => setLoading({ ...loading, guest: false }));
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error("Please enter your email!");
      return;
    }
    try {
      await sendPasswordResetEmail(Auth, resetEmail);
      toast.success("Password reset email sent! Check your inbox.");
      setResetMode(false);
    } catch (error) {
      toast.error("Failed to send reset email.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <span onClick={() => navigate("/", { replace: true })} className="close-btn">X</span>
        <div className="text-center">
          <img src={Logo} alt="Logo" className="logo" />
        </div>

        {resetMode ? (
          <>
            <h2 className="login-title">Reset Password</h2>
            <div className="input-group">
              <label>Email:</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
            <div className="login-btn-group">
              <Button type="primary" onClick={handleResetPassword} icon={<SyncOutlined spin />} >
                Send Reset Email
              </Button>
            </div>
            <p className="back-to-login" onClick={() => setResetMode(false)}> Back to Login</p>
          </>
        ) : (
          <>
            <h2 className="login-title">Login</h2>
            <form onSubmit={handleEmailLogin}>
              <div className="input-group">
                <label>Email:</label>
                <Input type="email" name="email" onChange={handleChange} value={userdetails.email} />
              </div>
              <div className="input-group">
                <label>Password:</label>
                <Input.Password
                  name="password"
                  onChange={handleChange}
                  value={userdetails.password}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </div>
              <p className="forgot-password" onClick={() => setResetMode(true)}>Forgot Password?</p>
              <div className="login-btn-group">
                <Button type="primary" htmlType="submit" loading={loading.email} icon={loading.email ? <SyncOutlined spin /> : null}>
                  {loading.email ? "Logging in..." : "Login"}
                </Button>
              </div>
              <div className="login-options">
                <Button onClick={handleGoogleLogin} loading={loading.google} icon={loading.google ? <SyncOutlined spin /> : null}>
                  {loading.google ? "Logging In..." : "Google Login"}
                </Button>
                <Button onClick={handleGuestLogin} loading={loading.guest} icon={loading.guest ? <SyncOutlined spin /> : null}>
                  {loading.guest ? "Logging In..." : "Guest Login"}
                </Button>
              </div>
            </form>
            <p className="signup-link">Don't have an account? <Link to="/signup">Signup</Link></p>
          </>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default Login;
