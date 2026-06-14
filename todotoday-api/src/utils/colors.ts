// A curated palette of "awesome colours" that look good on a cream background.
// Used to randomly assign a default colour to new todos.
export const TODO_COLOR_PALETTE: string[] = [
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
];

export const getRandomTodoColor = (): string => {
  const idx = Math.floor(Math.random() * TODO_COLOR_PALETTE.length);
  return TODO_COLOR_PALETTE[idx];
};
