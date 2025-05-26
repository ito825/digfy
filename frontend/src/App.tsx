import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ArtistVisualizer from "./pages/ArtistVisualizer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SavedList from "./pages/MyNetworks";
import TopRightMenu from "./components/TopRightMenu";
import RequireAuth from "./components/RequireAuth";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <TopRightMenu />
        {/*  トースト通知の描画エリアを追加 */}
        <Toaster position="top-right" reverseOrder={false} />

        {/* ページルーティング */}
        <Routes>
          <Route path="/" element={<ArtistVisualizer />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ログインが必要なページには認証ガードを追加 */}
          <Route
            path="/MyNetworks"
            element={
              <RequireAuth>
                <SavedList />
              </RequireAuth>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
