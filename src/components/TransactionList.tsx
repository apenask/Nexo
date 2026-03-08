import React from "react";
import { Transaction, Category, Card } from "../types";
import { formatCurrency, formatDate } from "../lib/utils";
import { ArrowDownRight, ArrowUpRight, Calendar, CreditCard, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { useProfile } from "../contexts/ProfileContext";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  cards?: Card[];
  title?: string;
  onConfirmPlanned?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (tx: Transaction) => void;
}

export function TransactionList({ transactions, categories, cards = [], title, onConfirmPlanned, onDelete, onUpdate }: TransactionListProps) {
  const { currency } = useProfile();

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 text-sm">
        Nenhuma transação encontrada.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && <h3 className="text-sm font-medium text-zinc-400">{title}</h3>}
      <div className="space-y-2">
        {transactions.map((tx) => {
          const category = categories.find((c) => c.id === tx.categoryId);
          const card = cards.find((c) => c.id === tx.cardId);
          const isIncome = tx.type === "entrada";
          const isProjected = tx.id.startsWith('proj_');
          
          return (
            <div 
              key={tx.id} 
              className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/30 hover:bg-zinc-900/50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-zinc-800/50`}>
                  {isIncome ? (
                    <ArrowUpRight size={18} className="text-emerald-400" />
                  ) : (
                    <ArrowDownRight size={18} className="text-rose-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-zinc-100 flex items-center gap-2">
                    {tx.description}
                    {tx.installmentCount && tx.installmentCount > 1 && (
                      <span className="text-[10px] font-medium text-zinc-500 bg-zinc-800/50 px-1.5 py-0.5 rounded">
                        {tx.installmentIndex}/{tx.installmentCount}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span 
                      className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: `${category?.color}15`,
                        color: category?.color 
                      }}
                    >
                      {category?.name || "Sem categoria"}
                    </span>
                    {card && (
                      <span 
                        className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                        style={{ 
                          backgroundColor: `${card.color || '#6366f1'}15`,
                          color: card.color || '#6366f1'
                        }}
                      >
                        <CreditCard size={10} />
                        {card.name}
                      </span>
                    )}
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(tx.date)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right flex items-center gap-4">
                <div>
                  <p className={`font-medium ${isIncome ? "text-emerald-400" : "text-zinc-100"}`}>
                    {isIncome ? "+" : "-"}{formatCurrency(tx.amount, currency)}
                  </p>
                  {tx.isPlanned && (
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">
                      Planejado
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {tx.isPlanned && onConfirmPlanned && (
                    <button
                      onClick={() => onConfirmPlanned(tx)}
                      className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800/50 rounded-full transition-colors"
                      title="Confirmar"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  )}
                  {!isProjected && onUpdate && (
                    <button
                      onClick={() => onUpdate(tx)}
                      className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800/50 rounded-full transition-colors"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                  {!isProjected && onDelete && (
                    <button
                      onClick={() => {
                        if (window.confirm("Tem certeza que deseja excluir esta transação?")) {
                          onDelete(tx.id);
                        }
                      }}
                      className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/50 rounded-full transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
