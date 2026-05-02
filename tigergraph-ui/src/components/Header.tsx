import { Database, Activity, GitBranch } from 'lucide-react';

export default function Header() {
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
        <div className="text-[#3D444D] text-xs font-mono">localhost:9000</div>
        <a href="#" className="text-[#8B949E] hover:text-[#E6EDF3] transition-colors">
          <GitBranch size={18} />
        </a>
      </div>
    </header>
  );
}
