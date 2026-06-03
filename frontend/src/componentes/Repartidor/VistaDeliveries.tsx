import React from 'react';

export default function VistaDeliveries() {
  const historialDeliveries = [
    { id: 1, productos: '1 producto', repartidor: 'Mel Celis', total: 300 },
    { id: 2, productos: '1 producto', repartidor: 'Mel Celis', total: 280 },
    { id: 3, productos: '1 producto', repartidor: 'Mel Celis', total: 300 },
    { id: 4, productos: '2 productos', repartidor: 'Susana Sanguino', total: 580, badge: 2 },
    { id: 5, productos: '1 producto', repartidor: 'Paul', total: 300 },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Card Macro de Entregas y Billetera */}
      <div className="rounded-3xl bg-gradient-to-br from-[#801c3d] via-[#912d4f] to-[#592657] p-5 text-white shadow-md">
        <p className="text-xs font-medium text-pink-200/80 flex items-center gap-1.5 mb-1">👛 Mi Billetera</p>
        <span className="text-[10px] font-medium text-pink-200/60 block">Total Acumulado</span>
        <h2 className="text-3xl font-extrabold mt-0.5 mb-4">Bs 29,404</h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5">
            <span className="text-[9px] text-pink-200/70 block uppercase">Entregas</span>
            <p className="text-base font-bold">87</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5">
            <span className="text-[9px] text-pink-200/70 block uppercase">Comisión</span>
            <p className="text-base font-bold">Bs 0</p>
          </div>
        </div>
      </div>

      {/* Historial General de Repartos */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500">Historial de Entregas (87)</p>
        <div className="space-y-2">
          {historialDeliveries.map((d) => (
            <div key={d.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#fdf2f5] text-[#841a40]">📦</div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-gray-800">{d.productos}</h4>
                    {d.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-purple-200 text-purple-800 rounded-full">
                        {d.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-medium text-gray-500">{d.repartidor}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-[10px] font-bold">Bs {d.total}</span>
                <span className="text-gray-400 text-xs">▼</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}