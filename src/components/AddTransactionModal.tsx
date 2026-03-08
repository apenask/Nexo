import React, { useState, useEffect } from "react";
import { Transaction, Category, Card } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { X, ArrowDownRight, ArrowUpRight, Calendar, Tag, FileText, CreditCard } from "lucide-react";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, "id"> | Omit<Transaction, "id">[]) => void;
  onUpdate?: (transaction: Transaction) => void;
  categories: Category[];
  cards: Card[];
  initialData?: Transaction | null;
}

export function AddTransactionModal({ isOpen, onClose, onAdd, onUpdate, categories, cards, initialData }: AddTransactionModalProps) {
  const [type, setType] = useState<"entrada" | "saida">("saida");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [isPlanned, setIsPlanned] = useState(false);
  
  // Card & Installments
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
        setDate(initialData.date.split("T")[0]);
        setCategoryId(initialData.categoryId);
        setIsPlanned(initialData.isPlanned || false);
        setCardId(initialData.cardId || "");
        setInstallments("1"); // Editing installments is complex, keep it simple for now
        setStep("form");
        setInstallmentDates([]);
      } else {
        setType("saida");
        setAmount("");
        setDescription("");
        setDate(new Date().toISOString().split("T")[0]);
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
    const baseDate = new Date(date);
    
    let currentMonth = baseDate.getMonth();
    let currentYear = baseDate.getFullYear();

    const selectedCard = cards.find(c => c.id === cardId);
    
    if (selectedCard) {
      const purchaseDay = baseDate.getDate();
      if (purchaseDay >= selectedCard.closingDate) {
        currentMonth += 1;
      }
      
      for (let i = 0; i < count; i++) {
        const d = new Date(currentYear, currentMonth + i, selectedCard.dueDate);
        dates.push(d.toISOString().split("T")[0]);
      }
    } else {
      for (let i = 0; i < count; i++) {
        const d = new Date(currentYear, currentMonth + i, baseDate.getDate());
        dates.push(d.toISOString().split("T")[0]);
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
        date: new Date(date).toISOString(),
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

      const newTransactions: Omit<Transaction, "id">[] = installmentDates.map((instDate, index) => ({
        type,
        amount: installmentAmount,
        description: `${description} (${index + 1}/${count})`,
        date: new Date(instDate).toISOString(),
        categoryId,
        isPlanned: true,
        cardId: cardId || undefined,
        installmentIndex: index + 1,
        installmentCount: count,
        installmentGroupId: groupId,
      }));
      
      onAdd(newTransactions);
      onClose();
      return;
    }

    onAdd({
      type,
      amount: parseFloat(amount),
      description,
      date: new Date(date).toISOString(),
      categoryId,
      isPlanned,
      cardId: cardId || undefined,
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800/50 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800/50">
          <h2 className="text-xl font-semibold text-zinc-50">
            {step === "form" ? "Nova Transação" : "Confirmar Parcelas"}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-50 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {step === "form" ? (
            <>
              {/* Type Selector */}
              <div className="flex p-1 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                <button
                  type="button"
                  onClick={() => {
                    setType("saida");
                    setCardId("");
                    setInstallments("1");
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    type === "saida" ? "bg-zinc-800 text-rose-400 shadow-sm" : "text-zinc-400 hover:text-zinc-200"
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
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    type === "entrada" ? "bg-zinc-800 text-emerald-400 shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <ArrowUpRight size={16} />
                  Entrada
                </button>
              </div>

              <div className="space-y-5">
                {/* Amount */}
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Valor Total</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">R$</span>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00" 
                      className="pl-11 text-xl h-14 bg-zinc-900/50 border-zinc-800/80 focus-visible:ring-indigo-500/50"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Descrição</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <Input 
                      placeholder="Ex: Supermercado" 
                      className="pl-10 bg-zinc-900/50 border-zinc-800/80 focus-visible:ring-indigo-500/50"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Date */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Data da Compra</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                      <Input 
                        type="date" 
                        className="pl-10 bg-zinc-900/50 border-zinc-800/80 focus-visible:ring-indigo-500/50 text-zinc-300"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Categoria</label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                      <select 
                        className="flex h-10 w-full appearance-none rounded-xl border border-zinc-800/80 bg-zinc-900/50 pl-10 pr-8 py-2 text-sm text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {type === "saida" && cards.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Cartão (Opcional)</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <select 
                          className="flex h-10 w-full appearance-none rounded-xl border border-zinc-800/80 bg-zinc-900/50 pl-10 pr-8 py-2 text-sm text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                          value={cardId}
                          onChange={(e) => setCardId(e.target.value)}
                        >
                          <option value="">Nenhum</option>
                          {cards.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Parcelas</label>
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

                {/* Planned Checkbox */}
                {parseInt(installments, 10) <= 1 && (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800/50 bg-zinc-900/30">
                    <input 
                      type="checkbox" 
                      id="planned" 
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-zinc-950"
                      checked={isPlanned}
                      onChange={(e) => setIsPlanned(e.target.checked)}
                    />
                    <label htmlFor="planned" className="text-sm text-zinc-300 cursor-pointer select-none">
                      Lançamento futuro / planejado
                    </label>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <p className="text-sm text-zinc-400 mb-4">
                Confirme as datas de vencimento para as {installments} parcelas de R$ {(parseFloat(amount) / parseInt(installments, 10)).toFixed(2)}:
              </p>
              
              {installmentDates.map((instDate, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-zinc-500 w-8">{index + 1}ª</span>
                  <Input 
                    type="date" 
                    className="bg-zinc-900/50 border-zinc-800/80 focus-visible:ring-indigo-500/50 text-zinc-300"
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
          )}

          <div className="pt-2 flex gap-3">
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
            <Button type="submit" className="flex-1 bg-zinc-50 text-zinc-950 hover:bg-zinc-200">
              {step === "form" && parseInt(installments, 10) > 1 ? "Continuar" : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
