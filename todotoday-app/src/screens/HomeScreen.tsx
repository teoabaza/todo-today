import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, radii } from '../theme/theme';
import { TodoItem } from '../components/TodoItem';
import { getTodosByDate, updateTodo, Todo } from '../api/todos';
import { getTodayString, formatFriendlyDate } from '../utils/date';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

export const HomeScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const today = getTodayString();

  const loadTodos = useCallback(async () => {
    try {
      const { todos } = await getTodosByDate(today);
      setTodos(todos);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load todos';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [today]);

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
    // Optimistic update
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, status: newStatus } : t))
    );
    try {
      await updateTodo(todo.id, { status: newStatus });
    } catch (err) {
      // Revert on failure
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, status: todo.status } : t))
      );
      const message = err instanceof ApiError ? err.message : 'Failed to update todo';
      Alert.alert('Error', message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hi{user?.name ? `, ${user.name}` : ''} 👋
          </Text>
          <Text style={styles.date}>{formatFriendlyDate(today)}</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Log out</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TodoItem todo={item} onToggleDone={handleToggleDone} />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nothing on your list for today yet.</Text>
              <Text style={styles.emptySubtext}>Tap the + button to add your first todo!</Text>
            </View>
          ) : null
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTodo', { date: today })}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greeting: {
    ...typography.h2,
    color: colors.text,
  },
  date: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  logout: {
    ...typography.bodyBold,
    color: colors.primary,
    fontSize: 14,
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
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginTop: -2,
  },
});
