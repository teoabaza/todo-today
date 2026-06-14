import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radii, spacing, typography, urgencyColor } from '../theme/theme';
import { Todo } from '../api/todos';

interface TodoItemProps {
  todo: Todo;
  onToggleDone: (todo: Todo) => void;
  onPress?: (todo: Todo) => void;
}

const statusLabel = (status: Todo['status']) => {
  switch (status) {
    case 'in_progress':
      return 'In Progress';
    case 'done':
      return 'Done';
    default:
      return 'Not Started';
  }
};

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggleDone, onPress }) => {
  const isDone = todo.status === 'done';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderLeftColor: todo.color },
        isDone && styles.containerDone,
      ]}
      onPress={() => onPress?.(todo)}
      activeOpacity={0.85}
    >
      <TouchableOpacity
        style={[
          styles.checkbox,
          { borderColor: isDone ? colors.success : todo.color },
          isDone && styles.checkboxDone,
        ]}
        onPress={() => onToggleDone(todo)}
        activeOpacity={0.7}
      >
        {isDone && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      <View style={styles.content}>
        <Text
          style={[styles.description, isDone && styles.descriptionDone]}
          numberOfLines={2}
        >
          {todo.description}
        </Text>

        <View style={styles.metaRow}>
          <View style={[styles.urgencyDot, { backgroundColor: urgencyColor(todo.urgency) }]} />
          <Text style={styles.metaText}>
            {todo.urgency.charAt(0).toUpperCase() + todo.urgency.slice(1)} · {statusLabel(todo.status)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderLeftWidth: 6,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  containerDone: {
    backgroundColor: colors.successLight,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxDone: {
    backgroundColor: colors.success,
  },
  checkmark: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  description: {
    ...typography.bodyBold,
    color: colors.text,
  },
  descriptionDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
