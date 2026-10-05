import { FlatList, StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

const productos = [
  { id: 1, nombre: 'Cargador para telefono', precio: 350, stock:20 },
  { id: 2, nombre: 'Audífonos inalambricos', precio: 1500, stock:15 },
  { id: 3, nombre: 'Tableta Samsung 128GB', precio: 78600, stock:10 },
  { id: 4, nombre: 'Iphone 17 pro', precio: 59990, stock:5 },
  { id: 5, nombre: 'Laptop ASUS VivoBook', precio: 30500, stock:2 }
];

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Productos</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      //flatlist
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.nombre}</Text>
            <Text style={styles.itemDetailText}>${item.precio}                 {item.stock} disponibles</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  item: {
    backgroundColor: '#EBF3FF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 8,
    borderLeftColor: '#dc6796',
    width: '100%',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    padding: 5,
  },
  itemDetailText: {
    fontSize: 16,
    color: '#a7a7a7',
    padding: 5,
  },
});
