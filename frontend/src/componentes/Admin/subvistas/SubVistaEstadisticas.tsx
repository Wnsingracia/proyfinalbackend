import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../api/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, TrendingUp, PackageCheck, Loader2, AlertCircle } from 'lucide-react';

export default function SubVistaEstadisticas({ ventas = [] }: { ventas: any[] }) {
  const [detallesGlobales, setDetallesGlobales] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorLocal, setErrorLocal] = useState(false);

  // =============================================================================
  // ⚡ LLAMADA EN PARALELO: Traemos el desglose usando tu ruta 100% segura
  // =============================================================================
  useEffect(() => {
    const cargarTodosLosDetalles = async () => {
      // Si el componente padre todavía no le pasa las ventas, esperamos en carga
      if (!ventas || ventas.length === 0) {
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setErrorLocal(false);

        // Mapeamos cada venta a su endpoint por ID (el que sí te funciona en el acordeón)
        const promesas = ventas.map(venta => 
          api.get(`/detalles-ventas/venta/${venta.id_venta}`)
            .then(res => res.data)
            .catch(err => {
              console.error(`Error controlado al jalar detalle de nota #${venta.id_venta}:`, err);
              return []; // Si una falla por borrado lógico, devolvemos vacío para no romper el lote
            })
        );

        // Resolvemos todo en paralelo con el motor del navegador
        const resultados = await Promise.all(promesas);
        
        // Aplanamos la matriz en un solo arreglo lineal de productos vendidos
        const todosLosDetalles = resultados.flat();
        setDetallesGlobales(todosLosDetalles);

      } catch (err) {
        console.error("Error crítico en el mapeo de estadísticas:", err);
        setErrorLocal(true);
      } finally {
        setCargando(false);
      }
    };

    cargarTodosLosDetalles();
  }, [ventas]);

  // =============================================================================
  // 📊 CÓMPUTO INTERNO: Agrupación para Recharts
  // =============================================================================
  const datosGrafico = useMemo(() => {
    const contador: { [key: string]: { nombre: string; cantidad: number } } = {};

    detallesGlobales.forEach((det: any) => {
      if (!det) return;
      const idProd = det.id_producto;
      const nombreProd = det.producto?.nombre_prod || `Suplemento #${idProd}`;
      const cantidad = Number(det.cant_vendida || 0);

      if (contador[idProd]) {
        contador[idProd].cantidad += cantidad;
      } else {
        contador[idProd] = { nombre: nombreProd, cantidad: cantidad };
      }
    });

    // Ordenamos de mayor a menor volumen de unidades vendidas y extraemos el Top 5
    return Object.values(contador)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }, [detallesGlobales]);

  const productoEstrella = datosGrafico[0] || { nombre: 'Ninguno', cantidad: 0 };
  const coloresBarras = ['#841a40', '#9c244e', '#b5315d', '#ce3f6d', '#e25180'];

  if (cargando) {
    return (
      <div className="text-center py-12 text-xs text-gray-400 font-medium flex flex-col items-center justify-center gap-2 bg-white border rounded-2xl p-6 shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin text-[#841a40]" />
        <span>Procesando métricas en tiempo real...</span>
      </div>
    );
  }

  if (errorLocal) {
    return (
      <div className="p-4 bg-red-50 border border-red-100 text-red-500 rounded-2xl text-xs flex items-center gap-2">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span>Ocurrió un problema de sincronización al procesar las gráficas.</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slideDown">
      {/* CARD DE RESUMEN METRICA */}
      <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <PackageCheck className="h-3 w-3 text-emerald-500" /> Suplemento Más Demandado
          </p>
          <h4 className="text-sm font-black text-gray-800 truncate max-w-[220px]">
            {productoEstrella.nombre}
          </h4>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-xl text-xs font-black border border-emerald-100 flex items-center gap-0.5">
          <TrendingUp className="h-3.5 w-3.5" /> {productoEstrella.cantidad} u.
        </div>
      </div>

      {/* CONTENEDOR DEL GRAFICO COMPACTO */}
      <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center gap-1.5 border-b border-gray-50 pb-2">
          <BarChart3 className="h-4 w-4 text-[#841a40]" />
          <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide">Top 5 Suplementos Más Vendidos</h4>
        </div>

        {datosGrafico.length === 0 ? (
          <p className="text-xs text-gray-400 italic text-center py-8">
            No hay registros de salidas en los detalles de ventas para computar gráficos.
          </p>
        ) : (
          <div className="w-full h-56 pr-4 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosGrafico} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="nombre" 
                  type="category" 
                  tick={{ fontSize: 9, fontWeight: 'bold', fill: '#4b5563' }} 
                  width={90}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar dataKey="cantidad" radius={[0, 8, 8, 0]} barSize={14}>
                  {datosGrafico.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={coloresBarras[index % coloresBarras.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}