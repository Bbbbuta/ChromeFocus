import React, { useState } from 'react';
import { Task, TaskGroup } from '../types';
import { Plus, Trash2, Calendar, Clock, AlertCircle, List, Grid2X2, Check, X } from 'lucide-react';
import EisenhowerMatrix from './EisenhowerMatrix';
import { translations, Language } from '../translations';

const INITIAL_GROUPS: TaskGroup[] = [
  { id: 'g1', name: 'Work Projects', color: 'indigo' },
  { id: 'g2', name: 'Personal', color: 'emerald' },
  { id: 'g3', name: 'Learning', color: 'amber' },
];

const INITIAL_TASKS: Task[] = [
  { id: 't1', parentId: null, groupId: 'g1', title: 'Complete Chrome Extension', completed: false, importance: 9, urgency: 8, createdAt: Date.now() },
];

interface ToDoListProps {
    lang: Language;
}

const ToDoList: React.FC<ToDoListProps> = ({ lang }) => {
  const t = translations[lang];
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [groups] = useState<TaskGroup[]>(INITIAL_GROUPS);
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'time' | 'default'>('default');

  // New Task State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0].id);

  // Helper to translate group names dynamically if needed, 
  // but for now we map the initial IDs to keys or just display name.
  const getGroupName = (group: TaskGroup) => {
      if (group.id === 'g1') return t.workProjects;
      if (group.id === 'g2') return t.personal;
      if (group.id === 'g3') return t.learning;
      return group.name;
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    const idsToDelete = new Set<string>();
    const findChildren = (parentId: string) => {
      idsToDelete.add(parentId);
      tasks.filter(t => t.parentId === parentId).forEach(t => findChildren(t.id));
    };
    findChildren(id);
    setTasks(tasks.filter(t => !idsToDelete.has(t.id)));
  };

  const addTask = (parentId: string | null = null, groupId: string = selectedGroupId) => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      parentId,
      groupId,
      title: newTaskTitle,
      completed: false,
      importance: 5,
      urgency: 5,
      createdAt: Date.now(),
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const renderTaskItem = (task: Task, level: number = 0) => {
    const hasChildren = tasks.some(t => t.parentId === task.id);
    const isEditing = editingTask === task.id;

    return (
      <div key={task.id} className={`${level > 0 ? 'ml-6' : ''} mb-2`}>
        <div className={`
          flex flex-col p-3 rounded-lg border transition-all
          ${task.completed ? 'bg-slate-50 border-slate-100 opacity-70' : 'bg-white border-slate-200 hover:border-indigo-300'}
        `}>
          <div className="flex items-start gap-3">
            <button 
              onClick={() => toggleTask(task.id)}
              className={`mt-1 w-4 h-4 rounded border flex items-center justify-center transition-colors ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-emerald-500'}`}
            >
              {task.completed && <Check className="w-3 h-3 text-white" />}
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                 <span className={`text-sm font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                   {task.title}
                 </span>
                 <div className="flex gap-1">
                    {!isEditing && (
                      <button onClick={() => setEditingTask(task.id)} className="text-slate-400 hover:text-indigo-600">
                        <List className="w-3 h-3" />
                      </button>
                    )}
                    <button onClick={() => deleteTask(task.id)} className="text-slate-400 hover:text-rose-600">
                      <Trash2 className="w-3 h-3" />
                    </button>
                 </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                 {task.expectedStartTime && (
                   <span className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                     <Calendar className="w-3 h-3" /> 
                     {new Date(task.expectedStartTime).toLocaleDateString()}
                   </span>
                 )}
                 {task.expectedDuration && (
                   <span className="flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                     <Clock className="w-3 h-3" /> {task.expectedDuration}m
                   </span>
                 )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-500 mb-1">{t.title}</label>
                <input 
                  type="text" 
                  value={task.title}
                  onChange={(e) => updateTask(task.id, { title: e.target.value })}
                  className="w-full p-1 border rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">{t.startTime}</label>
                <input 
                  type="datetime-local" 
                  value={task.expectedStartTime || ''}
                  onChange={(e) => updateTask(task.id, { expectedStartTime: e.target.value })}
                  className="w-full p-1 border rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">{t.duration}</label>
                <input 
                  type="number" 
                  value={task.expectedDuration || ''}
                  onChange={(e) => updateTask(task.id, { expectedDuration: parseInt(e.target.value) || 0 })}
                  className="w-full p-1 border rounded text-xs"
                />
              </div>
              <div>
                 <label className="block text-slate-500 mb-1">{t.importance} (1-10)</label>
                 <input 
                    type="range" min="1" max="10" 
                    value={task.importance}
                    onChange={(e) => updateTask(task.id, { importance: parseInt(e.target.value) })}
                    className="w-full accent-indigo-600"
                 />
              </div>
              <div>
                 <label className="block text-slate-500 mb-1">{t.urgency} (1-10)</label>
                 <input 
                    type="range" min="1" max="10" 
                    value={task.urgency}
                    onChange={(e) => updateTask(task.id, { urgency: parseInt(e.target.value) })}
                    className="w-full accent-orange-500"
                 />
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                 <button 
                  onClick={() => {
                     setNewTaskTitle('New Subtask');
                     addTask(task.id, task.groupId);
                  }}
                  className="px-2 py-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200"
                 >
                   {t.subtask}
                 </button>
                 <button onClick={() => setEditingTask(null)} className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">{t.done}</button>
              </div>
            </div>
          )}
        </div>

        {hasChildren && (
          <div className="mt-2 border-l-2 border-slate-100 pl-0">
             {tasks
                .filter(t => t.parentId === task.id)
                .sort((a,b) => (b.importance - a.importance))
                .map(sub => renderTaskItem(sub, level + 1))
             }
          </div>
        )}
      </div>
    );
  };

  const sortedTopLevelTasks = tasks
    .filter(t => t.parentId === null)
    .sort((a, b) => {
        if (sortBy === 'time') {
            const timeA = a.expectedStartTime ? new Date(a.expectedStartTime).getTime() : Infinity;
            const timeB = b.expectedStartTime ? new Date(b.expectedStartTime).getTime() : Infinity;
            return timeA - timeB;
        }
        return b.importance - a.importance;
    });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <List className="w-5 h-5 text-indigo-600" /> {t.tasks}
            </h3>
            <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}`}
                >
                    <List className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('matrix')}
                  className={`p-1.5 rounded ${viewMode === 'matrix' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}`}
                >
                    <Grid2X2 className="w-4 h-4" />
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
            {viewMode === 'matrix' ? (
                <div className="h-full flex flex-col gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 mb-2 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {t.matrixAlert}
                  </div>
                  <EisenhowerMatrix tasks={tasks} onTaskClick={(t) => setEditingTask(t.id)} />
                  {editingTask && (
                      <div className="p-2 bg-white border rounded shadow-lg">
                          <div className="flex justify-between items-center mb-2">
                             <span className="font-bold text-xs">{t.quickEdit}</span>
                             <button onClick={() => setEditingTask(null)}><X className="w-3 h-3" /></button>
                          </div>
                          <p className="text-xs mb-2">Editing: {tasks.find(t => t.id === editingTask)?.title}</p>
                          <div className="grid grid-cols-2 gap-2">
                             <input 
                                type="range" min="1" max="10" 
                                value={tasks.find(t => t.id === editingTask)?.importance || 5}
                                onChange={(e) => updateTask(editingTask, { importance: parseInt(e.target.value) })}
                             />
                             <input 
                                type="range" min="1" max="10" 
                                value={tasks.find(t => t.id === editingTask)?.urgency || 5}
                                onChange={(e) => updateTask(editingTask, { urgency: parseInt(e.target.value) })}
                             />
                          </div>
                      </div>
                  )}
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex gap-2">
                        <select 
                            value={selectedGroupId} 
                            onChange={(e) => setSelectedGroupId(e.target.value)}
                            className="bg-white border border-slate-200 text-xs rounded px-2 py-2 outline-none focus:border-indigo-500"
                        >
                            {groups.map(g => <option key={g.id} value={g.id}>{getGroupName(g)}</option>)}
                        </select>
                        <input 
                            type="text" 
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addTask()}
                            placeholder={t.addTaskPlaceholder}
                            className="flex-1 border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        <button 
                            onClick={() => addTask()}
                            className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{t.sortBy}</span>
                        <button 
                            onClick={() => setSortBy('default')}
                            className={`px-2 py-1 rounded ${sortBy === 'default' ? 'bg-slate-200 text-slate-800' : 'hover:bg-slate-100'}`}
                        >
                            {t.priority}
                        </button>
                        <button 
                            onClick={() => setSortBy('time')}
                            className={`px-2 py-1 rounded ${sortBy === 'time' ? 'bg-slate-200 text-slate-800' : 'hover:bg-slate-100'}`}
                        >
                            {t.startTime}
                        </button>
                    </div>

                    {groups.map(group => {
                        const groupTasks = sortedTopLevelTasks.filter(t => t.groupId === group.id);
                        if (groupTasks.length === 0) return null;

                        return (
                            <div key={group.id}>
                                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 text-${group.color}-600`}>
                                    {getGroupName(group)}
                                </h4>
                                <div>
                                    {groupTasks.map(task => renderTaskItem(task))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
  );
};

export default ToDoList;
