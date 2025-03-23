// src/services/serviceStorage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVICES_STORAGE_KEY = '@app_services';

export interface Service {
  id: string;
  clienteNome: string;
  clienteNumero: string;
  endereco: string;
  servicoFeito: string;
  valorTotal: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  createdAt: string;
}

export const getServices = async (): Promise<Service[]> => {
  try {
    const servicesJson = await AsyncStorage.getItem(SERVICES_STORAGE_KEY);
    return servicesJson ? JSON.parse(servicesJson) : [];
  } catch (error) {
    console.error('Erro ao obter serviços:', error);
    return [];
  }
};

export const addService = async (serviceData: Omit<Service, 'id' | 'createdAt'>): Promise<Service> => {
  try {
    const services = await getServices();
    
    const newService: Service = {
      ...serviceData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedServices = [...services, newService];
    await AsyncStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(updatedServices));
    
    return newService;
  } catch (error) {
    console.error('Erro ao adicionar serviço:', error);
    throw error;
  }
};

export const updateService = async (id: string, serviceData: Partial<Service>): Promise<Service> => {
  try {
    const services = await getServices();
    const serviceIndex = services.findIndex(s => s.id === id);
    
    if (serviceIndex === -1) {
      throw new Error('Serviço não encontrado');
    }
    
    const updatedService = {
      ...services[serviceIndex],
      ...serviceData,
    };
    
    services[serviceIndex] = updatedService;
    await AsyncStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
    
    return updatedService;
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    throw error;
  }
};

export const removeService = async (id: string): Promise<void> => {
  try {
    const services = await getServices();
    const updatedServices = services.filter(service => service.id !== id);
    await AsyncStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(updatedServices));
  } catch (error) {
    console.error('Erro ao remover serviço:', error);
    throw error;
  }
};

export const getServiceById = async (id: string): Promise<Service | null> => {
  try {
    const services = await getServices();
    return services.find(service => service.id === id) || null;
  } catch (error) {
    console.error('Erro ao buscar serviço por ID:', error);
    return null;
  }
};

export const getServicesByDate = async (date: string): Promise<Service[]> => {
  try {
    const services = await getServices();
    return services.filter(service => {
      const serviceDate = service.data.split('T')[0]; // Formato YYYY-MM-DD
      return serviceDate === date;
    });
  } catch (error) {
    console.error('Erro ao buscar serviços por data:', error);
    return [];
  }
};
