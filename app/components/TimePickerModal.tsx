// src/components/TimePickerModal.tsx

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Text, Button, IconButton } from "react-native-paper";

interface TimePickerModalProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (time: string) => void;
  currentTime?: string;
}

const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  onDismiss,
  onConfirm,
  currentTime = "08:00",
}) => {
  const [selectedTime, setSelectedTime] = useState(currentTime);

  // Gerar horários de 30 em 30 minutos, das 7h às 22h
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Selecionar Horário</Text>
            <IconButton icon="close" size={24} onPress={onDismiss} />
          </View>

          <ScrollView style={styles.timeList}>
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeItem,
                  selectedTime === time && styles.selectedTimeItem,
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text
                  style={[
                    styles.timeText,
                    selectedTime === time && styles.selectedTimeText,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button mode="outlined" onPress={onDismiss} style={styles.button}>
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                onConfirm(selectedTime);
                onDismiss();
              }}
              style={styles.button}
            >
              Confirmar
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  timeList: {
    maxHeight: 300,
  },
  timeItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedTimeItem: {
    backgroundColor: "#e6f2ff",
  },
  timeText: {
    fontSize: 16,
  },
  selectedTimeText: {
    fontWeight: "bold",
    color: "#2196F3",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  button: {
    marginLeft: 8,
  },
});

export default TimePickerModal;
