import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { obtenerServicios, type Servicio } from '../../services/servicios';

export default function TabTwoScreen() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const cargarServicios = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      setServicios(await obtenerServicios());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los.');
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void cargarServicios();
    }, [cargarServicios]),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Servicios</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(tabs)/crearServicio')}
      >
        <Text style={styles.buttonText}>Crear servicio</Text>
      </TouchableOpacity>

      {!!error && <Text style={styles.error}>{error}</Text>}
      {cargando && <Text style={styles.message}>Cargando servicios...</Text>}
      {!cargando && !error && servicios.length === 0 && (
        <Text style={styles.message}>Todavía no tienes servicios.</Text>
      )}

      <FlatList
        data={servicios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.containerHorizontal}>
            <View style={styles.servicio}>
              <Text style={styles.servicioText}>{item.nombre}</Text>
              <Text style={styles.servicioDetailText}>
                {new Date(item.descripcion).toLocaleDateString()}
                {' · '}
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
  servicio: {
    backgroundColor: '#ffffff33',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
  },
  servicioText: {
    fontSize: 16,
    color: 'white',
    padding: 5,
  },
  servicioDetailText: {
    fontSize: 16,
    color: '#a7a7a7',
    padding: 5,
  },
});