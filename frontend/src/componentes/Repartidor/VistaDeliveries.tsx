import React, { useState, useEffect } from 'react';
import api from '../../api/api'; // Tu instancia de Axios configurada
import { Wallet, ChevronDown, Loader2, AlertCircle, Edit3, X, ShoppingBag } from 'lucide-react';

export default function VistaDeliveries() {
  // OBTENEMOS EL USUARIO LOGUEADO DIRECTO DEL STORAGE PARA IDENTIFICAR AL REPARTIDOR
  const [usuarioLogueado] = useState(() => {
    const sesion = localStorage.getItem('usuario_ryztor');
    return sesion ? JSON.parse(sesion) : { id_usuario: 0, nombre: '', rol: '' };
  });

  // ESTADOS OPERATIVOS
  const [entregasRealizadas, setEntregasRealizadas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // ESTADO PARA PASAR EL ID DE LA VENTA ABIERTA (ACORDEÓN DE DETALLES)
  const [idVentaAbierta, setIdVentaAbierta] = useState<number | null>(null);

  // ESTADOS PARA EL MODAL DE EDICIÓN DE PRECIO
  const [modalAbierto, setModalAbierto] = useState(false);
  const [itemAEditar, setItemAEditar] = useState<any>(null);
  const [nuevoPrecioInput, setNuevoPrecioInput] = useState('');

  // FUNCIÓN PARA JALAR DATOS FRESCOS DE LA BASE DE DATOS
  const obtenerEntregasDeBD = async () => {
    try {
      setCargando(true);
      setError('');

      const respuesta = await api.get('/ventas');
      
      // FILTRADO ESTRICTO: Solo nos quedamos con las del repartidor actual
      const misEntregas = respuesta.data.filter(
        (venta: any) => Number(venta.id_delivery) === Number(usuarioLogueado.id_usuario)
      );

      setEntregasRealizadas(misEntregas);
    } catch (err) {
      console.error("Error al jalar historial de entregas de Postgres:", err);
      setError("Error de sincronización con el servidor de NestJS.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (usuarioLogueado.id_usuario > 0) {
      obtenerEntregasDeBD();
    }
  }, [usuarioLogueado.id_usuario]);

  // =============================================================================
  // 📊 COMPUTO DE METRICAS EN CALIENTE
  // =============================================================================
  const totalEntregasContadas = entregasRealizadas.length;

  const totalDineroRecaudado = entregasRealizadas.reduce(
    (sum, venta) => sum + parseFloat(venta.precio_total_venta || 0), 0
  );

  const comisionCalculada = totalDineroRecaudado * 0.00; 

  // =============================================================================
  // ⚡ CONTROLADORES DE INTERFAZ INTERACTIVA
  // =============================================================================
  const handleToggleAcordeonDetalles = (idVenta: number) => {
    setIdVentaAbierta(idVentaAbierta === idVenta ? null : idVenta);
  };

  const abrirModalEdicion = (e: React.MouseEvent, venta: any) => {
    e.stopPropagation(); 
    setItemAEditar(venta);
    setNuevoPrecioInput(parseFloat(venta.precio_total_venta).toFixed(0));
    setModalAbierto(true);
  };

  const guardarNuevoPrecio = async () => {
    const precioNumerico = parseFloat(nuevoPrecioInput);
    if (isNaN(precioNumerico) || precioNumerico < 0) return;

    try {
      setEntregasRealizadas((prevEntregas) =>
        prevEntregas.map((v) =>
          v.id_venta === itemAEditar.id_venta
            ? { ...v, precio_total_venta: precioNumerico }
            : v
        )
      );
      setModalAbierto(false);
      setItemAEditar(null);
    } catch (err) {
      console.error("No se pudo actualizar el precio en el servidor:", err);
    }
  };

  if (cargando) {
    return (
      <div className="text-center py-16 text-xs text-gray-400 font-medium flex flex-col items-center justify-center gap-2 bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
        <Loader2 className="h-5 w-5 animate-spin text-[#841a40]" />
        <span>Sincronizando caja y billetera con Postgres...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn relative">
      
      {/* ALERTA DE ERROR */}
      {error && (
        <div className="p-3 text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* CARD MACRO DE ENTREGAS Y BILLETERA DINÁMICA */}
      <div className="rounded-3xl bg-gradient-to-br from-[#801c3d] via-[#912d4f] to-[#592657] p-5 text-white shadow-md">
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs font-bold text-pink-200/80 flex items-center gap-1.5 uppercase tracking-wider">
            <Wallet className="h-3.5 w-3.5" /> Mi Billetera
          </p>
          <button 
            onClick={obtenerEntregasDeBD} 
            className="text-[10px] bg-white/10 px-2 py-0.5 rounded-lg border border-white/10 hover:bg-white/20 transition-colors"
          >
            Sincronizar
          </button>
        </div>
        <span className="text-[10px] font-medium text-pink-200/60 block">Total Acumulado</span>
        
        <h2 className="text-3xl font-extrabold mt-0.5 mb-4">
          Bs {totalDineroRecaudado.toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/5">
            <span className="text-[9px] text-pink-200/70 block uppercase font-bold tracking-wide">Entregas</span>
            <p className="text-base font-bold">{totalEntregasContadas}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/5">
            <span className="text-[9px] text-pink-200/70 block uppercase font-bold tracking-wide">Comisión</span>
            <p className="text-base font-bold">Bs {comisionCalculada.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* HISTORIAL GENERAL DE REPARTOS */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <p className="text-xs font-black text-gray-500 uppercase tracking-wide">Historial de Entregas</p>
          <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded-full">
            {totalEntregasContadas} ítems
          </span>
        </div>

        <div className="space-y-2">
          {entregasRealizadas.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-10 bg-white border rounded-2xl">
              No tienes entregas registradas en el sistema aún.
            </p>
          ) : (
            entregasRealizadas.map((venta: any) => {
              // ──> Mapeamos de forma estricta contra la relación cargada en tu NestJS Entity
              const listaProductos = venta.productos || [];
              
              // 🛠️ SOLUCIÓN 1: Sumamos dinámicamente la cantidad real vendida de cada suplemento
              const cantidadTotalUnidades = listaProductos.reduce(
                (acc: number, det: any) => acc + Number(det.cant_vendida || 0), 0
              );
              
              const esAbierto = idVentaAbierta === venta.id_venta;

              return (
                <div 
                  key={venta.id_venta} 
                  className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 ${
                    esAbierto ? 'border-[#841a40] shadow-md' : 'border-gray-100'
                  }`}
                >
                  {/* TARJETA INDIVIDUAL */}
                  <div 
                    onClick={() => handleToggleAcordeonDetalles(venta.id_venta)}
                    className="flex items-center justify-between p-3 select-none cursor-pointer hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-[#fdf2f5] text-[#841a40] flex-shrink-0 font-bold">
                        📦
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-gray-800 truncate">
                          {cantidadTotalUnidades === 1 ? '1 producto' : `${cantidadTotalUnidades} productos`}
                        </h4>
                        <p className="text-[9px] font-semibold text-gray-400 mt-0.5">
                          Nota #{venta.id_venta} • {new Date(venta.fecha_venta).toLocaleDateString('es-BO')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right flex items-center gap-1.5 flex-shrink-0">
                      <span 
                        onClick={(e) => abrirModalEdicion(e, venta)}
                        className="px-2 py-1 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 text-[10px] font-black flex items-center gap-1 hover:bg-pink-50 hover:text-[#841a40] transition-colors"
                        title="Ajustar precio final"
                      >
                        Bs {parseFloat(venta.precio_total_venta || 0).toFixed(0)}
                        <Edit3 className="h-2.5 w-2.5 text-gray-400" />
                      </span>
                      <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${esAbierto ? 'rotate-180 text-[#841a40]' : ''}`} />
                    </div>
                  </div>

                  {/* ACORDEÓN DESPLEGABLE CON INFORMACIÓN MULTI-RELACIONAL */}
                  {esAbierto && (
                    <div className="bg-gray-50/50 border-t border-gray-100 p-3 space-y-1.5 animate-fadeIn">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1 px-1 flex items-center gap-1">
                        <ShoppingBag className="h-3 w-3" /> Resumen del Despacho:
                      </p>
                      {listaProductos.length === 0 ? (
                        <p className="text-[10px] text-gray-400 italic px-1">Sin desglose de ítems disponible.</p>
                      ) : (
                        listaProductos.map((det: any, index: number) => {
                          // Extraemos los datos del producto mapeado a través del segundo JOIN anidado
                          const datosSuplemento = det.producto || {};
                          
                          return (
                            <div 
                              key={det.id_detalle_venta || index} 
                              className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-gray-100 text-xs shadow-sm"
                            >
                              <div className="space-y-0.5 min-w-0">
                                <p className="font-bold text-gray-700 truncate">
                                  {datosSuplemento.nombre_prod || 'Suplemento'}
                                </p>
                                <p className="text-[9px] text-gray-400 font-medium">
                                  Cantidad asignada: {det.cant_vendida || 1} un.
                                </p>
                              </div>
                              {/* 🛠️ SOLUCIÓN 2: Leemos directamente el subtotal transado modificado en caliente */}
                              <span className="font-black text-[#841a40] text-[11px] flex-shrink-0 pl-2">
                                Bs {parseFloat(det.precio_subtotal || 0).toFixed(0)}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL INTERACTIVO FLOTANTE */}
      {modalAbierto && itemAEditar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[340px] rounded-3xl p-5 border border-gray-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide">Ajustar Valor de Entrega</h4>
                <p className="text-[10px] font-bold text-gray-400">Nota correlativa #{itemAEditar.id_venta}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setModalAbierto(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Precio Final de Transacción (Bs)</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-sm font-black text-gray-400">Bs</span>
                <input 
                  type="number"
                  min="0"
                  value={nuevoPrecioInput}
                  onChange={(e) => setNuevoPrecioInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 text-sm font-bold rounded-xl bg-gray-50/50 focus:outline-none focus:border-[#841a40] focus:bg-white text-gray-700 shadow-sm transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button type="button" onClick={() => setModalAbierto(false)} className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-xl">
                Cancelar
              </button>
              <button type="button" onClick={guardarNuevoPrecio} className="w-full py-2.5 bg-[#841a40] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}