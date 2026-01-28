import React from 'react';
import { BlockData } from '../types';
import { Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { translations, Language } from '../translations';

interface BlockTimelineProps {
  blocks: BlockData[];
  onSelectBlock: (id: number) => void;
  currentBlockId: number;
  lang: Language;
}

const BlockTimeline: React.FC<BlockTimelineProps> = ({ blocks, onSelectBlock, currentBlockId, lang }) => {
  const t = translations[lang];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 h-full overflow-y-auto">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-indigo-600" />
        {t.dailyBlocks}
      </h3>
      <div className="space-y-3">
        {blocks.map((block) => {
          let statusColor = "text-slate-400 border-slate-200 bg-slate-50";
          let icon = <Circle className="w-4 h-4" />;

          if (block.id === currentBlockId) {
            statusColor = "text-indigo-600 border-indigo-200 bg-indigo-50 ring-2 ring-indigo-100";
            icon = <Clock className="w-4 h-4 animate-pulse" />;
          } else if (block.status === 'completed') {
            statusColor = "text-emerald-600 border-emerald-200 bg-emerald-50";
            icon = <CheckCircle2 className="w-4 h-4" />;
          } else if (block.status === 'missed') {
            statusColor = "text-amber-500 border-amber-200 bg-amber-50";
            icon = <AlertCircle className="w-4 h-4" />;
          }

          return (
            <div
              key={block.id}
              onClick={() => onSelectBlock(block.id)}
              className={`
                relative flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md
                ${statusColor}
              `}
            >
              <div className="shrink-0">{icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                    {block.startTime} - {block.endTime}
                  </span>
                  {block.focusScore !== undefined && (
                    <span className="text-xs font-bold bg-white/50 px-1.5 py-0.5 rounded">
                      {block.focusScore}% {t.focusScore}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium truncate">
                  {block.activity || (block.id === currentBlockId ? t.currentSession : t.noActivity)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlockTimeline;
