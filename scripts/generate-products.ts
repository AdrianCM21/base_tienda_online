/**
 * Genera src/data/products.json (datos mock deterministas, semilla fija).
 * Uso: npm run generate:products
 */
import { readFileSync, writeFileSync } from 'node:fs'
import type { ColorVariant, Product, ProductTag } from '../src/types/product.ts'

const BASE_DATE = Date.UTC(2026, 8, 30)
const FREE_SHIPPING_FROM = 500_000

// ---------- utilidades ----------
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = rng(20260930)
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// ---------- paletas de color ----------
const c = (name: string, hex: string): [string, string] => [name, hex]
const PALETTES: Record<string, [string, string][]> = {
  laptop: [
    c('Gris Grafito', '#4B5563'),
    c('Plata', '#C0C4CC'),
    c('Azul Abismo', '#1F4E8C'),
    c('Negro', '#111827'),
  ],
  gamer: [c('Negro', '#111827'), c('Gris Carbón', '#374151'), c('Rojo Fuego', '#B91C1C')],
  phone: [
    c('Negro', '#111827'),
    c('Blanco Perla', '#F3F4F6'),
    c('Azul', '#2563EB'),
    c('Verde Salvia', '#7C9A7E'),
    c('Titanio', '#A8A29E'),
  ],
  audio: [
    c('Negro', '#111827'),
    c('Blanco', '#F9FAFB'),
    c('Azul', '#2563EB'),
    c('Rojo', '#DC2626'),
  ],
  appliance: [c('Inox', '#B8BCC4'), c('Blanco', '#FFFFFF'), c('Negro', '#1F2937')],
  desk: [c('Negro', '#111827'), c('Gris', '#6B7280'), c('Blanco', '#F3F4F6'), c('Azul', '#2563EB')],
  bag: [
    c('Negro', '#111827'),
    c('Gris', '#6B7280'),
    c('Azul Marino', '#1E3A5F'),
    c('Verde Oliva', '#556B2F'),
  ],
  fashion: [
    c('Negro', '#111827'),
    c('Blanco', '#F9FAFB'),
    c('Rojo', '#DC2626'),
    c('Azul', '#2563EB'),
  ],
  furniture: [c('Gris', '#6B7280'), c('Beige', '#D6C7A9'), c('Marrón', '#6B4F3A')],
}

// ---------- definición compacta de productos ----------
type Def = {
  name: string
  brand: string
  sub: string
  price: number
  old?: number
  count?: number
  specs: Record<string, string>
  palette?: keyof typeof PALETTES
  colors?: number
  featured?: boolean
  soldOut?: boolean
  draft?: boolean
  rating?: [number, number]
  warranty?: string
  tail?: string
}
const defs: Def[] = []
const add = (d: Def) => defs.push(d)

// Notebooks
type NB = [
  string,
  string,
  string,
  number,
  string,
  string,
  number,
  number | undefined,
  number,
  string?,
  string?,
]
const notebooks: NB[] = [
  [
    'Lenovo',
    'IdeaPad 3 15" Ryzen 5 8GB 256GB SSD',
    'AMD Ryzen 5',
    8,
    '256 GB SSD',
    '15.6" Full HD',
    4590000,
    5190000,
    12,
  ],
  [
    'ASUS',
    'Vivobook 15 Intel i5 8GB 512GB SSD',
    'Intel Core i5',
    8,
    '512 GB SSD',
    '15.6" Full HD',
    5190000,
    undefined,
    12,
  ],
  [
    'HP',
    '250 G9 Intel i3 8GB 256GB SSD',
    'Intel Core i3',
    8,
    '256 GB SSD',
    '15.6" HD',
    3690000,
    4090000,
    10,
  ],
  [
    'Dell',
    'Inspiron 15 Intel i7 16GB 512GB SSD',
    'Intel Core i7',
    16,
    '512 GB SSD',
    '15.6" Full HD',
    7890000,
    undefined,
    18,
  ],
  [
    'Acer',
    'Aspire 5 Ryzen 5 8GB 256GB SSD',
    'AMD Ryzen 5',
    8,
    '256 GB SSD',
    '15.6" Full HD',
    4290000,
    undefined,
    12,
  ],
  [
    'Lenovo',
    'LOQ Gamer Intel i5 RTX 16GB 512GB',
    'Intel Core i5',
    16,
    '512 GB SSD',
    '15.6" Full HD 144Hz',
    9490000,
    10290000,
    18,
    'NVIDIA RTX 4050',
    'gamer',
  ],
  [
    'ASUS',
    'ROG Strix Gamer Ryzen 7 16GB 1TB',
    'AMD Ryzen 7',
    16,
    '1 TB SSD',
    '15.6" Full HD 165Hz',
    12900000,
    undefined,
    18,
    'NVIDIA RTX 4060',
    'gamer',
  ],
  [
    'HP',
    'Pavilion 14 Intel i5 8GB 256GB SSD',
    'Intel Core i5',
    8,
    '256 GB SSD',
    '14" Full HD',
    5590000,
    undefined,
    12,
  ],
  [
    'Dell',
    'Latitude 14 Intel i5 16GB 256GB SSD',
    'Intel Core i5',
    16,
    '256 GB SSD',
    '14" Full HD',
    6290000,
    6890000,
    12,
  ],
  [
    'Acer',
    'Aspire 3 Intel i3 4GB 128GB SSD',
    'Intel Core i3',
    4,
    '128 GB SSD',
    '15.6" HD',
    2890000,
    undefined,
    10,
  ],
  [
    'Lenovo',
    'IdeaPad 1 Intel i3 8GB 256GB SSD',
    'Intel Core i3',
    8,
    '256 GB SSD',
    '15.6" Full HD',
    3390000,
    3790000,
    10,
  ],
  [
    'HP',
    '245 G10 Ryzen 5 16GB 512GB SSD',
    'AMD Ryzen 5',
    16,
    '512 GB SSD',
    '14" Full HD',
    5790000,
    undefined,
    12,
  ],
  [
    'ASUS',
    'Vivobook Go 15 Ryzen 5 8GB 512GB SSD',
    'AMD Ryzen 5',
    8,
    '512 GB SSD',
    '15.6" Full HD',
    4690000,
    undefined,
    12,
  ],
  [
    'Dell',
    'Vostro 3520 Intel i5 8GB 256GB SSD',
    'Intel Core i5',
    8,
    '256 GB SSD',
    '15.6" Full HD',
    5190000,
    5690000,
    12,
  ],
  [
    'Lenovo',
    'ThinkPad E14 Intel i7 16GB 512GB SSD',
    'Intel Core i7',
    16,
    '512 GB SSD',
    '14" WUXGA',
    9790000,
    undefined,
    18,
  ],
  [
    'Acer',
    'Swift Go 14 Intel i7 16GB 1TB SSD',
    'Intel Core i7',
    16,
    '1 TB SSD',
    '14" 2.8K OLED',
    8990000,
    9590000,
    18,
  ],
  [
    'HP',
    'Envy x360 Ryzen 7 16GB 512GB SSD',
    'AMD Ryzen 7',
    16,
    '512 GB SSD',
    '15.6" Full HD táctil',
    8490000,
    undefined,
    18,
  ],
  [
    'ASUS',
    'Zenbook 14 Intel i7 16GB 1TB SSD',
    'Intel Core i7',
    16,
    '1 TB SSD',
    '14" 2.8K OLED',
    10990000,
    undefined,
    18,
  ],
  [
    'Dell',
    'XPS 13 Intel i7 32GB 1TB SSD',
    'Intel Core i7',
    32,
    '1 TB SSD',
    '13.4" 3.5K OLED',
    15900000,
    16900000,
    18,
  ],
  [
    'Lenovo',
    'Legion 5 Ryzen 7 16GB 1TB RTX',
    'AMD Ryzen 7',
    16,
    '1 TB SSD',
    '15.6" WQHD 165Hz',
    13490000,
    undefined,
    18,
    'NVIDIA RTX 4060',
    'gamer',
  ],
  [
    'Acer',
    'Nitro V Intel i5 16GB 512GB RTX',
    'Intel Core i5',
    16,
    '512 GB SSD',
    '15.6" Full HD 144Hz',
    8990000,
    9490000,
    18,
    'NVIDIA RTX 4050',
    'gamer',
  ],
  [
    'HP',
    'Victus 15 Ryzen 5 16GB 512GB RTX',
    'AMD Ryzen 5',
    16,
    '512 GB SSD',
    '15.6" Full HD 144Hz',
    7390000,
    undefined,
    18,
    'NVIDIA RTX 3050',
    'gamer',
  ],
  [
    'MSI',
    'Thin GF63 Intel i5 16GB 512GB GTX',
    'Intel Core i5',
    16,
    '512 GB SSD',
    '15.6" Full HD 144Hz',
    6890000,
    undefined,
    12,
    'NVIDIA GTX 1650',
    'gamer',
  ],
  [
    'ASUS',
    'TUF Gaming F15 Intel i7 16GB 512GB',
    'Intel Core i7',
    16,
    '512 GB SSD',
    '15.6" Full HD 144Hz',
    10490000,
    11290000,
    18,
    'NVIDIA RTX 4060',
    'gamer',
  ],
]
notebooks.forEach(([brand, model, cpu, ram, ssd, screen, price, old, count, gpu], i) => {
  const gamer = !!gpu
  add({
    name: `Notebook ${brand} ${model}`,
    brand,
    sub: i >= 9 && gamer ? 'notebooks-gamer' : 'notebooks',
    price,
    old,
    count,
    palette: gamer ? 'gamer' : 'laptop',
    colors: i === 0 ? 3 : undefined,
    featured: i === 0,
    rating: i === 0 ? [4.6, 128] : undefined,
    specs: {
      Procesador: cpu,
      'Memoria RAM': `${ram} GB`,
      Almacenamiento: ssd,
      Pantalla: screen,
      ...(gpu ? { 'Placa de video': gpu } : {}),
      'Sistema operativo': gamer
        ? 'Windows 11 Home'
        : i % 4 === 3
          ? 'Windows 11 Pro'
          : 'Windows 11 Home',
    },
    warranty: '12 meses',
  })
})

// Electrónica
add({
  name: 'Smart TV 55" 4K UHD',
  brand: 'Samsung',
  sub: 'smart-tv',
  price: 3290000,
  count: 10,
  featured: true,
  specs: {
    'Tamaño de pantalla': '55"',
    Resolución: '4K UHD',
    'Sistema operativo': 'Tizen',
    Conectividad: 'Wi-Fi, Bluetooth, HDMI x3',
  },
})
add({
  name: 'Smart TV 43" Full HD',
  brand: 'LG',
  sub: 'smart-tv',
  price: 2190000,
  count: 10,
  specs: {
    'Tamaño de pantalla': '43"',
    Resolución: 'Full HD',
    'Sistema operativo': 'webOS',
    Conectividad: 'Wi-Fi, Bluetooth, HDMI x2',
  },
})
add({
  name: 'Smart TV 65" QLED 4K',
  brand: 'Samsung',
  sub: 'smart-tv',
  price: 6890000,
  old: 7490000,
  count: 18,
  specs: {
    'Tamaño de pantalla': '65"',
    Resolución: '4K UHD',
    'Sistema operativo': 'Tizen',
    Conectividad: 'Wi-Fi, Bluetooth, HDMI x4',
  },
})
add({
  name: 'Soundbar 2.1 con Subwoofer 200W',
  brand: 'LG',
  sub: 'audio-y-parlantes',
  price: 790000,
  count: 6,
  specs: { Potencia: '200 W', Canales: '2.1', Conectividad: 'Bluetooth, HDMI ARC' },
})
add({
  name: 'Parlante Bluetooth Portátil Resistente al Agua',
  brand: 'JBL',
  sub: 'audio-y-parlantes',
  price: 390000,
  count: 3,
  palette: 'audio',
  specs: { Autonomía: '12 horas', Resistencia: 'IPX7', Conectividad: 'Bluetooth 5.3' },
})
add({
  name: 'Auriculares Inalámbricos con Cancelación de Ruido',
  brand: 'Sony',
  sub: 'auriculares',
  price: 890000,
  old: 990000,
  count: 6,
  palette: 'audio',
  specs: { Autonomía: '30 horas', 'Cancelación de ruido': 'Activa', Conectividad: 'Bluetooth 5.2' },
})
add({
  name: 'Celular 128GB 6GB RAM Cámara 50MP',
  brand: 'Samsung',
  sub: 'celulares',
  price: 2490000,
  count: 12,
  palette: 'phone',
  specs: {
    Almacenamiento: '128 GB',
    'Memoria RAM': '6 GB',
    Pantalla: '6.6" AMOLED',
    'Cámara principal': '50 MP',
  },
})
add({
  name: 'Celular Gama Alta 256GB 12GB RAM 5G',
  brand: 'Apple',
  sub: 'celulares',
  price: 7490000,
  old: 7990000,
  count: 18,
  palette: 'phone',
  colors: 4,
  specs: {
    Almacenamiento: '256 GB',
    'Memoria RAM': '8 GB',
    Pantalla: '6.1" OLED',
    'Cámara principal': '48 MP',
  },
})
add({
  name: 'Celular 64GB 4GB RAM Batería 5000mAh',
  brand: 'Xiaomi',
  sub: 'celulares',
  price: 1290000,
  count: 6,
  palette: 'phone',
  specs: {
    Almacenamiento: '64 GB',
    'Memoria RAM': '4 GB',
    Pantalla: '6.5" IPS',
    'Cámara principal': '13 MP',
  },
})
add({
  name: 'Tablet 10" 64GB Wi-Fi',
  brand: 'Samsung',
  sub: 'tablets',
  price: 1490000,
  count: 6,
  palette: 'audio',
  colors: 2,
  specs: { Pantalla: '10.1"', Almacenamiento: '64 GB', Conectividad: 'Wi-Fi' },
})
add({
  name: 'Smartwatch Deportivo con GPS',
  brand: 'Xiaomi',
  sub: 'smartwatch',
  price: 690000,
  old: 790000,
  count: 6,
  palette: 'audio',
  specs: { Pantalla: '1.4" AMOLED', Autonomía: '14 días', Resistencia: '5 ATM' },
})
add({
  name: 'Joystick Inalámbrico para Consola',
  brand: 'Sony',
  sub: 'joysticks',
  price: 590000,
  count: 3,
  palette: 'audio',
  soldOut: true,
  specs: { Conectividad: 'Bluetooth', Autonomía: '12 horas', Compatibilidad: 'Consola y PC' },
})

// Electrodomésticos
add({
  name: 'Heladera No Frost 380L Inverter',
  brand: 'Whirlpool',
  sub: 'heladeras',
  price: 5990000,
  old: 6590000,
  count: 18,
  palette: 'appliance',
  featured: true,
  specs: {
    Capacidad: '380 L',
    'Tipo de enfriamiento': 'No Frost',
    Compresor: 'Inverter',
    Eficiencia: 'A+',
  },
})
add({
  name: 'Heladera 280L Frío Seco',
  brand: 'Electrolux',
  sub: 'heladeras',
  price: 3490000,
  count: 12,
  palette: 'appliance',
  specs: {
    Capacidad: '280 L',
    'Tipo de enfriamiento': 'Frío seco',
    Compresor: 'Convencional',
    Eficiencia: 'A',
  },
})
add({
  name: 'Lavarropas Automático 8kg',
  brand: 'LG',
  sub: 'lavarropas',
  price: 2890000,
  count: 10,
  palette: 'appliance',
  specs: { Capacidad: '8 kg', Carga: 'Frontal', Centrifugado: '1200 rpm' },
})
add({
  name: 'Lavarropas Automático 11kg Inverter',
  brand: 'Samsung',
  sub: 'lavarropas',
  price: 4190000,
  old: 4590000,
  count: 12,
  palette: 'appliance',
  specs: { Capacidad: '11 kg', Carga: 'Frontal', Centrifugado: '1400 rpm' },
})
add({
  name: 'Aire Acondicionado 12000 BTU Inverter Frío/Calor',
  brand: 'Midea',
  sub: 'aires-acondicionados',
  price: 3190000,
  count: 12,
  specs: { Capacidad: '12000 BTU', Tecnología: 'Inverter', Modo: 'Frío/Calor' },
})
add({
  name: 'Aire Acondicionado 18000 BTU Inverter Frío/Calor',
  brand: 'LG',
  sub: 'aires-acondicionados',
  price: 4490000,
  old: 4890000,
  count: 18,
  specs: { Capacidad: '18000 BTU', Tecnología: 'Inverter', Modo: 'Frío/Calor' },
})
add({
  name: 'Microondas 28L con Grill',
  brand: 'Panasonic',
  sub: 'microondas-y-freidoras',
  price: 790000,
  count: 6,
  palette: 'appliance',
  specs: { Capacidad: '28 L', Potencia: '900 W', Función: 'Grill' },
})
add({
  name: 'Freidora de Aire 5L Digital',
  brand: 'Philips',
  sub: 'microondas-y-freidoras',
  price: 690000,
  old: 790000,
  count: 6,
  palette: 'appliance',
  specs: { Capacidad: '5 L', Potencia: '1700 W', Control: 'Digital' },
})
add({
  name: 'Cocina 5 Hornallas con Horno a Gas',
  brand: 'Atma',
  sub: 'cocinas',
  price: 2390000,
  count: 10,
  palette: 'appliance',
  specs: { Hornallas: '5', Encendido: 'Eléctrico', Ancho: '76 cm' },
})
add({
  name: 'Licuadora de Vaso 1200W',
  brand: 'Oster',
  sub: 'licuadoras-y-batidoras',
  price: 590000,
  count: 3,
  palette: 'appliance',
  specs: { Potencia: '1200 W', Capacidad: '1.5 L', Velocidades: '5' },
})
add({
  name: 'Aspiradora Robot con Mapeo',
  brand: 'Xiaomi',
  sub: 'aspiradoras',
  price: 1890000,
  count: 6,
  palette: 'audio',
  specs: { Succión: '4000 Pa', Autonomía: '120 min', Control: 'App móvil' },
})
add({
  name: 'Ventilador de Pie 18" Silencioso',
  brand: 'Liliana',
  sub: 'ventiladores',
  price: 390000,
  count: 3,
  palette: 'desk',
  specs: { Tamaño: '18"', Velocidades: '3', Altura: 'Regulable' },
})

// Informática (periféricos y accesorios)
add({
  name: 'Mouse Inalámbrico Ergonómico',
  brand: 'Logitech',
  sub: 'teclados-y-mouses',
  price: 189000,
  count: 3,
  palette: 'desk',
  specs: { Conectividad: 'Inalámbrico 2.4 GHz', Sensor: '4000 DPI', Autonomía: '18 meses' },
})
add({
  name: 'Mochila Porta Notebook 15.6"',
  brand: 'Targus',
  sub: 'mochilas-y-fundas',
  price: 249000,
  count: 3,
  palette: 'bag',
  colors: 4,
  specs: {
    'Compatible con': 'Notebooks hasta 15.6"',
    Material: 'Poliéster resistente al agua',
    Compartimentos: '3',
  },
})
add({
  name: 'Monitor 24" Full HD IPS 75Hz',
  brand: 'LG',
  sub: 'monitores',
  price: 1190000,
  count: 6,
  specs: { Tamaño: '24"', Panel: 'IPS', Frecuencia: '75 Hz', Resolución: 'Full HD' },
})
add({
  name: 'Monitor Gamer Curvo 27" 165Hz',
  brand: 'Samsung',
  sub: 'monitores',
  price: 2390000,
  old: 2690000,
  count: 10,
  specs: { Tamaño: '27"', Panel: 'VA curvo', Frecuencia: '165 Hz', Resolución: 'Full HD' },
})
add({
  name: 'Teclado Mecánico RGB Switch Rojo',
  brand: 'Redragon',
  sub: 'teclados-y-mouses',
  price: 459000,
  count: 3,
  palette: 'gamer',
  colors: 2,
  specs: { Switch: 'Rojo lineal', Iluminación: 'RGB', Formato: 'TKL' },
})
add({
  name: 'Disco SSD 1TB NVMe M.2',
  brand: 'Kingston',
  sub: 'discos-y-ssd',
  price: 590000,
  count: 3,
  specs: { Capacidad: '1 TB', Interfaz: 'NVMe PCIe 4.0', Lectura: '3500 MB/s' },
})
add({
  name: 'Memoria RAM DDR4 16GB 3200MHz',
  brand: 'Corsair',
  sub: 'memorias-ram',
  price: 390000,
  count: 3,
  specs: { Capacidad: '16 GB', Tipo: 'DDR4', Velocidad: '3200 MHz' },
})
add({
  name: 'Impresora Multifunción Tanque de Tinta',
  brand: 'Epson',
  sub: 'impresoras',
  price: 1390000,
  count: 6,
  specs: {
    Funciones: 'Imprime, copia y escanea',
    Conectividad: 'Wi-Fi',
    Sistema: 'Tanque de tinta',
  },
})
add({
  name: 'Silla Gamer Ergonómica Reclinable',
  brand: 'Cougar',
  sub: 'sillas-gamer',
  price: 1490000,
  old: 1690000,
  count: 6,
  palette: 'gamer',
  specs: { Material: 'Cuero sintético', Reclinación: '180°', 'Peso máximo': '120 kg' },
})

// Otras categorías
add({
  name: 'Cámara Mirrorless 24MP + Lente 18-55mm',
  brand: 'Canon',
  sub: 'camaras-mirrorless',
  price: 6450000,
  count: 12,
  featured: true,
  palette: 'desk',
  colors: 2,
  specs: {
    Sensor: '24 MP APS-C',
    Video: '4K',
    Lente: '18-55 mm',
    Conectividad: 'Wi-Fi, Bluetooth',
  },
})
add({
  name: 'Trípode Profesional de Aluminio 160cm',
  brand: 'Manfrotto',
  sub: 'tripodes',
  price: 290000,
  count: 3,
  specs: { Altura: '160 cm', Material: 'Aluminio', 'Carga máxima': '4 kg' },
})
add({
  name: 'Set de Perfumería Femenina Edición Limitada',
  brand: 'Carolina Herrera',
  sub: 'perfumes-femeninos',
  price: 890000,
  old: 1050000,
  count: 6,
  featured: true,
  specs: {
    Contenido: 'Perfume 80 ml + body lotion',
    Familia: 'Floral',
    Presentación: 'Estuche regalo',
  },
})
add({
  name: 'Perfume Masculino Eau de Toilette 100ml',
  brand: 'Paco Rabanne',
  sub: 'perfumes-masculinos',
  price: 450000,
  count: 3,
  specs: { Contenido: '100 ml', Familia: 'Amaderado', Concentración: 'Eau de Toilette' },
})
add({
  name: 'Cortadora de Césped a Gasolina 4T',
  brand: 'Husqvarna',
  sub: 'cortadoras-de-cesped',
  price: 2190000,
  count: 10,
  featured: true,
  specs: { Motor: '4 tiempos 140cc', 'Ancho de corte': '46 cm', Bolsa: 'Colectora incluida' },
})
add({
  name: 'Juego de Sábanas Queen 4 Piezas',
  brand: 'Hogar Plus',
  sub: 'ropa-de-cama',
  price: 290000,
  count: 3,
  palette: 'furniture',
  specs: { Medida: 'Queen', Material: 'Algodón 200 hilos', Piezas: '4' },
})
add({
  name: 'Taladro Percutor Inalámbrico 20V + Maletín',
  brand: 'Bosch',
  sub: 'taladros-y-atornilladores',
  price: 780000,
  old: 920000,
  count: 6,
  featured: true,
  specs: { Voltaje: '20 V', Mandril: '13 mm', Incluye: '2 baterías, cargador y maletín' },
})
add({
  name: 'Juego de Herramientas Manuales 120 Piezas',
  brand: 'Stanley',
  sub: 'herramientas-manuales',
  price: 540000,
  count: 6,
  specs: { Piezas: '120', Material: 'Acero cromo vanadio', Incluye: 'Maletín' },
})
add({
  name: 'Casco Integral para Moto con Visor',
  brand: 'LS2',
  sub: 'cascos-y-protecciones',
  price: 590000,
  count: 6,
  palette: 'fashion',
  colors: 3,
  specs: { Tipo: 'Integral', Certificación: 'ECE 22.06', Visor: 'Anti-rayaduras' },
})
add({
  name: 'Compresor de Aire Portátil 12V',
  brand: 'Michelin',
  sub: 'accesorios-para-autos',
  price: 320000,
  count: 3,
  specs: { Alimentación: '12 V', 'Presión máxima': '120 PSI', Pantalla: 'Digital' },
})
add({
  name: 'Zapatillas Running Livianas',
  brand: 'Adidas',
  sub: 'zapatillas',
  price: 490000,
  count: 3,
  palette: 'fashion',
  colors: 3,
  specs: { Uso: 'Running', Suela: 'Amortiguada', Peso: '260 g' },
})
add({
  name: 'Campera Impermeable Cortaviento',
  brand: 'Columbia',
  sub: 'camperas',
  price: 390000,
  old: 450000,
  count: 3,
  palette: 'fashion',
  colors: 3,
  specs: { Material: 'Poliéster impermeable', Capucha: 'Ajustable', Uso: 'Outdoor' },
})
add({
  name: 'Sillón Reclinable de Living Tapizado',
  brand: 'Confort',
  sub: 'sillones',
  price: 2890000,
  count: 12,
  featured: true,
  palette: 'furniture',
  specs: { Material: 'Tela tapizada', Reclinación: 'Manual', Capacidad: '1 persona' },
})
add({
  name: 'Escritorio de Oficina 120cm con Cajonera',
  brand: 'Confort',
  sub: 'escritorios',
  price: 790000,
  count: 6,
  palette: 'furniture',
  specs: { Medidas: '120 x 60 cm', Material: 'MDF melamínico', Cajones: '2' },
})
add({
  name: 'Rack para TV hasta 65" con Puertas',
  brand: 'Confort',
  sub: 'racks-y-mesas-tv',
  price: 1190000,
  count: 6,
  draft: true,
  palette: 'furniture',
  specs: { Medidas: '160 x 40 cm', Material: 'MDF', 'Carga máxima': '60 kg' },
})

// ---------- categoría de cada subcategoría ----------
const SUB_TO_CAT: Record<string, string> = {}
const categories = JSON.parse(readFileSync('src/data/categories.json', 'utf8')) as {
  slug: string
  groups: { items: { slug: string }[] }[]
}[]
for (const cat of categories)
  for (const g of cat.groups) for (const s of g.items) SUB_TO_CAT[s.slug] = cat.slug

const BLURB: Record<string, string> = {
  informatica: 'Pensado para trabajar, estudiar y divertirte con un rendimiento confiable.',
  electronica: 'Tecnología de última generación para tu entretenimiento diario.',
  electrodomesticos: 'Eficiencia y confort para tu hogar, con la garantía de siempre.',
  'fotografia-y-filmacion': 'Capturá cada momento con calidad profesional.',
  'perfumeria-y-belleza': 'Una fragancia que deja huella, ideal para regalar.',
  'hogar-y-jardin': 'Todo lo que necesitás para disfrutar tu casa y tu jardín.',
  'ferreteria-y-construccion': 'Herramientas resistentes para cada trabajo.',
  'automotriz-y-motos': 'Seguridad y practicidad en cada viaje.',
  moda: 'Comodidad y estilo para todos los días.',
  muebles: 'Diseño y confort para cada ambiente.',
}

// ---------- construcción ----------
const products: Product[] = defs.map((d, i) => {
  const categoryId = SUB_TO_CAT[d.sub]
  if (!categoryId) throw new Error(`Subcategoría desconocida: ${d.sub}`)
  const pal = d.palette ? PALETTES[d.palette] : undefined
  const nColors = pal ? Math.min(d.colors ?? int(1, Math.min(3, pal.length)), pal.length) : 0
  const start = pal ? int(0, pal.length - 1) : 0
  const chosen = pal ? Array.from({ length: nColors }, (_, k) => pal[(start + k) % pal.length]) : []
  const colors: ColorVariant[] = chosen.map(([name, hex], k) => ({
    name,
    hex,
    sku: undefined,
    stock: d.soldOut
      ? 0
      : k === chosen.length - 1 && chosen.length > 2 && rand() < 0.5
        ? 0
        : int(2, 25),
    ...(k === chosen.length - 1 && chosen.length > 1 && rand() < 0.25
      ? { priceDelta: 100000 }
      : {}),
  }))
  const sku = `TD-${4021 + i}`
  colors.forEach(
    (col, k) => (col.sku = `${sku}-${slugify(chosen[k][0]).toUpperCase().slice(0, 3)}`),
  )
  const stock = colors.length ? colors.reduce((s, x) => s + x.stock, 0) : d.soldOut ? 0 : int(3, 40)
  const created = new Date(BASE_DATE - int(0, 240) * 86_400_000).toISOString().slice(0, 10)
  const isNew = BASE_DATE - Date.parse(created) < 30 * 86_400_000
  const tags: ProductTag[] = []
  if (d.featured) tags.push('destacado')
  if (d.old) tags.push('oferta')
  if (isNew) tags.push('nuevo')
  if (d.price >= FREE_SHIPPING_FROM) tags.push('envio-gratis')
  const specEntries = Object.entries(d.specs)
  const highlights = specEntries.slice(0, 4).map(([k, v]) => `${k}: ${v}`)
  const rating = d.rating ?? [Math.round((3.8 + rand() * 1.1) * 10) / 10, int(5, 400)]
  return {
    id: `p${String(i + 1).padStart(3, '0')}`,
    sku,
    slug: slugify(d.name),
    name: d.name,
    brand: d.brand,
    categoryId,
    subcategoryId: d.sub,
    price: d.price,
    ...(d.old ? { oldPrice: d.old } : {}),
    installments: { count: d.count ?? 1, interestFree: true },
    stock,
    shortDescription: `${d.brand} · ${specEntries
      .slice(0, 3)
      .map(([, v]) => v)
      .join(' · ')}`.slice(0, 160),
    description: `${d.name} de ${d.brand}. ${BLURB[categoryId]}\n\nCaracterísticas principales: ${highlights.join('; ')}.\n\nIncluye garantía oficial y envío a todo el país. Consultá disponibilidad de colores y financiación con tu banco o cooperativa.`,
    images: [],
    colors,
    specs: d.specs,
    highlights,
    tags,
    rating: rating[0],
    reviewCount: rating[1],
    warranty: d.warranty ?? '12 meses',
    createdAt: created,
    status: d.draft ? 'borrador' : 'activo',
  }
})

const slugs = new Set(products.map((p) => p.slug))
if (slugs.size !== products.length) throw new Error('Slugs duplicados')

writeFileSync('src/data/products.json', JSON.stringify(products, null, 2) + '\n')
console.log(
  `products.json: ${products.length} productos, ${products.filter((p) => p.colors.length > 1).length} con 2+ colores`,
)
