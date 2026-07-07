import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Award,
  ChevronRight,
  ShieldCheck,
  Activity,
  HeartHandshake,
  MessageSquare,
  Compass,
  FileText,
  BadgeAlert,
  ArrowRight,
  Droplet,
  PackageCheck,
  Download,
  CheckCircle2,
} from "lucide-react";
import { Product, Category, Page, PaintScheme, MediaFolder, MediaFile, Order, CartItem, User, ProductColor } from "./types";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProductCard from "./components/ProductCard";
import ProductDetailsModal from "./components/ProductDetailsModal";
import CheckoutModal from "./components/CheckoutModal";
import AIChatbot from "./components/AIChatbot";
import AdminPanel from "./components/AdminPanel";
import ColorSimulator from "./components/ColorSimulator";
import { motion, AnimatePresence } from "motion/react";

const allUsers: User[] = [
  {
    id: "user-client-1",
    name: "Gabriel Chem",
    email: "gabriel@weg.com",
    role: "client",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
  },
  {
    id: "user-admin-1",
    name: "Jules Diretor",
    email: "jules@canalvisual.com",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
];

export default function App() {
  // --- Data states ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [paintSchemes, setPaintSchemes] = useState<PaintScheme[]>([]);
  const [mediaFolders, setMediaFolders] = useState<MediaFolder[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // --- UI and Session States ---
  const [activeUser, setActiveUser] = useState<User>(allUsers[0]);
  const [activePageId, setActivePageId] = useState<string>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isAdminActive, setIsAdminActive] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeSegmentFilter, setActiveSegmentFilter] = useState<string>("todas");
  const [externalPrompt, setExternalPrompt] = useState<string | undefined>(undefined);

  // Fetch all database states from the backend on mount
  const refreshDatabase = async () => {
    try {
      const [pRes, cRes, paRes, sRes, fRes, fiRes, oRes] = await Promise.all([
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/categories").then((r) => r.json()),
        fetch("/api/pages").then((r) => r.json()),
        fetch("/api/paint-schemes").then((r) => r.json()),
        fetch("/api/media/folders").then((r) => r.json()),
        fetch("/api/media/files").then((r) => r.json()),
        fetch("/api/orders").then((r) => r.json()),
      ]);

      setProducts(pRes || []);
      setCategories(cRes || []);
      setPages(paRes || []);
      setPaintSchemes(sRes || []);
      setMediaFolders(fRes || []);
      setMediaFiles(fiRes || []);
      setOrders(oRes || []);
    } catch (error) {
      console.error("Erro ao sincronizar com o banco de dados Express:", error);
    }
  };

  useEffect(() => {
    refreshDatabase();
  }, []);

  // Sync admin mode state if user profile is switched
  const handleUserSelect = (u: User) => {
    setActiveUser(u);
    if (u.role !== "admin") {
      setIsAdminActive(false);
    }
  };

  // --- Shopping Cart Handlers ---
  const handleAddToCart = (product: Product, quantity: number, selectedColor?: ProductColor) => {
    const finalPrice = product.price + (selectedColor ? selectedColor.priceDelta : 0);
    const existingIdx = cartItems.findIndex(
      (item) => item.productId === product.id && item.colorName === selectedColor?.name
    );

    if (existingIdx > -1) {
      const copy = [...cartItems];
      copy[existingIdx].quantity += quantity;
      setCartItems(copy);
    } else {
      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        price: finalPrice,
        colorName: selectedColor?.name,
        colorHex: selectedColor?.hex,
        quantity,
        image: product.image,
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const handleAddToCartDirect = (product: Product) => {
    // If it's a paint with color, select first color by default
    const defaultColor = product.isPaint && product.colors.length > 0 ? product.colors[0] : undefined;
    handleAddToCart(product, 1, defaultColor);
  };

  const handleRemoveFromCart = (idx: number) => {
    setCartItems(cartItems.filter((_, i) => i !== idx));
  };

  const cartTotal = cartItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  // --- Breadcrumb generation helper ---
  // Renders parents in order: Root > Parent > Current
  const getBreadcrumbs = () => {
    if (activePageId === "home") return ["Página Inicial"];
    if (activePageId === "simulador") return ["Página Inicial", "Simulador de Cores"];
    const activePage = pages.find((p) => p.id === activePageId);
    if (!activePage) return ["Canal Visual"];

    const path: string[] = [activePage.title];
    let parentId = activePage.parentId;

    while (parentId) {
      const parent = pages.find((p) => p.id === parentId);
      if (parent) {
        path.unshift(parent.title);
        parentId = parent.parentId;
      } else {
        break;
      }
    }
    path.unshift("Página Inicial");
    return path;
  };

  // Filter products by search and segment filter
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeSegmentFilter === "todas") return matchesSearch;
    return prod.category === activeSegmentFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans selection:bg-[#005792] selection:text-white overflow-x-hidden">
      {/* Navbar header */}
      <Navbar
        pages={pages}
        activePageId={activePageId}
        onPageSelect={(id) => {
          setActivePageId(id);
          setIsAdminActive(false);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartItems={cartItems}
        cartTotal={cartTotal}
        onRemoveFromCart={handleRemoveFromCart}
        onCheckout={() => setIsCheckoutOpen(true)}
        activeUser={activeUser}
        allUsers={allUsers}
        onUserSelect={handleUserSelect}
        onViewAdmin={() => setIsAdminActive(!isAdminActive)}
        isAdminActive={isAdminActive}
      />

      {/* Main Container */}
      <main className="flex-1 w-full bg-linear-to-b from-blue-50/10 via-white to-slate-50/50 pb-12">
        {/* Breadcrumbs Navigation - Responsive to the Tree structure */}
        <div className="bg-white/60 border-b border-gray-100/50 py-3 px-6 select-none shrink-0">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 text-xs text-gray-500 font-semibold uppercase tracking-wider">
            {getBreadcrumbs().map((crumb, idx) => (
              <React.Fragment key={idx}>
                <span
                  onClick={() => {
                    if (crumb === "Página Inicial") {
                      setActivePageId("home");
                      setIsAdminActive(false);
                    }
                  }}
                  className={`hover:text-[#005792] cursor-pointer transition-colors ${idx === getBreadcrumbs().length - 1 ? "text-gray-800 font-black cursor-default hover:text-gray-800" : ""}`}
                >
                  {crumb}
                </span>
                {idx < getBreadcrumbs().length - 1 && <ChevronRight className="h-3 w-3 text-gray-400" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ADMIN MODE ACTIVE */}
        {isAdminActive && activeUser?.role === "admin" ? (
          <AdminPanel
            products={products}
            categories={categories}
            pages={pages}
            paintSchemes={paintSchemes}
            mediaFolders={mediaFolders}
            mediaFiles={mediaFiles}
            orders={orders}
            onRefreshAll={refreshDatabase}
          />
        ) : (
          /* CLIENT VIEWS */
          <div className="animate-fadeIn">
            {activePageId === "home" ? (
              /* HOME LANDING */
              <div className="space-y-12">
                {/* Bento Grid Header / Showcase Section */}
                <section className="max-w-7xl mx-auto px-6 pt-10 pb-6 grid grid-cols-12 gap-6 font-sans">
                  
                  {/* Hero Block - col-span-12 lg:col-span-8 */}
                  <div className="col-span-12 lg:col-span-8 bg-[#005792] rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl flex flex-col justify-between min-h-[440px] group">
                    <div className="relative z-10 max-w-xl space-y-6">
                      <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-100 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest backdrop-blur-md">
                        <Sparkles className="h-3.5 w-3.5 text-yellow-300" /> Distribuidor Especializado WEG
                      </div>
                      <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.15] font-display">
                        A cor que protege o seu patrimônio.
                      </h2>
                      <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-normal">
                        Especialistas na especificação de esquemas de pintura de alto desempenho: epóxis industriais, poliuretanos contra intempéries severas e revestimentos marítimos de fábrica.
                      </p>
                    </div>

                    <div className="pt-8 relative z-10 flex flex-wrap gap-3">
                      <a
                        href="#loja"
                        className="bg-white text-[#005792] hover:bg-blue-50 text-xs font-black uppercase tracking-wider py-3.5 px-6 rounded-2xl transition-all shadow-md"
                      >
                        Ver Catálogo Completo
                      </a>
                      <a
                        href="#esquemas"
                        className="bg-white/15 hover:bg-white/20 text-white border border-white/10 font-bold py-3.5 px-6 rounded-2xl transition-all text-xs uppercase tracking-wider backdrop-blur-xs"
                      >
                        Esquemas Recomendados
                      </a>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute bottom-[-100px] right-[-50px] w-[500px] h-[500px] bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl pointer-events-none"></div>
                  </div>

                  {/* Authorized Badge Block - col-span-12 md:col-span-6 lg:col-span-4 */}
                  <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xs">
                    <div className="w-24 h-12 flex items-center justify-center mb-4">
                      {/* WEG SVG Logo */}
                      <svg viewBox="0 0 100 40" className="w-full h-full text-[#005792] fill-current font-black text-3xl italic tracking-tighter">
                        <text x="5" y="30">WEG</text>
                      </svg>
                    </div>
                    <h3 className="text-slate-800 font-bold text-lg leading-tight uppercase font-display">Revendedor Autorizado</h3>
                    <p className="text-slate-500 text-xs mt-2.5 leading-relaxed">
                      Garantia de procedência legítima e suporte técnico direto da fábrica para sua obra, estrutura metálica ou empresa.
                    </p>
                  </div>

                  {/* Specificator Steps Block - col-span-12 md:col-span-6 lg:col-span-4 */}
                  <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#005792] font-display">Especificador de Esquemas</span>
                      <Droplet className="h-4.5 w-4.5 text-[#005792]" />
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-3 items-start text-xs">
                        <span className="bg-[#005792] text-white rounded-full h-5 w-5 flex items-center justify-center font-bold shrink-0 mt-0.5 text-[10px]">1</span>
                        <div>
                          <p className="font-bold text-slate-800">Análise do Substrato</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Metalúrgico, concreto, galvanizado ou imersão em tanques.</p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start text-xs">
                        <span className="bg-[#005792] text-white rounded-full h-5 w-5 flex items-center justify-center font-bold shrink-0 mt-0.5 text-[10px]">2</span>
                        <div>
                          <p className="font-bold text-slate-800">Indicação Epóxi + PU</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Camadas de fundo (primer) aliadas com acabamentos de poliuretano.</p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start text-xs">
                        <span className="bg-[#005792] text-white rounded-full h-5 w-5 flex items-center justify-center font-bold shrink-0 mt-0.5 text-[10px]">3</span>
                        <div>
                          <p className="font-bold text-slate-800">Catalisador & Cura</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Pot life controlado e secagem química ideal para proteção extrema.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 text-[10px] text-slate-500 leading-relaxed font-normal">
                      Precisa de suporte agora? Pergunte ao nosso <strong>Especialista Virtual IA</strong> no canto inferior!
                    </div>
                  </div>

                  {/* Stat Card 1: Cores - col-span-6 md:col-span-3 lg:col-span-2 */}
                  <div className="col-span-6 md:col-span-3 lg:col-span-2 bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
                    <div className="w-8 h-8 bg-[#005792] rounded-xl flex items-center justify-center text-white font-bold text-sm">✓</div>
                    <div className="mt-4">
                      <p className="text-[#005792] font-black text-3xl leading-none font-display">+5k</p>
                      <p className="text-slate-600 text-[10px] uppercase font-bold tracking-tight mt-1 leading-snug">Cores de Fábrica Disponíveis</p>
                    </div>
                  </div>

                  {/* Stat Card 2: Suporte - col-span-6 md:col-span-3 lg:col-span-2 */}
                  <div className="col-span-6 md:col-span-3 lg:col-span-2 bg-slate-900 rounded-3xl p-6 flex flex-col justify-between text-white shadow-xs">
                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-display">Suporte Zap</div>
                    <div className="text-[11px] leading-tight text-slate-300 mt-4">
                      Dúvida técnica rápida?
                      <span className="block font-black mt-1 text-sm text-green-400 font-mono">(47) 99245-0012</span>
                    </div>
                  </div>

                  {/* Simulator / Tool Card - col-span-12 md:col-span-6 lg:col-span-4 */}
                  <div
                    onClick={() => {
                      setActivePageId("simulador");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="col-span-12 md:col-span-6 lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 flex items-center gap-4 shadow-xs hover:border-[#005792]/40 transition-all duration-200 group cursor-pointer"
                  >
                    <div className="flex-1">
                      <h4 className="text-slate-800 font-extrabold mb-1 font-display">Simulador de Cores</h4>
                      <p className="text-slate-500 text-xs">Selecione e visualize as tonalidades WEG antes de solicitar.</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePageId("simulador");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="inline-block mt-3 text-[#005792] font-extrabold text-xs uppercase tracking-wider hover:underline cursor-pointer"
                      >
                        Experimentar Simulador →
                      </button>
                    </div>
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform shrink-0">
                      <span className="text-2xl">🎨</span>
                    </div>
                  </div>

                  {/* Fast Delivery Card - col-span-12 md:col-span-6 lg:col-span-4 */}
                  <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-[#005792]/5 border border-[#005792]/20 rounded-3xl p-6 flex items-center gap-4 shadow-xs">
                     <div className="flex-1">
                      <h4 className="text-slate-800 font-extrabold mb-1 font-display">Entrega Rápida</h4>
                      <p className="text-slate-500 text-xs">Logística expressa para Joinville, região e despacho nacional.</p>
                      <div className="mt-3 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Logística Integrada</span>
                      </div>
                    </div>
                    <div className="w-16 h-16 flex flex-col gap-1.5 justify-center shrink-0">
                      <div className="h-3 w-12 bg-[#005792]/10 rounded-full"></div>
                      <div className="h-3 w-16 bg-[#005792]/20 rounded-full"></div>
                      <div className="h-3 w-10 bg-[#005792]/30 rounded-full"></div>
                    </div>
                  </div>

                </section>

                {/* Main Product Catalog Section */}
                <section id="loja" className="max-w-7xl mx-auto px-6 space-y-8 scroll-mt-24">
                  <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-gray-800 tracking-tight">Catálogo Comercial de Tintas WEG</h2>
                      <p className="text-xs text-gray-500">
                        Selecione as cores de fábrica de alta fidelidade e adicione itens adicionais como catalisadores.
                      </p>
                    </div>

                    {/* Segment Filter Menu */}
                    <div className="flex flex-wrap gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-bold text-gray-600">
                      {[
                        { id: "todas", label: "Todas as Linhas" },
                        { id: "industrial", label: "Epóxi / PU Industrial" },
                        { id: "imobiliaria", label: "Civil / Alto Padrão" },
                        { id: "maritima", label: "Marítima Protetiva" },
                        { id: "acessorios", label: "Catalisadores / Rolos" },
                      ].map((seg) => (
                        <button
                          key={seg.id}
                          onClick={() => setActiveSegmentFilter(seg.id)}
                          className={`py-1.5 px-3 rounded-lg transition-all ${activeSegmentFilter === seg.id ? "bg-white text-[#005792] shadow-sm" : "hover:bg-white/50"}`}
                        >
                          {seg.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grid of Product Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onViewDetails={(prod) => setSelectedProduct(prod)}
                        onAddToCartDirect={handleAddToCartDirect}
                      />
                    ))}
                    {filteredProducts.length === 0 && (
                      <div className="col-span-full py-16 text-center text-sm text-gray-400">
                        Nenhum produto WEG encontrado nesta linha ou pesquisa.
                      </div>
                    )}
                  </div>
                </section>

                {/* Paint Schemes Showcase Section */}
                <section id="esquemas" className="bg-[#005792]/5 border-y border-[#005792]/10 py-16 scroll-mt-24">
                  <div className="max-w-7xl mx-auto px-6 space-y-8">
                    <div className="text-center max-w-2xl mx-auto space-y-2">
                      <h3 className="text-2xl font-black text-gray-800 tracking-tight">Esquemas de Pintura Homologados WEG</h3>
                      <p className="text-xs text-gray-500">
                        Orientação técnica passo-a-passo recomendada pela Canal Visual para revestimento de superfícies sob condições normais e críticas.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {paintSchemes.map((scheme) => (
                        <div
                          key={scheme.id}
                          className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-6"
                        >
                          <div className="space-y-4">
                            <span className="text-[10px] font-bold text-[#005792] bg-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">
                              {scheme.surface}
                            </span>
                            <h4 className="font-bold text-base text-gray-800 leading-snug">{scheme.name}</h4>
                            <p className="text-xs text-gray-500 font-normal leading-relaxed">
                              {scheme.description}
                            </p>
                          </div>

                          {/* Steps vertical visual chain */}
                          <div className="space-y-3 pt-4 border-t border-gray-50">
                            {scheme.steps.map((step, idx) => {
                              const pObj = products.find((x) => x.id === step.productId);
                              return (
                                <div key={idx} className="flex gap-3 text-xs">
                                  <span className="bg-[#005792] text-white rounded-full h-5 w-5 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                    {idx + 1}
                                  </span>
                                  <div>
                                    <p className="font-bold text-gray-800">{pObj ? pObj.name : step.productId}</p>
                                    <p className="text-[10px] text-gray-400 capitalize font-medium mt-0.5">
                                      {step.productType === "primer" ? "Fundo Selador" : step.productType === "acabamento" ? "Esmalte Protetor" : "Intermediário"} &bull; {step.coats} Demão(s)
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            ) : activePageId === "simulador" ? (
              /* COLOR SIMULATOR VIEW */
              <div className="animate-fadeIn">
                <ColorSimulator
                  products={products}
                  onAddToCart={handleAddToCart}
                  onOpenChat={(msg) => {
                    setExternalPrompt(msg);
                  }}
                />
              </div>
            ) : (
              /* CMS INNER PAGES (DYNAMICALLY LOADED IN THE SITEMAP TREE) */
              <div className="max-w-4xl mx-auto px-6 py-10 animate-fadeIn">
                {pages
                  .filter((p) => p.id === activePageId)
                  .map((page) => (
                    <article key={page.id} className="bg-white border border-gray-100 shadow-xs rounded-3xl p-8 sm:p-12 space-y-6">
                      <div className="space-y-2 border-b border-gray-100 pb-5">
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">Portal de Conteúdo</span>
                        <h1 className="text-3xl font-black text-gray-800 tracking-tight">{page.title}</h1>
                      </div>

                      {/* Content block */}
                      <div className="text-sm text-gray-600 leading-relaxed font-normal whitespace-pre-line space-y-4">
                        {page.content}
                      </div>

                      {/* Informative Help Alert */}
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100/50 flex gap-3 text-xs text-[#005792] font-normal leading-relaxed mt-6">
                        <ShieldCheck className="h-5 w-5 text-[#005792] shrink-0" />
                        <div>
                          <strong>Dúvidas sobre esses Segmentos ou Ambientes?</strong><br />
                          Chame nossa central comercial agora para obter a especificação técnica certificada de sua obra ou projeto.
                        </div>
                      </div>
                    </article>
                  ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer component */}
      <Footer />

      {/* Product Inspect Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
          onAddToCart={handleAddToCart}
          allPaintSchemes={paintSchemes}
        />
      )}

      {/* Checkout Procedural Drawer Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cartItems}
          cartTotal={cartTotal}
          user={activeUser}
          onOrderSuccess={() => refreshDatabase()}
          clearCart={() => setCartItems([])}
        />
      )}

      {/* Floating Technical Expert Chatbot (using the Server-side API key proxy securely) */}
      <AIChatbot
        currentProduct={selectedProduct}
        externalPrompt={externalPrompt}
        onClearExternalPrompt={() => setExternalPrompt(undefined)}
      />
    </div>
  );
}
