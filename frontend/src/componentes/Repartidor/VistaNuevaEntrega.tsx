import React, { useState } from 'react';
import { Search, List, ChevronDown, Plus, Minus, ShoppingBag } from 'lucide-react';

// Tipamos la estructura de los objetos que vienen del backend
interface ProductoStock {
  id_producto: number;
  nombre_prod: string;
  precio_base: string | number;
  url_imagen: string | null;
  cantidad: number; // Este representa el stock en la BD
}

interface ItemCarrito {
  id_producto: number;
  nombre_prod: string;
  precio_base: number;
  cant_vendida: number;
  stockMaximo: number;
}

interface VistaNuevaEntregaProps {
  stockDisponible: any[]; // Cambiar a tu formato de respuesta real de la API
}

export default function VistaNuevaEntrega({ stockDisponible }: VistaNuevaEntregaProps) {
  // ESTADOS DEL COMPONENTE
  const [vendedorBusqueda, setVendedorBusqueda] = useState('');
  const [idVendedorSeleccionado, setIdVendedorSeleccionado] = useState<number | null>(null);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

  // 1. GESTIÓN DEL CARRITO DE COMPRAS MÓVIL
  const agregarAlCarrito = (prod: any) => {
    // Normalizamos nombres de variables por si vienen mapeados desde el stock de deliveries
    const id_producto = prod.id_producto || prod.id;
    const nombre_prod = prod.producto?.nombre_prod || prod.nombre;
    const precio_base = parseFloat(prod.producto?.precio_base || prod.precio);
    const stockMaximo = prod.cantidad !== undefined ? prod.cantidad : prod.disponible;

    setCarrito((carritoActual) => {
      const existe = carritoActual.find((item) => item.id_producto === id_producto);

      if (existe) {
        // Si ya está en el carrito, validamos que no supere el stock real que tiene asignado
        if (existe.cant_vendida >= stockMaximo) return carritoActual;
        return carritoActual.map((item) =>
          item.id_producto === id_producto
            ? { ...item, cant_vendida: item.cant_vendida + 1 }
            : item
        );
      }

      // Si es la primera vez que se presiona, verificamos si hay stock disponible
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

  // Obtener la cantidad de un producto específico en el carrito para pintar los controles
  const obtenerCantidadEnCarrito = (id_producto: number) => {
    const item = carrito.find((i) => i.id_producto === id_producto);
    return item ? item.cant_vendida : 0;
  };

  // Calcular el total acumulado dinámicamente
  const totalFacturado = carrito.reduce((acc, item) => acc + (item.precio_base * item.cant_vendida), 0);

  return (
    <div className="space-y-5 animate-fade-in pb-24">
      
      {/* ==========================================
          SECCIÓN: BUSCADOR DE VENDEDORES
         ========================================== */}
      <div className="space-y-2">
        <h3 className="text-base font-bold text-gray-800">Registrar Entrega</h3>
        <p className="text-xs font-semibold text-gray-500">Seleccionar Vendedor</p>
        
        <div className="flex gap-2">
          <button type="button" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#841a40] text-white text-xs font-semibold shadow-sm">
            <Search className="h-3.5 w-3.5" /> Buscar
          </button>
          <button type="button" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-200 text-gray-700 text-xs font-semibold">
            <List className="h-3.5 w-3.5" /> Lista <ChevronDown className="h-3 w-3" />
          </button>
        </div>
        
        <input 
          type="text" 
          value={vendedorBusqueda}
          onChange={(e) => setVendedorBusqueda(e.target.value)}
          placeholder="Escribe el nombre del vendedor..." 
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#841a40] text-gray-700 shadow-sm transition-all"
        />
      </div>

      {/* ==========================================
          SECCIÓN: GRID DE PRODUCTOS
         ========================================== */}
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
            const precio = parseFloat(prod.producto?.precio_base || prod.precio);
            const disponible = prod.cantidad !== undefined ? prod.cantidad : prod.disponible;
            const imagen = prod.producto?.url_imagen || prod.img;
            
            const cantidadEnCarrito = obtenerCantidadEnCarrito(id);

            return (
              <div 
                key={id} 
                className={`bg-white border rounded-2xl p-2 shadow-sm flex flex-col justify-between transition-all select-none ${
                  cantidadEnCarrito > 0 ? 'border-[#841a40] ring-1 ring-[#841a40]/30' : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                {/* Contenedor de la Imagen mapeada a tu nueva columna url_imagen */}
                <div 
                  onClick={() => agregarAlCarrito(prod)}
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
                </div>

                {/* Información básica del Suplemento */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-gray-800 truncate">{nombre}</h4>
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] text-[#841a40] font-bold">Bs {precio.toFixed(0)}</p>
                    <p className="text-[10px] text-gray-400 font-medium">Stock: {disponible}</p>
                  </div>
                </div>

                {/* CONTROLADORES REACTIVOS DE CANTIDAD (+ / -) */}
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

      {/* ==========================================
          RESUMEN FLOTANTE INFORMATIVO DEL TOTAL
         ========================================== */}
      {carrito.length > 0 && (
        <div className="p-3.5 bg-[#841a40]/5 rounded-xl border border-[#841a40]/20 flex items-center justify-between animate-fadeIn">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Total calculado en lote</p>
            <p className="text-xs font-medium text-gray-600">{carrito.reduce((sum, i) => sum + i.cant_vendida, 0)} suplementos cargados</p>
          </div>
          <span className="text-base font-black text-[#841a40]">Bs {totalFacturado.toFixed(0)}</span>
        </div>
      )}

    </div>
  );
}