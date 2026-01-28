import React, { useState, useEffect } from 'react';
import { BlockData, GardenItem, FocusEntityType } from './types';
import BlockTimeline from './components/BlockTimeline';
import FocusGarden from './components/FocusGarden';
import CurrentBlockManager from './components/CurrentBlockManager';
import ToDoList from './components/ToDoList';
import { Timer, Settings, Languages } from 'lucide-react';
import { translations, Language } from './translations';

const BLOCK_DURATION_MINUTES = 90;
const SECONDS_IN_BLOCK = BLOCK_DURATION_MINUTES * 60;

// Helper to generate blocks starting from the current 90m slot
const generateBlocks = (): BlockData[] => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  // Align to 90 min grid (00:00, 01:30... etc)
  const startBlockMinutes = Math.floor(currentMinutes / 90) * 90;
  
  const blocks: BlockData[] = [];
  let minCounter = startBlockMinutes;

  for (let i = 0; i < 16; i++) {
    // Calculate times with 24h wrap
    const currentTotal = minCounter; 
    const startH = Math.floor((currentTotal % 1440) / 60);
    const startM = currentTotal % 60;
    
    const endTotal = minCounter + 90;
    const endH = Math.floor((endTotal % 1440) / 60);
    const endM = endTotal % 60;

    const startStr = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
    const endStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    blocks.push({
      id: i,
      startTime: startStr,
      endTime: endStr,
      activity: '',
      isCurrent: i === 0, // First one is current
      status: 'pending',
    });

    minCounter += 90;
  }
  return blocks;
};

// Initial Garden Data so the farm isn't empty on first load
const INITIAL_GARDEN: GardenItem[] = [
    { id: 'init-1', entityId: 'pine', type: 'PLANT', name: 'pine', plantedAt: 0, completedAt: 0 },
    { id: 'init-2', entityId: 'pine', type: 'PLANT', name: 'pine', plantedAt: 0, completedAt: 0 },
    { id: 'init-3', entityId: 'pumpkin', type: 'PLANT', name: 'pumpkin', plantedAt: 0, completedAt: 0 },
    { id: 'init-4', entityId: 'cow', type: 'ANIMAL', name: 'cow', plantedAt: 0, completedAt: 0 },
    { id: 'init-5', entityId: 'chicken', type: 'ANIMAL', name: 'chicken', plantedAt: 0, completedAt: 0 },
];

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('zh');
  const t = translations[lang];

  const [blocks, setBlocks] = useState<BlockData[]>(generateBlocks());
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(SECONDS_IN_BLOCK);
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  // Garden State
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [gardenHistory, setGardenHistory] = useState<GardenItem[]>(INITIAL_GARDEN);

  useEffect(() => {
    if (!process.env.API_KEY) {
        setApiKeyMissing(true);
    }
    
    const savedBlocksStr = localStorage.getItem('chromeFocusBlocks');
    if (savedBlocksStr) {
        const savedBlocks: BlockData[] = JSON.parse(savedBlocksStr);
        if (savedBlocks.length > 0) {
             // Check if the first block of saved data matches current time slot
             const now = new Date();
             const totalMinutes = now.getHours() * 60 + now.getMinutes();
             const currentSlotStart = Math.floor(totalMinutes / 90) * 90;
             
             // Parse saved block start time
             const [h, m] = savedBlocks[0].startTime.split(':').map(Number);
             const savedSlotStart = h * 60 + m;

             // Tolerance check: if the saved start time is significantly different from current slot start,
             // it means the data is stale (old session/day), so we regenerate.
             // Also handle 24h wrap-around logic (simple inequality check usually suffices for stale data)
             if (Math.abs(currentSlotStart - savedSlotStart) < 5) {
                 setBlocks(savedBlocks);
             } else {
                 // Regenerate
                 const newBlocks = generateBlocks();
                 setBlocks(newBlocks);
                 localStorage.setItem('chromeFocusBlocks', JSON.stringify(newBlocks));
             }
        }
    } else {
        // No save, save initial
        localStorage.setItem('chromeFocusBlocks', JSON.stringify(blocks));
    }

    const savedGarden = localStorage.getItem('chromeFocusGarden');
    if (savedGarden) {
        setGardenHistory(JSON.parse(savedGarden));
    } else {
        setGardenHistory(INITIAL_GARDEN);
        localStorage.setItem('chromeFocusGarden', JSON.stringify(INITIAL_GARDEN));
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
      const isAnimal = ['cat', 'dog', 'chicken', 'pig', 'cow'].includes(selectedEntityId);
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
    localStorage.setItem('chromeFocusBlocks', JSON.stringify(newBlocks));
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
    <div className="min-h-screen flex flex-col max-w-7xl mx-auto p-4 gap-4 h-screen overflow-hidden">
      
      {/* Header */}
      <header className="flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">{t.appTitle}</h1>
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
                <Settings className="w-4 h-4" />
            </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-4 grow overflow-hidden">
        
        {/* Left Column: Timeline (3 cols) */}
        {/* Fixed height to show approx 8 items (8 * ~64px = 512px) */}
        <section className="lg:col-span-3 h-[520px]">
          <BlockTimeline 
            blocks={blocks} 
            currentBlockId={currentBlockIndex}
            onSelectBlock={handleBlockSelect}
            lang={lang}
          />
        </section>

        {/* Center Column: Active Work Area + My Farm (Landscape) */}
        <section className="lg:col-span-5 flex flex-col gap-4 h-full overflow-y-auto pr-2 custom-scrollbar pb-2">
            
            {/* Timer Display - Compact */}
            <div className="bg-slate-900 text-white rounded-xl p-4 shadow-lg shadow-slate-200 relative overflow-hidden flex items-center justify-between shrink-0">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                    <div 
                        className="h-full bg-indigo-500 transition-all duration-1000" 
                        style={{ width: `${((SECONDS_IN_BLOCK - secondsRemaining) / SECONDS_IN_BLOCK) * 100}%` }}
                    />
                </div>
                
                <div>
                    <h2 className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">
                        {t.currentBlockRemaining}
                    </h2>
                    <div className="text-indigo-300 text-xs flex items-center gap-2">
                        {isFocusActive ? t.deepFocus : t.timerPaused}
                    </div>
                </div>
                <div className="text-4xl font-mono font-bold tracking-tighter tabular-nums text-indigo-100">
                    {formatTime(secondsRemaining)}
                </div>
            </div>

            {/* Activity Input & AI */}
            <div className="shrink-0">
                <CurrentBlockManager 
                    block={blocks[currentBlockIndex]} 
                    onUpdateBlock={updateBlock}
                    lang={lang}
                />
            </div>

            {/* My Farm (Landscape Mode) - Below Activity Monitor */}
            <div className="h-[400px] shrink-0">
                <FocusGarden 
                    isActive={isFocusActive} 
                    onToggleFocus={() => setIsFocusActive(!isFocusActive)}
                    secondsRemaining={secondsRemaining}
                    lang={lang}
                    selectedEntityId={selectedEntityId}
                    onSelectEntity={setSelectedEntityId}
                    gardenHistory={gardenHistory}
                    mode="landscape"
                />
            </div>
        </section>

        {/* Right Column: To-Do + Focus Controls */}
        <section className="lg:col-span-4 h-full flex flex-col gap-4 overflow-hidden pb-2">
            {/* ToDo List (Flexible height) */}
            <div className="flex-1 overflow-hidden">
                <ToDoList lang={lang} />
            </div>

            {/* Focus Garden Controls (Fixed height container) - Below Tasks */}
            <div className="h-[320px] shrink-0">
                 <FocusGarden 
                    isActive={isFocusActive} 
                    onToggleFocus={() => setIsFocusActive(!isFocusActive)}
                    secondsRemaining={secondsRemaining}
                    lang={lang}
                    selectedEntityId={selectedEntityId}
                    onSelectEntity={setSelectedEntityId}
                    gardenHistory={gardenHistory}
                    mode="controls"
                />
            </div>
        </section>
      </main>
    </div>
  );
};

export default App;