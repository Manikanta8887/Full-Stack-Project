import React from "react";
import { useParams } from "react-router-dom";

const ChannelPage = () => {
  const { channelId } = useParams(); 

  return (
    <div style={{ padding: "20px" }}>
      <h2>Welcome to {channelId}!</h2>
      <p>Live streaming and content from {channelId}.</p>
    </div>
  );
};

export default ChannelPage;
