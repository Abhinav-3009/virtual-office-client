import React from "react";
import Office from "../components/office";

function Home() {
  return (
    <div className="home">
      {/* <h1 className="text-5xl bg-slate-700">This is the home page.</h1> */}
      {/* Div changed to properly show header in the home page */}
      {/* <div className="fixed inset-0 overflow-hidden"> */}
      <div className="relative h-full">  
      <Office/>
      </div>
    </div>
  );
}

export default Home;
