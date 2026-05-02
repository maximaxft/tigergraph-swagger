import { useState, useEffect } from 'react';
import { Copy, Play, ChevronDown, ChevronUp, Lock, Send, X } from 'lucide-react';
import { type Endpoint } from '../data/endpoints';
import { type GraphData } from '../data/graphData';

export interface ApiResponse {
  response: object;
  networkx: GraphData;
}

interface EndpointPanelProps {
  endpoint: Endpoint | null;
  onTryIt: (result: ApiResponse) => void;
}

const METHOD_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  GET: { bg: 'bg-[#2A7FFF]/10', text: 'text-[#2A7FFF]', border: 'border-[#2A7FFF]/30' },
  POST: { bg: 'bg-[#2ECC71]/10', text: 'text-[#2ECC71]', border: 'border-[#2ECC71]/30' },
  PUT: { bg: 'bg-[#F39C12]/10', text: 'text-[#F39C12]', border: 'border-[#F39C12]/30' },
  DELETE: { bg: 'bg-[#E74C3C]/10', text: 'text-[#E74C3C]', border: 'border-[#E74C3C]/30' },
};

const IN_BADGE: Record<string, string> = {
  path: 'bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20',
  query: 'bg-[#2A7FFF]/10 text-[#2A7FFF] border-[#2A7FFF]/20',
  body: 'bg-[#9B59B6]/10 text-[#9B59B6] border-[#9B59B6]/20',
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="flex items-center gap-1 text-[10px] text-[#8B949E] hover:text-[#FF6B35] transition-colors"
    >
      <Copy size={11} />
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

export default function EndpointPanel({ endpoint, onTryIt }: EndpointPanelProps) {
  const [showParams, setShowParams] = useState(true);
  const [tryMode, setTryMode] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});

  useEffect(() => {
    setTryMode(false);
    setIsSending(false);
    if (endpoint) {
      const defaults: Record<string, string> = {};
      for (const p of endpoint.parameters) {
        defaults[p.name] = p.example ?? '';
      }
      setParamValues(defaults);
    }
  }, [endpoint?.id]);

  if (!endpoint) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-12">
        <div className="w-20 h-20 rounded-2xl bg-[#161B22] border border-[#21262D] flex items-center justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/20 flex items-center justify-center">
            <Play size={18} className="text-[#FF6B35] ml-0.5" />
          </div>
        </div>
        <h2 className="text-[#E6EDF3] text-lg font-semibold mb-2">Select an endpoint</h2>
        <p className="text-[#8B949E] text-sm max-w-xs">
          Choose an endpoint from the sidebar to view its documentation and parameters.
        </p>
      </div>
    );
  }

  const style = METHOD_STYLES[endpoint.method];
  const curlCmd = `curl -X ${endpoint.method} \\\n  "http://localhost:9000${endpoint.path}" \\\n  -H "Authorization: Bearer <token>" \\\n  -H "Content-Type: application/json"`;

  const handleSend = async () => {
    setIsSending(true);
    await new Promise((r) => setTimeout(r, 700));
    setIsSending(false);
    setTryMode(false);
    onTryIt({ response: endpoint.responseExample, networkx: endpoint.networkxExample });
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="p-5 border-b border-[#21262D] bg-[#111318]">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2.5 py-1 rounded border ${style.bg} ${style.text} ${style.border}`}>
              {endpoint.method}
            </span>
            <code className="text-[#E6EDF3] font-mono text-xs bg-[#161B22] px-2.5 py-1 rounded border border-[#21262D] break-all">
              {endpoint.path}
            </code>
            <span className="text-[9px] text-[#8B949E] bg-[#21262D] px-2 py-0.5 rounded uppercase tracking-wider">
              {endpoint.tag}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#8B949E] shrink-0">
            <Lock size={10} />
            <span>Bearer</span>
          </div>
        </div>
        <h1 className="text-[#E6EDF3] text-base font-semibold mb-1">{endpoint.summary}</h1>
        <p className="text-[#8B949E] text-xs leading-relaxed">{endpoint.description}</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Parameters */}
        {endpoint.parameters.length > 0 && (
          <div className="rounded-xl border border-[#21262D] overflow-hidden">
            <button
              onClick={() => setShowParams((p) => !p)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-[#161B22] hover:bg-[#1C2128] transition-colors"
            >
              <span className="text-xs font-semibold text-[#E6EDF3]">Parameters</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-[#21262D] text-[#8B949E] px-1.5 py-0.5 rounded">{endpoint.parameters.length}</span>
                {showParams ? <ChevronUp size={13} className="text-[#8B949E]" /> : <ChevronDown size={13} className="text-[#8B949E]" />}
              </div>
            </button>
            {showParams && (
              <div className="divide-y divide-[#21262D]">
                {endpoint.parameters.map((param) => (
                  <div key={param.name} className="px-4 py-3 bg-[#0A0C10]">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-[#FF6B35] text-xs font-mono font-semibold">{param.name}</code>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${IN_BADGE[param.in]}`}>{param.in}</span>
                      <span className="text-[9px] text-[#8B949E] bg-[#21262D] px-1.5 py-0.5 rounded font-mono">{param.type}</span>
                      {param.required && (
                        <span className="text-[9px] text-[#E74C3C] bg-[#E74C3C]/10 border border-[#E74C3C]/20 px-1.5 py-0.5 rounded">
                          required
                        </span>
                      )}
                    </div>
                    <p className="text-[#8B949E] text-[11px] mb-2">{param.description}</p>
                    {tryMode && (
                      <input
                        value={paramValues[param.name] ?? ''}
                        onChange={(e) => setParamValues((prev) => ({ ...prev, [param.name]: e.target.value }))}
                        placeholder={param.example ?? `Enter ${param.name}…`}
                        className="w-full bg-[#111318] border border-[#21262D] focus:border-[#FF6B35]/50 rounded-md px-3 py-1.5 text-xs text-[#E6EDF3] placeholder-[#3D444D] outline-none transition-colors font-mono"
                      />
                    )}
                    {!tryMode && param.example && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#8B949E]">Example:</span>
                        <code className="text-[10px] text-[#2ECC71] font-mono bg-[#2ECC71]/5 px-2 py-0.5 rounded border border-[#2ECC71]/10">
                          {param.example}
                        </code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* cURL */}
        <div className="rounded-xl border border-[#21262D] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#161B22]">
            <span className="text-xs font-semibold text-[#E6EDF3]">cURL</span>
            <CopyButton text={curlCmd} />
          </div>
          <div className="bg-[#0A0C10] p-4 overflow-x-auto">
            <pre className="text-[#E6EDF3] font-mono text-[11px] leading-relaxed whitespace-pre">{curlCmd}</pre>
          </div>
        </div>

        {/* Try it out */}
        {!tryMode ? (
          <button
            onClick={() => setTryMode(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm bg-[#FF6B35] hover:bg-[#FF8C5A] text-white transition-all shadow-lg shadow-[#FF6B35]/20 hover:shadow-[#FF6B35]/30"
          >
            <Play size={14} />
            Try it out
          </button>
        ) : (
          <div className="rounded-xl border border-[#FF6B35]/30 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#FF6B35]/8">
              <span className="text-xs font-semibold text-[#FF6B35]">Execute request</span>
              <button
                onClick={() => setTryMode(false)}
                className="text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-4 bg-[#0A0C10] space-y-3">
              <div>
                <div className="text-[10px] text-[#8B949E] mb-1 uppercase tracking-wider">Base URL</div>
                <input
                  readOnly
                  value="http://localhost:9000"
                  className="w-full bg-[#111318] border border-[#21262D] rounded-md px-3 py-1.5 text-xs text-[#8B949E] font-mono outline-none"
                />
              </div>
              <div>
                <div className="text-[10px] text-[#8B949E] mb-1 uppercase tracking-wider">Authorization</div>
                <input
                  placeholder="Bearer <token>"
                  className="w-full bg-[#111318] border border-[#21262D] focus:border-[#FF6B35]/50 rounded-md px-3 py-1.5 text-xs text-[#E6EDF3] placeholder-[#3D444D] font-mono outline-none transition-colors"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={isSending}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  isSending
                    ? 'bg-[#FF6B35]/30 text-[#FF6B35] cursor-not-allowed'
                    : 'bg-[#FF6B35] hover:bg-[#FF8C5A] text-white shadow-md shadow-[#FF6B35]/20'
                }`}
              >
                <Send size={13} className={isSending ? 'animate-pulse' : ''} />
                {isSending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
