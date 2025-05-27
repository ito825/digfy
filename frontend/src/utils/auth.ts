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
export const authFetch = async (url: string, options: RequestInit = {}) => {
  const access = localStorage.getItem("access");

  const fetchWithAuth = async (token: string | null) => {
    return await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...(options.headers || {}),
      },
    });
  };

  let res = await fetchWithAuth(access);

  // 401ならリフレッシュして再試行
  if (res.status === 401) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      res = await fetchWithAuth(newAccess);
    } else {
      // リフレッシュ失敗 → ログアウト処理
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("username");
      window.location.href = "/login";
      return null;
    }
  }

  return res;
};
