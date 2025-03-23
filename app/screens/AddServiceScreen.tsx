// src/screens/AddServiceScreen.tsx (modificado)

import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { addService, updateService, Service } from "../services/serviceStorage";

const AddServiceScreen = ({ route, navigation }: any) => {
  // Verificar se estamos em modo de edição e se há uma data pré-selecionada
  const editMode = route.params?.editMode || false;
  const serviceToEdit = route.params?.service || null;
  const preSelectedDate = route.params?.selectedDate || null;

  const [clienteNome, setClienteNome] = useState("");
  const [clienteNumero, setClienteNumero] = useState("");
  const [endereco, setEndereco] = useState("");
  const [servicoFeito, setServicoFeito] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [data, setData] = useState<Date | undefined>(undefined);
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editMode && serviceToEdit) {
      // Preencher os campos com os dados do serviço a ser editado
      setClienteNome(serviceToEdit.clienteNome);
      setClienteNumero(serviceToEdit.clienteNumero);
      setEndereco(serviceToEdit.endereco);
      setServicoFeito(serviceToEdit.servicoFeito);
      setValorTotal(serviceToEdit.valorTotal);
      setHoraInicio(serviceToEdit.horaInicio);
      setHoraFim(serviceToEdit.horaFim);
      
      // Converter a string de data para objeto Date
      if (serviceToEdit.data) {
        setData(new Date(serviceToEdit.data));
      }
    } else if (preSelectedDate) {
      // Se tiver uma data pré-selecionada (vindo da tela de calendário)
      setData(new Date(preSelectedDate));
    }
  }, [editMode, serviceToEdit, preSelectedDate]);

  const onDismissSingle = () => {
    setDatePickerOpen(false);
  };

  const onConfirmSingle = (params: any) => {
    setDatePickerOpen(false);
    setData(params.date);
  };

  const handleSave = async () => {
    // Validar os campos obrigatórios
    if (!clienteNome || !clienteNumero || !endereco || !servicoFeito || !valorTotal || !data || !horaInicio || !horaFim) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    try {
      setLoading(true);

      const serviceData = {
        clienteNome,
        clienteNumero,
        endereco,
        servicoFeito,
        valorTotal,
        data: data.toISOString(),
        horaInicio,
        horaFim,
      };

      if (editMode && serviceToEdit) {
        // Atualizar serviço existente
        await updateService(serviceToEdit.id, serviceData);
        Alert.alert("Sucesso", "Serviço atualizado com sucesso");
      } else {
        // Adicionar novo serviço
        await addService(serviceData);
        Alert.alert("Sucesso", "Serviço adicionado com sucesso");
      }

      // Limpar os campos e voltar para a tela anterior
      resetForm();
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      Alert.alert("Erro", "Não foi possível salvar o serviço");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setClienteNome("");
    setClienteNumero("");
    setEndereco("");
    setServicoFeito("");
    setValorTotal("");
    setData(undefined);
    setHoraInicio("");
    setHoraFim("");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {editMode ? "Editar Serviço" : "Novo Serviço"}
      </Text>

      <View style={styles.formContainer}>
        <TextInput
          label="Nome do Cliente"
          value={clienteNome}
          onChangeText={setClienteNome}
          style={styles.input}
        />

        <TextInput
          label="Número do Cliente"
          value={clienteNumero}
          onChangeText={setClienteNumero}
          keyboardType="phone-pad"
          style={styles.input}
        />

        <TextInput
          label="Endereço"
          value={endereco}
          onChangeText={setEndereco}
          style={styles.input}
        />

        <TextInput
          label="Serviço a ser Realizado"
          value={servicoFeito}
          onChangeText={setServicoFeito}
          style={styles.input}
        />

        <TextInput
          label="Valor Total (R$)"
          value={valorTotal}
          onChangeText={setValorTotal}
          keyboardType="numeric"
          style={styles.input}
        />

        <Button
          mode="outlined"
          onPress={() => setDatePickerOpen(true)}
          style={styles.dateButton}
        >
          {data ? data.toLocaleDateString("pt-BR") : "Selecionar Data"}
        </Button>

        <DatePickerModal
          locale="pt"
          mode="single"
          visible={datePickerOpen}
          onDismiss={onDismissSingle}
          date={data}
          onConfirm={onConfirmSingle}
        />

        <View style={styles.timeContainer}>
          <TextInput
            label="Hora Início"
            value={horaInicio}
            onChangeText={setHoraInicio}
            placeholder="Ex: 14:00"
            style={[styles.input, styles.timeInput]}
          />

          <TextInput
            label="Hora Fim"
            value={horaFim}
            onChangeText={setHoraFim}
            placeholder="Ex: 16:00"
            style={[styles.input, styles.timeInput]}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          loading={loading}
          disabled={loading}
        >
          {editMode ? "Atualizar" : "Salvar"}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  formContainer: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "white",
  },
  dateButton: {
    marginBottom: 16,
    padding: 5,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeInput: {
    flex: 0.48,
  },
  saveButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
});

export default AddServiceScreen;
