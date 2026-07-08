export interface ProductColor {
  name: string;
  hex: string;
  priceDelta: number;
}

export interface Product {
  // Base fields for UI
  id: string;
  name: string;
  price: number;
  image: string;
  isPaint: boolean;
  colors: ProductColor[];
  category: string;

  // Exhaustive WEG 63 Fields
  id_produto_interno_cv: string; // 1
  codigo_produto_weg: string; // 2
  sku_cv: string; // 3
  site_cv: string; // 4
  nome_comercial_canal_visual: string; // 5
  nome_produto_weg: string; // 6
  resumo_produto_weg: string; // 7
  descricao_produto_canal_visual: string; // 8
  superficie_aplicacao: string; // 9
  preparacao_superficie: string; // 10
  recomendacoes_uso: string; // 11
  descricao_tinta: string; // 12
  linha_weg: string; // 13
  linha_weg_descricao: string; // 14
  codigo_cv_linha_produtos: string; // 15
  caracteristica_especiais_sigla: string; // 16
  caracteristica_especiais: string; // 17
  funcao_tinta_sigla: string; // 18
  funcao_tinta: string; // 19
  sistema_de_resina_num: string; // 20
  sistema_resina: string; // 21
  // (Fields 22-39 were not explicitly listed in the prompt, but implied as continuation)
  // ... and the rest listed
  peso: string; // 40
  altura: string; // 41
  largura: string; // 42
  comprimento: string; // 43
  cubagem: string; // 44
  solidos_volume: string; // 45
  componente_tinta: string; // 46
  diluente_etq: string; // 47
  diluicao_maxima_volume: string; // 48
  componente_b: string; // 49
  componente_c: string; // 50
  catalizacao_por_volume_a: string; // 51
  catalizacao_por_volume_b: string; // 52
  catalizacao_por_volume_c: string; // 53
  vida_util_mistura_25: string; // 54
  produto_equivalente_fab_tint: string; // 55
  espessura_por_demao_minima_seca: string; // 56
  espessura_por_demao_maxima_seca: string; // 57
  acabamento_pintura: string; // 58
  escala_brilho_minima: string; // 59
  escala_brilho_maxima: string; // 60
  secagem_toque_25: string; // 61
  secagem_ao_manuseio_25: string; // 62
  secagem_final_25: string; // 63

  // SEO
  seo_title: string;
  seo_description: string;

  relatedIds: string[];
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  order: number;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  order: number;
  content: string;
  seo_title: string;
  seo_description: string;
  schemeId?: string | null;
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
  password?: string; // Hashed in real DB
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

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  date: string;
  items: any[];
  total: number;
  status: string;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}
