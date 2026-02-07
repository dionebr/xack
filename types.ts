
export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export enum NotificationType {
  SYSTEM = 'System',
  SOCIAL = 'Social',
  RANK = 'Rank',
  CHALLENGE = 'Challenge'
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  unlockedAt?: string;
}

export interface Match {
  id: string;
  playerA: { name: string; avatar: string; progress: number };
  playerB: { name: string; avatar: string; progress: number };
  machine: string;
  status: 'Live' | 'Finished';
  timeElapsed: string;
}

export interface HallOfFamer {
  rank: number;
  name: string;
  avatar: string;
  totalXp: string;
  achievements: number;
  joinedYear: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface Machine {
  id: string;
  name: string;
  difficulty: Difficulty;
  os: 'Linux' | 'Windows';
  xp: number;
  solves: string;
  progress: number;
  ip?: string;
  image: string;
  icon: string;
}

export interface UserStats {
  xp: number;
  rank: string;
  machines: number;
  accuracy: string;
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  time: string;
  points: string;
  avatar: string;
}
