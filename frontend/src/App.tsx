import React, { useState } from 'react'
import { LoginPanel } from './componentes/public/LoginPanel';// Asegúrate de que la ruta coincida con tu archivo de Login
import RepartidorPanel from './componentes/public/RepartidorPanel';

function App() {
  // Estado para controlar qué pantalla ver: 'LOGIN' o 'PANEL'
  const [estaAutenticado, setEstaAutenticado] = useState(false);

  return (
    <>
      {estaAutenticado ? (
        // Si el usuario ya ingresó con éxito, ve el panel móvil del repartidor
        <RepartidorPanel/>
      ) : (
        // Si no está autenticado, ve la pantalla de Login con el CAPTCHA gráfico
        // Le pasamos una función para que el botón "Ingresar" cambie el estado a true
        <LoginPanel alIngresar={() => setEstaAutenticado(true)} />
      )}
    </>
  )
}

export default App