
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Hint {
  id: string;
  text: string;
  cost: number;
  isUnlocked: boolean;
}

export interface Machine {
  id: string;
  name: string;
  description: string;
  image: string;
  difficulty: Difficulty;
  os: 'Linux' | 'Windows';
  points: number;
  author: string;
  releaseDate: string;
  solves: number;
  avgTime: string;
  hints?: Hint[];
  hasWriteup?: boolean;
}

export interface Path {
  id: string;
  title: string;
  level: string;
  progress: number;
  challenges: number;
  icon: string;
  color: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  type: 'CHAMPIONSHIP' | 'WORKSHOP' | 'WEBINAR' | 'CTF';
  prizePool?: string;
  registeredTeams?: number;
}

export interface User {
  username: string;
  level: number;
  badges: number;
  rank: number;
  avatar: string;
  score: number;
  country: string;
}

export interface News {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string;
  summary: string;
}

export interface AuditLog {
  id: string;
  action: string;
  timestamp: string;
  ip: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL';
}
