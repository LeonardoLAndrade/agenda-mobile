import { useRouter } from "expo-router";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, Image, StyleSheet, Text } from "react-native";
import { View } from "./Themed";
import { MaterialIcons } from "@expo/vector-icons";
import { storage } from "@/src/utils/storage";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const carregarUsuario = async () => {
      const usuarioSalvo = await storage.obterUsuario();
      setUsuario(usuarioSalvo);
    };
    carregarUsuario();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await storage.removerUsuario();
          router.replace("/initial");
        },
      },
    ]);
  };

  function formatarCPF(cpf?: string): string {
    if (!cpf || cpf.length !== 11) return ""; // ou retorne o próprio valor: return cpf ?? "";

    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={require("../assets/images/avatar-placeholder.png")}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.name}>{usuario?.nome_profissio}</Text>
        <Text style={styles.cpf}>
          CPF: {formatarCPF(usuario?.cpf_profissio)}
        </Text>
      </View>
      <View style={styles.divider} />
      <DrawerContentScrollView style={styles.items}>
        <DrawerItem
          label="Agendamentos"
          onPress={() => router.push("/(drawer)/Agenda")}
          labelStyle={styles.menuLabel}
          icon={({ size }) => (
            <Image
              source={require("../assets/images/calendar.png")}
              style={{
                width: size,
                height: size,
                tintColor: "#fff",
              }}
            />
          )}
        />
        <DrawerItem
          label="Solicitações"
          onPress={() => router.push("/Solicitacoes")}
          labelStyle={styles.menuLabel}
          icon={({ size }) => (
            <Image
              source={require("../assets/images/solicitacoes.png")}
              style={{ width: size, height: size, tintColor: "#fff" }}
            />
          )}
        />
        <DrawerItem
          label="Sair"
          onPress={handleLogout}
          labelStyle={[styles.menuLabel, { color: "#FF8688" }]}
          icon={({ size }) => (
            <MaterialIcons name="logout" size={size} color="#FF8688" />
          )}
        />
      </DrawerContentScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#029046",
    paddingTop: 48,
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    backgroundColor: "#E6DBFF",
    borderRadius: 40,
    padding: 8,
    marginBottom: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  items: {
    marginTop: -16,
  },
  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cpf: {
    color: "#fff",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginHorizontal: 16,
  },
  menuLabel: {
    color: "#fff",
    fontSize: 18,
  },
});
