// app/(tabs)/index.tsx
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import CalendarView from "../components/CalendarView";
import DateHeader from "../components/DateHeader";
import AppointmentCard from "../components/AppointmentCard";
import api from "../../frontend/src/services/api";
import EditAppointmentModal, {
  EditedEvent,
  Especialidade,
  ProcedimentoDTO,
  ProfissionalDTO,
} from "@/components/EditAppointmentModal";
import CreateAppointmentForm from "@/components/CreateAppointmentForm";

export interface AgProfissional {
  codEspecialidade: string;
  especialidade: {
    codEspecialidade: string;
    nomeEspecialidade: string;
  };
  idProfissional: number;
  nomeProfissional: string;
}

export interface Procedimento {
  codEspecialidade: string;
  especialidade: {
    codEspecialidade: string;
    nomeEspecialidade: string;
  };
  idProcedimento: number;
  descricaoProcedimento: string;
}

type Evento = {
  agProfissional: AgProfissional;
  dataFim: Date;
  dataInicio: Date;
  timeInicio?: string;
  timeFim?: string;
  descricaoComplementar: string;
  idAgenda: number;
  idProcedimento: number;
  idProfissional: number;
  procedimento: Procedimento;
  transporte: boolean;
  profissional?: AgProfissional;
};

export default function ScheduleScreen() {
  const MAX_DOTS = 3;
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [eventos, setEventos] = useState<EditedEvent[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EditedEvent | null>(null);
  // estado do modal de edição
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [editTimeInicio, setEditTimeInicio] = useState("");
  const [editTimeFim, setEditTimeFim] = useState("");
  const [editClient, setEditClient] = useState("");

  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [procedimentos, setProcedimentos] = useState<ProcedimentoDTO[]>([]);
  const [profissionais, setProfissionais] = useState<ProfissionalDTO[]>([]);

  const { width } = useWindowDimensions();
  const isNarrow = width < 600;

  useEffect(() => {
    // 1) Carrega eventos de "/agenda"
    api
      .get<EditedEvent[]>("/agenda")
      .then((res) => setEventos(res.data))
      .catch(console.error);

    // 2) Carrega especialidades, procedimentos, profissionais
    api
      .get<Especialidade[]>("/especialidades")
      .then((res) => setEspecialidades(res.data))
      .catch(console.error);

    api
      .get<ProcedimentoDTO[]>("/procedimentos")
      .then((res) => setProcedimentos(res.data))
      .catch(console.error);

    api
      .get<ProfissionalDTO[]>("/profissionais")
      .then((res) => setProfissionais(res.data))
      .catch(console.error);
  }, []);

  const EventosWithColor = eventos.map((ev) => ({
    ...ev,
    color: stringToHslColor(
      ev.ag_profissionai.especialidade.nome_especialidade
    ), // ou ev.type, ou ev.id
  }));

  useEffect(() => {
    // 1) Carrega eventos de "/agenda"
    api
      .get<EditedEvent[]>("/agenda")
      .then((res) => setEventos(res.data))
      .catch(console.error);
  }, [eventos]);

  type DotInfo = { key: string; color: string };
  type MarkedRecord = Record<string, DotInfo[]>;

  const grouped: MarkedRecord = EventosWithColor.reduce((acc, ev) => {
    const dateOnly = ev.data_inicio.toString().split("T")[0];
    if (!acc[dateOnly]) {
      acc[dateOnly] = [];
    }
    acc[dateOnly].push({
      key: `${ev.id_agenda}-${ev.color}`,
      color: ev.color,
    });
    return acc;
  }, {} as MarkedRecord);

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
  const handleEdit = (ev: EditedEvent) => {
    setSelectedEvent(ev);
    setModalVisible(true);
  };

  // salvar alterações
  function saveEdit() {
    if (!editingEvento) return;

    const profId = Number(editingEvento.idProfissional);

    const datePart = editingEvento.dataInicio.toString().split("T")[0]; // ex: "2024-12-07"
    const dataInicioISO = `${datePart} ${editTimeInicio}:00`;
    const dataFimISO = `${datePart} ${editTimeFim}:00`;

    const payload = {
      data_inicio: dataInicioISO,
      data_fim: dataFimISO,
      ag_profissional_id: profId,
      // Se quiser enviar descrição complementar (por exemplo, nome do procedimento),
      // use a chave correta esperada pela API, algo como:
      // descricao_complementar: editingEvento.procedimento,
      // id_procedimento: editingEvento.id_procedimento,
    };

    api
      .put(`/agenda/${editingEvento.idAgenda}`, payload)
      .then(() => {
        // Atualize o estado local com as mudanças visuais
        setEventos((prev) =>
          prev.map((ev) =>
            ev.id_agenda === editingEvento.idAgenda
              ? {
                  ...ev,
                  timeInicio: editTimeInicio,
                  timeFim: editTimeFim,
                  client: editClient,
                }
              : ev
          )
        );
        setEditingEvento(null);
        Alert.alert("Sucesso", "Agendamento salvo com sucesso.");
      })
      .catch((err) => {
        console.error("Erro ao editar agendamento:", err);
        Alert.alert("Falha ao salvar alterações");
      });
  }

  // ao clicar em "Cancelar Evento" de um card
  const handleCancelar = () => {
    if (!editingEvento) return;

    Alert.alert(
      "Cancelar Evento",
      "Tem certeza que deseja cancelar este Evento?",
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
              .delete(`/agenda/${editingEvento.idAgenda}`)
              .then(() => {
                setEventos((prev) =>
                  prev.filter((ev) => ev.id_agenda !== editingEvento.idAgenda)
                );
                setEditingEvento(null);
                Alert.alert("Sucesso", "Agendamento cancelado.");
              })
              .catch((err) => {
                console.error("Erro ao cancelar agendamento:", err);
                Alert.alert("Falha ao cancelar o Evento.");
              });
          },
        },
      ]
    );
  };

  // Quando selecionar um evento para editar:
  const openEdit = (ev: EditedEvent) => {
    setSelectedEvent(ev);
    setModalVisible(true);
  };

  // Ao fechar sem salvar:
  const handleClose = () => {
    setModalVisible(false);
    setSelectedEvent(null);
  };

  // Ao salvar alterações:
  const handleSave = (updated: EditedEvent) => {
    api
      .put(`/agenda/${updated.id_agenda}`, {
        data_inicio: updated.data_inicio,
        data_fim: updated.data_fim,
        descricao_complementar: updated.descricao_complementar,
        id_profissional: updated.id_profissional,
        id_procedimento: updated.id_procedimento,
        transporte: updated.transporte,
      })
      .then(() => {
        // Atualiza localmente a lista de events
        setEventos((prev) =>
          prev.map((e) => (e.id_agenda === updated.id_agenda ? updated : e))
        );
        setModalVisible(false);
        setSelectedEvent(null);
        Alert.alert("Sucesso", "Agendamento salvo com sucesso.");
      })
      .catch((err) => {
        console.error("Erro ao salvar:", err);
        Alert.alert("Erro", "Não foi possível salvar alterações.");
      });
  };

  // Ao deletar:
  const handleDelete = (idAgenda: number) => {
    api
      .delete(`/agenda/${idAgenda}`)
      .then(() => {
        setEventos((prev) => prev.filter((e) => e.id_agenda !== idAgenda));
        setModalVisible(false);
        setSelectedEvent(null);
        Alert.alert("Removido", "Agendamento excluído com sucesso.");
      })
      .catch((err) => {
        console.error("Erro ao excluir:", err);
        Alert.alert("Erro", "Não foi possível excluir.");
      });
  };

  const filteredEventos = selectedDate
    ? eventos.filter(
        (appt) => appt.data_inicio.toString().split("T")[0] === selectedDate
      )
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
            <>
              <CreateAppointmentForm />
              <DateHeader dateString={selectedDate} />
            </>
          ) : (
            <Text style={styles.title}>Selecione uma data</Text>
          )}

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {selectedDate !== null && filteredEventos?.length === 0 ? (
              <Text style={styles.hint}>
                Nenhum agendamento para esta data.
              </Text>
            ) : (
              filteredEventos.map((ev) => (
                <AppointmentCard
                  key={ev.id_agenda}
                  dataInicio={new Date(ev.data_inicio).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  dataFim={new Date(ev.data_fim).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  procedimento={ev.procedimento?.procedimento}
                  profissional={ev.ag_profissionai?.nome_profissional}
                  especialidade={
                    ev.ag_profissionai?.especialidade?.nome_especialidade
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
