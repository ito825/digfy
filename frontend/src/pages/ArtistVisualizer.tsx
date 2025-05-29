// --- Import Section ---
import React, { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Camera, Library, ZoomIn, ZoomOut, ScanSearch } from "lucide-react";
import * as d3 from "d3";
import { authFetch } from "../utils/auth";
import toast from "react-hot-toast";

const BASE_URL = process.env.REACT_APP_API_URL;

// --- Type Definitions ---
type NodeType = {
  id: string;
  color?: string;
};

type LinkType = {
  source: string;
  target: string;
};

type GraphDataType = {
  nodes: NodeType[];
  links: LinkType[];
};

// --- Main Component ---
function ArtistVisualizer() {
  // --- State Variables ---
  const [artist, setArtist] = useState("");
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentTrackTitle, setCurrentTrackTitle] = useState<string | null>(
    null
  );
  const [albumCoverUrl, setAlbumCoverUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [showAllLinks, setShowAllLinks] = useState(false);

  const fgRef = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [graphWidth, setGraphWidth] = useState(1000);
  const [graphHeight, setGraphHeight] = useState(600);
  const [showModal, setShowModal] = useState(false);
  const [memoInput, setMemoInput] = useState("");
  const [explorationPath, setExplorationPath] = useState<string[]>([artist]);

  // --- Window Resize Effect ---
  useEffect(() => {
    const updateSize = () => {
      if (wrapperRef.current) {
        setGraphWidth(wrapperRef.current.offsetWidth);
        setGraphHeight(wrapperRef.current.offsetHeight);
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // --- Graph Fetch & Setup ---
  const handleSubmit = async (
    e?: React.FormEvent | undefined,
    centerOverride?: string
  ): Promise<void> => {
    if (e) e.preventDefault();
    let targetArtist = centerOverride || artist;

    if (!targetArtist) {
      toast.error("アーティスト名を入力してください");
      return;
    }

    setIsLoading(true);

    try {
      // Deezer APIで正式名称を取得
      const res1 = await fetch(
        `${BASE_URL}/api/deezer/?q=${encodeURIComponent(targetArtist)}`
      );
      const data1 = await res1.json();
      if (!data1.data || data1.data.length === 0) {
        alert("アーティストが見つかりませんでした");
        setIsLoading(false);
        return;
      }
      targetArtist = data1.data[0].name;
      setArtist(targetArtist);
      setExplorationPath((prev) => {
        if (prev[prev.length - 1] === targetArtist) return prev;
        return [...prev, targetArtist];
      });
      const response = await fetch(`${BASE_URL}/api/graph-json/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artist: targetArtist, level: 2 }),
      });

      const data = await response.json();
      if (response.ok) {
        const colorMap: Record<number, string> = {
          0: "#c44569",
          1: "#8e44ad",
          2: "#3498db",
          3: "#1abc9c",
        };

        data.nodes = data.nodes.map((node: any) => ({
          ...node,
          fx: node.id === targetArtist ? 0 : undefined,
          fy: node.id === targetArtist ? 0 : undefined,
          color: colorMap[node.group] || "#a3a3a3",
        }));

        setGraphData(data);
        fetchDeezerPreview(targetArtist);
      } else {
        alert(data.error || "エラーが発生しました");
      }
    } catch (err) {
      console.error("通信エラー", err);
      alert("通信に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Hover Effect ---
  const handleNodeHover = (node: any) => {
    if (node) {
      setHoverNode(node.id);
    } else {
      setHoverNode(null);
    }
  };

  // --- Image Download ---
  const downloadImage = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${artist}_graph.png`;
    link.href = (canvas as HTMLCanvasElement).toDataURL("image/png");
    link.click();
  };

  // --- Token Refresh ---
  const refreshToken = async () => {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) return false;

    const res = await fetch(`${BASE_URL}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("access", data.access);
      return true;
    } else {
      return false;
    }
  };

  // --- Save Network to Library ---
  const saveToLibrary = async (memo: string) => {
    try {
      const cleanGraphData = JSON.parse(JSON.stringify(graphData));
      cleanGraphData.nodes.forEach((node: any) => {
        delete node.x;
        delete node.y;
        delete node.vx;
        delete node.vy;
        delete node.fx;
        delete node.fy;
      });

      const canvas = document.querySelector("canvas") as HTMLCanvasElement;
      const image_base64 = canvas ? canvas.toDataURL("image/png") : "";

      const ok = await refreshToken();
      if (!ok) {
        alert("ログインセッションが切れています。再ログインしてください。");
        return;
      }

      const res = await authFetch(`${BASE_URL}/api/save-network/`, {
        method: "POST",
        body: JSON.stringify({
          center_artist: artist,
          graph_json: cleanGraphData,
          memo: memo,
          image_base64: image_base64,
          path: explorationPath,
        }),
      });

      if (!res) {
        alert("セッションが切れています。再ログインしてください。");
        return;
      }

      const resData = await res.json();
      console.log("レスポンス内容:", resData);
      if (res.ok) {
        toast.success("マイライブラリに保存しました！");
      } else {
        toast.error(" 保存に失敗しました: " + resData.error);
      }
    } catch (error) {
      console.error("保存エラー", error);
      alert("エラーが発生しました");
    }
  };

  // --- Deezer Preview Fetch ---
  const fetchDeezerPreview = async (artistName: string) => {
    try {
      const res1 = await fetch(
        `${BASE_URL}/api/deezer/?q=${encodeURIComponent(artistName)}`
      );
      const data1 = await res1.json();
      if (!data1.data || data1.data.length === 0) return;
      const artistId = data1.data[0].id;

      const res2 = await fetch(`${BASE_URL}/api/deezer/top/?id=${artistId}`);
      const data2 = await res2.json();
      if (!data2.data || data2.data.length === 0) return;

      const track = data2.data[0];
      setPreviewUrl(track.preview);
      setCurrentTrackTitle(track.title_short);
      setAlbumCoverUrl(track.album.cover);
    } catch (error) {
      console.error("Deezer fetch error", error);
    }
  };

  // --- ForceGraph Forces ---
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force("charge")?.strength(-100);
      fgRef.current.d3Force("link")?.distance(160);
      fgRef.current.d3Force(
        "collide",
        d3.forceCollide().radius(35).strength(1)
      );
    }
  }, [graphData]);

  // --- Zoom Initial Setup ---
  useEffect(() => {
    if (fgRef.current) {
      setTimeout(() => {
        fgRef.current.zoom(3.0, 0);
        fgRef.current.centerAt(0, 0, 0);
      }, 300);
    }
  }, [graphData]);
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 relative">
      <div className="text-center mb-4 mt-2">
        <h1 className="text-3xl font-bold">digfy</h1>
        <p className="text-sm text-gray-400 mt-1">
          広がる音楽の地図を、あなたの耳と目で旅しよう
        </p>
      </div>

      <div className="w-full max-w-6xl flex flex-col items-center mb-0">
        <div className="flex items-center justify-center space-x-4">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="px-3 py-1 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例：Oasis"
            />
            <button
              type="submit"
              className="px-4 py-1 bg-blue-600 rounded text-white hover:bg-blue-700"
            >
              検索
            </button>
          </form>
          {previewUrl && currentTrackTitle && (
            <div className="bg-gray-800 p-3 rounded-xl shadow flex items-center space-x-4">
              {albumCoverUrl && (
                <img
                  src={albumCoverUrl}
                  alt="Album cover"
                  className="rounded-lg"
                  style={{ width: 60, height: 60, objectFit: "cover" }}
                />
              )}
              <div className="flex flex-col overflow-hidden">
                <div className="text-xs text-gray-400 uppercase mb-1">
                  Now Playing
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-end space-x-[2px] h-4 w-5">
                    <div className="w-[2px] h-2 bg-green-400 animate-bounce delay-0" />
                    <div className="w-[2px] h-3 bg-green-400 animate-bounce delay-100" />
                    <div className="w-[2px] h-1 bg-green-400 animate-bounce delay-200" />
                  </div>
                  <div className="text-white font-semibold text-base truncate max-w-[200px]">
                    {currentTrackTitle}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-full max-w-6xl flex justify-between items-center -mt-2 mb-4 px-2">
          {/* レジェンド左側 */}
          <div className="flex items-center space-x-4 text-sm text-gray-300">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-[#c44569] border border-white" />
              <span>中心</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-[#8e44ad] border border-white" />
              <span>関連度高</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-[#3498db] border border-white" />
              <span>中</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-[#1abc9c] border border-white" />
              <span>低</span>
            </div>
          </div>

          {/* 右上ボタン群 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAllLinks(!showAllLinks)}
              className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 shadow"
              title="エッジ表示切替"
            >
              {showAllLinks ? "⇄ Hover表示" : "⇄ 全表示"}
            </button>
            <button
              onClick={downloadImage}
              className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 shadow"
              title="今見えているネットワークをキャプチャ"
            >
              <Camera size={20} />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 shadow"
              title="マイライブラリに保存"
            >
              <Library size={20} />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={wrapperRef}
        className="w-full max-w-6xl h-[600px] border border-gray-700 rounded overflow-hidden mb-4 relative"
      >
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-400"></div>
          </div>
        )}

        <ForceGraph2D
          ref={fgRef}
          width={graphWidth}
          height={graphHeight}
          backgroundColor="#1a202c"
          graphData={graphData}
          nodeLabel={(node: any) => node.id}
          nodeAutoColorBy="id"
          onNodeHover={(node) => setHoverNode(node?.id || null)}
          linkColor={(link: any) =>
            showAllLinks ||
            (hoverNode &&
              (link.source.id === hoverNode || link.target.id === hoverNode))
              ? "rgba(255, 255, 255, 0.5)"
              : "rgba(255, 255, 255, 0)"
          }
          linkWidth={(link: any) =>
            showAllLinks ||
            (hoverNode &&
              (link.source.id === hoverNode || link.target.id === hoverNode))
              ? 1.5
              : 0
          }
          {...{ linkDistance: 180, cooldownTicks: 100, nodeRelSize: 14 }}
          nodeRelSize={14}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const fontSize = 14 / globalScale;
            const label = node.id;
            const radius = node.size || 16;
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = node.color || "gray";
            ctx.fill();
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.lineWidth = 4;
            ctx.strokeStyle = "black";
            ctx.strokeText(label, node.x, node.y);
            ctx.fillStyle = "white";
            ctx.fillText(label, node.x, node.y);
          }}
          onNodeClick={(node, event) => {
            if (!node || !event) return;
            setArtist(node.id);
            setExplorationPath((prev) => [...prev, node.id]); //経路追加
            handleSubmit(undefined, node.id);
          }}
        />

        {/* 右上説明ラベル */}
        {!hoverNode && (
          <div className="absolute top-4 right-4 text-sm text-gray-400 bg-gray-800 bg-opacity-80 px-3 py-1 rounded shadow z-30">
            気になる名前に触れて、音楽のつながりを見てみよう。
            クリックで再探索。
          </div>
        )}

        <div className="absolute top-4 left-4 flex space-x-2 z-20">
          <button
            onClick={() => {
              const currentZoom = fgRef.current.zoom();
              fgRef.current.zoom(currentZoom * 1.2, 400);
            }}
            className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 shadow"
            title="拡大"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={() => {
              const currentZoom = fgRef.current.zoom();
              fgRef.current.zoom(currentZoom * 0.8, 400);
            }}
            className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 shadow"
            title="縮小"
          >
            <ZoomOut size={20} />
          </button>
          <button
            onClick={() => fgRef.current.zoomToFit(1000, 40)}
            className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 shadow"
            title="全体表示"
          >
            <ScanSearch size={20} />
          </button>
        </div>
      </div>

      {previewUrl && (
        <div className="my-4">
          <audio
            controls
            autoPlay
            src={previewUrl}
            className="w-full max-w-md"
          />
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg relative">
            <h2 className="text-xl font-bold mb-4">メモを保存</h2>
            <textarea
              value={memoInput}
              onChange={(e) => setMemoInput(e.target.value)}
              className="w-full h-32 p-2 rounded bg-gray-900 border border-gray-600 text-white mb-4"
              placeholder="ネットワークに関するメモを入力..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  saveToLibrary(memoInput);
                  setShowModal(false);
                  setMemoInput("");
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
              >
                保存する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArtistVisualizer;
