import Alea from 'alea'

// Genera una seed aleatoria de 6 caracteres hexadecimales
export function generateSeed(): string {
  const buffer = new Uint32Array(1)
  crypto.getRandomValues(buffer)
  return (buffer[0] & 0xffffff).toString(16).padStart(6, '0')
}

// Convierte una seed string a una función PRNG reproducible
// Esta función se pasa directamente a createNoise2D() de simplex-noise
export function seedToPrng(seed: string): () => number {
  return Alea(seed)
}

// Convierte una seed string a número (para otros usos que necesiten un número)
export function seedToNumber(seed: string): number {
  return parseInt(seed, 16)
}

// Valida que una seed tenga el formato correcto
export function isValidSeed(seed: string): boolean {
  return /^[0-9a-f]{6}$/.test(seed)
}