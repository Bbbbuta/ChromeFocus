import React from 'react';
import { Task } from '../types';

interface EisenhowerMatrixProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const EisenhowerMatrix: React.FC<EisenhowerMatrixProps> = ({ tasks, onTaskClick }) => {
  // Filter out completed tasks for the matrix usually, but let's keep them optional or just active
  const activeTasks = tasks.filter(t => !t.completed);

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm aspect-square relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 z-0">
        {/* Quadrant Backgrounds */}
        <div className="bg-orange-50/50 border-r border-b border-slate-200 p-2 text-xs font-bold text-orange-400 uppercase tracking-widest text-right">Schedule</div>
        <div className="bg-red-50/50 border-b border-slate-200 p-2 text-xs font-bold text-red-500 uppercase tracking-widest text-right">Do Now</div>
        <div className="bg-slate-50/50 border-r border-slate-200 p-2 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Delete</div>
        <div className="bg-blue-50/50 p-2 text-xs font-bold text-blue-400 uppercase tracking-widest text-right">Delegate</div>
      </div>

      {/* Axis Labels */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-slate-400 font-mono tracking-widest z-0 origin-center">
        IMPORTANCE (0-10)
      </div>
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-mono tracking-widest z-0">
        URGENCY (0-10)
      </div>

      {/* Plot Area */}
      <div className="relative w-full h-full z-10 m-4">
        {activeTasks.map((task) => {
          // Normalize 0-10 to percentage 0-100
          // X-axis: Urgency (0 left, 10 right)
          // Y-axis: Importance (0 bottom, 10 top)
          const left = (task.urgency / 10) * 100;
          const bottom = (task.importance / 10) * 100;

          // Clamp values to stay inside the box slightly (avoid overflow)
          const clampedLeft = Math.max(0, Math.min(95, left));
          const clampedBottom = Math.max(0, Math.min(95, bottom));

          return (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className="absolute transform -translate-x-1/2 translate-y-1/2 cursor-pointer group hover:z-50"
              style={{ left: `${clampedLeft}%`, bottom: `${clampedBottom}%` }}
            >
              <div 
                className={`
                  w-3 h-3 rounded-full border-2 border-white shadow-sm transition-all group-hover:scale-150
                  ${task.importance > 5 && task.urgency > 5 ? 'bg-red-500' : 
                    task.importance > 5 ? 'bg-orange-500' :
                    task.urgency > 5 ? 'bg-blue-500' : 'bg-slate-400'}
                `} 
              />
              {/* Tooltip */}
              <div className="hidden group-hover:block absolute bottom-4 left-1/2 -translate-x-1/2 w-max max-w-[150px] bg-slate-800 text-white text-[10px] p-2 rounded z-50 truncate">
                {task.title} (I:{task.importance}, U:{task.urgency})
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EisenhowerMatrix;
