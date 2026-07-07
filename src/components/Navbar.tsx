import React, { useState } from "react";
import { ShoppingCart, Search, User, LogOut, ChevronDown, Award, Trash2, FolderCode, FileSpreadsheet, ShieldAlert, Paintbrush } from "lucide-react";
import { Page, CartItem, User as UserType } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface NavbarProps {
  pages: Page[];
  activePageId: string;
  onPageSelect: (pageId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartItems: CartItem[];
  cartTotal: number;
  onRemoveFromCart: (idx: number) => void;
  onCheckout: () => void;
  activeUser: UserType | null;
  allUsers: UserType[];
  onUserSelect: (user: UserType) => void;
  onViewAdmin: () => void;
  isAdminActive: boolean;
}

export default function Navbar({
  pages,
  activePageId,
  onPageSelect,
  searchQuery,
  onSearchChange,
  cartItems,
  cartTotal,
  onRemoveFromCart,
  onCheckout,
  activeUser,
  allUsers,
  onUserSelect,
  onViewAdmin,
  isAdminActive,
}: NavbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCartMenu, setShowCartMenu] = useState(false);

  // Group pages into root pages and subpages based on path hierarchy or parentId
  const rootPages = pages.filter((p) => p.parentId === null).sort((a, b) => a.order - b.order);

  const getSubpages = (parentId: string) => {
    return pages.filter((p) => p.parentId === parentId).sort((a, b) => a.order - b.order);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 font-sans shadow-xs shrink-0">
      {/* Top Banner - Weg Authorization details */}
      <div className="bg-[#005792] text-white text-[11px] py-1.5 px-6 flex items-center justify-between font-medium">
        <span className="flex items-center gap-1.5">
          <Award className="h-3.5 w-3.5 text-yellow-400" />
          Canal Visual - Revendedora Autorizada de Tintas Industriais e Marítimas WEG
        </span>
        <div className="flex items-center gap-4 text-blue-200">
          <span>(47) 3456-7890</span>
          <span>|</span>
          <span>comercial@canalvisual.com.br</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div
          onClick={() => {
            onPageSelect("home");
            if (isAdminActive) onViewAdmin(); // toggle off admin
          }}
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
        >
          <span className="h-9 w-9 rounded-xl bg-[#005792] text-white font-extrabold flex items-center justify-center border border-blue-400 shadow-md">
            CV
          </span>
          <div className="flex flex-col">
            <span className="font-black text-gray-800 text-sm tracking-tight leading-none">Canal Visual</span>
            <span className="text-[9px] uppercase tracking-wider text-[#005792] font-extrabold mt-1">Revenda Autorizada WEG</span>
          </div>
        </div>

        {/* Dynamic Tree Navigation Menu */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-gray-600">
          {rootPages.map((page) => {
            const subpages = getSubpages(page.id);
            const hasSubpages = subpages.length > 0;

            return (
              <div key={page.id} className="relative group/nav py-5">
                <button
                  type="button"
                  onClick={() => {
                    onPageSelect(page.id);
                  }}
                  className={`flex items-center gap-1 transition-colors hover:text-[#005792] focus:outline-none ${activePageId === page.id && !isAdminActive ? "text-[#005792] font-extrabold" : ""}`}
                >
                  {page.title}
                  {hasSubpages && <ChevronDown className="h-3.5 w-3.5 text-gray-400 group-hover/nav:rotate-180 transition-transform duration-200" />}
                </button>

                {/* Subpage tree dropdown menu */}
                {hasSubpages && (
                  <div className="absolute top-14 left-0 w-56 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-gray-100 p-2 opacity-0 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:pointer-events-auto transition-all duration-150 transform translate-y-1 group-hover/nav:translate-y-0 space-y-1">
                    {subpages.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          onPageSelect(sub.id);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl hover:bg-blue-50/50 text-xs font-bold block transition-all ${activePageId === sub.id && !isAdminActive ? "text-[#005792] bg-blue-50" : "text-gray-700"}`}
                      >
                        {sub.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Static Color Simulator Tab */}
          <button
            type="button"
            onClick={() => {
              onPageSelect("simulador");
            }}
            className={`flex items-center gap-1.5 transition-colors hover:text-[#005792] focus:outline-none py-5 cursor-pointer ${activePageId === "simulador" && !isAdminActive ? "text-[#005792] font-extrabold" : ""}`}
          >
            <Paintbrush className="h-4 w-4 text-[#005792]" />
            Simulador de Cores
          </button>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-full px-4 py-1.5 flex-1 max-w-xs focus-within:border-blue-300 transition-colors">
          <Search className="h-4 w-4 text-gray-400 mr-2 shrink-0" />
          <input
            id="input-nav-search"
            type="text"
            placeholder="Buscar tintas WEG, rolos..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-transparent text-xs text-gray-700 font-normal outline-none w-full"
          />
        </div>

        {/* User, Cart and Simulation switcher */}
        <div className="flex items-center gap-3">
          {/* Simulation Tools for easier demonstration */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 bg-blue-50 border border-blue-100/30 rounded-full py-1.5 px-3 hover:bg-blue-100/50 transition-colors text-xs font-bold text-[#005792]"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Simulador: {activeUser?.role === "admin" ? "Admin" : "Cliente"}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl shadow-xl p-3 space-y-3 z-50 animate-fadeIn">
                <div className="border-b border-gray-100 pb-2">
                  <h4 className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider">Alternar Usuário</h4>
                  <p className="text-[9px] text-gray-400 font-normal mt-0.5">Alterne para testar fluxos de Cliente ou Administração</p>
                </div>
                <div className="space-y-1">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        u.role === "admin" ? onUserSelect(u) : onUserSelect(u);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs transition-colors ${activeUser?.id === u.id ? "bg-[#005792] text-white" : "hover:bg-gray-50 text-gray-700"}`}
                    >
                      <img src={u.avatar} alt={u.name} className="h-6 w-6 rounded-full object-cover border border-white/20" />
                      <div className="flex flex-col">
                        <span className="font-bold">{u.name}</span>
                        <span className={`text-[9px] font-semibold uppercase ${activeUser?.id === u.id ? "text-blue-200" : "text-gray-400"}`}>
                          {u.role === "admin" ? "Administrador" : "Cliente"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {activeUser?.role === "admin" && (
                  <button
                    onClick={() => {
                      onViewAdmin();
                      setShowUserMenu(false);
                    }}
                    className="w-full bg-[#005792] text-white p-2.5 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 hover:bg-[#004370] transition-colors"
                  >
                    <FolderCode className="h-4 w-4" />
                    {isAdminActive ? "Ir para Loja" : "Painel Administrativo"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Shopping Cart Trigger */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowCartMenu(!showCartMenu)}
              className="p-2.5 rounded-full hover:bg-gray-100 transition-colors relative"
              title="Sacola de Compras"
            >
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              {cartItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white font-black text-[9px] h-4.5 w-4.5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
                </span>
              )}
            </button>

            {/* Shopping Cart Preview Dropdown */}
            <AnimatePresence>
              {showCartMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl shadow-xl p-4 space-y-4 z-50 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="font-bold text-gray-800 text-sm">Meu Carrinho</span>
                    <span className="text-[10px] text-gray-400 font-semibold">{cartItems.length} itens</span>
                  </div>

                  {cartItems.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-400">
                      Sua sacola de tintas WEG está vazia.
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                        {cartItems.map((item, idx) => (
                          <div key={idx} className="flex gap-2.5 items-start text-xs border-b border-gray-100/50 pb-2">
                            <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover bg-gray-50 border shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-gray-800 truncate leading-snug">{item.name}</h5>
                              {item.colorName && <span className="text-[9px] text-gray-400 block font-normal">Cor: {item.colorName}</span>}
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-[10px] text-gray-500 font-medium">{item.quantity}x R$ {item.price.toFixed(2)}</span>
                                <button onClick={() => onRemoveFromCart(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex justify-between text-xs font-bold text-gray-800">
                          <span>Total Geral</span>
                          <span className="text-sm text-[#005792]">R$ {cartTotal.toFixed(2)}</span>
                        </div>

                        <button
                          onClick={() => {
                            setShowCartMenu(false);
                            onCheckout();
                          }}
                          className="w-full bg-[#005792] hover:bg-[#004370] text-white font-bold py-2 px-4 rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                          Finalizar Pedido
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}
