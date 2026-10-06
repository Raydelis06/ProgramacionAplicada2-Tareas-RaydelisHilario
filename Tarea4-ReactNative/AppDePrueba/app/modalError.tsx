import { View, Text, StyleSheet } from "react-native";

export default function ModalError({ error = '' }) {
  return (
    <View style={styles.container}>
        <Text style={styles.title}>Error</Text>
        <Text>{error}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingBottom: 20,
    color: '#dc6796',
  },
  container: {
    maxWidth: '80%',
    paddingRight: 10,
    paddingBottom: 10,
  },
});