import React, { useState, useEffect } from 'react';
import { Sprout, TreePine, Leaf, Play, Square, Trophy, Bird, Cat, Dog, Rabbit, Fish, Flower, Flower2, Carrot } from 'lucide-react';
import { getFocusTip } from '../services/geminiService';
import { translations, Language } from '../translations';
import { FocusEntityOption, GardenItem } from '../types';

interface FocusGardenProps {
  isActive: boolean;
  onToggleFocus: () => void;
  secondsRemaining: number;
  lang: Language;
  onSelectEntity: (entityId: string) => void;
  selectedEntityId: string | null;
  gardenHistory: GardenItem[];
}

const PLANT_OPTIONS: FocusEntityOption[] = [
  { id: 'pine', type: 'PLANT', nameKey: 'Pine Tree', icon: <TreePine className="w-8 h-8" /> },
  { id: 'flower', type: 'PLANT', nameKey: 'Flower', icon: <Flower className="w-8 h-8" /> },
  { id: 'carrot', type: 'PLANT', nameKey: 'Carrot', icon: <Carrot className="w-8 h-8" /> },
];

const ANIMAL_OPTIONS: FocusEntityOption[] = [
  { id: 'cat', type: 'ANIMAL', nameKey: 'Cat', icon: <Cat className="w-8 h-8" /> },
  { id: 'dog', type: 'ANIMAL', nameKey: 'Dog', icon: <Dog className="w-8 h-8" /> },
  { id: 'rabbit', type: 'ANIMAL', nameKey: 'Rabbit', icon: <Rabbit className="w-8 h-8" /> },
  { id: 'bird', type: 'ANIMAL', nameKey: 'Bird', icon: <Bird className="w-8 h-8" /> },
];

const getStageIcon = (entityId: string, stage: number) => {
    // Stage 0: Seed/Egg
    if (stage === 0) {
        if (['cat', 'dog', 'rabbit', 'bird'].includes(entityId)) {
             return <div className="w-8 h-10 bg-orange-100 rounded-full border-2 border-orange-200 flex items-center justify-center text-xs">Egg</div>;
        }
        return <div className="w-4 h-4 bg-amber-700 rounded-full" />; // Seed
    }
    
    // Stage 1: Sprout/Baby
    if (stage === 1) {
         if (['cat', 'dog', 'rabbit', 'bird'].includes(entityId)) return <div className="text-2xl">👶</div>;
         return <Sprout className="w-12 h-12 text-lime-500" />;
    }

    // Stage 2: Young
    if (stage === 2) {
         if (['cat', 'dog', 'rabbit', 'bird'].includes(entityId)) return <div className="text-4xl">🧒</div>;
         return <Leaf className="w-20 h-20 text-green-500" />;
    }

    // Stage 3: Adult (Final)
    const entity = [...PLANT_OPTIONS, ...ANIMAL_OPTIONS].find(e => e.id === entityId);
    if (!entity) return <TreePine className="w-32 h-32 text-emerald-700" />;
    
    // Return a big version of the icon
    return <div className="transform scale-[3.0] text-emerald-600">{entity.icon}</div>;
};

const FocusGarden: React.FC<FocusGardenProps> = ({ 
    isActive, onToggleFocus, secondsRemaining, lang, onSelectEntity, selectedEntityId, gardenHistory 
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'focus' | 'forest' | 'pasture'>('focus');
  const [growthProgress, setGrowthProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [tip, setTip] = useState<string>("");

  useEffect(() => {
    const totalSeconds = 90 * 60; 
    const elapsed = totalSeconds - secondsRemaining;
    const progress = Math.min(100, (elapsed / totalSeconds) * 100);
    setGrowthProgress(progress);

    if (progress < 10) setStageIndex(0);
    else if (progress < 40) setStageIndex(1);
    else if (progress < 80) setStageIndex(2);
    else setStageIndex(3);
  }, [secondsRemaining]);

  useEffect(() => {
     if (isActive) {
        getFocusTip(stageIndex + 1).then(setTip);
     } else {
        setTip(t.startFocusMsg);
     }
  }, [isActive, lang]);

  const renderSelection = () => (
      <div className="flex flex-col h-full overflow-y-auto">
          <h4 className="text-sm font-bold text-slate-700 mb-2 mt-2">{t.selectSeed}</h4>
          
          <div className="mb-4">
              <h5 className="text-xs font-semibold text-emerald-600 mb-2 uppercase">{t.plants}</h5>
              <div className="grid grid-cols-3 gap-2">
                  {PLANT_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => onSelectEntity(opt.id)}
                        className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all
                            ${selectedEntityId === opt.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-emerald-200'}
                        `}
                      >
                          <div className="text-emerald-600">{opt.icon}</div>
                          <span className="text-[10px] font-medium text-slate-600">{opt.nameKey}</span>
                      </button>
                  ))}
              </div>
          </div>

          <div className="mb-4">
              <h5 className="text-xs font-semibold text-orange-600 mb-2 uppercase">{t.animals}</h5>
              <div className="grid grid-cols-3 gap-2">
                  {ANIMAL_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => onSelectEntity(opt.id)}
                        className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all
                            ${selectedEntityId === opt.id ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-orange-200'}
                        `}
                      >
                          <div className="text-orange-600">{opt.icon}</div>
                          <span className="text-[10px] font-medium text-slate-600">{opt.nameKey}</span>
                      </button>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderActiveFocus = () => {
      const entity = [...PLANT_OPTIONS, ...ANIMAL_OPTIONS].find(e => e.id === selectedEntityId);
      const isAnimal = entity?.type === 'ANIMAL';
      
      return (
        <div className="relative z-10 flex flex-col items-center justify-center grow">
            <div className={`
            transition-all duration-700 ease-in-out transform
            ${isActive ? 'scale-110' : 'scale-100 grayscale-[0.5]'}
            p-8 bg-white/60 backdrop-blur-sm rounded-full shadow-lg border-4 
            ${isAnimal ? 'border-orange-100' : 'border-emerald-100'}
            `}>
            {getStageIcon(selectedEntityId || 'pine', stageIndex)}
            </div>
            <div className={`mt-4 font-semibold uppercase tracking-wide text-xs ${isAnimal ? 'text-orange-800' : 'text-emerald-800'}`}>
                {t.currentStage}: {stageIndex + 1}/4
            </div>
            
            <div className={`w-48 h-2 rounded-full mt-2 overflow-hidden ${isAnimal ? 'bg-orange-200' : 'bg-emerald-200'}`}>
                <div 
                    className={`h-full transition-all duration-1000 ${isAnimal ? 'bg-orange-500' : 'bg-emerald-500'}`}
                    style={{ width: `${growthProgress}%` }}
                />
            </div>

            <p className="text-sm mt-4 italic text-center opacity-80 min-h-[40px] px-4">
                {isActive ? (isAnimal ? `${t.raising} ${entity?.nameKey}...` : `${t.planting} ${entity?.nameKey}...`) : t.startFocusMsg}
            </p>
            <p className="text-xs text-center mt-1 text-slate-500">{tip}</p>
        </div>
      );
  };

  const renderGallery = (type: 'PLANT' | 'ANIMAL') => {
      const items = gardenHistory.filter(i => i.type === type);
      const uniqueCounts = items.reduce((acc, curr) => {
          acc[curr.entityId] = (acc[curr.entityId] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);

      const options = type === 'PLANT' ? PLANT_OPTIONS : ANIMAL_OPTIONS;

      return (
          <div className="h-full overflow-y-auto pt-2">
              <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  {type === 'PLANT' ? <TreePine className="w-4 h-4" /> : <Cat className="w-4 h-4" />}
                  {t.collection}
              </h4>
              <div className="grid grid-cols-3 gap-3">
                  {options.map(opt => (
                      <div key={opt.id} className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col items-center shadow-sm">
                          <div className={`mb-2 ${type === 'PLANT' ? 'text-emerald-600' : 'text-orange-600'}`}>
                              {opt.icon}
                          </div>
                          <span className="text-xs font-bold text-slate-700">{opt.nameKey}</span>
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mt-1">
                              {t.qty}: {uniqueCounts[opt.id] || 0}
                          </span>
                      </div>
                  ))}
              </div>
              {items.length === 0 && (
                  <div className="text-center text-slate-400 text-xs mt-10">
                      Empty... Start focusing to fill your {type === 'PLANT' ? 'forest' : 'pasture'}!
                  </div>
              )}
          </div>
      );
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-sm border border-emerald-200 h-full flex flex-col relative overflow-hidden">
      
      {/* Tabs */}
      <div className="flex border-b border-emerald-200/50 bg-white/50 backdrop-blur-sm">
           <button 
             onClick={() => setActiveTab('focus')}
             className={`flex-1 py-2 text-xs font-bold ${activeTab === 'focus' ? 'text-emerald-700 bg-emerald-100/50' : 'text-slate-500 hover:bg-white/50'}`}
           >
             {t.focusGarden}
           </button>
           <button 
             onClick={() => setActiveTab('forest')}
             className={`flex-1 py-2 text-xs font-bold ${activeTab === 'forest' ? 'text-emerald-700 bg-emerald-100/50' : 'text-slate-500 hover:bg-white/50'}`}
           >
             {t.forest}
           </button>
           <button 
             onClick={() => setActiveTab('pasture')}
             className={`flex-1 py-2 text-xs font-bold ${activeTab === 'pasture' ? 'text-emerald-700 bg-emerald-100/50' : 'text-slate-500 hover:bg-white/50'}`}
           >
             {t.pasture}
           </button>
      </div>

      <div className="p-6 flex flex-col grow relative">
        {/* Background Decor */}
        <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none">
            <TreePine className="w-64 h-64 text-emerald-900" />
        </div>

        {activeTab === 'focus' ? (
            <>
                {isActive ? renderActiveFocus() : (
                    <div className="h-full flex flex-col">
                        {selectedEntityId ? renderActiveFocus() : renderSelection()}
                        
                        {!isActive && selectedEntityId && (
                             <button 
                               onClick={() => onSelectEntity('')} // Reselect
                               className="absolute top-4 right-4 text-xs text-slate-400 underline"
                             >
                               Change
                             </button>
                        )}
                    </div>
                )}
                
                <div className="z-10 w-full mt-4">
                    <button
                    onClick={onToggleFocus}
                    disabled={!selectedEntityId && !isActive}
                    className={`
                        w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2
                        ${!selectedEntityId && !isActive ? 'bg-slate-300 cursor-not-allowed text-slate-500' : 
                          isActive 
                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'}
                    `}
                    >
                    {isActive ? (
                        <>
                        <Square className="w-5 h-5 fill-current" /> {t.stopFocus}
                        </>
                    ) : (
                        <>
                        <Play className="w-5 h-5 fill-current" /> {t.plantTree}
                        </>
                    )}
                    </button>
                </div>
            </>
        ) : activeTab === 'forest' ? (
            renderGallery('PLANT')
        ) : (
            renderGallery('ANIMAL')
        )}
      </div>
    </div>
  );
};

export default FocusGarden;
