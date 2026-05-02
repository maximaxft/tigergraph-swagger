import { Database, Activity, KeyRound, LogOut } from 'lucide-react';

interface HeaderProps {
  apiKey: string;
  onDisconnect: () => void;
}

export default function Header({ apiKey, onDisconnect }: HeaderProps) {
  const maskedKey = apiKey.length > 8
    ? apiKey.slice(0, 4) + '••••' + apiKey.slice(-4)
    : '••••••••';

  return (
    <header className="h-14 flex items-center px-6 border-b border-[#21262D] bg-[#111318] shrink-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#FF6B35] flex items-center justify-center">
          <Database size={16} className="text-white" />
        </div>
        <div>
          <span className="text-[#E6EDF3] font-semibold text-sm tracking-wide">TigerGraph</span>
          <span className="text-[#FF6B35] text-xs font-medium ml-2 px-1.5 py-0.5 rounded bg-[#FF6B35]/10 border border-[#FF6B35]/20">
            API Explorer
          </span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[#2ECC71] text-xs">
          <Activity size={12} className="animate-pulse" />
          <span>Connected</span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#161B22] border border-[#21262D] rounded-lg px-2.5 py-1.5">
          <KeyRound size={11} className="text-[#FF6B35]" />
          <code className="text-[#8B949E] text-[11px] font-mono">{maskedKey}</code>
        </div>

        <button
          onClick={onDisconnect}
          title="Disconnect"
          className="flex items-center gap-1.5 text-[#8B949E] hover:text-[#E74C3C] text-xs transition-colors"
        >
          <LogOut size={14} />
          <span>Disconnect</span>
        </button>
      </div>
    </header>
  );
}
