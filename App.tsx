import React, { useState, useEffect } from 'react';
import { BlockData, GardenItem, FocusEntityType } from './types';
import BlockTimeline from './components/BlockTimeline';
import FocusGarden from './components/FocusGarden';
import CurrentBlockManager from './components/CurrentBlockManager';
import ToDoList from './components/ToDoList';
import { Timer, Settings, Sprout, CheckSquare, Languages } from 'lucide-react';
import { translations, Language } from './translations';

const BLOCK_DURATION_MINUTES = 90;
const SECONDS_IN_BLOCK = BLOCK_DURATION_MINUTES * 60;

// Helper to generate default blocks starting at 06:00
const generateBlocks = (): BlockData[] => {
  const blocks: BlockData[] = [];
  let currentHour = 6; // Start day at 6 AM
  let currentMinute = 0;

  for (let i = 0; i < 16; i++) {
    const startStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    let endMin = currentMinute + 30;
    let endHour = currentHour + 1;
    if (currentMinute === 30) {
      endMin = 0;
      endHour = currentHour + 2;
    }
    if (endHour >= 24) endHour -= 24;
    const endStr = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    blocks.push({
      id: i,
      startTime: startStr,
      endTime: endStr,
      activity: '',
      isCurrent: false,
      status: 'pending',
    });

    currentHour = endHour;
    currentMinute = endMin;
  }
  return blocks;
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  const [blocks, setBlocks] = useState<BlockData[]>(generateBlocks());
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(SECONDS_IN_BLOCK);
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [rightSidebarTab, setRightSidebarTab] = useState<'garden' | 'todo'>('garden');

  // Garden State
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [gardenHistory, setGardenHistory] = useState<GardenItem[]>([]);

  useEffect(() => {
    if (!process.env.API_KEY) {
        setApiKeyMissing(true);
    }
    
    const savedBlocks = localStorage.getItem('chromeFocusBlocks');
    if (savedBlocks) {
        setBlocks(JSON.parse(savedBlocks));
    }

    const savedGarden = localStorage.getItem('chromeFocusGarden');
    if (savedGarden) {
        setGardenHistory(JSON.parse(savedGarden));
    }
  }, []);

  // Timer Tick
  useEffect(() => {
    let interval: number;
    if (isFocusActive && secondsRemaining > 0) {
      interval = window.setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isFocusActive) {
      // Timer finished naturally
      handleHarvest();
      setIsFocusActive(false);
      updateBlock(currentBlockIndex, { status: 'completed', focusScore: 100 });
    }
    return () => clearInterval(interval);
  }, [isFocusActive, secondsRemaining, currentBlockIndex]);

  const handleHarvest = () => {
      if (!selectedEntityId) return;
      
      // Determine type crudely from ID (or pass type up)
      // In a real app we'd lookup the ID in the Options list
      const isAnimal = ['cat', 'dog', 'rabbit', 'bird'].includes(selectedEntityId);
      const type: FocusEntityType = isAnimal ? 'ANIMAL' : 'PLANT';

      const newItem: GardenItem = {
          id: Date.now().toString(),
          entityId: selectedEntityId,
          type,
          name: selectedEntityId,
          plantedAt: Date.now() - 90 * 60 * 1000,
          completedAt: Date.now()
      };

      const newHistory = [...gardenHistory, newItem];
      setGardenHistory(newHistory);
      localStorage.setItem('chromeFocusGarden', JSON.stringify(newHistory));
      alert(t.harvestComplete);
      setSelectedEntityId(null); // Reset selection
      setSecondsRemaining(SECONDS_IN_BLOCK); // Reset timer
  };

  const updateBlock = (id: number, data: Partial<BlockData>) => {
    const newBlocks = blocks.map(b => b.id === id ? { ...b, ...data } : b);
    setBlocks(newBlocks);
    localStorage.setItem('chronoFocusBlocks', JSON.stringify(newBlocks));
  };

  const handleBlockSelect = (id: number) => {
    setCurrentBlockIndex(id);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const toggleLanguage = () => {
      setLang(prev => prev === 'en' ? 'zh' : 'en');
  };

  if (apiKeyMissing) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
              <div className="bg-white p-8 rounded-xl shadow-xl max-w-md text-center">
                  <h1 className="text-2xl font-bold text-red-600 mb-4">API Key Missing</h1>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen flex flex-col max-w-7xl mx-auto p-4 md:p-6 gap-6">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{t.appTitle}</h1>
            <p className="text-xs text-slate-500 font-medium">{t.appSubtitle}</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-xs font-bold transition-all"
            >
                <Languages className="w-4 h-4" />
                {lang === 'en' ? '中文' : 'English'}
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all">
                <Settings className="w-5 h-5" />
            </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 grow">
        
        {/* Left Column: Timeline (3 cols) */}
        <section className="lg:col-span-3 h-[500px] lg:h-auto">
          <BlockTimeline 
            blocks={blocks} 
            currentBlockId={currentBlockIndex}
            onSelectBlock={handleBlockSelect}
            lang={lang}
          />
        </section>

        {/* Center Column: Active Work Area (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Timer Display Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl shadow-slate-200 relative overflow-hidden flex flex-col items-center justify-center min-h-[200px]">
                <div className="absolute top-0 left-0 w-full h-2 bg-slate-800">
                    <div 
                        className="h-full bg-indigo-500 transition-all duration-1000" 
                        style={{ width: `${((SECONDS_IN_BLOCK - secondsRemaining) / SECONDS_IN_BLOCK) * 100}%` }}
                    />
                </div>
                
                <h2 className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-2">
                    {t.currentBlockRemaining}
                </h2>
                <div className="text-7xl font-mono font-bold tracking-tighter tabular-nums text-indigo-100">
                    {formatTime(secondsRemaining)}
                </div>
                <div className="mt-4 text-indigo-300 text-sm">
                    {isFocusActive ? t.deepFocus : t.timerPaused}
                </div>
            </div>

            {/* Activity Input & AI */}
            <div className="grow">
                <CurrentBlockManager 
                    block={blocks[currentBlockIndex]} 
                    onUpdateBlock={updateBlock}
                    lang={lang}
                />
            </div>
        </section>

        {/* Right Column: Gamification & To-Do (4 cols) */}
        <section className="lg:col-span-4 flex flex-col h-[600px] lg:h-auto">
            {/* Tab Navigation */}
            <div className="bg-white rounded-t-xl border-b border-slate-200 flex overflow-hidden">
                <button 
                   onClick={() => setRightSidebarTab('garden')}
                   className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${rightSidebarTab === 'garden' ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Sprout className="w-4 h-4" /> {t.focusGarden}
                </button>
                <button 
                   onClick={() => setRightSidebarTab('todo')}
                   className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${rightSidebarTab === 'todo' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <CheckSquare className="w-4 h-4" /> {t.todoList}
                </button>
            </div>
            
            {/* Tab Content */}
            <div className="flex-1 bg-white rounded-b-xl border-x border-b border-slate-200 shadow-sm overflow-hidden relative">
                <div className={`absolute inset-0 transition-opacity duration-300 ${rightSidebarTab === 'garden' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                    <FocusGarden 
                        isActive={isFocusActive} 
                        onToggleFocus={() => setIsFocusActive(!isFocusActive)}
                        secondsRemaining={secondsRemaining}
                        lang={lang}
                        selectedEntityId={selectedEntityId}
                        onSelectEntity={setSelectedEntityId}
                        gardenHistory={gardenHistory}
                    />
                </div>
                <div className={`absolute inset-0 transition-opacity duration-300 ${rightSidebarTab === 'todo' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                    <ToDoList lang={lang} />
                </div>
            </div>
        </section>
      </main>

      {/* Footer Info */}
      <footer className="text-center text-slate-400 text-xs mt-6">
        <p>Chrome Extension Simulator • React 18 • Tailwind • Google Gemini AI</p>
      </footer>
    </div>
  );
};

export default App;
