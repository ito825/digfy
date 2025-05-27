const BASE_URL = process.env.REACT_APP_API_URL;

export const refreshAccessToken = async (): Promise<string | null> => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  const response = await fetch(`${BASE_URL}/api/token/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh }),
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem("access", data.access);
    return data.access;
  } else {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    return null;
  }
};

// 共通APIラッパー関数（fetch + 自動トークンリフレッシュ）
// utils/auth.ts
export async function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("access");

  const headers: HeadersInit = {
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    alert("セッションが切れました。再度ログインしてください。");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
    return null; // 呼び出し元が例外処理しやすくする
  }

  return response;
}
