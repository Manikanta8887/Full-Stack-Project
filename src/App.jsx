// App.jsx
import { Route, Routes, useLocation } from "react-router-dom";
import LiveStreamingPlatform from "./Components/Pages/Main";
import LandingPage from "./Components/LandingPage/LandingPage";
import Loginpage from "./Components/Login/Login";
import PageNotFound from "./Components/Login/PageNotFound";
import Signup from "./Components/Login/Signup";
import StartStreaming from "./Components/Pages/Startstreaming";
import StreamingContent from "./Components/Pages/Browse";
import ProfilePage from "./Components/Pages/Profile";
import WatchStream from "./Components/Pages/WatchStream.jsx";

import "./App.css";
import Spin from "./assets/spinloading.svg";
import { useEffect, useRef, useState, useMemo } from "react";

function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const prevBaseRoute = useRef("");

  const currentBaseRoute = useMemo(() => {
    return location.pathname.split("/")[1] || "/";
  }, [location.pathname]);

  useEffect(() => {
    if (prevBaseRoute.current && prevBaseRoute.current !== currentBaseRoute) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
    prevBaseRoute.current = currentBaseRoute;
  }, [currentBaseRoute]);

  return (
    <>
      {loading ? (
        <img src={Spin} alt="Loading..." className="loading-container" />
      ) : (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Loginpage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/livestreamingplatform" element={<LiveStreamingPlatform />}>
            <Route index element={<StreamingContent />} />
            <Route path="stream/:id" element={<StartStreaming />} />
            {/* <Route path="watch/:id" element={<WatchStream />} /> */}
            <Route path="watch/:id" element={<WatchStream />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="/*" element={<PageNotFound />} />
        </Routes>
      )}
    </>
  );
}

export default App;
