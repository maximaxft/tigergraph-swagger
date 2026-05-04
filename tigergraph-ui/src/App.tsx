import { useState, useRef, useCallback } from 'react';
import ApiKeyLogin from './components/ApiKeyLogin';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import EndpointPanel from './components/EndpointPanel';
import ResponsePanel from './components/ResponsePanel';
import { type Endpoint } from './data/endpoints';
import { type ApiResponse } from './components/EndpointPanel';

const STORAGE_KEY = 'tg_api_key';
const MIN_PCT = 20;
const MAX_PCT = 80;

export default function App() {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem(STORAGE_KEY) ?? '');
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [splitPct, setSplitPct] = useState(50);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const onMouseDown = useCallback(() => {
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPct(Math.min(MAX_PCT, Math.max(MIN_PCT, pct)));
    };

    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, []);

  const handleConnect = (key: string) => {
    localStorage.setItem(STORAGE_KEY, key);
    setApiKey(key);
  };

  const handleDisconnect = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey('');
    setSelectedEndpoint(null);
    setApiResponse(null);
  };

  const handleSelectEndpoint = (endpoint: Endpoint) => {
    setSelectedEndpoint(endpoint);
    setApiResponse(null);
  };

  if (!apiKey) {
    return <ApiKeyLogin onConnect={handleConnect} />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#0A0C10] text-[#E6EDF3] overflow-hidden">
      <Header apiKey={apiKey} onDisconnect={handleDisconnect} />

      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        <div className="flex overflow-hidden min-w-0" style={{ width: `${splitPct}%` }}>
          <Sidebar selectedEndpoint={selectedEndpoint} onSelect={handleSelectEndpoint} />
          <div className="flex-1 overflow-hidden bg-[#0A0C10] min-w-0">
            <EndpointPanel endpoint={selectedEndpoint} apiKey={apiKey} onTryIt={setApiResponse} />
          </div>
        </div>

        {/* Drag handle */}
        <div
          onMouseDown={onMouseDown}
          className="w-1 shrink-0 bg-[#21262D] hover:bg-[#FF6B35] transition-colors cursor-col-resize"
        />

        <div className="overflow-hidden min-w-0" style={{ width: `${100 - splitPct}%` }}>
          <ResponsePanel response={apiResponse} />
        </div>
      </div>
    </div>
  );
}
