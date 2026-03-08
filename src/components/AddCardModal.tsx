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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm">
      <div
        className="flex items-center justify-center p-3 sm:p-4"
        style={{ minHeight: "100dvh" }}
      >
        <div
          className="flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl"
          style={{ height: "min(92dvh, 820px)" }}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-2.5 shrink-0">
                <CreditCard size={18} className="text-zinc-100" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-zinc-100 sm:text-lg truncate">
                  Novo cartão
                </h2>
                <p className="text-xs text-zinc-500 sm:text-sm">
                  Adicione um cartão com limite, vencimento e cor.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:text-zinc-100 shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
              <div className="space-y-5 pb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">
                    Nome do cartão
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Nubank, Inter, Santander"
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-700"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">
                      Limite
                    </label>
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
                    <label className="text-sm font-medium text-zinc-300">
                      Fechamento
                    </label>
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
                    <label className="text-sm font-medium text-zinc-300">
                      Vencimento
                    </label>
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
                  <label className="text-sm font-medium text-zinc-300">
                    Cor de identificação
                  </label>

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
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                        Prévia
                      </p>
                      <p className="mt-2 truncate text-lg font-semibold text-zinc-50">
                        {name || "Nome do cartão"}
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">
                        Limite:{" "}
                        {limit
                          ? Number(limit).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })
                          : "R$ 0,00"}
                      </p>
                    </div>

                    <div
                      className="h-12 w-12 shrink-0 rounded-2xl border border-white/10"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              className="shrink-0 border-t border-zinc-800 bg-zinc-950 px-4 pt-4 sm:px-6"
              style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}