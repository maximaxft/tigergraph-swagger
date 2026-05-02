import { useState } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { endpoints, tags, type Endpoint } from '../data/endpoints';

interface SidebarProps {
  selectedEndpoint: Endpoint | null;
  onSelect: (endpoint: Endpoint) => void;
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-[#2A7FFF] bg-[#2A7FFF]/10 border-[#2A7FFF]/20',
  POST: 'text-[#2ECC71] bg-[#2ECC71]/10 border-[#2ECC71]/20',
  PUT: 'text-[#F39C12] bg-[#F39C12]/10 border-[#F39C12]/20',
  DELETE: 'text-[#E74C3C] bg-[#E74C3C]/10 border-[#E74C3C]/20',
};

export default function Sidebar({ selectedEndpoint, onSelect }: SidebarProps) {
  const [search, setSearch] = useState('');
  const [openTags, setOpenTags] = useState<Set<string>>(new Set(tags.map((t) => t.name)));

  const toggleTag = (tag: string) => {
    setOpenTags((prev) => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  };

  const filtered = endpoints.filter(
    (e) =>
      e.path.toLowerCase().includes(search.toLowerCase()) ||
      e.summary.toLowerCase().includes(search.toLowerCase()) ||
      e.method.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-72 shrink-0 flex flex-col border-r border-[#21262D] bg-[#111318] overflow-hidden">
      <div className="p-3 border-b border-[#21262D]">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B949E]" />
          <input
            type="text"
            placeholder="Filter endpoints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0A0C10] border border-[#21262D] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-[#FF6B35]/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {tags.map((tag) => {
          const tagEndpoints = filtered.filter((e) => e.tag === tag.name);
          if (tagEndpoints.length === 0) return null;
          const isOpen = openTags.has(tag.name);

          return (
            <div key={tag.name} className="mb-1">
              <button
                onClick={() => toggleTag(tag.name)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#8B949E] uppercase tracking-widest hover:text-[#E6EDF3] transition-colors"
              >
                {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                {tag.name}
                <span className="ml-auto text-[10px] normal-case tracking-normal bg-[#21262D] text-[#8B949E] rounded px-1.5 py-0.5">
                  {tagEndpoints.length}
                </span>
              </button>

              {isOpen && (
                <div className="ml-1">
                  {tagEndpoints.map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => onSelect(ep)}
                      className={`w-full flex items-start gap-2 px-3 py-2 text-left rounded-md mx-1 transition-all duration-100 group ${
                        selectedEndpoint?.id === ep.id
                          ? 'bg-[#FF6B35]/10 border border-[#FF6B35]/20'
                          : 'hover:bg-[#161B22]'
                      }`}
                    >
                      <span
                        className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded border mt-0.5 ${METHOD_COLORS[ep.method]}`}
                      >
                        {ep.method}
                      </span>
                      <div className="min-w-0">
                        <div className={`text-xs truncate ${selectedEndpoint?.id === ep.id ? 'text-[#FF6B35]' : 'text-[#E6EDF3] group-hover:text-[#E6EDF3]'}`}>
                          {ep.summary}
                        </div>
                        <div className="text-[10px] text-[#8B949E] truncate font-mono mt-0.5">
                          {ep.path.length > 36 ? ep.path.slice(0, 36) + '…' : ep.path}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-[#21262D] text-[10px] text-[#8B949E]">
        {endpoints.length} endpoints · TigerGraph REST++ v3.x
      </div>
    </aside>
  );
}
