import React, { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Download, Library, ZoomIn, ZoomOut, ScanSearch } from "lucide-react";
import * as d3 from "d3";

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

function ArtistVisualizer() {
  const [artist, setArtist] = useState("oasis");
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentTrackTitle, setCurrentTrackTitle] = useState<string | null>(
    null
  );
  const [albumCoverUrl, setAlbumCoverUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fgRef = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [graphWidth, setGraphWidth] = useState(1000);
  const [hoverNode, setHoverNode] = useState<string | null>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (wrapperRef.current) {
        setGraphWidth(wrapperRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleSubmit = async (
    e?: React.FormEvent | undefined,
    centerOverride?: string
  ): Promise<void> => {
    if (e) e.preventDefault();
    const targetArtist = centerOverride || artist;
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/graph-json/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artist: targetArtist, level: 2 }),
      });

      const data = await response.json();
      if (response.ok) {
        const colorMap: Record<number, string> = {
          0: "#c44569", // 中心：ローズレッド
          1: "#574b90", // レベル1：スモーキーパープル
          2: "#3dc1d3", // レベル2：ミントブルー
          3: "#f78fb3", // レベル3：落ち着いたピンク（グレーの代わり）
        };

        data.nodes = data.nodes.map((node: any) => ({
          ...node,
          fx: node.id === targetArtist ? 0 : undefined,
          fy: node.id === targetArtist ? 0 : undefined,
          color: colorMap[node.group] || "#a3a3a3",
        }));
        setArtist(targetArtist);
        setGraphData(data);
        fetchDeezerPreview(targetArtist);

        if (wrapperRef.current) {
          wrapperRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
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
  const handleNodeHover = (node: any) => {
    if (node) {
      setHoverNode(node.id);
    } else {
      setHoverNode(null);
    }
  };

  const downloadImage = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${artist}_graph.png`;
    link.href = (canvas as HTMLCanvasElement).toDataURL("image/png");
    link.click();
  };

  const saveToLibrary = async () => {
    try {
      const memo = prompt("このネットワークに関するメモを入力してください:");
      if (memo === null) return;

      // Graph構造から不要なプロパティを削除
      const cleanGraphData = JSON.parse(JSON.stringify(graphData));
      cleanGraphData.nodes.forEach((node: any) => {
        delete node.x;
        delete node.y;
        delete node.vx;
        delete node.vy;
        delete node.fx;
        delete node.fy;
      });

      // Base64画像取得
      const canvas = document.querySelector("canvas") as HTMLCanvasElement;
      const image_base64 = canvas ? canvas.toDataURL("image/png") : "";

      const res = await fetch("http://localhost:8000/api/save-network/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: JSON.stringify({
          center_artist: artist,
          graph_json: cleanGraphData,
          memo: memo,
          image_base64: image_base64,
        }),
      });

      const resData = await res.json();
      console.log("レスポンス内容:", resData);
      if (res.ok) {
        alert("マイライブラリに保存しました！");
      } else {
        alert("保存に失敗しました: " + resData.error);
      }
    } catch (error) {
      console.error("保存エラー", error);
      alert("エラーが発生しました");
    }
  };

  const fetchDeezerPreview = async (artistName: string) => {
    try {
      const res1 = await fetch(
        `http://localhost:8000/api/deezer/?q=${encodeURIComponent(artistName)}`
      );
      const data1 = await res1.json();
      if (!data1.data || data1.data.length === 0) return;
      const artistId = data1.data[0].id;

      const res2 = await fetch(
        `http://localhost:8000/api/deezer/top/?id=${artistId}`
      );
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

  useEffect(() => {
    if (fgRef.current) {
      setTimeout(() => {
        fgRef.current.zoom(3.0, 0); // 倍率, アニメーション時間(ms)
        fgRef.current.centerAt(0, 0, 0); // 中央に合わせる（任意）
      }, 300);
    }
  }, [graphData]);

  useEffect(() => {
    if (fgRef.current) {
      // ノード間の引き離し力
      fgRef.current.d3Force("charge")?.strength(-100);

      // リンクの長さ（間隔）
      fgRef.current.d3Force("link")?.distance(160);

      // ノードが重ならないようにする
      fgRef.current.d3Force(
        "collide",
        d3.forceCollide().radius(35).strength(1) //ノードサイズに合わせて衝突距離調整
      );
    }
  }, [graphData]);
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 relative">
      <h1 className="text-xl font-bold mb-2 mt-1">関連アーティストを可視化</h1>

      <div className="w-full max-w-6xl flex flex-col items-center mb-0">
        <div className="flex items-center justify-center space-x-4">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="px-3 py-1 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="アーティスト名"
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

        <div className="w-full max-w-6xl flex justify-end items-center -mt-2 mb-4 pr-2 space-x-2">
          <button
            onClick={downloadImage}
            className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 shadow"
            title="画像をダウンロード"
          >
            <Download size={20} />
          </button>
          <button
            onClick={saveToLibrary}
            className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 shadow"
            title="マイライブラリに保存"
          >
            <Library size={20} />
          </button>
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
          width={window.innerWidth * 0.9}
          height={window.innerHeight * 0.8}
          backgroundColor="#1a202c"
          graphData={graphData}
          nodeLabel={(node: any) => node.id}
          nodeAutoColorBy="id"
          onNodeHover={(node) => setHoverNode(node?.id || null)}
          linkColor={(link: any) =>
            hoverNode &&
            (link.source.id === hoverNode || link.target.id === hoverNode)
              ? "rgba(255, 255, 255, 0.5)"
              : "rgba(255, 255, 255, 0)"
          }
          linkWidth={(link: any) =>
            hoverNode &&
            (link.source.id === hoverNode || link.target.id === hoverNode)
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
            handleSubmit(undefined, node.id);
          }}
        />

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
    </div>
  );
}

export default ArtistVisualizer;
