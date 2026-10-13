import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { registrarUsuario } from '@/services/api';

export default function TabOneScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const router = useRouter();

  const crearCuenta = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Completa todos los campos.');
      return;
    }

    setCargando(true);
    setError('');
    setMensaje('');
    try {
      await registrarUsuario(name.trim(), email.trim(), password);
      setMensaje('Cuenta creada. Ya puedes iniciar sesión.');
      setName('');
      setEmail('');
      setPassword('');
      irLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta.');
    } finally {
      setCargando(false);
    }
  };

  const irLogin = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>
      <Text style={styles.label}>Nombre</Text>
      
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Tu nombre"
        autoCapitalize="none"
        placeholderTextColor={'#ffffff8d'}
        autoCorrect={false}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="ejemplo@email.com"
        keyboardType="email-address"
        placeholderTextColor={'#ffffff8d'}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholderTextColor={'#ffffff8d'}
        placeholder="********"
        secureTextEntry
      />

      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!mensaje && <Text style={styles.success}>{mensaje}</Text>}

      <TouchableOpacity
        style={[styles.button, cargando && styles.buttonDisabled]}
        onPress={crearCuenta}
        disabled={cargando}
      >
        <Text style={styles.buttonText}>
          {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={irLogin}>
        <Text style={styles.link}>Ya tienes una cuenta? Inicia sesión</Text>
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
  success: {
    color: '#86efac',
    marginBottom: 12,
  },
  link: {
    marginTop: 16,
    color: '#2563eb',
    fontSize: 14,
    textAlign: 'center',
  },
});