import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

type Props = {
  time: string;
  client: string;
  onEdit: () => void;
};

export default function AppointmentCard({ time, client, onEdit }: Props) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.time}>{time}</Text>
        <Text style={styles.client}>{client}</Text>
      </View>
      <TouchableOpacity onPress={onEdit}>
        <Text style={styles.edit}>Editar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
  },
  time: {
    fontWeight: "bold",
    fontSize: 16,
  },
  client: {
    color: "#666",
  },
  edit: {
    color: "#0066CC",
    fontWeight: "600",
  },
});
