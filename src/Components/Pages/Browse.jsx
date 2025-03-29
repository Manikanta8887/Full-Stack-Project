// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import baseurl from "../base"

// function Browse() {
//     // const [streams, setStreams] = useState([]);
//     const navigate = useNavigate();

//     // useEffect(() => {
//     //     fetch(`${baseurl}api/streams/live`)
//     //         .then(res => res.json())
//     //         .then(data => setStreams(data));
//     // }, []);

//     const [liveStreams, setLiveStreams] = useState([]);

//     useEffect(() => {
//         socket.on("update-streams", (streams) => {
//             setLiveStreams(streams);
//         });
//     }, []);

//     return (
//         <div>
//             <h2>Live Streams</h2>
//             {liveStreams.map((stream, index) => (
//                 <div key={index}>
//                     <h3>{stream.streamTitle}</h3>
//                     <p>Streamer: {stream.id}</p>
//                 </div>
//             ))}
//         </div>
//     );

// }

// export default Browse;

import React, { useEffect, useState } from "react";
import socket from "../socket";

const Browse = () => {
  const [liveStreams, setLiveStreams] = useState([]);

  useEffect(() => {
    socket.on("update-streams", (streams) => {
      setLiveStreams(streams);
    });

    return () => socket.off("update-streams");
  }, []);

  return (
    <div>
      <h2>Live Streams</h2>
      {liveStreams.length === 0 ? <p>No live streams</p> : null}
      {liveStreams.map((stream, index) => (
        <div key={index}>
          <h3>{stream.streamTitle}</h3>
          <p>Streamer: {stream.id}</p>
        </div>
      ))}
    </div>
  );
};

export default Browse;
