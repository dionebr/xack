
import { Machine, Difficulty, Activity, Notification, NotificationType, Badge, Match, HallOfFamer } from './types';

export const BADGES_DATA: Badge[] = [
  { id: 'b1', name: 'First Root', description: 'Gained administrative access to your first machine.', icon: 'military_tech', rarity: 'Common', unlockedAt: '2023-11-05' },
  { id: 'b2', name: 'Ghost in Shell', description: 'Completed a Hard machine without using hints.', icon: 'visibility_off', rarity: 'Epic', unlockedAt: '2024-01-12' },
  { id: 'b3', name: 'Windows Master', description: 'Owned 10 unique Windows Server instances.', icon: 'grid_view', rarity: 'Rare', unlockedAt: '2024-02-20' },
  { id: 'b4', name: 'Cyber Sentinel', description: 'Maintain top 100 rank for 3 consecutive months.', icon: 'workspace_premium', rarity: 'Legendary' }
];

export const ARENA_MATCHES: Match[] = [
  { 
    id: 'm1', 
    machine: 'Reader', 
    status: 'Live', 
    timeElapsed: '12:45',
    playerA: { name: 'CyberGhost', avatar: 'https://picsum.photos/seed/user/40/40', progress: 75 },
    playerB: { name: 'r00t_kit', avatar: 'https://picsum.photos/seed/root/40/40', progress: 82 }
  },
  { 
    id: 'm2', 
    machine: 'Vault-X', 
    status: 'Live', 
    timeElapsed: '05:20',
    playerA: { name: 'LeonardoR', avatar: 'https://picsum.photos/seed/leo/40/40', progress: 15 },
    playerB: { name: 'm4n1p', avatar: 'https://picsum.photos/seed/m4n1p/40/40', progress: 20 }
  }
];

export const HALL_OF_FAME_DATA: HallOfFamer[] = [
  { rank: 1, name: 'm4n1p', avatar: 'https://picsum.photos/seed/m4n1p/100/100', totalXp: '1.2M', achievements: 84, joinedYear: '2021' },
  { rank: 2, name: 'GhostProtocol', avatar: 'https://picsum.photos/seed/gp/100/100', totalXp: '980K', achievements: 72, joinedYear: '2022' },
  { rank: 3, name: 'RootLord', avatar: 'https://picsum.photos/seed/rl/100/100', totalXp: '850K', achievements: 68, joinedYear: '2021' },
  { rank: 4, name: 'Alkarramax', avatar: 'https://picsum.photos/seed/alk/100/100', totalXp: '720K', achievements: 55, joinedYear: '2023' }
];

// ... rest of MACHINES_DATA and ACTIVITIES from previous file
export const NOTIFICATIONS_DATA: Notification[] = [
  { id: '1', type: NotificationType.RANK, title: 'Rank Alert', message: 'm4n1p just surpassed your XP. Get hacking to reclaim your spot!', time: '2m ago', read: false, priority: 'high' },
  { id: '2', type: NotificationType.CHALLENGE, title: 'New Machine Release', message: 'Machine "Cloud-Drifter" (Hard) is now active in the Labs section.', time: '1h ago', read: false, priority: 'medium' },
  { id: '3', type: NotificationType.SOCIAL, title: 'New Message', message: 'r00t_kit sent you a collaboration request for AD-Basics.', time: '3h ago', read: true, priority: 'low' },
  { id: '4', type: NotificationType.SYSTEM, title: 'System Update', message: 'Kernel 2.4.0 patch deployed successfully. All nodes operational.', time: '5h ago', read: true, priority: 'low' }
];

export const MACHINES_DATA: Machine[] = [
  { id: '1', name: 'Reader', difficulty: Difficulty.EASY, os: 'Linux', xp: 200, solves: '8.2k', progress: 100, ip: '10.10.11.243', image: 'https://picsum.photos/seed/reader/600/300', icon: 'folder_zip' },
  { id: '2', name: 'Web-Hunter', difficulty: Difficulty.MEDIUM, os: 'Linux', xp: 450, solves: '3.1k', progress: 45, image: 'https://picsum.photos/seed/hunter/600/300', icon: 'language' },
  { id: '3', name: 'Vault-X', difficulty: Difficulty.HARD, os: 'Linux', xp: 800, solves: '1.2k', progress: 0, image: 'https://picsum.photos/seed/vault/600/300', icon: 'database' },
  { id: '4', name: 'AD-Basics', difficulty: Difficulty.EASY, os: 'Windows', xp: 250, solves: '12k', progress: 100, image: 'https://picsum.photos/seed/ad/600/300', icon: 'shield' },
  { id: '5', name: 'Secret-Auth', difficulty: Difficulty.MEDIUM, os: 'Linux', xp: 500, solves: '942', progress: 12, image: 'https://picsum.photos/seed/auth/600/300', icon: 'vpn_key' },
  { id: '6', name: 'Sky-Breaker', difficulty: Difficulty.HARD, os: 'Linux', xp: 1200, solves: '42', progress: 0, image: 'https://picsum.photos/seed/sky/600/300', icon: 'cloud' }
];

export const ACTIVITIES: Activity[] = [
  { id: 'act1', user: 'Carlos Vieira', action: 'Dominated User Flag', time: '03/18/2021', points: '+20XP', avatar: 'https://picsum.photos/seed/carlos/40/40' },
  { id: 'act2', user: 'bruno castelo', action: 'Dominated User Flag', time: '03/17/2021', points: '+20XP', avatar: 'https://picsum.photos/seed/bruno/40/40' },
  { id: 'act3', user: 'Leonardo Rangel', action: 'Dominated Root Flag', time: '03/16/2021', points: '+220XP', avatar: 'https://picsum.photos/seed/leo/40/40' },
  { id: 'act4', user: 'Alkarramax Junior', action: 'Dominated User Flag', time: '03/16/2021', points: '+100XP', avatar: 'https://picsum.photos/seed/alk/40/40' }
];
