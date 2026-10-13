import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { obtenerTareas, type Tarea } from '@/services/api';

export default function TabTwoScreen() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const cargarTareas = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      setTareas(await obtenerTareas());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las tareas.');
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void cargarTareas();
    }, [cargarTareas]),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tareas</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(tabs)/nuevaTarea')}
      >
        <Text style={styles.buttonText}>Crear tarea</Text>
      </TouchableOpacity>

      {!!error && <Text style={styles.error}>{error}</Text>}
      {cargando && <Text style={styles.message}>Cargando tareas...</Text>}
      {!cargando && !error && tareas.length === 0 && (
        <Text style={styles.message}>Todavía no tienes tareas.</Text>
      )}

      <FlatList
        data={tareas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.containerHorizontal}>
            <View style={styles.tarea}>
              <Text style={styles.tareaText}>{item.titulo}</Text>
              <Text style={styles.tareaDetailText}>
                {new Date(item.creadoEn).toLocaleDateString()}
                {' · '}
                {item.completada ? 'Completada' : 'Pendiente'}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
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
  button: {
    marginTop: 8,
    marginBottom: 16,
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
  message: {
    color: '#a7a7a7',
    marginBottom: 12,
  },
  error: {
    color: '#ff8a8a',
    marginBottom: 12,
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
