import React from "react";
import { X, CreditCard } from "lucide-react";

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (card: {
    name: string;
    limit: number;
    closingDate: number;
    dueDate: number;
    color: string;
  }) => void;
}

const presetColors = [
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#f97316",
  "#ef4444",
  "#14b8a6",
  "#eab308",
  "#64748b",
];

export function AddCardModal({ isOpen, onClose, onAdd }: AddCardModalProps) {
  const [name, setName] = React.useState("");
  const [limit, setLimit] = React.useState("");
  const [closingDate, setClosingDate] = React.useState("1");
  const [dueDate, setDueDate] = React.useState("10");
  const [color, setColor] = React.useState("#22c55e");

  React.useEffect(() => {
    if (!isOpen) return;
    setName("");
    setLimit("");
    setClosingDate("1");
    setDueDate("10");
    setColor("#22c55e");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      limit: Number(limit || 0),
      closingDate: Number(closingDate || 1),
      dueDate: Number(dueDate || 10),
      color,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-2.5">
              <CreditCard size={18} className="text-zinc-100" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Novo cartão</h2>
              <p className="text-sm text-zinc-500">
                Adicione um cartão com limite, vencimento e cor.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:text-zinc-100"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Nome do cartão</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Nubank, Inter, Santander"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Limite</label>
              <input
                type="number"
                inputMode="decimal"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Fechamento</label>
              <input
                type="number"
                min="1"
                max="31"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Vencimento</label>
              <input
                type="number"
                min="1"
                max="31"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">Cor de identificação</label>

            <div className="flex flex-wrap gap-3">
              {presetColors.map((preset) => {
                const isActive = color === preset;

                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setColor(preset)}
                    className={`h-10 w-10 rounded-2xl border-2 transition ${
                      isActive ? "border-white scale-105" : "border-zinc-800"
                    }`}
                    style={{ backgroundColor: preset }}
                  />
                );
              })}
            </div>
          </div>

          <div
            className="rounded-3xl border border-zinc-800 p-5"
            style={{
              background: `linear-gradient(135deg, ${color}22 0%, rgba(24,24,27,0.95) 55%)`,
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Prévia</p>
                <p className="mt-2 text-lg font-semibold text-zinc-50">
                  {name || "Nome do cartão"}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  Limite: {limit ? Number(limit).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "R$ 0,00"}
                </p>
              </div>

              <div
                className="h-12 w-12 rounded-2xl border border-white/10"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}