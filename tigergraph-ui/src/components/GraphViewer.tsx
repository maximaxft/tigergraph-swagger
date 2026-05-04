import { useRef, useCallback, useState, useEffect } from 'react';
import ForceGraph2D, { type ForceGraphMethods, type NodeObject, type LinkObject } from 'react-force-graph-2d';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw, Filter, X } from 'lucide-react';
import { type GraphData, type GraphNode, type GraphLink } from '../data/graphData';

interface GraphViewerProps {
  data: GraphData;
  graphName: string;
}

type FGNode = NodeObject<GraphNode>;
type FGLink = LinkObject<GraphNode, GraphLink>;

export default function GraphViewer({ data, graphName }: GraphViewerProps) {
  const fgRef = useRef<ForceGraphMethods<FGNode, FGLink>>(undefined);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<GraphLink | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Derive type → color from actual node data (first node of each type wins)
  const typeColorMap = new Map<string, string>();
  for (const n of data.nodes) {
    if (!typeColorMap.has(n.type)) typeColorMap.set(n.type, n.color);
  }
  const nodeTypes = Array.from(typeColorMap.keys());

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
      if (entry) setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setSelectedNode(null);
    setSelectedLink(null);
    setFilterType('');
  }, [graphName]);

  const handleZoomIn  = useCallback(() => fgRef.current?.zoom(1.5, 300), []);
  const handleZoomOut = useCallback(() => fgRef.current?.zoom(0.7, 300), []);
  const handleFit     = useCallback(() => fgRef.current?.zoomToFit(400, 40), []);
  const handleReset   = useCallback(() => {
    setSelectedNode(null);
    setSelectedLink(null);
    setFilterType('');
    setTimeout(() => fgRef.current?.zoomToFit(400, 40), 50);
  }, []);

  const paintNode = useCallback(
    (node: FGNode, ctx: CanvasRenderingContext2D) => {
      const n = node as FGNode & { x: number; y: number };
      if (!isFinite(n.x) || !isFinite(n.y)) return;

      // Use color from backend data directly
      const color = n.color || '#8B949E';
      const isSelected = selectedNode?.id === n.id;
      const isHovered  = hoveredNode?.id === n.id;
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
      {/* Toolbar */}
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
            { icon: ZoomIn,    action: handleZoomIn,  title: 'Zoom in'  },
            { icon: ZoomOut,   action: handleZoomOut, title: 'Zoom out' },
            { icon: Maximize2, action: handleFit,     title: 'Fit view' },
            { icon: RefreshCw, action: handleReset,   title: 'Reset'    },
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
          linkLabel={(l) => (l as unknown as GraphLink).type || ''}
          nodeVal={(n) => (n as FGNode & GraphNode).val}
          onNodeHover={(node) => setHoveredNode(node ? (node as unknown as GraphNode) : null)}
          onNodeClick={(node) => {
            const n = node as unknown as GraphNode;
            setSelectedLink(null);
            setSelectedNode((prev) => (prev?.id === n.id ? null : n));
          }}
          onLinkClick={(link) => {
            setSelectedNode(null);
            setSelectedLink((prev) => {
              const l = link as unknown as GraphLink;
              const prevSrc = typeof prev?.source === 'object' ? (prev.source as GraphNode).id : prev?.source;
              const prevTgt = typeof prev?.target === 'object' ? (prev.target as GraphNode).id : prev?.target;
              const lSrc = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
              const lTgt = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
              return prevSrc === lSrc && prevTgt === lTgt ? null : l;
            });
          }}
          cooldownTicks={120}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          enableNodeDrag
          enableZoomInteraction
          enablePanInteraction
        />

        {/* Selected node panel */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 w-64 max-h-[70%] flex flex-col bg-[#111318]/95 backdrop-blur border border-[#FF6B35]/30 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 pt-4 pb-3 shrink-0">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: selectedNode.color || '#8B949E' }} />
              <span className="text-[#FF6B35] font-semibold text-sm truncate min-w-0">{selectedNode.label}</span>
              <span className="ml-auto shrink-0 text-[10px] text-[#8B949E] bg-[#21262D] px-1.5 py-0.5 rounded">
                {selectedNode.type}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto px-4 space-y-1.5 min-h-0">
              <div className="flex gap-2 text-xs">
                <span className="text-[#8B949E] shrink-0">ID</span>
                <code className="text-[#E6EDF3] font-mono break-all min-w-0">{selectedNode.id}</code>
              </div>
              {Object.entries(selectedNode.attributes).map(([k, v]) => (
                <div key={k} className="flex gap-2 text-xs">
                  <span className="text-[#8B949E] shrink-0">{k}</span>
                  <span className="text-[#E6EDF3] font-mono break-all min-w-0 text-right flex-1">{String(v)}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="shrink-0 py-2.5 px-4 text-[10px] text-[#8B949E] hover:text-[#E6EDF3] border-t border-[#21262D] transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Selected edge panel */}
        {selectedLink && (() => {
          const srcId = typeof selectedLink.source === 'object' ? (selectedLink.source as GraphNode).id : selectedLink.source;
          const tgtId = typeof selectedLink.target === 'object' ? (selectedLink.target as GraphNode).id : selectedLink.target;
          const edgeColor = selectedLink.color || '#3D444D';
          const hasAttrs = Object.keys(selectedLink.attributes ?? {}).length > 0;
          return (
            <div className="absolute bottom-4 left-4 w-64 max-h-[70%] flex flex-col bg-[#111318]/95 backdrop-blur border rounded-xl shadow-2xl overflow-hidden"
                 style={{ borderColor: edgeColor + '55' }}>
              <div className="flex items-center gap-2 px-4 pt-4 pb-3 shrink-0">
                <div className="w-6 h-0.5 rounded shrink-0" style={{ backgroundColor: edgeColor }} />
                <span className="font-semibold text-sm truncate min-w-0" style={{ color: edgeColor }}>{selectedLink.type}</span>
                <button
                  onClick={() => setSelectedLink(null)}
                  className="ml-auto shrink-0 text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 space-y-1.5 min-h-0">
                <div className="flex gap-2 text-xs">
                  <span className="text-[#8B949E] shrink-0">From</span>
                  <code className="text-[#E6EDF3] font-mono break-all min-w-0">{srcId}</code>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="text-[#8B949E] shrink-0">To</span>
                  <code className="text-[#E6EDF3] font-mono break-all min-w-0">{tgtId}</code>
                </div>
                {hasAttrs && Object.entries(selectedLink.attributes).map(([k, v]) => (
                  <div key={k} className="flex gap-2 text-xs">
                    <span className="text-[#8B949E] shrink-0">{k}</span>
                    <span className="text-[#E6EDF3] font-mono break-all min-w-0 text-right flex-1">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Legend — colors from actual data */}
        {nodeTypes.length > 0 && (
          <div className="absolute top-3 right-3 bg-[#111318]/90 backdrop-blur border border-[#21262D] rounded-lg p-3">
            <div className="text-[10px] text-[#8B949E] mb-2 font-semibold uppercase tracking-wider">Legend</div>
            <div className="space-y-1.5">
              {nodeTypes.map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: typeColorMap.get(type) || '#8B949E' }} />
                  <span className="text-[10px] text-[#8B949E]">{type}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
