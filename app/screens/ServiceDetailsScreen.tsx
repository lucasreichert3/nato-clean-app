// src/screens/ServiceDetailsScreen.tsx

import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  Divider,
  useTheme,
} from "react-native-paper";
import {
  getServices,
  Service,
  updateService,
  removeService,
} from "../services/serviceStorage";

const ServiceDetailsScreen = ({ route, navigation }: any) => {
  const { serviceId } = route.params;
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    loadServiceDetails();
  }, [serviceId]);

  const loadServiceDetails = async () => {
    try {
      setLoading(true);
      const services = await getServices();
      const foundService = services.find((s) => s.id === serviceId);

      if (foundService) {
        setService(foundService);
      } else {
        Alert.alert("Erro", "Serviço não encontrado");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes do serviço:", error);
      Alert.alert("Erro", "Não foi possível carregar os detalhes do serviço");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate("AddService", {
      editMode: true,
      service,
    });
  };

  const handleDelete = async () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este serviço?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await removeService(serviceId);
              Alert.alert("Sucesso", "Serviço excluído com sucesso");
              navigation.goBack();
            } catch (error) {
              console.error("Erro ao excluir serviço:", error);
              Alert.alert("Erro", "Não foi possível excluir o serviço");
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const formatTime = (time: string) => {
    return time.includes(":") ? time : `${time}:00`;
  };

  if (loading || !service) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>{service.servicoFeito}</Title>
          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações do Cliente</Text>
            <Paragraph style={styles.clientName}>
              {service.clienteNome}
            </Paragraph>
            <Paragraph style={styles.detailText}>
              Telefone: {service.clienteNumero}
            </Paragraph>
            <Paragraph style={styles.detailText}>
              Endereço: {service.endereco}
            </Paragraph>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalhes do Serviço</Text>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Data:</Text>
              <Text style={styles.value}>{formatDate(service.data)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Horário:</Text>
              <Text style={styles.value}>
                {formatTime(service.horaInicio)} - {formatTime(service.horaFim)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Valor:</Text>
              <Text style={[styles.value, styles.price]}>
                R$ {service.valorTotal}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleEdit}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
        >
          Editar
        </Button>
        <Button
          mode="contained"
          onPress={handleDelete}
          style={[styles.button, { backgroundColor: "#F44336" }]}
        >
          Excluir
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
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  clientName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
    color: "#555",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: "bold",
    flex: 2,
  },
  price: {
    color: "#4CAF50",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 16,
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default ServiceDetailsScreen;
