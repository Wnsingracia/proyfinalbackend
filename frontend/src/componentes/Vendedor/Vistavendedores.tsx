import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { FileText, User, Calendar, DollarSign, RefreshCcw, Wallet, Percent } from 'lucide-react';

export default function VistaVendedores() {
  const [ventas, setVentas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const usuarioSesion = JSON.parse(localStorage.getItem('usuario_ryztor') || '{}');

  const cargarHistorialVentas = async () => {
    try {
      setCargando(true);
      setError('');

      let urlEndpoint = '';
      // Unificado: usando .rol consistentemente
      if (usuarioSesion.rol === 'ADMINISTRADOR') {
        urlEndpoint = '/ventas';
      } else {
        urlEndpoint = `ventas/vendedor/${usuarioSesion.id_usuario}`;
      }

      const respuesta = await api.get(urlEndpoint);
      setVentas(respuesta.data);
    } catch (err: any) {
      console.error("Error al traer el historial de ventas: ", err);
      setError('No se puede conectar al servidor de ventas');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorialVentas();
  }, []);

  // =============================================================================
  // 📊 CÓMPUTO DE MÉTRICAS FINANCIERAS EN CALIENTE
  // =============================================================================
  const totalVentasContadas = ventas.length;

  // Sumamos el total facturado de las transacciones cargadas en el estado
  const totalDineroAcumulado = ventas.reduce(
    (sum, venta) => sum + parseFloat(venta.precio_total_venta || 0), 0
  );

  // REGLA DE NEGOCIO: Supongamos una comisión del 10% para el vendedor.
  // Si es ADMINISTRADOR, puedes dejarlo en 0 o calcular la utilidad neta estimada.
  const porcentajeComision = usuarioSesion.rol === 'ADMINISTRADOR' ? 0.00 : 0.10; 
  const totalComisionesCalculadas = totalDineroAcumulado * porcentajeComision;

  if (cargando) {
    return (
      <div className="text-center py-16 text-xs text-gray-400 font-medium flex flex-col items-center justify-center gap-2 bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
        <RefreshCcw className="h-5 w-5 animate-spin text-[#9d3b5a]" />
        <span>Sincronizando caja y comisiones con Postgres...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      
      {/* CABECERA DINÁMICA */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-bold text-gray-800">
            {usuarioSesion.rol === 'ADMINISTRADOR' ? 'Auditoría Global de Ventas' : 'Mis Ventas Diarias'}
          </h3>
          <p className="text-xs text-gray-400">
            {usuarioSesion.rol === 'ADMINISTRADOR' 
              ? 'Visualizando transacciones de todo el personal' 
              : 'Historial individual de comisiones acumuladas'}
          </p>
        </div>
        <button 
          onClick={cargarHistorialVentas}
          className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors shadow-sm"
        >
          <RefreshCcw className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ALERTAS DE ERROR */}
      {error && (
        <div className="p-3 text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl">
          {error}
        </div>
      )}

      {/* =============================================================================
          📊 PANEL DE CONTROL DE MÉTRICAS (BILLETERA DE COMISIONES)
         ============================================================================= */}
      <div className="rounded-3xl bg-gradient-to-br from-[#9d3b5a] via-[#b3476b] to-[#6b233a] p-5 text-white shadow-md space-y-4">
        <div>
          <p className="text-xs font-bold text-pink-200/80 flex items-center gap-1.5 uppercase tracking-wider">
            <Wallet className="h-3.5 w-3.5" /> 
            {usuarioSesion.rol === 'ADMINISTRADOR' ? 'Flujo Total de Caja' : 'Mi Balance'}
          </p>
          <span className="text-[10px] font-medium text-pink-200/60 block mt-1">Total Facturado</span>
          <h2 className="text-3xl font-black mt-0.5">
            Bs {totalDineroAcumulado.toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/5">
            <span className="text-[9px] text-pink-200/70 block uppercase font-bold tracking-wide">Transacciones</span>
            <p className="text-base font-bold">{totalVentasContadas} ítems</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/5">
            <span className="text-[9px] text-pink-200/70 block uppercase font-bold tracking-wide">
              {usuarioSesion.rol === 'ADMINISTRADOR' ? 'Comisión Almacén' : 'Mis Comisiones (10%)'}
            </span>
            <p className="text-base font-bold">
              Bs {totalComisionesCalculadas.toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>

      {/* LISTADO DE TARJETAS MÓVILES MAPPED */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide px-1">Registros Consolidados</p>
        
        {ventas.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50">
            <FileText className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p className="text-xs font-semibold text-gray-400">No hay registros de ventas guardados todavía</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {ventas.map((venta: any) => (
              <div 
                key={venta.id_venta} 
                className="p-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-between hover:border-slate-200 transition-all"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-gray-800">Venta #{venta.id_venta}</span>
                    {usuarioSesion.rol === 'ADMINISTRADOR' && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-500 flex items-center gap-1">
                        <User className="h-2.5 w-2.5" /> ID Vend: {venta.id_vendedor}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> 
                    {new Date(venta.fecha_venta).toLocaleDateString('es-BO', {
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="text-right flex-shrink-0 pl-2">
                  <span className="text-sm font-black text-[#9d3b5a] flex items-center justify-end">
                    Bs {parseFloat(venta.precio_total_venta).toFixed(0)}
                  </span>
                  <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                    ✓ Completado
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}