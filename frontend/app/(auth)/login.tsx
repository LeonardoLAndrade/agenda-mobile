import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Image,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../../constants/Colors";
import { login } from "../../src/services/auth";
import { storage } from "@/src/utils/storage";

export default function LoginScreen() {
  const router = useRouter();
  const [loginInput, setLoginInput] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (loading) return;

    if (!loginInput || !senha) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    setLoading(true);

    login(loginInput, senha)
      .then(async (response) => {
        const data = response?.data;

        if (data?.message === "Login bem-sucedido") {
          await storage.salvarUsuario(data.usuario);

          Alert.alert("Sucesso", "Login bem-sucedido!", [
            {
              text: "OK",
              onPress: () => {
                router.push("/(drawer)/Agenda");
              },
            },
          ]);
        } else {
          Alert.alert("Erro", "Resposta inesperada do servidor.");
        }
      })
      .catch((error) => {
        const responseData = error?.response?.data;
        const statusCode = error?.response?.status;

        let msg = "Erro ao tentar login.";

        if (statusCode === 401) {
          msg =
            (typeof responseData === "object"
              ? responseData?.message
              : undefined) || "Usuário ou senha inválidos.";

          console.log("⚠️ Login inválido:", msg); // ✅ não quebra o app
        } else {
          console.error("❌ Erro inesperado no login:", error); // só mostra se for outro tipo
        }

        Alert.alert("Erro", msg);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back-ios" size={24} color={colors.text} />
      </TouchableOpacity>

      <Image
        source={require("../../assets/images/logo-fasiclin.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.headerText}>
        Bem-vindo ao Sistema de Agenda!{"\n"}Insira seus dados para continuar!
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Usuário</Text>
        <TextInput
          style={styles.input}
          placeholder="Insira seu usuário cadastrado"
          value={loginInput}
          onChangeText={setLoginInput}
          autoCapitalize="none"
        />

        <Text style={[styles.label, { marginTop: 16 }]}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Insira sua senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <Pressable
          style={[styles.button, styles.primary]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.buttonText, { color: "#fff" }]}>Entrar</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  back: { height: 40, justifyContent: "center" },
  logo: { width: 200, height: 80, alignSelf: "center", marginTop: 8 },
  headerText: {
    fontSize: 20,
    textAlign: "center",
    marginVertical: 24,
    marginTop: 32,
    color: colors.text,
    fontWeight: "bold",
  },
  form: { flex: 1 },
  label: { fontSize: 14, color: colors.text },
  input: {
    height: 48,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  forgot: {
    color: colors.primary,
    fontSize: 14,
    textAlign: "right",
    marginTop: 8,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  primary: { backgroundColor: colors.primary },
  buttonText: { fontSize: 16, fontWeight: "600" },
  footer: { paddingVertical: 16, alignItems: "center", paddingBottom: 50 },
  footerText: { fontSize: 16, color: colors.text },
  link: { color: colors.primary, fontWeight: "600" },
});
