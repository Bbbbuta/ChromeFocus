import React, { useState, useEffect } from 'react';
import { BlockData } from '../types';
import { summarizeActivity } from '../services/geminiService';
import { Wand2, Save, MonitorPlay } from 'lucide-react';
import { translations, Language } from '../translations';

// Declare chrome to avoid TypeScript errors in non-extension environments
declare const chrome: any;

interface CurrentBlockManagerProps {
  block: BlockData;
  onUpdateBlock: (id: number, data: Partial<BlockData>) => void;
  lang: Language;
}

const CurrentBlockManager: React.FC<CurrentBlockManagerProps> = ({ block, onUpdateBlock, lang }) => {
  const t = translations[lang];
  const [manualInput, setManualInput] = useState(block.activity);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedHistory, setDetectedHistory] = useState<string[]>([]);
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    setManualInput(block.activity);
  }, [block.activity]);

  const handleDetectActivity = async () => {
    setIsDetecting(true);

    if (typeof chrome !== 'undefined' && chrome.tabs) {
        try {
            // Fetch real tabs from the current window
            chrome.tabs.query({ currentWindow: true }, (tabs: any[]) => {
                const items = tabs
                    .filter((t: any) => t.url && t.title)
                    .map((t: any) => {
                        try {
                            const url = new URL(t.url);
                            // Combine Hostname and Title for better context
                            return `${url.hostname} - ${t.title.substring(0, 60)}`;
                        } catch {
                            return t.title;
                        }
                    })
                    .slice(0, 15); // Limit to top 15 to keep prompt size reasonable
                
                setDetectedHistory(items);
                setIsDetecting(false);
            });
        } catch (e) {
            console.error("Chrome API Error:", e);
            setDetectedHistory(["Error accessing chrome.tabs API"]);
            setIsDetecting(false);
        }
    } else {
        // Fallback for non-extension environments (e.g., localhost)
        setDetectedHistory([
            "Local Dev Environment (Chrome API not found)",
            "Please run as an unpacked Chrome Extension to detect real tabs."
        ]);
        setIsDetecting(false);
    }
  };

  const handleAiSummary = async () => {
    if (detectedHistory.length === 0 && !manualInput) {
        alert(lang === 'zh' ? "没有检测到历史记录或文本。" : "No history or text to summarize.");
        return;
    }
    
    setIsSummarizing(true);
    const sourceData = detectedHistory.length > 0 ? detectedHistory : [manualInput];
    const summary = await summarizeActivity(sourceData, lang);
    setManualInput(summary);
    onUpdateBlock(block.id, { activity: summary });
    setIsSummarizing(false);
  };

  const handleSave = () => {
    onUpdateBlock(block.id, { activity: manualInput });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <MonitorPlay className="w-5 h-5 text-indigo-600" />
          {t.activityMonitor}
        </h3>
        <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
          ID: {block.id + 1}/16
        </span>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-600">{t.whatWorkingOn}</label>
        <div className="flex gap-2">
           <textarea 
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px]"
            placeholder={t.placeholderActivity}
           />
        </div>
      </div>
      
      {detectedHistory.length > 0 && (
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
           <p className="text-xs text-slate-500 font-semibold mb-2 uppercase">{t.detectedTabs}</p>
           <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4 max-h-[100px] overflow-y-auto custom-scrollbar">
              {detectedHistory.map((h, i) => <li key={i}>{h}</li>)}
           </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mt-auto">
        <button
          onClick={handleDetectActivity}
          disabled={isDetecting}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
        >
            {isDetecting ? t.detecting : t.btnDetect}
        </button>

        <button
          onClick={handleAiSummary}
          disabled={isSummarizing}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
        >
          <Wand2 className={`w-4 h-4 ${isSummarizing ? 'animate-spin' : ''}`} />
          {isSummarizing ? t.thinking : t.btnSummarize}
        </button>
      </div>
      
      <button 
        onClick={handleSave}
        className="w-full py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
      >
        <Save className="w-4 h-4" /> {t.btnSave}
      </button>
    </div>
  );
};

export default CurrentBlockManager;