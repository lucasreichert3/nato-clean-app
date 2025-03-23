// src/screens/HomeScreen.tsx

import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  Searchbar,
  Chip,
  useTheme,
  ActivityIndicator,
} from "react-native-paper";
import { getServices, Service } from "../services/serviceStorage";
import { useIsFocused } from "@react-navigation/native";

const HomeScreen = ({ navigation }: any) => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("proximos"); // 'proximos', 'hoje', 'todos'
  const theme = useTheme();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadServices();
    }
  }, [isFocused]);

  useEffect(() => {
    applyFilters();
  }, [services, searchQuery, filterType]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const allServices = await getServices();

      // Ordenar serviços por data
      const sortedServices = allServices.sort((a, b) => {
        const dateA = new Date(a.data).getTime();
        const dateB = new Date(b.data).getTime();
        return dateA - dateB;
      });

      setServices(sortedServices);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...services];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Aplicar filtro por tipo
    if (filterType === "proximos") {
      result = result.filter((service) => {
        const serviceDate = new Date(service.data);
        serviceDate.setHours(0, 0, 0, 0);
        return serviceDate >= today;
      });
    } else if (filterType === "hoje") {
      result = result.filter((service) => {
        const serviceDate = new Date(service.data);
        serviceDate.setHours(0, 0, 0, 0);
        return serviceDate.getTime() === today.getTime();
      });
    }

    // Aplicar filtro de busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (service) =>
          service.clienteNome.toLowerCase().includes(query) ||
          service.servicoFeito.toLowerCase().includes(query) ||
          service.endereco.toLowerCase().includes(query)
      );
    }

    setFilteredServices(result);
  };

  const handleServicePress = (service: Service) => {
    navigation.navigate("ServiceDetails", { serviceId: service.id });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const renderServiceItem = ({ item }: { item: Service }) => (
    <TouchableOpacity onPress={() => handleServicePress(item)}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>{item.clienteNome}</Title>
            <Text style={styles.dateText}>{formatDate(item.data)}</Text>
          </View>
          <Paragraph style={styles.serviceType}>{item.servicoFeito}</Paragraph>
          <View style={styles.detailsRow}>
            <Text style={styles.timeText}>
              {item.horaInicio} - {item.horaFim}
            </Text>
            <Text style={styles.valueText}>R$ {item.valorTotal}</Text>
          </View>
          <Text style={styles.addressText} numberOfLines={1}>
            {item.endereco}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {loading
          ? "Carregando serviços..."
          : searchQuery
          ? "Nenhum serviço encontrado para esta busca"
          : filterType === "hoje"
          ? "Nenhum serviço agendado para hoje"
          : filterType === "proximos"
          ? "Nenhum serviço agendado para os próximos dias"
          : "Nenhum serviço cadastrado"}
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate("AddService")}
        style={styles.addButton}
      >
        Adicionar Serviço
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar serviços..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.filterContainer}>
        <Chip
          selected={filterType === "proximos"}
          onPress={() => setFilterType("proximos")}
          style={styles.filterChip}
          selectedColor={theme.colors.primary}
        >
          Próximos
        </Chip>
        <Chip
          selected={filterType === "hoje"}
          onPress={() => setFilterType("hoje")}
          style={styles.filterChip}
          selectedColor={theme.colors.primary}
        >
          Hoje
        </Chip>
        <Chip
          selected={filterType === "todos"}
          onPress={() => setFilterType("todos")}
          style={styles.filterChip}
          selectedColor={theme.colors.primary}
        >
          Todos
        </Chip>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
          renderItem={renderServiceItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
        />
      )}

      <Button
        mode="contained"
        icon="plus"
        onPress={() => navigation.navigate("AddService")}
        style={styles.floatingButton}
      >
        Novo Serviço
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  filterContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontWeight: "bold",
    color: "#666",
  },
  serviceType: {
    color: "#666",
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  timeText: {
    fontWeight: "bold",
  },
  valueText: {
    fontWeight: "bold",
    color: "#4CAF50",
  },
  addressText: {
    marginTop: 8,
    color: "#666",
  },
  listContent: {
    paddingBottom: 80, // Espaço para o botão flutuante
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  addButton: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    borderRadius: 28,
  },
});

export default HomeScreen;
