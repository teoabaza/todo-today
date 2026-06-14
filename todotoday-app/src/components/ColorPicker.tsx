import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, spacing, typography } from '../theme/theme';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  return (
    <View>
      <Text style={styles.label}>Colour</Text>
      <View style={styles.row}>
        {colors.todoPalette.map((c) => {
          const selected = c.toLowerCase() === value.toLowerCase();
          return (
            <TouchableOpacity
              key={c}
              style={[
                styles.swatch,
                { backgroundColor: c },
                selected && styles.selected,
              ]}
              onPress={() => onChange(c)}
              activeOpacity={0.8}
            >
              {selected && <Check size={18} color="#fff" strokeWidth={3} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: colors.text,
  },
});
