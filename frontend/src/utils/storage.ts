import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@usuario";

export const storage = {
  async salvarUsuario(usuario: any) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
      console.log("✅ Usuario salvo com sucesso:", usuario);
    } catch (error) {
      console.error("❌ Erro ao salvar usuario:", error);
    }
  },

  async obterUsuario(): Promise<any | null> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      const usuario = json ? JSON.parse(json) : null;
      console.log("🔍 Usuario carregado:", usuario);
      return usuario;
    } catch (error) {
      console.error("❌ Erro ao carregar usuario:", error);
      return null;
    }
  },

  async removerUsuario() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log("🗑️ Usuario removido do storage");
    } catch (error) {
      console.error("❌ Erro ao remover usuario:", error);
    }
  },
};
