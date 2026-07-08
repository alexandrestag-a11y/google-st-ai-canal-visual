import React, { useState } from "react";
import {
  FolderCode,
  FileSpreadsheet,
  Package,
  Layers,
  FileText,
  Hammer,
  ShoppingBag,
  Plus,
  Trash2,
  Edit,
  Save,
  Download,
  Upload,
  ArrowRight,
  Eye,
  Settings,
  Grid,
  FileBadge,
  Sparkles,
  Link2,
} from "lucide-react";
import { Product, Category, Page, PaintScheme, MediaFolder, MediaFile, Order, ProductColor, PaintSchemeStep } from "../types";
import SitemapTree from "./SitemapTree";
import { motion } from "motion/react";

interface AdminPanelProps {
  products: Product[];
  categories: Category[];
  pages: Page[];
  paintSchemes: PaintScheme[];
  mediaFolders: MediaFolder[];
  mediaFiles: MediaFile[];
  orders: Order[];
  onRefreshAll: () => void;
}

type TabType = "products" | "categories" | "pages" | "schemes" | "media" | "csv" | "orders";

export default function AdminPanel({
  products,
  categories,
  pages,
  paintSchemes,
  mediaFolders,
  mediaFiles,
  orders,
  onRefreshAll,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("products");

  // --- Product Editing States ---
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState<Partial<Product>>({});
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#cccccc");
  const [newColorDelta, setNewColorDelta] = useState(0);

  // --- CMS Page Editing States ---
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [pageForm, setPageForm] = useState<Partial<Page>>({});

  // --- Category Editing States ---
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState<Partial<Category>>({});

  // --- Paint Scheme Editing States ---
  const [editingScheme, setEditingScheme] = useState<PaintScheme | null>(null);
  const [schemeForm, setSchemeForm] = useState<Partial<PaintScheme>>({});
  const [schemeSteps, setSchemeSteps] = useState<PaintSchemeStep[]>([]);
  const [newStepProduct, setNewStepProduct] = useState("");
  const [newStepType, setNewStepType] = useState<"primer" | "intermediario" | "acabamento">("primer");
  const [newStepCoats, setNewStepCoats] = useState(1);
  const [newStepInterval, setNewStepInterval] = useState("Entre 8h e 24h");
  const [newStepNotes, setNewStepNotes] = useState("");

  // --- Media Library Explorer States ---
  const [activeFolderId, setActiveFolderId] = useState<string | null>("raizes");
  const [newFolderName, setNewFolderName] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileUrl, setNewFileUrl] = useState("");
  const [newFileType, setNewFileType] = useState<"image" | "pdf" | "video">("image");
  const [newFileSize, setNewFileSize] = useState("150 KB");

  // --- CSV Import State ---
  const [csvText, setCsvText] = useState("");
  const [importStatus, setImportStatus] = useState("");

  // --- API Sync Helpers ---
  const handleApiRequest = async (url: string, method: string, body?: any) => {
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (response.ok) {
        onRefreshAll();
        return await response.json();
      } else {
        const err = await response.json();
        alert(`Erro: ${err.error || "Ação falhou"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar ao servidor.");
    }
    return null;
  };

  // --- CRUD: Products ---
  const handleSelectProduct = (p: Product) => {
    setEditingProduct(p);
    setProdForm(p);
  };

  const handleCreateNewProduct = () => {
    const fresh: Product = {
      id: "prod-" + Date.now(),
      name: "Novo Produto WEG",
      price: 0,
      image: "",
      isPaint: true,
      colors: [],
      category: "industrial",
      id_produto_interno_cv: "",
      codigo_produto_weg: "",
      sku_cv: "",
      site_cv: "",
      nome_comercial_canal_visual: "",
      nome_produto_weg: "",
      resumo_produto_weg: "",
      descricao_produto_canal_visual: "",
      superficie_aplicacao: "",
      preparacao_superficie: "",
      recomendacoes_uso: "",
      descricao_tinta: "",
      linha_weg: "",
      linha_weg_descricao: "",
      codigo_cv_linha_produtos: "",
      caracteristica_especiais_sigla: "",
      caracteristica_especiais: "",
      funcao_tinta_sigla: "",
      funcao_tinta: "",
      sistema_de_resina_num: "",
      sistema_resina: "",
      peso: "",
      altura: "",
      largura: "",
      comprimento: "",
      cubagem: "",
      solidos_volume: "",
      componente_tinta: "",
      diluente_etq: "",
      diluicao_maxima_volume: "",
      componente_b: "",
      componente_c: "",
      catalizacao_por_volume_a: "",
      catalizacao_por_volume_b: "",
      catalizacao_por_volume_c: "",
      vida_util_mistura_25: "",
      produto_equivalente_fab_tint: "",
      espessura_por_demao_minima_seca: "",
      espessura_por_demao_maxima_seca: "",
      acabamento_pintura: "",
      escala_brilho_minima: "",
      escala_brilho_maxima: "",
      secagem_toque_25: "",
      secagem_ao_manuseio_25: "",
      secagem_final_25: "",
      seo_title: "",
      seo_description: "",
      relatedIds: [],
    };
    setEditingProduct(fresh);
    setProdForm(fresh);
  };

  const handleSaveProduct = async () => {
    if (!prodForm.name || !prodForm.id) return;
    const url = `/api/products${editingProduct && products.some((p) => p.id === editingProduct.id) ? "/" + prodForm.id : ""}`;
    const method = editingProduct && products.some((p) => p.id === editingProduct.id) ? "PUT" : "POST";
    const saved = await handleApiRequest(url, method, prodForm);
    if (saved) {
      setEditingProduct(null);
      setProdForm({});
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto WEG?")) {
      await handleApiRequest(`/api/products/${id}`, "DELETE");
    }
  };

  const handleAddColorToProduct = () => {
    if (!newColorName.trim()) return;
    const newColor: ProductColor = { name: newColorName, hex: newColorHex, priceDelta: newColorDelta };
    const updatedColors = [...(prodForm.colors || []), newColor];
    setProdForm({ ...prodForm, colors: updatedColors });
    setNewColorName("");
    setNewColorDelta(0);
  };

  const handleRemoveColorFromProduct = (idx: number) => {
    const updatedColors = (prodForm.colors || []).filter((_, i) => i !== idx);
    setProdForm({ ...prodForm, colors: updatedColors });
  };

  // --- Tree Event Handlers (CMS Pages, Categories, Media Folders) ---
  const handleAddTreeNode = (parentId: string | null, type: TabType) => {
    if (type === "pages") {
      const title = prompt("Digite o título da nova página:");
      if (!title) return;
      const slug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      const order = pages.filter((p) => p.parentId === parentId).length + 1;

      const newPage: Partial<Page> = {
        title,
        slug: parentId ? `${pages.find((p) => p.id === parentId)?.slug}/${slug}` : slug,
        parentId,
        order,
        content: `Conteúdo inicial da página ${title}`,
        seo_title: `${title} WEG - Canal Visual`,
        seo_description: `Encontre soluções WEG sobre ${title} na Canal Visual.`,
      };
      handleApiRequest("/api/pages", "POST", newPage);
    } else if (type === "categories") {
      const name = prompt("Digite o nome da nova categoria:");
      if (!name) return;
      const order = categories.filter((c) => c.parentId === parentId).length + 1;
      const newCat: Partial<Category> = { name, parentId, order };
      handleApiRequest("/api/categories", "POST", newCat);
    } else if (type === "media") {
      const name = prompt("Digite o nome da nova pasta de mídia:");
      if (!name) return;
      const newFolder = { name, parentId };
      handleApiRequest("/api/media/folders", "POST", newFolder);
    }
  };

  const handleEditTreeNode = (id: string, type: TabType) => {
    if (type === "pages") {
      const page = pages.find((p) => p.id === id);
      if (page) {
        setEditingPage(page);
        setPageForm(page);
      }
    } else if (type === "categories") {
      const cat = categories.find((c) => c.id === id);
      if (cat) {
        setEditingCategory(cat);
        setCatForm(cat);
      }
    }
  };

  const handleDeleteTreeNode = async (id: string, type: TabType) => {
    if (confirm(`Tem certeza que deseja excluir este item da árvore? Sub-itens serão realocados.`)) {
      if (type === "pages") {
        await handleApiRequest(`/api/pages/${id}`, "DELETE");
      } else if (type === "categories") {
        await handleApiRequest(`/api/categories/${id}`, "DELETE");
      } else if (type === "media") {
        await handleApiRequest(`/api/media/folders/${id}`, "DELETE");
      }
    }
  };

  const handleMoveTreeNode = async (id: string, direction: "up" | "down", type: TabType) => {
    const list = type === "pages" ? pages : categories;
    const item = list.find((x) => x.id === id);
    if (!item) return;

    const siblings = list.filter((x) => x.parentId === item.parentId).sort((a, b) => a.order - b.order);
    const idx = siblings.findIndex((x) => x.id === id);
    if (direction === "up" && idx > 0) {
      const prev = siblings[idx - 1];
      await handleApiRequest(`/api/${type}/${id}`, "PUT", { order: prev.order });
      await handleApiRequest(`/api/${type}/${prev.id}`, "PUT", { order: item.order });
    } else if (direction === "down" && idx < siblings.length - 1) {
      const next = siblings[idx + 1];
      await handleApiRequest(`/api/${type}/${id}`, "PUT", { order: next.order });
      await handleApiRequest(`/api/${type}/${next.id}`, "PUT", { order: item.order });
    }
  };

  const handleReparentTreeNode = async (id: string, newParentId: string | null, type: TabType) => {
    if (type === "pages") {
      const page = pages.find((p) => p.id === id);
      if (page) {
        let newSlug = page.slug.split("/").pop() || page.slug;
        if (newParentId) {
          const parentPage = pages.find((p) => p.id === newParentId);
          if (parentPage) {
            newSlug = `${parentPage.slug}/${newSlug}`;
          }
        }
        await handleApiRequest(`/api/pages/${id}`, "PUT", { parentId: newParentId, slug: newSlug });
      }
    } else {
      await handleApiRequest(`/api/${type}/${id}`, "PUT", { parentId: newParentId });
    }
  };

  // --- CMS Save Page details ---
  const handleSavePageDetails = async () => {
    if (!pageForm.id) return;
    const saved = await handleApiRequest(`/api/pages/${pageForm.id}`, "PUT", pageForm);
    if (saved) {
      setEditingPage(null);
      setPageForm({});
    }
  };

  // --- CRUD: Paint Schemes ---
  const handleSelectScheme = (s: PaintScheme) => {
    setEditingScheme(s);
    setSchemeForm(s);
    setSchemeSteps(s.steps || []);
  };

  const handleCreateNewScheme = () => {
    const fresh: PaintScheme = {
      id: "scheme-" + Date.now(),
      name: "Novo Esquema de Pintura WEG",
      surface: "Concreto",
      description: "Escreva os objetivos e indicações deste esquema de pintura",
      steps: [],
    };
    setEditingScheme(fresh);
    setSchemeForm(fresh);
    setSchemeSteps([]);
  };

  const handleAddStepToScheme = () => {
    if (!newStepProduct) return;
    const newStep: PaintSchemeStep = {
      productId: newStepProduct,
      productType: newStepType,
      coats: newStepCoats,
      interval: newStepInterval,
      notes: newStepNotes,
    };
    setSchemeSteps([...schemeSteps, newStep]);
    setNewStepNotes("");
  };

  const handleRemoveStepFromScheme = (idx: number) => {
    setSchemeSteps(schemeSteps.filter((_, i) => i !== idx));
  };

  const handleSaveScheme = async () => {
    if (!schemeForm.name || !schemeForm.id) return;
    const body = { ...schemeForm, steps: schemeSteps };
    const url = `/api/paint-schemes${paintSchemes.some((s) => s.id === schemeForm.id) ? "/" + schemeForm.id : ""}`;
    const method = paintSchemes.some((s) => s.id === schemeForm.id) ? "PUT" : "POST";
    const saved = await handleApiRequest(url, method, body);
    if (saved) {
      setEditingScheme(null);
      setSchemeForm({});
      setSchemeSteps([]);
    }
  };

  const handleDeleteScheme = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este esquema de pintura?")) {
      await handleApiRequest(`/api/paint-schemes/${id}`, "DELETE");
    }
  };

  // --- Media File Actions ---
  const handleAddMediaFile = async () => {
    if (!newFileName.trim() || !newFileUrl.trim()) return;
    const newFile = {
      name: newFileName,
      url: newFileUrl,
      type: newFileType,
      size: newFileSize,
      folderId: activeFolderId,
    };
    await handleApiRequest("/api/media/files", "POST", newFile);
    setNewFileName("");
    setNewFileUrl("");
  };

  const handleDeleteMediaFile = async (id: string) => {
    if (confirm("Deseja excluir este arquivo da biblioteca de mídia?")) {
      await handleApiRequest(`/api/media/files/${id}`, "DELETE");
    }
  };

  // --- Bulk CSV spreadsheet Operations ---
  const handleImportCSV = async () => {
    if (!csvText.trim()) return;
    setImportStatus("Processando importação...");
    try {
      const response = await fetch("/api/products-csv/import", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: csvText,
      });
      if (response.ok) {
        const res = await response.json();
        setImportStatus(`Sucesso! ${res.count} produtos importados ou atualizados.`);
        onRefreshAll();
        setCsvText("");
      } else {
        const err = await response.json();
        setImportStatus(`Erro: ${err.error || "Ação falhou"}`);
      }
    } catch (e) {
      console.error(e);
      setImportStatus("Erro ao conectar ao servidor para importar.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans space-y-6">
      {/* Header Banner */}
      <div className="bg-blue-900 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="bg-blue-500 text-white font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
              Painel Diretor
            </span>
            <span className="text-blue-300 text-xs">Jules Back-Office</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Painel de Administração - Canal Visual</h2>
          <p className="text-xs text-blue-200/90 font-normal">
            Gerenciamento em Árvore (z-Tree Style) do catálogo de tintas WEG, esquemas protetivos, páginas do CMS e sitemap síncronos.
          </p>
        </div>

        {/* Dynamic CSV download and refresh triggers */}
        <div className="flex items-center gap-2">
          <a
            href="/api/products-csv/export"
            download="catalogo_weg.csv"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5"
          >
            <Download className="h-4 w-4" /> Exportar CSV
          </a>
          <button
            onClick={onRefreshAll}
            className="bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center gap-1.5"
          >
            Atualizar Servidor
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b border-gray-100 overflow-x-auto pb-1 text-sm font-semibold shrink-0">
        {[
          { id: "products", label: "Catálogo WEG", icon: Package },
          { id: "categories", label: "Categorias", icon: Layers },
          { id: "pages", label: "Páginas (Sitemap Tree)", icon: FileText },
          { id: "schemes", label: "Esquemas de Pintura", icon: Hammer },
          { id: "media", label: "Biblioteca (z-Tree)", icon: Grid },
          { id: "csv", label: "Planilha / Importar", icon: FileSpreadsheet },
          { id: "orders", label: "Pedidos / Vendas", icon: ShoppingBag },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all shrink-0 ${activeTab === tab.id ? "border-[#005792] text-[#005792]" : "border-transparent text-gray-500 hover:text-gray-800"}`}
            >
              <Icon className="h-4.5 w-4.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Body */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6">
        {/* TAB 1: Products */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {!editingProduct ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Catálogo de Produtos</h3>
                    <p className="text-xs text-gray-500">Adicione e edite tintas, catalisadores e acessórios</p>
                  </div>
                  <button
                    onClick={handleCreateNewProduct}
                    className="bg-[#005792] hover:bg-[#004370] text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
                  >
                    <Plus className="h-4 w-4" /> Novo Produto
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 border border-gray-100 rounded-2xl flex items-start justify-between gap-4 hover:border-blue-100 transition-colors bg-gray-50/30"
                    >
                      <div className="flex gap-3 min-w-0">
                        <img src={p.image} alt={p.name} className="h-14 w-14 rounded-xl object-cover bg-gray-100 border shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[9px] uppercase font-bold text-blue-800 tracking-wider">
                            {p.category}
                          </span>
                          <h4 className="font-bold text-sm text-gray-800 truncate leading-snug">{p.name}</h4>
                          <span className="text-xs text-gray-500 font-medium block">R$ {p.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => handleSelectProduct(p)}
                          className="p-2 text-[#005792] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Product Editor Form - Full WEG 63 Fields */
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {products.some((p) => p.id === editingProduct.id) ? "Editar" : "Criar Novo"} Produto WEG
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">ID: {prodForm.id}</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setProdForm({});
                    }}
                    className="text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Informação Comercial de Vendas */}
                  <div className="space-y-4 md:col-span-2 lg:col-span-3">
                     <h4 className="text-sm font-black text-blue-900 border-l-4 border-blue-900 pl-2">Informação Comercial (Loja)</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-semibold text-gray-700">
                        <div className="space-y-1">
                          <label className="text-gray-500 uppercase">Nome de Exibição (Site)</label>
                          <input
                            type="text"
                            value={prodForm.name || ""}
                            onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:border-blue-900 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-500 uppercase">Preço Base R$</label>
                          <input
                            type="number"
                            step="0.01"
                            value={prodForm.price || 0}
                            onChange={(e) => setProdForm({ ...prodForm, price: parseFloat(e.target.value) })}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-500 uppercase">Categoria</label>
                          <select
                            value={prodForm.category || "industrial"}
                            onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white outline-none"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                           <label className="text-gray-500 uppercase">Imagem Principal URL</label>
                           <input
                            type="text"
                            value={prodForm.image || ""}
                            onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none"
                          />
                        </div>
                     </div>
                  </div>

                  {/* Ficha Técnica WEG (63 Campos) */}
                  <div className="space-y-4 md:col-span-2 lg:col-span-3 pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-black text-blue-900 border-l-4 border-blue-900 pl-2 uppercase tracking-tight">Ficha Técnica WEG (63 Campos)</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[10px] font-bold text-gray-600 uppercase">
                      {/* Mapping only relevant representative subset of the 63 fields for UI efficiency */}
                      {[
                        { label: "ID Interno CV", key: "id_produto_interno_cv" },
                        { label: "Código WEG", key: "codigo_produto_weg" },
                        { label: "SKU CV", key: "sku_cv" },
                        { label: "Site CV", key: "site_cv" },
                        { label: "Nome Comercial CV", key: "nome_comercial_canal_visual" },
                        { label: "Nome Produto WEG", key: "nome_produto_weg" },
                        { label: "Resumo WEG", key: "resumo_produto_weg" },
                        { label: "Descrição CV", key: "descricao_produto_canal_visual" },
                        { label: "Superfície Aplicação", key: "superficie_aplicacao" },
                        { label: "Preparação Superfície", key: "preparacao_superficie" },
                        { label: "Recomendações Uso", key: "recomendacoes_uso" },
                        { label: "Linha WEG", key: "linha_weg" },
                        { label: "Função Tinta", key: "funcao_tinta" },
                        { label: "Sistema Resina", key: "sistema_resina" },
                        { label: "Sólidos por Volume", key: "solidos_volume" },
                        { label: "Componente B", key: "componente_b" },
                        { label: "Vida Útil Mistura (25°C)", key: "vida_util_mistura_25" },
                        { label: "Acabamento Pintura", key: "acabamento_pintura" },
                        { label: "Secagem ao Toque (25°C)", key: "secagem_toque_25" },
                        { label: "Secagem Manuseio (25°C)", key: "secagem_ao_manuseio_25" },
                        { label: "Secagem Final (25°C)", key: "secagem_final_25" },
                        { label: "Peso", key: "peso" },
                        { label: "Cubagem", key: "cubagem" },
                        { label: "Espessura Mín Seca", key: "espessura_por_demao_minima_seca" },
                        { label: "Espessura Máx Seca", key: "espessura_por_demao_maxima_seca" },
                        { label: "Diluição Máxima", key: "diluicao_maxima_volume" },
                      ].map((field) => (
                        <div key={field.key} className="space-y-1">
                          <label className="text-gray-400">{field.label}</label>
                          <input
                            type="text"
                            value={(prodForm as any)[field.key] || ""}
                            onChange={(e) => setProdForm({ ...prodForm, [field.key]: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 focus:border-blue-400 outline-none bg-gray-50/50"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Colors and SEO Section */}
                  <div className="space-y-4 md:col-span-1 lg:col-span-1.5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest">Variantes de Cor</h4>
                    <div className="flex flex-wrap gap-2 items-end">
                      <input
                        type="text"
                        placeholder="Nome Cor"
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                        className="text-[10px] border border-gray-200 rounded px-2 py-1 outline-none w-24"
                      />
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="h-6 w-6 rounded cursor-pointer"
                      />
                      <input
                        type="number"
                        placeholder="+R$"
                        value={newColorDelta}
                        onChange={(e) => setNewColorDelta(parseFloat(e.target.value) || 0)}
                        className="text-[10px] border border-gray-200 rounded px-2 py-1 outline-none w-16"
                      />
                      <button onClick={handleAddColorToProduct} className="bg-blue-900 text-white p-1 rounded hover:bg-blue-800"><Plus size={14} /></button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                       {(prodForm.colors || []).map((c, i) => (
                         <div key={i} className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-full text-[10px] font-bold">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.hex }}></span>
                            <span>{c.name} (+R$ {c.priceDelta})</span>
                            <button onClick={() => handleRemoveColorFromProduct(i)} className="text-red-500 ml-1">×</button>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-4 md:col-span-1 lg:col-span-1.5 p-4 bg-blue-50/20 rounded-2xl border border-blue-100/30">
                    <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest">SEO Avançado</h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Meta Title (Canal Visual)</label>
                        <input
                          type="text"
                          value={prodForm.seo_title || ""}
                          onChange={(e) => setProdForm({ ...prodForm, seo_title: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Meta Description</label>
                        <textarea
                          rows={2}
                          value={prodForm.seo_description || ""}
                          onChange={(e) => setProdForm({ ...prodForm, seo_description: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                <div className="pt-6 border-t border-gray-100 flex items-center gap-4">
                  <button
                    onClick={handleSaveProduct}
                    className="bg-blue-900 hover:bg-blue-800 text-white text-xs font-black py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95"
                  >
                    <Save className="h-4 w-4" /> Salvar Alterações na Ficha Técnica
                  </button>
                  <button
                    onClick={() => { setEditingProduct(null); setProdForm({}); }}
                    className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                  >
                    Descartar Mudanças
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Categories */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Hierarquia de Categorias</h3>
              <p className="text-xs text-gray-500">Mapeie as categorias de produtos em formato de sitemap realocável.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tree view columns */}
              <div className="md:col-span-2">
                <SitemapTree
                  nodes={categories.map((c) => ({ id: c.id, name: c.name, parentId: c.parentId, order: c.order }))}
                  onAdd={(parentId) => handleAddTreeNode(parentId, "categories")}
                  onEdit={(id) => handleEditTreeNode(id, "categories")}
                  onDelete={(id) => handleDeleteTreeNode(id, "categories")}
                  onMoveUp={(id) => handleMoveTreeNode(id, "up", "categories")}
                  onMoveDown={(id) => handleMoveTreeNode(id, "down", "categories")}
                  onReparent={(id, newParentId) => handleReparentTreeNode(id, newParentId, "categories")}
                  nodeTypeLabel="Categoria"
                />
              </div>

              {/* Edit side panel */}
              <div>
                {editingCategory ? (
                  <div className="p-4 border border-gray-100 rounded-2xl space-y-4 bg-gray-50/50 animate-fadeIn text-sm font-semibold text-gray-700">
                    <h4 className="font-bold text-gray-800">Editar Categoria</h4>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">Nome Comercial</label>
                      <input
                        id="form-cat-name"
                        type="text"
                        value={catForm.name || ""}
                        onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                        className="w-full text-xs font-bold border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#005792] bg-white"
                      />
                    </div>
                    <button
                      onClick={async () => {
                        if (catForm.id) {
                          await handleApiRequest(`/api/categories/${catForm.id}`, "PUT", catForm);
                          setEditingCategory(null);
                        }
                      }}
                      className="w-full bg-[#005792] text-white p-2 rounded-lg text-xs font-bold transition-colors"
                    >
                      Salvar Alteração
                    </button>
                  </div>
                ) : (
                  <div className="p-6 border border-dashed border-gray-200 rounded-2xl text-center text-xs text-gray-400">
                    Selecione o ícone de lápis de uma categoria para carregar os metadados técnicos.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Pages (CMS Sitemap Tree) */}
        {activeTab === "pages" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">CMS - Sitemap Dinâmico do Portal</h3>
              <p className="text-xs text-gray-500">
                Configure páginas de conteúdo, seções e segmentos em árvore. Breadcrumbs e menus respondem em tempo real.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tree View columns */}
              <div className="md:col-span-1.5">
                <SitemapTree
                  nodes={pages.map((p) => ({
                    id: p.id,
                    name: p.title,
                    parentId: p.parentId,
                    order: p.order,
                    slug: p.slug,
                  }))}
                  onAdd={(parentId) => handleAddTreeNode(parentId, "pages")}
                  onEdit={(id) => handleEditTreeNode(id, "pages")}
                  onDelete={(id) => handleDeleteTreeNode(id, "pages")}
                  onMoveUp={(id) => handleMoveTreeNode(id, "up", "pages")}
                  onMoveDown={(id) => handleMoveTreeNode(id, "down", "pages")}
                  onReparent={(id, newParentId) => handleReparentTreeNode(id, newParentId, "pages")}
                  nodeTypeLabel="Página"
                />
              </div>

              {/* Rich Page Editor */}
              <div className="md:col-span-1.5">
                {editingPage ? (
                  <div className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-4 animate-fadeIn text-sm font-semibold text-gray-700">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-gray-800">Editor CMS de Página</h4>
                      <span className="text-[10px] text-gray-400 font-mono">ID: {pageForm.id}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Título do Menu</label>
                        <input
                          id="form-page-title"
                          type="text"
                          value={pageForm.title || ""}
                          onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
                          className="w-full text-xs font-bold border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#005792] bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Slug URL</label>
                        <input
                          id="form-page-slug"
                          type="text"
                          value={pageForm.slug || ""}
                          onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
                          className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">Conteúdo do Portal (Markdown / Texto)</label>
                      <textarea
                        id="form-page-content"
                        rows={6}
                        value={pageForm.content || ""}
                        onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })}
                        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">Vincular Esquema de Pintura</label>
                      <select
                        id="form-page-scheme"
                        value={pageForm.schemeId || ""}
                        onChange={(e) => setPageForm({ ...pageForm, schemeId: e.target.value || null })}
                        className="w-full text-xs font-bold border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#005792] bg-white"
                      >
                        <option value="">Nenhum esquema vinculado</option>
                        {paintSchemes.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.surface})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Page SEO */}
                    <div className="p-3.5 bg-blue-50/30 rounded-xl border border-blue-100/30 space-y-2.5">
                      <span className="text-[10px] font-bold text-blue-900 uppercase">Tags SEO desta Página</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400 font-extrabold uppercase">Meta Title</label>
                          <input
                            type="text"
                            value={pageForm.seo_title || ""}
                            onChange={(e) => setPageForm({ ...pageForm, seo_title: e.target.value })}
                            className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1 bg-white focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400 font-extrabold uppercase">Meta Description</label>
                          <input
                            type="text"
                            value={pageForm.seo_description || ""}
                            onChange={(e) =>
                              setPageForm({ ...pageForm, seo_description: e.target.value })
                            }
                            className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1 bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleSavePageDetails}
                        className="flex-1 bg-[#005792] text-white py-2 rounded-xl text-xs font-bold transition-colors"
                      >
                        Salvar Alterações
                      </button>
                      <button
                        onClick={() => {
                          setEditingPage(null);
                          setPageForm({});
                        }}
                        className="text-gray-400 hover:text-gray-600 px-3 text-xs font-semibold"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-10 border border-dashed border-gray-200 rounded-2xl text-center text-xs text-gray-400">
                    Selecione o ícone de lápis de uma página do sitemap para carregar o CMS de edição estrutural e metadados Google.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Paint Schemes (Esquemas de Pintura) */}
        {activeTab === "schemes" && (
          <div className="space-y-6">
            {!editingScheme ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Esquemas de Pintura Recomendados</h3>
                    <p className="text-xs text-gray-500">Desenvolva etapas de pintura com primer, demãos (coats) e acabamentos</p>
                  </div>
                  <button
                    onClick={handleCreateNewScheme}
                    className="bg-[#005792] hover:bg-[#004370] text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="h-4 w-4" /> Novo Esquema
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paintSchemes.map((scheme) => (
                    <div key={scheme.id} className="p-4 border border-gray-150 rounded-2xl space-y-3 bg-gray-50/20">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-[#005792] bg-blue-100 px-2.5 py-0.5 rounded-full">
                            {scheme.surface}
                          </span>
                          <h4 className="font-bold text-sm text-gray-800 mt-1.5 leading-snug">{scheme.name}</h4>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleSelectScheme(scheme)}
                            className="p-1.5 text-[#005792] hover:bg-blue-50 rounded"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteScheme(scheme.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 font-normal leading-relaxed line-clamp-2">
                        {scheme.description}
                      </p>

                      <div className="pt-2 border-t border-gray-100 flex items-center gap-1.5 text-[10px] font-bold text-gray-600">
                        {scheme.steps.map((st, idx) => {
                          const pObj = products.find((x) => x.id === st.productId);
                          return (
                            <div key={idx} className="flex items-center gap-1">
                              <span className="bg-[#005792] text-white rounded-full h-4.5 w-4.5 flex items-center justify-center font-mono text-[9px] shrink-0">
                                {idx + 1}
                              </span>
                              <span className="truncate max-w-[80px]">{pObj?.name || st.productId}</span>
                              {idx < scheme.steps.length - 1 && <ArrowRight className="h-3 w-3 text-gray-300" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Scheme Builder Form */
              <div className="space-y-6 max-w-3xl animate-fadeIn">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Criar/Editar Esquema de Pintura</h3>
                    <p className="text-xs text-gray-500">ID Ativo: {schemeForm.id}</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingScheme(null);
                      setSchemeForm({});
                      setSchemeSteps([]);
                    }}
                    className="text-gray-500 text-xs font-semibold px-2 py-1"
                  >
                    Voltar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold text-gray-700">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Nome do Esquema</label>
                    <input
                      id="form-scheme-name"
                      type="text"
                      value={schemeForm.name || ""}
                      onChange={(e) => setSchemeForm({ ...schemeForm, name: e.target.value })}
                      className="w-full text-xs font-bold border border-gray-200 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Superfície Indicada</label>
                    <select
                      id="form-scheme-surface"
                      value={schemeForm.surface || "Concreto"}
                      onChange={(e) => setSchemeForm({ ...schemeForm, surface: e.target.value })}
                      className="w-full text-xs font-bold border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none"
                    >
                      <option value="Concreto">Concreto / Alvenaria</option>
                      <option value="Aço Carbono">Aço Carbono / Ferro</option>
                      <option value="Galvanizado">Aço Galvanizado</option>
                      <option value="Alumínio">Alumínio / Metais não-ferrosos</option>
                      <option value="Madeira">Madeira Nobre</option>
                    </select>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs text-gray-500">Indicações e Descrição do Esquema</label>
                    <textarea
                      id="form-scheme-desc"
                      rows={2}
                      value={schemeForm.description || ""}
                      onChange={(e) => setSchemeForm({ ...schemeForm, description: e.target.value })}
                      className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Steps Builder Area */}
                <div className="space-y-4 p-5 bg-gray-50 rounded-2xl border border-gray-150">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Montagem das Etapas de Aplicação</h4>

                  {/* Steps list */}
                  <div className="space-y-2">
                    {schemeSteps.map((st, i) => {
                      const pObj = products.find((x) => x.id === st.productId);
                      return (
                        <div
                          key={i}
                          className="bg-white border border-gray-200 rounded-xl p-3 flex justify-between items-center text-xs gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <span className="h-6 w-6 rounded-full bg-[#005792] text-white flex items-center justify-center font-bold">
                              {i + 1}
                            </span>
                            <div>
                              <p className="font-bold text-gray-800">{pObj?.name || st.productId}</p>
                              <div className="text-[10px] text-gray-400 font-medium flex gap-3 mt-0.5">
                                <span className="uppercase font-semibold text-blue-800">Tipo: {st.productType}</span>
                                <span>Demãos (Coats): {st.coats}</span>
                                <span>Intervalo: {st.interval}</span>
                              </div>
                              {st.notes && <p className="text-[10px] text-gray-400 font-normal italic mt-1">Obs: {st.notes}</p>}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveStepFromScheme(i)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                    {schemeSteps.length === 0 && (
                      <p className="text-xs text-gray-400 italic text-center py-4 bg-white/50 rounded-xl border border-dashed">
                        Nenhuma etapa adicionada. Monte abaixo as etapas para este esquema.
                      </p>
                    )}
                  </div>

                  {/* Step adder inputs */}
                  <div className="pt-4 border-t border-gray-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Selecione o Produto</label>
                      <select
                        id="add-step-product"
                        value={newStepProduct}
                        onChange={(e) => setNewStepProduct(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:outline-none"
                      >
                        <option value="">-- Escolha um Produto --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Tipo de Aplicação</label>
                      <select
                        id="add-step-type"
                        value={newStepType}
                        onChange={(e) => setNewStepType(e.target.value as any)}
                        className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:outline-none"
                      >
                        <option value="primer">Primer (Selador / Fundo)</option>
                        <option value="intermediario">Intermediário</option>
                        <option value="acabamento">Acabamento (Esmalte Protetor)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Número de Demãos (Coats)</label>
                      <input
                        type="number"
                        min="1"
                        value={newStepCoats}
                        onChange={(e) => setNewStepCoats(parseInt(e.target.value) || 1)}
                        className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Intervalo entre demãos</label>
                      <input
                        type="text"
                        value={newStepInterval}
                        onChange={(e) => setNewStepInterval(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Notas Técnicas da Etapa</label>
                      <input
                        type="text"
                        placeholder="Ex: Diluir em 10% com diluente PU 5003..."
                        value={newStepNotes}
                        onChange={(e) => setNewStepNotes(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddStepToScheme}
                      className="bg-[#005792] hover:bg-[#004370] text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1 sm:col-span-2 h-9"
                    >
                      <Plus className="h-4 w-4" /> Adicionar Etapa ao Esquema
                    </button>
                  </div>
                </div>

                {/* Save Block */}
                <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                  <button
                    onClick={handleSaveScheme}
                    className="bg-[#005792] hover:bg-[#004370] text-white text-xs font-bold py-2.5 px-6 rounded-xl shadow-md transition-colors"
                  >
                    <Save className="h-4 w-4" /> Gravar Esquema
                  </button>
                  <button
                    onClick={() => {
                      setEditingScheme(null);
                      setSchemeForm({});
                      setSchemeSteps([]);
                    }}
                    className="text-gray-400 text-xs font-bold px-4"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Media Library (pastas e subpastas em z-tree + preview) */}
        {activeTab === "media" && (
          <div className="space-y-6 text-sm font-semibold text-gray-700">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Biblioteca de Mídias (z-Tree Filesystem)</h3>
              <p className="text-xs text-gray-500">
                Gerencie pastas e envie arquivos de mídia (Imagens, PDF técnicos ou vídeos) com pré-visualização instantânea.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Media Folder tree */}
              <div>
                <SitemapTree
                  nodes={mediaFolders.map((f) => ({ id: f.id, name: f.name, parentId: f.parentId, order: 1 }))}
                  onAdd={(parentId) => handleAddTreeNode(parentId, "media")}
                  onEdit={() => {}}
                  onDelete={(id) => handleDeleteTreeNode(id, "media")}
                  onMoveUp={() => {}}
                  onMoveDown={() => {}}
                  onReparent={() => {}}
                  nodeTypeLabel="Pasta"
                  isMedia={true}
                />

                <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl mt-4 space-y-3">
                  <h4 className="text-xs font-bold text-gray-700 uppercase">Filtro Ativo</h4>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400">Pasta Selecionada</label>
                    <select
                      id="select-active-folder"
                      value={activeFolderId || ""}
                      onChange={(e) => setActiveFolderId(e.target.value || null)}
                      className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:outline-none"
                    >
                      <option value="">Arquivos Soltos (Raiz)</option>
                      {mediaFolders.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Folder Content & Preview panel */}
              <div className="md:col-span-2 space-y-6">
                {/* Upload Simulated Files Form */}
                <div className="p-4 bg-[#005792]/5 border border-blue-100 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-[#005792] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-4.5 w-4.5" /> Adicionar Mídia à Pasta
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500">Nome do Arquivo</label>
                      <input
                        type="text"
                        placeholder="foto-fachada-galpao.jpg"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500">Tipo de Arquivo</label>
                      <select
                        id="select-media-type"
                        value={newFileType}
                        onChange={(e) => setNewFileType(e.target.value as any)}
                        className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:outline-none"
                      >
                        <option value="image">Imagem</option>
                        <option value="pdf">Manual / PDF Técnico</option>
                        <option value="video">Vídeo</option>
                      </select>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] text-gray-500">Arquivo URL (Caminho ou Link Externo)</label>
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={newFileUrl}
                        onChange={(e) => setNewFileUrl(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddMediaFile}
                    className="w-full bg-[#005792] hover:bg-[#004370] text-white py-2 rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" /> Registrar Arquivo de Mídia
                  </button>
                </div>

                {/* Grid Files viewer */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-700 uppercase">
                    Arquivos em:{" "}
                    <span className="text-[#005792]">
                      {activeFolderId
                        ? mediaFolders.find((f) => f.id === activeFolderId)?.name
                        : "Raiz da Biblioteca"}
                    </span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {mediaFiles
                      .filter((f) => f.folderId === activeFolderId)
                      .map((file) => (
                        <div
                          key={file.id}
                          className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs hover:border-blue-200 transition-all flex flex-col group/file relative"
                        >
                          <div className="aspect-video bg-gray-50 border-b relative overflow-hidden flex items-center justify-center">
                            {file.type === "image" ? (
                              <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                            ) : file.type === "pdf" ? (
                              <div className="h-full w-full bg-red-50 text-red-500 flex flex-col items-center justify-center gap-1">
                                <span className="font-bold text-xs uppercase tracking-wider bg-red-500 text-white px-2 py-0.5 rounded">
                                  PDF
                                </span>
                              </div>
                            ) : (
                              <div className="h-full w-full bg-blue-50 text-blue-500 flex flex-col items-center justify-center gap-1">
                                <span className="font-bold text-xs uppercase tracking-wider bg-blue-500 text-white px-2 py-0.5 rounded">
                                  MP4
                                </span>
                              </div>
                            )}

                            {/* Hover absolute trigger for deletion */}
                            <button
                              onClick={() => handleDeleteMediaFile(file.id)}
                              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover/file:opacity-100 shadow-md"
                              title="Excluir arquivo"
                            >
                              <trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="p-2.5">
                            <h5 className="font-bold text-xs text-gray-800 truncate leading-snug" title={file.name}>
                              {file.name}
                            </h5>
                            <span className="text-[9px] text-gray-400 font-medium block mt-0.5">{file.size}</span>
                          </div>
                        </div>
                      ))}
                    {mediaFiles.filter((f) => f.folderId === activeFolderId).length === 0 && (
                      <p className="text-xs text-gray-400 italic text-center py-8 col-span-full border border-dashed rounded-2xl bg-gray-50/20">
                        Esta pasta está vazia. Registre acima arquivos ou manuais para visualização.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Bulk Spreadsheet (CSV Import/Export) */}
        {activeTab === "csv" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Planilha de Produtos (Importação em Massa CSV)</h3>
              <p className="text-xs text-gray-500">
                Copie, cole ou exporte planilhas de produtos para atualização imediata de títulos, imagens, preços e todas as 63 especificações técnicas WEG.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-[#005792]/5 border border-blue-100 rounded-2xl text-xs text-[#005792] leading-relaxed font-normal space-y-2">
                <div className="flex items-center gap-2">
                   <FileSpreadsheet className="h-5 w-5" />
                   <strong className="uppercase">Instruções de Importação Avançada</strong>
                </div>
                <p>O sistema agora suporta a ficha técnica completa com 63 campos. Recomenda-se <strong>Exportar a Planilha Atual</strong> primeiro para usar como modelo (Template).</p>
                <div className="bg-blue-100/30 p-2 rounded border border-blue-100">
                  <span className="font-bold block mb-1">Campos principais no cabeçalho:</span>
                  <code className="break-all opacity-80">id, name, summary, description, category, price, image, isPaint, colors_json, filter_secagem, filter_brilho, ..., id_produto_interno_cv, codigo_produto_weg, ..., secagem_final_25</code>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <label className="text-xs font-bold text-gray-600 block">Conteúdo CSV (Cole aqui do Excel ou Google Sheets)</label>
                   <span className="text-[10px] bg-blue-50 text-[#005792] px-2 py-0.5 rounded-full font-bold">Suporte a Delimitador Vírgula (,) e Aspas (")</span>
                </div>
                <textarea
                  id="csv-text-import"
                  rows={10}
                  placeholder="Cole aqui as linhas da sua planilha..."
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full text-xs font-mono border border-gray-200 rounded-2xl p-4 bg-gray-50 focus:outline-none focus:bg-white transition-colors shadow-inner"
                />
              </div>

              {importStatus && (
                <div className="p-3 bg-gray-100 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1.5 animate-fadeIn">
                  <Sparkles className="h-4 w-4 text-blue-600 animate-spin" /> {importStatus}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleImportCSV}
                  className="bg-[#005792] hover:bg-[#004370] text-white text-xs font-black py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95"
                >
                  <Upload className="h-4 w-4" /> Processar e Importar Planilha
                </button>
                <a
                  href="/api/products-csv/export"
                  download="catalogo_weg.csv"
                  className="bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2 border border-gray-200"
                >
                  <Download className="h-4 w-4" /> Exportar Planilha Atual
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: Orders logs */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Logs de Pedidos e Vendas</h3>
              <p className="text-xs text-gray-500">Histórico de compras finalizadas pelos clientes no simulador Mercado Pago.</p>
            </div>

            <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-150">
              <div className="grid grid-cols-5 bg-gray-50 p-4 font-bold text-xs text-gray-500 uppercase tracking-wider">
                <span>Pedido ID</span>
                <span>Comprador</span>
                <span>Data</span>
                <span>Itens</span>
                <span className="text-right">Total Geral</span>
              </div>

              {orders.map((order) => (
                <div key={order.id} className="grid grid-cols-5 p-4 text-xs text-gray-700 font-medium items-center hover:bg-gray-50/50 transition-colors">
                  <span className="font-bold text-gray-800">{order.id}</span>
                  <div className="flex flex-col">
                    <span className="font-bold">{order.userName}</span>
                    <span className="text-[10px] text-gray-400 font-normal">{order.userEmail}</span>
                  </div>
                  <span>{new Date(order.date).toLocaleDateString()}</span>
                  <div className="flex flex-col gap-1 max-h-16 overflow-y-auto">
                    {order.items.map((item: any, idx: number) => (
                      <span key={idx} className="text-[10px] text-gray-500 truncate font-normal">
                        {item.quantity}x {item.name} {item.color ? `(${item.color})` : ""}
                      </span>
                    ))}
                  </div>
                  <span className="font-bold text-right text-[#005792]">R$ {order.total.toFixed(2)}</span>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="p-8 text-center text-xs text-gray-400">
                  Nenhum pedido finalizado no sistema ainda.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
