import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { User, Lock } from "lucide-react";

const BASE_URL = process.env.REACT_APP_API_URL;

interface DecodedToken {
  username: string;
  exp: number;
  iat: number;
}

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // --- ログイン処理 ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${BASE_URL}/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // トークンを保存
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        // アクセストークンをデコードしてユーザー名を保存
        const decoded: DecodedToken = jwtDecode(data.access);
        localStorage.setItem("username", decoded.username);

        window.location.href = "/";
      } else {
        // 英語のエラーを日本語に変換
        if (
          data.detail === "No active account found with the given credentials"
        ) {
          setError("ユーザー名またはパスワードが間違っています");
        } else {
          setError(data.detail || "ログインに失敗しました");
        }
      }
    } catch (err) {
      // ネットワークエラー時のメッセージ
      setError("サーバーに接続できませんでした");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">ログイン</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="ユーザー名"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              required
              className="w-full pl-10 pr-3 py-2 rounded bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              required
              className="w-full pl-10 pr-3 py-2 rounded bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
