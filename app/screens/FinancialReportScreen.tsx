// src/screens/FinancialReportScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Card, Title, Paragraph, Button, IconButton, Divider } from 'react-native-paper';
import { getServices, Service } from '../services/serviceStorage';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

interface MonthlyData {
  month: number;
  year: number;
  totalValue: number;
  services: Service[];
}

const FinancialReportScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Carregar dados ao iniciar a tela
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const services = await getServices();
      setAllServices(services);
      
      // Processar os dados por mês
      processMonthlyData(services);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = (services: Service[]) => {
    // Agrupar serviços por mês e ano
    const monthlyDataMap: Record<string, MonthlyData> = {};
    let totalValue = 0;

    services.forEach(service => {
      const date = new Date(service.data);
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${month}`;

      // Converter valor para número
      const valueString = service.valorTotal.replace('R$', '').trim().replace(',', '.');
      const value = parseFloat(valueString) || 0;
      totalValue += value;

      if (!monthlyDataMap[key]) {
        monthlyDataMap[key] = {
          month,
          year,
          totalValue: 0,
          services: []
        };
      }

      monthlyDataMap[key].totalValue += value;
      monthlyDataMap[key].services.push(service);
    });

    // Converter o mapa em array e ordenar por data (mais recente primeiro)
    const monthlyDataArray = Object.values(monthlyDataMap).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    setMonthlyData(monthlyDataArray);
    setTotalEarnings(totalValue);

    // Selecionar o mês atual ou o mais recente disponível
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const currentMonthKey = `${currentYear}-${currentMonth}`;
    
    const currentMonthIndex = monthlyDataArray.findIndex(
      data => data.month === currentMonth && data.year === currentYear
    );
    
    setSelectedMonthIndex(currentMonthIndex >= 0 ? currentMonthIndex : 0);
  };

  // Navegar para o mês anterior
  const goToPreviousMonth = () => {
    if (selectedMonthIndex < monthlyData.length - 1) {
      setSelectedMonthIndex(selectedMonthIndex + 1);
    }
  };

  // Navegar para o próximo mês
  const goToNextMonth = () => {
    if (selectedMonthIndex > 0) {
      setSelectedMonthIndex(selectedMonthIndex - 1);
    }
  };

  // Formatar valor para exibição
  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  // Dados para o gráfico de pizza
  const getChartData = () => {
    if (monthlyData.length === 0 || !monthlyData[selectedMonthIndex]) {
      return [
        {
          name: 'Sem dados',
          value: 0,
          color: '#CCCCCC',
          legendFontColor: '#7F7F7F',
          legendFontSize: 12
        }
      ];
    }

    // Agrupar por tipo de serviço
    const serviceTypes: Record<string, number> = {};
    const selectedMonthServices = monthlyData[selectedMonthIndex].services;

    selectedMonthServices.forEach(service => {
      const type = service.servicoFeito || 'Outros';
      const valueString = service.valorTotal.replace('R$', '').trim().replace(',', '.');
      const value = parseFloat(valueString) || 0;

      if (!serviceTypes[type]) {
        serviceTypes[type] = 0;
      }
      serviceTypes[type] += value;
    });

    // Cores para o gráfico
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#F94144'
    ];

    // Converter para o formato do gráfico
    return Object.entries(serviceTypes).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    }));
  };

  // Renderizar serviços do mês selecionado
  const renderMonthServices = () => {
    if (monthlyData.length === 0 || !monthlyData[selectedMonthIndex]) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum serviço registrado neste mês</Text>
        </View>
      );
    }

    const selectedMonthServices = monthlyData[selectedMonthIndex].services;
    
    // Ordenar por data
    const sortedServices = [...selectedMonthServices].sort((a, b) => {
      return new Date(a.data).getTime() - new Date(b.data).getTime();
    });

    return (
      <View>
        {sortedServices.map((service, index) => (
          <TouchableOpacity 
            key={service.id} 
            onPress={() => navigation.navigate('ServiceDetails', { serviceId: service.id })}
          >
            <Card style={styles.serviceCard}>
              <Card.Content>
                <View style={styles.serviceHeader}>
                  <Title>{service.clienteNome}</Title>
                  <Text style={styles.serviceValue}>{service.valorTotal}</Text>
                </View>
                <Paragraph style={styles.serviceType}>{service.servicoFeito}</Paragraph>
                <Text style={styles.serviceDate}>
                  {new Date(service.data).toLocaleDateString('pt-BR')} • {service.horaInicio} - {service.horaFim}
                </Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Carregando relatório financeiro...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title style={styles.summaryTitle}>Relatório Financeiro</Title>
          <Text style={styles.totalEarnings}>
            Total Geral: {formatCurrency(totalEarnings)}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.monthCard}>
        <Card.Content>
          <View style={styles.monthSelector}>
            <IconButton
              icon="chevron-left"
              size={24}
              onPress={goToPreviousMonth}
              disabled={selectedMonthIndex >= monthlyData.length - 1}
            />
            <Text style={styles.monthTitle}>
              {monthlyData.length > 0 && monthlyData[selectedMonthIndex]
                ? `${months[monthlyData[selectedMonthIndex].month]} ${monthlyData[selectedMonthIndex].year}`
                : 'Sem dados'}
            </Text>
            <IconButton
              icon="chevron-right"
              size={24}
              onPress={goToNextMonth}
              disabled={selectedMonthIndex <= 0}
            />
          </View>

          <View style={styles.monthTotalContainer}>
            <Text style={styles.monthTotalLabel}>Total do mês:</Text>
            <Text style={styles.monthTotal}>
              {monthlyData.length > 0 && monthlyData[selectedMonthIndex]
                ? formatCurrency(monthlyData[selectedMonthIndex].totalValue)
                : 'R$ 0,00'}
            </Text>
          </View>

          {monthlyData.length > 0 && monthlyData[selectedMonthIndex] && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Distribuição por Tipo de Serviço</Text>
              <PieChart
                data={getChartData()}
                width={screenWidth - 64}
                height={180}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="value"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.servicesContainer}>
        <Text style={styles.servicesTitle}>Serviços Realizados</Text>
        {renderMonthServices()}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          icon="file-export"
          onPress={() => alert('Exportar relatório (funcionalidade a ser implementada)')}
          style={styles.exportButton}
        >
          Exportar Relatório
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  summaryCard: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#2196F3',
  },
  summaryTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  totalEarnings: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  monthCard: {
    marginBottom: 16,
    elevation: 2,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  monthTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTotalLabel: {
    fontSize: 16,
    color: '#666',
  },
  monthTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  chartContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  servicesContainer: {
    marginBottom: 16,
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  serviceCard: {
    marginBottom: 8,
    elevation: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  serviceType: {
    color: '#666',
    marginBottom: 4,
  },
  serviceDate: {
    fontSize: 12,
    color: '#888',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  exportButton: {
    paddingVertical: 8,
  },
});

export default FinancialReportScreen;
