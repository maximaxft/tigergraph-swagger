import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw, Filter, X } from 'lucide-react';
import { type GraphData, type GraphNode, type GraphLink } from '../data/graphData';

interface GraphViewerProps {
  data: GraphData;
  graphName: string;
}

type Pos = { x: number; y: number };

// Pre-compute node positions with a synchronous force simulation
function layoutGraph(
  nodes: GraphNode[],
  links: GraphLink[],
  width: number,
  height: number,
): Map<string, Pos> {
  if (nodes.length === 0) return new Map();

  const n = nodes.length;
  const cx = width / 2;
  const cy = height / 2;
  const r0 = Math.min(width, height) * 0.38;

  const pos = nodes.map((_, i) => ({
    x: cx + r0 * Math.cos((2 * Math.PI * i) / n),
    y: cy + r0 * Math.sin((2 * Math.PI * i) / n),
    vx: 0,
    vy: 0,
  }));

  const idxById = new Map(nodes.map((nd, i) => [nd.id, i]));

  const edges = links
    .map((l) => ({
      si: idxById.get(typeof l.source === 'object' ? (l.source as GraphNode).id : String(l.source)),
      ti: idxById.get(typeof l.target === 'object' ? (l.target as GraphNode).id : String(l.target)),
    }))
    .filter((e): e is { si: number; ti: number } => e.si !== undefined && e.ti !== undefined);

  const TICKS = 300;
  for (let t = 0; t < TICKS; t++) {
    const alpha = Math.pow(1 - t / TICKS, 1.5);

    // Repulsion
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = pos[j].x - pos[i].x || 0.01;
        const dy = pos[j].y - pos[i].y || 0.01;
        const d2 = Math.max(dx * dx + dy * dy, 1);
        const d = Math.sqrt(d2);
        const f = (-150 * alpha) / d2;
        pos[i].vx += (f * dx) / d;  pos[i].vy += (f * dy) / d;
        pos[j].vx -= (f * dx) / d;  pos[j].vy -= (f * dy) / d;
      }
    }

    // Springs
    for (const { si, ti } of edges) {
      const dx = pos[ti].x - pos[si].x || 0.01;
      const dy = pos[ti].y - pos[si].y || 0.01;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = (d - 80) * 0.3 * alpha;
      pos[si].vx += (f * dx) / d;  pos[si].vy += (f * dy) / d;
      pos[ti].vx -= (f * dx) / d;  pos[ti].vy -= (f * dy) / d;
    }

    // Centering
    let sumX = 0, sumY = 0;
    for (const p of pos) { sumX += p.x; sumY += p.y; }
    const mcx = sumX / n, mcy = sumY / n;
    for (const p of pos) {
      p.vx += (cx - mcx) * 0.05;
      p.vy += (cy - mcy) * 0.05;
    }

    // Integrate
    for (const p of pos) {
      p.vx *= 0.55;
      p.vy *= 0.55;
      p.x  += p.vx;
      p.y  += p.vy;
    }
  }

  return new Map(nodes.map((nd, i) => [nd.id, { x: pos[i].x, y: pos[i].y }]));
}

export default function GraphViewer({ data, graphName }: GraphViewerProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const [dims, setDims]               = useState({ w: 800, h: 600 });
  const [tx, setTx]                   = useState(0);
  const [ty, setTy]                   = useState(0);
  const [scale, setScale]             = useState(1);
  const [positions, setPositions]     = useState<Map<string, Pos>>(new Map());
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<GraphLink | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [filterType, setFilterType]   = useState('');
  const [isDragging, setIsDragging]   = useState(false);
  const drag = useRef({ active: false, lastX: 0, lastY: 0 });

  // Type → color map derived from data
  const typeColorMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const nd of data.nodes) if (!m.has(nd.type)) m.set(nd.type, nd.color);
    return m;
  }, [data]);
  const nodeTypes = useMemo(() => Array.from(typeColorMap.keys()), [typeColorMap]);

  // Filtered data
  const filteredNodes = useMemo(
    () => (filterType ? data.nodes.filter((nd) => nd.type === filterType) : data.nodes),
    [data, filterType],
  );
  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map((nd) => nd.id)), [filteredNodes]);
  const filteredLinks = useMemo(
    () =>
      data.links.filter((l) => {
        const s = typeof l.source === 'object' ? (l.source as GraphNode).id : String(l.source);
        const t = typeof l.target === 'object' ? (l.target as GraphNode).id : String(l.target);
        return filteredNodeIds.has(s) && filteredNodeIds.has(t);
      }),
    [data.links, filteredNodeIds],
  );

  // Resize observer
  useEffect(() => {
    const obs = new ResizeObserver(([entry]) => {
      if (entry) setDims({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Recompute layout on data / filter / size change
  useEffect(() => {
    if (dims.w === 0) return;
    setPositions(layoutGraph(filteredNodes, filteredLinks, dims.w, dims.h));
    setTx(0); setTy(0); setScale(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, filterType, dims.w, dims.h]);

  // Reset on graph switch
  useEffect(() => {
    setSelectedNode(null);
    setSelectedLink(null);
    setFilterType('');
  }, [graphName]);

  const zoomIn  = useCallback(() => setScale((s) => Math.min(s * 1.4, 6)), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(s / 1.4, 0.15)), []);
  const fitView = useCallback(() => { setTx(0); setTy(0); setScale(1); }, []);
  const reset   = useCallback(() => {
    setSelectedNode(null); setSelectedLink(null); setFilterType('');
    setTx(0); setTy(0); setScale(1);
  }, []);

  // Pan handlers (only on SVG background)
  const onSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.target as Element).closest('[data-node],[data-edge]')) return;
    drag.current = { active: true, lastX: e.clientX, lastY: e.clientY };
    setIsDragging(true);
    e.preventDefault();
  };
  const onSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!drag.current.active) return;
    setTx((x) => x + e.clientX - drag.current.lastX);
    setTy((y) => y + e.clientY - drag.current.lastY);
    drag.current.lastX = e.clientX;
    drag.current.lastY = e.clientY;
  };
  const onSvgMouseUp = () => { drag.current.active = false; setIsDragging(false); };

  const nodeR = (nd: GraphNode) => Math.sqrt(nd.val) * 2.2;

  // Unique edge colors for arrow markers
  const edgeColors = useMemo(
    () => Array.from(new Set(filteredLinks.map((l) => l.color || '#3D444D'))),
    [filteredLinks],
  );

  return (
    <div className="flex flex-col h-full bg-[#0A0C10]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#21262D] bg-[#111318] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#E6EDF3]">Graph Explorer</span>
          <span className="text-[10px] text-[#8B949E] bg-[#21262D] px-2 py-0.5 rounded">
            {filteredNodes.length}N · {filteredLinks.length}E
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
              {nodeTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {([
            { icon: ZoomIn,    action: zoomIn,   title: 'Zoom in'  },
            { icon: ZoomOut,   action: zoomOut,  title: 'Zoom out' },
            { icon: Maximize2, action: fitView,  title: 'Fit view' },
            { icon: RefreshCw, action: reset,    title: 'Reset'    },
          ] as const).map(({ icon: Icon, action, title }) => (
            <button key={title} onClick={action} title={title}
              className="p-1.5 rounded text-[#8B949E] hover:text-[#FF6B35] hover:bg-[#FF6B35]/10 transition-colors">
              <Icon size={13} />
            </button>
          ))}
        </div>
      </div>

      {/* SVG canvas */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        <svg
          width={dims.w} height={dims.h}
          style={{ cursor: isDragging ? 'grabbing' : 'grab', display: 'block' }}
          onMouseDown={onSvgMouseDown}
          onMouseMove={onSvgMouseMove}
          onMouseUp={onSvgMouseUp}
          onMouseLeave={onSvgMouseUp}
        >
          <defs>
            {edgeColors.map((color) => (
              <marker
                key={color}
                id={`arr-${color.replace('#', '')}`}
                markerWidth="6" markerHeight="6"
                refX="5" refY="3"
                orient="auto"
              >
                <path d="M0,0 L0,6 L6,3 z" fill={color} />
              </marker>
            ))}
          </defs>

          <g transform={`translate(${tx},${ty}) scale(${scale})`}>
            {/* Edges */}
            {filteredLinks.map((link, i) => {
              const srcId = typeof link.source === 'object' ? (link.source as GraphNode).id : String(link.source);
              const tgtId = typeof link.target === 'object' ? (link.target as GraphNode).id : String(link.target);
              const sp = positions.get(srcId);
              const tp = positions.get(tgtId);
              if (!sp || !tp) return null;

              const srcNd = filteredNodes.find((nd) => nd.id === srcId);
              const tgtNd = filteredNodes.find((nd) => nd.id === tgtId);
              const sr = srcNd ? nodeR(srcNd) : 10;
              const tr = tgtNd ? nodeR(tgtNd) : 10;

              const dx = tp.x - sp.x, dy = tp.y - sp.y;
              const d = Math.sqrt(dx * dx + dy * dy) || 1;
              const x1 = sp.x + (dx / d) * sr;
              const y1 = sp.y + (dy / d) * sr;
              const x2 = tp.x - (dx / d) * (tr + 6);
              const y2 = tp.y - (dy / d) * (tr + 6);

              const color = link.color || '#3D444D';
              const lSrc = typeof selectedLink?.source === 'object'
                ? (selectedLink.source as GraphNode).id : selectedLink?.source;
              const lTgt = typeof selectedLink?.target === 'object'
                ? (selectedLink.target as GraphNode).id : selectedLink?.target;
              const isSelected = lSrc === srcId && lTgt === tgtId;

              return (
                <line
                  key={i}
                  data-edge="true"
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={color}
                  strokeWidth={isSelected ? 3 : 1.5}
                  strokeOpacity={isSelected ? 1 : 0.65}
                  markerEnd={`url(#arr-${color.replace('#', '')})`}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(null);
                    setSelectedLink((prev) => {
                      const ps = typeof prev?.source === 'object' ? (prev.source as GraphNode).id : prev?.source;
                      const pt = typeof prev?.target === 'object' ? (prev.target as GraphNode).id : prev?.target;
                      return ps === srcId && pt === tgtId ? null : link;
                    });
                  }}
                />
              );
            })}

            {/* Nodes */}
            {filteredNodes.map((nd) => {
              const p = positions.get(nd.id);
              if (!p) return null;
              const r = nodeR(nd);
              const color = nd.color || '#8B949E';
              const isSel = selectedNode?.id === nd.id;
              const isHov = hoveredNode === nd.id;
              const fontSize = Math.max(8, Math.min(11, r * 0.85));

              return (
                <g
                  key={nd.id}
                  data-node="true"
                  transform={`translate(${p.x},${p.y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLink(null);
                    setSelectedNode((prev) => (prev?.id === nd.id ? null : nd));
                  }}
                  onMouseEnter={() => setHoveredNode(nd.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {(isSel || isHov) && (
                    <circle r={r + 5} fill={color + '22'} stroke={color} strokeWidth={1.5} />
                  )}
                  <circle r={r} fill={color} stroke="#0A0C10" strokeWidth={1.2} />
                  {r > 8 && (
                    <text
                      textAnchor="middle" dominantBaseline="central"
                      fontSize={Math.max(7, r * 0.7)} fontWeight={700} fill="#fff"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {nd.label.slice(0, 2).toUpperCase()}
                    </text>
                  )}
                  <text
                    textAnchor="middle" y={r + fontSize + 3}
                    fontSize={fontSize} fontWeight={600} fill="#E6EDF3"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {nd.label.length > 14 ? nd.label.slice(0, 14) + '…' : nd.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Selected node panel */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 w-64 max-h-[70%] flex flex-col bg-[#111318]/95 backdrop-blur border border-[#FF6B35]/30 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 pt-4 pb-3 shrink-0">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: selectedNode.color }} />
              <span className="text-[#FF6B35] font-semibold text-sm truncate min-w-0">{selectedNode.label}</span>
              <span className="ml-auto shrink-0 text-[10px] text-[#8B949E] bg-[#21262D] px-1.5 py-0.5 rounded">
                {selectedNode.type}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-1 space-y-1.5 min-h-0">
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
              className="shrink-0 py-2.5 text-[10px] text-[#8B949E] hover:text-[#E6EDF3] border-t border-[#21262D] transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Selected edge panel */}
        {selectedLink && (() => {
          const srcId = typeof selectedLink.source === 'object'
            ? (selectedLink.source as GraphNode).id : String(selectedLink.source);
          const tgtId = typeof selectedLink.target === 'object'
            ? (selectedLink.target as GraphNode).id : String(selectedLink.target);
          const edgeColor = selectedLink.color || '#3D444D';
          return (
            <div
              className="absolute bottom-4 left-4 w-64 max-h-[70%] flex flex-col bg-[#111318]/95 backdrop-blur border rounded-xl shadow-2xl overflow-hidden"
              style={{ borderColor: edgeColor + '55' }}
            >
              <div className="flex items-center gap-2 px-4 pt-4 pb-3 shrink-0">
                <div className="w-6 h-0.5 rounded shrink-0" style={{ backgroundColor: edgeColor }} />
                <span className="font-semibold text-sm truncate min-w-0" style={{ color: edgeColor }}>
                  {selectedLink.type}
                </span>
                <button onClick={() => setSelectedLink(null)}
                  className="ml-auto shrink-0 text-[#8B949E] hover:text-[#E6EDF3] transition-colors">
                  <X size={12} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-1 space-y-1.5 min-h-0">
                <div className="flex gap-2 text-xs">
                  <span className="text-[#8B949E] shrink-0">From</span>
                  <code className="text-[#E6EDF3] font-mono break-all min-w-0">{srcId}</code>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="text-[#8B949E] shrink-0">To</span>
                  <code className="text-[#E6EDF3] font-mono break-all min-w-0">{tgtId}</code>
                </div>
                {Object.entries(selectedLink.attributes ?? {}).map(([k, v]) => (
                  <div key={k} className="flex gap-2 text-xs">
                    <span className="text-[#8B949E] shrink-0">{k}</span>
                    <span className="text-[#E6EDF3] font-mono break-all min-w-0 text-right flex-1">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Legend */}
        {nodeTypes.length > 0 && (
          <div className="absolute top-3 right-3 bg-[#111318]/90 backdrop-blur border border-[#21262D] rounded-lg p-3">
            <div className="text-[10px] text-[#8B949E] mb-2 font-semibold uppercase tracking-wider">Legend</div>
            <div className="space-y-1.5">
              {nodeTypes.map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: typeColorMap.get(type) || '#8B949E' }} />
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
