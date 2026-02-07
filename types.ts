
export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
  INSANE = 'Insane'
}

export enum NotificationType {
  SYSTEM = 'System',
  SOCIAL = 'Social',
  RANK = 'Rank',
  CHALLENGE = 'Challenge'
}

export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string;
  rank_title: string;
  total_xp: number;
  level: number;
  is_admin: boolean;
  is_verified: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  unlocked_at?: string;
}

export interface Match {
  id: string;
  machine_id: number;
  machine_name: string;
  player_a: { id: number; name: string; avatar: string; progress: number };
  player_b: { id: number; name: string; avatar: string; progress: number };
  status: 'Searching' | 'Live' | 'Finished' | 'Canceled';
  time_elapsed: string;
  started_at: string;
}

export interface HallOfFamer {
  rank: number;
  name: string;
  avatar: string;
  total_xp: string;
  achievements: number;
  joined_year: string;
}

export interface Notification {
  id: string;
  user_id: number;
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
  os: 'Linux' | 'Windows' | 'Android' | 'Other';
  xp: number;
  solves: string;
  progress: number;
  ip?: string;
  image: string;
  icon: string;
  description?: string;
}

export interface Activity {
  id: string;
  user_id: number;
  user_name: string;
  action: string;
  time: string;
  points: string;
  avatar: string;
}

export interface Subscription {
  id: number;
  user_id: number;
  plan_name: 'Operative' | 'Vanguard' | 'Nightfall';
  status: 'Active' | 'Canceled' | 'Past Due' | 'Expired';
  next_renewal_at: string;
}
