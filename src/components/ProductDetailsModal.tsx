import React, { useState } from "react";
import { X, Check, ShieldAlert, ShoppingCart, Globe, HeartHandshake, FileBadge, CalendarClock } from "lucide-react";
import { Product, ProductColor, PaintScheme } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAddToCart: (product: Product, quantity: number, selectedColor?: ProductColor) => void;
  allPaintSchemes: PaintScheme[];
}

export default function ProductDetailsModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
  allPaintSchemes,
}: ProductDetailsModalProps) {
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(
    product.isPaint && product.colors && product.colors.length > 0 ? product.colors[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);

  const calculateCurrentPrice = () => {
    if (!selectedColor) return product.price;
    return product.price + selectedColor.priceDelta;
  };

  const matchingSchemes = allPaintSchemes.filter((scheme) =>
    scheme.steps.some((step) => step.productId === product.id)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 px-2">
                <FileBadge className="h-4 w-4 text-[#005792]" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Especificação Técnica Oficial WEG</span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Image and Main Info (col-span-5) */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 relative shadow-inner">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                    {selectedColor && (
                      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-xs border border-gray-200/50 p-2 rounded-xl flex items-center gap-2 shadow-md">
                        <span
                          className="h-6 w-6 rounded-lg border border-gray-300 block shadow-inner"
                          style={{ backgroundColor: selectedColor.hex }}
                        ></span>
                        <div className="text-[11px]">
                          <span className="text-gray-400 block font-normal leading-none">Cor Selecionada:</span>
                          <span className="font-bold text-gray-700 block leading-tight">{selectedColor.name}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* High Priority Specs */}
                  <div className="grid grid-cols-2 gap-3">
                     <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/30">
                        <span className="text-[9px] text-blue-900 font-black uppercase">Linha WEG</span>
                        <p className="text-xs font-bold text-gray-800 truncate">{product.linha_weg || "Industrial"}</p>
                     </div>
                     <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/30">
                        <span className="text-[9px] text-emerald-900 font-black uppercase">Resina</span>
                        <p className="text-xs font-bold text-gray-800 truncate">{product.sistema_resina || "Epóxi"}</p>
                     </div>
                  </div>

                  {/* SEO Box */}
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" /> Google Search Preview
                    </h5>
                    <div className="space-y-1">
                      <span className="text-sm font-semibold text-blue-800 hover:underline cursor-pointer block leading-snug">
                        {product.seo_title || `${product.name} - Canal Visual`}
                      </span>
                      <p className="text-xs text-gray-500 leading-snug font-normal line-clamp-2 italic">
                        {product.seo_description || product.resumo_produto_weg}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: 63 Fields Technical Details (col-span-7) */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-white bg-blue-900 px-2 py-0.5 rounded uppercase">{product.category}</span>
                       <span className="text-[10px] font-bold text-gray-400 uppercase">SKU: {product.sku_cv}</span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-800 leading-tight">{product.name}</h3>
                    <p className="text-xs text-gray-400 font-medium">{product.nome_produto_weg}</p>
                  </div>

                  {/* Quick Summary from 63 fields */}
                  <div className="bg-blue-900 text-white p-5 rounded-2xl shadow-lg space-y-3 relative overflow-hidden">
                     <div className="relative z-10 space-y-1">
                        <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Resumo Técnico WEG</span>
                        <p className="text-sm font-medium leading-relaxed">{product.resumo_produto_weg}</p>
                     </div>
                     <div className="absolute -right-4 -bottom-4 opacity-10">
                        <FileBadge size={100} />
                     </div>
                  </div>

                  {/* Technical Tabs or Groups */}
                  <div className="space-y-4">
                     <h4 className="text-xs font-black text-gray-800 uppercase border-b border-gray-100 pb-2 flex items-center gap-2">
                        <Settings className="h-4 w-4" /> Especificações Técnicas Completas
                     </h4>

                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                        {[
                           { label: "Aplicação", val: product.superficie_aplicacao },
                           { label: "Preparação", val: product.preparacao_superficie },
                           { label: "Sólidos Volume", val: product.solidos_volume },
                           { label: "Secagem Toque", val: product.secagem_toque_25 },
                           { label: "Secagem Manuseio", val: product.secagem_ao_manuseio_25 },
                           { label: "Secagem Final", val: product.secagem_final_25 },
                           { label: "Espessura Seca", val: `${product.espessura_por_demao_minima_seca} - ${product.espessura_por_demao_maxima_seca} µm` },
                           { label: "Acabamento", val: product.acabamento_pintura },
                           { label: "Brilho", val: `${product.escala_brilho_minima} a ${product.escala_brilho_maxima}` },
                           { label: "Vida Útil Mistura", val: product.vida_util_mistura_25 },
                           { label: "Diluição Máxima", val: product.diluicao_maxima_volume },
                           { label: "Comp. B", val: product.componente_b },
                        ].map((item, idx) => (
                           <div key={idx} className="space-y-0.5">
                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{item.label}</span>
                              <p className="text-xs font-bold text-gray-700 leading-tight">{item.val || "Consultar Ficha"}</p>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Colors */}
                  {product.isPaint && product.colors && product.colors.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                        Paleta de Cores Disponíveis (Acréscimos Automáticos)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((color, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className={`flex items-center gap-2 p-1.5 pr-3 rounded-full border-2 transition-all text-xs ${selectedColor?.name === color.name ? "border-[#005792] bg-blue-50 text-[#005792] font-bold" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                          >
                            <span
                              className="h-5 w-5 rounded-full border border-gray-300 shadow-inner flex items-center justify-center shrink-0"
                              style={{ backgroundColor: color.hex }}
                            >
                              {selectedColor?.name === color.name && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </span>
                            <span>{color.name}</span>
                            {color.priceDelta > 0 && (
                              <span className="text-[10px] text-[#005792] font-black">
                                +R${color.priceDelta.toFixed(0)}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add to Cart Footer */}
                  <div className="pt-6 mt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-6">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Valor Unitário</span>
                      <span className="text-3xl font-black text-gray-800">
                        R$ {calculateCurrentPrice().toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center border-2 border-gray-100 rounded-2xl bg-white overflow-hidden shadow-sm">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-4 py-2 hover:bg-gray-50 text-gray-400 transition-colors font-bold text-lg"
                        >-</button>
                        <span className="px-4 py-2 font-black text-gray-700 min-w-[3rem] text-center">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-4 py-2 hover:bg-gray-50 text-gray-400 transition-colors font-bold text-lg"
                        >+</button>
                      </div>

                      <button
                        onClick={() => { onAddToCart(product, quantity, selectedColor); onClose(); }}
                        className="bg-blue-900 hover:bg-blue-800 text-white font-black py-3.5 px-8 rounded-2xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
                      >
                        <ShoppingCart className="h-5 w-5" /> Colocar na Sacola
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Painting Schemes Connection */}
              {matchingSchemes.length > 0 && (
                <div className="pt-8 border-t border-gray-100 space-y-4">
                  <h4 className="text-sm font-black text-gray-800 flex items-center gap-2 uppercase tracking-tight">
                    <HeartHandshake className="h-5 w-5 text-[#005792]" /> Esquemas de Pintura Protetiva Homologados
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchingSchemes.map((scheme) => (
                      <div key={scheme.id} className="p-5 bg-blue-50/30 rounded-3xl border border-blue-100/50 space-y-3 hover:bg-blue-50 transition-colors cursor-default">
                        <div className="flex justify-between items-start">
                           <span className="text-[10px] font-black text-[#005792] bg-white border border-blue-100 px-3 py-1 rounded-full uppercase">
                             {scheme.surface}
                           </span>
                           <span className="text-[10px] font-bold text-gray-400 uppercase">{scheme.steps.length} Etapas</span>
                        </div>
                        <h5 className="font-bold text-base text-gray-800 leading-tight">{scheme.name}</h5>
                        <p className="text-xs text-gray-500 font-normal leading-relaxed">{scheme.description}</p>

                        <div className="pt-3 border-t border-blue-100 flex gap-2 items-center">
                           {scheme.steps.map((step, idx) => (
                             <div key={idx} className="flex items-center gap-1">
                               <span className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] ${step.productId === product.id ? "bg-blue-900 text-white" : "bg-white text-blue-900 border border-blue-100"}`}>{idx + 1}</span>
                               {idx < scheme.steps.length - 1 && <ArrowRight size={10} className="text-blue-200" />}
                             </div>
                           ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Support Components
const Settings = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const ArrowRight = ({ size, className }: { size?: number, className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>;
