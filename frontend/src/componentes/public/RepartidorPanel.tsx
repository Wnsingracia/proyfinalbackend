import { useState, useEffect } from 'react';
import api from '../../api/api'; // Tu instancia de Axios configurada
import { Truck, LogOut, Moon, Bell, PlusCircle, FileText, DollarSign, Shield } from 'lucide-react';

import VistaNuevaEntrega from '../Repartidor/VistaNuevaEntrega';
import VistaVendedores from '../Vendedor/Vistavendedores';
import VistaDeliveries from '../Repartidor/VistaDeliveries';

// =============================================================================
// 🛠️ CORRECCIÓN EN RUTA DE IMPORTACIÓN: Alineado al nombre físico real
// =============================================================================
import VistaAdministrarUsuarios from '../Admin/VistaAdministradorUsuario';

interface RepartidorPanelProps {
  alCerrarSesion: () => void;
}

export default function RepartidorPanel({ alCerrarSesion }: RepartidorPanelProps) {
  const [usuarioLogueado] = useState(() => {
    const sesion = localStorage.getItem('usuario_ryztor');
    return sesion ? JSON.parse(sesion) : { id_usuario: 0, nombre: '', rol: '' };
  });

  const [vistaActual, setVistaActual] = useState(() => {
    if (usuarioLogueado.rol === 'ADMINISTRADOR') return 'ADMIN_USERS';
    if (usuarioLogueado.rol === 'VENDEDOR') return 'VENDEDORES';
    return 'NUEVA_ENTREGA';
  });

  // ESTADOS PARA INVENTARIO Y USUARIOS DE LA BASE DE DATOS
  const [stockReal, setStockReal] = useState<any[]>([]);
  const [usuariosSistema, setUsuariosSistema] = useState<any[]>([]); // <── NUEVO: Nómina real de Postgres
  const [cargandoStock, setCargandoStock] = useState(true);

  // =============================================================================
  // ⚡ SINK: Carga en lote del Inventario y de los Usuarios del Sistema
  // =============================================================================
  useEffect(() => {
    const cargarDatosDesdeBD = async () => {
      try {
        setCargandoStock(true);
        
        // Ejecutamos ambas peticiones en paralelo para no ralentizar el entorno móvil
        const [resStock, resUsers] = await Promise.all([
          api.get(`/deliveries/${usuarioLogueado.id_usuario}/stock`),
          api.get('/usuarios') // Jalamos la lista general de usuarios
        ]);
        
        setStockReal(resStock.data);
        setUsuariosSistema(resUsers.data); // Seteamos los vendedores en memoria
      } catch (error) {
        console.error("Error al sincronizar datos del panel con PostgreSQL:", error);
      } finally {
        setCargandoStock(false);
      }
    };

    if (usuarioLogueado.rol === 'DELIVERY' || usuarioLogueado.rol === 'ADMINISTRADOR') {
      cargarDatosDesdeBD();
    }
  }, [usuarioLogueado.id_usuario]);

  // Lógica de cierre de sesión blindada
  const handleLogout = () => {
    localStorage.removeItem('token_ryztor');
    localStorage.removeItem('usuario_ryztor');
    
    if (typeof alCerrarSesion === 'function') {
      alCerrarSesion();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex justify-center bg-gray-100 min-h-screen w-full">
      <div className="w-full max-w-[420px] bg-[#fdfbfd] flex flex-col min-h-screen shadow-2xl relative overflow-x-hidden font-sans pb-20">
        
        {/* TOP BAR */}
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#fceef2]">
              <Truck className="h-5 w-5 text-[#9d3b5a]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800 leading-tight">
                {usuarioLogueado.rol === 'DELIVERY' ? 'Repartidor' : usuarioLogueado.rol.toLowerCase()}
              </h2>
              <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase">{usuarioLogueado.nombre}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-600">
            <button type="button" className="hover:text-gray-900"><Bell className="h-5 w-5" /></button>
            <button type="button" className="hover:text-gray-900"><Moon className="h-5 w-5" /></button>
            <button onClick={handleLogout} type="button" className="hover:text-red-700 transition-colors"><LogOut className="h-5 w-5" /></button>
          </div>
        </header>

        {/* MENÚ DE SELECCIÓN DE VISTAS CON FILTRADO ESTRICTO POR ROL */}
        <div className="flex flex-col gap-1 p-3 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-2">
            
            {/* 1. VISTA DE DESPACHO: Visible para DELIVERIES y ADMINISTRADORES */}
            {(usuarioLogueado.rol === 'DELIVERY') && (
              <>
                <button 
                  type="button" 
                  onClick={() => setVistaActual('NUEVA_ENTREGA')} 
                  className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl font-medium text-xs border transition-all ${vistaActual === 'NUEVA_ENTREGA' ? 'bg-white text-gray-900 shadow-sm border-gray-200 font-bold' : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-100'}`}
                >
                  <PlusCircle className="h-4 w-4 text-[#9d3b5a]" /> Nueva Entrega
                </button>

                <button 
                  type="button" 
                  onClick={() => setVistaActual('DELIVERIES')} 
                  className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl font-medium text-xs border transition-all ${vistaActual === 'DELIVERIES' ? 'bg-white text-gray-900 shadow-sm border-gray-200 font-bold' : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-100'}`}
                >
                  <DollarSign className="h-4 w-4 text-gray-400" /> Entregas / Billetera
                </button>
              </>
            )}

            {/* 2. VISTA DE VENTAS: Visible para VENDEDORES y ADMINISTRADORES */}
            {(usuarioLogueado.rol === 'VENDEDOR') && (
              <button 
                type="button" 
                onClick={() => setVistaActual('VENDEDORES')} 
                className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl font-medium text-xs border transition-all ${vistaActual === 'VENDEDORES' ? 'bg-white text-gray-900 shadow-sm border-gray-200 font-bold' : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-100'}`}
              >
                <FileText className="h-4 w-4 text-gray-400" /> Terminal Ventas
              </button>
            )}

            {/* 3. BOTÓN CRÍTICO DE ADMINISTRACIÓN: ¡SÓLO SI ES ADMINISTRADOR! */}
            {usuarioLogueado.rol === 'ADMINISTRADOR' && (
              <button 
                type="button" 
                onClick={() => setVistaActual('ADMIN_USERS')} 
                className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl font-medium text-xs border border-red-100 transition-all ${vistaActual === 'ADMIN_USERS' ? 'bg-red-50 text-red-700 shadow-sm border-red-200 font-bold' : 'bg-transparent text-gray-500 border-transparent hover:bg-red-50/50 hover:text-red-600'}`}
              >
                <Shield className="h-4 w-4 text-red-500" /> Admin Users
              </button>
            )}

          </div>
        </div>

        {/* INYECCIÓN DE COMPONENTES SEGÚN ESTADO */}
        <main className="flex-1 p-4 overflow-y-auto">
          {vistaActual === 'NUEVA_ENTREGA' && (
            cargandoStock ? (
              <div className="text-center py-10 text-xs text-gray-400 font-medium">Sincronizando información de la base de datos...</div>
            ) : (
              // =============================================================================
              // 🏁 INTEGRACIÓN CORREGIDA: Sincronizamos stock Real y el catálogo de usuarios
              // =============================================================================
              <VistaNuevaEntrega 
                stockDisponible={stockReal} 
                usuariosSistema={usuariosSistema} 
              />
            )
          )}
          {vistaActual === 'VENDEDORES' && <VistaVendedores />}
          {vistaActual === 'DELIVERIES' && <VistaDeliveries />}
          {vistaActual === 'ADMIN_USERS' && <VistaAdministrarUsuarios usuario={usuarioLogueado} />}
        </main>

        {/* ACCIÓN FIJA INFERIOR */}
        

      </div>
    </div>
  );
}