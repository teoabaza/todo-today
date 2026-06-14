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
  danger: '#E25C4A',

  // Urgency colors
  urgencyHigh: '#E25C4A',
  urgencyModerate: '#F5A623',
  urgencyLow: '#7CB342',

  // "Awesome colours" palette for todos - vivid but balanced
  todoPalette: [
    '#FF8C42', // sunset orange
    '#F5A623', // sun gold
    '#E25C4A', // coral red
    '#EC6FA3', // pink
    '#9B7EDE', // violet
    '#5E60CE', // indigo
    '#4EA8DE', // sky blue
    '#3FB8AF', // teal
    '#7CB342', // leaf green
    '#F2C14E', // sunflower yellow
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
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 21, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyBold: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  button: { fontSize: 15, fontWeight: '600' as const, letterSpacing: 0.2 },
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
