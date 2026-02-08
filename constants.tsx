
import { Machine, Difficulty, Activity, Notification, NotificationType, Badge, Match, HallOfFamer } from './types';

export const BADGES_DATA: Badge[] = [
  // Fix: changed unlockedAt to unlocked_at
  { id: 'b1', name: 'First Root', description: 'Gained administrative access to your first machine.', icon: 'military_tech', rarity: 'Common', unlocked_at: '2023-11-05' },
  // Fix: changed unlockedAt to unlocked_at
  { id: 'b2', name: 'Ghost in Shell', description: 'Completed a Hard machine without using hints.', icon: 'visibility_off', rarity: 'Epic', unlocked_at: '2024-01-12' },
  // Fix: changed unlockedAt to unlocked_at
  { id: 'b3', name: 'Windows Master', description: 'Owned 10 unique Windows Server instances.', icon: 'grid_view', rarity: 'Rare', unlocked_at: '2024-02-20' },
  { id: 'b4', name: 'Cyber Sentinel', description: 'Maintain top 100 rank for 3 consecutive months.', icon: 'workspace_premium', rarity: 'Legendary' }
];

export const ARENA_MATCHES: Match[] = [
  {
    id: 'm1',
    // Fix: added machine_id and changed machine to machine_name, playerA/B to player_a/b, timeElapsed to time_elapsed, and added started_at
    machine_id: 1,
    machine_name: 'Reader',
    status: 'Live',
    time_elapsed: '12:45',
    started_at: '2024-03-20T10:00:00Z',
    player_a: { id: 101, name: 'CyberGhost', avatar: 'https://picsum.photos/seed/user/40/40', progress: 75 },
    player_b: { id: 102, name: 'r00t_kit', avatar: 'https://picsum.photos/seed/root/40/40', progress: 82 }
  },
  {
    id: 'm2',
    // Fix: added machine_id and changed machine to machine_name, playerA/B to player_a/b, timeElapsed to time_elapsed, and added started_at
    machine_id: 3,
    machine_name: 'Vault-X',
    status: 'Live',
    time_elapsed: '05:20',
    started_at: '2024-03-20T10:10:00Z',
    player_a: { id: 103, name: 'LeonardoR', avatar: 'https://picsum.photos/seed/leo/40/40', progress: 15 },
    player_b: { id: 104, name: 'm4n1p', avatar: 'https://picsum.photos/seed/m4n1p/40/40', progress: 20 }
  }
];

export const HALL_OF_FAME_DATA: HallOfFamer[] = [
  // Fix: changed totalXp to total_xp and joinedYear to joined_year
  { rank: 1, name: 'm4n1p', avatar: 'https://picsum.photos/seed/m4n1p/100/100', total_xp: '1.2M', achievements: 84, joined_year: '2021' },
  { rank: 2, name: 'GhostProtocol', avatar: 'https://picsum.photos/seed/gp/100/100', total_xp: '980K', achievements: 72, joined_year: '2022' },
  { rank: 3, name: 'RootLord', avatar: 'https://picsum.photos/seed/rl/100/100', total_xp: '850K', achievements: 68, joined_year: '2021' },
  { rank: 4, name: 'Alkarramax', avatar: 'https://picsum.photos/seed/alk/100/100', total_xp: '720K', achievements: 55, joined_year: '2023' }
];

// ... rest of MACHINES_DATA and ACTIVITIES from previous file
export const NOTIFICATIONS_DATA: Notification[] = [
  // Fix: added user_id to notifications
  { id: '1', user_id: 1, type: NotificationType.RANK, title: 'Rank Alert', message: 'm4n1p just surpassed your XP. Get hacking to reclaim your spot!', time: '2m ago', read: false, priority: 'high' },
  { id: '2', user_id: 1, type: NotificationType.CHALLENGE, title: 'New Machine Release', message: 'Machine "Cloud-Drifter" (Hard) is now active in the Labs section.', time: '1h ago', read: false, priority: 'medium' },
  { id: '3', user_id: 1, type: NotificationType.SOCIAL, title: 'New Message', message: 'r00t_kit sent you a collaboration request for AD-Basics.', time: '3h ago', read: true, priority: 'low' },
  { id: '4', user_id: 1, type: NotificationType.SYSTEM, title: 'System Update', message: 'Kernel 2.4.0 patch deployed successfully. All nodes operational.', time: '5h ago', read: true, priority: 'low' }
];

export const MACHINES_DATA: Machine[] = [
  { id: '1', name: 'Reader', difficulty: Difficulty.EASY, os: 'Linux', xp: 200, solves: '8.2k', progress: 100, ip: '10.10.11.243', image: 'https://picsum.photos/seed/reader/600/300', icon: 'folder_zip' },
  { id: '2', name: 'Web-Hunter', difficulty: Difficulty.MEDIUM, os: 'Linux', xp: 450, solves: '3.1k', progress: 45, image: 'https://picsum.photos/seed/hunter/600/300', icon: 'language' },
  { id: '3', name: 'ARTEMIS I', difficulty: Difficulty.MEDIUM, os: 'Linux', xp: 1000, solves: '156', progress: 0, ip: '10.10.11.50', image: '/assets/machines/artemis-i.png', icon: 'satellite' },
  { id: '4', name: 'Vault-X', difficulty: Difficulty.HARD, os: 'Linux', xp: 800, solves: '1.2k', progress: 0, image: 'https://picsum.photos/seed/vault/600/300', icon: 'database' },
  { id: '5', name: 'AD-Basics', difficulty: Difficulty.EASY, os: 'Windows', xp: 250, solves: '12k', progress: 100, image: 'https://picsum.photos/seed/ad/600/300', icon: 'shield' },
  { id: '6', name: 'Secret-Auth', difficulty: Difficulty.MEDIUM, os: 'Linux', xp: 500, solves: '942', progress: 12, image: 'https://picsum.photos/seed/auth/600/300', icon: 'vpn_key' },
  { id: '7', name: 'Sky-Breaker', difficulty: Difficulty.HARD, os: 'Linux', xp: 1200, solves: '42', progress: 0, image: 'https://picsum.photos/seed/sky/600/300', icon: 'cloud' }
];

export const ACTIVITIES: Activity[] = [
  // Fix: changed user to user_name and added user_id
  { id: 'act1', user_id: 1, user_name: 'Carlos Vieira', action: 'Dominated User Flag', time: '03/18/2021', points: '+20XP', avatar: 'https://picsum.photos/seed/carlos/40/40' },
  { id: 'act2', user_id: 1, user_name: 'bruno castelo', action: 'Dominated User Flag', time: '03/17/2021', points: '+20XP', avatar: 'https://picsum.photos/seed/bruno/40/40' },
  { id: 'act3', user_id: 1, user_name: 'Leonardo Rangel', action: 'Dominated Root Flag', time: '03/16/2021', points: '+220XP', avatar: 'https://picsum.photos/seed/leo/40/40' },
  { id: 'act4', user_id: 1, user_name: 'Alkarramax Junior', action: 'Dominated User Flag', time: '03/16/2021', points: '+100XP', avatar: 'https://picsum.photos/seed/alk/40/40' }
];
