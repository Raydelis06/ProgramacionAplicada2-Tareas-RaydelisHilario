import { View, Text, StyleSheet } from "react-native";

export default function ModalError({ error = '' }) {
  return (
    <View style={styles.container}>
        <Text style={styles.title}>Error</Text>
        <View style={styles.infoContainer}>
            <Text style={styles.value}>{error}</Text>
        </View>
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
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 80,
  },
  infoContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  container: {
    maxWidth: '80%',
    paddingRight: 10,
    paddingBottom: 10,
  },
  value: {
    flex: 1, 
    flexWrap: 'wrap',
  },
});