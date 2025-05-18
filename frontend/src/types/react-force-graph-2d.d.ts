type ForceGraphProps = {
  graphData: {
    nodes: { id: string }[];
    links: { source: string; target: string }[];
  };
  width?: number;
  height?: number;
  nodeLabel?: (node: any) => string;
  nodeAutoColorBy?: string;
  nodeCanvasObject?: (
    node: any,
    ctx: CanvasRenderingContext2D,
    globalScale: number
  ) => void;
  linkDirectionalArrowLength?: number;
  linkDistance?: number;
  cooldownTicks?: number;
  nodeRelSize?: number;
  onEngineStop?: () => void;
  onNodeClick?: (node: any, event?: MouseEvent) => void;
  linkDirectionalParticles?: number;
  linkDirectionalParticleSpeed?: number;
  backgroundColor?: string;
  linkColor?: () => string;
  linkWidth?: number | ((link: any) => number);
  onNodeHover?: (node: any | null, event?: MouseEvent) => void;
};
