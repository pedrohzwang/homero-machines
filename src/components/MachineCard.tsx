import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Machine } from '../types';
import { theme } from '../theme';

type MachineCardProps = {
  machine: Machine;
  onPress: () => void;
};

export function MachineCard({ machine, onPress }: MachineCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {machine.photos.length > 0 ? (
        <Image source={{ uri: machine.photos[0] }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, styles.placeholderThumb]}>
          <MaterialCommunityIcons
            name="image-off-outline"
            size={24}
            color={theme.colors.textMuted}
          />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {machine.name}
        </Text>
        {machine.description ? (
          <Text style={styles.description} numberOfLines={1}>
            {machine.description}
          </Text>
        ) : null}
        {machine.tags && machine.tags.length > 0 ? (
          <View style={styles.tagsRow}>
            {machine.tags.slice(0, 5).map((tag, i) => (
              <View key={i} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={theme.colors.textMuted}
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: theme.borderRadius.sm,
  },
  placeholderThumb: {
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  name: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  tagPill: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textOnPrimary,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: theme.spacing.sm,
  },
});
