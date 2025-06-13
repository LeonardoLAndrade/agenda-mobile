// src/components/EditAppointmentModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Button,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import api from "../src/services/api";

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */
export type EditedEvent = {
  [x: string]: any;
  id_agenda: number;
  id_profissional: number;
  id_procedimento: number;
  titulo_agenda: string;
  ag_profissional: {
    cod_especialidade: string;
    especialidade: { cod_especialidade: string; nome_especialidade: string };
    id_profissional: number;
    nome_profissional: string;
  };
  procedimento: {
    cod_especialidade: string;
    especialidade: { cod_especialidade: string; nome_especialidade: string };
    id_procedimento: number;
    procedimento: string;
  };
  descricao_complementar: string;
  data_inicio: string;
  data_fim: string;
  transporte: boolean;
  situacao: boolean;
};

export type Especialidade = {
  cod_especialidade: string;
  nome_especialidade: string;
};
export type ProcedimentoDTO = {
  id_procedimento: number;
  procedimento: string;
  cod_especialidade: string;
};
export type ProfissionalDTO = {
  id_profissional: number;
  nome_profissional: string;
  cod_especialidade: string;
};

type Props = {
  visible: boolean;
  editedEvent: EditedEvent;
  especialidades: Especialidade[];
  procedimentos: ProcedimentoDTO[];
  profissionais: ProfissionalDTO[];
  onClose: () => void;
  onSave: (updated: EditedEvent) => void;
  onDelete: (idAgenda: number) => void;
};

/* ------------------------------------------------------------------ */
/* Helper  - Date → "YYYY-MM-DD HH:mm:ss" (hora local, sem fuso)       */
/* ------------------------------------------------------------------ */
const toMysqlString = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */
export default function EditAppointmentModal({
  visible,
  editedEvent,
  especialidades,
  procedimentos,
  profissionais,
  onClose,
  onSave,
  onDelete,
}: Props) {
  /* ----------------------------- estados ----------------------------- */
  const [showStartIOS, setShowStartIOS] = useState(false);
  const [showEndIOS, setShowEndIOS] = useState(false);

  const [selectedProfissional, setSelectedProfissional] = useState<number>(
    editedEvent.id_profissional
  );
  const [descComplementar, setDescComplementar] = useState(
    editedEvent.descricao_complementar
  );

  const [startDate, setStartDate] = useState<Date>(
    new Date(editedEvent.data_inicio)
  );
  const [endDate, setEndDate] = useState<Date>(new Date(editedEvent.data_fim));
  const [needsTransport, setNeedsTransport] = useState(editedEvent.transporte);
  const [collapsed, setCollapsed] = useState(true);
  const [filteredProfs, setFilteredProfs] = useState<ProfissionalDTO[]>([]);
  const [tituloAgenda, setTituloAgenda] = useState(() => {
    const proc = editedEvent?.procedimento?.procedimento || "Procedimento";
    const esp =
      editedEvent?.procedimento?.especialidade?.nome_especialidade ||
      "Especialidade";
    const prof =
      editedEvent?.ag_profissionai?.nome_profissional || "Profissional";
    return `${proc} com ${esp} - ${prof}`;
  });

  /* ---------------- utilidade: mantém start < end ------------------- */
  const adjustEnd = (s: Date, e: Date) =>
    s >= e ? new Date(s.getTime() + 30 * 60_000) : e;

  const handleDateTimeChange = (type: "start" | "end", newDate: Date) => {
    if (type === "start") {
      setStartDate(newDate);
      setEndDate(adjustEnd(newDate, endDate));
    } else {
      setEndDate(adjustEnd(startDate, newDate));
    }
  };

  /* ------------------------- pickers Android ------------------------ */
  const openAndroidPicker = (type: "start" | "end") => {
    const current = type === "start" ? startDate : endDate;
    const minDate = type === "start" ? new Date() : startDate;

    DateTimePickerAndroid.open({
      value: current,
      mode: "date",
      minimumDate: minDate,
      onChange: (ev: DateTimePickerEvent, dp?: Date) => {
        if (ev.type !== "set" || !dp) return;

        DateTimePickerAndroid.open({
          value: current,
          mode: "time",
          is24Hour: true,
          onChange: (ev2: DateTimePickerEvent, tp?: Date) => {
            if (ev2.type !== "set" || !tp) return;
            const composed = new Date(
              dp.getFullYear(),
              dp.getMonth(),
              dp.getDate(),
              tp.getHours(),
              tp.getMinutes()
            );
            handleDateTimeChange(type, composed);
          },
        });
      },
    });
  };

  /* --------------------------- pickers iOS -------------------------- */
  const IOSPicker = ({
    value,
    type,
  }: {
    value: Date;
    type: "start" | "end";
  }) => (
    <DateTimePicker
      value={value}
      mode="datetime"
      display="spinner"
      onChange={(_, d) => d && handleDateTimeChange(type, d)}
      minimumDate={type === "start" ? new Date() : startDate}
    />
  );

  /* ---------------------- formatação para UI ------------------------ */
  const fmt = (d: Date) =>
    d.toLocaleDateString() +
    " " +
    d
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      .replace(":", "h");

  /* ----------------------------- salvar ----------------------------- */
  const handleSave = () => {
    const updated: EditedEvent = {
      ...editedEvent,
      id_profissional: selectedProfissional,
      descricao_complementar: descComplementar,
      data_inicio: toMysqlString(startDate), // string local
      data_fim: toMysqlString(endDate), // string local
      transporte: needsTransport,
    };
    onSave(updated); // envia para o backend
  };

  /* ---------------------- filtros fixos ----------------------------- */
  const specialty = editedEvent.procedimento.cod_especialidade;
  const procs = procedimentos.filter((p) => p.cod_especialidade === specialty);

  useEffect(() => {
    const specialty = editedEvent.procedimento.cod_especialidade;
    if (!specialty) return;

    api
      .get<ProfissionalDTO[]>(`/especialidade/${specialty}/profissionais`)
      .then((res) => setFilteredProfs(res.data))
      .catch((err) => {
        console.error("Erro ao carregar profissionais:", err);
        setFilteredProfs([]); // fallback vazio
      });
  }, [editedEvent]);

  /* ----------------------------- render ----------------------------- */
  return (
    <Modal transparent visible={visible} animationType="slide">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.inner}>
              <Text style={styles.modalTitle}>{tituloAgenda}</Text>

              {/* -------- especialidade -------- */}
              <Text style={styles.label}>Especialidade</Text>
              <View style={[styles.pickerWrapper, { backgroundColor: "#eee" }]}>
                <Picker enabled={false} selectedValue={specialty}>
                  {especialidades.map((e) => (
                    <Picker.Item
                      key={e.cod_especialidade}
                      label={e.nome_especialidade}
                      value={e.cod_especialidade}
                    />
                  ))}
                </Picker>
              </View>

              {/* -------- procedimento -------- */}
              <Text style={styles.label}>Procedimento</Text>
              <View style={[styles.pickerWrapper, { backgroundColor: "#eee" }]}>
                <Picker
                  enabled={false}
                  selectedValue={editedEvent.id_procedimento}
                >
                  {procs.map((p) => (
                    <Picker.Item
                      key={p.id_procedimento}
                      label={p.procedimento}
                      value={p.id_procedimento}
                    />
                  ))}
                </Picker>
              </View>

              {/* -------- profissional -------- */}
              <Text style={[styles.label, { marginTop: 12 }]}>
                Profissional Responsável
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedProfissional}
                  onValueChange={(id) => {
                    setSelectedProfissional(id);
                    const prof = filteredProfs.find(
                      (p) => p.id_profissional === id
                    );
                    if (prof) {
                      const proc = editedEvent.procedimento.procedimento;
                      const esp =
                        editedEvent.procedimento.especialidade
                          .nome_especialidade;
                      setTituloAgenda(
                        `${proc} com ${esp} - ${prof.nome_profissional}`
                      );
                    }
                  }}
                >
                  {filteredProfs.map((p) => (
                    <Picker.Item
                      key={p.id_profissional}
                      label={p.nome_profissional}
                      value={p.id_profissional}
                    />
                  ))}
                </Picker>
              </View>

              {/* -------- descrição -------- */}
              <Text style={[styles.label, { marginTop: 12 }]}>
                Descrição Complementar
              </Text>
              <TextInput
                style={[styles.textArea, { height: 80 }]}
                multiline
                value={descComplementar}
                onChangeText={setDescComplementar}
                placeholder="Digite a descrição complementar"
              />

              {/* -------- collapse -------- */}
              <TouchableOpacity
                style={styles.collapseButton}
                onPress={() => setCollapsed((c) => !c)}
              >
                <Text style={styles.collapseButtonText}>
                  {collapsed ? "Mostrar Detalhes" : "Ocultar Detalhes"}
                </Text>
              </TouchableOpacity>

              {!collapsed && (
                <>
                  {/* ---- início ---- */}
                  <Text style={[styles.label, { marginTop: 12 }]}>Início</Text>
                  <TouchableOpacity
                    style={styles.dateTimeInput}
                    onPress={() =>
                      Platform.OS === "android"
                        ? openAndroidPicker("start")
                        : setShowStartIOS(true)
                    }
                  >
                    <Text>{fmt(startDate)}</Text>
                  </TouchableOpacity>

                  {/* ---- término ---- */}
                  <Text style={[styles.label, { marginTop: 12 }]}>Término</Text>
                  <TouchableOpacity
                    style={styles.dateTimeInput}
                    onPress={() =>
                      Platform.OS === "android"
                        ? openAndroidPicker("end")
                        : setShowEndIOS(true)
                    }
                  >
                    <Text>{fmt(endDate)}</Text>
                  </TouchableOpacity>

                  {/* ---- transporte ---- */}
                  <View style={styles.transportRow}>
                    <Text style={styles.label}>Precisa de transporte?</Text>
                    <Switch
                      value={needsTransport}
                      onValueChange={setNeedsTransport}
                    />
                  </View>
                  <Text style={styles.smallNote}>
                    *Se não precisar, deixe desmarcado.
                  </Text>
                </>
              )}

              {/* -------- rodapé -------- */}
              <View style={styles.footerRow}>
                <View style={{ flex: 1, marginRight: 4 }}>
                  <Button
                    title="Apagar"
                    color="#C0392B"
                    onPress={() =>
                      Alert.alert("Apagar Agendamento", "Tem certeza?", [
                        { text: "Cancelar", style: "cancel" },
                        {
                          text: "Apagar",
                          style: "destructive",
                          onPress: () => onDelete(editedEvent.id_agenda),
                        },
                      ])
                    }
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 4 }}>
                  <Button title="Salvar Alterações" onPress={handleSave} />
                </View>
              </View>

              {/* -------- fechar -------- */}
              <View style={{ marginTop: 16 }}>
                <Button title="Fechar" color="#555" onPress={onClose} />
              </View>
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* -------- pickers iOS -------- */}
      {Platform.OS === "ios" && showStartIOS && (
        <View style={styles.iosPickerContainer}>
          <IOSPicker value={startDate} type="start" />
          <Button title="OK" onPress={() => setShowStartIOS(false)} />
        </View>
      )}
      {Platform.OS === "ios" && showEndIOS && (
        <View style={styles.iosPickerContainer}>
          <IOSPicker value={endDate} type="end" />
          <Button title="OK" onPress={() => setShowEndIOS(false)} />
        </View>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: 16,
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    maxHeight: "90%",
    overflow: "hidden",
  },
  inner: { padding: 16 },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  label: { fontSize: 14, fontWeight: "600" },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 6,
    marginTop: 4,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
    textAlignVertical: "top",
  },
  collapseButton: { marginTop: 12, alignSelf: "flex-start" },
  collapseButtonText: { color: "#0066CC", fontWeight: "600" },
  dateTimeInput: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 6,
    padding: 12,
    marginTop: 4,
  },
  iosPickerContainer: {
    backgroundColor: "white",
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  transportRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    justifyContent: "space-between",
  },
  smallNote: { fontSize: 12, color: "#666", marginTop: 4 },
  footerRow: { flexDirection: "row", marginTop: 24 },
});
