// Seeded random number generator for deterministic behavior
export class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }

  // Linear congruential generator
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  // Random float between min and max
  range(min, max) {
    return min + this.next() * (max - min);
  }
}

// Generate a seed from a string (habit ID + date)
export function generateSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
