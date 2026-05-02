import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { type GraphData } from '../data/graphData';

interface JsonViewProps {
  data: GraphData;
  graphName: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex items-center gap-1 text-[10px] text-[#8B949E] hover:text-[#FF6B35] transition-colors"
    >
      {copied ? <Check size={11} className="text-[#2ECC71]" /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function CollapsibleSection({
  label,
  count,
  color,
  children,
}: {
  label: string;
  count: number;
  color: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-lg border border-[#21262D] overflow-hidden mb-3">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-[#161B22] hover:bg-[#1C2128] transition-colors"
      >
        {open ? <ChevronDown size={13} className="text-[#8B949E]" /> : <ChevronRight size={13} className="text-[#8B949E]" />}
        <span className="text-xs font-semibold text-[#E6EDF3]">{label}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ color, background: color + '18', border: `1px solid ${color}30` }}>
          {count}
        </span>
      </button>
      {open && <div className="divide-y divide-[#21262D]">{children}</div>}
    </div>
  );
}

const TYPE_COLORS: Record<string, string> = {
  Person: '#FF6B35', Company: '#2A7FFF', Topic: '#2ECC71',
  Supplier: '#F39C12', Manufacturer: '#2A7FFF', Warehouse: '#9B59B6',
  Retailer: '#2ECC71', Account: '#E74C3C', Device: '#8B949E',
  IP: '#9B59B6', Transaction: '#E74C3C',
};

function JsonLine({ k, v }: { k: string; v: unknown }) {
  const color =
    typeof v === 'number' ? '#2A7FFF'
    : typeof v === 'boolean' ? '#F39C12'
    : '#2ECC71';
  return (
    <div className="flex items-center gap-2 text-[11px] font-mono">
      <span className="text-[#8B949E] shrink-0">{k}:</span>
      <span style={{ color }}>{JSON.stringify(v)}</span>
    </div>
  );
}

export default function JsonView({ data, graphName }: JsonViewProps) {
  const fullJson = JSON.stringify({ graph: graphName, nodes: data.nodes, links: data.links }, null, 2);

  return (
    <div className="flex flex-col h-full bg-[#0A0C10]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#21262D] bg-[#111318] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#E6EDF3]">JSON Explorer</span>
          <span className="text-[10px] text-[#8B949E] bg-[#21262D] px-2 py-0.5 rounded">
            {data.nodes.length} nodes · {data.links.length} edges
          </span>
        </div>
        <CopyButton text={fullJson} />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <CollapsibleSection label="Nodes" count={data.nodes.length} color="#FF6B35">
          {data.nodes.map((node) => {
            const typeColor = TYPE_COLORS[node.type] || '#8B949E';
            return (
              <div key={node.id} className="px-4 py-3 bg-[#0A0C10] hover:bg-[#111318] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: typeColor }} />
                  <code className="text-[#FF6B35] text-xs font-semibold">{node.id}</code>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded border font-medium"
                    style={{ color: typeColor, background: typeColor + '15', borderColor: typeColor + '30' }}
                  >
                    {node.type}
                  </span>
                  <span className="ml-auto text-[10px] text-[#8B949E] font-mono">val: {node.val}</span>
                </div>
                <div className="ml-4 space-y-1">
                  <JsonLine k="label" v={node.label} />
                  {Object.entries(node.attributes).map(([k, v]) => (
                    <JsonLine key={k} k={k} v={v} />
                  ))}
                </div>
              </div>
            );
          })}
        </CollapsibleSection>

        <CollapsibleSection label="Edges" count={data.links.length} color="#3D444D">
          {data.links.map((link, i) => {
            const src = typeof link.source === 'object' ? (link.source as { id: string }).id : link.source;
            const tgt = typeof link.target === 'object' ? (link.target as { id: string }).id : link.target;
            return (
              <div key={i} className="px-4 py-3 bg-[#0A0C10] hover:bg-[#111318] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <code className="text-[#8B949E] text-[11px] font-mono">{src}</code>
                  <span className="text-[#3D444D]">→</span>
                  <code className="text-[#8B949E] text-[11px] font-mono">{tgt}</code>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded border font-medium ml-auto"
                    style={{ color: link.color, background: link.color + '15', borderColor: link.color + '30' }}
                  >
                    {link.type}
                  </span>
                </div>
                {Object.keys(link.attributes).length > 0 && (
                  <div className="ml-4 space-y-1">
                    {Object.entries(link.attributes).map(([k, v]) => (
                      <JsonLine key={k} k={k} v={v} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CollapsibleSection>

        <div className="rounded-lg border border-[#21262D] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#161B22]">
            <span className="text-xs font-semibold text-[#E6EDF3]">Raw JSON</span>
            <CopyButton text={fullJson} />
          </div>
          <div className="bg-[#0A0C10] p-4 overflow-x-auto max-h-72">
            <pre className="text-[10px] font-mono text-[#8B949E] leading-relaxed whitespace-pre">{fullJson}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
