// app/(tabs)/index.tsx
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Modal,
  TextInput,
  Pressable,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import CalendarView from "../components/CalendarView";
import DateHeader from "../components/DateHeader";
import AppointmentCard from "../components/AppointmentCard";
import api from "../../frontend/src/services/api";

type Event = {
  id: string;
  date: string;
  timeInicio: string;
  timeFim: string;
  client: string;
  especialidade: string;
  dataInicioISO: string;
  dataFimISO: string;
  profissionalId: number;
  procedimentoId?: number;
};

export default function ScheduleScreen() {
  const MAX_DOTS = 3;
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  // estado do modal de edição
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editTimeInicio, setEditTimeInicio] = useState("");
  const [editTimeFim, setEditTimeFim] = useState("");
  const [editClient, setEditClient] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  const { width } = useWindowDimensions();
  const isNarrow = width < 600;

  useEffect(() => {
    api
      .get("/agenda")
      .then((res) => {
        const rawList: any[] = res.data;
        const adapted: Event[] = rawList
          .filter((item) => item.data_inicio && item.data_fim)
          .map((item) => {
            const dataInicio = item.data_inicio;
            const dataFim = item.data_fim;

            const dateInicioOnly = dataInicio.split("T")[0]; // “2024-12-07”
            const timeInicioOnly = dataInicio.split("T")[1].substring(0, 5); // “19:30”

            const timeFimOnly = dataFim.split("T")[1].substring(0, 5); // “19:30”

            return {
              id: String(item.id_agenda),
              date: dateInicioOnly,
              timeInicio: timeInicioOnly,
              timeFim: timeFimOnly,
              client: item.ag_profissionai.nome_profissional,
              especialidade:
                item.ag_profissionai.especialidade.nome_especialidade,
              dataInicioISO: dataInicio,
              dataFimISO: dataFim,
              profissionalId: item.ag_profissionai.id_profissional,
              procedimentoId: item.id_procedimento,
            };
          });
        setEvents(adapted);
      })
      .catch((err) => {
        console.error("Erro ao buscar agendamentos:", err);
        setErrorMsg("Não foi possível carregar os agendamentos.");
      })
      .finally(() => setLoading(false));
  }, [events]);

  // Se estiver carregando, mostra um indicador
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#029046" />
      </SafeAreaView>
    );
  }

  // Se deu erro, exibe mensagem
  if (errorMsg) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </SafeAreaView>
    );
  }

  const eventsWithColor = events.map((ev) => ({
    ...ev,
    color: stringToHslColor(ev.especialidade), // ou ev.type, ou ev.id
  }));

  // 1) agrupe por data
  const grouped = eventsWithColor.reduce((acc, ev) => {
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push({
      key: `${ev.id}-${ev.color}`,
      color: ev.color,
    });
    return acc;
  }, {} as Record<string, { key: string; color: string }[]>);

  // 2) limite o número de dots
  const markedDates: Record<string, any> = {};
  for (const [date, dots] of Object.entries(grouped)) {
    let toShow = dots;
    let hasMore = false;

    if (dots?.length > MAX_DOTS) {
      toShow = dots.slice(0, MAX_DOTS);
      hasMore = true;
    }
    markedDates[date] = { dots: toShow };
  }

  // 3) adicione seleção se quiser
  if (selectedDate) {
    markedDates[selectedDate] = {
      ...(markedDates[selectedDate] || { dots: [] }),
      selected: true,
      selectedColor: "#029046",
    };
  }

  // ao clicar em "Editar" de um card
  const handleEdit = (ev: Event) => {
    setEditingEvent(ev);
    setEditTimeInicio(ev.timeInicio);
    setEditTimeFim(ev.timeFim);
    setEditClient(ev.client);
  };

  // salvar alterações
  function saveEdit() {
    if (!editingEvent) return;

    const profId = Number(editingEvent.profissionalId);

    const datePart = editingEvent.dataInicioISO.split("T")[0]; // ex: "2024-12-07"
    const dataInicioISO = `${datePart}T${editTimeInicio}:00.000Z`;
    const dataFimISO = new Date(`${datePart}T${editTimeFim}:00Z`);

    const payload = {
      data_inicio: dataInicioISO,
      data_fim: dataFimISO.toISOString(),
      ag_profissional_id: profId,
      // Se quiser enviar descrição complementar (por exemplo, nome do procedimento),
      // use a chave correta esperada pela API, algo como:
      // descricao_complementar: editingEvent.procedimento,
      // id_procedimento: editingEvent.id_procedimento,
    };

    api
      .put(`/agenda/${editingEvent.id}`, payload)
      .then(() => {
        // Atualize o estado local com as mudanças visuais
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === editingEvent.id
              ? {
                  ...ev,
                  timeInicio: editTimeInicio,
                  timeFim: editTimeFim,
                  client: editClient,
                }
              : ev
          )
        );
        setEditingEvent(null);
        Alert.alert("Sucesso", "Agendamento salvo com sucesso.");
      })
      .catch((err) => {
        console.error("Erro ao editar agendamento:", err);
        Alert.alert("Falha ao salvar alterações");
      });
  }

  // ao clicar em "Cancelar Evento" de um card
  const handleCancelar = () => {
    if (!editingEvent) return;

    Alert.alert(
      "Cancelar Evento",
      "Tem certeza que deseja cancelar este evento?",
      [
        {
          text: "Retornar",
          style: "cancel",
        },
        {
          text: "Cancelar",
          style: "destructive",
          onPress: () => {
            api
              .delete(`/agenda/${editingEvent.id}`)
              .then(() => {
                setEvents((prev) =>
                  prev.filter((ev) => ev.id !== editingEvent.id)
                );
                setEditingEvent(null);
                Alert.alert("Sucesso", "Agendamento cancelado.");
              })
              .catch((err) => {
                console.error("Erro ao cancelar agendamento:", err);
                Alert.alert("Falha ao cancelar o evento.");
              });
          },
        },
      ]
    );
  };

  const filteredEvents = selectedDate
    ? events.filter((appt) => appt.date === selectedDate)
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <View
        style={[styles.content, { flexDirection: isNarrow ? "column" : "row" }]}
      >
        <View
          style={[
            styles.calendarContainer,
            isNarrow
              ? { width: "100%", marginBottom: 16 }
              : { width: "35%", height: "100%" },
          ]}
        >
          <CalendarView
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
          />
        </View>

        <View
          style={[isNarrow ? styles.listContainer : styles.sideListContainer]}
        >
          {selectedDate ? (
            <DateHeader dateString={selectedDate} />
          ) : (
            <Text style={styles.title}>Selecione uma data</Text>
          )}

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {selectedDate !== null && filteredEvents?.length === 0 ? (
              <Text style={styles.hint}>
                Nenhum agendamento para esta data.
              </Text>
            ) : (
              filteredEvents.map((ev) => (
                <AppointmentCard
                  key={ev.id}
                  dataInicio={ev.dataInicioISO.split("T")[1].substring(0, 5)}
                  dataFim={ev.dataFimISO.split("T")[1].substring(0, 5)}
                  client={ev.client}
                  onEdit={() => handleEdit(ev)}
                />
              ))
            )}
          </ScrollView>
        </View>
      </View>
      {/* Modal de edição */}
      <Modal visible={!!editingEvent} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Agendamento</Text>
              <TouchableOpacity onPress={() => setEditingEvent(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.hours}>
              <View>
                <Text>Horário de Início</Text>
                <TextInput
                  style={styles.inputHours}
                  value={editTimeInicio}
                  onChangeText={setEditTimeInicio}
                />
              </View>
              <View>
                <Text>Horário de Término</Text>
                <TextInput
                  style={styles.inputHours}
                  value={editTimeFim}
                  onChangeText={setEditTimeFim}
                />
              </View>
            </View>

            <Text style={{ marginTop: 12 }}>Cliente</Text>
            <TextInput
              style={styles.inputReadOnly}
              value={editClient}
              readOnly
              onChangeText={setEditClient}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancelar}
              >
                <Text style={styles.cancelText}>Cancelar Evento</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.saveButton]}
                onPress={saveEdit}
              >
                <Text style={styles.saveText}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/** gera um inteiro 0..(mod-1) a partir de uma string */
function hashString(str: string, mod = 360) {
  let hash = 0;
  for (let i = 0; i < str?.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // converte para 32-bit
  }
  return Math.abs(hash) % mod;
}

/** converte uma string em uma cor HSL bem distribuída */
function stringToHslColor(str: string) {
  const hue = hashString(str, 360); // 0–359°
  const saturation = 90; // fixa 65% de saturação
  const lightness = 50; // fixa 50% de luminosidade
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F2" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#C0392B", fontSize: 16 },
  content: { flex: 1 },

  calendarContainer: {
    backgroundColor: "#fff",
  },

  listContainer: {
    width: "100%",
    display: "flex",
    flex: 1,
    paddingHorizontal: 16,
  },

  sideListContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start", // topo alinhado
    paddingRight: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },

  scrollContent: {
    marginLeft: "20%",
    paddingBottom: 20,
  },

  hint: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },

  // modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: 24,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  modalClose: { fontSize: 20, color: "#666" },
  hours: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputHours: {
    maxWidth: "90%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    height: 40,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  inputReadOnly: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#e9e9e9",
    borderRadius: 6,
    height: 40,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    height: 40,
    paddingHorizontal: 8,
    marginTop: 4,
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
  saveButton: {
    backgroundColor: "#27AE60",
  },
  cancelButton: {
    backgroundColor: "#C0392B",
    marginRight: 8,
  },
  cancelText: { color: "#FFF", fontWeight: "600" },
  saveText: { color: "#FFF", fontWeight: "600" },
});
