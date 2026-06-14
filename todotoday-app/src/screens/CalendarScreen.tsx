import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Plus } from 'lucide-react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, radii } from '../theme/theme';
import { TodoItem } from '../components/TodoItem';
import { getCalendarSummary, getTodosByDate, updateTodo, Todo, CalendarEntry } from '../api/todos';
import { getTodayString, formatFriendlyDate, toDateString } from '../utils/date';
import { ApiError } from '../api/client';

export const CalendarScreen = ({ navigation }: any) => {
  const today = getTodayString();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [summary, setSummary] = useState<Record<string, CalendarEntry[]>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayTodos, setDayTodos] = useState<Todo[]>([]);
  const [loadingDay, setLoadingDay] = useState(false);

  const loadSummary = useCallback(async (year: number, month: number) => {
    try {
      const { summary } = await getCalendarSummary(year, month);
      setSummary(summary);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load calendar';
      Alert.alert('Error', message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSummary(currentMonth.year, currentMonth.month);
    }, [currentMonth, loadSummary])
  );

  const onMonthChange = (date: DateData) => {
    setCurrentMonth({ year: date.year, month: date.month });
  };

  const openDay = async (dateStr: string) => {
    setSelectedDate(dateStr);
    setLoadingDay(true);
    try {
      const { todos } = await getTodosByDate(dateStr);
      setDayTodos(todos);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load todos';
      Alert.alert('Error', message);
    } finally {
      setLoadingDay(false);
    }
  };

  const handleToggleDone = async (todo: Todo) => {
    const newStatus = todo.status === 'done' ? 'not_started' : 'done';
    setDayTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, status: newStatus } : t))
    );
    try {
      await updateTodo(todo.id, { status: newStatus });
      if (selectedDate) {
        loadSummary(currentMonth.year, currentMonth.month);
      }
    } catch (err) {
      setDayTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, status: todo.status } : t))
      );
      const message = err instanceof ApiError ? err.message : 'Failed to update todo';
      Alert.alert('Error', message);
    }
  };

  // Build markedDates for react-native-calendars with custom dot rendering via dots array
  const markedDates: Record<string, any> = {};
  Object.entries(summary).forEach(([date, entries]) => {
    markedDates[date] = {
      dots: entries.slice(0, 4).map((entry, idx) => ({
        key: `${date}-${idx}`,
        color: entry.status === 'done' ? colors.success : entry.color,
      })),
    };
  });
  if (markedDates[today]) {
    markedDates[today] = { ...markedDates[today], today: true };
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Calendar</Text>

      <Calendar
        current={`${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}-01`}
        onDayPress={(day: DateData) => openDay(day.dateString)}
        onMonthChange={onMonthChange}
        markingType="multi-dot"
        markedDates={markedDates}
        theme={{
          backgroundColor: colors.background,
          calendarBackground: colors.surface,
          textSectionTitleColor: colors.textMuted,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: '#ffffff',
          todayTextColor: colors.primary,
          dayTextColor: colors.text,
          textDisabledColor: colors.border,
          dotColor: colors.primary,
          arrowColor: colors.primary,
          monthTextColor: colors.text,
          textMonthFontWeight: '700',
          textDayFontWeight: '500',
          textDayHeaderFontWeight: '600',
        }}
        style={styles.calendar}
      />

      <Modal
        visible={!!selectedDate}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedDate(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDate ? formatFriendlyDate(selectedDate) : ''}
              </Text>
              <TouchableOpacity onPress={() => setSelectedDate(null)} style={styles.closeButton}>
                <X size={22} color={colors.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={dayTodos}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.modalList}
              renderItem={({ item }) => (
                <TodoItem
                  todo={item}
                  onToggleDone={handleToggleDone}
                  onPress={(t) => {
                    setSelectedDate(null);
                    navigation.navigate('AddTodo', { todoId: t.id });
                  }}
                />
              )}
              ListEmptyComponent={
                !loadingDay ? (
                  <Text style={styles.emptyText}>No todos for this day.</Text>
                ) : null
              }
            />

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                const date = selectedDate;
                setSelectedDate(null);
                navigation.navigate('AddTodo', { date });
              }}
              activeOpacity={0.85}
            >
              <Plus size={18} color="#fff" strokeWidth={2.5} />
              <Text style={styles.addButtonText}>Add Todo for this Day</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  calendar: {
    marginHorizontal: spacing.lg,
    borderRadius: radii.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: '75%',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalList: {
    paddingBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  addButtonText: {
    ...typography.button,
    color: '#fff',
  },
});
