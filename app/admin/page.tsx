'use client';

import { useState, useRef } from 'react';
import { parseExcelFile, generateExcelTemplate, productsToJson } from '@/lib/excelParser';
import { Product } from '@/lib/products';
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Trash2,
  Eye,
  Save,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';

const STORAGE_KEY = 'neko-manga-uploaded-products';

export default function AdminPage() {
  const [uploadedProducts, setUploadedProducts] = useState<Product[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrors([]);
    setSuccessMessage('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const { products, errors: parseErrors } = parseExcelFile(arrayBuffer);

      if (parseErrors.length > 0) {
        setErrors(parseErrors);
      }

      if (products.length > 0) {
        setUploadedProducts(products);
        setSuccessMessage(`Se procesaron ${products.length} productos correctamente.`);
      }
    } catch (error) {
      setErrors([`Error al leer el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`]);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadTemplate = () => {
    const buffer = generateExcelTemplate();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_productos_neko_manga.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const json = productsToJson(uploadedProducts);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveToLocalStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(uploadedProducts));
      setSuccessMessage('Productos guardados en el almacenamiento local. Se mostraran en la tienda.');
    } catch (error) {
      setErrors([`Error al guardar: ${error instanceof Error ? error.message : 'Error desconocido'}`]);
    }
  };

  const handleClearStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUploadedProducts([]);
    setSuccessMessage('Almacenamiento local limpiado. Se mostraran los productos por defecto.');
  };

  const handleLoadFromStorage = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const products = JSON.parse(stored) as Product[];
        setUploadedProducts(products);
        setSuccessMessage(`Se cargaron ${products.length} productos del almacenamiento local.`);
      } catch {
        setErrors(['Error al cargar productos del almacenamiento local.']);
      }
    } else {
      setErrors(['No hay productos guardados en el almacenamiento local.']);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/products"
            className="flex items-center text-[#2b496d] dark:text-[#5a7a9e] hover:underline mb-4"
          >
            <ChevronLeft size={20} />
            <span>Volver a productos</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Administrar Productos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sube un archivo Excel para agregar o actualizar productos en la tienda.
          </p>
        </div>

        {/* Messages */}
        {errors.length > 0 && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-400">Errores encontrados</h3>
                <ul className="mt-2 text-sm text-red-700 dark:text-red-300 space-y-1">
                  {errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-500" size={20} />
              <p className="text-green-800 dark:text-green-400">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Upload size={24} />
              Subir Excel
            </h2>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-[#2b496d] dark:hover:border-[#5a7a9e] transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileSpreadsheet className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Haz clic o arrastra un archivo Excel aqui
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Formatos soportados: .xlsx, .xls
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#2b496d]"></div>
                  <span>Procesando archivo...</span>
                </div>
              )}
            </div>
          </div>

          {/* Template Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Download size={24} />
              Plantilla Excel
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Descarga la plantilla con el formato correcto para agregar productos.
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="w-full py-3 px-4 bg-[#2b496d] text-white rounded-lg font-semibold hover:bg-[#1e3550] transition-colors flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Descargar Plantilla
            </button>

            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Campos requeridos:</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li><code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">id</code> - Identificador unico</li>
                <li><code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">title</code> - Nombre del producto</li>
                <li><code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">editorial</code> - Editorial</li>
                <li><code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">pricePEN</code> - Precio en soles</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Storage Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Almacenamiento Local
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleLoadFromStorage}
              className="py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <Download size={18} />
              Cargar Guardados
            </button>
            {uploadedProducts.length > 0 && (
              <>
                <button
                  onClick={handleSaveToLocalStorage}
                  className="py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Save size={18} />
                  Guardar en Tienda
                </button>
                <button
                  onClick={handleDownloadJson}
                  className="py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download size={18} />
                  Descargar JSON
                </button>
              </>
            )}
            <button
              onClick={handleClearStorage}
              className="py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 size={18} />
              Limpiar Almacenamiento
            </button>
          </div>
        </div>

        {/* Preview Section */}
        {uploadedProducts.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Eye size={24} />
                Vista Previa ({uploadedProducts.length} productos)
              </h2>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-[#2b496d] dark:text-[#5a7a9e] hover:underline"
              >
                {showPreview ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            {showPreview && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-400">ID</th>
                      <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-400">SKU</th>
                      <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-400">Titulo</th>
                      <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-400">Editorial</th>
                      <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-400">Precio</th>
                      <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-400">Stock</th>
                      <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-400">Estado</th>
                      <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-400">Categoria</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-3 px-4 text-gray-900 dark:text-white">{product.id}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400 font-mono text-xs">
                          {product.sku}
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white">{product.title}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{product.editorial}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                          S/ {product.pricePEN.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{product.stock}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.stockStatus === 'in_stock'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : product.stockStatus === 'preorder'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                  : product.stockStatus === 'on_demand'
                                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {product.stockStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{product.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-400 mb-4">
            Instrucciones de Uso
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-300">
            <li>Descarga la plantilla Excel con el formato correcto.</li>
            <li>Llena los datos de tus productos (los campos id, title, editorial y pricePEN son obligatorios).</li>
            <li>Sube el archivo Excel completado.</li>
            <li>Revisa la vista previa para verificar que los datos son correctos.</li>
            <li>Haz clic en &quot;Guardar en Tienda&quot; para que los productos aparezcan en la web.</li>
            <li>Opcionalmente, descarga el JSON generado para usarlo en el codigo fuente.</li>
          </ol>

          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Valores validos para stockStatus:</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">in_stock</code> - En stock</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">on_demand</code> - A pedido</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">preorder</code> - Preventa</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">out_of_stock</code> - Agotado</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Categorias disponibles:</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              shonen, seinen, shojo, josei, kodomo, isekai, slice_of_life, horror, romance, action, comedy, drama, fantasy, sci-fi, sports, mystery
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
