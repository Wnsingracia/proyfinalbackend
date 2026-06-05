import React, { useState } from 'react';
import api from '../../../api/api'; // Tu instancia de Axios configurada
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Package, ChevronDown, ChevronUp, User, DollarSign, Calendar, Download } from 'lucide-react';

export default function SubVistaVentas({ ventas, totalNegocio, usuariosSistema }: any) {
  const [ventaAbierta, setVentaAbierta] = useState<number | null>(null);
  const [detallesVenta, setDetallesVenta] = useState<{ [key: number]: any[] }>({});

  // Manejo del acordeón para cargar los detalles bajo demanda
  const toggleVenta = async (idVenta: number) => {
    if (ventaAbierta === idVenta) { setVentaAbierta(null); return; }
    setVentaAbierta(idVenta);
    if (!detallesVenta[idVenta]) {
      try {
        // =============================================================================
        // CORRECCIÓN: Volvemos a la ruta original que incluye la sub-ruta "/venta/"
        // =============================================================================
        const respuesta = await api.get(`/detalles-ventas/venta/${idVenta}`);
        
        // Si la de arriba no te da los datos, descomenta esta opción en inglés:
        // const respuesta = await api.get(`/sale-details/sale/${idVenta}`);

        setDetallesVenta(prev => ({ ...prev, [idVenta]: respuesta.data }));
      } catch (err) {
        console.error("Error al jalar los detalles de la venta:", err);
      }
    }
  };

  // =============================================================================
  // 📊 FUNCIÓN: Generar e imprimir Reporte de Auditoría en PDF
  // =============================================================================
  const exportarReportePDF = () => {
    if (ventas.length === 0) {
      alert("No hay ventas registradas para generar el reporte.");
      return;
    }

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Encabezado corporativo fucsia
    doc.setFillColor(132, 26, 64); // #841a40 en RGB
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("SISTEMA RYZTOR", 14, 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Reporte Consolidado de Auditoría de Ventas", 14, 23);
    
    const fechaEmision = new Date().toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    doc.text(`Emitido: ${fechaEmision}`, 14, 29);

    // Resumen de Caja
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("RESUMEN DE OPERACIONES", 14, 46);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(`Total Notas Auditadas: ${ventas.length} registros en el sistema.`, 14, 52);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(132, 26, 64);
    doc.text(`RECAUDACIÓN TOTAL BRUTA: Bs ${totalNegocio.toFixed(0)}`, 14, 58);

    doc.setDrawColor(230, 230, 230);
    doc.line(14, 63, 196, 63);

    // Formatear filas de datos cruzando la memoria local para el PDF
    const filasTabla = ventas.map((v: any) => {
      const vend = usuariosSistema.find((u: any) => Number(u.id_usuario) === Number(v.id_vendedor));
      return [
        `#${v.id_venta}`,
        v.created_at ? new Date(v.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '18/04/2026',
        vend ? vend.nombre.toUpperCase() : `VENDEDOR #${v.id_vendedor}`,
        `Bs ${parseFloat(v.precio_total_venta).toFixed(0)}`
      ];
    });

    // Renderizar la tabla estructurada
    autoTable(doc, {
      startY: 68,
      head: [['Nota ID', 'Fecha Registro', 'Dropshipper / Vendedor Asignado', 'Total Cobrado']],
      body: filasTabla,
      theme: 'striped',
      headStyles: {
        fillColor: [132, 26, 64],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        1: { halign: 'center', cellWidth: 30 },
        3: { halign: 'right', fontStyle: 'bold', cellWidth: 35 }
      }
    });

    // Guardado y descarga automatizada
    doc.save(`Reporte_Ventas_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-4">
      
      {/* CARD DE BALANCE FINANCIERO CON BOTÓN INTEGRADO */}
      <div className="p-4 bg-gradient-to-br from-[#841a40] to-[#5c102a] rounded-2xl text-white shadow-md flex justify-between items-center relative overflow-hidden">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-pink-200/80">Total Recaudado en Ventas</p>
          <h3 className="text-2xl font-black">Bs {totalNegocio.toFixed(0)}</h3>
        </div>
        
        {/* BOTÓN OFICIAL DE REPORTE PDF */}
        <button
          onClick={exportarReportePDF}
          className="flex items-center gap-1 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-bold text-[10px] uppercase tracking-wider px-3.5 py-2.5 rounded-xl border border-white/20 transition-all shadow-sm flex-shrink-0"
        >
          <Download className="h-3.5 w-3.5" /> PDF
        </button>
      </div>

      {/* LISTADO DE TRANCCIONES EN BUCLE */}
      <div className="space-y-2.5">
        {ventas.map((venta: any) => {
          const esAbierto = ventaAbierta === venta.id_venta;
          const totalItemsNota = (detallesVenta[venta.id_venta] || []).length;

          // Cruce inteligente en caliente desde la memoria del cliente
          const vendedorEncontrado = usuariosSistema.find(
            (u: any) => Number(u.id_usuario) === Number(venta.id_vendedor)
          );

          return (
            <div 
              key={venta.id_venta} 
              className={`bg-white border rounded-2xl overflow-hidden transition-all ${
                esAbierto ? 'border-gray-200 shadow-sm bg-white' : 'border-gray-100'
              }`}
            >
              
              {/* CABECERA DE LA NOTA DE VENTA */}
              <div onClick={() => toggleVenta(venta.id_venta)} className="p-3.5 flex items-center justify-between cursor-pointer select-none">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center border border-pink-100/50">
                    <Package className="h-4 w-4 text-[#841a40]" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-gray-800">
                      {totalItemsNota > 0 ? `${totalItemsNota} producto${totalItemsNota > 1 ? 's' : ''}` : 'Ver productos'}
                    </span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ID Venta: #{venta.id_venta}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                    Bs {parseFloat(venta.precio_total_venta).toFixed(0)}
                  </span>
                  {esAbierto ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </div>
              </div>

              {/* ACORDEÓN EXPANDIDO */}
              {esAbierto && (
                <div className="bg-gray-50/70 border-t p-4 space-y-4 text-xs text-gray-700">
                  <div className="space-y-2">
                    <p className="font-bold text-gray-400 text-[11px] uppercase tracking-wider">Productos:</p>
                    
                    {(detallesVenta[venta.id_venta] || []).map((det: any) => {
                      const comisionItem = (parseFloat(det.precio_subtotal) * 0.10); 

                      return (
                        <div key={det.id_detalle} className="space-y-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                          <div className="flex justify-between items-center font-medium">
                            <span className="text-gray-800 font-semibold">{det.cant_vendida}x {det.producto?.nombre_prod || 'Suplemento'}</span>
                            <span className="text-gray-500">Bs {parseFloat(det.precio_subtotal).toFixed(0)}</span>
                          </div>

                          {/* Renderizado del nombre cruzado o respaldo por ID */}
                          <div className="flex items-center gap-2 text-gray-500 font-medium">
                            <User className="h-3.5 w-3.5 text-gray-400" />
                            <span>
                              Dropshipper: <strong className="text-gray-700 uppercase font-bold">
                                {vendedorEncontrado ? vendedorEncontrado.nombre : `Vendedor #${venta.id_vendedor}`}
                              </strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-500 font-medium">
                            <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                            <span>Comisión Total: <strong className="text-emerald-600 font-black">Bs {comisionItem.toFixed(0)}</strong></span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-500 font-medium">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            <span>
                              Fecha: <span className="text-gray-600 font-semibold">
                                {venta.created_at ? new Date(venta.created_at).toLocaleDateString('es-ES', {
                                  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                }) : '18 abr 2026, 11:14'}
                              </span>
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Fallback visual mientras carga la API de detalles */}
                    {(detallesVenta[venta.id_venta] || []).length === 0 && (
                      <p className="text-[11px] text-gray-400 italic text-center py-1">Sincronizando desglose de la nota...</p>
                    )}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}