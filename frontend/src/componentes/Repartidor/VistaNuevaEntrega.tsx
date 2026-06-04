import React, { useState, useRef, useEffect } from 'react';
import api from '../../api/api'; // Tu instancia de Axios configurada
import { Search, List, ChevronDown, Plus, Minus, ShoppingBag, User, Edit2, X, Check } from 'lucide-react';

// Tipamos la estructura de los objetos que manejamos en el carrito
interface ItemCarrito {
  id_producto: number;
  nombre_prod: string;
  precio_base: number;
  cant_vendida: number;
  stockMaximo: number;
}

interface VistaNuevaEntregaProps {
  stockDisponible: any[];
  usuariosSistema: any[]; // Recibimos la nómina global de usuarios de la BD
}

export default function VistaNuevaEntrega({ stockDisponible, usuariosSistema = [] }: VistaNuevaEntregaProps) {
  // ESTADOS DEL COMPONENTE
  const [vendedorBusqueda, setVendedorBusqueda] = useState('');
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState<any>(null);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  
  // Estados para el control del Dropdown flotante
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // CONTROL DEL MODAL FLOTANTE DE EDICIÓN DE PRECIOS
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState<any>(null);
  const [precioInput, setPrecioInput] = useState('');
  const [enviandoRegistro, setEnviandoRegistro] = useState(false);

  // Filtrado en caliente para extraer solo al personal con rol de VENDEDOR
  const vendedoresActivos = usuariosSistema.filter(
    (u: any) => u.rol === 'VENDEDOR' && u.nombre.toLowerCase().includes(vendedorBusqueda.toLowerCase())
  );

  // Hook para cerrar el Dropdown de vendedores si el usuario toca fuera de la caja
  useEffect(() => {
    function clickAfuera(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownAbierto(false);
      }
    }
    document.addEventListener("mousedown", clickAfuera);
    return () => document.removeEventListener("mousedown", clickAfuera);
  }, []);

  // GESTIÓN DEL CARRITO DE COMPRAS MÓVIL
  const agregarAlCarrito = (prod: any) => {
    const id_producto = prod.id_producto || prod.id;
    const nombre_prod = prod.producto?.nombre_prod || prod.nombre;
    const precio_base = parseFloat(prod.producto?.precio_base || prod.precio);
    const stockMaximo = prod.cantidad !== undefined ? prod.cantidad : prod.disponible;

    setCarrito((carritoActual) => {
      const existe = carritoActual.find((item) => item.id_producto === id_producto);

      if (existe) {
        if (existe.cant_vendida >= stockMaximo) return carritoActual;
        return carritoActual.map((item) =>
          item.id_producto === id_producto
            ? { ...item, cant_vendida: item.cant_vendida + 1 }
            : item
        );
      }

      if (stockMaximo <= 0) return carritoActual;
      return [...carritoActual, { id_producto, nombre_prod, precio_base, cant_vendida: 1, stockMaximo }];
    });
  };

  const quitarDelCarrito = (id_producto: number) => {
    setCarrito((carritoActual) => {
      const existe = carritoActual.find((item) => item.id_producto === id_producto);
      if (!existe) return carritoActual;

      if (existe.cant_vendida === 1) {
        return carritoActual.filter((item) => item.id_producto !== id_producto);
      }
      return carritoActual.map((item) =>
        item.id_producto === id_producto
          ? { ...item, cant_vendida: item.cant_vendida - 1 }
          : item
      );
    });
  };

  const obtenerCantidadEnCarrito = (id_producto: number) => {
    const item = carrito.find((i) => i.id_producto === id_producto);
    return item ? item.cant_vendida : 0;
  };

  // LECTURA DE PRECIO DINÁMICA: Si ya se alteró en el carrito, lee ese, si no, lee el de la BD
  const obtenerPrecioActual = (id_producto: number, precioOriginal: number) => {
    const item = carrito.find((i) => i.id_producto === id_producto);
    return item ? item.precio_base : precioOriginal;
  };

  // Calcular el total acumulado dinámicamente multiplicando precio_base * cantidad
  const totalFacturado = carrito.reduce((acc, item) => acc + (item.precio_base * item.cant_vendida), 0);

  // GESTORES DEL MODAL FLOTANTE
  const handleAbrirModalPrecio = (idProd: number, nombreProd: string, precioActual: number) => {
    setProductoAEditar({ id_producto: idProd, nombre_prod: nombreProd });
    setPrecioInput(precioActual.toFixed(0)); 
    setModalAbierto(true);
  };

  const handleGuardarPrecioModificado = () => {
    const nuevoPrecio = parseFloat(precioInput);
    if (isNaN(nuevoPrecio) || nuevoPrecio < 0) return;

    setCarrito((carritoActual) =>
      carritoActual.map((item) =>
        item.id_producto === productoAEditar.id_producto
          ? { ...item, precio_base: nuevoPrecio }
          : item
      )
    );

    setModalAbierto(false);
    setProductoAEditar(null);
  };

  // =============================================================================
  // 🚀 CONSOLIDACIÓN INTEGRADA: Envío Masivo del Lote (Cabecera + Detalles)
  // =============================================================================
  const handleConfirmarDespachoEntrega = async () => {
    if (!vendedorSeleccionado) {
      alert("Por favor, selecciona un vendedor de la lista o buscador antes de confirmar.");
      return;
    }
    if (carrito.length === 0) {
      alert("El carrito está vacío. Agrega por lo menos un suplemento para el despacho.");
      return;
    }

    const confirmar = window.confirm(`¿Confirmar despacho de mercadería a ${vendedorSeleccionado.nombre} por un total de Bs ${totalFacturado.toFixed(0)}?`);
    if (!confirmar) return;

    // Recuperamos el Repartidor/Sucursal logueado de forma segura del localStorage
    const sesionLocal = localStorage.getItem('usuario_ryztor');
    const deliveryLogueado = sesionLocal ? JSON.parse(sesionLocal) : { id_usuario: 0 };

    setEnviandoRegistro(true);
    try {
      // =============================================================================
      // 🏁 MAPEO ALINEADO EXACTAMENTE A TU CreateVentaDto Y CreateDetalleVentaDto
      // =============================================================================
      const payloadVenta = {
        id_delivery: Number(deliveryLogueado.id_usuario),       // @IsInt() id_delivery
        id_vendedor: Number(vendedorSeleccionado.id_usuario),   // @IsInt() id_vendedor
        precio_total_venta: Number(totalFacturado),             // @IsNumber() precio_total_venta

        // El array obligatorio validado por @Type(() => CreateDetalleVentaDto)
        productos: carrito.map(item => ({
          id_producto: Number(item.id_producto),                // Mapeo esperado por el DTO del detalle
          cant_vendida: Number(item.cant_vendida),              // Cantidad de suplementos en el lote
          precio_subtotal: Number(item.precio_base * item.cant_vendida) // Subtotal calculado
        }))
      };

      // Disparamos la petición POST limpia al endpoint de NestJS
      await api.post('/ventas', payloadVenta);

      alert("¡Entrega y detalles registrados con éxito! El almacén en Postgres ha sido actualizado.");
      
      // Limpiamos la interfaz para dejar listo el siguiente despacho
      setCarrito([]);
      setVendedorSeleccionado(null);
      setVendedorBusqueda('');
    } catch (err: any) {
      console.error("Error crítico al asentar la nota de entrega en NestJS:", err);
      if (err.response?.data) {
        console.log("Respuesta de rechazo del ValidationPipe:", err.response.data);
        
        // Formateamos el mensaje de error de NestJS para que sea fácil de leer en la alerta móvil
        const mensajeServidor = err.response.data.message;
        const errorLimpio = Array.isArray(mensajeServidor) ? mensajeServidor.join('\n') : mensajeServidor;
        
        alert(`Error de Validación en el Backend:\n${errorLimpio}`);
      } else {
        alert("No se pudo procesar la entrega. Verifica la conexión con tu servidor local.");
      }
    } finally {
      setEnviandoRegistro(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in pb-32 relative">
      
      {/* SECCIÓN: BUSCADOR DE VENDEDORES (CON DROPDOWN) */}
      <div className="space-y-2">
        <h3 className="text-base font-bold text-gray-800">Registrar Entrega</h3>
        <p className="text-xs font-semibold text-gray-500">Seleccionar Vendedor Destino</p>
        
        <div className="flex gap-2 relative" ref={dropdownRef}>
          <button type="button" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#841a40] text-white text-xs font-bold shadow-sm">
            <Search className="h-3.5 w-3.5" /> Buscar
          </button>
          
          <button 
            type="button" 
            onClick={() => setDropdownAbierto(!dropdownAbierto)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              vendedorSeleccionado 
                ? 'bg-pink-50 border-pink-200 text-[#841a40]' 
                : 'bg-gray-200 border-transparent text-gray-700 hover:bg-gray-300/80'
            }`}
          >
            <List className="h-3.5 w-3.5" /> 
            <span className="max-w-[120px] truncate">
              {vendedorSeleccionado ? vendedorSeleccionado.nombre : 'Lista'}
            </span> 
            <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${dropdownAbierto ? 'rotate-180' : ''}`} />
          </button>

          {dropdownAbierto && (
            <div className="absolute left-24 top-10 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5 max-h-48 overflow-y-auto no-scrollbar">
              <div className="px-3 py-1 border-b border-gray-50 mb-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Vendedores Activos</p>
              </div>

              {vendedoresActivos.length === 0 ? (
                <p className="text-[11px] text-gray-400 italic px-3 py-2">Ningún vendedor coincide.</p>
              ) : (
                vendedoresActivos.map((vendedor: any) => (
                  <button
                    key={vendedor.id_usuario}
                    type="button"
                    onClick={() => {
                      setVendedorSeleccionado(vendedor);
                      setVendedorBusqueda(vendedor.nombre); 
                      setDropdownAbierto(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-pink-50/50 hover:text-[#841a40] font-medium ${
                      vendedorSeleccionado?.id_usuario === vendedor.id_usuario ? 'bg-pink-50 text-[#841a40] font-bold' : 'text-gray-700'
                    }`}
                  >
                    <User className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{vendedor.nombre}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        
        <input 
          type="text" 
          value={vendedorBusqueda}
          onChange={(e) => {
            setVendedorBusqueda(e.target.value);
            if (vendedorSeleccionado && e.target.value !== vendedorSeleccionado.nombre) {
              setVendedorSeleccionado(null);
            }
          }}
          placeholder="Escribe el nombre del vendedor..." 
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#841a40] text-gray-700 shadow-sm transition-all"
        />
      </div>

      {/* SECCIÓN: GRID DE PRODUCTOS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500">Seleccionar Productos</p>
          {carrito.length > 0 && (
            <span className="text-[11px] font-bold text-[#841a40] bg-[#841a40]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShoppingBag className="h-3 w-3" /> {carrito.length} ítems seleccionados
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stockDisponible.map((prod) => {
            const id = prod.id_producto || prod.id;
            const nombre = prod.producto?.nombre_prod || prod.nombre;
            const precioOriginal = parseFloat(prod.producto?.precio_base || prod.precio);
            const disponible = prod.cantidad !== undefined ? prod.cantidad : prod.disponible;
            const imagen = prod.producto?.url_imagen || prod.img;
            
            const cantidadEnCarrito = obtenerCantidadEnCarrito(id);
            const precioMostrado = obtenerPrecioActual(id, precioOriginal);

            return (
              <div 
                key={id} 
                className={`bg-white border rounded-2xl p-2 shadow-sm flex flex-col justify-between transition-all select-none ${
                  cantidadEnCarrito > 0 ? 'border-[#841a40] ring-1 ring-[#841a40]/30' : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                {/* INTERACCIÓN DINÁMICA DE LA IMAGEN CON EL CONTROLADOR DEL MODAL DE PRECIOS */}
                <div 
                  onClick={() => cantidadEnCarrito > 0 ? handleAbrirModalPrecio(id, nombre, precioMostrado) : agregarAlCarrito(prod)}
                  className="w-full h-28 rounded-xl bg-gray-50 overflow-hidden mb-2 flex items-center justify-center cursor-pointer relative"
                >
                  <img 
                    src={imagen || ''} 
                    alt={nombre} 
                    className="object-cover h-full w-full hover:scale-105 transition-transform duration-300" 
                  />
                  {disponible <= 0 && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200 uppercase tracking-wider">Agotado</span>
                    </div>
                  )}
                  {/* Icono de lápiz indicador de edición si ya está en el carro */}
                  {cantidadEnCarrito > 0 && (
                    <div className="absolute top-2 right-2 bg-[#841a40] text-white p-1 rounded-lg border border-white/20 shadow-sm transition-transform hover:scale-110">
                      <Edit2 className="h-3 w-3" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-gray-800 truncate">{nombre}</h4>
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] text-[#841a40] font-bold">Bs {precioMostrado.toFixed(0)}</p>
                    <p className="text-[10px] text-gray-400 font-medium">Stock: {disponible}</p>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-gray-50 flex items-center justify-between">
                  {cantidadEnCarrito === 0 ? (
                    <button
                      type="button"
                      disabled={disponible <= 0}
                      onClick={() => agregarAlCarrito(prod)}
                      className="w-full py-1.5 rounded-xl bg-gray-50 hover:bg-[#841a40]/5 border border-gray-200 hover:border-[#841a40]/30 text-[11px] font-bold text-gray-600 hover:text-[#841a40] transition-all disabled:opacity-40"
                    >
                      Añadir
                    </button>
                  ) : (
                    <div className="flex items-center justify-between w-full bg-gray-50 p-0.5 rounded-xl border border-gray-200">
                      <button
                        type="button"
                        onClick={() => quitarDelCarrito(id)}
                        className="p-1.5 rounded-lg bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 border border-gray-100 shadow-sm transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold text-gray-800 px-1">{cantidadEnCarrito}</span>
                      <button
                        type="button"
                        disabled={cantidadEnCarrito >= disponible}
                        onClick={() => agregarAlCarrito(prod)}
                        className="p-1.5 rounded-lg bg-white hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 border border-gray-100 shadow-sm transition-colors disabled:opacity-40"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* RESUMEN FLOTANTE INFORMATIVO DEL TOTAL */}
      {carrito.length > 0 && (
        <div className="p-3.5 bg-[#841a40]/5 rounded-xl border border-[#841a40]/20 flex items-center justify-between animate-fadeIn">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Total calculado en lote</p>
            <p className="text-xs font-medium text-gray-600">{carrito.reduce((sum, i) => sum + i.cant_vendida, 0)} suplementos cargados</p>
          </div>
          <span className="text-base font-black text-[#841a40]">Bs {totalFacturado.toFixed(0)}</span>
        </div>
      )}

      {/* MODAL FLOTANTE DE EDICIÓN DE PRECIOS */}
      {modalAbierto && productoAEditar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-[340px] rounded-3xl p-5 border border-gray-100 shadow-2xl space-y-4 animate-scaleUp">
            
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <div className="space-y-0.5 max-w-[220px]">
                <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide truncate">{productoAEditar.nombre_prod}</h4>
                <p className="text-[10px] font-bold text-gray-400">Ajustar precio de salida especial</p>
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
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Precio Unitario Modificado (Bs)</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-sm font-black text-gray-400">Bs</span>
                <input 
                  type="number"
                  min="0"
                  value={precioInput}
                  onChange={(e) => setPrecioInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 text-sm font-bold rounded-xl bg-gray-50/50 focus:outline-none focus:border-[#841a40] focus:bg-white text-gray-700 shadow-sm transition-all"
                  placeholder="0"
                />
              </div>
              <p className="text-[9px] font-medium text-gray-400 italic">
                * El cambio afectará simétricamente a todas las unidades agregadas de este producto.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGuardarPrecioModificado}
                className="w-full py-2.5 bg-[#841a40] hover:bg-[#6b1333] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-colors"
              >
                Aplicar Cambio
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ACCIÓN FIJA INFERIOR SÍNCRONA CON EL BACKEND */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] p-4 bg-white border-t border-gray-100 z-40">
        <button 
          type="button" 
          disabled={enviandoRegistro}
          onClick={handleConfirmarDespachoEntrega}
          className="w-full py-4 rounded-xl bg-[#841a40] hover:bg-[#6b1333] text-white font-black uppercase tracking-wider text-sm transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50 select-none"
        >
          {enviandoRegistro ? (
            <span>Sincronizando con Postgres...</span>
          ) : (
            <>
              <Check className="h-4 w-4" /> Confirmar Entrega (Bs {totalFacturado.toFixed(0)})
            </>
          )}
        </button>
      </div>

    </div>
  );
}