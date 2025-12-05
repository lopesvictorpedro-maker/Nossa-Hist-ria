export interface Memory {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
  mood: 'romantic' | 'funny' | 'adventure' | 'cozy';
}

export enum Mood {
  ROMANTIC = 'romantic',
  FUNNY = 'funny',
  ADVENTURE = 'adventure',
  COZY = 'cozy'
}

export const MOOD_EMOJIS: Record<Mood, string> = {
  [Mood.ROMANTIC]: '❤️',
  [Mood.FUNNY]: '😂',
  [Mood.ADVENTURE]: '🌍',
  [Mood.COZY]: '☕',
};

export const MOOD_LABELS: Record<Mood, string> = {
  [Mood.ROMANTIC]: 'Romântico',
  [Mood.FUNNY]: 'Divertido',
  [Mood.ADVENTURE]: 'Aventura',
  [Mood.COZY]: 'Aconchegante',
};