import React, { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useMachineStore } from '../store/useMachineStore';
import { ImageCarousel } from '../components/ImageCarousel';
import { PartCard } from '../components/PartCard';
import { deletePhotos } from '../utils/fileSystem';
import { theme } from '../theme';
import type { Machine } from '../types';

type Props = StackScreenProps<RootStackParamList, 'MachineDetail'>;

export function MachineDetailScreen({ navigation, route }: Props) {
  const { machineId } = route.params;
  const { getMachine, removeMachine, updateMachine } = useMachineStore();
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

  const handleEditPart = (partId: string) => {
    navigation.navigate('PartForm', { machineId: machine.id, partId });
  };

  const handleDeletePart = async (partId: string) => {
    const part = machine.parts.find((p) => p.id === partId);
    if (!part) return;

    if (part.photos.length > 0) {
      await deletePhotos(part.photos);
    }
    
    const newParts = machine.parts.filter((p) => p.id !== partId);
    updateMachine(machine.id, { parts: newParts });
    setMachine((prev) => prev ? { ...prev, parts: newParts } : prev);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
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
            <PartCard
              key={part.id}
              part={part}
              onEdit={handleEditPart}
              onDelete={handleDeletePart}
            />
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('PartForm', { machineId: machine.id })}
      />
    </View>
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});
