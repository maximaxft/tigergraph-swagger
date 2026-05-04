import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

function Primitive({ value }: { value: string | number | boolean | null }) {
  if (value === null) return <span className="text-[#8B949E]">null</span>;
  if (typeof value === 'boolean') return <span className="text-[#F39C12]">{String(value)}</span>;
  if (typeof value === 'number') return <span className="text-[#2A7FFF]">{value}</span>;
  const str = String(value);
  const display = str.length > 120 ? str.slice(0, 120) + '…' : str;
  return <span className="text-[#2ECC71]">"{display}"</span>;
}

interface NodeProps {
  value: JsonValue;
  depth: number;
}

function Node({ value, depth }: NodeProps) {
  const [open, setOpen] = useState(depth < 2);

  if (value === null || typeof value !== 'object') {
    return <Primitive value={value as string | number | boolean | null} />;
  }

  const isArr = Array.isArray(value);
  const entries: [string, JsonValue][] = isArr
    ? (value as JsonValue[]).map((v, i) => [String(i), v])
    : Object.entries(value as Record<string, JsonValue>);

  const open_br  = isArr ? '[' : '{';
  const close_br = isArr ? ']' : '}';

  if (entries.length === 0) {
    return <span className="text-[#8B949E]">{open_br}{close_br}</span>;
  }

  const summary = isArr
    ? `${entries.length} item${entries.length !== 1 ? 's' : ''}`
    : `${entries.length} key${entries.length !== 1 ? 's' : ''}`;

  return (
    <span>
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center text-[#8B949E] hover:text-[#FF6B35] transition-colors align-middle"
      >
        {open
          ? <ChevronDown  size={11} className="mr-0.5" />
          : <ChevronRight size={11} className="mr-0.5" />}
      </button>

      <span className="text-[#8B949E]">{open_br}</span>

      {!open && (
        <>
          <button
            onClick={() => setOpen(true)}
            className="text-[10px] text-[#8B949E] hover:text-[#E6EDF3] mx-1 italic transition-colors"
          >
            {summary}
          </button>
          <span className="text-[#8B949E]">{close_br}</span>
        </>
      )}

      {open && (
        <span>
          {entries.map(([key, val], i) => (
            <div key={key} style={{ paddingLeft: 16 }}>
              {!isArr && (
                <button
                  onClick={() => {
                    if (val !== null && typeof val === 'object') {
                      // toggle is handled by the child Node; nothing here
                    }
                  }}
                  className="text-[#FF6B35] hover:underline"
                >
                  "{key}"
                </button>
              )}
              {!isArr && <span className="text-[#8B949E]">: </span>}
              <Node value={val} depth={depth + 1} />
              {i < entries.length - 1 && <span className="text-[#8B949E]">,</span>}
            </div>
          ))}
          <div><span className="text-[#8B949E]">{close_br}</span></div>
        </span>
      )}
    </span>
  );
}

export default function JsonTree({ data }: { data: object }) {
  return (
    <pre className="text-[11px] font-mono leading-relaxed select-text">
      <Node value={data as JsonValue} depth={0} />
    </pre>
  );
}
