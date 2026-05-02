import { useState } from 'react';
import { Database, KeyRound, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface ApiKeyLoginProps {
  onConnect: (key: string) => void;
}

export default function ApiKeyLogin({ onConnect }: ApiKeyLoginProps) {
  const [key, setKey] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!key.trim()) { setError('Please enter an API key.'); return; }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/health`, { headers: { 'X-API-Key': key.trim() } });
      if (res.status === 401 || res.status === 403) {
        setError('Invalid API key. Access denied.');
        return;
      }
      onConnect(key.trim());
    } catch {
      // If /health doesn't exist or network issues, still let the user in —
      // the actual endpoint calls will surface auth errors themselves.
      onConnect(key.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-6">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#FF6B35 1px, transparent 1px), linear-gradient(90deg, #FF6B35 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      {/* Glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF6B35]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-[#FF6B35] flex items-center justify-center mb-4 shadow-lg shadow-[#FF6B35]/30">
            <Database size={26} className="text-white" />
          </div>
          <h1 className="text-[#E6EDF3] text-2xl font-bold tracking-tight">TigerGraph</h1>
          <p className="text-[#8B949E] text-sm mt-1">API Explorer</p>
        </div>

        {/* Card */}
        <div className="bg-[#111318] border border-[#21262D] rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <KeyRound size={16} className="text-[#FF6B35]" />
            <h2 className="text-[#E6EDF3] text-base font-semibold">Connect with API Key</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-[#8B949E] uppercase tracking-wider mb-1.5">
                API Key
              </label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={key}
                  onChange={(e) => { setKey(e.target.value); setError(null); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                  placeholder="Enter your API key…"
                  autoFocus
                  className="w-full bg-[#0A0C10] border border-[#21262D] focus:border-[#FF6B35]/60 rounded-xl px-4 py-3 pr-10 text-sm text-[#E6EDF3] placeholder-[#3D444D] outline-none transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#E74C3C]/10 border border-[#E74C3C]/20">
                <AlertCircle size={13} className="text-[#E74C3C] shrink-0" />
                <span className="text-xs text-[#E74C3C]">{error}</span>
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={loading || !key.trim()}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                loading || !key.trim()
                  ? 'bg-[#FF6B35]/30 text-[#FF6B35] cursor-not-allowed'
                  : 'bg-[#FF6B35] hover:bg-[#FF8C5A] text-white shadow-lg shadow-[#FF6B35]/25 hover:shadow-[#FF6B35]/35'
              }`}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Connect <ArrowRight size={15} /></>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-[#3D444D] mt-6">
          Your key is stored locally and sent as{' '}
          <code className="text-[#8B949E]">X-API-Key</code> on every request.
        </p>
      </div>
    </div>
  );
}
