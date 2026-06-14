export const colors = {
  // Core palette (from the TodoToday logo)
  primary: '#F5A623', // sun gold
  primaryDark: '#E8941A',
  accent: '#FF8C42', // sunset orange
  secondary: '#5C4632', // horizon brown

  // Backgrounds
  background: '#FDF1E3', // cream
  surface: '#FFFFFF',
  surfaceAlt: '#FFF8EF',

  // Text
  text: '#3A2E22',
  textMuted: '#9A8A78',
  textOnPrimary: '#FFFFFF',

  // Status / feedback
  success: '#7CB342', // done green
  successLight: '#E3F1D4',
  border: '#F0E0CC',

  // Urgency colors
  urgencyHigh: '#E25C4A',
  urgencyModerate: '#F5A623',
  urgencyLow: '#7CB342',

  // Random "awesome colours" palette for todos
  todoPalette: [
    '#FF8C42', // sunset orange
    '#F5A623', // sun gold
    '#E25C4A', // coral red
    '#FF6B9D', // pink
    '#C06EFF', // violet
    '#5E60CE', // indigo
    '#4EA8DE', // sky blue
    '#48C9B0', // teal
    '#7CB342', // leaf green
    '#FFD23F', // sunflower yellow
  ],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '800' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodyBold: { fontSize: 16, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  button: { fontSize: 16, fontWeight: '700' as const },
};

export const urgencyColor = (urgency: 'low' | 'moderate' | 'high') => {
  switch (urgency) {
    case 'high':
      return colors.urgencyHigh;
    case 'moderate':
      return colors.urgencyModerate;
    default:
      return colors.urgencyLow;
  }
};

export const getRandomTodoColor = (): string => {
  const idx = Math.floor(Math.random() * colors.todoPalette.length);
  return colors.todoPalette[idx];
};
