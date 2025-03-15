import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Browse() {
    const [streams, setStreams] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("https://touchlive-backend.onrender.com/api/streams/live")
            .then(res => res.json())
            .then(data => setStreams(data));
    }, []);

    return (
        <div>
            <h1>Live Streams</h1>
            {streams.map((stream) => (
                <div key={stream.streamId} onClick={() => navigate(`/stream/${stream.streamId}`)}>
                    <h2>{stream.streamTitle} - {stream.streamerName}</h2>
                    <p>Click to watch</p>
                </div>
            ))}
        </div>
    );
}

export default Browse;
