import { BirdConfig, BirdType } from '../types';

export const BIRD_CONFIGS: Record<BirdType, BirdConfig> = {
  0: {
    id: 0,
    name: 'Burung Biasa',
    color: '#e53935',
    secondaryColor: '#b71c1c',
    radius: 0.58,
    power: 'none',
    powerName: 'Tiada Kuasa Khas',
    desc: 'Burung asas lastik. Jawab soalan matematik dengan betul untuk membuka Burung Berkuasa rawak!',
    icon: '🎯'
  },
  1: {
    id: 1,
    name: 'Burung Pantas',
    color: '#ffeb3b',
    secondaryColor: '#f57f17',
    radius: 0.55,
    power: 'boost',
    powerName: 'Pecutan Turbo',
    desc: 'Tekan butang atau ketik skrin semasa terbang untuk pecutan laju ke hadapan!',
    icon: '⚡'
  },
  2: {
    id: 2,
    name: 'Burung Berat',
    color: '#d32f2f',
    secondaryColor: '#b71c1c',
    radius: 0.75,
    power: 'slam',
    powerName: 'Hentaman Berat',
    desc: 'Tekan butang untuk menjunam laju ke bawah dan meremukkan struktur konkrit!',
    icon: '🪨'
  },
  3: {
    id: 3,
    name: 'Burung Berpecah',
    color: '#00b0ff',
    secondaryColor: '#0091ea',
    radius: 0.45,
    power: 'split',
    powerName: 'Serangan 3 Burung',
    desc: 'Tekan butang untuk berpecah kepada 3 ekor anak burung serentak!',
    icon: '🔱'
  },
  4: {
    id: 4,
    name: 'Burung Bom',
    color: '#212121',
    secondaryColor: '#ff5722',
    radius: 0.65,
    power: 'bomb',
    powerName: 'Letupan Tenaga',
    desc: 'Tekan butang untuk mencetuskan letupan gelombang kejut yang melontar blok sekeliling!',
    icon: '💣'
  },
  5: {
    id: 5,
    name: 'Burung Boomerang',
    color: '#00c853',
    secondaryColor: '#1b5e20',
    radius: 0.55,
    power: 'boomerang',
    powerName: 'Putaran Boomerang',
    desc: 'Tekan butang untuk melengkung berpatah balik ke belakang sasaran tersorok!',
    icon: '🪃'
  }
};

/**
 * Returns a random power bird (ID 1 to 5)
 */
export function getRandomPowerBirdType(): BirdType {
  const powerBirds: BirdType[] = [1, 2, 3, 4, 5];
  const idx = Math.floor(Math.random() * powerBirds.length);
  return powerBirds[idx];
}

/**
 * Assigns an appropriate bird type depending on the level and round.
 * At the start of any level (round 0), players ALWAYS start with Burung Biasa (0).
 */
export function getBirdTypeForLevel(_level: number, roundIndex: number): BirdType {
  // If round 0 (start of level), always Burung Biasa
  if (roundIndex === 0) return 0;
  return getRandomPowerBirdType();
}
