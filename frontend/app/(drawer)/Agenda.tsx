// ScheduleScreen.tsx atualizado para o novo modelo de dados
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import CalendarView from "../../components/CalendarView";
import DateHeader from "../../components/DateHeader";
import AppointmentCard from "../../components/AppointmentCard";
import api from "../../../frontend/src/services/api";
import EditAppointmentModal, {
  EditedEvent,
  Especialidade,
  ProcedimentoDTO,
  ProfissionalDTO,
} from "@/components/EditAppointmentModal";
import CreateAppointmentForm from "@/components/CreateAppointmentForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Toast from "react-native-toast-message";

export default function ScheduleScreen() {
  const MAX_DOTS = 3;
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [eventos, setEventos] = useState<EditedEvent[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EditedEvent | null>(null);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [procedimentos, setProcedimentos] = useState<ProcedimentoDTO[]>([]);
  const [profissionais, setProfissionais] = useState<ProfissionalDTO[]>([]);
  const { width } = useWindowDimensions();
  const isNarrow = width < 600;

  useEffect(() => {
    carregarEventos();
    api
      .get("/especialidades")
      .then((res) => setEspecialidades(res.data))
      .catch(console.error);
    api
      .get("/procedimentos")
      .then((res) => setProcedimentos(res.data))
      .catch(console.error);
    api
      .get("/profissionais")
      .then((res) => setProfissionais(res.data))
      .catch(console.error);
  }, [eventos]);

  const carregarEventos = async () => {
    try {
      const response = await api.get("/agenda");
      setEventos(response.data);
    } catch (err) {
      console.error("Erro ao carregar eventos:", err);
    }
  };

  const eventosWithColor = eventos.map((ev) => ({
    ...ev,
    color: stringToHslColor(
      ev.procedimento?.especialidades?.[0]?.DESCESPEC || ""
    ),
  }));

  const grouped = eventosWithColor.reduce((acc, ev) => {
    const dateOnly = ev.DATAABERT?.split("T")[0];
    if (!acc[dateOnly]) acc[dateOnly] = [];
    acc[dateOnly].push({ key: `${ev.IDAGENDA}-${ev.color}`, color: ev.color });
    return acc;
  }, {} as Record<string, { key: string; color: string }[]>);

  const markedDates: Record<string, any> = {};
  for (const [date, dots] of Object.entries(grouped)) {
    markedDates[date] = { dots: dots.slice(0, MAX_DOTS) };
  }
  if (selectedDate) {
    markedDates[selectedDate] = {
      ...(markedDates[selectedDate] || { dots: [] }),
      selected: true,
      selectedColor: "#029046",
    };
  }

  const handleEdit = (ev: EditedEvent) => {
    setSelectedEvent(ev);
    setModalVisible(true);
  };

  const handleClose = () => {
    setModalVisible(false);
    setSelectedEvent(null);
  };

  const handleSave = (updated: EditedEvent) => {
    updated = { ...updated, SOLICMASTER: 1 };
    api
      .put(`/agenda/${updated.IDAGENDA}`, updated)
      .then(() => {
        setEventos((prev) =>
          prev.map((e) => (e.IDAGENDA === updated.IDAGENDA ? updated : e))
        );
        handleClose();
        Toast.show({
          type: "success",
          text1: "Agendamento salvo com sucesso!",
        });
      })
      .catch((err) => {
        console.error("Erro ao salvar:", err);
        Toast.show({
          type: "error",
          text1: "Erro ao salvar agendamento",
          text2: "Não foi possível salvar as alterações.",
        });
      });
  };

  const handleDelete = (id: number, cancelReason?: string) => {
    api
      .put(`/agenda/${id}`, {
        SITUAGEN: 3,
        SOLICMASTER: 1,
        MOTIALT: cancelReason,
      })
      .then(() => {
        setEventos((prev) => prev.filter((e) => e.IDAGENDA !== id));
        handleClose();
        Toast.show({
          type: "success",
          text1: "Agendamento cancelado com sucesso!",
        });
      })
      .catch((err) => {
        console.error("Erro ao cancelar:", err);
        Toast.show({
          type: "error",
          text1: "Erro ao cancelar agendamento",
          text2: "Não foi possível cancelar o agendamento.",
        });
      });
  };

  const filteredEventos = selectedDate
    ? eventos.filter((e) => e.DATAABERT?.split("T")[0] === selectedDate)
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
            isNarrow ? { width: "100%" } : { width: "35%" },
          ]}
        >
          <CalendarView
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
          />
        </View>

        <View
          style={isNarrow ? styles.listContainer : styles.sideListContainer}
        >
          <CreateAppointmentForm onHandleSubmit={carregarEventos} />
          {selectedDate ? (
            <>
              <DateHeader dateString={selectedDate} />
            </>
          ) : (
            <Text style={styles.title}>Selecione uma data</Text>
          )}

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {selectedDate && filteredEventos.length === 0 ? (
              <Text style={styles.hint}>
                Nenhum agendamento para esta data.
              </Text>
            ) : (
              filteredEventos.map((ev) => (
                <AppointmentCard
                  key={ev.IDAGENDA}
                  dataInicio={format(new Date(ev.DATAABERT), "HH:mm", {
                    locale: ptBR,
                  })}
                  dataNova={
                    ev.DATANOVA
                      ? format(new Date(ev.DATANOVA), "HH:mm", {
                          locale: ptBR,
                        })
                      : undefined
                  }
                  solicMaster={ev.SOLICMASTER}
                  procedimento={ev.procedimento?.DESCRPROC}
                  profissional={ev.profissional?.pessoa?.NOMEPESSOA}
                  especialidade={
                    ev.procedimento?.especialidades?.[0]?.DESCESPEC
                  }
                  onEdit={() => handleEdit(ev)}
                />
              ))
            )}
          </ScrollView>
        </View>

        {selectedEvent && (
          <EditAppointmentModal
            visible={modalVisible}
            editedEvent={selectedEvent}
            especialidades={especialidades}
            procedimentos={procedimentos}
            profissionais={profissionais}
            onClose={handleClose}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function hashString(str: string, mod = 360) {
  let hash = 0;
  for (let i = 0; i < str?.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % mod;
}

function stringToHslColor(str: string) {
  const hue = hashString(str, 360);
  return `hsl(${hue}, 90%, 50%)`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F2" },
  content: { flex: 1 },
  calendarContainer: { backgroundColor: "#fff" },
  listContainer: { width: "100%", flex: 1, paddingHorizontal: 16 },
  sideListContainer: { flex: 1, paddingRight: 16 },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  scrollContent: { marginLeft: "20%", paddingBottom: 20 },
  hint: { textAlign: "center", color: "#666", marginTop: 20 },
});
