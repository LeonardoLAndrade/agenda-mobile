import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  DateTimePickerAndroid,
  AndroidNativeProps,
} from "@react-native-community/datetimepicker";
import api from "../../frontend/src/services/api";
import {
  Especialidade,
  PessoaFis,
  ProcedimentoDTO,
  ProfiEspec,
} from "./EditAppointmentModal";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/src/utils/toastConfig";

type Props = {
  onHandleSubmit: () => void;
};

export default function CreateAppointmentForm({ onHandleSubmit }: Props) {
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [procedimentos, setProcedimentos] = useState<ProcedimentoDTO[]>([]);
  const [pacientes, setPacientes] = useState<PessoaFis[]>([]);
  const [profissionais, setProfissionais] = useState<ProfiEspec[]>([]);

  const [selectedEspecialidade, setSelectedEspecialidade] = useState<
    number | null
  >(null);
  const [selectedProcedimento, setSelectedProcedimento] = useState<
    number | null
  >(null);
  const [selectedPaciente, setSelectedPaciente] = useState<number | null>(null);
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

  const onSelectEspecialidade = (cod: number | null) => {
    setSelectedEspecialidade(cod);
    setSelectedProcedimento(null);
    setSelectedProfissional(null);

    api.get(`/especialidade/${cod}/procedimentos`).then((res) => {
      setProcedimentos(res.data);
    });

    api.get(`/pessoafis`).then((res) => {
      setPacientes(res.data);
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

  const onSelectPaciente = (id: number) => {
    const pac = pacientes.find((p) => p.IDPESSOAFIS === id);
    if (!pac) return;
    setSelectedPaciente(id);
  };

  const onSelectProfissional = (id: number) => {
    const prof = profissionais.find((p) => p.IDPROFISSIO === id);
    if (!prof) return;
    setSelectedProfissional(id);
  };

  useEffect(() => {
    const proc = procedimentos.find((p) => p.IDPROCED === selectedProcedimento);
    const esp = especialidades.find((e) => e.IDESPEC === selectedEspecialidade);
    const prof = profissionais.find(
      (p) => p.IDPROFISSIO === selectedProfissional
    );

    if (proc && esp && prof) {
      setTitulo(
        `${proc.DESCRPROC} com ${esp.DESCESPEC} - ${prof.pessoa.NOMEPESSOA}`
      );
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
    setSelectedPaciente(null);
    setSelectedProfissional(null);
    setStartDate(new Date());
    setDescricao("");
  };

  const handleSubmit = () => {
    if (
      !selectedEspecialidade ||
      !selectedProcedimento ||
      !selectedPaciente ||
      !selectedProfissional
    ) {
      Toast.show({
        type: "info",
        text1: "Alerta!",
        text2: "Preencha todos os campos obrigatórios.",
      });
      return;
    }

    const payload = {
      ID_PROCED: selectedProcedimento,
      ID_PESSOAFIS: selectedPaciente,
      ID_PROFISSIO: selectedProfissional,
      DATAABERT: toMysqlString(startDate),
      DESCRCOMP: descricao,
      SOLICMASTER: 1,
    };

    api
      .post("/agenda", payload)
      .then(() => {
        Toast.show({
          type: "success",
          text1: "Agendamento criado com sucesso!",
        });
        setShowForm(false);
        onHandleSubmit();
      })
      .catch((err) => {
        console.error(err);
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: "Não foi possível criar o agendamento.",
        });
      });

    setSelectedEspecialidade(null);
    setSelectedProcedimento(null);
    setSelectedPaciente(null);
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
          <TextInput
            value={titulo}
            editable={false}
            style={[styles.input, styles.inputRead]}
          />

          <Text style={styles.label}>Especialidade</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedEspecialidade}
              onValueChange={(itemValue) => onSelectEspecialidade(itemValue)}
            >
              <Picker.Item label="Selecione" value={null} />
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
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedProcedimento}
              onValueChange={(itemValue) =>
                onSelectProcedimento(itemValue as number)
              }
            >
              <Picker.Item label="Selecione" value={null} />
              {procedimentos
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
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedPaciente}
              onValueChange={(itemValue) =>
                onSelectPaciente(itemValue as number)
              }
            >
              <Picker.Item label="Selecione" value={null} />
              {pacientes
                .sort((a, b) => a.NOMEPESSOA.localeCompare(b.NOMEPESSOA))
                .map((p) => (
                  <Picker.Item
                    key={p.IDPESSOAFIS}
                    label={p.NOMEPESSOA}
                    value={p.IDPESSOAFIS}
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
              {profissionais
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
          <Toast config={toastConfig} />
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
  inputRead: {
    backgroundColor: "#eee",
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
