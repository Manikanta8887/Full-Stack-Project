import React from "react";
import { Layout, Menu, Button, Space } from "antd";
import "./Header.css";
import logoIcon from "../../assets/logo1.png"; 
import { Link } from "react-router-dom";


const { Header } = Layout;

const AppHeader = () => {
  return (
    <Header className="app-header">
      <div className="logo-container">
        <img src={logoIcon} alt="Touch Live Logo" className="logo-icon" />
        <span className="logo-text">Touch Live</span>
      </div>
      
      <Space size="large">        
        <Button type="ghost" className="login-button"><Link to="/login">Login</Link></Button>
        <Button type="primary" className="signup-button"><Link to="/signup">Sign Up</Link></Button>
      </Space>
    </Header>
  );
};

export default AppHeader;
