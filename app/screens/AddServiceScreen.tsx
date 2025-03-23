// src/screens/AddServiceScreen.tsx (modificado)

import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { addService, updateService, Service, getServices } from "../services/serviceStorage";
import TimePickerModal from "../components/TimePickerModal";

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
  const [startTimePickerOpen, setStartTimePickerOpen] = useState(false);
  const [endTimePickerOpen, setEndTimePickerOpen] = useState(false);
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

  // Função para verificar conflitos de horário
  const checkTimeConflicts = async (date: Date, start: string, end: string, currentServiceId?: string) => {
    try {
      const allServices = await getServices();
      const dateString = date.toISOString().split('T')[0];
      
      // Converter horários para minutos para facilitar a comparação
      const startMinutes = convertTimeToMinutes(start);
      const endMinutes = convertTimeToMinutes(end);
      
      // Filtrar serviços para a mesma data
      const servicesOnSameDay = allServices.filter(service => {
        // Pular o próprio serviço em caso de edição
        if (currentServiceId && service.id === currentServiceId) {
          return false;
        }
        
        const serviceDate = service.data.split('T')[0];
        return serviceDate === dateString;
      });
      
      // Verificar conflitos de horário
      for (const service of servicesOnSameDay) {
        const serviceStartMinutes = convertTimeToMinutes(service.horaInicio);
        const serviceEndMinutes = convertTimeToMinutes(service.horaFim);
        
        // Verifica se há sobreposição de horários
        if (
          (startMinutes >= serviceStartMinutes && startMinutes < serviceEndMinutes) || // Início durante outro serviço
          (endMinutes > serviceStartMinutes && endMinutes <= serviceEndMinutes) || // Fim durante outro serviço
          (startMinutes <= serviceStartMinutes && endMinutes >= serviceEndMinutes) // Engloba outro serviço
        ) {
          return {
            hasConflict: true,
            conflictService: service,
          };
        }
      }
      
      return { hasConflict: false };
    } catch (error) {
      console.error("Erro ao verificar conflitos de horário:", error);
      return { hasConflict: false }; // Em caso de erro, permitir salvar
    }
  };
  
  // Função auxiliar para converter horário (HH:MM) em minutos
  const convertTimeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const handleSave = async () => {
    // Validar os campos obrigatórios
    if (!clienteNome || !clienteNumero || !endereco || !servicoFeito || !valorTotal || !data || !horaInicio || !horaFim) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }
    
    // Validar se o horário de início é anterior ao horário de fim
    const startMinutes = convertTimeToMinutes(horaInicio);
    const endMinutes = convertTimeToMinutes(horaFim);
    
    if (startMinutes >= endMinutes) {
      Alert.alert("Erro", "O horário de início deve ser anterior ao horário de fim");
      return;
    }

    try {
      setLoading(true);
      
      // Verificar conflitos de horário
      const currentServiceId = editMode && serviceToEdit ? serviceToEdit.id : undefined;
      const { hasConflict, conflictService } = await checkTimeConflicts(data, horaInicio, horaFim, currentServiceId);
      
      if (hasConflict && conflictService) {
        Alert.alert(
          "Conflito de Horário",
          `Já existe um serviço agendado para ${horaInicio} - ${horaFim} nesta data:\n\n` +
          `Cliente: ${conflictService.clienteNome}\n` +
          `Serviço: ${conflictService.servicoFeito}\n\n` +
          `Por favor, escolha outro horário.`
        );
        setLoading(false);
        return;
      }

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
          <Button
            mode="outlined"
            onPress={() => setStartTimePickerOpen(true)}
            style={[styles.timeButton, styles.timeInput]}
          >
            {horaInicio ? `Início: ${horaInicio}` : "Hora Início"}
          </Button>

          <Button
            mode="outlined"
            onPress={() => setEndTimePickerOpen(true)}
            style={[styles.timeButton, styles.timeInput]}
          >
            {horaFim ? `Fim: ${horaFim}` : "Hora Fim"}
          </Button>
        </View>

        {/* Modal de seleção de hora de início */}
        <TimePickerModal
          visible={startTimePickerOpen}
          onDismiss={() => setStartTimePickerOpen(false)}
          onConfirm={(time) => {
            setHoraInicio(time);
            // Se a hora de fim não estiver definida ou for anterior à hora de início,
            // sugerir uma hora de fim 1 hora depois
            if (!horaFim || convertTimeToMinutes(time) >= convertTimeToMinutes(horaFim)) {
              const [hours, minutes] = time.split(':').map(Number);
              let newHours = hours + 1;
              if (newHours > 22) newHours = 22;
              setHoraFim(`${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
            }
          }}
          currentTime={horaInicio}
        />

        {/* Modal de seleção de hora de fim */}
        <TimePickerModal
          visible={endTimePickerOpen}
          onDismiss={() => setEndTimePickerOpen(false)}
          onConfirm={setHoraFim}
          currentTime={horaFim}
        />

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
    marginBottom: 16,
  },
  timeInput: {
    flex: 0.48,
  },
  timeButton: {
    padding: 5,
  },
  saveButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
});

export default AddServiceScreen;
