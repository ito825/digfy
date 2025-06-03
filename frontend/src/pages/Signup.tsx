// --- Import Section ---
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Lock } from "lucide-react";

// --- APIのベースURL（環境変数から取得） ---
const BASE_URL = process.env.REACT_APP_API_URL;

// --- サインアップコンポーネント ---
const Signup: React.FC = () => {
  // --- フォーム入力用の状態管理 ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // --- メッセージ表示用の状態管理 ---
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --- ページ遷移用のフック ---
  const navigate = useNavigate();

  // --- サインアップ処理 ---
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); // フォームのデフォルト送信をキャンセル

    try {
      const response = await fetch(`${BASE_URL}/api/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const text = await response.text(); // 空レスポンス対策
      const data = text ? JSON.parse(text) : {};

      if (response.ok) {
        // 登録成功時
        setSuccess("✅ 登録成功しました！ログイン画面へ移動します…");
        setError("");
        setTimeout(() => navigate("/login"), 1500);
      } else if (data.detail) {
        setError(data.detail);
      } else {
        setError(data.detail || "サインアップに失敗しました");
      }
    } catch (error) {
      setError("通信エラーが発生しました");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">サインアップ</h2>

        {/* フォーム本体 */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* ユーザー名入力欄 */}
          <div className="relative">
            <UserPlus
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="ユーザー名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2 rounded bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* パスワード入力欄 */}
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2 rounded bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* エラー/成功メッセージ表示 */}
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          {success && (
            <p className="text-green-400 text-sm text-center">{success}</p>
          )}

          {/* 登録ボタン */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
          >
            登録する
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
