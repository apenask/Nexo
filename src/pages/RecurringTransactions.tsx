import React, { useState } from "react";
import { Plus, Edit2, Pause, Play, Trash2 } from "lucide-react";
import { RecurringTransaction, Category } from "../types";
import { formatCurrency } from "../lib/utils";
import { AddRecurringModal } from "../components/AddRecurringModal";
import { useProfile } from "../contexts/ProfileContext";

interface RecurringTransactionsPageProps {
  recurringTransactions: RecurringTransaction[];
  categories: Category[];
  onAdd: () => void;
  onUpdate: (rt: RecurringTransaction) => void;
  onDelete: (id: string) => void;
}

export function RecurringTransactionsPage({
  recurringTransactions,
  categories,
  onAdd,
  onUpdate,
  onDelete,
}: RecurringTransactionsPageProps) {
  const { currency } = useProfile();
  const [editingRt, setEditingRt] = useState<RecurringTransaction | null>(null);

  const getCategory = (id: string) => categories.find((c) => c.id === id);

  const getRecurrenceLabel = (type: string) => {
    switch (type) {
      case "mensal": return "Mensal";
      case "semanal": return "Semanal";
      case "anual": return "Anual";
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Transações Recorrentes</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Gerencie suas despesas e receitas fixas.
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-zinc-50 text-zinc-950 px-4 py-2 rounded-xl text-sm font-medium hover:bg-zinc-200 transition-colors"
        >
          <Plus size={18} />
          Nova Recorrência
        </button>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden backdrop-blur-xl">
        {recurringTransactions.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            Nenhuma transação recorrente cadastrada.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {recurringTransactions.map((rt) => {
              const category = getCategory(rt.categoryId);
              return (
                <div key={rt.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center opacity-80"
                      style={{ backgroundColor: `${category?.color}20`, color: category?.color }}
                    >
                      <span className="text-lg font-medium">
                        {category?.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-100">{rt.description}</p>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                        <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700">
                          {getRecurrenceLabel(rt.recurrenceType)}
                        </span>
                        <span>•</span>
                        <span>Início: {new Date(rt.startDate).toLocaleDateString('pt-BR')}</span>
                        {rt.status === "paused" && (
                          <>
                            <span>•</span>
                            <span className="text-amber-500">Pausada</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className={`font-medium ${rt.type === "entrada" ? "text-emerald-400" : "text-zinc-100"}`}>
                      {rt.type === "entrada" ? "+" : "-"}{formatCurrency(rt.amount, currency)}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingRt(rt)}
                        className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onUpdate({ ...rt, status: rt.status === "active" ? "paused" : "active" })}
                        className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
                        title={rt.status === "active" ? "Pausar" : "Retomar"}
                      >
                        {rt.status === "active" ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <button
                        onClick={() => onDelete(rt.id)}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editingRt && (
        <AddRecurringModal
          isOpen={!!editingRt}
          onClose={() => setEditingRt(null)}
          onAdd={(updatedRt) => {
            onUpdate({ ...updatedRt, id: editingRt.id });
            setEditingRt(null);
          }}
          categories={categories}
          initialData={editingRt}
        />
      )}
    </div>
  );
}
