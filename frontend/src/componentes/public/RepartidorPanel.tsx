import React, { useState, useEffect } from 'react';
import api from '../../api/api'; // Tu instancia de Axios configurada
import { Truck, LogOut, Moon, Bell, PlusCircle, FileText, DollarSign, Shield } from 'lucide-react';

import VistaNuevaEntrega from '../Repartidor/VistaNuevaEntrega';
import VistaVendedores from '../Vendedor/Vistavendedores';
import VistaDeliveries from '../Repartidor/VistaDeliveries';
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

  // =============================================================================
  // 1. NUEVOS ESTADOS PARA HACER LA CARGA REAL DE LA BASE DE DATOS
  // =============================================================================
  const [stockReal, setStockReal] = useState<any[]>([]);
  const [cargandoStock, setCargandoStock] = useState(true);

  useEffect(() => {
    const obtenerInventarioBD = async () => {
      try {
        setCargandoStock(true);
        
        // Atacamos el endpoint de tu backend que trae el stock específico del repartidor actual
        const respuesta = await api.get(`/deliveries/${usuarioLogueado.id_usuario}/stock`);
        
        setStockReal(respuesta.data); // Guardamos la lista con las nuevas url_imagen de la BD
      } catch (error) {
        console.error("Error al sincronizar inventario con PostgreSQL:", error);
      } finally {
        setCargandoStock(false);
      }
    };

    // Solo hacemos la consulta si el usuario es un DELIVERY o un ADMINISTRADOR auditor
    if (usuarioLogueado.rol === 'DELIVERY' || usuarioLogueado.rol === 'ADMINISTRADOR') {
      obtenerInventarioBD();
    }
  }, [usuarioLogueado.id_usuario]);

  // Lógica de cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem('token_ryztor');
    localStorage.removeItem('usuario_ryztor');
    alCerrarSesion();
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
            {(usuarioLogueado.rol === 'DELIVERY' || usuarioLogueado.rol === 'ADMINISTRADOR') && (
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
            {(usuarioLogueado.rol === 'VENDEDOR' || usuarioLogueado.rol === 'ADMINISTRADOR') && (
              <button 
                type="button" 
                onClick={() => setVistaActual('VENDEDORES')} 
                className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl font-medium text-xs border transition-all ${vistaActual === 'VENDEDORES' ? 'bg-white text-gray-900 shadow-sm border-gray-200 font-bold' : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-100'}`}
              >
                <FileText className="h-4 w-4 text-gray-400" /> Terminal Ventas
              </button>
            )}

            {/* =============================================================================
                3. BOTÓN CRÍTICO DE ADMINISTRACIÓN: ¡SÓLO SI ES ADMINISTRADOR!
               ============================================================================= */}
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
              <div className="text-center py-10 text-xs text-gray-400 font-medium">Sincronizando inventario con la base de datos...</div>
            ) : (
              // =============================================================================
              // 2. CORRECCIÓN: Le inyectamos 'stockReal' traído de Postgres en lugar del arreglo viejo
              // =============================================================================
              <VistaNuevaEntrega stockDisponible={stockReal} />
            )
          )}
          {vistaActual === 'VENDEDORES' && <VistaVendedores />}
          {vistaActual === 'DELIVERIES' && <VistaDeliveries />}
          {vistaActual === 'ADMIN_USERS' && <VistaAdministrarUsuarios usuario={usuarioLogueado} />}
        </main>

        {/* ACCIÓN FIJA INFERIOR */}
        {vistaActual === 'NUEVA_ENTREGA' && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
            <button type="button" className="w-full py-4 rounded-xl bg-[#c58599] hover:bg-[#b06f83] text-white font-semibold text-base transition-colors flex items-center justify-center gap-2 shadow-md">
              <span>✓</span> Confirmar Entrega
            </button>
          </div>
        )}

      </div>
    </div>
  );
}