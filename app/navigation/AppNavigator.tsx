// src/navigation/AppNavigator.tsx

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Importar telas
import HomeScreen from "../screens/HomeScreen";
import CalendarScreen from "../screens/CalendarScreen";
import AddServiceScreen from "../screens/AddServiceScreen";
import ServiceDetailsScreen from "../screens/ServiceDetailsScreen";
import FinancialReportScreen from "../screens/FinancialReportScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigator para as telas de serviço
const ServiceStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#2196F3",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Início" }}
      />
      <Stack.Screen
        name="AddService"
        component={AddServiceScreen}
        options={{ title: "Adicionar Serviço" }}
      />
      <Stack.Screen
        name="ServiceDetails"
        component={ServiceDetailsScreen}
        options={{ title: "Detalhes do Serviço" }}
      />
    </Stack.Navigator>
  );
};

// Stack Navigator para a tela de calendário
const CalendarStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#2196F3",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: "Calendário" }}
      />
      <Stack.Screen
        name="AddService"
        component={AddServiceScreen}
        options={{ title: "Adicionar Serviço" }}
      />
      <Stack.Screen
        name="ServiceDetails"
        component={ServiceDetailsScreen}
        options={{ title: "Detalhes do Serviço" }}
      />
    </Stack.Navigator>
  );
};

// Stack Navigator para a tela de relatório financeiro
const FinancialStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#2196F3",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="FinancialReport"
        component={FinancialReportScreen}
        options={{ title: "Relatório Financeiro" }}
      />
      <Stack.Screen
        name="ServiceDetails"
        component={ServiceDetailsScreen}
        options={{ title: "Detalhes do Serviço" }}
      />
    </Stack.Navigator>
  );
};

// Tab Navigator principal
const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "HomeTab") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "CalendarTab") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "FinancialTab") {
            iconName = focused ? "chart-bar" : "chart-bar-stacked";
          }

          return (
            <MaterialCommunityIcons
              name={iconName as any}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={ServiceStack}
        options={{ title: "Início" }}
      />
      <Tab.Screen
        name="CalendarTab"
        component={CalendarStack}
        options={{ title: "Calendário" }}
      />
      <Tab.Screen
        name="FinancialTab"
        component={FinancialStack}
        options={{ title: "Financeiro" }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
