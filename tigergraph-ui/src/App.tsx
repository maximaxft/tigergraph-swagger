import { useState } from 'react';
import ApiKeyLogin from './components/ApiKeyLogin';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import EndpointPanel from './components/EndpointPanel';
import ResponsePanel from './components/ResponsePanel';
import { type Endpoint } from './data/endpoints';
import { type ApiResponse } from './components/EndpointPanel';

const STORAGE_KEY = 'tg_api_key';

export default function App() {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem(STORAGE_KEY) ?? '');
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

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

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 border-r border-[#21262D] overflow-hidden min-w-0">
          <Sidebar selectedEndpoint={selectedEndpoint} onSelect={handleSelectEndpoint} />
          <div className="flex-1 overflow-hidden bg-[#0A0C10] min-w-0">
            <EndpointPanel endpoint={selectedEndpoint} apiKey={apiKey} onTryIt={setApiResponse} />
          </div>
        </div>

        <div className="flex-1 overflow-hidden min-w-0">
          <ResponsePanel response={apiResponse} />
        </div>
      </div>
    </div>
  );
}
