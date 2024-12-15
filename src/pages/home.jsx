import React from "react";
import Chat from "../chat";

function Home() {
  return (
    <div className="home">
      <h1 className="text-5xl bg-slate-700">This is the home page.</h1>
      <Chat />
    </div>
  );
}

export default Home;
