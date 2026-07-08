import React, { useState } from "react";
import { Folder, ChevronRight, ChevronDown, MoveUp, MoveDown, Edit2, Trash2, Plus, CornerDownRight, FileText } from "lucide-react";
import { motion } from "motion/react";

interface TreeNode {
  id: string;
  name: string;
  parentId: string | null;
  order: number;
  type?: string;
  slug?: string;
}

interface SitemapTreeProps {
  nodes: TreeNode[];
  onAdd: (parentId: string | null) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onReparent: (id: string, newParentId: string | null) => void;
  nodeTypeLabel?: string;
  isMedia?: boolean;
}

export default function SitemapTree({
  nodes,
  onAdd,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onReparent,
  nodeTypeLabel = "Item",
  isMedia = false,
}: SitemapTreeProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Build hierarchical tree
  const buildTree = (parentId: string | null): any[] => {
    return nodes
      .filter((n) => n.parentId === parentId)
      .sort((a, b) => a.order - b.order)
      .map((node) => ({
        ...node,
        children: buildTree(node.id),
      }));
  };

  const rootNodes = buildTree(null);

  // Render a node and its recursive children
  const renderNode = (node: any, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = !!expanded[node.id];

    // Find other possible parents for moving this node (avoiding cyclic reparenting)
    const possibleParents = nodes.filter((n) => {
      // Cannot parent to self
      if (n.id === node.id) return false;
      // Cannot parent to its own child/descendant
      const isDescendant = (parentCheckId: string | null, targetId: string): boolean => {
        if (!parentCheckId) return false;
        if (parentCheckId === targetId) return true;
        const parentNode = nodes.find((x) => x.id === parentCheckId);
        return isDescendant(parentNode ? parentNode.parentId : null, targetId);
      };
      if (isDescendant(n.id, node.id)) return false;
      return true;
    });

    return (
      <div key={node.id} className="select-none font-sans">
        {/* Row Container */}
        <div
          className="flex items-center justify-between py-2.5 px-4 rounded-xl hover:bg-blue-50/40 transition-colors border-b border-gray-100/50 group"
          style={{ paddingLeft: `${Math.max(16, depth * 28)}px` }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Expand / Collapse trigger */}
            <button
              type="button"
              onClick={() => toggleExpand(node.id)}
              className={`p-1 rounded-md hover:bg-gray-100 transition-colors ${hasChildren ? "opacity-100" : "opacity-30 pointer-events-none"}`}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>

            {/* Folder/Page Icon */}
            {isMedia ? (
              <Folder className="h-4.5 w-4.5 text-[#005792] shrink-0" />
            ) : node.slug ? (
              <FileText className="h-4.5 w-4.5 text-[#005792] shrink-0" />
            ) : (
              <Folder className="h-4.5 w-4.5 text-[#005792] shrink-0" />
            )}

            {/* Node Info */}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-gray-800 truncate leading-snug">
                {node.name}
              </span>
              {node.slug && (
                <span className="text-[10px] text-gray-400 font-mono truncate leading-none mt-0.5">
                  /{node.slug}
                </span>
              )}
            </div>
          </div>

          {/* Controls - visible on hover & focus */}
          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Move Up */}
            <button
              onClick={() => onMoveUp(node.id)}
              title="Mover para Cima"
              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <MoveUp className="h-3.5 w-3.5" />
            </button>

            {/* Move Down */}
            <button
              onClick={() => onMoveDown(node.id)}
              title="Mover para Baixo"
              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <MoveDown className="h-3.5 w-3.5" />
            </button>

            {/* Reparent Select */}
            {possibleParents.length > 0 && (
              <select
                id={`select-parent-${node.id}`}
                value={node.parentId || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  onReparent(node.id, val === "" ? null : val);
                }}
                title="Mover de Nível"
                className="text-[10px] bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-500 focus:outline-none focus:border-[#005792]"
              >
                <option value="">Nível Raiz</option>
                {possibleParents.map((p) => (
                  <option key={p.id} value={p.id}>
                    Mover p/ {p.name}
                  </option>
                ))}
              </select>
            )}

            {/* Edit */}
            <button
              onClick={() => onEdit(node.id)}
              title="Editar"
              className="p-1 text-[#005792] hover:text-[#004370] hover:bg-blue-50 rounded transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete(node.id)}
              title="Excluir"
              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>

            {/* Add Child */}
            <button
              onClick={() => {
                setExpanded((prev) => ({ ...prev, [node.id]: true }));
                onAdd(node.id);
              }}
              title={`Adicionar sub-${nodeTypeLabel.toLowerCase()}`}
              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors flex items-center"
            >
              <Plus className="h-3.5 w-3.5" />
              <CornerDownRight className="h-2.5 w-2.5 -ml-0.5" />
            </button>
          </div>
        </div>

        {/* Render nested children */}
        {isExpanded && node.children && (
          <div className="relative">
            {/* Hierarchical guide line */}
            <div
              className="absolute left-[23px] top-0 bottom-4 w-0.5 bg-blue-100"
              style={{ left: `${depth * 28 + 23}px` }}
            ></div>
            {node.children.map((child: any) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border border-gray-100 rounded-2xl bg-white shadow-xs divide-y divide-gray-100 overflow-hidden">
      {/* Root actions banner */}
      <div className="p-3 bg-gray-50 flex items-center justify-between border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Estrutura em Árvore (Sitemap)
        </span>
        <button
          onClick={() => onAdd(null)}
          className="bg-[#005792] hover:bg-[#004370] text-white text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Raiz
        </button>
      </div>

      {nodes.length === 0 ? (
        <div className="p-8 text-center text-gray-400 text-sm">
          Nenhum item estruturado ainda. Clique em "+ Raiz" para criar o primeiro nível.
        </div>
      ) : (
        <div className="p-2 space-y-1">
          {rootNodes.map((rn) => renderNode(rn, 0))}
        </div>
      )}
    </div>
  );
}
