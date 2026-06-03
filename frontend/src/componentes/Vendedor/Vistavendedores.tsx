import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { FileText, User, Calendar, DollarSign, RefreshCcw } from 'lucide-react';


export default function VistaVendedores() {
    const [ventas, setVentas] = useState<any[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    const usuarioSesion = JSON.parse(localStorage.getItem('usuario_ryztor') || '{}')

    const cargarHistorialVentas = async () => {
        try{
            setCargando(true)
            setError('')

            let urlEndpoint = ''

            if (usuarioSesion.role === 'ADMINISTRADOR' || usuarioSesion.rol === 'ADMINISTRADOR'){
                urlEndpoint = '/ventas';
            }else{
                urlEndpoint = `ventas/vendedor/${usuarioSesion.id_usuario}`
            }

            const respuesta = await api.get(urlEndpoint)
            setVentas(respuesta.data)
        }catch (err:any){
            console.error("Error al traer el historial de ventas: ", err)
            setError('No se puede conectar al servidor de ventas')
        }finally{
            setCargando(false)
        }
    }

    useEffect(() => {
        cargarHistorialVentas()
    }, [])

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
          className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors"
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

      {/* LISTADO DE TARJETAS MÓVILES MAPPED */}
      {cargando ? (
        <div className="text-center py-8 text-xs text-gray-400 font-medium">Cargando transacciones...</div>
      ) : ventas.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50">
          <FileText className="h-8 w-8 mx-auto text-gray-300 mb-2" />
          <p className="text-xs font-semibold text-gray-400">No hay registros de ventas guardados todavía</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {ventas.map((venta: any) => (
            <div 
              key={venta.id_venta} 
              className="p-3.5 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-between hover:border-slate-200 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-800">Venta #{venta.id_venta}</span>
                  {/* Si eres administrador, te interesa ver qué ID de vendedor se lleva el crédito */}
                  {usuarioSesion.rol === 'ADMINISTRADOR' && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-500 flex items-center gap-1">
                      <User className="h-2.5 w-2.5" /> Vendedor: {venta.id_vendedor}
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

              <div className="text-right">
                <span className="text-sm font-black text-[#9d3b5a] flex items-center justify-end">
                  Bs {parseFloat(venta.precio_total_venta).toFixed(0)}
                </span>
                <span className="text-[10px] text-emerald-500 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  ✓ Pagado
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}