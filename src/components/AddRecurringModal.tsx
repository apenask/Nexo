import React, { useState, useEffect } from "react";
import { X, Calendar, Tag, FileText, ArrowDownCircle, ArrowUpCircle, Repeat } from "lucide-react";
import { Category, RecurringTransaction, TransactionType, RecurrenceType } from "../types";
import { cn } from "../lib/utils";

interface AddRecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (rt: Omit<RecurringTransaction, "id">) => void;
  categories: Category[];
  initialData?: RecurringTransaction;
}

export function AddRecurringModal({ isOpen, onClose, onAdd, categories, initialData }: AddRecurringModalProps) {
  const [type, setType] = useState<TransactionType>("saida");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("mensal");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (initialData && isOpen) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setDescription(initialData.description);
      setCategoryId(initialData.categoryId);
      setStartDate(initialData.startDate.split("T")[0]);
      setRecurrenceType(initialData.recurrenceType);
      setNotes(initialData.notes || "");
    } else if (isOpen) {
      // Reset form on open if no initialData
      setType("saida");
      setAmount("");
      setDescription("");
      setCategoryId("");
      setStartDate(new Date().toISOString().split("T")[0]);
      setRecurrenceType("mensal");
      setNotes("");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !categoryId || !startDate) return;

    onAdd({
      type,
      amount: Number(amount),
      description,
      categoryId,
      startDate,
      recurrenceType,
      status: initialData ? initialData.status : "active",
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800/50">
          <h2 className="text-xl font-semibold text-zinc-50">
            {initialData ? "Editar Recorrência" : "Nova Recorrência"}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Toggle */}
          <div className="flex p-1 bg-zinc-950 rounded-xl border border-zinc-800/50">
            <button
              type="button"
              onClick={() => setType("saida")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all",
                type === "saida" ? "bg-zinc-800 text-zinc-50 shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <ArrowDownCircle size={16} className={type === "saida" ? "text-red-400" : ""} />
              Saída
            </button>
            <button
              type="button"
              onClick={() => setType("entrada")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all",
                type === "entrada" ? "bg-zinc-800 text-zinc-50 shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <ArrowUpCircle size={16} className={type === "entrada" ? "text-emerald-400" : ""} />
              Entrada
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Valor</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">R$</span>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Description & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Descrição</label>
              <div className="relative">
                <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all"
                  placeholder="Ex: Aluguel, Internet..."
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Categoria</label>
              <div className="relative">
                <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-zinc-50 appearance-none focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all"
                >
                  <option value="" disabled>Selecione...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Recurrence & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Repetição</label>
              <div className="relative">
                <Repeat size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <select
                  value={recurrenceType}
                  onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-zinc-50 appearance-none focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all"
                >
                  <option value="mensal">Mensal</option>
                  <option value="semanal">Semanal</option>
                  <option value="anual">Anual</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Data de Início</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-zinc-50 text-zinc-950 font-medium rounded-xl py-3 hover:bg-zinc-200 transition-colors"
            >
              {initialData ? "Salvar Alterações" : "Salvar Recorrência"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
