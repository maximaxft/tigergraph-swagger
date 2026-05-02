import { useState } from 'react';
import { Network, Braces, Copy, Check, Zap } from 'lucide-react';
import GraphViewer from './GraphViewer';
import { type ApiResponse } from './EndpointPanel';

interface ResponsePanelProps {
  response: ApiResponse | null;
}

type View = 'json' | 'graph';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="flex items-center gap-1 text-[10px] text-[#8B949E] hover:text-[#FF6B35] transition-colors"
    >
      {copied ? <Check size={11} className="text-[#2ECC71]" /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function JsonHighlight({ data }: { data: object }) {
  const json = JSON.stringify(data, null, 2);
  return (
    <pre className="text-[11px] font-mono leading-relaxed">
      {json.split('\n').map((line, i) => {
        const keyMatch = line.match(/^(\s*)"([^"]+)":/);
        const strVal = line.match(/:\s*"([^"]*)"(,?)$/);
        const numVal = line.match(/:\s*(-?\d+\.?\d*)(,?)$/);
        const boolVal = line.match(/:\s*(true|false)(,?)$/);
        const nullVal = line.match(/:\s*(null)(,?)$/);

        if (keyMatch) {
          const indent = keyMatch[1];
          const key = keyMatch[2];
          const rest = line.slice(keyMatch[0].length);
          return (
            <span key={i} className="block">
              <span className="text-[#3D444D]">{indent}</span>
              <span className="text-[#FF6B35]">"{key}"</span>
              <span className="text-[#8B949E]">:</span>
              {strVal  && <><span className="text-[#2ECC71]"> "{strVal[1]}"</span><span className="text-[#8B949E]">{strVal[2]}</span></>}
              {!strVal && numVal  && <><span className="text-[#2A7FFF]"> {numVal[1]}</span><span className="text-[#8B949E]">{numVal[2]}</span></>}
              {!strVal && !numVal && boolVal && <><span className="text-[#F39C12]"> {boolVal[1]}</span><span className="text-[#8B949E]">{boolVal[2]}</span></>}
              {!strVal && !numVal && !boolVal && nullVal && <><span className="text-[#8B949E]"> null</span><span className="text-[#8B949E]">{nullVal[2]}</span></>}
              {!strVal && !numVal && !boolVal && !nullVal && <span className="text-[#8B949E]">{rest}</span>}
            </span>
          );
        }
        return <span key={i} className="block text-[#8B949E]">{line}</span>;
      })}
    </pre>
  );
}

export default function ResponsePanel({ response }: ResponsePanelProps) {
  const [view, setView] = useState<View>('json');
  const hasGraph = response && (response.networkx.nodes.length > 0 || response.networkx.links.length > 0);
  const json = response ? JSON.stringify(response.response, null, 2) : '';

  return (
    <div className="flex flex-col h-full bg-[#0A0C10]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#21262D] bg-[#111318] shrink-0">
        <span className="text-[10px] text-[#8B949E] uppercase tracking-wider font-semibold">Response</span>
        {response && (
          <div className="flex items-center gap-2">
            {view === 'json' && <CopyButton text={json} />}
            <div className="flex items-center gap-0.5 bg-[#0A0C10] rounded-lg p-0.5 border border-[#21262D]">
              <button
                onClick={() => setView('json')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                  view === 'json'
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]'
                }`}
              >
                <Braces size={11} />
                JSON
              </button>
              <button
                onClick={() => setView('graph')}
                disabled={!hasGraph}
                title={!hasGraph ? 'No graph data in response' : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                  view === 'graph'
                    ? 'bg-[#FF6B35] text-white'
                    : !hasGraph
                    ? 'text-[#3D444D] cursor-not-allowed'
                    : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]'
                }`}
              >
                <Network size={11} />
                Graph
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Empty state */}
      {!response && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
          <div className="w-16 h-16 rounded-2xl bg-[#161B22] border border-[#21262D] flex items-center justify-center mb-5">
            <Zap size={20} className="text-[#3D444D]" />
          </div>
          <p className="text-[#8B949E] text-sm font-medium mb-1">No response yet</p>
          <p className="text-[#3D444D] text-xs max-w-[200px]">
            Select an endpoint and click <span className="text-[#FF6B35]">Try it out</span> to see the response here.
          </p>
        </div>
      )}

      {/* JSON view */}
      {response && view === 'json' && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="rounded-xl border border-[#21262D] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#161B22] border-b border-[#21262D]">
              <span className="text-[10px] text-[#2ECC71] bg-[#2ECC71]/10 border border-[#2ECC71]/20 px-2 py-0.5 rounded font-medium">
                200 OK
              </span>
              <span className="text-[10px] text-[#8B949E]">application/json</span>
            </div>
            <div className="bg-[#0A0C10] p-4 overflow-x-auto">
              <JsonHighlight data={response.response} />
            </div>
          </div>
        </div>
      )}

      {/* Graph view */}
      {response && view === 'graph' && hasGraph && (
        <div className="flex-1 overflow-hidden">
          <GraphViewer data={response.networkx} graphName="response" />
        </div>
      )}
    </div>
  );
}
