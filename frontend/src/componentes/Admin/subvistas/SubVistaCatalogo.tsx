import React, { useState } from 'react';
import api from '../../../api/api'; // Tu instancia de Axios configurada
import { Package, CheckCircle2, Image } from 'lucide-react';

export default function SubVistaCatalogo({ productosCatalogo, refrescarProductos, setError, setExito }: any) {
  // Estado local para controlar los inputs del formulario de alta
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre_prod: '',
    precio_base: '',
    url_imagen: ''
  });

  // Manejo del envío del formulario hacia NestJS
  const handleCrearProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); 
    setExito('');

    if (Number(nuevoProducto.precio_base) <= 0) {
      setError('El precio base debe ser un número mayor a 0');
      return;
    }

    // Validación preventiva en caliente para evitar colisiones de nombres idénticos
    const yaExiste = productosCatalogo.some(
      (p: any) => p.nombre_prod.toLowerCase().trim() === nuevoProducto.nombre_prod.toLowerCase().trim()
    );
    
    if (yaExiste) {
      setError(`El suplemento "${nuevoProducto.nombre_prod}" ya existe registrado en el catálogo.`);
      return;
    }

    try {
      // Disparamos el POST a tu controlador de productos de NestJS
      await api.post('/products', {
        nombre_prod: nuevoProducto.nombre_prod,
        precio_base: Number(nuevoProducto.precio_base),
        url_imagen: nuevoProducto.url_imagen.trim() || null // Envía null si el string va vacío
      });

      setExito(`¡Suplemento "${nuevoProducto.nombre_prod}" agregado al catálogo con éxito!`);
      
      // Limpiamos los inputs para un nuevo registro
      setNuevoProducto({ nombre_prod: '', precio_base: '', url_imagen: '' });
      
      // Notificamos al componente padre que haga un fetch para refrescar la lista
      refrescarProductos();
    } catch (err: any) {
      console.error("Error al registrar producto:", err);
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'No se pudo registrar el producto en el catálogo.');
    }
  };

  return (
    <div className="space-y-5 animate-slideDown">
      
      {/* Formulario de Alta de Suplementos */}
      <form onSubmit={handleCrearProducto} className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-1.5 border-b border-gray-50 pb-2">
          <Package className="h-4 w-4 text-[#841a40]" />
          <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide">Agregar Suplemento</h4>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <input 
            type="text" 
            required 
            placeholder="Nombre comercial" 
            value={nuevoProducto.nombre_prod} 
            onChange={e => setNuevoProducto({...nuevoProducto, nombre_prod: e.target.value})} 
            className="w-full p-2.5 border border-gray-200 text-xs rounded-xl bg-gray-50/50 focus:outline-none focus:border-[#841a40]" 
          />
          
          <input 
            type="number" 
            min="1" 
            required 
            placeholder="Precio Base" 
            value={nuevoProducto.precio_base} 
            onChange={e => setNuevoProducto({...nuevoProducto, precio_base: e.target.value})} 
            className="w-full p-2.5 border border-gray-200 text-xs rounded-xl bg-gray-50/50 focus:outline-none focus:border-[#841a40]" 
          />
          
          <div className="relative">
            <input 
              type="url" 
              placeholder="URL de la Imagen (Opcional)" 
              value={nuevoProducto.url_imagen} 
              onChange={e => setNuevoProducto({...nuevoProducto, url_imagen: e.target.value})} 
              className="w-full p-2.5 pr-8 border border-gray-200 text-xs rounded-xl bg-gray-50/50 focus:outline-none focus:border-[#841a40] truncate" 
            />
            <Image className="absolute right-2.5 top-3 h-3.5 w-3.5 text-gray-400" />
          </div>
        </div>
        
        <button type="submit" className="w-full py-3 rounded-xl bg-[#841a40] text-white text-xs font-black uppercase tracking-wider transition-colors hover:bg-[#6b1333]">
          Guardar Suplemento
        </button>
      </form>

      {/* Listado de Verificación del Catálogo */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <p className="text-xs font-black text-gray-500 uppercase tracking-wide">Suplementos Establecidos</p>
          <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded-full">
            {productosCatalogo.length} Items
          </span>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          {productosCatalogo.map((prod: any) => (
            <div key={prod.id_producto} className="flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-xl shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                
                {/* Contenedor de Imagen de Producto */}
                <div className="w-8 h-8 rounded-lg bg-gray-50 border overflow-hidden flex items-center justify-center flex-shrink-0">
                  {prod.url_imagen ? (
                    <img src={prod.url_imagen} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package className="h-4 w-4 text-gray-300" />
                  )}
                </div>
                
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate max-w-[240px]">
                    {prod.nombre_prod}
                  </p>
                </div>
              </div>
              
              <div className="text-right flex items-center gap-2">
                <p className="text-xs font-black text-[#841a40]">
                  Bs {parseFloat(prod.precio_base).toFixed(0)}
                </p>
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}