import React, { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useMachineStore } from '../store/useMachineStore';
import { ImageCarousel } from '../components/ImageCarousel';
import { theme } from '../theme';
import type { Machine } from '../types';

type Props = StackScreenProps<RootStackParamList, 'MachineDetail'>;

export function MachineDetailScreen({ navigation, route }: Props) {
  const { machineId } = route.params;
  const { getMachine, removeMachine } = useMachineStore();
  const [machine, setMachine] = useState<Machine | null>(null);

  useFocusEffect(
    useCallback(() => {
      const m = getMachine(machineId);
      setMachine(m);
    }, [machineId, getMachine])
  );

  React.useEffect(() => {
    if (machine) {
      navigation.setOptions({
        title: machine.name,
        headerTitleStyle: {
          color: theme.colors.text,
          fontWeight: 'bold',
          fontSize: theme.fontSize.lg,
        },
        headerRight: () => (
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('MachineForm', { machineId: machine.id })
              }
              style={styles.headerBtn}
            >
              <MaterialCommunityIcons
                name="pencil-outline"
                size={22}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={22}
                color={theme.colors.danger}
              />
            </TouchableOpacity>
          </View>
        ),
      });
    }
  }, [machine, navigation]);

  if (!machine) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.colors.textMuted }}>
          Máquina não encontrada.
        </Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Excluir Máquina',
      `Tem certeza que deseja excluir "${machine.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await removeMachine(machine.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Photo carousel */}
      <ImageCarousel photos={machine.photos} height={220} />

      {/* Description */}
      {machine.description ? (
        <Text style={styles.description}>{machine.description}</Text>
      ) : null}

      {/* Parts section */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionTitle}>PEÇAS E REQUISITOS</Text>
        <View style={styles.sectionDivider} />
      </View>

      {machine.parts.length === 0 ? (
        <Text style={styles.emptyParts}>
          Nenhuma peça cadastrada para esta máquina.
        </Text>
      ) : (
        machine.parts.map((part) => (
          <View key={part.id} style={styles.partCard}>
            {part.photos.length > 0 ? (
              <Image
                source={{ uri: part.photos[0] }}
                style={styles.partThumb}
              />
            ) : (
              <View style={[styles.partThumb, styles.partThumbPlaceholder]}>
                <MaterialCommunityIcons
                  name="cog-outline"
                  size={24}
                  color={theme.colors.textMuted}
                />
              </View>
            )}
            <View style={styles.partInfo}>
              <Text style={styles.partName}>{part.name}</Text>
              <View style={styles.partBadges}>
                <View style={styles.partBadge}>
                  <Text style={styles.partBadgeText}>
                    Qtd: {part.quantity}
                  </Text>
                </View>
                <View style={styles.partBadge}>
                  <Text style={styles.partBadgeText}>
                    {part.weight.toFixed(2)} kg
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.partActions}>
              <MaterialCommunityIcons
                name="pencil-outline"
                size={20}
                color={theme.colors.primary}
              />
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={20}
                color={theme.colors.danger}
              />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginRight: theme.spacing.lg,
  },
  headerBtn: {
    padding: 4,
  },
  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
    lineHeight: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
    color: theme.colors.primary,
    letterSpacing: 1.5,
  },
  emptyParts: {
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  partCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  partThumb: {
    width: 52,
    height: 52,
    borderRadius: theme.borderRadius.sm,
  },
  partThumbPlaceholder: {
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  partName: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  partBadges: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  partBadge: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  partBadgeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  partActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
});
