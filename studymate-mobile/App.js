import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from './src/screens/DashboardScreen';
import MyTasksScreen from './src/screens/MyTasksScreen';
import TaskFormScreen from './src/screens/TaskFormScreen';
import TaskDetailsScreen from './src/screens/TaskDetailsScreen';
import { warmUpServer } from './src/api/taskApi';
import { colors } from './src/styles/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    warmUpServer();
  }, []);
  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor={colors.background} />
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontWeight: '700',
            color: colors.text,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: 'StudyMate' }}
        />
        <Stack.Screen
          name="MyTasks"
          component={MyTasksScreen}
          options={{ title: 'My Tasks' }}
        />
        <Stack.Screen
          name="TaskForm"
          component={TaskFormScreen}
          options={({ route }) => ({
            title: route.params?.taskId ? 'Edit Task' : 'Add New Task',
          })}
        />
        <Stack.Screen
          name="TaskDetails"
          component={TaskDetailsScreen}
          options={{ title: 'Task Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
