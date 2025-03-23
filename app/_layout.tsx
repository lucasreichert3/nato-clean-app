import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import "react-native-reanimated";
import { PaperProvider } from "react-native-paper";
import AppNavigator from "./navigation/AppNavigator";

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <PaperProvider>
        <AppNavigator />
      </PaperProvider>
    </ThemeProvider>
  );
}
