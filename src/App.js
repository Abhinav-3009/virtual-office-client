import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import SignIn from "./pages/signin";
import Register from "./pages/register";
import Home from "./pages/home";
import { UserProvider } from "./context/userContext";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-2xl font-bold mb-4">Welcome to Our App</h1>
                <div className="space-x-4">
                  <Link
                    to="/signin"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
                  >
                    Register
                  </Link>
                </div>
              </div>
            }
          />

          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
