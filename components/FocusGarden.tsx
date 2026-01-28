import React, { useState, useEffect, useMemo } from 'react';
import { Play, Square } from 'lucide-react';
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
  mode: 'controls' | 'landscape';
}

// --- Redrawn SVGs (Pixel Art Style) ---

const PineTreeSVG = () => (
    <svg width="40" height="64" viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
        <defs>
            <filter id="treeShadow" x="-20%" y="0" width="140%" height="140%">
                <feOffset dx="2" dy="2" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
                <feBlend in="SourceGraphic" mode="normal" />
            </filter>
        </defs>
        <g filter="url(#treeShadow)">
            {/* Trunk */}
            <rect x="18" y="54" width="4" height="10" fill="#5C4033" />
            {/* Bottom Tier */}
            <path d="M4 36 H36 L20 64 Z" fill="#1E4D2B" transform="translate(0, -10)" /> 
            <path d="M4 36 H36 L20 16 Z" fill="#2D5A27" transform="translate(0, 10)" />
            {/* Middle Tier */}
            <path d="M8 24 H32 L20 44 Z" fill="#3D7E36" transform="translate(0, 5)" />
            {/* Top Tier */}
            <path d="M12 12 H28 L20 32 Z" fill="#4E9F45" transform="translate(0, 0)" />
            {/* Highlights */}
            <rect x="20" y="14" width="2" height="2" fill="#81C784" opacity="0.6"/>
            <rect x="16" y="32" width="2" height="2" fill="#81C784" opacity="0.6"/>
            <rect x="22" y="46" width="2" height="2" fill="#81C784" opacity="0.6"/>
        </g>
    </svg>
);

const ChickenSVG = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
        <g className="animate-bounce-slight origin-bottom">
            {/* Body */}
            <path d="M6 10 H18 V18 H6 Z" fill="#FFFFFF" />
            <path d="M6 10 H18 V18 H6 Z" fill="none" stroke="#E0E0E0" strokeWidth="1" />
            {/* Tail */}
            <path d="M4 11 H6 V15 H4 Z" fill="#FFFFFF" />
            {/* Head/Comb */}
            <rect x="12" y="7" width="2" height="3" fill="#D32F2F" />
            <rect x="14" y="8" width="2" height="2" fill="#D32F2F" />
            {/* Eye/Beak */}
            <rect x="16" y="12" width="2" height="2" fill="#212121" />
            <rect x="18" y="13" width="2" height="2" fill="#FFB300" />
            {/* Wing */}
            <rect x="10" y="13" width="4" height="3" fill="#EEEEEE" />
            {/* Feet */}
            <rect x="9" y="18" width="2" height="3" fill="#FFB300" />
            <rect x="15" y="18" width="2" height="3" fill="#FFB300" />
        </g>
    </svg>
);

const CatSVG = () => (
    <svg width="32" height="24" viewBox="0 0 32 24" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
        <g className="group">
            {/* Tail */}
            <path d="M2 8 Q2 2 8 6" stroke="#E67E22" strokeWidth="3" fill="none" className="animate-wag" />
            {/* Body */}
            <rect x="6" y="10" width="16" height="10" fill="#D35400" rx="2" />
            <rect x="10" y="10" width="8" height="4" fill="#E67E22" />
            {/* Head */}
            <rect x="20" y="6" width="9" height="9" fill="#D35400" />
            <path d="M21 4 L23 6 H21 Z" fill="#D35400" />
            <path d="M27 4 L29 6 H27 Z" fill="#D35400" />
            {/* Face */}
            <rect x="22" y="9" width="1" height="1" fill="#212121" />
            <rect x="26" y="9" width="1" height="1" fill="#212121" />
            <rect x="24" y="11" width="1" height="1" fill="#F48FB1" />
            {/* Legs - Animated via CSS in parent potentially, but here static for pixel art feel */}
            <rect x="8" y="20" width="3" height="4" fill="#A04000" />
            <rect x="18" y="20" width="3" height="4" fill="#A04000" />
        </g>
    </svg>
);

const HouseSVG = () => (
    <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
        <defs>
            <filter id="houseShadow" x="-20%" y="0" width="140%" height="140%">
                <feOffset dx="0" dy="2" />
                <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0" />
                <feBlend in="SourceGraphic" mode="normal" />
            </filter>
        </defs>
        <g filter="url(#houseShadow)">
            {/* Base */}
            <rect x="10" y="30" width="60" height="40" fill="#D7CCC8" stroke="#5D4037" strokeWidth="2" />
            <rect x="10" y="65" width="60" height="5" fill="#8D6E63" />
            {/* Roof */}
            <path d="M5 30 L40 5 L75 30 Z" fill="#C62828" stroke="#8E0000" strokeWidth="2" />
            <rect x="35" y="15" width="10" height="8" fill="#B71C1C" />
            {/* Door */}
            <rect x="30" y="45" width="20" height="25" fill="#5D4037" rx="2" />
            <rect x="30" y="45" width="20" height="25" fill="none" stroke="#3E2723" strokeWidth="2" rx="2"/>
            <circle cx="46" cy="58" r="1.5" fill="#FFD54F" />
            {/* Window */}
            <rect x="55" y="40" width="10" height="10" fill="#81D4FA" stroke="#FFF" strokeWidth="2" />
        </g>
    </svg>
);

const SproutSVG = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22 V12 M12 12 Q8 6 4 10 M12 12 Q16 6 20 10" stroke="#6DAA2C" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
);

// --- Assets Config ---
const ASSETS = {
    parsnip: {
        seed: 'https://stardewvalleywiki.com/mediawiki/images/2/23/Parsnip_Seeds.png',
        mature: 'https://stardewvalleywiki.com/mediawiki/images/d/db/Parsnip.png'
    },
    pumpkin: {
        seed: 'https://stardewvalleywiki.com/mediawiki/images/d/d7/Pumpkin_Seeds.png',
        mature: 'https://stardewvalleywiki.com/mediawiki/images/6/64/Pumpkin.png'
    },
    sunflower: {
        seed: 'https://stardewvalleywiki.com/mediawiki/images/d/d0/Sunflower_Seeds.png',
        mature: 'https://stardewvalleywiki.com/mediawiki/images/8/81/Sunflower.png'
    },
    cow: {
        baby: 'https://stardewvalleywiki.com/mediawiki/images/8/84/White_Cow_Baby.png',
        adult: 'https://stardewvalleywiki.com/mediawiki/images/3/36/White_Cow.png'
    },
    pig: {
        baby: 'https://stardewvalleywiki.com/mediawiki/images/2/26/Pig_Baby.png',
        adult: 'https://stardewvalleywiki.com/mediawiki/images/3/30/Pig.png'
    }
};

const PLANT_OPTIONS: FocusEntityOption[] = [
  { id: 'parsnip', type: 'PLANT', nameKey: 'parsnip', icon: <img src={ASSETS.parsnip.mature} className="w-6 h-6 object-contain pixel-art" alt="Parsnip" /> },
  { id: 'pumpkin', type: 'PLANT', nameKey: 'pumpkin', icon: <img src={ASSETS.pumpkin.mature} className="w-6 h-6 object-contain pixel-art" alt="Pumpkin" /> },
  { id: 'pine', type: 'PLANT', nameKey: 'pine', icon: <div className="w-6 h-6 overflow-hidden flex items-center justify-center"><PineTreeSVG /></div> },
  { id: 'sunflower', type: 'PLANT', nameKey: 'sunflower', icon: <img src={ASSETS.sunflower.mature} className="w-6 h-6 object-contain pixel-art" alt="Sunflower" /> },
];

const ANIMAL_OPTIONS: FocusEntityOption[] = [
  { id: 'pig', type: 'ANIMAL', nameKey: 'pig', icon: <img src={ASSETS.pig.adult} className="w-8 h-8 object-contain pixel-art" alt="Pig" /> },
  { id: 'cow', type: 'ANIMAL', nameKey: 'cow', icon: <img src={ASSETS.cow.adult} className="w-8 h-8 object-contain pixel-art" alt="Cow" /> },
  { id: 'cat', type: 'ANIMAL', nameKey: 'cat', icon: <div className="w-8 h-8 flex items-center justify-center"><CatSVG /></div> },
  { id: 'chicken', type: 'ANIMAL', nameKey: 'chicken', icon: <div className="w-6 h-6 flex items-center justify-center"><ChickenSVG /></div> },
];

const renderStageVisual = (entityId: string, stage: number, className: string = "") => {
    const isAnimal = ANIMAL_OPTIONS.some(a => a.id === entityId);
    
    // Custom SVGs first
    if (entityId === 'pine' && stage >= 2) return <div className={`${className} transform scale-125 -translate-y-2`}><PineTreeSVG /></div>;
    if (entityId === 'chicken') return <div className={`${className}`}><ChickenSVG /></div>;
    if (entityId === 'cat') return <div className={`${className}`}><CatSVG /></div>;

    // Helper to render img for others
    const img = (src: string, isBig: boolean = false) => (
        <img 
            src={src} 
            alt={entityId} 
            className={`${className} pixel-art object-contain ${isBig ? 'w-full h-full' : 'w-8 h-8'} drop-shadow-sm`} 
            referrerPolicy="no-referrer"
        />
    );

    // PLANTS
    if (!isAnimal) {
        if (stage === 0) {
            if (entityId === 'parsnip') return img(ASSETS.parsnip.seed);
            if (entityId === 'pumpkin') return img(ASSETS.pumpkin.seed);
            if (entityId === 'sunflower') return img(ASSETS.sunflower.seed);
            if (entityId === 'pine') return img(ASSETS.parsnip.seed);
        }
        
        if (stage === 1) return <div className={`transform scale-75 ${className}`}><SproutSVG /></div>;
        if (stage === 2) return <div className={`transform scale-100 ${className}`}><SproutSVG /></div>;

        if (entityId === 'parsnip') return img(ASSETS.parsnip.mature, true);
        if (entityId === 'pumpkin') return img(ASSETS.pumpkin.mature, true);
        if (entityId === 'sunflower') return img(ASSETS.sunflower.mature, true);
        
        return <SproutSVG />;
    }

    // ANIMALS
    const isBaby = stage < 2;
    if (entityId === 'cow') return img(isBaby ? ASSETS.cow.baby : ASSETS.cow.adult, !isBaby);
    if (entityId === 'pig') return img(isBaby ? ASSETS.pig.baby : ASSETS.pig.adult, !isBaby);

    return null;
}

const FocusGarden: React.FC<FocusGardenProps> = ({ 
    isActive, onToggleFocus, secondsRemaining, lang, onSelectEntity, selectedEntityId, gardenHistory, mode
}) => {
  const t = translations[lang];
  const [growthProgress, setGrowthProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [tip, setTip] = useState<string>("");

  useEffect(() => {
    const totalSeconds = 90 * 60; 
    const elapsed = totalSeconds - secondsRemaining;
    const progress = Math.min(100, (elapsed / totalSeconds) * 100);
    setGrowthProgress(progress);

    if (progress < 25) setStageIndex(0);
    else if (progress < 50) setStageIndex(1);
    else if (progress < 75) setStageIndex(2);
    else setStageIndex(3);
  }, [secondsRemaining]);

  useEffect(() => {
     if (isActive) {
        getFocusTip(stageIndex + 1).then(setTip);
     } else {
        setTip(t.startFocusMsg);
     }
  }, [isActive, lang, stageIndex]);

  const renderSelection = () => (
      <div className="flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar">
          <h4 className="text-sm font-bold text-slate-700 mb-3 mt-1">{t.selectSeed}</h4>
          
          <div className="mb-4">
              <h5 className="text-xs font-bold text-emerald-700 mb-2 uppercase tracking-wider flex items-center gap-1">
                  {t.plants}
              </h5>
              <div className="grid grid-cols-2 gap-2">
                  {PLANT_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => onSelectEntity(opt.id)}
                        className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all shadow-sm
                            ${selectedEntityId === opt.id 
                                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200' 
                                : 'border-slate-100 hover:border-emerald-300 hover:bg-white'}
                        `}
                      >
                          <div className="w-10 h-10 flex items-center justify-center bg-emerald-100/50 rounded-lg">
                              {opt.icon}
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 text-center">
                             {t[opt.nameKey as keyof typeof t] || opt.nameKey}
                          </span>
                      </button>
                  ))}
              </div>
          </div>

          <div className="mb-2">
              <h5 className="text-xs font-bold text-orange-700 mb-2 uppercase tracking-wider flex items-center gap-1">
                  {t.animals}
              </h5>
              <div className="grid grid-cols-2 gap-2">
                  {ANIMAL_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => onSelectEntity(opt.id)}
                        className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all shadow-sm
                            ${selectedEntityId === opt.id 
                                ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200' 
                                : 'border-slate-100 hover:border-orange-300 hover:bg-white'}
                        `}
                      >
                           <div className="w-10 h-10 flex items-center justify-center bg-orange-100/50 rounded-lg">
                              {opt.icon}
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 text-center">
                             {t[opt.nameKey as keyof typeof t] || opt.nameKey}
                          </span>
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
        <div className="relative z-10 flex flex-col items-center justify-center grow p-2">
            <div className={`
                relative flex items-center justify-center
                transition-all duration-700 ease-in-out transform
                ${isActive ? 'scale-100' : 'scale-95 grayscale-[0.2]'}
                w-32 h-32 bg-gradient-to-b from-sky-100 to-white rounded-full shadow-xl border-[4px] 
                ${isAnimal ? 'border-orange-100' : 'border-emerald-100'}
                overflow-hidden mb-4
            `}>
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
                <div className="flex items-center justify-center w-full h-full pb-2">
                    <div className="transform scale-[2.0] drop-shadow-md">
                        {renderStageVisual(selectedEntityId || 'pine', stageIndex, "")}
                    </div>
                </div>
            </div>
            
            <div className="w-full max-w-[200px] mb-2">
                <div className={`h-3 rounded-full overflow-hidden border ${isAnimal ? 'bg-orange-100 border-orange-200' : 'bg-emerald-100 border-emerald-200'}`}>
                    <div 
                        className={`h-full transition-all duration-1000 relative ${isAnimal ? 'bg-orange-400' : 'bg-emerald-500'}`}
                        style={{ width: `${growthProgress}%` }}
                    >
                        <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-[shimmer_2s_infinite]"></div>
                    </div>
                </div>
                <div className="flex justify-between mt-1 text-[10px] font-medium text-slate-400">
                    <span>Lvl {stageIndex + 1}</span>
                    <span>{Math.round(growthProgress)}%</span>
                </div>
            </div>

            <p className="text-sm font-medium text-slate-700 text-center mb-1">
                {isActive 
                    ? (isAnimal 
                        ? `${t.raising} ${t[entity?.nameKey as keyof typeof t] || entity?.nameKey}` 
                        : `${t.planting} ${t[entity?.nameKey as keyof typeof t] || entity?.nameKey}`) 
                    : t.startFocusMsg}
            </p>
            <p className="text-[10px] text-center text-slate-400 bg-white/50 px-2 py-0.5 rounded-full truncate w-full">
                💡 {tip}
            </p>
        </div>
      );
  };

  const renderLandscape = () => {
    // Separate plants and animals
    const plants = gardenHistory.filter(i => i.type === 'PLANT');
    const animals = gardenHistory.filter(i => i.type === 'ANIMAL');

    // 4x4 Grid for plants
    const gridCells = Array(16).fill(null);
    plants.forEach((plant, i) => {
        if (i < 16) gridCells[i] = plant;
    });

    return (
        <div className="relative w-full h-full bg-[#7CBB46] overflow-hidden rounded-xl border-4 border-[#3A85CC] shadow-inner font-pixel select-none group">
            {/* Main Land Texture (No Water Margin) */}
            <div 
                className="absolute inset-0 opacity-10" 
                style={{
                    backgroundImage: 'radial-gradient(#5C4033 15%, transparent 16%)',
                    backgroundSize: '30px 30px'
                }}
            />

            {/* Perimeter Trees - Framing the Farm */}
            <div className="absolute top-0 w-full h-16 flex justify-between px-4 z-10 pointer-events-none">
                {[...Array(6)].map((_, i) => <div key={`t-${i}`} className="scale-75 -mt-4"><PineTreeSVG /></div>)}
            </div>
            <div className="absolute bottom-0 w-full h-16 flex justify-between px-4 z-30 pointer-events-none">
                {[...Array(5)].map((_, i) => <div key={`b-${i}`} className="scale-90 -mb-2"><PineTreeSVG /></div>)}
            </div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[80%] flex flex-col justify-between pl-1 z-10 pointer-events-none">
                {[...Array(3)].map((_, i) => <div key={`l-${i}`} className="scale-75"><PineTreeSVG /></div>)}
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[80%] flex flex-col justify-between pr-1 z-10 pointer-events-none">
                {[...Array(3)].map((_, i) => <div key={`r-${i}`} className="scale-75"><PineTreeSVG /></div>)}
            </div>

            {/* Farmhouse - Top Left Corner */}
            <div className="absolute top-8 left-8 z-[15] drop-shadow-md">
                <HouseSVG />
            </div>

            {/* Central Crop Grid (4x4) - Strictly centered in the field */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] z-[5]">
                {/* Soil Background for Grid Area */}
                <div className="absolute -inset-2 bg-[#5D4037] rounded-lg opacity-30 blur-sm"></div>
                
                <div className="grid grid-cols-4 grid-rows-4 gap-2 w-full h-full relative z-10">
                    {gridCells.map((cell, i) => (
                        <div 
                            key={i} 
                            className="bg-[#5C4033] rounded-md relative flex items-center justify-center shadow-inner border border-[#3E2723]/40 group/cell"
                        >
                            {/* Tilled Soil Texture */}
                            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM1YzQwMzMiIC8+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iIzNFMjcyMyIgLz48L3N2Zz4=')]"></div>
                            
                            {cell && (
                                <div className="w-full h-full p-1 flex items-center justify-center animate-pop-in relative z-20">
                                    {renderStageVisual(cell.entityId, 3, "w-full h-full")}
                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded opacity-0 group-hover/cell:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                        {t[cell.name as keyof typeof t] || cell.name}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Animals - Wandering on the main grass layer */}
            {animals.map((item, i) => {
                // Generate a random path for each animal
                const seed = item.id.charCodeAt(item.id.length-1);
                // Safe wandering zone: 10% to 90%
                const startX = (seed * 17) % 80 + 10; 
                const startY = (seed * 23) % 80 + 10;
                // Randomized duration and delay for "coherent but random" feel
                const duration = 15 + (seed % 15);
                const delay = i * 1.5;
                const pathType = seed % 3; // 3 diff wandering patterns

                return (
                    <div 
                        key={item.id}
                        className="absolute z-20"
                        style={{
                            left: `${startX}%`,
                            top: `${startY}%`,
                            animation: `wander-${pathType} ${duration}s infinite linear ${delay}s`
                        }}
                    >
                        <div className="relative group cursor-pointer hover:scale-110 transition-transform">
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-2 bg-black/20 rounded-full blur-[2px]"></div>
                            {renderStageVisual(item.entityId, 3, "")}
                        </div>
                    </div>
                );
            })}
            
            <style>{`
                .pixel-art { image-rendering: pixelated; }
                
                @keyframes wander-0 {
                    0% { transform: translate(0, 0) scaleX(1); }
                    25% { transform: translate(40px, 20px) scaleX(1); }
                    26% { transform: translate(40px, 20px) scaleX(-1); }
                    50% { transform: translate(0, 40px) scaleX(-1); }
                    75% { transform: translate(-40px, 20px) scaleX(-1); }
                    76% { transform: translate(-40px, 20px) scaleX(1); }
                    100% { transform: translate(0, 0) scaleX(1); }
                }
                
                @keyframes wander-1 {
                    0% { transform: translate(0, 0) scaleX(-1); }
                    30% { transform: translate(-50px, -20px) scaleX(-1); }
                    31% { transform: translate(-50px, -20px) scaleX(1); }
                    60% { transform: translate(20px, 0px) scaleX(1); }
                    61% { transform: translate(20px, 0px) scaleX(-1); }
                    100% { transform: translate(0, 0) scaleX(-1); }
                }

                @keyframes wander-2 {
                    0% { transform: translate(0, 0) scaleX(1); }
                    20% { transform: translate(30px, -30px) scaleX(1); }
                    40% { transform: translate(60px, 0px) scaleX(1); }
                    41% { transform: translate(60px, 0px) scaleX(-1); }
                    60% { transform: translate(30px, 30px) scaleX(-1); }
                    80% { transform: translate(0, 30px) scaleX(-1); }
                    100% { transform: translate(0, 0) scaleX(-1); } /* reset flip in JS usually better but css hack works for simple loop */
                }

                @keyframes pop-in {
                    0% { transform: scale(0); opacity: 0; }
                    60% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(1); }
                }
                .animate-bounce-slight {
                    animation: bounce-slight 2s infinite;
                }
                @keyframes bounce-slight {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                .animate-wag {
                    animation: wag 1.5s ease-in-out infinite alternate;
                    transform-origin: 2px 10px;
                }
                @keyframes wag {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(-15deg); }
                }
            `}</style>
        </div>
    );
  };

  if (mode === 'landscape') {
      return renderLandscape();
  }

  // Controls Mode (Unchanged)
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-sm border border-emerald-200 h-full flex flex-col relative overflow-hidden">
      <div className="px-4 py-2 border-b border-emerald-200/50 bg-white/60 backdrop-blur-sm flex justify-between items-center">
           <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
             {t.focusGarden}
           </span>
      </div>

      <div className="p-4 flex flex-col grow relative h-full">
            {isActive ? renderActiveFocus() : (
                <div className="h-full flex flex-col min-h-0">
                    {selectedEntityId ? renderActiveFocus() : renderSelection()}
                    
                    {!isActive && selectedEntityId && (
                            <button 
                            onClick={() => onSelectEntity('')} 
                            className="absolute top-2 right-2 text-[10px] font-bold text-slate-400 hover:text-emerald-600 underline z-20"
                            >
                            Change
                            </button>
                    )}
                </div>
            )}
            
            <div className="z-10 w-full mt-auto pt-2">
                <button
                onClick={onToggleFocus}
                disabled={!selectedEntityId && !isActive}
                className={`
                    w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all transform active:scale-[0.98] flex items-center justify-center gap-2
                    ${!selectedEntityId && !isActive ? 'bg-slate-200 cursor-not-allowed text-slate-400' : 
                        isActive 
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'}
                `}
                >
                {isActive ? (
                    <>
                    <Square className="w-4 h-4 fill-current" /> {t.stopFocus}
                    </>
                ) : (
                    <>
                    <Play className="w-4 h-4 fill-current" /> {t.plantTree}
                    </>
                )}
                </button>
            </div>
      </div>
    </div>
  );
};

export default FocusGarden;
