import { useState } from 'react'
import { LoginPanel } from './componentes/public/LoginPanel';// Asegúrate de que la ruta coincida con tu archivo de Login
import RepartidorPanel from './componentes/public/RepartidorPanel';


function App() {
  // Estado para controlar qué pantalla ver: 'LOGIN' o 'PANEL'
  const [estaAutenticado, setEstaAutenticado] = useState(false);
  const manejarCerrarSesion = () => {
  localStorage.removeItem('usuario_ryztor');
  // Aquí pones tu lógica para cambiar el estado del usuario a null o redirigir
  window.location.href = '/login'; // O la función de navegación que uses
};

  return (
    <>
      {estaAutenticado ? (
        // Si el usuario ya ingresó con éxito, ve el panel móvil del repartidor
        <RepartidorPanel alCerrarSesion={manejarCerrarSesion} />
      ) : (
        
        <div className='min-h-screen w-screen bg-[#09080d] flex items-center justify-center p-4'>
        <LoginPanel alIngresar={() => setEstaAutenticado(true)} />
        </div>
      )}
    </>
  )
}

export default App