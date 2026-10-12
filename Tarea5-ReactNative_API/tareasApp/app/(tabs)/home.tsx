import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { SymbolView } from 'expo-symbols';

export default function TabTwoScreen() {
  const tareas = [
    {id: 1, titulo: 'Tarea de prueba', completada: false, fecha:'10/10/2020'},
    {id: 2, titulo: 'Tarea de prueba 2', completada: true, fecha:'10/10/2020'}

  ]
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tareas</Text>
      <FlatList data={tareas}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity >
          <View style={styles.containerHorizontal}>
            <View style={styles.tarea}>
              <Text style={styles.tareaText}>{item.titulo} </Text>
              <Text style={styles.tareaDetailText}>{item.fecha}</Text>
            </View>
          </View>
          
        </TouchableOpacity>
          
        )}
      >

      </FlatList>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  containerHorizontal: {
    flex: 1,

  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: '#6c97f4',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#95abcf',
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#ffffff8d',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#ffffff33',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#2563eb',
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    marginTop: 16,
    color: '#2563eb',
    fontSize: 14,
    textAlign: 'center',
  },
  tarea: {
    backgroundColor: '#ffffff33',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
  },
  tareaText: {
    fontSize: 16,
    color: 'white',
    padding: 5,
  },
  tareaDetailText: {
    fontSize: 16,
    color: '#a7a7a7',
    padding: 5,
  },
});
