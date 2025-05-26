export const refreshAccessToken = async (): Promise<string | null> => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  const response = await fetch("http://localhost:8000/api/token/refresh/", {
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
export const authFetch = async (
  url: string,
  options: RequestInit = {},
  retry = true
): Promise<Response> => {
  let access = localStorage.getItem("access");

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      Authorization: access ? `Bearer ${access}` : "",
    },
  });

  if (res.status === 401 && retry) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      return authFetch(url, options, false); // リトライ（1回まで）
    } else {
      alert("セッションが切れました。再ログインしてください。");
      window.location.href = "/login";
    }
  }

  return res;
};
