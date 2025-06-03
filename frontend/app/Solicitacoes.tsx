import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  TouchableOpacity,
} from "react-native";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import Header from "../components/Header"; // seu header com menu e logo
import { SafeAreaView } from "react-native-safe-area-context";

// Modelo de dados da solicitação
// Modelo ajustado para alterações
type Solicitation = {
  id: string;
  type: "change" | "cancel";
  oldDate: string; // data antiga
  oldFrom: string; // hora inicial antiga
  oldTo: string; // hora final antiga
  newDate?: string; // data nova (só em change)
  newFrom?: string; // hora inicial nova
  newTo?: string; // hora final nova
  client: string;
  description: string;
};

// 2) Array de mock (correto: [] de Solicitation)
const MOCK: Solicitation[] = [
  {
    id: "1",
    type: "change",
    oldDate: "2025-03-08",
    oldFrom: "10:00",
    oldTo: "11:00",
    newDate: "2025-03-08",
    newFrom: "14:00",
    newTo: "15:00",
    client: "João Francisco",
    description:
      "SUPORTE NUTRICIONAL CLÍNICO com NUTRIÇÃO – FAGNER RODRIGUES DE ANDRADE",
  },
  {
    id: "2",
    type: "cancel",
    oldDate: "2025-03-11",
    oldFrom: "15:00",
    oldTo: "16:00",
    client: "Gabriel Pereira",
    description: "INTERVENÇÃO EM CRISES com PSICOLOGIA – JOÃO GUILHERME LEMES",
  },
];

export default function Solicitacoes() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<Solicitation | null>(null);

  const open = (item: Solicitation) => {
    setSelected(item);
    setModalVisible(true);
  };
  const close = () => {
    setModalVisible(false);
    setSelected(null);
  };

  const formatDate = (iso: string) =>
    format(parseISO(iso), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.flex}>
        <Header />
        <Text style={styles.title}>SOLICITAÇÕES</Text>

        <FlatList
          data={MOCK}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => open(item)}>
              <Text style={styles.cardHeader}>
                {formatDate(item.oldDate)} {"›"} {item.oldFrom} - {item.oldTo}
              </Text>
              <Text style={styles.cardBody}>
                {item.type === "change"
                  ? "Alteração de Data/Hora"
                  : "Cancelamento de Evento"}
              </Text>
              <Text style={styles.cardDots}>⋯</Text>
            </Pressable>
          )}
        />

        {selected && (
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent
            onRequestClose={close}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modal}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {selected?.type === "change"
                      ? "Alteração de Data/Hora"
                      : "Cancelamento de Evento"}
                  </Text>
                  <TouchableOpacity onPress={close}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                {selected.type === "change" ? (
                  <>
                    {/* Linha antiga em vermelho */}
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>📅</Text>
                      <Text style={styles.modalText}>
                        <Text style={styles.oldText}>
                          {formatDate(selected.oldDate)}{" "}
                        </Text>
                        <Text>› </Text>
                        <Text style={styles.oldText}>
                          {selected.oldFrom} - {selected.oldTo}
                        </Text>
                      </Text>
                    </View>

                    {/* Linha nova em verde */}
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>📅</Text>
                      <Text style={styles.modalText}>
                        <Text style={styles.newText}>
                          {formatDate(selected.newDate!)}{" "}
                        </Text>
                        <Text>› </Text>
                        <Text style={styles.newText}>
                          {selected.newFrom} - {selected.newTo}
                        </Text>
                      </Text>
                    </View>
                  </>
                ) : (
                  /* renderização antiga para 'cancel' */
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>📅</Text>
                    <Text style={styles.modalText}>
                      {formatDate(selected.oldDate)} › {selected.oldFrom} -{" "}
                      {selected.oldTo}
                    </Text>
                  </View>
                )}
                {/* cliente */}
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>👤</Text>
                  <Text style={styles.modalText}>{selected.client}</Text>
                </View>
                {/* descrição */}
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>❗️</Text>
                  <Text style={styles.modalText}>{selected.description}</Text>
                </View>
                {selected.type === "change" ? (
                  /* ações */
                  <View style={styles.modalActions}>
                    <Pressable
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => {
                        /* lógica de cancelar */
                        close();
                      }}
                    >
                      <Text style={styles.cancelText}>Cancelar</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.button, styles.approveButton]}
                      onPress={() => {
                        /* lógica de aprovar */
                        close();
                      }}
                    >
                      <Text style={styles.approveText}>Aprovar</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.modalActions}>
                    <Pressable
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => {
                        /* lógica de aprovar */
                        close();
                      }}
                    >
                      <Text style={styles.cancelText}>Cancelado</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  flex: { flex: 1, backgroundColor: "#FFF" },
  title: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  list: { padding: 16 },
  card: {
    backgroundColor: "#F7F7F7",
    borderRadius: 6,
    marginBottom: 12,
    padding: 12,
    position: "relative",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  cardHeader: {
    fontSize: 12,
    color: "#444",
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardDots: {
    position: "absolute",
    right: 12,
    top: 12,
    fontSize: 18,
    color: "#999",
  },

  // modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: 24,
  },
  modal: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    elevation: 4,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  modalClose: { fontSize: 20, color: "#666" },

  modalRow: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
  modalLabel: { width: 24, fontSize: 16 },
  modalText: { flex: 1, fontSize: 14, color: "#333" },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#C0392B",
    marginRight: 8,
  },
  approveButton: {
    backgroundColor: "#27AE60",
  },
  cancelText: { color: "#FFF", fontWeight: "600" },
  approveText: { color: "#FFF", fontWeight: "600" },
  oldText: {
    color: "#C0392B", // vermelho
    fontWeight: "600",
  },
  newText: {
    color: "#27AE60", // verde
    fontWeight: "600",
  },
});
