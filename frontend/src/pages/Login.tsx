//--- Import Section ---
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { User, Lock } from "lucide-react";

// --- APIのベースURLを環境変数から取得 ---
const BASE_URL = process.env.REACT_APP_API_URL;

// --- トークンの中身の型定義（デコード用） ---
interface DecodedToken {
  username: string;
  exp: number;
  iat: number;
}

// --- ログインコンポーネント本体 ---
const Login: React.FC = () => {
  // --- 入力欄の状態管理 ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // --- エラーメッセージ表示用 ---
  const [error, setError] = useState("");

  // --- ページ遷移用のフック ---
  const navigate = useNavigate();

  // --- ログイン処理 ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // フォーム送信のデフォルト動作をキャンセル

    try {
      // API に対してログインリクエストを送信
      const response = await fetch(`${BASE_URL}/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // --- トークンをローカルストレージに保存 ---
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        // --- アクセストークンをデコードしてユーザー名を保存 ---
        const decoded: DecodedToken = jwtDecode(data.access);
        localStorage.setItem("username", decoded.username);

        // --- トップページにリダイレクト ---
        window.location.href = "/";
      } else {
        if (
          data.detail === "No active account found with the given credentials"
        ) {
          setError("ユーザー名またはパスワードが間違っています");
        } else {
          setError(data.detail || "ログインに失敗しました");
        }
      }
    } catch (err) {
      setError("サーバーに接続できませんでした");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">ログイン</h2>

        {/* ログインフォーム */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* --- ユーザー名入力欄 --- */}
          <div className="relative">
            <User className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="ユーザー名"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(""); // 入力時にエラーをクリア
              }}
              required
              className="w-full pl-10 pr-3 py-2 rounded bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* --- パスワード入力欄 --- */}
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(""); // 入力時にエラーをクリア
              }}
              required
              className="w-full pl-10 pr-3 py-2 rounded bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* --- エラーメッセージ --- */}
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          {/* --- ログインボタン --- */}
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
