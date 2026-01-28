import React from 'react';
import { Language } from './translations';

export interface BlockData {
  id: number;
  startTime: string;
  endTime: string;
  activity: string;
  isCurrent: boolean;
  status: 'pending' | 'active' | 'completed' | 'missed';
  focusScore?: number; // 0-100
}

export enum FocusModeType {
  POMODORO = 'POMODORO',
  FARM = 'FARM',
  NONE = 'NONE'
}

export interface GeminiSummaryRequest {
  historyItems: string[];
}

export interface TaskGroup {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  parentId: string | null;
  groupId: string;
  title: string;
  completed: boolean;
  expectedStartTime?: string; // ISO Date string
  expectedDuration?: number; // minutes
  importance: number; // 1-10
  urgency: number; // 1-10
  createdAt: number;
}

// --- New Types for Focus Garden ---

export type FocusEntityType = 'PLANT' | 'ANIMAL';

export interface FocusEntityOption {
  id: string;
  type: FocusEntityType;
  nameKey: string; // Key for translation if needed, or just string
  icon: React.ReactNode;
}

export interface GardenItem {
  id: string;
  entityId: string; // which plant/animal
  type: FocusEntityType;
  name: string;
  plantedAt: number;
  completedAt: number;
}
