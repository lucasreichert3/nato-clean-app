// src/navigation/AppNavigator.tsx

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import AddServiceScreen from "../screens/AddServiceScreen";
import CalendarScreen from "../screens/CalendarScreen";
import ServiceDetailsScreen from "../screens/ServiceDetailsScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{ title: "Serviços" }}
    />
    <Stack.Screen
      name="ServiceDetails"
      component={ServiceDetailsScreen}
      options={{ title: "Detalhes do Serviço" }}
    />
  </Stack.Navigator>
);

const CalendarStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Calendar"
      component={CalendarScreen}
      options={{ title: "Agenda" }}
    />
    <Stack.Screen
      name="ServiceDetails"
      component={ServiceDetailsScreen}
      options={{ title: "Detalhes do Serviço" }}
    />
    <Stack.Screen
      name="AddService"
      component={AddServiceScreen}
      options={{ title: "Agendar Serviço" }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "HomeTab") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "AddService") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "CalendarTab") {
            iconName = focused ? "calendar" : "calendar-outline";
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          headerShown: false,
          title: "Serviços",
        }}
      />
      <Tab.Screen
        name="CalendarTab"
        component={CalendarStack}
        options={{
          headerShown: false,
          title: "Agenda",
        }}
      />
      <Tab.Screen
        name="AddService"
        component={AddServiceScreen}
        options={{
          title: "Novo Serviço",
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
