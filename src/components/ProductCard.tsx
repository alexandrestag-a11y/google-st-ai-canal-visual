import React from "react";
import { Product } from "../types";
import { Hammer, ShoppingCart, Tag } from "lucide-react";
import { motion } from "motion/react";

interface ProductCardProps {
  key?: string;
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCartDirect: (product: Product) => void;
}

export default function ProductCard({ product, onViewDetails, onAddToCartDirect }: ProductCardProps) {
  return (
    <motion.div
      id={`prod-card-${product.id}`}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col font-sans h-full group"
    >
      {/* Product Image & Badge */}
      <div className="relative aspect-video w-full bg-gray-100 overflow-hidden shrink-0">
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 bg-[#005792] text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm backdrop-blur-xs">
          <Tag className="h-3 w-3" />
          WEG Oficial
        </div>
        {product.isPaint && product.colors.length > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 p-1 px-1.5 rounded-md backdrop-blur-xs text-white">
            <span className="text-[9px] uppercase font-bold leading-none shrink-0">Cores:</span>
            <div className="flex gap-0.5">
              {product.colors.slice(0, 4).map((c, i) => (
                <span
                  key={i}
                  className="h-2.5 w-2.5 rounded-full border border-white/40 block"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                ></span>
              ))}
              {product.colors.length > 4 && (
                <span className="text-[8px] font-extrabold leading-none pl-0.5">+{product.colors.length - 4}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="text-[10px] text-[#005792] font-bold uppercase tracking-wider">
            {product.category}
          </div>
          <h4
            onClick={() => onViewDetails(product)}
            className="text-sm font-bold text-gray-800 leading-snug line-clamp-2 hover:text-[#005792] cursor-pointer transition-colors"
          >
            {product.name}
          </h4>
          <p className="text-xs text-gray-500 line-clamp-2 font-normal leading-relaxed">
            {product.summary}
          </p>
        </div>

        {/* Pricing and Action */}
        <div className="pt-4 mt-3 border-t border-gray-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-medium">A partir de</span>
            <span className="text-sm font-black text-gray-800">
              R$ {product.price.toFixed(2)}
            </span>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => onViewDetails(product)}
              className="text-[#005792] bg-blue-50 hover:bg-blue-100/80 p-2 rounded-xl transition-colors text-xs font-bold px-3.5"
            >
              Ficha
            </button>
            <button
              onClick={() => onAddToCartDirect(product)}
              className="bg-[#005792] hover:bg-[#004370] text-white p-2 rounded-xl transition-colors flex items-center justify-center shadow-xs"
              title="Adicionar Direto ao Carrinho"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
