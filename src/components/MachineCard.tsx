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
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {machine.parts.length} peça{machine.parts.length !== 1 ? 's' : ''}
          </Text>
        </View>
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
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.badgeBackground,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    marginTop: theme.spacing.sm,
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold',
    color: theme.colors.badgeText,
  },
  chevron: {
    marginLeft: theme.spacing.sm,
  },
});
