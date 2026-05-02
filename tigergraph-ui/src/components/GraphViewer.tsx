import { useRef, useCallback, useState, useEffect } from 'react';
import ForceGraph2D, { type ForceGraphMethods, type NodeObject, type LinkObject } from 'react-force-graph-2d';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw, Filter } from 'lucide-react';
import { type GraphData, type GraphNode, type GraphLink } from '../data/graphData';

interface GraphViewerProps {
  data: GraphData;
  graphName: string;
}

const TYPE_COLORS: Record<string, string> = {
  Person: '#FF6B35',
  Company: '#2A7FFF',
  Topic: '#2ECC71',
  Supplier: '#F39C12',
  Manufacturer: '#2A7FFF',
  Warehouse: '#9B59B6',
  Retailer: '#2ECC71',
  Account: '#E74C3C',
  Device: '#8B949E',
  IP: '#9B59B6',
  Transaction: '#E74C3C',
};

type FGNode = NodeObject<GraphNode>;
type FGLink = LinkObject<GraphNode, GraphLink>;

export default function GraphViewer({ data, graphName }: GraphViewerProps) {
  const fgRef = useRef<ForceGraphMethods<FGNode, FGLink>>(undefined);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 });
  const containerRef = useRef<HTMLDivElement>(null);

  const nodeTypes = Array.from(new Set(data.nodes.map((n) => n.type)));

  const filteredNodes = filterType ? data.nodes.filter((n) => n.type === filterType) : data.nodes;
  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredLinks = filterType
    ? data.links.filter((l) => {
        const srcId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
        const tgtId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
        return filteredNodeIds.has(srcId) && filteredNodeIds.has(tgtId);
      })
    : data.links;
  const filteredData = { nodes: filteredNodes, links: filteredLinks };

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setSelectedNode(null);
    setFilterType('');
  }, [graphName]);

  const handleZoomIn = useCallback(() => {
    fgRef.current?.zoom(1.5, 300);
  }, []);

  const handleZoomOut = useCallback(() => {
    fgRef.current?.zoom(0.7, 300);
  }, []);

  const handleFit = useCallback(() => {
    fgRef.current?.zoomToFit(400, 40);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedNode(null);
    setFilterType('');
    setTimeout(() => fgRef.current?.zoomToFit(400, 40), 50);
  }, []);

  const paintNode = useCallback(
    (node: FGNode, ctx: CanvasRenderingContext2D) => {
      const n = node as FGNode & { x: number; y: number };
      if (!isFinite(n.x) || !isFinite(n.y)) return;
      const color = TYPE_COLORS[n.type] || '#FF6B35';
      const isSelected = selectedNode?.id === n.id;
      const isHovered = hoveredNode?.id === n.id;
      const r = Math.sqrt(n.val) * 2.2;

      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 5, 0, 2 * Math.PI);
        ctx.fillStyle = color + '22';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 3, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      const grad = ctx.createRadialGradient(n.x - r * 0.3, n.y - r * 0.3, 0, n.x, n.y, r);
      grad.addColorStop(0, color + 'FF');
      grad.addColorStop(1, color + '99');
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = '#0A0C10';
      ctx.lineWidth = 1;
      ctx.stroke();

      const label = n.label;
      const fontSize = Math.max(8, Math.min(11, r * 0.85));
      ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(label.length > 12 ? label.slice(0, 12) + '…' : label, n.x, n.y + r + fontSize + 2);

      if (r > 8) {
        const initial = label.slice(0, 2).toUpperCase();
        ctx.font = `700 ${Math.max(7, r * 0.7)}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(initial, n.x, n.y);
      }
    },
    [selectedNode, hoveredNode]
  );

  return (
    <div className="flex flex-col h-full bg-[#0A0C10]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#21262D] bg-[#111318] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#E6EDF3]">Graph Explorer</span>
          <span className="text-[10px] text-[#8B949E] bg-[#21262D] px-2 py-0.5 rounded">
            {filteredData.nodes.length}N · {filteredData.links.length}E
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 mr-2">
            <Filter size={10} className="text-[#8B949E]" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-[10px] bg-[#161B22] border border-[#21262D] text-[#E6EDF3] rounded px-2 py-0.5 focus:outline-none focus:border-[#FF6B35]/50"
            >
              <option value="">All types</option>
              {nodeTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          {[
            { icon: ZoomIn, action: handleZoomIn, title: 'Zoom in' },
            { icon: ZoomOut, action: handleZoomOut, title: 'Zoom out' },
            { icon: Maximize2, action: handleFit, title: 'Fit view' },
            { icon: RefreshCw, action: handleReset, title: 'Reset' },
          ].map(({ icon: Icon, action, title }) => (
            <button
              key={title}
              onClick={action}
              title={title}
              className="p-1.5 rounded text-[#8B949E] hover:text-[#FF6B35] hover:bg-[#FF6B35]/10 transition-colors"
            >
              <Icon size={13} />
            </button>
          ))}
        </div>
      </div>

      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        <ForceGraph2D
          ref={fgRef}
          graphData={filteredData as { nodes: FGNode[]; links: FGLink[] }}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="#0A0C10"
          nodeCanvasObject={paintNode}
          nodeCanvasObjectMode={() => 'replace'}
          linkColor={(l) => (l as unknown as GraphLink).color || '#3D444D'}
          linkWidth={1.2}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkDirectionalArrowColor={(l) => (l as unknown as GraphLink).color || '#3D444D'}
          linkCurvature={0.15}
          nodeVal={(n) => (n as FGNode & GraphNode).val}
          onNodeHover={(node) => setHoveredNode(node ? (node as unknown as GraphNode) : null)}
          onNodeClick={(node) => {
            const n = node as unknown as GraphNode;
            setSelectedNode((prev) => (prev?.id === n.id ? null : n));
          }}
          cooldownTicks={120}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          enableNodeDrag
          enableZoomInteraction
          enablePanInteraction
        />

        {selectedNode && (
          <div className="absolute bottom-4 left-4 w-64 bg-[#111318]/95 backdrop-blur border border-[#FF6B35]/30 rounded-xl p-4 shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: TYPE_COLORS[selectedNode.type] || '#FF6B35' }}
              />
              <span className="text-[#FF6B35] font-semibold text-sm">{selectedNode.label}</span>
              <span className="ml-auto text-[10px] text-[#8B949E] bg-[#21262D] px-1.5 py-0.5 rounded">
                {selectedNode.type}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#8B949E]">ID</span>
                <code className="text-[#E6EDF3] font-mono">{selectedNode.id}</code>
              </div>
              {Object.entries(selectedNode.attributes).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-[#8B949E]">{k}</span>
                  <span className="text-[#E6EDF3] font-mono">{String(v)}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="mt-3 w-full text-[10px] text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="absolute top-3 right-3 bg-[#111318]/90 backdrop-blur border border-[#21262D] rounded-lg p-3">
          <div className="text-[10px] text-[#8B949E] mb-2 font-semibold uppercase tracking-wider">Legend</div>
          <div className="space-y-1.5">
            {nodeTypes.map((type) => (
              <div key={type} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[type] || '#8B949E' }} />
                <span className="text-[10px] text-[#8B949E]">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
