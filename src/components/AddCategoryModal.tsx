import React from "react";
import { X, Tags } from "lucide-react";
import { Category } from "../types";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (category: Omit<Category, "id">) => void;
  onUpdate?: (category: Category) => void;
  initialData?: Category | null;
  categories?: Category[];
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

export function AddCategoryModal({
  isOpen,
  onClose,
  onAdd,
  onUpdate,
  initialData,
}: AddCategoryModalProps) {
  const isEditing = Boolean(initialData);

  const [name, setName] = React.useState("");
  const [color, setColor] = React.useState("#22c55e");

  React.useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setName(initialData.name || "");
      setColor(initialData.color || "#22c55e");
    } else {
      setName("");
      setColor("#22c55e");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    if (isEditing && initialData && onUpdate) {
      onUpdate({
        ...initialData,
        name: name.trim(),
        color,
      });
    } else {
      onAdd({
        name: name.trim(),
        color,
      } as Omit<Category, "id">);
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm"
      style={{
        WebkitOverflowScrolling: "touch",
        overscrollBehavior: "contain",
      }}
    >
      <div className="min-h-full px-3 py-4 sm:px-4 sm:py-6">
        <div className="mx-auto flex w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">
          <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="shrink-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-2.5">
                <Tags size={18} className="text-zinc-100" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-zinc-100 sm:text-lg">
                  {isEditing ? "Editar categoria" : "Nova categoria"}
                </h2>
                <p className="text-xs text-zinc-500 sm:text-sm">
                  Defina apenas o nome e a cor da categoria.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:text-zinc-100"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="px-4 py-4 sm:px-6 sm:py-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">
                    Nome da categoria
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Alimentação, Lazer, Saúde"
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-700"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-300">
                    Cor da categoria
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
                            isActive ? "scale-105 border-white" : "border-zinc-800"
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
                    background: `linear-gradient(135deg, ${color}26 0%, rgba(24,24,27,0.95) 55%)`,
                  }}
                >
                  <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-400">
                    Nexo Category
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-zinc-50">
                    {name || "Nome da categoria"}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    Os percentuais agora são calculados automaticamente pelos lançamentos.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="shrink-0 border-t border-zinc-800 bg-zinc-950 px-4 pt-4 sm:px-6"
              style={{
                paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
              }}
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
                  {isEditing ? "Salvar alterações" : "Adicionar"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
