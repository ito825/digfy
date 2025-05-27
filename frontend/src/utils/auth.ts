// utils/auth.ts

const BASE_URL = process.env.REACT_APP_API_URL;

/**
 * アクセストークンのリフレッシュ処理
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  const response = await fetch(`${BASE_URL}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

/**
 * 認証付き fetch。アクセストークンの自動更新つき
 */
export const authFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response | null> => {
  const access = localStorage.getItem("access");

  const fetchWithToken = async (token: string | null) => {
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...(options.headers || {}),
      },
    });
  };

  let res = await fetchWithToken(access);

  // アクセストークンが切れてたらリフレッシュして再試行
  if (res.status === 401) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      res = await fetchWithToken(newAccess);
    } else {
      // リフレッシュ失敗 → ログアウト & リダイレクト
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("username");
      window.location.href = "/login";
      return null;
    }
  }

  return res;
};
