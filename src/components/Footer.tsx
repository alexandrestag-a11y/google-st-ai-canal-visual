import React from "react";
import { Shield, Award, HelpCircle, PhoneCall, Globe2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 font-sans border-t border-gray-800 shrink-0">
      {/* Top Value Propositions */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-gray-800 text-sm">
        <div className="flex items-start gap-3">
          <Award className="h-10 w-10 text-[#005792] shrink-0 mt-0.5" />
          <div>
            <h5 className="font-bold text-white text-sm">Distribuidor Autorizado WEG</h5>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Fornecemos tintas industriais, epóxi, poliuretano e marítimas legítimas, vindas direto da fábrica da WEG.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Shield className="h-10 w-10 text-[#005792] shrink-0 mt-0.5" />
          <div>
            <h5 className="font-bold text-white text-sm">Qualidade Industrial e Marítima</h5>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Produtos testados em ambientes severos contra intemperismo, corrosão e abrasão química pesada.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <PhoneCall className="h-10 w-10 text-[#005792] shrink-0 mt-0.5" />
          <div>
            <h5 className="font-bold text-white text-sm">Suporte Técnico de Especialistas</h5>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Consulte nossos engenheiros e químicos para especificar o esquema de pintura ideal para o seu substrato.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
        {/* Brand column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-[#005792] text-white font-extrabold flex items-center justify-center border border-blue-400">
              CV
            </span>
            <div className="flex flex-col">
              <span className="font-black text-white text-sm tracking-tight leading-none">Canal Visual</span>
              <span className="text-[9px] uppercase tracking-wider text-blue-400 font-extrabold mt-1">Revenda Autorizada WEG</span>
            </div>
          </div>
          <p className="text-gray-400 leading-relaxed font-normal">
            Soluções completas em revestimentos protetivos industriais, tintas prediais de alto padrão, acessórios e catalisadores.
          </p>
        </div>

        {/* Categories Column */}
        <div className="space-y-3">
          <h6 className="font-bold text-white text-xs uppercase tracking-wider">Produtos WEG</h6>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#loja" className="hover:text-blue-400 transition-colors">Esmaltes Poliuretanos (PU)</a></li>
            <li><a href="#loja" className="hover:text-blue-400 transition-colors">Revestimentos Epóxi</a></li>
            <li><a href="#loja" className="hover:text-blue-400 transition-colors">Esmaltes Sintéticos Alquídicos</a></li>
            <li><a href="#loja" className="hover:text-blue-400 transition-colors">Catalisadores e Diluentes</a></li>
          </ul>
        </div>

        {/* Sitemap / Tree Column */}
        <div className="space-y-3">
          <h6 className="font-bold text-white text-xs uppercase tracking-wider">Site Hierárquico</h6>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#segmentos" className="hover:text-blue-400 transition-colors">Segmentos de Mercado</a></li>
            <li><a href="#esquemas-pintura" className="hover:text-blue-400 transition-colors">Esquemas de Pintura</a></li>
            <li><a href="#loja" className="hover:text-blue-400 transition-colors">Catálogo Completo</a></li>
            <li><a href="/sitemap.xml" target="_blank" className="text-blue-400 hover:underline">sitemap.xml Dinâmico</a></li>
          </ul>
        </div>

        {/* Contact info column */}
        <div className="space-y-3">
          <h6 className="font-bold text-white text-xs uppercase tracking-wider">Canal Visual Matriz</h6>
          <p className="text-gray-400 leading-relaxed font-normal">
            Rua das Tintas, 1000 - Zona Industrial<br />
            Joinville - SC, CEP 89200-000<br />
            Telefone: (47) 3456-7890<br />
            Email: comercial@canalvisual.com.br
          </p>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="bg-gray-950 py-6 text-center text-[10px] text-gray-500 font-normal border-t border-gray-900 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span>
            &copy; {new Date().getFullYear()} Canal Visual Ltda. CNPJ: 12.345.678/0001-90. Todos os direitos reservados.
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Globe2 className="h-3 w-3 text-blue-500" /> Brasil | Português</span>
            <span className="text-gray-700">|</span>
            <span>Revendedor Autorizado de Tintas WEG Tintas</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
