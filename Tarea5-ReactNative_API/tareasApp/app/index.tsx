import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { iniciarSesion } from '@/services/api';

export default function TabOneScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleIniciarSesion = async () => {
    if (!email.trim() || !password) {
      setError('Escribe tu email y contraseña.');
      return;
    }

    setCargando(true);
    setError('');
    try {
      await iniciarSesion(email.trim(), password);
      router.replace('/(tabs)/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setCargando(false);
    }
  };

  const irRegistro = () => {
    router.push("/registro");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="ejemplo@email.com"
        placeholderTextColor={'#ffffff8d'}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="********"
        placeholderTextColor={'#ffffff8d'}
        secureTextEntry
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, cargando && styles.buttonDisabled]}
        onPress={handleIniciarSesion}
        disabled={cargando}
      >
        <Text style={styles.buttonText}>
          {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={irRegistro}>
        <Text style={styles.link}>No tienes una cuenta? Regístrate</Text>
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
    color:'white'
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
  link: {
    marginTop: 16,
    color: '#2563eb',
    fontSize: 14,
    textAlign: 'center',
  },
});
