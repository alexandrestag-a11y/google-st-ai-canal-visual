export interface ProductColor {
  name: string;
  hex: string;
  priceDelta: number;
}

export interface ProductFilters {
  secagem?: string;
  brilho?: string;
  embalagem?: string;
  espessura?: string;
  rendimento?: string;
}

export interface ProductSeo {
  title?: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  summary: string;
  description: string;
  category: string;
  price: number;
  image: string;
  isPaint: boolean;
  colors: ProductColor[];
  filters: ProductFilters;
  seo: ProductSeo;
  relatedIds: string[];
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  order: number;
}

export interface PageSeo {
  title?: string;
  description?: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  order: number;
  content: string;
  seo: PageSeo;
}

export interface PaintSchemeStep {
  productId: string;
  productType: 'primer' | 'intermediario' | 'acabamento';
  coats: number;
  interval: string;
  notes?: string;
}

export interface PaintScheme {
  id: string;
  name: string;
  surface: string;
  description: string;
  steps: PaintSchemeStep[];
}

export interface MediaFolder {
  id: string;
  name: string;
  parentId: string | null;
}

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'video';
  size: string;
  folderId: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'client';
  avatar?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  colorName?: string;
  colorHex?: string;
  quantity: number;
  image: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  color?: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentMethod: string;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}
