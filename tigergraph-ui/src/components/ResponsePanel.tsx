import { useState } from 'react';
import { Network, Braces, Copy, Check, Zap, AlertCircle } from 'lucide-react';
import GraphViewer from './GraphViewer';
import JsonTree from './JsonTree';
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

function StatusBadge({ status }: { status: number }) {
  const ok = status >= 200 && status < 300;
  const redirect = status >= 300 && status < 400;
  const color = status === 0
    ? 'text-[#8B949E] bg-[#8B949E]/10 border-[#8B949E]/20'
    : ok
    ? 'text-[#2ECC71] bg-[#2ECC71]/10 border-[#2ECC71]/20'
    : redirect
    ? 'text-[#F39C12] bg-[#F39C12]/10 border-[#F39C12]/20'
    : 'text-[#E74C3C] bg-[#E74C3C]/10 border-[#E74C3C]/20';
  const label = status === 0 ? 'Network Error' : `${status}`;
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded border font-medium font-mono ${color}`}>
      {label}
    </span>
  );
}


export default function ResponsePanel({ response }: ResponsePanelProps) {
  const [view, setView] = useState<View>('json');
  const hasGraph = response && (response.networkx.nodes.length > 0 || response.networkx.links.length > 0);
  const json = response ? JSON.stringify(response.response, null, 2) : '';
  const isError = response && (response.error || response.status === 0 || response.status >= 400);

  return (
    <div className="flex flex-col h-full bg-[#0A0C10]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#21262D] bg-[#111318] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#8B949E] uppercase tracking-wider font-semibold">Response</span>
          {response && <StatusBadge status={response.status} />}
        </div>
        {response && !isError && (
          <div className="flex items-center gap-2">
            {view === 'json' && <CopyButton text={json} />}
            <div className="flex items-center gap-0.5 bg-[#0A0C10] rounded-lg p-0.5 border border-[#21262D]">
              <button
                onClick={() => setView('json')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                  view === 'json' ? 'bg-[#FF6B35] text-white' : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]'
                }`}
              >
                <Braces size={11} />
                JSON
              </button>
              <button
                onClick={() => setView('graph')}
                disabled={!hasGraph}
                title={!hasGraph ? 'No networkx data in response' : undefined}
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

      {/* Error state */}
      {response && isError && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="rounded-xl border border-[#E74C3C]/20 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#E74C3C]/8 border-b border-[#E74C3C]/20">
              <AlertCircle size={14} className="text-[#E74C3C]" />
              <span className="text-xs font-semibold text-[#E74C3C]">Request failed</span>
              <StatusBadge status={response.status} />
            </div>
            <div className="bg-[#0A0C10] p-4">
              <p className="text-[#E74C3C] text-xs font-mono break-all">{response.error}</p>
              {Object.keys(response.response).length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#21262D]">
                  <p className="text-[10px] text-[#8B949E] mb-2 uppercase tracking-wider">Response body</p>
                  <JsonTree data={response.response} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* JSON view */}
      {response && !isError && view === 'json' && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="rounded-xl border border-[#21262D] overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-2 bg-[#161B22] border-b border-[#21262D]">
              <StatusBadge status={response.status} />
              <span className="text-[10px] text-[#8B949E]">application/json</span>
              <div className="ml-auto">
                <CopyButton text={json} />
              </div>
            </div>
            <div className="bg-[#0A0C10] p-4 overflow-x-auto">
              <JsonTree data={response.response} />
            </div>
          </div>
        </div>
      )}

      {/* Graph view */}
      {response && !isError && view === 'graph' && hasGraph && (
        <div className="flex-1 overflow-hidden">
          <GraphViewer data={response.networkx} graphName="response" />
        </div>
      )}
    </div>
  );
}
