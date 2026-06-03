import React, { useState } from 'react';
import api from '../../../api/api'; // Tu instancia de Axios configurada
import { UserPlus, TrendingUp } from 'lucide-react';

export default function SubVistaPersonal({ usuariosSistema, ventas, refrescarUsuarios, setError, setExito }: any) {
  // Estados locales para la gestión del inventario y formulario del personal
  const [usuarioAbierto, setUsuarioAbierto] = useState<number | null>(null);
  const [stocksUsuario, setStocksUsuario] = useState<any[]>([]);
  const [actualizandoId, setActualizandoId] = useState<number | null>(null);

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'VENDEDOR',
    nombre_sucursal: '', // Exclusivo si eligen 'DELIVERY'
    direccion: '',
    captchaToken: 'TOKEN_MANUAL_ADMIN_BYPASS' // Bypass del captcha ya que es el admin quien crea
  });

  // Manejo del alta de nuevos empleados
  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); 
    setExito('');

    if (nuevoUsuario.rol === 'DELIVERY' && !nuevoUsuario.nombre_sucursal.trim()) {
      setError('Para el rol DELIVERY el nombre de sucursal es obligatorio');
      return;
    }

    try {
      const respuesta = await api.post('/auth/registro', nuevoUsuario);
      
      setExito(`¡Usuario creado! ${respuesta.data.mensaje || ''}`);
      
      // Limpiamos el formulario tras el éxito
      setNuevoUsuario({
        nombre: '', email: '', password: '', rol: 'VENDEDOR',
        nombre_sucursal: '', direccion: '', captchaToken: 'TOKEN_MANUAL_ADMIN_BYPASS'
      });
      
      // Notificamos al componente padre que refresque la nómina global
      refrescarUsuarios();
    } catch (err: any) {
      console.error("Error al registrar personal:", err);
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'No se pudo crear el usuario.');
    }
  };

  // Modificación del stock en caliente (Asignación Directa)
  const handleModificarCantidad = async (idUsuario: number, idProducto: number, nuevaCantidad: number) => {
    setActualizandoId(idProducto);
    try {
      await api.patch(`/deliveries/${idUsuario}/stock`, {
        id_producto: idProducto,
        cantidad: Number(nuevaCantidad)
      });
      
      // Refrescamos visualmente el input mutando el estado local
      setStocksUsuario(prev => 
        prev.map(s => s.id_producto === idProducto ? { ...s, cantidad: nuevaCantidad } : s)
      );
    } catch (err) {
      console.error("No se pudo actualizar el stock en el backend:", err);
    } finally {
      setActualizandoId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Formulario de Alta de Personal */}
      <form onSubmit={handleCrearUsuario} className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center gap-1.5 border-b border-gray-50 pb-2">
          <UserPlus className="h-4 w-4 text-[#841a40]" />
          <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide">Registrar Nuevo Empleado</h4>
        </div>
        <div className="grid grid-cols-1 gap-2.5">
          <input type="text" required placeholder="Nombre completo" value={nuevoUsuario.nombre} onChange={e => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value})} className="w-full p-2.5 border border-gray-200 text-xs rounded-xl bg-gray-50/50 focus:outline-none" />
          <input type="email" required placeholder="Correo institucional" value={nuevoUsuario.email} onChange={e => setNuevoUsuario({...nuevoUsuario, email: e.target.value})} className="w-full p-2.5 border border-gray-200 text-xs rounded-xl bg-gray-50/50 focus:outline-none" />
          <input type="password" required placeholder="Contraseña de acceso" value={nuevoUsuario.password} onChange={e => setNuevoUsuario({...nuevoUsuario, password: e.target.value})} className="w-full p-2.5 border border-gray-200 text-xs rounded-xl bg-gray-50/50 focus:outline-none" />
          <div>
            <select value={nuevoUsuario.rol} onChange={e => setNuevoUsuario({...nuevoUsuario, rol: e.target.value})} className="w-full p-2.5 border border-gray-200 text-xs rounded-xl bg-white focus:outline-none">
              <option value="VENDEDOR">Vendedor (Terminal P.V.)</option>
              <option value="DELIVERY">Repartidor / Sucursal</option>
              <option value="ADMINISTRADOR">Administrador Global</option>
            </select>
          </div>
          {nuevoUsuario.rol === 'DELIVERY' && (
            <div className="p-3 bg-pink-50/50 border border-pink-100 rounded-xl space-y-2">
              <input type="text" required placeholder="Nombre de la sucursal" value={nuevoUsuario.nombre_sucursal} onChange={e => setNuevoUsuario({...nuevoUsuario, nombre_sucursal: e.target.value})} className="w-full p-2.5 border border-pink-200 text-xs rounded-xl bg-white focus:outline-none" />
              <input type="text" placeholder="Dirección física" value={nuevoUsuario.direccion} onChange={e => setNuevoUsuario({...nuevoUsuario, direccion: e.target.value})} className="w-full p-2.5 border border-pink-200 text-xs rounded-xl bg-white focus:outline-none" />
            </div>
          )}
        </div>
        <button type="submit" className="w-full py-2.5 mt-2 rounded-xl bg-[#841a40] text-white text-xs font-bold">Dar de Alta Personal</button>
      </form>

      {/* Listado de Personal */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 px-1">Personal en la Red</p>
        <div className="space-y-2.5">
          {usuariosSistema.map((user: any) => {
            const esAbierto = usuarioAbierto === user.id_usuario;
            const puedeTenerStock = user.rol === 'DELIVERY';

            // =============================================================================
            // LÓGICA DE AUDITORÍA: Filtrar y sumar todas las ventas de este Vendedor
            // =============================================================================
            const totalVendidoPorEsteVendedor = ventas
              .filter((v: any) => Number(v.id_vendedor) === Number(user.id_usuario))
              .reduce((sum: number, v: any) => sum + parseFloat(v.precio_total_venta || 0), 0);

            const handleToggleUsuario = async () => {
              if (!puedeTenerStock) return; 
              if (esAbierto) { setUsuarioAbierto(null); return; }
              setUsuarioAbierto(user.id_usuario); 
              setStocksUsuario([]); 
              try {
                const res = await api.get(`/deliveries/${user.id_usuario}/stock`);
                setStocksUsuario(res.data);
              } catch (err) { 
                console.error("Error al jalar stock del delivery:", err); 
              }
            };

            return (
              <div key={user.id_usuario} className={`bg-white border rounded-2xl overflow-hidden transition-all ${esAbierto ? 'border-[#841a40] shadow-md' : 'border-gray-100'}`}>
                
                {/* TARJETA INDIVIDUAL */}
                <div onClick={handleToggleUsuario} className={`p-3.5 flex items-center justify-between select-none ${puedeTenerStock ? 'cursor-pointer hover:bg-gray-50/50' : 'bg-white'}`}>
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{user.nombre}</p>
                    <p className="text-[10px] text-gray-400 font-medium truncate">{user.email}</p>
                    
                    {/* INDICADOR EXCLUSIVO DE RENDIMIENTO SI ES VENDEDOR */}
                    {user.rol === 'VENDEDOR' && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 w-fit px-2 py-0.5 rounded-md border border-emerald-100">
                        <TrendingUp className="h-3 w-3" />
                        <span>Vendido: Bs {totalVendidoPorEsteVendedor.toFixed(0)}</span>
                      </div>
                    )}
                  </div>
                  
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex-shrink-0 ${user.rol === 'ADMINISTRADOR' ? 'bg-red-50 text-red-600' : user.rol === 'DELIVERY' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {user.rol === 'DELIVERY' ? 'Repartidor' : user.rol.toLowerCase()}
                  </span>
                </div>

                {/* ACORDEÓN DE EDICIÓN DE STOCK (Sólo Deliveries) */}
                {esAbierto && puedeTenerStock && (
                  <div className="bg-gray-50 border-t border-gray-100 p-3 space-y-2">
                    {stocksUsuario.length === 0 ? (
                      <p className="text-[11px] text-gray-400 py-1.5 italic text-center">Cargando almacén en Postgres...</p>
                    ) : (
                      stocksUsuario.map((stock: any) => (
                        <div key={stock.id_producto} className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-100 text-xs shadow-sm">
                          <span className="font-bold text-gray-700">{stock.producto?.nombre_prod || 'Suplemento'}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-gray-400">Stock:</span>
                            <input 
                              type="number" 
                              min="0" 
                              disabled={actualizandoId === stock.id_producto} 
                              value={stock.cantidad} 
                              onChange={(e) => handleModificarCantidad(user.id_usuario, stock.id_producto, Number(e.target.value))} 
                              className="w-14 p-1 text-center font-bold bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#841a40] focus:bg-white" 
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}