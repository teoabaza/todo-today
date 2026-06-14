import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors, spacing, typography } from '../theme/theme';
import { ApiError } from '../api/client';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, updateName, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await updateName(name.trim());
      navigation.goBack();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to update name';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Your Profile</Text>

        <Input
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          error={error || undefined}
        />

        <Input label="Email" value={user?.email || ''} editable={false} style={styles.disabledInput} />

        <Button title="Save Changes" onPress={handleSave} loading={loading} style={{ marginTop: spacing.sm }} />
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={{ marginTop: spacing.sm }}
        />

        <TouchableOpacity style={styles.logoutLink} onPress={logout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  disabledInput: {
    color: colors.textMuted,
  },
  logoutLink: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  logoutText: {
    ...typography.bodyBold,
    color: colors.urgencyHigh,
  },
});
