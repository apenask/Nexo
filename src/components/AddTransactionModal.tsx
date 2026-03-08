import React, { useState, useEffect } from "react";
import { Transaction, Category, Card } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  X,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Tag,
  FileText,
  CreditCard,
} from "lucide-react";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, "id"> | Omit<Transaction, "id">[]) => void;
  onUpdate?: (transaction: Transaction) => void;
  categories: Category[];
  cards: Card[];
  initialData?: Transaction | null;
}

function getTodayLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toSafeISOString(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0).toISOString();
}

function parseLocalDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

function formatDateInput(dateIsoOrString: string) {
  if (!dateIsoOrString) return getTodayLocalDateString();
  const onlyDate = dateIsoOrString.includes("T")
    ? dateIsoOrString.split("T")[0]
    : dateIsoOrString;
  return onlyDate;
}

export function AddTransactionModal({
  isOpen,
  onClose,
  onAdd,
  onUpdate,
  categories,
  cards,
  initialData,
}: AddTransactionModalProps) {
  const [type, setType] = useState<"entrada" | "saida">("saida");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getTodayLocalDateString());
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [isPlanned, setIsPlanned] = useState(false);

  const [cardId, setCardId] = useState("");
  const [installments, setInstallments] = useState("1");
  const [step, setStep] = useState<"form" | "installments">("form");
  const [installmentDates, setInstallmentDates] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type);
        setAmount(initialData.amount.toString());
        setDescription(initialData.description);
        setDate(formatDateInput(initialData.date));
        setCategoryId(initialData.categoryId);
        setIsPlanned(initialData.isPlanned || false);
        setCardId(initialData.cardId || "");
        setInstallments("1");
        setStep("form");
        setInstallmentDates([]);
      } else {
        setType("saida");
        setAmount("");
        setDescription("");
        setDate(getTodayLocalDateString());
        setCategoryId(categories[0]?.id || "");
        setIsPlanned(false);
        setCardId("");
        setInstallments("1");
        setStep("form");
        setInstallmentDates([]);
      }
    }
  }, [isOpen, categories, initialData]);

  if (!isOpen) return null;

  const generateInstallmentDates = () => {
    const count = parseInt(installments, 10);
    if (isNaN(count) || count <= 1) return;

    const dates: string[] = [];
    const baseDate = parseLocalDate(date);

    let currentMonth = baseDate.getMonth();
    let currentYear = baseDate.getFullYear();

    const selectedCard = cards.find((c) => c.id === cardId);

    if (selectedCard) {
      const purchaseDay = baseDate.getDate();

      if (purchaseDay >= (selectedCard as any).closingDate) {
        currentMonth += 1;
      }

      for (let i = 0; i < count; i++) {
        const d = new Date(
          currentYear,
          currentMonth + i,
          (selectedCard as any).dueDate,
          12,
          0,
          0
        );

        const year = d.getFullYear();
        const month = `${d.getMonth() + 1}`.padStart(2, "0");
        const day = `${d.getDate()}`.padStart(2, "0");
        dates.push(`${year}-${month}-${day}`);
      }
    } else {
      for (let i = 0; i < count; i++) {
        const d = new Date(
          currentYear,
          currentMonth + i,
          baseDate.getDate(),
          12,
          0,
          0
        );

        const year = d.getFullYear();
        const month = `${d.getMonth() + 1}`.padStart(2, "0");
        const day = `${d.getDate()}`.padStart(2, "0");
        dates.push(`${year}-${month}-${day}`);
      }
    }

    setInstallmentDates(dates);
    setStep("installments");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !categoryId) return;

    if (initialData && onUpdate) {
      onUpdate({
        ...initialData,
        type,
        amount: parseFloat(amount),
        description,
        date: toSafeISOString(date),
        categoryId,
        isPlanned,
        cardId: cardId || undefined,
      });
      onClose();
      return;
    }

    const count = parseInt(installments, 10);

    if (type === "saida" && count > 1 && step === "form") {
      generateInstallmentDates();
      return;
    }

    if (type === "saida" && count > 1 && step === "installments") {
      const totalAmount = parseFloat(amount);
      const installmentAmount = totalAmount / count;
      const groupId = `group_${Date.now()}`;

      const newTransactions: Omit<Transaction, "id">[] = installmentDates.map(
        (instDate, index) => ({
          type,
          amount: installmentAmount,
          description: `${description} (${index + 1}/${count})`,
          date: toSafeISOString(instDate),
          categoryId,
          isPlanned: true,
          cardId: cardId || undefined,
          installmentIndex: index + 1,
          installmentCount: count,
          installmentGroupId: groupId,
        })
      );

      onAdd(newTransactions);
      onClose();
      return;
    }

    onAdd({
      type,
      amount: parseFloat(amount),
      description,
      date: toSafeISOString(date),
      categoryId,
      isPlanned,
      cardId: cardId || undefined,
    });

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
        <div className="mx-auto flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-zinc-800/50 bg-zinc-950 shadow-2xl">
          <div className="flex shrink-0 items-center justify-between border-b border-zinc-800/50 p-6">
            <h2 className="text-xl font-semibold text-zinc-50">
              {step === "form" ? "Nova Transação" : "Confirmar Parcelas"}
            </h2>
            <button
              onClick={onClose}
              className="text-zinc-400 transition-colors hover:text-zinc-50"
              type="button"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="px-6 py-6">
              {step === "form" ? (
                <div className="space-y-6">
                  <div className="flex rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setType("saida");
                        setCardId("");
                        setInstallments("1");
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                        type === "saida"
                          ? "bg-zinc-800 text-rose-400 shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <ArrowDownRight size={16} />
                      Saída
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setType("entrada");
                        setCardId("");
                        setInstallments("1");
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                        type === "entrada"
                          ? "bg-zinc-800 text-emerald-400 shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <ArrowUpRight size={16} />
                      Entrada
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                        Valor Total
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-zinc-500">
                          R$
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="h-14 bg-zinc-900/50 pl-11 text-xl border-zinc-800/80 focus-visible:ring-indigo-500/50"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                        Descrição
                      </label>
                      <div className="relative">
                        <FileText
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                          size={16}
                        />
                        <Input
                          placeholder="Ex: Supermercado"
                          className="bg-zinc-900/50 pl-10 border-zinc-800/80 focus-visible:ring-indigo-500/50"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                          Data da Compra
                        </label>
                        <div className="relative">
                          <Calendar
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                            size={16}
                          />
                          <Input
                            type="date"
                            className="bg-zinc-900/50 pl-10 text-zinc-300 border-zinc-800/80 focus-visible:ring-indigo-500/50"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                          Categoria
                        </label>
                        <div className="relative">
                          <Tag
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                            size={16}
                          />
                          <select
                            className="flex h-10 w-full appearance-none rounded-xl border border-zinc-800/80 bg-zinc-900/50 pl-10 pr-8 py-2 text-sm text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {type === "saida" && cards.length > 0 && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                            Cartão (Opcional)
                          </label>
                          <div className="relative">
                            <CreditCard
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                              size={16}
                            />
                            <select
                              className="flex h-10 w-full appearance-none rounded-xl border border-zinc-800/80 bg-zinc-900/50 pl-10 pr-8 py-2 text-sm text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                              value={cardId}
                              onChange={(e) => setCardId(e.target.value)}
                            >
                              <option value="">Nenhum</option>
                              {cards.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                            Parcelas
                          </label>
                          <Input
                            type="number"
                            min="1"
                            max="72"
                            className="bg-zinc-900/50 border-zinc-800/80 focus-visible:ring-indigo-500/50"
                            value={installments}
                            onChange={(e) => setInstallments(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {parseInt(installments, 10) <= 1 && (
                      <div className="flex items-center gap-3 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-3">
                        <input
                          type="checkbox"
                          id="planned"
                          className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-zinc-950"
                          checked={isPlanned}
                          onChange={(e) => setIsPlanned(e.target.checked)}
                        />
                        <label
                          htmlFor="planned"
                          className="cursor-pointer select-none text-sm text-zinc-300"
                        >
                          Lançamento futuro / planejado
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="mb-4 text-sm text-zinc-400">
                    Confirme as datas de vencimento para as {installments} parcelas
                    de R${" "}
                    {(parseFloat(amount) / parseInt(installments, 10)).toFixed(2)}:
                  </p>

                  <div className="space-y-4">
                    {installmentDates.map((instDate, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <span className="w-8 text-sm font-medium text-zinc-500">
                          {index + 1}ª
                        </span>
                        <Input
                          type="date"
                          className="bg-zinc-900/50 text-zinc-300 border-zinc-800/80 focus-visible:ring-indigo-500/50"
                          value={instDate}
                          onChange={(e) => {
                            const newDates = [...installmentDates];
                            newDates[index] = e.target.value;
                            setInstallmentDates(newDates);
                          }}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div
              className="shrink-0 border-t border-zinc-800/50 bg-zinc-950 px-6 pt-4"
              style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    if (step === "installments") {
                      setStep("form");
                    } else {
                      onClose();
                    }
                  }}
                >
                  {step === "installments" ? "Voltar" : "Cancelar"}
                </Button>

                <Button
                  type="submit"
                  className="flex-1 bg-zinc-50 text-zinc-950 hover:bg-zinc-200"
                >
                  {step === "form" && parseInt(installments, 10) > 1
                    ? "Continuar"
                    : "Salvar"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}