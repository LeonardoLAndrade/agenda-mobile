import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Platform,
  ScrollView,
  Switch,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  DateTimePickerAndroid,
  AndroidNativeProps,
} from "@react-native-community/datetimepicker";
import api from "../../frontend/src/services/api";
import {
  Especialidade,
  ProcedimentoDTO,
  ProfissionalDTO,
} from "./EditAppointmentModal";

export default function CreateAppointmentForm() {
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [procedimentos, setProcedimentos] = useState<ProcedimentoDTO[]>([]);
  const [profissionais, setProfissionais] = useState<ProfissionalDTO[]>([]);

  const [selectedEspecialidade, setSelectedEspecialidade] = useState<
    string | null
  >(null);
  const [selectedProcedimento, setSelectedProcedimento] = useState<
    number | null
  >(null);
  const [selectedProfissional, setSelectedProfissional] = useState<
    number | null
  >(null);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [descricao, setDescricao] = useState("");

  const [titulo, setTitulo] = useState("Título gerado automaticamente");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api.get("/especialidades").then((res) => setEspecialidades(res.data));
  }, []);

  const onSelectEspecialidade = (cod: string) => {
    setSelectedEspecialidade(cod);
    setSelectedProcedimento(null);
    setSelectedProfissional(null);

    api.get(`/especialidade/${cod}/procedimentos`).then((res) => {
      setProcedimentos(res.data);
    });

    api.get(`/especialidade/${cod}/profissionais`).then((res) => {
      setProfissionais(res.data);
    });
  };

  const onSelectProcedimento = (id: number) => {
    const proc = procedimentos.find((p) => p.IDPROCED === id);
    if (!proc) return;
    setSelectedProcedimento(id);
  };

  const onSelectProfissional = (id: number) => {
    const prof = profissionais.find((p) => p.IDPROFISSIO === id);
    if (!prof) return;
    setSelectedProfissional(id);
  };

  useEffect(() => {
    const proc = procedimentos.find((p) => p.IDPROCED === selectedProcedimento);
    const esp = especialidades.find(
      (e) => e.IDESPEC.toString() === selectedEspecialidade
    );
    const prof = profissionais.find(
      (p) => p.IDPROFISSIO === selectedProfissional
    );

    if (proc && esp && prof) {
      setTitulo(`${proc.DESCRPROC} com ${esp.DESCESPEC} - ${prof.NOMEPESSOA}`);
    } else {
      setTitulo("Título gerado automaticamente");
    }
  }, [selectedEspecialidade, selectedProcedimento, selectedProfissional]);

  const toMysqlString = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const showPicker = (type: "start" | "end") => {
    const value = type === "start" ? startDate : endDate;
    const onChange: AndroidNativeProps["onChange"] = (_, date) => {
      if (date) {
        type === "start" ? setStartDate(date) : setEndDate(date);
      }
    };

    DateTimePickerAndroid.open({
      value,
      mode: "date",
      is24Hour: true,
      onChange: (_, selectedDate) => {
        if (selectedDate) {
          const current = selectedDate;
          DateTimePickerAndroid.open({
            value: current,
            mode: "time",
            is24Hour: true,
            onChange,
          });
        }
      },
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedEspecialidade(null);
    setSelectedProcedimento(null);
    setSelectedProfissional(null);
    setStartDate(new Date());
    setDescricao("");
  };

  const handleSubmit = () => {
    if (
      !selectedEspecialidade ||
      !selectedProcedimento ||
      !selectedProfissional
    ) {
      Alert.alert("Alerta!", "Preencha todos os campos obrigatórios.");
      return;
    }

    const payload = {
      IDPROCED: selectedProcedimento,
      IDPROFISSIO: selectedProfissional,
      DATAABERT: toMysqlString(startDate),
      DESCRCOMP: descricao,
    };

    api
      .post("/agenda", payload)
      .then(() => {
        Alert.alert("Sucesso!", "Agendamento criado com sucesso!");
        setShowForm(false);
      })
      .catch((err) => {
        console.error(err);
        Alert.alert("Erro", "Erro ao criar agendamento.");
      });

    setSelectedEspecialidade(null);
    setSelectedProcedimento(null);
    setSelectedProfissional(null);
    setStartDate(new Date());
    setDescricao("");
  };

  return (
    <View style={styles.container}>
      <Button
        title="Criar novo agendamento"
        onPress={() => setShowForm(true)}
        color="#029046"
      />

      <Modal visible={showForm} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.title}>Adicionar Evento</Text>
          <Text style={styles.label}>Título do Evento</Text>
          <TextInput value={titulo} editable={false} style={styles.input} />

          <Text style={styles.label}>Especialidade</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedEspecialidade}
              onValueChange={(itemValue) =>
                onSelectEspecialidade(itemValue as string)
              }
            >
              <Picker.Item label="Selecione" value={null} />
              {especialidades.map((e) => (
                <Picker.Item
                  key={e.IDESPEC}
                  label={e.DESCESPEC}
                  value={e.IDESPEC}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Procedimento</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedProcedimento}
              onValueChange={(itemValue) =>
                onSelectProcedimento(itemValue as number)
              }
            >
              <Picker.Item label="Selecione" value={null} />
              {procedimentos.map((p) => (
                <Picker.Item
                  key={p.IDPROCED}
                  label={p.DESCRPROC}
                  value={p.IDPROCED}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Profissional Responsável</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedProfissional}
              onValueChange={(itemValue) =>
                onSelectProfissional(itemValue as number)
              }
            >
              <Picker.Item label="Selecione" value={null} />
              {profissionais.map((p) => (
                <Picker.Item
                  key={p.IDPROFISSIO}
                  label={p.NOMEPESSOA}
                  value={p.IDPROFISSIO}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Início</Text>
          <TouchableOpacity
            onPress={() => showPicker("start")}
            style={styles.input}
          >
            <Text>{startDate.toLocaleString()}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Descrição Complementar</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            multiline
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Digite a descrição do evento"
          />

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>SALVAR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.buttonText}>CANCELAR</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F2F2F2",
  },
  modalContent: {
    padding: 16,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    marginTop: 12,
    fontWeight: "600",
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
    backgroundColor: "#FFF",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 6,
    marginTop: 4,
    backgroundColor: "#FFF",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  button: {
    height: 48,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  saveButton: {
    backgroundColor: "#27AE60",
  },
  cancelButton: {
    backgroundColor: "#C0392B",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
