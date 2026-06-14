import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Trash2 } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ColorPicker } from '../components/ColorPicker';
import { SegmentedControl } from '../components/SegmentedControl';
import { colors, spacing, typography, radii, getRandomTodoColor, urgencyColor } from '../theme/theme';
import { createTodo, updateTodo, deleteTodo, getTodoById, Urgency, Status } from '../api/todos';
import { toDateString, formatShortDate } from '../utils/date';
import { ApiError } from '../api/client';

export const AddTodoScreen = ({ navigation, route }: any) => {
  const todoId: string | undefined = route?.params?.todoId;
  const isEditMode = !!todoId;
  const initialDate: string = route?.params?.date || toDateString(new Date());

  const [description, setDescription] = useState('');
  const [date, setDate] = useState(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [color, setColor] = useState(getRandomTodoColor());
  const [urgency, setUrgency] = useState<Urgency>('low');
  const [status, setStatus] = useState<Status>('not_started');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  useEffect(() => {
    if (!todoId) return;
    const load = async () => {
      try {
        const { todo } = await getTodoById(todoId);
        setDescription(todo.description);
        setDate(todo.date);
        setColor(todo.color);
        setUrgency(todo.urgency);
        setStatus(todo.status);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Failed to load todo';
        Alert.alert('Error', message);
        navigation.goBack();
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [todoId]);

  const parsedDate = (() => {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(y, m - 1, d);
  })();

  const onDateChange = (event: any, selected?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) {
      setDate(toDateString(selected));
    }
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
  };

  const handleSave = async () => {
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (isEditMode && todoId) {
        await updateTodo(todoId, {
          description: description.trim(),
          date,
          color,
          urgency,
          status,
        });
      } else {
        await createTodo({
          description: description.trim(),
          date,
          color,
          urgency,
          status,
        });
      }
      navigation.goBack();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to save todo';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!todoId) return;
    Alert.alert('Delete Todo', 'Are you sure you want to delete this todo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteTodo(todoId);
            navigation.goBack();
          } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Failed to delete todo';
            Alert.alert('Error', message);
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{isEditMode ? 'Edit Todo' : 'New Todo'}</Text>
        {isEditMode && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={deleting}
            activeOpacity={0.7}
          >
            {deleting ? (
              <ActivityIndicator size="small" color={colors.danger} />
            ) : (
              <Trash2 size={20} color={colors.danger} strokeWidth={2} />
            )}
          </TouchableOpacity>
        )}
      </View>

      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="What do you need to do?"
        multiline
        numberOfLines={3}
        style={styles.textArea}
        error={error || undefined}
      />

      <Text style={styles.label}>Date</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>{formatShortDate(date)}</Text>
        <Text style={styles.dateChange}>Change</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={parsedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={onDateChange}
        />
      )}

      <ColorPicker value={color} onChange={setColor} />

      <SegmentedControl<Urgency>
        label="Urgency"
        value={urgency}
        onChange={setUrgency}
        options={[
          { label: 'Low', value: 'low', color: urgencyColor('low') },
          { label: 'Moderate', value: 'moderate', color: urgencyColor('moderate') },
          { label: 'High', value: 'high', color: urgencyColor('high') },
        ]}
      />

      <SegmentedControl<Status>
        label="Status"
        value={status}
        onChange={setStatus}
        options={[
          { label: 'Not Started', value: 'not_started' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Done', value: 'done', color: colors.success },
        ]}
      />

      <Button
        title={isEditMode ? 'Save Changes' : 'Add Todo'}
        onPress={handleSave}
        loading={loading}
        style={{ marginTop: spacing.sm }}
      />
      <Button title="Cancel" onPress={() => navigation.goBack()} variant="outline" style={{ marginTop: spacing.sm }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  label: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    ...typography.body,
    color: colors.text,
  },
  dateChange: {
    ...typography.bodyBold,
    color: colors.primary,
    fontSize: 14,
  },
});
