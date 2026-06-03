import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { DollarSign, Users, PlusCircle, BarChart3 } from 'lucide-react';

// Importación de los 3 componentes hijos modularizados
import SubVistaVentas from './subvistas/SubVistaVentas';
import SubVistaPersonal from './subvistas/SubVistaPersonal';
import SubVistaCatalogo from './subvistas/SubVistaCatalogo';
import SubVistaEstadisticas from './subvistas/SubVistaEstadisticas';

export default function VistaAdministrarUsuarios({ usuario }: { usuario: any }) {
  // Inicializa directo en USUARIOS para que el personal sea lo primero que vea el Administrador
  const [subVista, setSubVista] = useState<'VENTAS' | 'USUARIOS' | 'PRODUCTOS'| 'ESTADISTICAS'>('USUARIOS');
  const [ventas, setVentas] = useState<any[]>([]);
  const [usuariosSistema, setUsuariosSistema] = useState<any[]>([]);
  const [productosCatalogo, setProductosCatalogo] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Carga macro optimizada para resolver todo en paralelo desde NestJS
  const cargarDatosGlobales = async () => {
    try {
      setCargando(true);
      setError('');
      
      // Consultamos los tres endpoints clave en lote simultáneo
      const [resVentas, resUsers, resProducts] = await Promise.all([
        api.get('/ventas'),
        api.get('/usuarios'),
        api.get('/products')
      ]);

      setVentas(resVentas.data);
      setUsuariosSistema(resUsers.data);
      setProductosCatalogo(resProducts.data);

    } catch (err) {
      console.error("Error en la sincronización de datos de administración:", err);
      setError('Error de comunicación con el servidor de NestJS. Revisa tu backend.');
    } finally {
      setCargando(false);
    }
  };

  // Escucha los cambios de pestaña para limpiar alertas y mantener fresco el estado
  useEffect(() => {
    cargarDatosGlobales();
    setError(''); 
    setExito('');
  }, [subVista]);

  // Cálculo matemático del total del negocio
  const totalNegocio = ventas.reduce((acc, v) => acc + parseFloat(v.precio_total_venta || 0), 0);

  return (
    <div className="space-y-4 animate-fadeIn pb-6">
      
      {/* SELECTOR DE SUB-PESTAÑAS SUPERIOR */}
      <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 gap-0.5">
        <button 
          onClick={() => setSubVista('VENTAS')} 
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-bold transition-all ${subVista === 'VENTAS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
        >
          <DollarSign className="h-3.5 w-3.5" /> Ventas
        </button>
        <button 
          onClick={() => setSubVista('USUARIOS')} 
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-bold transition-all ${subVista === 'USUARIOS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
        >
          <Users className="h-3.5 w-3.5" /> Personal
        </button>
        <button 
          onClick={() => setSubVista('PRODUCTOS')} 
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-bold transition-all ${subVista === 'PRODUCTOS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
        >
          <PlusCircle className="h-3.5 w-3.5" /> Catálogo
        </button>
        <button onClick={() => setSubVista('ESTADISTICAS')} className={`flex-1 min-w-[70px] flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold transition-all ${subVista === 'ESTADISTICAS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
          <BarChart3 className="h-3.5 w-3.5" /> Métricas
        </button>
      </div>

      {/* BANNER DE NOTIFICACIONES COMPARTIDO */}
      {error && <div className="p-3 text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl">{error}</div>}
      {exito && <div className="p-3 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl">{exito}</div>}

      {/* CONTROLADOR DE RENDERIZADO VISUAL */}
      {cargando ? (
        <div className="text-center py-8 text-xs text-gray-400 font-medium">Sincronizando información operativa...</div>
      ) : (
        <>
          {/* VISTA A: AUDITORÍA FINANCIERA */}
          {subVista === 'VENTAS' && (
            <SubVistaVentas 
              ventas={ventas} 
              totalNegocio={totalNegocio} 
              usuariosSistema={usuariosSistema} 
            />
          )}

          {/* VISTA B: CONTROL DE PERSONAL Y RENDIMIENTO (CON DATA FINANCIERA CORREGIDA) */}
          {subVista === 'USUARIOS' && (
            <SubVistaPersonal 
              usuariosSistema={usuariosSistema} 
              ventas={ventas} // <── ¡CRÍTICO! Corregido: se añade la inyección de ventas para las sumas
              refrescarUsuarios={cargarDatosGlobales} 
              setError={setError} 
              setExito={setExito} 
            />
          )}

          {/* VISTA C: CONTROL DE SUPLEMENTOS EN LA RED */}
          {subVista === 'PRODUCTOS' && (
            <SubVistaCatalogo 
              productosCatalogo={productosCatalogo} 
              refrescarProductos={cargarDatosGlobales} 
              setError={setError} 
              setExito={setExito} 
            />
          )}
          {subVista === 'ESTADISTICAS' && (
            <SubVistaEstadisticas ventas={ventas}
            />
          )}
        </>
      )}
    </div>
  );
}