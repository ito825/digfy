import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ArtistVisualizer from "./pages/ArtistVisualizer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SavedList from "./pages/MyNetworks";
import TopRightMenu from "./components/TopRightMenu";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <TopRightMenu />

        {/* ページルーティング */}
        <Routes>
          <Route path="/" element={<ArtistVisualizer />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/MyNetworks" element={<SavedList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
