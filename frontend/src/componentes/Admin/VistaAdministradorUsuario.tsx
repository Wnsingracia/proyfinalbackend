import React, { useState } from 'react';
import { Shield, UserCheck } from 'lucide-react';

export default function VistaAdministrarUsuarios({ usuario }: { usuario: any }) {
  const [usuariosSistema] = useState([
    { id: 1, nombre: 'Joaquin Adrian', email: 'joaquin@ryztor.com', rol: 'REPARTIDOR', activo: true },
    { id: 2, nombre: 'Mel Celis', email: 'mel@ryztor.com', rol: 'DELIVERY', activo: true },
    { id: 3, nombre: 'Susana Sanguino', email: 'susana@ryztor.com', rol: 'VENDEDOR', activo: true },
  ]);

  // BLOQUEO DE SEGURIDAD: Solo deja pasar si el rol en sesión es 'ADMINISTRADOR'
  if (usuario.rol !== 'ADMINISTRADOR') {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 px-4 animate-fade-in">
        <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
          <Shield className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-gray-800 mb-1">Acceso Restringido</h3>
        <p className="text-xs text-gray-500 max-w-[260px] leading-relaxed">
          Lo sentimos, solo los usuarios con el rol de <strong>ADMINISTRADOR</strong> tienen permisos para gestionar cuentas de personal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-gray-800">Administrar Usuarios</h3>
          <p className="text-[11px] font-medium text-gray-400">Control de personal del sistema</p>
        </div>
        <button type="button" className="px-3 py-1.5 rounded-lg bg-[#841a40] text-white text-[11px] font-bold shadow-sm">
          + Nuevo
        </button>
      </div>

      <div className="space-y-2.5">
        {usuariosSistema.map((u) => (
          <div key={u.id} className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                <UserCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800">{u.nombre}</h4>
                <p className="text-[10px] text-gray-400 font-medium">{u.email}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-gray-100 text-gray-600">
                  {u.rol}
                </span>
              </div>
            </div>
            
            <div className="flex items-center">
              <span className={`h-2 w-2 rounded-full mr-2 ${u.activo ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
              <select className="text-[10px] font-bold text-gray-600 bg-transparent focus:outline-none cursor-pointer">
                <option>Activo</option>
                <option>Baja</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}