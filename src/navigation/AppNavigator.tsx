import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { theme } from '../theme';
import { MachineListScreen } from '../screens/MachineListScreen';
import { MachineDetailScreen } from '../screens/MachineDetailScreen';
import { MachineFormScreen } from '../screens/MachineFormScreen';
import { PartFormScreen } from '../screens/PartFormScreen';

export type RootStackParamList = {
  MachineList: undefined;
  MachineDetail: { machineId: number };
  MachineForm: { machineId?: number } | undefined;
  PartForm: { machineId: number; partId?: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MachineList"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.headerBackground },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: { fontWeight: 'bold', color: theme.colors.text },
        headerShadowVisible: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="MachineList"
        component={MachineListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MachineDetail"
        component={MachineDetailScreen}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="MachineForm"
        component={MachineFormScreen}
        options={({ route }) => ({
          title: route.params?.machineId ? 'Editar Máquina' : 'Nova Máquina',
          headerTitleStyle: { color: theme.colors.text, fontWeight: 'bold' },
        })}
      />
      <Stack.Screen
        name="PartForm"
        component={PartFormScreen}
        options={({ route }) => ({
          title: route.params?.partId ? 'Editar Peça' : 'Nova Peça',
          headerTitleStyle: { color: theme.colors.text, fontWeight: 'bold' },
        })}
      />
    </Stack.Navigator>
  );
}
