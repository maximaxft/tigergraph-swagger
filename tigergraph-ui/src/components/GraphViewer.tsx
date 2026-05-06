import { useEffect, useRef, useState, useMemo } from 'react';
import cytoscape, { type Core } from 'cytoscape';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw, Filter, X } from 'lucide-react';
import { type GraphData, type GraphNode } from '../data/graphData';

interface GraphViewerProps {
  data: GraphData;
  graphName: string;
}

type SelNode = { id: string; label: string; type: string; color: string; attributes: Record<string, unknown> };
type SelEdge = { source: string; target: string; type: string; color: string; attributes: Record<string, unknown> };

export default function GraphViewer({ data, graphName }: GraphViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef        = useRef<Core | null>(null);

  const [selectedNode, setSelectedNode] = useState<SelNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<SelEdge | null>(null);
  const [filterType,   setFilterType]   = useState('');

  // type → color derived from data
  const typeColorMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const n of data.nodes) if (!m.has(n.type)) m.set(n.type, n.color);
    return m;
  }, [data]);
  const nodeTypes = Array.from(typeColorMap.keys());

  // Filtered sets
  const visNodes = useMemo(
    () => (filterType ? data.nodes.filter((n) => n.type === filterType) : data.nodes),
    [data.nodes, filterType],
  );
  const visNodeIds = useMemo(() => new Set(visNodes.map((n) => n.id)), [visNodes]);
  const visLinks = useMemo(
    () =>
      data.links.filter((l) => {
        const s = String(typeof l.source === 'object' ? (l.source as GraphNode).id : l.source);
        const t = String(typeof l.target === 'object' ? (l.target as GraphNode).id : l.target);
        return visNodeIds.has(s) && visNodeIds.has(t);
      }),
    [data.links, visNodeIds],
  );

  // Build Cytoscape instance whenever visible data changes
  useEffect(() => {
    if (!containerRef.current) return;

    cyRef.current?.destroy();
    setSelectedNode(null);
    setSelectedEdge(null);

    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...visNodes.map((n) => ({
          data: {
            id: n.id,
            label: n.label,
            type:  n.type,
            color: n.color || '#8B949E',
            size:  Math.max(20, Math.sqrt(n.val || 10) * 8),
            attrs: n.attributes,
          },
        })),
        ...visLinks.map((l, i) => ({
          data: {
            id:     `e${i}`,
            source: String(typeof l.source === 'object' ? (l.source as GraphNode).id : l.source),
            target: String(typeof l.target === 'object' ? (l.target as GraphNode).id : l.target),
            type:   l.type,
            color:  l.color || '#3D444D',
            attrs:  l.attributes,
          },
        })),
      ],

      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            'width':  'data(size)',
            'height': 'data(size)',
            'label':  'data(label)',
            'color':  '#E6EDF3',
            'font-size': 10,
            'font-family': 'Inter, system-ui, sans-serif',
            'font-weight': '600',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 4,
            'text-outline-color': '#0A0C10',
            'text-outline-width': 2,
            'text-max-width': '80px',
            'text-wrap': 'ellipsis',
            'border-width': 2,
            'border-color': '#0A0C10',
          } as unknown as cytoscape.Css.Node,
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 3,
            'border-color': 'data(color)',
            'overlay-color': 'data(color)',
            'overlay-padding': 8,
            'overlay-opacity': 0.15,
          } as unknown as cytoscape.Css.Node,
        },
        {
          selector: 'node:active',
          style: { 'overlay-opacity': 0.08 } as unknown as cytoscape.Css.Node,
        },
        {
          selector: 'edge',
          style: {
            'line-color':           'data(color)',
            'target-arrow-color':   'data(color)',
            'target-arrow-shape':   'triangle',
            'arrow-scale':          0.8,
            'curve-style':          'bezier',
            'width':                1.5,
            'opacity':              0.65,
          } as unknown as cytoscape.Css.Edge,
        },
        {
          selector: 'edge:selected',
          style: { 'width': 3, 'opacity': 1 } as unknown as cytoscape.Css.Edge,
        },
        {
          selector: 'edge:active',
          style: { 'overlay-opacity': 0 } as unknown as cytoscape.Css.Edge,
        },
      ],

      layout: {
        name:             'cose',
        animate:          false,
        fit:              false,   // we fit manually after resize (container may be 0×0 at init)
        padding:          50,
        randomize:        true,
        componentSpacing: 120,
        nodeRepulsion:    () => 10000,
        nodeOverlap:      20,
        idealEdgeLength:  () => 80,
        edgeElasticity:   () => 0.45,
        gravity:          30,
        numIter:          1000,
      } as cytoscape.LayoutOptions,

      userZoomingEnabled:  true,
      userPanningEnabled:  true,
      boxSelectionEnabled: false,
      selectionType:       'single',
      minZoom:             0.05,
      maxZoom:             10,
      wheelSensitivity:    0.25,
    });

    // Click node → show panel
    cy.on('tap', 'node', (evt) => {
      const d = evt.target.data();
      setSelectedEdge(null);
      setSelectedNode({ id: d.id, label: d.label, type: d.type, color: d.color, attributes: d.attrs || {} });
    });

    // Click edge → show panel
    cy.on('tap', 'edge', (evt) => {
      const d = evt.target.data();
      setSelectedNode(null);
      setSelectedEdge({ source: d.source, target: d.target, type: d.type, color: d.color, attributes: d.attrs || {} });
    });

    // Click background → deselect
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
        setSelectedEdge(null);
      }
    });

    cyRef.current = cy;

    // The container may have 0×0 dimensions at the moment Cytoscape mounts
    // (e.g. when switching from JSON tab to Graph tab).
    // requestAnimationFrame defers until the browser has painted and the
    // container has its real size, then we force a resize + fit.
    const rafId = requestAnimationFrame(() => {
      if (cyRef.current !== cy) return;
      cy.resize();
      cy.fit(undefined, 50);
    });

    return () => {
      cancelAnimationFrame(rafId);
      cy.destroy();
      cyRef.current = null;
    };
  }, [visNodes, visLinks]);

  // Reset on graph switch
  useEffect(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setFilterType('');
  }, [graphName]);

  const zoomIn  = () => { const cy = cyRef.current; if (cy) cy.zoom(Math.min(cy.zoom() * 1.4, 10)); };
  const zoomOut = () => { const cy = cyRef.current; if (cy) cy.zoom(Math.max(cy.zoom() / 1.4, 0.05)); };
  const fitView = () => cyRef.current?.fit(undefined, 40);
  const reset   = () => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setFilterType('');
    cyRef.current?.fit(undefined, 40);
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0C10]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#21262D] bg-[#111318] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#E6EDF3]">Graph Explorer</span>
          <span className="text-[10px] text-[#8B949E] bg-[#21262D] px-2 py-0.5 rounded">
            {visNodes.length}N · {visLinks.length}E
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

      {/* Graph canvas */}
      <div className="flex-1 relative overflow-hidden">
        <div ref={containerRef} className="absolute inset-0" />

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
        {selectedEdge && (
          <div
            className="absolute bottom-4 left-4 w-64 max-h-[70%] flex flex-col bg-[#111318]/95 backdrop-blur border rounded-xl shadow-2xl overflow-hidden"
            style={{ borderColor: selectedEdge.color + '55' }}
          >
            <div className="flex items-center gap-2 px-4 pt-4 pb-3 shrink-0">
              <div className="w-6 h-0.5 rounded shrink-0" style={{ backgroundColor: selectedEdge.color }} />
              <span className="font-semibold text-sm truncate min-w-0" style={{ color: selectedEdge.color }}>
                {selectedEdge.type}
              </span>
              <button
                onClick={() => setSelectedEdge(null)}
                className="ml-auto shrink-0 text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
              >
                <X size={12} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-1 space-y-1.5 min-h-0">
              <div className="flex gap-2 text-xs">
                <span className="text-[#8B949E] shrink-0">From</span>
                <code className="text-[#E6EDF3] font-mono break-all min-w-0">{selectedEdge.source}</code>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-[#8B949E] shrink-0">To</span>
                <code className="text-[#E6EDF3] font-mono break-all min-w-0">{selectedEdge.target}</code>
              </div>
              {Object.entries(selectedEdge.attributes ?? {}).map(([k, v]) => (
                <div key={k} className="flex gap-2 text-xs">
                  <span className="text-[#8B949E] shrink-0">{k}</span>
                  <span className="text-[#E6EDF3] font-mono break-all min-w-0 text-right flex-1">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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
