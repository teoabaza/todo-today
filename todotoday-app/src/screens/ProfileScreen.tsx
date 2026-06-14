import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors, spacing, typography } from '../theme/theme';
import { ApiError } from '../api/client';

export const ProfileScreen = () => {
  const { user, updateName, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const hasChanges = name.trim() !== (user?.name || '');

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setError('');
    setSaved(false);
    setLoading(true);
    try {
      await updateName(name.trim());
      setSaved(true);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to update name';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Your Profile</Text>

        <Input
          label="Name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            setSaved(false);
          }}
          placeholder="Your name"
          error={error || undefined}
        />

        <Input label="Email" value={user?.email || ''} editable={false} style={styles.disabledInput} />

        {saved && !hasChanges && <Text style={styles.savedText}>Saved!</Text>}

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={loading}
          disabled={!hasChanges}
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
  savedText: {
    ...typography.bodyBold,
    color: colors.success,
    textAlign: 'center',
    marginBottom: spacing.sm,
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