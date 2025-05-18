import React, { useEffect, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";

function RenderSavedGraph({ rawData }: { rawData: any }) {
  const fgRef = useRef<any>(null);

  const graphData = typeof rawData === "string" ? JSON.parse(rawData) : rawData;

  useEffect(() => {
    if (fgRef.current) {
      setTimeout(() => fgRef.current.zoomToFit(400, 40), 300);
    }
  }, [rawData]);

  return (
    <div className="border border-gray-600 rounded-lg overflow-hidden my-6 w-full max-w-6xl h-[500px] mx-auto">
      <ForceGraph2D
        ref={fgRef}
        width={600}
        height={300}
        backgroundColor="#1a202c"
        graphData={graphData}
        nodeLabel={(node: any) => node.id}
        nodeAutoColorBy="id"
        linkColor={() => "rgba(255,255,255,0.4)"}
        linkWidth={0.5}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const fontSize = 10 / globalScale;
          const label = node.id;
          const radius = 15;
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
      />
    </div>
  );
}

export default RenderSavedGraph;
