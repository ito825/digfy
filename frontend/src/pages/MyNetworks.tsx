import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/auth";

function SavedList() {
  const [networks, setNetworks] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editMemo, setEditMemo] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const res = await authFetch("http://localhost:8000/api/my-networks/");
      if (res && res.ok) {
        const data = await res.json();
        setNetworks(data);
      } else {
        alert("保存されたネットワークの取得に失敗しました");
      }
    };
    fetchData();
  }, []);

  const handleSaveMemo = async () => {
    if (!selectedItem) return;

    const res = await authFetch(
      `http://localhost:8000/api/update-network/${selectedItem.id}/`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memo: editMemo }),
      }
    );

    if (res && res.ok) {
      const updated = networks.map((item: any) =>
        item.id === selectedItem.id ? { ...item, memo: editMemo } : item
      );
      setNetworks(updated);
      setSelectedItem(null);
    } else {
      alert("メモの保存に失敗しました");
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    const confirmed = window.confirm("本当に削除しますか？");
    if (!confirmed) return;

    const res = await authFetch(
      `http://localhost:8000/api/delete-network/${selectedItem.id}/`,
      { method: "DELETE" }
    );

    if (res && res.ok) {
      setNetworks(networks.filter((item) => item.id !== selectedItem.id));
      setSelectedItem(null);
    } else {
      alert("削除に失敗しました");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">マイライブラリ</h1>

      {networks.length === 0 ? (
        <p>保存データがありません</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {networks.map((item: any, index: number) => (
            <div
              key={index}
              className="bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-2xl transition cursor-pointer"
              onClick={() => {
                setSelectedItem(item);
                setEditMemo(item.memo || "");
              }}
            >
              <img
                src={item.image_base64}
                alt="保存されたグラフ"
                className="rounded-lg border border-gray-700 mb-4 w-full h-40 object-cover"
              />
              <h2 className="text-lg font-semibold mb-1">
                {item.center_artist}
              </h2>
              <p className="text-sm text-gray-400 mb-2">
                {new Date(item.created_at).toLocaleString()}
              </p>
              {item.memo && (
                <p className="text-sm text-gray-300 whitespace-pre-wrap">
                  💬 {item.memo}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-3xl relative mx-4">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-2 right-2 text-white text-xl hover:text-gray-300"
            >
              ×
            </button>
            <img
              src={selectedItem.image_base64}
              alt="拡大画像"
              className="w-full rounded-lg border border-gray-700"
            />
            <h2 className="text-2xl font-bold mt-4 mb-2">
              {selectedItem.center_artist}
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              {new Date(selectedItem.created_at).toLocaleString()}
            </p>

            <label className="block text-sm text-gray-400 mb-1">
              💬 メモを編集：
            </label>
            <textarea
              className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white resize-none h-24 mb-4"
              value={editMemo}
              onChange={(e) => setEditMemo(e.target.value)}
            />

            <div className="flex justify-between items-center">
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
              >
                削除
              </button>
              <button
                onClick={handleSaveMemo}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedList;
