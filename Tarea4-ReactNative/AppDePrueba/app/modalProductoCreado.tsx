import { View, Text, StyleSheet } from "react-native";

export default function ModalProductoCreado({ nombre = '', precio = 0, cantidad = 0 }) {
  return (
    <View style={styles.container}>
        <Text style={styles.title}>Producto creado exitosamente!</Text>
        <View style={styles.infoContainer}>
            <Text style={styles.subtitle}>Nombre: </Text>
            <Text style={styles.value}>{nombre}</Text>
        </View>
        <View style={styles.infoContainer}>
            <Text style={styles.subtitle}>Precio:  </Text>
            <Text style={styles.value}  >RD$ {precio.toFixed(2)}</Text>
        </View>
        <View style={styles.infoContainer}>
            <Text style={styles.subtitle}>Cantidad: </Text>
            <Text style={styles.value}>{cantidad}</Text>
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