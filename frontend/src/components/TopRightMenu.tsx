import React, { useState, useEffect } from "react";
import { Menu, Home, LogIn, UserPlus, Library, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const TopRightMenu = () => {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  // ログイン状態を監視
  useEffect(() => {
    const token = localStorage.getItem("access");
    const user = localStorage.getItem("username");
    setIsLoggedIn(!!token);
    setUsername(user);
  }, [open]); // メニュー開閉のたびに状態確認

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUsername(null);
    navigate("/login");
  };

  return (
    <div className="absolute top-4 right-4 flex items-center space-x-3 z-50">
      {username && (
        <div className="text-sm text-white">
          こんにちは、<span className="font-semibold">{username}</span>さん 👋
        </div>
      )}

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="text-white hover:text-gray-300"
        >
          <Menu size={28} />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 bg-white text-black rounded shadow w-44">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              <Home size={16} /> ホーム
            </Link>

            {!isLoggedIn && (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  <LogIn size={16} /> ログイン
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  <UserPlus size={16} /> サインアップ
                </Link>
              </>
            )}

            {isLoggedIn && (
              <>
                <Link
                  to="/MyNetworks"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  <Library size={16} /> マイライブラリ
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-left"
                >
                  <LogOut size={16} /> ログアウト
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopRightMenu;
