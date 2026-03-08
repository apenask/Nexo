import React from "react";
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  Trash2,
  Pencil,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
} from "lucide-react";
import { Transaction, Category, Card as CardType } from "../types";
import { formatCurrency, formatDate, parseLocalDate } from "../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { MonthSelector } from "../components/MonthSelector";
import { useProfile } from "../contexts/ProfileContext";
import { useLanguage } from "../contexts/LanguageContext";

interface PlannedExpensesPageProps {
  transactions: Transaction[];
  categories: Category[];
  cards: CardType[];
  onAddTransaction: () => void;
  onConfirmPlanned: (tx: Transaction) => void;
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction: (tx: Transaction) => void;
}

export function PlannedExpensesPage({
  transactions,
  categories,
  cards,
  onAddTransaction,
  onConfirmPlanned,
  selectedMonth,
  onMonthChange,
  onDeleteTransaction,
  onUpdateTransaction,
}: PlannedExpensesPageProps) {
  const { currency } = useProfile();
  const { language } = useLanguage();

  const text = React.useMemo(() => {
    switch (language) {
      case "en-US":
        return {
          title: "Planning",
          subtitle: "Track planned entries and expenses for the selected month.",
          addTransaction: "New planned transaction",
          noTransactions: "No planned transactions found for the selected month.",
          plannedBadge: "Planned",
          confirm: "Confirm",
          delete: "Delete",
          edit: "Edit",
          card: "Card",
          date: "Date",
          category: "Category",
          projectedImpact: "Projected impact",
        };
      case "es-ES":
        return {
          title: "Planificación",
          subtitle: "Acompaña ingresos y gastos planificados del mes seleccionado.",
          addTransaction: "Nueva transacción planificada",
          noTransactions: "No se encontraron transacciones planificadas para el mes seleccionado.",
          plannedBadge: "Planificado",
          confirm: "Confirmar",
          delete: "Eliminar",
          edit: "Editar",
          card: "Tarjeta",
          date: "Fecha",
          category: "Categoría",
          projectedImpact: "Impacto proyectado",
        };
      case "pt-BR":
      default:
        return {
          title: "Planejamento",
          subtitle: "Acompanhe entradas e saídas planejadas do mês selecionado.",
          addTransaction: "Nova transação planejada",
          noTransactions: "Nenhuma transação planejada encontrada no mês selecionado.",
          plannedBadge: "Planejado",
          confirm: "Confirmar",
          delete: "Apagar",
          edit: "Editar",
          card: "Cartão",
          date: "Data",
          category: "Categoria",
          projectedImpact: "Impacto projetado",
        };
    }
  }, [language]);

  const currentMonth = selectedMonth.getMonth();
  const currentYear = selectedMonth.getFullYear();

  const plannedTransactions = [...transactions]
    .filter((tx) => {
      const date = parseLocalDate(tx.date);
      return (
        tx.isPlanned &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime());

  const projectedImpact = plannedTransactions.reduce((acc, tx) => {
    return tx.type === "entrada" ? acc + tx.amount : acc - tx.amount;
  }, 0);

  const getCategoryName = (categoryId?: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "-";
  };

  const getCardName = (cardId?: string) => {
    if (!cardId) return null;
    return cards.find((c) => c.id === cardId)?.name || null;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">{text.title}</h1>
          <p className="text-zinc-400 mt-1">{text.subtitle}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <MonthSelector selectedMonth={selectedMonth} onChange={onMonthChange} />
          <button
            type="button"
            onClick={onAddTransaction}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-zinc-200 transition"
          >
            <Plus size={16} />
            {text.addTransaction}
          </button>
        </div>
      </div>

      <Card className="bg-zinc-900/40 border-zinc-800/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
            <CalendarClock size={16} className="text-amber-400" />
            {text.projectedImpact}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              projectedImpact >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {projectedImpact >= 0 ? "+" : "-"}
            {formatCurrency(Math.abs(projectedImpact), currency)}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/40 border-zinc-800/40">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-zinc-100">{text.title}</CardTitle>
        </CardHeader>

        <CardContent>
          {plannedTransactions.length === 0 ? (
            <p className="text-sm text-zinc-500">{text.noTransactions}</p>
          ) : (
            <div className="space-y-3">
              {plannedTransactions.map((tx) => {
                const isIncome = tx.type === "entrada";
                const Icon = isIncome ? ArrowUpRight : ArrowDownRight;
                const cardName = getCardName(tx.cardId);

                return (
                  <div
                    key={tx.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`mt-0.5 rounded-xl p-2 border ${
                          isIncome
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        }`}
                      >
                        <Icon size={16} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-zinc-100 truncate">{tx.description}</p>

                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
                            {text.plannedBadge}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
                          <span>
                            {text.category}: {getCategoryName(tx.categoryId)}
                          </span>

                          <span>•</span>

                          <span>
                            {text.date}: {formatDate(tx.date, language)}
                          </span>

                          {cardName && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1">
                                <CreditCard size={12} />
                                {text.card}: {cardName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-3">
                      <span
                        className={`text-sm font-semibold ${
                          isIncome ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(tx.amount, currency)}
                      </span>

                      <div className="flex flex-wrap gap-2 md:justify-end">
                        <button
                          type="button"
                          onClick={() => onConfirmPlanned(tx)}
                          className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/15"
                        >
                          <CheckCircle2 size={14} />
                          {text.confirm}
                        </button>

                        {!tx.id.startsWith("proj_") && (
                          <>
                            <button
                              type="button"
                              onClick={() => onUpdateTransaction(tx)}
                              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                            >
                              <Pencil size={14} />
                              {text.edit}
                            </button>

                            <button
                              type="button"
                              onClick={() => onDeleteTransaction(tx.id)}
                              className="inline-flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/15"
                            >
                              <Trash2 size={14} />
                              {text.delete}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}