import React from "react";
import {
  Plus,
  Tags,
  Pencil,
  Percent,
  Wallet,
  Trash2,
  TrendingDown,
} from "lucide-react";
import { Category, Transaction } from "../types";
import { formatCurrency } from "../lib/utils";
import { useProfile } from "../contexts/ProfileContext";
import { useLanguage } from "../contexts/LanguageContext";

interface CategoriesPageProps {
  categories: Category[];
  onAddCategory: () => void;
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  transactions: Transaction[];
}

export function CategoriesPage({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  transactions,
}: CategoriesPageProps) {
  const { currency } = useProfile();
  const { language } = useLanguage();

  const text = React.useMemo(() => {
    switch (language) {
      case "en-US":
        return {
          title: "Categories",
          subtitle: "Organize your finances by category and track spending better.",
          addCategory: "New category",
          noCategories: "No categories found yet.",
          budgetPercentage: "Budget percentage",
          spent: "Spent",
          edit: "Edit",
          delete: "Delete",
          uncategorized: "Uncategorized",
          usage: "Usage",
        };
      case "es-ES":
        return {
          title: "Categorías",
          subtitle: "Organiza tus finanzas por categoría y acompaña mejor tus gastos.",
          addCategory: "Nueva categoría",
          noCategories: "Todavía no se encontraron categorías.",
          budgetPercentage: "Porcentaje de presupuesto",
          spent: "Gastado",
          edit: "Editar",
          delete: "Eliminar",
          uncategorized: "Sin categoría",
          usage: "Uso",
        };
      default:
        return {
          title: "Categorias",
          subtitle: "Organize suas finanças por categoria e acompanhe melhor seus gastos.",
          addCategory: "Nova categoria",
          noCategories: "Nenhuma categoria encontrada ainda.",
          budgetPercentage: "Orçamento percentual",
          spent: "Gasto",
          edit: "Editar",
          delete: "Apagar",
          uncategorized: "Sem categoria",
          usage: "Uso",
        };
    }
  }, [language]);

  const expensesByCategory = React.useMemo(() => {
    const totals = new Map<string, number>();

    transactions
      .filter((tx) => tx.type === "saida" && !tx.isPlanned)
      .forEach((tx) => {
        const key = tx.categoryId || "uncategorized";
        totals.set(key, (totals.get(key) || 0) + tx.amount);
      });

    return totals;
  }, [transactions]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">{text.title}</h1>
          <p className="text-zinc-400 mt-1">{text.subtitle}</p>
        </div>

        <button
          type="button"
          onClick={onAddCategory}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-zinc-200 transition w-full sm:w-auto"
        >
          <Plus size={16} />
          {text.addCategory}
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/20 p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/60">
            <Tags size={28} className="text-zinc-500" />
          </div>

          <h2 className="text-xl font-semibold text-zinc-100">{text.noCategories}</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categories.map((category) => {
            const spent = expensesByCategory.get(category.id) || 0;
            const budgetPercentage = Number(category.budgetPercentage ?? 0);
            const color = category.color ?? "#22c55e";
            const usagePercent = Math.min(spent > 0 && budgetPercentage > 0 ? 100 : 0, 100);

            return (
              <div
                key={category.id}
                className="rounded-3xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.45)] overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${color}26 0%, rgba(24,24,27,0.96) 42%, rgba(9,9,11,1) 100%)`,
                }}
              >
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-400">
                        Nexo Category
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold text-zinc-50">{category.name}</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdateCategory(category)}
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-xs font-medium text-zinc-100 hover:bg-zinc-800"
                      >
                        <Pencil size={14} />
                        {text.edit}
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteCategory(category.id)}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/15"
                      >
                        <Trash2 size={14} />
                        {text.delete}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                        <Percent size={14} />
                        <span>{text.budgetPercentage}</span>
                      </div>
                      <p className="text-xl font-semibold text-zinc-100">
                        {budgetPercentage.toFixed(0)}%
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                        <Wallet size={14} />
                        <span>{text.spent}</span>
                      </div>
                      <p className="text-xl font-semibold text-zinc-100">
                        {formatCurrency(spent, currency)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-zinc-400">{text.usage}</p>
                        <p className="mt-1 text-lg font-semibold text-zinc-100">
                          {budgetPercentage.toFixed(0)}%
                        </p>
                      </div>

                      <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 bg-black/20">
                        <span className="inline-flex items-center gap-1">
                          <TrendingDown size={12} />
                          {formatCurrency(spent, currency)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 h-3 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${usagePercent}%`,
                          background: `linear-gradient(90deg, ${color} 0%, rgba(255,255,255,0.92) 100%)`,
                        }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                      <span>0%</span>
                      <span>{budgetPercentage.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {!categories.find((c) => c.id === "uncategorized") &&
            (expensesByCategory.get("uncategorized") || 0) > 0 && (
              <div className="rounded-3xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.45)] overflow-hidden bg-zinc-950">
                <div className="p-6 border-b border-white/10">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-400">
                    Nexo Category
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold text-zinc-50">
                    {text.uncategorized}
                  </h3>
                </div>

                <div className="p-6">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                      <Wallet size={14} />
                      <span>{text.spent}</span>
                    </div>
                    <p className="text-xl font-semibold text-zinc-100">
                      {formatCurrency(expensesByCategory.get("uncategorized") || 0, currency)}
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}