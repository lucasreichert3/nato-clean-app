// src/screens/CalendarScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, Title, Paragraph, Button, useTheme, ActivityIndicator } from 'react-native-paper';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { getServices, Service } from '../services/serviceStorage';
import { useNavigation } from '@react-navigation/native';

type MarkedDates = {
  [date: string]: {
    marked: boolean;
    dotColor: string;
    dots?: Array<{key: string; color: string}>;
  };
};

const CalendarScreen = () => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDateServices, setSelectedDateServices] = useState<Service[]>([]);
  const theme = useTheme();
  const navigation = useNavigation<any>();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const allServices = await getServices();
      setServices(allServices);
      
      // Criar objeto de datas marcadas para o calendário
      const marked: MarkedDates = {};
      
      allServices.forEach(service => {
        if (service.data) {
          const dateStr = service.data.split('T')[0]; // Garantir formato YYYY-MM-DD
          
          if (!marked[dateStr]) {
            marked[dateStr] = {
              marked: true,
              dotColor: theme.colors.primary,
              dots: []
            };
          }
          
          if (marked[dateStr].dots) {
            marked[dateStr].dots.push({
              key: `service-${service.id}`,
              color: theme.colors.primary,
            });
          }
        }
      });
      
      setMarkedDates(marked);
      
      // Selecionar data atual por padrão
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
      updateSelectedDateServices(today, allServices);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSelectedDateServices = (date: string, servicesList: Service[] = services) => {
    const filteredServices = servicesList.filter(service => {
      const serviceDate = service.data.split('T')[0];
      return serviceDate === date;
    });
    
    setSelectedDateServices(filteredServices);
  };

  const handleDateSelect = (date: any) => {
    const selectedDateStr = date.dateString;
    setSelectedDate(selectedDateStr);
    updateSelectedDateServices(selectedDateStr);
  };

  const handleServicePress = (service: Service) => {
    // Navegar para a tela de detalhes do serviço
    navigation.navigate('ServiceDetails', { serviceId: service.id });
  };

  const formatTime = (time: string) => {
    return time.includes(':') ? time : `${time}:00`;
  };

  const renderServiceItem = ({ item }: { item: Service }) => (
    <TouchableOpacity onPress={() => handleServicePress(item)}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>{item.clienteNome}</Title>
          <Paragraph style={styles.serviceType}>{item.servicoFeito}</Paragraph>
          <View style={styles.detailsRow}>
            <Text style={styles.timeText}>
              {formatTime(item.horaInicio)} - {formatTime(item.horaFim)}
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...(markedDates[selectedDate] || {}),
            selected: true,
            selectedColor: theme.colors.primary,
          },
        }}
        onDayPress={handleDateSelect}
        theme={{
          selectedDayBackgroundColor: theme.colors.primary,
          todayTextColor: theme.colors.primary,
          arrowColor: theme.colors.primary,
        }}
      />
      
      <View style={styles.servicesContainer}>
        <Text style={styles.dateHeader}>
          Serviços para {new Date(selectedDate).toLocaleDateString('pt-BR')}
        </Text>
        
        {selectedDateServices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum serviço agendado para esta data</Text>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('AddService', { selectedDate })}
              style={styles.addButton}
            >
              Agendar Serviço
            </Button>
          </View>
        ) : (
          <FlatList
            data={selectedDateServices}
            keyExtractor={(item) => item.id}
            renderItem={renderServiceItem}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
      
      {selectedDateServices.length > 0 && (
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('AddService', { selectedDate })}
          style={styles.floatingButton}
          icon="plus"
        >
          Novo Serviço
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  servicesContainer: {
    flex: 1,
    padding: 16,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  serviceType: {
    color: '#666',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontWeight: 'bold',
  },
  valueText: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  addressText: {
    marginTop: 8,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  addButton: {
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 80, // Espaço para o botão flutuante
  },
  floatingButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    borderRadius: 28,
  },
});

export default CalendarScreen;
