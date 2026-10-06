import { StyleSheet, TextInput, TouchableOpacity, Modal} from 'react-native';

import ModalProductoCreado from '../modalProductoCreado';
import ModalError from '../modalError';
import { Text, View } from '@/components/Themed';
import { useState } from 'react';
import { productos } from './lista';

export default function TabOneScreen() {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');

  const [modalCreadoVisible, setModalCreadoVisible] = useState(false);
  const [modalErrorVisible, setModalErrorVisible] = useState(false);


  const agregarProducto = () => {
    const precioNumerico = parseFloat(precio) || 0;
    const stockNumerico = parseInt(stock, 10) || 0;

    if (!nombre || precioNumerico <= 0 || stockNumerico < 0) {
      return setModalErrorVisible(true);
    }
    setModalCreadoVisible(true);
    productos.push({ id: productos.length + 1, nombre, precio: precioNumerico, stock: stockNumerico });

    console.log('Producto agregado:', { nombre, precio: precioNumerico, stock: stockNumerico });
    
  }
  const cerrarModal = () => {
    setModalCreadoVisible(false);
    setNombre('');
    setPrecio('');
    setStock('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>APP DE PRUEBA</Text>
      <Text style={styles.subtitle}>Raydelis Anabel Hilario Méndez</Text>
      <Text>2023-0749</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Text style={styles.subtitle}>Nuevo producto</Text>

      <View style={styles.formContainer}>
        <Text>Nombre</Text>
        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholderTextColor="#787878" placeholder="ej: Producto A" />
        <Text>Precio</Text>
        <TextInput keyboardType="numeric" style={styles.input} value={precio} onChangeText={setPrecio} placeholderTextColor="#787878" placeholder="RD$ " />
        <Text>Cantidad disponible</Text>
        <TextInput keyboardType="numeric" style={styles.input} value={stock} onChangeText={setStock} placeholderTextColor="#787878" placeholder="0" />
        <TouchableOpacity style={styles.button} onPress={agregarProducto}>
          <Text style={styles.buttonText} >Agregar producto</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={modalCreadoVisible} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={{ backgroundColor: '#e9e9e9', padding: 20, borderRadius: 10 }}>
            <ModalProductoCreado nombre={nombre} precio={parseFloat(precio) || 0} cantidad={parseInt(stock) || 0} />
            <TouchableOpacity onPress={cerrarModal} style={{ marginTop: 20 }}>
              <Text style={{ color: '#dc6796', fontWeight: 'bold' }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={modalErrorVisible} animationType="fade" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={{ backgroundColor: '#e9e9e9', padding: 20, borderRadius: 10 }}>
              <ModalError error="Datos inválidos. Revise los campos y vuelva a intentarlo." />
              <TouchableOpacity onPress={() => setModalErrorVisible(false)} style={{ marginTop: 20 }}>
                <Text style={{ color: '#dc6796', fontWeight: 'bold' }}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    padding: 50,
    color: '#dc6796',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  formContainer: {
    width: '80%',
    marginTop: 20,
    borderWidth: 2,
    padding: 20,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dc6796',
    padding: 10,
    marginBottom: 10,
    marginTop: 10,

    borderRadius: 8,
    color: '#e1e0e0',
  },
  button: {
    backgroundColor: '#dc6796',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
