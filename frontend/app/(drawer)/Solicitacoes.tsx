// src/screens/Solicitacoes.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import Header from "../../components/Header"; // seu header com menu e logo
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../src/services/api"; // supondo que seu Axios está configurado em src/services/api.ts
import { EditedEvent } from "@/components/EditAppointmentModal";
import { TextInput } from "react-native-gesture-handler";

export default function Solicitacoes() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<EditedEvent | null>(null);
  const [solicitacoes, setSolicitacoes] = useState<EditedEvent[]>([]);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelInput, setShowCancelInput] = useState(false);

  useEffect(() => {
    carregarSolicitacoes();
  }, [solicitacoes]);

  const carregarSolicitacoes = async () => {
    try {
      const [agendaResponse, canceladosResponse] = await Promise.all([
        api.get("/agenda"),
        api.get("/cancelados"),
      ]);

      const dadosCombinados = [
        ...agendaResponse.data,
        ...canceladosResponse.data,
      ];

      const filtrados = dadosCombinados.filter(
        (item: any) =>
          item.SOLICMASTER === 0 &&
          (item.DATANOVA !== null || item.SITUAGEN === "3")
      );
      setSolicitacoes(filtrados);
    } catch (err) {
      console.error("Erro ao carregar eventos:", err);
    }
  };

  const open = (item: EditedEvent) => {
    setSelected(item);
    setModalVisible(true);
  };
  const close = () => {
    setModalVisible(false);
    setSelected(null);
    setCancelReason("");
    setShowCancelInput(false);
  };

  const formatDate = (iso: string) =>
    format(parseISO(iso), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  const formatTime = (iso: string) => {
    const localDate = new Date(iso);
    return format(localDate, "HH:mm", { locale: ptBR });
  };

  // Handler unificado para remover a solicitação do estado local
  const removeSolicitation = (solicId: number) => {
    setSolicitacoes((prev) => prev.filter((item) => item.IDAGENDA !== solicId));
  };

  // 1) Cancelamento de evento: deleta agenda e remove solicitação
  const handleCancelSolicitation = (isEventCancel?: boolean) => {
    if (!selected) return;

    if (!isEventCancel) {
      if (showCancelInput && !cancelReason.trim()) {
        Alert.alert("Erro", "Por favor, informe o motivo do cancelamento.");
        return;
      }

      if (!showCancelInput) {
        // Primeiro clique: mostrar o input
        setShowCancelInput(true);
        return;
      }
    }

    // Segundo clique: confirmar
    Alert.alert("Remover Solicitação", "Deseja remover esta solicitação?", [
      { text: "Não", style: "cancel" },
      {
        text: "Sim",
        style: "destructive",
        onPress: () => {
          api
            .put(`/agenda/${selected.IDAGENDA}`, {
              SOLICMASTER: 1,
              SITUAGEN: 3,
              MOTIALT: cancelReason,
              DATAABERT: selected.DATANOVA
                ? selected.DATANOVA
                : selected.DATAABERT,
              DATANOVA: null,
            })
            .then(() => {
              removeSolicitation(selected.IDAGENDA);
              close();
              setCancelReason("");
              setShowCancelInput(false);
              Alert.alert("Sucesso", "Solicitação removida.");
            })
            .catch((err) => {
              console.error("Erro ao remover solicitação:", err);
              Alert.alert(
                "Falha",
                "Não foi possível remover a solicitação. Tente novamente."
              );
            });
        },
      },
    ]);
  };

  // 2) Aprovar alteração: atualiza agenda e remove solicitação
  const handleApproveChange = () => {
    if (!selected) return;

    // Valida campos newDate, newFrom, newTo
    if (!selected.DATANOVA || !selected.DATAABERT) {
      Alert.alert("Erro", "Dados de nova data/hora estão incompletos.");
      return;
    }

    const payload = {
      DATAABERT: selected.DATANOVA,
      DATANOVA: null,
    };

    api
      .put(`/agenda/${selected.IDAGENDA}`, payload)
      .then(() => {
        removeSolicitation(selected.IDAGENDA);
        close();
        Alert.alert("Sucesso", "Evento atualizado com sucesso.");
      })
      .catch((err) => {
        console.error("Erro ao alterar o agendamento:", err);
        Alert.alert(
          "Falha",
          "Não foi possível atualizar o agendamento. Tente novamente."
        );
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.flex}>
        <Header />
        <Text style={styles.title}>SOLICITAÇÕES</Text>

        <FlatList
          data={solicitacoes}
          keyExtractor={(i) => i.IDAGENDA.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => open(item)}>
              <Text style={styles.cardHeader}>
                {formatDate(item.DATAABERT)}
              </Text>
              <Text style={styles.cardBody}>
                {item.DATANOVA
                  ? "⚠️ Alteração de Data/Hora - "
                  : "❗ Cancelamento de Evento - "}
                {item.pessoaFisAgenda.NOMEPESSOA}
              </Text>
              <Text style={styles.cardDots}>⋯</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Não há solicitações no momento.
            </Text>
          }
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
                    {selected.DATANOVA
                      ? "Alteração de Data/Hora"
                      : "Cancelamento de Evento"}
                  </Text>
                  <TouchableOpacity onPress={close}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                {selected.DATANOVA && !showCancelInput && (
                  <>
                    {/* Exibe data antiga (vermelho) */}
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>📅</Text>
                      <Text style={[styles.modalText, styles.bold]}>
                        DE:{" "}
                        <Text style={styles.oldText}>
                          {formatDate(selected.DATAABERT)}{" "}
                        </Text>
                        <Text>› </Text>
                        <Text style={styles.oldText}>
                          {formatTime(selected.DATAABERT)}
                        </Text>
                      </Text>
                    </View>

                    {/* Exibe data nova (verde) */}
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>📅</Text>
                      <Text style={[styles.modalText, styles.bold]}>
                        PARA:{" "}
                        <Text style={styles.newText}>
                          {formatDate(selected.DATANOVA!)}{" "}
                        </Text>
                        <Text>› </Text>
                        <Text style={styles.newText}>
                          {formatTime(selected.DATANOVA)}
                        </Text>
                      </Text>
                    </View>
                  </>
                )}
                {selected.SOLICMASTER === 0 &&
                  selected.SITUAGEN.toString() === "3" &&
                  !selected.DATANOVA && (
                    /* Exibe apenas a data antiga (cancel) */
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>📅</Text>
                      <Text style={styles.modalText}>
                        <Text style={[styles.modalText, styles.bold]}>
                          DATA:{" "}
                        </Text>
                        {`${formatDate(selected.DATAABERT)} > ${formatTime(
                          selected.DATAABERT
                        )}`}
                      </Text>
                    </View>
                  )}
                {!showCancelInput && (
                  <>
                    {/* Paciente */}
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>👤</Text>
                      <Text style={[styles.modalText, styles.bold]}>
                        PACIENTE:{" "}
                        <Text style={[styles.modalText, styles.light]}>
                          {selected.pessoaFisAgenda.NOMEPESSOA}
                        </Text>
                      </Text>
                    </View>
                    {/* Descrição */}
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>❗️</Text>
                      <Text style={[styles.modalText, styles.bold]}>
                        AGENDAMENTO:{" "}
                        <Text
                          style={[styles.modalText, styles.light]}
                        >{`${selected.procedimento.DESCRPROC} com ${selected.procedimento.especialidades[0].DESCESPEC} - ${selected.profissional.pessoa.NOMEPESSOA}`}</Text>
                      </Text>
                    </View>
                  </>
                )}

                {selected.DATANOVA && !showCancelInput && (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>❔</Text>
                    <Text style={[styles.modalText, styles.bold]}>
                      MOTIVO DA ALTERAÇÃO:{" "}
                      <Text style={[styles.modalText, styles.light]}>
                        {selected.MOTIALT}
                      </Text>
                    </Text>
                  </View>
                )}
                {selected.SOLICMASTER === 0 &&
                  selected.SITUAGEN.toString() === "3" &&
                  !selected.DATANOVA && (
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>❔</Text>
                      <Text style={[styles.modalText, styles.bold]}>
                        MOTIVO DO CANCELAMENTO:{" "}
                        <Text style={[styles.modalText, styles.light]}>
                          {selected.MOTIALT}
                        </Text>
                      </Text>
                    </View>
                  )}
                {showCancelInput && (
                  <>
                    <Text style={[styles.label, styles.bold]}>
                      📝 DESCREVA O MOTIVO DO CANCELAMENTO:
                    </Text>
                    <TextInput
                      style={[styles.textArea, { height: 96 }]}
                      placeholder="Descreva o motivo do cancelamento"
                      value={cancelReason}
                      onChangeText={setCancelReason}
                      multiline
                    />
                  </>
                )}

                {/* Botões de ação */}
                {selected.DATANOVA ? (
                  <View style={styles.modalActions}>
                    {!showCancelInput ? (
                      <>
                        <Pressable
                          style={[styles.button, styles.cancelButton]}
                          onPress={() => setShowCancelInput(true)}
                        >
                          <Text style={styles.cancelText}>Cancelar</Text>
                        </Pressable>
                        <Pressable
                          style={[styles.button, styles.approveButton]}
                          onPress={handleApproveChange}
                        >
                          <Text style={styles.approveText}>Aprovar</Text>
                        </Pressable>
                      </>
                    ) : (
                      <Pressable
                        style={[styles.button, styles.cancelButton]}
                        onPress={() => handleCancelSolicitation(false)}
                      >
                        <Text style={styles.cancelText}>Confirmar</Text>
                      </Pressable>
                    )}
                  </View>
                ) : (
                  <View style={styles.modalActions}>
                    <Pressable
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => handleCancelSolicitation(true)}
                    >
                      <Text style={styles.cancelText}>Entendido</Text>
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
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 32,
    fontSize: 16,
  },
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

  // Modal
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
  bold: { fontWeight: "bold" },
  light: { fontWeight: "400" },
  textInput: {
    flex: 1,
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#F9F9F9",
  },

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
    color: "#C0392B",
    fontWeight: "600",
  },
  newText: {
    color: "#27AE60",
    fontWeight: "600",
  },
  label: { fontSize: 14, fontWeight: "600" },
  textArea: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
    textAlignVertical: "top",
  },
});
