import React from "react";
import Chat from "../components/chat";
import PrivateChat from "../components/privateChat";

function Home() {
  return (
    <div className="home">
      <h1 className="text-5xl bg-slate-700">This is the home page.</h1>
      <Chat />

      <br></br>

      <PrivateChat/>
    </div>
  );
}

export default Home;
