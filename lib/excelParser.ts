import * as XLSX from 'xlsx';
import { Product, StockStatus, Category } from './products';

export interface ExcelRow {
  id?: string;
  sku?: string;
  title?: string;
  editorial?: string;
  author?: string;
  pricePEN?: number;
  stock?: number;
  stockStatus?: string;
  estimatedArrival?: string;
  preorderDeposit?: number;
  tags?: string;
  description?: string;
  fullDescription?: string;
  pages?: number;
  format?: string;
  language?: string;
  isbn?: string;
  releaseDate?: string;
  dimensions?: string;
  weight?: string;
  images?: string;
  category?: string;
  countryGroup?: string;
}

const validStockStatuses: StockStatus[] = ['in_stock', 'on_demand', 'preorder', 'out_of_stock'];
const validCategories: Category[] = [
  'shonen', 'seinen', 'shojo', 'josei', 'kodomo', 'isekai', 'slice_of_life',
  'horror', 'romance', 'action', 'comedy', 'drama', 'fantasy', 'sci-fi', 'sports', 'mystery'
];
const validCountryGroups = ['Argentina', 'Mexico'] as const;

export function parseExcelFile(file: ArrayBuffer): { products: Product[]; errors: string[] } {
  const errors: string[] = [];
  const products: Product[] = [];

  try {
    const workbook = XLSX.read(file, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

    jsonData.forEach((row, index) => {
      const rowNum = index + 2; // +2 because Excel is 1-indexed and has header row

      // Validate required fields
      if (!row.id) {
        errors.push(`Fila ${rowNum}: Falta el campo 'id'`);
        return;
      }
      if (!row.title) {
        errors.push(`Fila ${rowNum}: Falta el campo 'title'`);
        return;
      }
      if (!row.editorial) {
        errors.push(`Fila ${rowNum}: Falta el campo 'editorial'`);
        return;
      }
      if (row.pricePEN === undefined || row.pricePEN === null) {
        errors.push(`Fila ${rowNum}: Falta el campo 'pricePEN'`);
        return;
      }

      // Validate stockStatus
      const stockStatus = (row.stockStatus || 'in_stock') as StockStatus;
      if (!validStockStatuses.includes(stockStatus)) {
        errors.push(`Fila ${rowNum}: stockStatus invalido '${row.stockStatus}'. Valores validos: ${validStockStatuses.join(', ')}`);
        return;
      }

      // Validate category
      const category = (row.category || 'shonen') as Category;
      if (!validCategories.includes(category)) {
        errors.push(`Fila ${rowNum}: category invalido '${row.category}'. Valores validos: ${validCategories.join(', ')}`);
        return;
      }

      // Validate countryGroup
      const countryGroup = (row.countryGroup || 'Argentina') as 'Argentina' | 'Mexico';
      if (!validCountryGroups.includes(countryGroup)) {
        errors.push(`Fila ${rowNum}: countryGroup invalido '${row.countryGroup}'. Valores validos: ${validCountryGroups.join(', ')}`);
        return;
      }

      // Parse tags (comma-separated)
      const tags = row.tags ? row.tags.split(',').map(t => t.trim()).filter(t => t) : [];

      // Parse images (comma-separated)
      const images = row.images ? row.images.split(',').map(i => i.trim()).filter(i => i) : ['/images/products/placeholder.jpg'];

      const product: Product = {
        id: String(row.id),
        sku: row.sku || `NMC-${String(row.id).padStart(3, '0')}`,
        title: row.title,
        editorial: row.editorial,
        author: row.author || 'Autor desconocido',
        pricePEN: Number(row.pricePEN),
        stock: Number(row.stock) || 0,
        stockStatus,
        estimatedArrival: row.estimatedArrival,
        preorderDeposit: row.preorderDeposit ? Number(row.preorderDeposit) : undefined,
        tags,
        description: row.description || row.title,
        fullDescription: row.fullDescription || row.description || row.title,
        specifications: {
          pages: row.pages ? Number(row.pages) : undefined,
          format: row.format,
          language: row.language || 'Espanol',
          isbn: row.isbn,
          releaseDate: row.releaseDate,
          dimensions: row.dimensions,
          weight: row.weight,
        },
        images,
        category,
        countryGroup: countryGroup === 'Mexico' ? 'México' : countryGroup,
      };

      products.push(product);
    });
  } catch (error) {
    errors.push(`Error al procesar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }

  return { products, errors };
}

export function generateExcelTemplate(): ArrayBuffer {
  const templateData = [
    {
      id: '1',
      sku: 'NMC-JJK-001',
      title: 'Jujutsu Kaisen Vol. 1',
      editorial: 'Ivrea Argentina',
      author: 'Gege Akutami',
      pricePEN: 45.00,
      stock: 12,
      stockStatus: 'in_stock',
      estimatedArrival: '',
      preorderDeposit: '',
      tags: 'nuevo,bestseller',
      description: 'Descripcion corta del manga',
      fullDescription: 'Descripcion completa y detallada del manga...',
      pages: 192,
      format: 'Tomo (13.5 x 19 cm)',
      language: 'Espanol',
      isbn: '978-4-08-882027-1',
      releaseDate: '2023-05-15',
      dimensions: '13.5 x 19 cm',
      weight: '180g',
      images: '/images/products/jjk-1.jpg,/images/products/jjk-1-back.jpg',
      category: 'shonen',
      countryGroup: 'Argentina',
    },
    {
      id: '2',
      sku: 'NMC-SAO-012',
      title: 'Sword Art Online Vol. 12',
      editorial: 'Viz Media Mexico',
      author: 'Reki Kawahara',
      pricePEN: 46.50,
      stock: 0,
      stockStatus: 'preorder',
      estimatedArrival: '15 de Marzo 2024',
      preorderDeposit: 10,
      tags: 'preventa',
      description: 'Realidad virtual y aventuras epicas',
      fullDescription: 'Descripcion completa del volumen...',
      pages: 200,
      format: 'Tomo (13.5 x 19 cm)',
      language: 'Espanol',
      isbn: '978-4-04-865758-2',
      releaseDate: '2024-03-15',
      dimensions: '13.5 x 19 cm',
      weight: '185g',
      images: '/images/products/sao-12.jpg',
      category: 'isekai',
      countryGroup: 'Mexico',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

  // Set column widths
  worksheet['!cols'] = [
    { wch: 5 },   // id
    { wch: 15 },  // sku
    { wch: 30 },  // title
    { wch: 20 },  // editorial
    { wch: 20 },  // author
    { wch: 10 },  // pricePEN
    { wch: 8 },   // stock
    { wch: 12 },  // stockStatus
    { wch: 20 },  // estimatedArrival
    { wch: 15 },  // preorderDeposit
    { wch: 20 },  // tags
    { wch: 40 },  // description
    { wch: 50 },  // fullDescription
    { wch: 8 },   // pages
    { wch: 20 },  // format
    { wch: 10 },  // language
    { wch: 20 },  // isbn
    { wch: 12 },  // releaseDate
    { wch: 15 },  // dimensions
    { wch: 10 },  // weight
    { wch: 50 },  // images
    { wch: 12 },  // category
    { wch: 12 },  // countryGroup
  ];

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
}

export function productsToJson(products: Product[]): string {
  return JSON.stringify(products, null, 2);
}
