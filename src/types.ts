export type SPType = 'SP 3.1.4' | 'SP 3.1.5' | 'Bab 3 KSSM';

export interface Question {
  id: string;
  q: string;
  opts: string[];
  a: string;
  exp: string;
  sp: SPType;
}

export type BirdType = 0 | 1 | 2 | 3 | 4 | 5;

export interface BirdConfig {
  id: BirdType;
  name: string;
  color: string;
  secondaryColor: string;
  radius: number;
  power: 'none' | 'boost' | 'slam' | 'split' | 'bomb' | 'boomerang';
  powerName: string;
  desc: string;
  icon: string;
}

export interface StudentRecord {
  id: string;
  date: string;
  name: string;
  class: string;
  level: number;
  score: number;
  stars: number;
  accuracy: number;
  mode: 'individu' | 'kumpulan';
}

export interface LevelProgress {
  unlockedLevel: number;
  levelStars: Record<number, number>; // level -> stars (1-3)
  highScores: Record<number, number>; // level -> high score
}

export type GameState = 
  | 'start'
  | 'level_select'
  | 'question'
  | 'aiming'
  | 'flying'
  | 'round_result'
  | 'level_clear'
  | 'teacher_portal';
