import React from "react";
import Chat from "../components/chat";
import PrivateChat from "../components/privateChat";
import Office from "../components/office";

function Home() {
  return (
    <div className="home">
      <h1 className="text-5xl bg-slate-700">This is the home page.</h1>
      <div className="fixed inset-0 overflow-hidden">
      <Office/>
      </div>
    </div>
  );
}

export default Home;
