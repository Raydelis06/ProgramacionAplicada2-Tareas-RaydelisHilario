import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { crearTarea } from '@/services/api';

export default function TabTwoScreen() {
  const [titulo, setTitulo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const guardarTarea = async () => {
    const tituloLimpio = titulo.trim();
    if (!tituloLimpio) {
      setError('Escribe el título de la tarea.');
      return;
    }

    setCargando(true);
    setError('');
    try {
      await crearTarea(tituloLimpio);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la tarea.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear tarea</Text>
      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        value={titulo}
        onChangeText={setTitulo}
        placeholder="Título de la tarea"
        autoCapitalize="none"
        placeholderTextColor={'#ffffff8d'}
        autoCorrect={false}
        maxLength={200}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity
        style={[styles.button, cargando && styles.buttonDisabled]}
        onPress={guardarTarea}
        disabled={cargando}
      >
        <Text style={styles.buttonText}>
          {cargando ? 'Guardando...' : 'Guardar tarea'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
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
  buttonDisabled: {
    opacity: 0.6,
  },
  error: {
    color: '#ff8a8a',
    marginBottom: 12,
  },
});
