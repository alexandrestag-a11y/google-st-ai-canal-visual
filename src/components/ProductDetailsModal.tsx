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
    product.isPaint && product.colors.length > 0 ? product.colors[0] : undefined
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
            className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2">Ficha Detalhada do Produto</span>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left - Image & Swatch Preview */}
                <div className="space-y-4">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 relative">
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
                          <span className="text-gray-400 block font-normal leading-none">Cor Ativa:</span>
                          <span className="font-bold text-gray-700 block leading-tight">{selectedColor.name}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tray Commerce SEO Box */}
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 space-y-2">
                    <h5 className="text-[10px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" /> Pré-visualização Google SEO (Padrão Tray)
                    </h5>
                    <div className="space-y-1">
                      {/* Google Search Result Mock */}
                      <span className="text-sm font-semibold text-blue-800 hover:underline cursor-pointer block leading-snug">
                        {product.seo?.title || `${product.name} - Canal Visual`}
                      </span>
                      <span className="text-[11px] text-green-700 block truncate leading-none">
                        https://canalvisual.com.br/produtos/{product.id}
                      </span>
                      <p className="text-xs text-gray-500 leading-snug font-normal line-clamp-2">
                        {product.seo?.description || product.summary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right - Details and Cart Selector */}
                <div className="space-y-6">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#005792] uppercase tracking-widest">{product.category}</span>
                    <h3 className="text-xl font-bold text-gray-800 leading-tight">{product.name}</h3>
                  </div>

                  <p className="text-sm text-gray-600 font-normal leading-relaxed">{product.description}</p>

                  {/* Specifications Grid */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 grid grid-cols-2 gap-3 text-xs">
                    {Object.entries(product.filters || {}).map(([key, value]) => (
                      <div key={key} className="space-y-0.5">
                        <span className="text-gray-400 font-medium capitalize">{key}:</span>
                        <p className="font-bold text-gray-800">{value as string}</p>
                      </div>
                    ))}
                  </div>

                  {/* Color Selector */}
                  {product.isPaint && product.colors.length > 0 && (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                        Selecione a Cor WEG (Valores Ajustados)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((color, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className={`flex items-center gap-2 p-1.5 pr-3 rounded-full border-2 transition-all text-xs ${selectedColor?.name === color.name ? "border-[#005792] bg-blue-50/20 text-[#005792] font-bold" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                          >
                            <span
                              className="h-5 w-5 rounded-full border border-gray-300 shadow-inner flex items-center justify-center shrink-0"
                              style={{ backgroundColor: color.hex }}
                            >
                              {selectedColor?.name === color.name && (
                                <Check className="h-3 w-3 text-white filter drop-shadow-xs" />
                              )}
                            </span>
                            <span>{color.name}</span>
                            {color.priceDelta > 0 && (
                              <span className="text-[10px] text-[#005792] bg-blue-100/50 px-1.5 py-0.5 rounded-full">
                                +R$ {color.priceDelta.toFixed(2)}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price and Cart controls */}
                  <div className="pt-6 border-t border-gray-100 flex items-end justify-between">
                    <div>
                      <span className="text-xs text-gray-400 font-medium block">Preço Final</span>
                      <span className="text-2xl font-black text-gray-800">
                        R$ {calculateCurrentPrice().toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden text-sm">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3 py-2 hover:bg-gray-100 text-gray-600 transition-colors font-bold"
                        >
                          -
                        </button>
                        <span className="px-3 py-2 font-bold text-gray-700 min-w-[2rem] text-center">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-3 py-2 hover:bg-gray-100 text-gray-600 transition-colors font-bold"
                        >
                          +
                        </button>
                      </div>

                      {/* Add to Cart button */}
                      <button
                        onClick={() => {
                          onAddToCart(product, quantity, selectedColor);
                          onClose();
                        }}
                        className="bg-[#005792] hover:bg-[#004370] text-white font-bold py-2.5 px-6 rounded-xl shadow-md flex items-center gap-2 transition-colors text-sm"
                      >
                        <ShoppingCart className="h-4.5 w-4.5" /> Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Painting Schemes Connection */}
              {matchingSchemes.length > 0 && (
                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    <HeartHandshake className="h-4.5 w-4.5 text-[#005792]" /> Esquemas de Pintura Recomendados para este Produto
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchingSchemes.map((scheme) => (
                      <div key={scheme.id} className="p-4 bg-[#005792]/5 rounded-2xl border border-[#005792]/20 space-y-2">
                        <span className="text-[10px] font-bold text-[#005792] bg-blue-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Superfície: {scheme.surface}
                        </span>
                        <h5 className="font-bold text-sm text-gray-800">{scheme.name}</h5>
                        <p className="text-xs text-gray-500 font-normal line-clamp-2">{scheme.description}</p>
                        
                        {/* Step overview */}
                        <div className="pt-2 border-t border-[#005792]/10">
                          <span className="text-[10px] font-semibold text-gray-400 block mb-1">Etapas do Esquema:</span>
                          <div className="flex gap-2 items-center text-[10px] font-bold text-gray-600">
                            {scheme.steps.map((step, idx) => (
                              <div key={idx} className="flex items-center gap-1">
                                <span className="bg-[#005792] text-white rounded-full h-4 w-4 flex items-center justify-center font-mono text-[9px] shrink-0">{idx + 1}</span>
                                <span className={step.productId === product.id ? "text-[#005792] underline" : ""}>
                                  {step.productType === "primer" ? "Primer" : step.productType === "acabamento" ? "Acabamento" : "Interm."}
                                </span>
                                {idx < scheme.steps.length - 1 && <span className="text-gray-300">→</span>}
                              </div>
                            ))}
                          </div>
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
