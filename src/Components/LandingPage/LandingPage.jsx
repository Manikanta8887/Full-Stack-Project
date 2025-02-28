import React, { useEffect, useRef } from "react";
import { Button } from "antd";
import "./LandingPage.css";
import Header from "./Header";
import { Link } from "react-router-dom"
import Landimage1 from "../../assets/Landimage.svg"
import Landimage from "../../assets/land2.avif"


const LandingPage = () => {
  const aboutRef = useRef(null)

  const handleScrollToAbout = () => {
    if (aboutRef.current) {
      aboutRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }
  useEffect(()=>{

  },[])
  return (
    <>
      <Header />
      <div className="landing-container">
        <div className="landing-container1">
          <h1 className="landing-title">Welcome to Touch Live</h1>
          <p className="landing-description">
            Experience live streaming like never before. Join exciting streams, interact
            with your favorite creators, and become a part of the community.
          </p>
          <div className="button-container">
            <Button type="primary" size="large" className="explore-button" onClick={handleScrollToAbout}>
              Explore Streams
            </Button>
            <Button size="large" className="stream-button">
              <Link to="/login">Start Streaming</Link>
            </Button>
          </div>
        </div>
        <img src={Landimage1} alt="landimage" />
      </div>

      <div ref={aboutRef} className="about-section">
        <img src={Landimage} alt="landimage" />
        <div className="about-child">
        <h2>About Touch Live</h2>
        <p>
          Touch Live is an interactive live streaming platform where users can watch,
          stream, and connect with their favorite creators. Join the community and
          experience live content like never before.
        </p>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
