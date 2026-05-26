'use client';

import { useState, useRef } from 'react';
import { FileSpreadsheet, Upload, X, AlertCircle, CheckCircle, Loader2, Download } from 'lucide-react';
import { parseExcelFile, generateExcelTemplate } from '@/lib/excelParser';
import type { Product } from '@/lib/products';
import type { AdminProduct } from './useAdminProducts';

function productToDbRow(p: Product): Partial<AdminProduct> {
  return {
    // sku y slug se generan automáticamente en la API
    title: p.title,
    editorial: p.editorial,
    author: p.author || null,
    price_pen: p.pricePEN,
    stock: p.stock,
    stock_status: p.stockStatus,
    estimated_arrival: p.estimatedArrival ?? null,
    preorder_deposit: p.preorderDeposit ?? null,
    description: p.description || null,
    full_description: p.fullDescription || null,
    specifications: (p.specifications && Object.keys(p.specifications).length)
      ? p.specifications as Record<string, string | number>
      : null,
    images: p.images,
    category: p.category,
    country_group: p.countryGroup,
    tags: p.tags,
    is_active: true,
  };
}

interface Props {
  onImport: (products: Partial<AdminProduct>[]) => Promise<number>;
  onClose: () => void;
}

type Step = 'select' | 'preview' | 'importing' | 'done';

export default function ExcelImportPanel({ onImport, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('select');
  const [parsed, setParsed] = useState<Product[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [inserted, setInserted] = useState(0);
  const [processing, setProcessing] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    try {
      const buf = await file.arrayBuffer();
      const { products, errors: errs } = parseExcelFile(buf);
      setParsed(products);
      setErrors(errs);
      setStep('preview');
    } catch (err) {
      setErrors([`Error al leer el archivo: ${err instanceof Error ? err.message : 'desconocido'}`]);
    } finally {
      setProcessing(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleConfirmImport() {
    if (!parsed.length) return;
    setStep('importing');
    const rows = parsed.map(productToDbRow);
    const count = await onImport(rows);
    setInserted(count);
    setStep('done');
  }

  function downloadTemplate() {
    const buf = generateExcelTemplate();
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'plantilla_productos.xlsx';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  const statusColor: Record<string, string> = {
    in_stock:     'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    on_demand:    'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    preorder:     'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    out_of_stock: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet size={20} /> Importar desde Excel
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={22} /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* STEP: select */}
          {step === 'select' && (
            <div className="space-y-5">
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 text-center cursor-pointer hover:border-[#2b496d] dark:hover:border-[#5a7a9e] transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {processing ? (
                  <Loader2 className="mx-auto text-[#2b496d] animate-spin mb-3" size={40} />
                ) : (
                  <Upload className="mx-auto text-gray-400 mb-3" size={40} />
                )}
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  {processing ? 'Procesando...' : 'Haz clic o arrastra tu archivo Excel aquí'}
                </p>
                <p className="text-sm text-gray-400 mt-1">.xlsx / .xls</p>
                <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
              </div>

              <button onClick={downloadTemplate}
                className="flex items-center gap-2 text-sm text-[#2b496d] dark:text-[#5a7a9e] hover:underline">
                <Download size={15} /> Descargar plantilla Excel
              </button>

              {errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                    <AlertCircle size={16} /> Errores al leer el archivo
                  </p>
                  <ul className="text-sm text-red-600 dark:text-red-300 space-y-1 list-disc list-inside">
                    {errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* STEP: preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong className="text-green-600 dark:text-green-400">{parsed.length}</strong> productos válidos
                  </span>
                </div>
                {errors.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle size={16} className="text-red-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong className="text-red-600 dark:text-red-400">{errors.length}</strong> advertencias
                    </span>
                  </div>
                )}
              </div>

              {/* Validation errors */}
              {errors.length > 0 && (
                <details className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <summary className="cursor-pointer text-sm font-medium text-amber-700 dark:text-amber-400">
                    Ver advertencias ({errors.length})
                  </summary>
                  <ul className="mt-2 text-xs text-amber-600 dark:text-amber-300 space-y-1 list-disc list-inside">
                    {errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </details>
              )}

              {/* Preview table */}
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-700/60">
                    <tr>
                      {['SKU','Título','Editorial','Precio','Stock','Estado','Categoría'].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {parsed.slice(0, 15).map((p, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-3 py-2 font-mono text-gray-500 dark:text-gray-400">{p.sku}</td>
                        <td className="px-3 py-2 text-gray-900 dark:text-white max-w-[160px] truncate">{p.title}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{p.editorial}</td>
                        <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">S/ {p.pricePEN.toFixed(2)}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{p.stock}</td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${statusColor[p.stockStatus] ?? ''}`}>
                            {p.stockStatus}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{p.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsed.length > 15 && (
                  <p className="text-xs text-center text-gray-400 py-2 border-t border-gray-100 dark:border-gray-700">
                    ... y {parsed.length - 15} productos más
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP: importing */}
          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 size={40} className="text-[#2b496d] animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">Importando {parsed.length} productos a Supabase...</p>
            </div>
          )}

          {/* STEP: done */}
          {step === 'done' && (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <CheckCircle size={48} className="text-green-500" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">¡Importación completada!</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Se insertaron <strong>{inserted}</strong> productos en Supabase correctamente.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            {step === 'done' ? 'Cerrar' : 'Cancelar'}
          </button>
          {step === 'preview' && parsed.length > 0 && (
            <button onClick={handleConfirmImport}
              className="px-5 py-2 text-sm rounded-lg bg-[#2b496d] hover:bg-[#1e3550] text-white font-semibold flex items-center gap-2">
              <Upload size={15} />
              Importar {parsed.length} productos
            </button>
          )}
          {step === 'select' && (
            <button onClick={() => fileRef.current?.click()}
              className="px-5 py-2 text-sm rounded-lg bg-[#2b496d] hover:bg-[#1e3550] text-white font-semibold flex items-center gap-2">
              <FileSpreadsheet size={15} />
              Seleccionar archivo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
