// src/screens/ServiceListScreen.tsx

import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { Card, Title, Paragraph, Text, Button } from "react-native-paper";
import { getServices, Service } from "../services/serviceStorage";

const ServiceListScreen: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const servicesData = await getServices();

      setServices(servicesData);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      setError("Não foi possível carregar os serviços. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const renderServiceItem = ({ item }: { item: Service }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.clienteNome}</Title>
        <Paragraph>Telefone: {item.clienteNumero}</Paragraph>
        <Paragraph>Endereço: {item.endereco}</Paragraph>
        <Paragraph>Serviço: {item.servicoFeito}</Paragraph>
        <Paragraph>Valor: R$ {item.valorTotal}</Paragraph>
        <Paragraph>Data: {item.data ? item.data : "N/A"}</Paragraph>
        <Paragraph>
          Horário: {item.horaInicio} - {item.horaFim}
        </Paragraph>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
        <Button onPress={loadServices}>Tentar Novamente</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {services.length === 0 ? (
        <View style={styles.centered}>
          <Text>Nenhum serviço cadastrado ainda.</Text>
        </View>
      ) : (
        <FlatList
          data={services}
          renderItem={renderServiceItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadServices}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
});

export default ServiceListScreen;
