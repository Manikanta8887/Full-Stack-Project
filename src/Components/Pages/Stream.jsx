import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

function Stream() {
    const { streamId } = useParams();
    const videoRef = useRef(null);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            videoRef.current.srcObject = stream;
        });
    }, []);

    return (
        <div>
            <h1>Watching Stream: {streamId}</h1>
            <video ref={videoRef} autoPlay controls />
        </div>
    );
}

export default Stream;
