import { Route, Routes, useLocation } from 'react-router-dom'
import LiveStreamingPlatform from './Components/Pages/Main'
import LandingPage from './Components/LandingPage/LandingPage'
import Home from './Components/Pages/Home'
import Loginpage from './Components/Login/Login'
import PageNotFound from './Components/Pages/PageNotFound'
import './App.css'
import Signup from './Components/Login/Signup'
import Spin from "./assets/spinloading.svg"
import { useEffect, useState } from 'react'

function App() {

  const location = useLocation();
  const [loading, setLoading] = useState(true)
  useEffect(() => { 
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <>
      {loading ? (<img src={Spin} alt="image" className='loading-container' />) : (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Loginpage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/livestreamingplatform" element={<LiveStreamingPlatform />} />
          <Route path="/*" element={<PageNotFound />} />
        </Routes>)
      }
    </>
  )
}

export default App
