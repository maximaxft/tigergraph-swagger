import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import EndpointPanel from './components/EndpointPanel';
import ResponsePanel from './components/ResponsePanel';
import { type Endpoint } from './data/endpoints';
import { type ApiResponse } from './components/EndpointPanel';

export default function App() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  const handleSelectEndpoint = (endpoint: Endpoint) => {
    setSelectedEndpoint(endpoint);
    setApiResponse(null);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A0C10] text-[#E6EDF3] overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: endpoint list + docs */}
        <div className="flex flex-1 border-r border-[#21262D] overflow-hidden min-w-0">
          <Sidebar selectedEndpoint={selectedEndpoint} onSelect={handleSelectEndpoint} />
          <div className="flex-1 overflow-hidden bg-[#0A0C10] min-w-0">
            <EndpointPanel endpoint={selectedEndpoint} onTryIt={setApiResponse} />
          </div>
        </div>

        {/* Right: response (JSON or graph) */}
        <div className="flex-1 overflow-hidden min-w-0">
          <ResponsePanel response={apiResponse} />
        </div>
      </div>
    </div>
  );
}
