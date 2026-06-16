import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import type { Part } from '../types';

type PartCardProps = {
  part: Part;
  onEdit: (partId: string) => void;
  onDelete: (partId: string) => void;
};

export function PartCard({ part, onEdit, onDelete }: PartCardProps) {
  const handleDelete = () => {
    Alert.alert(
      'Excluir Peça',
      `Tem certeza que deseja excluir "${part.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => onDelete(part.id) },
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onEdit(part.id)} activeOpacity={0.75}>
      <View style={styles.contentRow}>
        {part.photos.length > 0 ? (
          <Image source={{ uri: part.photos[0] }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.placeholder]}>
            <MaterialCommunityIcons
              name="cog-outline"
              size={24}
              color={theme.colors.textMuted}
            />
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {part.name}
          </Text>
          <Text style={styles.details}>
            Qtd: {part.quantity} | Peso: {part.weight.toFixed(2)}kg
          </Text>
        </View>
        <View style={styles.actions} onStartShouldSetResponder={() => true}>
          <TouchableOpacity onPress={handleDelete} style={styles.btn}>
            <MaterialCommunityIcons name="trash-can-outline" size={22} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
      {part.tags && part.tags.length > 0 ? (
        <View style={styles.tagsRow}>
          {part.tags.slice(0, 5).map((tag, i) => (
            <View key={i} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    marginRight: theme.spacing.md,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  details: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btn: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: theme.spacing.sm,
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
});