import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ColorPicker } from '../components/ColorPicker';
import { SegmentedControl } from '../components/SegmentedControl';
import { colors, spacing, typography, radii, getRandomTodoColor, urgencyColor } from '../theme/theme';
import { createTodo, Urgency, Status } from '../api/todos';
import { toDateString, formatShortDate } from '../utils/date';
import { ApiError } from '../api/client';

export const AddTodoScreen = ({ navigation, route }: any) => {
  const initialDate: string = route?.params?.date || toDateString(new Date());

  const [description, setDescription] = useState('');
  const [date, setDate] = useState(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [color, setColor] = useState(getRandomTodoColor());
  const [urgency, setUrgency] = useState<Urgency>('low');
  const [status, setStatus] = useState<Status>('not_started');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      await createTodo({
        description: description.trim(),
        date,
        color,
        urgency,
        status,
      });
      navigation.goBack();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create todo';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>New Todo</Text>

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

      <Button title="Save Todo" onPress={handleSave} loading={loading} style={{ marginTop: spacing.sm }} />
      <Button title="Cancel" onPress={() => navigation.goBack()} variant="outline" style={{ marginTop: spacing.sm }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
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
