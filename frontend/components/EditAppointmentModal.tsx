// src/components/EditAppointmentModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Button,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import api from "@/src/services/api";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/src/utils/toastConfig";

export type EditedEvent = {
  IDAGENDA: number;
  ID_PESSOAFIS: number;
  ID_PROFISSIO: number;
  ID_PROCED: number;
  pessoaFisAgenda: {
    NOMEPESSOA: string;
  };
  profissional: {
    IDPROFISSIO: number;
    especialidade: { IDESPEC: number; DESCESPEC: string };
    pessoa: { NOMEPESSOA: string };
  };
  procedimento: {
    IDPROCED: number;
    DESCRPROC: string;
    especialidades: [
      {
        IDESPEC: number;
        DESCESPEC: string;
      }
    ];
  };
  SOLICMASTER: number;
  DESCRCOMP: string;
  DATANOVA: string | null;
  DATAABERT: string;
  SITUAGEN: number;
  MOTIALT: string;
};

export type Especialidade = {
  IDESPEC: number;
  DESCESPEC: string;
};
export type ProcedimentoDTO = {
  IDPROCED: number;
  DESCRPROC: string;
  especialidades: [
    {
      IDESPEC: 5;
      DESCESPEC: "Nutrição";
    }
  ];
};
export type ProfissionalDTO = {
  IDPROFISSIO: number;
  NOMEPESSOA: string;
  pessoa: {
    NOMEPESSOA: string;
  };
};

export type ProfiEspec = {
  IDPROFISSIO: number;
  especialidade: {
    IDESPEC: number;
    DESCESPEC: string;
  };
  pessoa: {
    NOMEPESSOA: string;
  };
};

export type PessoaFis = {
  IDPESSOAFIS: number;
  NOMEPESSOA: string;
};

type Props = {
  visible: boolean;
  editedEvent: EditedEvent;
  especialidades: Especialidade[];
  procedimentos: ProcedimentoDTO[];
  profissionais: ProfissionalDTO[];
  onClose: () => void;
  onSave: (updated: EditedEvent) => void;
  onDelete: (idAgenda: number, cancelReason?: string) => void;
};

const toMysqlString = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

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
  const [showStartIOS, setShowStartIOS] = useState(false);
  const [selectedProfissional, setSelectedProfissional] = useState<number>(
    editedEvent.ID_PROFISSIO
  );
  const [descComplementar, setDescComplementar] = useState(
    editedEvent.DESCRCOMP
  );
  const [startDate, setStartDate] = useState<Date>(
    new Date(editedEvent.DATAABERT)
  );
  const [collapsed, setCollapsed] = useState(true);
  const [filteredProfs, setFilteredProfs] = useState<ProfiEspec[]>([]);

  const getEspecialidadeNome = (id: number): string => {
    return (
      especialidades.find((e) => e.IDESPEC === id)?.DESCESPEC || "Especialidade"
    );
  };

  const [tituloAgenda, setTituloAgenda] = useState(() => {
    const proc = editedEvent?.procedimento?.DESCRPROC || "Procedimento";
    const esp = getEspecialidadeNome(
      editedEvent?.procedimento?.especialidades[0]?.IDESPEC
    );
    const prof =
      editedEvent?.profissional?.pessoa?.NOMEPESSOA || "Profissional";
    return `${proc} com ${esp} - ${prof}`;
  });

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const handleDateTimeChange = (newDate: Date) => {
    setStartDate(newDate);
  };

  const openAndroidPicker = () => {
    const current = startDate;
    const minDate = new Date();

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
            handleDateTimeChange(composed);
          },
        });
      },
    });
  };

  const IOSPicker = ({ value }: { value: Date }) => (
    <DateTimePicker
      value={value}
      mode="datetime"
      display="spinner"
      onChange={(_, d) => d && handleDateTimeChange(d)}
      minimumDate={new Date()}
    />
  );

  const fmt = (d: Date) =>
    d.toLocaleDateString() +
    " " +
    d
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      .replace(":", "h");

  const handleSave = () => {
    const updated: EditedEvent = {
      ...editedEvent,
      ID_PROFISSIO: selectedProfissional,
      DESCRCOMP: descComplementar,
      DATAABERT: toMysqlString(startDate),
      DATANOVA: null,
      SOLICMASTER: 1,
    };
    onSave(updated);
  };

  const firstEspecId = editedEvent.procedimento?.especialidades?.[0]?.IDESPEC;
  const procs = procedimentos.filter((p) =>
    p.especialidades?.some((esp) => esp.IDESPEC === firstEspecId)
  );

  useEffect(() => {
    const specialty = editedEvent.procedimento.especialidades[0].IDESPEC;
    if (!specialty) return;

    api
      .get<ProfiEspec[]>(`/especialidade/${specialty}/profissionais`)
      .then((res) => setFilteredProfs(res.data))
      .catch((err) => {
        console.error("Erro ao carregar profissionais:", err);
        setFilteredProfs([]);
      });
  }, [editedEvent]);

  useEffect(() => {
    const prof = profissionais.find(
      (p) => p.IDPROFISSIO === selectedProfissional
    );
    const proc = editedEvent?.procedimento?.DESCRPROC || "Procedimento";
    const esp = getEspecialidadeNome(
      editedEvent?.procedimento?.especialidades[0]?.IDESPEC
    );
    const nomeProf = prof?.pessoa?.NOMEPESSOA || "Profissional";
    setTituloAgenda(`${proc} com ${esp} - ${nomeProf}`);
  }, [selectedProfissional]);

  return (
    <Modal transparent visible={visible} animationType="slide">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.inner}>
              <Text style={styles.modalTitle}>{tituloAgenda}</Text>

              <Text style={styles.label}>Especialidade</Text>
              <View style={[styles.pickerWrapper, { backgroundColor: "#eee" }]}>
                <Picker enabled={false} selectedValue={firstEspecId}>
                  {especialidades
                    .sort((a, b) => a.DESCESPEC.localeCompare(b.DESCESPEC))
                    .map((e) => (
                      <Picker.Item
                        key={e.IDESPEC}
                        label={e.DESCESPEC}
                        value={e.IDESPEC}
                      />
                    ))}
                </Picker>
              </View>

              <Text style={styles.label}>Procedimento</Text>
              <View style={[styles.pickerWrapper, { backgroundColor: "#eee" }]}>
                <Picker enabled={false} selectedValue={editedEvent.ID_PROCED}>
                  {procs
                    .sort((a, b) => a.DESCRPROC.localeCompare(b.DESCRPROC))
                    .map((p) => (
                      <Picker.Item
                        key={p.IDPROCED}
                        label={p.DESCRPROC}
                        value={p.IDPROCED}
                      />
                    ))}
                </Picker>
              </View>

              <Text style={styles.label}>Paciente</Text>
              <View style={[styles.pickerWrapper, { backgroundColor: "#eee" }]}>
                <Picker enabled={false} selectedValue={editedEvent.ID_PROCED}>
                  <Picker.Item
                    key={editedEvent.ID_PESSOAFIS}
                    label={editedEvent.pessoaFisAgenda?.NOMEPESSOA}
                    value={editedEvent.ID_PESSOAFIS}
                  />
                </Picker>
              </View>

              <Text style={[styles.label, { marginTop: 12 }]}>
                Profissional Responsável
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedProfissional}
                  onValueChange={(id) => {
                    setSelectedProfissional(id);
                    const prof = profissionais.find(
                      (p) => p.IDPROFISSIO === id
                    );
                    if (prof) {
                      const proc = editedEvent.procedimento.DESCRPROC;
                      const esp =
                        editedEvent.procedimento.especialidades[0].DESCESPEC;
                      setTituloAgenda(
                        `${proc} com ${esp} - ${prof.pessoa.NOMEPESSOA}`
                      );
                    }
                  }}
                >
                  {filteredProfs
                    .sort((a, b) =>
                      a.pessoa.NOMEPESSOA.localeCompare(b.pessoa.NOMEPESSOA)
                    )
                    .map((p) => (
                      <Picker.Item
                        key={p.IDPROFISSIO}
                        label={p.pessoa.NOMEPESSOA}
                        value={p.IDPROFISSIO}
                      />
                    ))}
                </Picker>
              </View>
              <Text style={[styles.label, { marginTop: 12 }]}>Início</Text>
              <TouchableOpacity
                style={styles.dateTimeInput}
                onPress={() =>
                  Platform.OS === "android"
                    ? openAndroidPicker()
                    : setShowStartIOS(true)
                }
              >
                <Text>{fmt(startDate)}</Text>
              </TouchableOpacity>
              {editedEvent.DATANOVA && editedEvent.SOLICMASTER === 0 && (
                <Text style={styles.warning}>
                  * Aguardando aprovação para troca de horário para{" "}
                  {" " + fmt(new Date(editedEvent.DATANOVA))}
                </Text>
              )}

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
                </>
              )}

              <View style={styles.footerRow}>
                <View style={{ flex: 1, marginRight: 4 }}>
                  <Button
                    title="Cancelar"
                    color="#C0392B"
                    onPress={() => setCancelModalVisible(true)}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 4 }}>
                  <Button title="Salvar Alterações" onPress={handleSave} />
                </View>
              </View>

              <View style={{ marginTop: 16 }}>
                <Button title="Fechar" color="#555" onPress={onClose} />
              </View>
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>

      {Platform.OS === "ios" && showStartIOS && (
        <View style={styles.iosPickerContainer}>
          <IOSPicker value={startDate} />
          <Button title="OK" onPress={() => setShowStartIOS(false)} />
        </View>
      )}
      {cancelModalVisible && (
        <Modal
          transparent
          animationType="fade"
          visible={cancelModalVisible}
          onRequestClose={() => setCancelModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.overlay}>
              <View style={styles.cancelModal}>
                <Text
                  style={[styles.label, styles.modalTitle, { fontSize: 16 }]}
                >
                  📝 DESCREVA O MOTIVO DO CANCELAMENTO:
                </Text>
                <TextInput
                  style={[styles.textArea, { height: 96 }]}
                  placeholder="Descreva o motivo do cancelamento"
                  value={cancelReason}
                  onChangeText={setCancelReason}
                  multiline
                />
                <View style={styles.footerRow}>
                  <View style={{ flex: 1, marginRight: 4 }}>
                    <Button
                      title="Fechar"
                      color="#777"
                      onPress={() => setCancelModalVisible(false)}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 4 }}>
                    <Button
                      title="Confirmar"
                      color="#C0392B"
                      onPress={() => {
                        if (!cancelReason.trim()) {
                          Toast.show({
                            type: "error",
                            text1: "Erro",
                            text2:
                              "Por favor, informe o motivo do cancelamento.",
                          });
                          return;
                        }

                        setCancelModalVisible(false);
                        onDelete(editedEvent.IDAGENDA, cancelReason);
                      }}
                    />
                  </View>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
      <Toast config={toastConfig} />
    </Modal>
  );
}

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
  cancelModal: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  smallNote: { fontSize: 12, color: "#666", marginTop: 4 },
  warning: { fontSize: 12, color: "#D9AB0C", marginTop: 4, fontWeight: "bold" },
  footerRow: { flexDirection: "row", marginTop: 24 },
});
