// components/RequireAuth.tsx
import React, { JSX } from "react";
import { Navigate } from "react-router-dom";

// 認証されていない場合は /login にリダイレクトするラッパー
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const access = localStorage.getItem("access");

  // access トークンが存在しない＝未ログイン → /login に移動
  return access ? children : <Navigate to="/login" />;
};

export default RequireAuth;
