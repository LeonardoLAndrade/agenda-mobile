// app/login.tsx
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
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../constants/Colors";

export default function LoginScreen() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back-ios" size={24} color={colors.text} />
      </TouchableOpacity>

      <Image
        source={require("../assets/images/logo-fasiclin.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.headerText}>
        Bem-vindo ao Sistema de Agenda!{"\n"}Insira seus dados para continuar!
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>CPF</Text>
        <TextInput
          style={styles.input}
          placeholder="Insira seu CPF"
          value={cpf}
          onChangeText={setCpf}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { marginTop: 16 }]}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Insira sua senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable
          onPress={() => {
            /* forgot */
          }}
        >
          {/* <Text style={styles.forgot}>Esqueceu a senha?</Text> */}
        </Pressable>

        <Pressable
          style={[styles.button, styles.primary]}
          onPress={() => router.push("/Agenda")}
        >
          <Text style={[styles.buttonText, { color: "#fff" }]}>Entrar</Text>
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
