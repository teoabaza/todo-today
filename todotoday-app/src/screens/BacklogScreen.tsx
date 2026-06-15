import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, Inbox } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '../theme/theme';
import { TodoItem } from '../components/TodoItem';
import { getBacklogTodos, updateTodo, Todo } from '../api/todos';
import { getTodayString } from '../utils/date';
import { ApiError } from '../api/client';

export const BacklogScreen = ({ navigation }: any) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTodos = useCallback(async () => {
    try {
      const { todos } = await getBacklogTodos();
      setTodos(todos);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load todos';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTodos();
    }, [loadTodos])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadTodos();
  };

  const handleToggleDone = async (todo: Todo) => {
    const newStatus = todo.status === 'done' ? 'not_started' : 'done';
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, status: newStatus } : t))
    );
    try {
      await updateTodo(todo.id, { status: newStatus });
    } catch (err) {
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, status: todo.status } : t))
      );
      const message = err instanceof ApiError ? err.message : 'Failed to update todo';
      Alert.alert('Error', message);
    }
  };

  const handleAddToToday = async (todo: Todo) => {
    const today = getTodayString();
    // Optimistically remove from the backlog list
    setTodos((prev) => prev.filter((t) => t.id !== todo.id));
    try {
      await updateTodo(todo.id, { date: today });
    } catch (err) {
      // Revert on failure
      setTodos((prev) => [...prev, todo]);
      const message = err instanceof ApiError ? err.message : 'Failed to update todo';
      Alert.alert('Error', message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Someday</Text>
        <Text style={styles.subtitle}>Things you'll get to eventually</Text>
      </View>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TodoItem
            todo={item}
            onToggleDone={handleToggleDone}
            onPress={(t) => navigation.navigate('AddTodo', { todoId: t.id })}
            onQuickAddToday={handleAddToToday}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Inbox size={40} color={colors.textMuted} strokeWidth={1.5} />
              <Text style={styles.emptyText}>Your someday list is empty</Text>
              <Text style={styles.emptySubtext}>
                Add things you want to do but haven't scheduled yet
              </Text>
            </View>
          ) : null
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTodo', { date: null })}
        activeOpacity={0.85}
      >
        <Plus size={26} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  empty: {
    marginTop: spacing.xxl,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});
