export interface LegoColorDefinition {
  id: number;
  name: string;
  hex: string;
  category: string;
}

export const LEGO_PALETTE: ReadonlyArray<LegoColorDefinition> = [
  { id: 1, name: 'White', hex: '#FFFFFF', category: 'solid' },
  { id: 26, name: 'Black', hex: '#1B2A34', category: 'solid' },
  { id: 37, name: 'Bright Green', hex: '#4B9F4A', category: 'solid' },
  { id: 138, name: 'Dark Tan', hex: '#958A73', category: 'solid' },
  { id: 194, name: 'Medium Stone Grey', hex: '#9C9291', category: 'solid' }
];

export function getLegoColorIdByName(name: string): number {
  const match = LEGO_PALETTE.find((c) => c.name.toLowerCase() === name.toLowerCase());
  if (!match) {
    throw new Error(
      `Unknown LEGO color "${name}". Available colors: ${LEGO_PALETTE.map((c) => `"${c.name}"`).join(', ')}`
    );
  }
  return match.id;
}
