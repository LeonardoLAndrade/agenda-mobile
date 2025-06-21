import { Drawer } from "expo-router/drawer";
import Sidebar from "../../components/Sidebar";

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={() => <Sidebar />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Agenda" options={{ title: "Agendamentos" }} />
      <Drawer.Screen name="Solicitacoes" options={{ title: "Solicitações" }} />
    </Drawer>
  );
}
