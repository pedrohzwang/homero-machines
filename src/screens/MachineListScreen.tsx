import React, { useCallback, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useMachineStore } from '../store/useMachineStore';
import { MachineCard } from '../components/MachineCard';
import { EmptyState } from '../components/EmptyState';
import { theme } from '../theme';

type Props = StackScreenProps<RootStackParamList, 'MachineList'>;

export function MachineListScreen({ navigation }: Props) {
  const { machines, loadMachines } = useMachineStore();
  const [search, setSearch] = useState('');
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      loadMachines();
    }, [loadMachines])
  );

  const filtered = search
    ? machines.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase())
      )
    : machines;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Máquinas</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={theme.colors.placeholder}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Buscar máquina..."
          placeholderTextColor={theme.colors.searchPlaceholder}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <MachineCard
            machine={item}
            onPress={() =>
              navigation.navigate('MachineDetail', { machineId: item.id })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState message="Nenhuma máquina cadastrada" />
        }
        contentContainerStyle={
          filtered.length === 0 ? styles.emptyList : styles.list
        }
      />

      {/* FAB */}
      <View style={[styles.fabContainer, { bottom: Math.max(insets.bottom + 16, 48) }]}>
        <MaterialCommunityIcons.Button
          name="plus"
          size={28}
          color={theme.colors.fabIcon}
          backgroundColor={theme.colors.fabBackground}
          borderRadius={50}
          iconStyle={{ marginRight: 0 }}
          style={styles.fab}
          onPress={() => navigation.navigate('MachineForm')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.headerText,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.searchBackground,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.searchBorder,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.searchText,
  },
  list: {
    paddingBottom: 80,
  },
  emptyList: {
    flexGrow: 1,
  },
  fabContainer: {
    position: 'absolute',
    right: theme.spacing.lg,
  },
  fab: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
});
