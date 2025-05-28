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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import CalendarView from "../components/CalendarView";
import DateHeader from "../components/DateHeader";
import AppointmentCard from "../components/AppointmentCard";

type Event = {
  id: string;
  date: string;
  time: string;
  client: string;
  especialidade: string;
};

export default function ScheduleScreen() {
  const MAX_DOTS = 3;
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  // estado do modal de edição
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editTime, setEditTime] = useState("");
  const [editClient, setEditClient] = useState("");
  const { width } = useWindowDimensions();
  const isNarrow = width < 600;

  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      date: "2025-05-08",
      time: "09:00",
      client: "João Silva",
      especialidade: "Medicina",
    },
    {
      id: "2",
      date: "2025-05-08",
      time: "10:30",
      client: "Maria Souza",
      especialidade: "NPJ",
    },
    {
      id: "3",
      date: "2025-05-10",
      time: "11:00",
      client: "Carlos Pereira",
      especialidade: "Enfermagem",
    },
    {
      id: "4",
      date: "2025-05-15",
      time: "10:30",
      client: "Maria Souza",
      especialidade: "Odontologia",
    },
  ]);
  const eventsWithColor = events.map((ev) => ({
    ...ev,
    color: stringToHslColor(ev.especialidade), // ou ev.type, ou ev.id
  }));

  // 1) agrupe por data
  const grouped = eventsWithColor.reduce((acc, ev) => {
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push({ key: `${ev.date}-${ev.color}`, color: ev.color });
    return acc;
  }, {} as Record<string, { key: string; color: string }[]>);

  // 2) limite o número de dots
  const markedDates: Record<string, any> = {};
  for (const [date, dots] of Object.entries(grouped)) {
    let toShow = dots;
    let hasMore = false;

    if (dots.length > MAX_DOTS) {
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
    setEditTime(ev.time);
    setEditClient(ev.client);
  };

  // salvar alterações
  const saveEdit = () => {
    if (!editingEvent) return;
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === editingEvent.id
          ? { ...ev, time: editTime, client: editClient }
          : ev
      )
    );
    setEditingEvent(null);
  };

  // ao clicar em "Cancelar Evento" de um card
  const handleCancelar = () => {
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
            setEditingEvent(null);
            console.log("Evento Cancelado"); // inserir lógica de cancelamento
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
            {selectedDate !== null && filteredEvents.length === 0 ? (
              <Text style={styles.hint}>
                Nenhum agendamento para esta data.
              </Text>
            ) : (
              filteredEvents.map((ev) => (
                <AppointmentCard
                  key={ev.id}
                  time={ev.time}
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
            <Text>Hora</Text>
            <TextInput
              style={styles.input}
              value={editTime}
              onChangeText={setEditTime}
            />

            <Text style={{ marginTop: 12 }}>Cliente</Text>
            <TextInput
              style={styles.input}
              value={editClient}
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
  for (let i = 0; i < str.length; i++) {
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
