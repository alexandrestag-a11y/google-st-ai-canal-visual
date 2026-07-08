import React, { useState } from "react";
import {
  Sparkles,
  Paintbrush,
  Check,
  ShoppingCart,
  HelpCircle,
  Download,
  Undo,
  RefreshCw,
  Layers,
  Clock,
  AlertCircle,
  FileText
} from "lucide-react";
import { Product, ProductColor, CartItem } from "../types";

interface ColorSimulatorProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number, selectedColor?: ProductColor) => void;
  onOpenChat: (initialMessage: string) => void;
}

// Environment definitions for WEG Paints
interface EnvPart {
  id: string;
  name: string;
  defaultColor: string;
}

interface Environment {
  id: string;
  name: string;
  description: string;
  icon: string;
  recommendedType: "industrial" | "imobiliaria" | "maritima";
  recommendedProductIds: string[];
  parts: EnvPart[];
  technicalAdvice: string;
}

const ENVIRONMENTS: Environment[] = [
  {
    id: "sala",
    name: "Sala de Estar Contemporânea",
    description: "Ambiente residencial interno ideal para a linha civil de alto padrão WEG.",
    icon: "🏠",
    recommendedType: "imobiliaria",
    recommendedProductIds: ["w-lack-hpd-151"],
    parts: [
      { id: "parede_principal", name: "Parede Principal", defaultColor: "#f3f4f6" },
      { id: "parede_destaque", name: "Parede de Destaque", defaultColor: "#e5e7eb" },
      { id: "sofa", name: "Estofado / Sofá", defaultColor: "#374151" },
      { id: "piso", name: "Piso de Madeira / Laminado", defaultColor: "#8b5a2b" }
    ],
    technicalAdvice: "Para paredes internas de alvenaria ou gesso, recomendamos a aplicação de selador acrílico como fundo para uniformizar a absorção, seguido de 2 a 3 demãos de W-LACK HPD 151."
  },
  {
    id: "fachada",
    name: "Fachada Residencial Moderna",
    description: "Área externa de alvenaria e metais sob ação de sol, chuva e intemperismo severo.",
    icon: "🏡",
    recommendedType: "imobiliaria",
    recommendedProductIds: ["w-thane-srd-501", "w-lack-hpd-151"],
    parts: [
      { id: "fachada_parede", name: "Parede de Alvenaria", defaultColor: "#f9fafb" },
      { id: "porta_madeira", name: "Porta / Portão de Entrada", defaultColor: "#5c4033" },
      { id: "vigas_telhado", name: "Moldura das Janelas / Friso", defaultColor: "#4b5563" },
      { id: "calcada", name: "Calçada / Piso Externo", defaultColor: "#9ca3af" }
    ],
    technicalAdvice: "Fachadas exigem máxima resistência contra raios UV. O Poliuretano W-THANE SRD 501 proporciona proteção superior alifática, evitando o amarelamento precoce e retendo o brilho original por anos."
  },
  {
    id: "galpao",
    name: "Estruturas Industriais & Piso",
    description: "Ideal para testar primers anticorrosivos, vigas de aço (PU) e pisos de concreto de alta resistência (Epóxi).",
    icon: "🏭",
    recommendedType: "industrial",
    recommendedProductIds: ["w-poxi-ind-322", "w-thane-srd-501"],
    parts: [
      { id: "estrutura_viga", name: "Estrutura Metálica (Vigas)", defaultColor: "#71717a" },
      { id: "piso_epoxi", name: "Piso de Concreto (Epóxi)", defaultColor: "#52525b" },
      { id: "parede_galpao", name: "Parede de Divisória", defaultColor: "#e4e4e7" },
      { id: "maquinarios", name: "Equipamento / Máquinas", defaultColor: "#27272a" }
    ],
    technicalAdvice: "Piso Industrial exige o primer/acabamento epóxi W-POXI IND 322 devido ao tráfego de empilhadeiras. Para as vigas expostas ao sol, o esmalte poliuretano W-THANE 501 é a barreira perfeita contra corrosão severa."
  },
  {
    id: "embarcacao",
    name: "Embarcações & Casco Marítimo",
    description: "Especialidades marítimas WEG para proteção anticorrosiva e anti-incrustante.",
    icon: "🚢",
    recommendedType: "maritima",
    recommendedProductIds: ["w-thane-srd-501", "w-poxi-ind-322"],
    parts: [
      { id: "casco_superior", name: "Costado / Casco Superior", defaultColor: "#f8fafc" },
      { id: "casco_fundo", name: "Fundo de Casco (Linha d'Água)", defaultColor: "#991b1b" },
      { id: "cabine_deck", name: "Cabine / Superestrutura", defaultColor: "#ffffff" },
      { id: "detalhes_mastro", name: "Mastro e Guardas", defaultColor: "#334155" }
    ],
    technicalAdvice: "Para embarcações, o fundo de casco (abaixo da linha d'água) exige primer epóxi de alta espessura impermeabilizante como barreira de barcos metálicos ou de fibra, seguido por revestimentos de fábrica WEG."
  }
];

export default function ColorSimulator({ products, onAddToCart, onOpenChat }: ColorSimulatorProps) {
  const [selectedEnv, setSelectedEnv] = useState<Environment>(ENVIRONMENTS[0]);
  const [activePartId, setActivePartId] = useState<string>(ENVIRONMENTS[0].parts[0].id);

  // Custom paint state: environment_id -> part_id -> { colorName, hex, priceDelta, productId }
  const [paintedState, setPaintedState] = useState<Record<string, Record<string, {
    colorName: string;
    hex: string;
    priceDelta: number;
    productId: string;
  }>>>({
    sala: {
      parede_principal: { colorName: "Branco Munique WEG", hex: "#f5f5f5", priceDelta: 0, productId: "w-lack-hpd-151" },
      parede_destaque: { colorName: "Cinza Escuro RAL 7024", hex: "#454a50", priceDelta: 8.00, productId: "w-lack-hpd-151" },
    },
    fachada: {
      fachada_parede: { colorName: "Branco Munique WEG", hex: "#f5f5f5", priceDelta: 0, productId: "w-thane-srd-501" },
      vigas_telhado: { colorName: "Cinza Médio RAL 7001", hex: "#8a9597", priceDelta: 10.00, productId: "w-thane-srd-501" },
    },
    galpao: {
      estrutura_viga: { colorName: "Azul Segurança RAL 5005", hex: "#0f4c81", priceDelta: 15.00, productId: "w-thane-srd-501" },
      piso_epoxi: { colorName: "Cinza Claro RAL 7035", hex: "#d3d3d3", priceDelta: 0, productId: "w-poxi-ind-322" },
    },
    embarcacao: {
      casco_superior: { colorName: "Branco Segurança", hex: "#ffffff", priceDelta: 5.00, productId: "w-poxi-ind-322" },
      casco_fundo: { colorName: "Vermelho Segurança RAL 3000", hex: "#af1024", priceDelta: 25.00, productId: "w-thane-srd-501" },
    }
  });

  // Selected paint product for application
  const paintProducts = products.filter(p => p.isPaint);
  const [activeProductId, setActiveProductId] = useState<string>(
    paintProducts.length > 0 ? paintProducts[0].id : ""
  );

  const selectedProduct = products.find(p => p.id === activeProductId);
  const activePartName = selectedEnv.parts.find(p => p.id === activePartId)?.name || "Selecione uma área";

  // Apply a color to the currently selected part
  const handleApplyColor = (color: ProductColor) => {
    if (!selectedProduct) return;

    setPaintedState(prev => {
      const envState = prev[selectedEnv.id] || {};
      return {
        ...prev,
        [selectedEnv.id]: {
          ...envState,
          [activePartId]: {
            colorName: color.name,
            hex: color.hex,
            priceDelta: color.priceDelta,
            productId: selectedProduct.id
          }
        }
      };
    });
  };

  // Get current visual color for a part
  const getPartColor = (partId: string) => {
    const custom = paintedState[selectedEnv.id]?.[partId];
    if (custom) return custom.hex;
    return selectedEnv.parts.find(p => p.id === partId)?.defaultColor || "#cccccc";
  };

  const getPartDetails = (partId: string) => {
    return paintedState[selectedEnv.id]?.[partId];
  };

  // Reset current environment simulation to default colors
  const handleReset = () => {
    setPaintedState(prev => {
      const copy = { ...prev };
      delete copy[selectedEnv.id];
      return copy;
    });
  };

  // Add the currently configured paint to the cart
  const handleAddConfiguredToCart = (partId: string) => {
    const config = getPartDetails(partId);
    if (!config) {
      alert("Por favor, selecione uma cor de tinta WEG para esta parede ou peça primeiro!");
      return;
    }

    const prod = products.find(p => p.id === config.productId);
    if (!prod) return;

    const selectedColor: ProductColor = {
      name: config.colorName,
      hex: config.hex,
      priceDelta: config.priceDelta
    };

    onAddToCart(prod, 1, selectedColor);
  };

  // Generate a prompt for our chatbot
  const handleAskAI = () => {
    const configList = selectedEnv.parts
      .map(part => {
        const config = getPartDetails(part.id);
        if (config) {
          const prod = products.find(p => p.id === config.productId);
          return `- ${part.name} pintado(a) com ${prod?.name || "Tinta WEG"} na cor "${config.colorName}" (Hex: ${config.hex}).`;
        }
        return `- ${part.name} na cor padrão.`;
      })
      .join("\n");

    const message = `Olá! Acabei de utilizar o simulador de cores da Canal Visual para o ambiente "${selectedEnv.name}". Configurei o seguinte esquema técnico de pintura:\n\n${configList}\n\nCom base nas especificações de secagem e resistência química da WEG, esse esquema é o mais recomendado para esse substrato? Preciso aplicar algum primer ou catalisador específico para este caso?`;

    onOpenChat(message);
  };

  return (
    <div id="simulador-cores-secao" className="max-w-7xl mx-auto px-4 py-8 space-y-10 font-sans">

      {/* Header and Brand Presentation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-150 pb-8">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-[#005792] px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
            <Paintbrush className="h-3 w-3" /> Simulador Digital WEG Tintas
          </div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight leading-tight">
            Simulador de Cores e Ambiente Virtual Canal Visual
          </h1>
          <p className="text-sm text-gray-500 font-normal leading-relaxed">
            Escolha uma tonalidade oficial de fábrica da WEG e visualize-a instantaneamente aplicada em superfícies reais. Alterne entre ambientes industriais, civis ou marítimos e obtenha o cálculo exato do preço e das demãos necessárias.
          </p>
        </div>

        {/* Environment Quick Switcher Cards */}
        <div className="flex flex-wrap gap-2.5">
          {ENVIRONMENTS.map((env) => (
            <button
              key={env.id}
              onClick={() => {
                setSelectedEnv(env);
                setActivePartId(env.parts[0].id);
                // Switch default product recommended for this environment
                if (env.recommendedProductIds.length > 0) {
                  setActiveProductId(env.recommendedProductIds[0]);
                }
              }}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-3 w-full sm:w-auto sm:min-w-[190px] ${selectedEnv.id === env.id ? "bg-white border-[#005792] shadow-md ring-2 ring-blue-100" : "bg-white/60 hover:bg-white border-gray-200"}`}
            >
              <span className="text-2xl p-1.5 bg-slate-50 rounded-xl">{env.icon}</span>
              <div>
                <h4 className="text-xs font-extrabold text-gray-800 tracking-tight leading-none mb-1">{env.name}</h4>
                <p className="text-[10px] text-gray-400 capitalize">{env.recommendedType}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Simulator Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Side: Dynamic Interactive Environment Viewer (SVG Graphics) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-inner relative overflow-hidden flex flex-col justify-between min-h-[440px]">

            {/* Top Toolbar */}
            <div className="flex items-center justify-between z-10">
              <div className="bg-slate-950/70 border border-slate-800 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs text-gray-300 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                Visualizando: <span className="text-white font-extrabold">{selectedEnv.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  title="Restaurar Cores Padrão"
                  className="p-2 rounded-xl bg-slate-950/50 hover:bg-slate-950 text-gray-300 border border-slate-800 transition-colors"
                >
                  <Undo className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* SVG Interactive Canvas */}
            <div className="my-auto flex items-center justify-center p-4">
              {selectedEnv.id === "sala" && (
                <svg viewBox="0 0 500 320" className="w-full max-w-[500px] h-auto drop-shadow-2xl">
                  {/* WALL ACCENT (LEFT STRIPE) */}
                  <rect
                    x="0" y="0" width="120" height="240"
                    fill={getPartColor("parede_destaque")}
                    onClick={() => setActivePartId("parede_destaque")}
                    className={`cursor-pointer transition-colors duration-500 hover:brightness-105 stroke-2 ${activePartId === "parede_destaque" ? "stroke-[#005792]" : "stroke-transparent"}`}
                  />
                  {/* WALL MAIN */}
                  <rect
                    x="120" y="0" width="380" height="240"
                    fill={getPartColor("parede_principal")}
                    onClick={() => setActivePartId("parede_principal")}
                    className={`cursor-pointer transition-colors duration-500 hover:brightness-105 stroke-2 ${activePartId === "parede_principal" ? "stroke-[#005792]" : "stroke-transparent"}`}
                  />
                  {/* FLOORS */}
                  <rect
                    x="0" y="240" width="500" height="80"
                    fill={getPartColor("piso")}
                    onClick={() => setActivePartId("piso")}
                    className={`cursor-pointer transition-colors duration-500 hover:brightness-105 stroke-2 ${activePartId === "piso" ? "stroke-[#005792]" : "stroke-transparent"}`}
                  />
                  {/* SOFA COMPONENT */}
                  <g
                    onClick={() => setActivePartId("sofa")}
                    className={`cursor-pointer transition-all duration-300 hover:brightness-110 ${activePartId === "sofa" ? "filter drop-shadow-[0_0_8px_rgba(0,87,146,0.5)]" : ""}`}
                  >
                    {/* Sofa Cushion Base */}
                    <rect x="150" y="195" width="220" height="50" rx="10" fill={getPartColor("sofa")} />
                    {/* Sofa Left Arm */}
                    <rect x="130" y="180" width="25" height="60" rx="8" fill={getPartColor("sofa")} className="brightness-90" />
                    {/* Sofa Right Arm */}
                    <rect x="365" y="180" width="25" height="60" rx="8" fill={getPartColor("sofa")} className="brightness-90" />
                    {/* Sofa Backrest */}
                    <rect x="150" y="145" width="220" height="55" rx="12" fill={getPartColor("sofa")} className="brightness-95" />
                  </g>
                  {/* Painting Frame */}
                  <rect x="230" y="45" width="90" height="65" rx="4" fill="#1e293b" className="stroke border border-slate-700" />
                  <rect x="235" y="50" width="80" height="55" rx="2" fill="#fff" />
                  <path d="M 245,95 Q 265,65 285,85 T 305,65" fill="none" stroke="#005792" strokeWidth="2" />

                  {/* Floating labels in canvas */}
                  <circle cx="60" cy="120" r="10" fill="#005792" className="animate-pulse opacity-80" />
                  <circle cx="280" cy="120" r="10" fill="#005792" className="animate-pulse opacity-80" />
                  <circle cx="260" cy="210" r="10" fill="#005792" className="animate-pulse opacity-80" />
                </svg>
              )}

              {selectedEnv.id === "fachada" && (
                <svg viewBox="0 0 500 320" className="w-full max-w-[500px] h-auto drop-shadow-2xl">
                  {/* Sky background */}
                  <rect x="0" y="0" width="500" height="320" fill="#0f172a" />

                  {/* Main house wall */}
                  <rect
                    x="90" y="120" width="320" height="150"
                    fill={getPartColor("fachada_parede")}
                    onClick={() => setActivePartId("fachada_parede")}
                    className={`cursor-pointer transition-colors duration-500 hover:brightness-105 stroke-2 ${activePartId === "fachada_parede" ? "stroke-[#005792]" : "stroke-transparent"}`}
                  />

                  {/* Window/Friso trim lines */}
                  <rect
                    x="290" y="140" width="80" height="70"
                    fill={getPartColor("vigas_telhado")}
                    onClick={() => setActivePartId("vigas_telhado")}
                    className={`cursor-pointer transition-colors duration-500 hover:brightness-105 stroke-2 ${activePartId === "vigas_telhado" ? "stroke-[#005792]" : "stroke-transparent"}`}
                  />
                  <rect x="298" y="148" width="64" height="54" fill="#ffffff" />
                  <line x1="330" y1="148" x2="330" y2="202" stroke="#475569" strokeWidth="2" />
                  <line x1="298" y1="175" x2="362" y2="175" stroke="#475569" strokeWidth="2" />

                  {/* Wood Door */}
                  <rect
                    x="150" y="170" width="55" height="100"
                    fill={getPartColor("porta_madeira")}
                    onClick={() => setActivePartId("porta_madeira")}
                    className={`cursor-pointer transition-colors duration-500 hover:brightness-105 stroke-2 ${activePartId === "porta_madeira" ? "stroke-[#005792]" : "stroke-transparent"}`}
                  />
                  <circle cx="160" cy="220" r="3" fill="#fbbf24" />

                  {/* Ground / Sidewalk */}
                  <rect
                    x="0" y="270" width="500" height="50"
                    fill={getPartColor("calcada")}
                    onClick={() => setActivePartId("calcada")}
                    className={`cursor-pointer transition-colors duration-500 hover:brightness-105 stroke-2 ${activePartId === "calcada" ? "stroke-[#005792]" : "stroke-transparent"}`}
                  />

                  {/* Triangle Roof */}
                  <polygon points="70,120 250,30 430,120" fill="#334155" />
                </svg>
              )}

              {selectedEnv.id === "galpao" && (
                <svg viewBox="0 0 500 320" className="w-full max-w-[500px] h-auto drop-shadow-2xl">
                  {/* Warehouse background Wall */}
                  <rect
                    x="0" y="0" width="500" height="230"
                    fill={getPartColor("parede_galpao")}
                    onClick={() => setActivePartId("parede_galpao")}
                    className={`cursor-pointer transition-colors duration-500 hover:brightness-105 stroke-2 ${activePartId === "parede_galpao" ? "stroke-[#005792]" : "stroke-transparent"}`}
                  />

                  {/* Epoxy Floor */}
                  <rect
                    x="0" y="230" width="500" height="90"
                    fill={getPartColor("piso_epoxi")}
                    onClick={() => setActivePartId("piso_epoxi")}
                    className={`cursor-pointer transition-colors duration-500 hover:brightness-105 stroke-2 ${activePartId === "piso_epoxi" ? "stroke-[#005792]" : "stroke-transparent"}`}
                  />

                  {/* Industrial Machinery */}
                  <rect
                    x="320" y="150" width="130" height="90" rx="6"
                    fill={getPartColor("maquinarios")}
                    onClick={() => setActivePartId("maquinarios")}
                    className={`cursor-pointer transition-colors duration-500 hover:brightness-105 stroke-2 ${activePartId === "maquinarios" ? "stroke-[#005792]" : "stroke-transparent"}`}
                  />
                  <circle cx="350" cy="180" r="12" fill="#71717a" className="animate-spin" style={{ transformOrigin: "350px 180px", animationDuration: "10s" }} />
                  <circle cx="390" cy="180" r="18" fill="#52525b" />

                  {/* Heavy Steel Frame Structural Girders */}
                  <g
                    onClick={() => setActivePartId("estrutura_viga")}
                    className={`cursor-pointer transition-colors duration-500 hover:brightness-110 ${activePartId === "estrutura_viga" ? "stroke-[#005792]" : "stroke-transparent"}`}
                  >
                    {/* Beam Columns Left */}
                    <rect x="40" y="0" width="30" height="230" fill={getPartColor("estrutura_viga")} className="stroke-2" />
                    {/* Beam Columns Right */}
                    <rect x="450" y="0" width="30" height="230" fill={getPartColor("estrutura_viga")} className="stroke-2" />
                    {/* Cross Ceiling Beam */}
                    <rect x="0" y="0" width="500" height="35" fill={getPartColor("estrutura_viga")} className="stroke-2 brightness-90" />
                    {/* Truss supports */}
                    <polygon points="70,35 150,35 70,115" fill={getPartColor("estrutura_viga")} className="brightness-75 opacity-70" />
                    <polygon points="450,35 370,35 450,115" fill={getPartColor("estrutura_viga")} className="brightness-75 opacity-70" />
                  </g>
                </svg>
              )}

              {selectedEnv.id === "embarcacao" && (
                <svg viewBox="0 0 500 320" className="w-full max-w-[500px] h-auto drop-shadow-2xl">
                  {/* Sky & Ocean backgrounds */}
                  <rect x="0" y="0" width="500" height="190" fill="#0b1329" />
                  <rect x="0" y="190" width="500" height="130" fill="#1e3a8a" className="opacity-80" />

                  {/* Sea wave details */}
                  <path d="M0,195 Q70,185 140,195 T280,195 T420,195 T500,195 L500,320 L0,320 Z" fill="#1d4ed8" />

                  {/* Superstructure / Cabin / Deck */}
                  <polygon
                    points="140,140 320,140 350,190 120,190"
                    fill={getPartColor("cabine_deck")}
                    onClick={() => setActivePartId("cabine_deck")}
                    className={`cursor-pointer transition-colors duration-500 hover:brightness-105 stroke-2 ${activePartId === "cabine_deck" ? "stroke-[#005792]" : "stroke-transparent"}`}
                  />
                  {/* Cabin Windows */}
                  <rect x="160" y="150" width="40" height="20" fill="#0f172a" rx="3" />
                  <rect x="220" y="150" width="40" height="20" fill="#0f172a" rx="3" />
                  <rect x="280" y="150" width="30" height="20" fill="#0f172a" rx="3" />

                  {/* Costado / Upper Hull */}
                  <path
                    d="M 60,190 L 390,190 C 440,190 460,205 470,225 L 80,225 Z"
                    fill={getPartColor("casco_superior")}
                    onClick={() => setActivePartId("casco_superior")}
                    className={`cursor-pointer transition-colors duration-500 hover:brightness-105 stroke-2 ${activePartId === "casco_superior" ? "stroke-[#005792]" : "stroke-transparent"}`}
                  />

                  {/* Bottom Hull (Antifouling / Antivegetativo layer) */}
                  <path
                    d="M 80,225 L 470,225 C 460,245 440,260 390,260 L 110,260 Z"
                    fill={getPartColor("casco_fundo")}
                    onClick={() => setActivePartId("casco_fundo")}
                    className={`cursor-pointer transition-colors duration-500 hover:brightness-105 stroke-2 ${activePartId === "casco_fundo" ? "stroke-[#005792]" : "stroke-transparent"}`}
                  />

                  {/* Boat Mast */}
                  <rect
                    x="240" y="40" width="8" height="100"
                    fill={getPartColor("detalhes_mastro")}
                    onClick={() => setActivePartId("detalhes_mastro")}
                    className={`cursor-pointer transition-colors duration-500 hover:brightness-105 stroke-2 ${activePartId === "detalhes_mastro" ? "stroke-[#005792]" : "stroke-transparent"}`}
                  />
                </svg>
              )}
            </div>

            {/* Bottom Color Selection Status Indicator */}
            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 z-10 backdrop-blur-md">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Área Selecionada</span>
                <span className="text-sm font-black text-white">{activePartName}</span>
              </div>

              <div className="flex items-center gap-2">
                {getPartDetails(activePartId) ? (
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4.5 h-4.5 rounded-full border border-white/20 block shrink-0"
                      style={{ backgroundColor: getPartColor(activePartId) }}
                    ></span>
                    <div className="text-right">
                      <p className="text-xs font-black text-white leading-none">{getPartDetails(activePartId)?.colorName}</p>
                      <p className="text-[10px] text-blue-400 font-medium mt-0.5">Price Delta: +R$ {getPartDetails(activePartId)?.priceDelta.toFixed(2)}</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic">Cor Padrão</span>
                )}
              </div>
            </div>

          </div>

          {/* Quick Area-picker button menu */}
          <div className="bg-white border border-gray-150 p-4 rounded-3xl flex flex-wrap gap-2 items-center">
            <span className="text-xs font-black text-gray-700 mr-2 flex items-center gap-1">
              <Layers className="h-4 w-4 text-[#005792]" /> Partes:
            </span>
            {selectedEnv.parts.map((part) => (
              <button
                key={part.id}
                onClick={() => setActivePartId(part.id)}
                className={`text-xs py-2 px-4 rounded-xl font-bold transition-all ${activePartId === part.id ? "bg-[#005792] text-white shadow-md shadow-blue-900/10" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
              >
                {part.name}
              </button>
            ))}
          </div>

        </div>

        {/* Right Side: WEG Paint Chooser & Color Palettes */}
        <div className="lg:col-span-5 space-y-6">

          {/* WEG Paint Selection Panel */}
          <div className="bg-white border border-gray-150 rounded-3xl p-6 space-y-6 shadow-xs">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-gray-800 tracking-tight flex items-center gap-2">
                <span>1.</span> Selecione a Linha de Tinta WEG
              </h3>
              <p className="text-xs text-gray-400">Cada produto possui sua respectiva paleta de cores certificada de fábrica.</p>
            </div>

            <div className="space-y-3">
              {paintProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActiveProductId(p.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${activeProductId === p.id ? "border-[#005792] bg-blue-50/15 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                >
                  <span className="text-xl p-2 bg-slate-50 rounded-xl">🎨</span>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-gray-800 tracking-tight leading-snug">{p.name}</span>
                      {activeProductId === p.id && <span className="h-2 w-2 rounded-full bg-[#005792] shrink-0"></span>}
                    </div>
                    <p className="text-[10px] text-gray-400 leading-normal line-clamp-2">{p.summary}</p>
                    <div className="flex items-center gap-3 pt-1 text-[10px] font-bold text-[#005792]">
                      <span>R$ {p.price.toFixed(2)} / Galão</span>
                      <span className="text-gray-300">|</span>
                      <span className="capitalize text-gray-500">Aparência: {p.filters?.brilho}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Palette Chips Grid */}
          <div className="bg-white border border-gray-150 rounded-3xl p-6 space-y-6 shadow-xs">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-gray-800 tracking-tight flex items-center gap-2">
                <span>2.</span> Selecione a Cor da Tinta
              </h3>
              <p className="text-xs text-gray-400">Selecione para pintar a <strong>{activePartName}</strong>.</p>
            </div>

            {selectedProduct && selectedProduct.colors.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {selectedProduct.colors.map((color, idx) => {
                  const isCurrentColorApplied = getPartDetails(activePartId)?.colorName === color.name &&
                                               getPartDetails(activePartId)?.productId === selectedProduct.id;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleApplyColor(color)}
                      className={`p-3.5 rounded-2xl border transition-all text-left flex items-center gap-3 cursor-pointer group ${isCurrentColorApplied ? "border-[#005792] bg-blue-50/10 ring-2 ring-blue-100" : "border-gray-150 hover:border-gray-300 bg-white"}`}
                    >
                      {/* Color Circle preview */}
                      <span
                        className="w-8 h-8 rounded-full border border-gray-200/60 block shrink-0 shadow-sm relative group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: color.hex }}
                      >
                        {isCurrentColorApplied && (
                          <span className="absolute inset-0 flex items-center justify-center text-white bg-slate-900/40 rounded-full">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </span>

                      <div className="flex-1 space-y-0.5 min-w-0">
                        <p className="text-[11px] font-black text-gray-800 leading-tight truncate">{color.name}</p>
                        <p className="text-[9px] text-gray-400 font-bold">
                          {color.priceDelta > 0 ? `+ R$ ${color.priceDelta.toFixed(2)}` : "Sem acréscimo"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                Selecione uma tinta com catálogo de cores acima para liberar a paleta.
              </div>
            )}
          </div>

          {/* Current Configuration Technical Specs & Checkout Panel */}
          {getPartDetails(activePartId) && (
            <div className="bg-blue-50/30 border border-blue-100/50 rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-blue-100/30 pb-3">
                <h4 className="text-xs font-black text-[#005792] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-4 w-4" /> Resumo de Compra do Item
                </h4>
                <span className="text-[10px] bg-[#005792] text-white font-extrabold px-2 py-0.5 rounded-full">WEG Original</span>
              </div>

              {/* Specs List */}
              <div className="text-xs space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span>Tinta Base:</span>
                  <span className="font-extrabold text-gray-800 max-w-[200px] text-right truncate">
                    {products.find(p => p.id === getPartDetails(activePartId)?.productId)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tonalidade Escolhida:</span>
                  <span className="font-extrabold text-gray-800">{getPartDetails(activePartId)?.colorName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Preço Unitário (Base + Cor):</span>
                  <span className="font-extrabold text-[#005792]">
                    R$ {((products.find(p => p.id === getPartDetails(activePartId)?.productId)?.price || 0) + (getPartDetails(activePartId)?.priceDelta || 0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tempo de Secagem (Toque):</span>
                  <span className="font-bold text-gray-700">
                    {products.find(p => p.id === getPartDetails(activePartId)?.productId)?.filters.secagem?.split(",")[0] || "15 min"}
                  </span>
                </div>
              </div>

              {/* Specs Quick Alert */}
              <div className="p-3 bg-white/70 border border-blue-100 rounded-2xl text-[10px] text-gray-500 leading-normal flex gap-2">
                <Clock className="h-4 w-4 text-[#005792] shrink-0 mt-0.5" />
                <span>
                  <strong>Nota de Rendimento:</strong> {products.find(p => p.id === getPartDetails(activePartId)?.productId)?.filters.rendimento}. Recomendamos sempre o uso de solvente e catalisadores indicados pela fábrica WEG para maior longevidade da pintura.
                </span>
              </div>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => handleAddConfiguredToCart(activePartId)}
                  className="w-full bg-[#005792] hover:bg-[#004370] text-white py-3 px-4 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-900/10"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Comprar Esta Cor
                </button>

                <button
                  onClick={handleAskAI}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-blue-300" />
                  Perguntar à IA
                </button>
              </div>
            </div>
          )}

          {/* General Technical Advice Card */}
          <div className="bg-slate-50 border border-gray-150 rounded-3xl p-5 space-y-3.5">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[#005792]" />
              <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Diretriz Técnica Recomendada</h4>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-normal">
              {selectedEnv.technicalAdvice}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
