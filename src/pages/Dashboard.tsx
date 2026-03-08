import React from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CalendarClock,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Trash2,
  Pencil,
} from "lucide-react";
import { Transaction, Category, Card as CardType } from "../types";
import { formatCurrency } from "../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { MonthSelector } from "../components/MonthSelector";
import { useProfile } from "../contexts/ProfileContext";
import { useLanguage } from "../contexts/LanguageContext";

interface DashboardProps {
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

export function Dashboard({
  transactions,
  categories,
  onAddTransaction,
  onConfirmPlanned,
  selectedMonth,
  onMonthChange,
  onDeleteTransaction,
  onUpdateTransaction,
}: DashboardProps) {
  const { currency } = useProfile();
  const { language } = useLanguage();

  const text = React.useMemo(() => {
    switch (language) {
      case "en-US":
        return {
          title: "Dashboard",
          subtitle: "A clear overview of your finances this month.",
          currentBalance: "Current balance",
          income: "Income",
          expenses: "Expenses",
          planned: "Planned",
          addTransaction: "New transaction",
          recentTransactions: "Recent transactions",
          noTransactions: "No transactions found for the selected month.",
          plannedBadge: "Planned",
          confirm: "Confirm",
          delete: "Delete",
          edit: "Edit",
          incomeLabel: "Income",
          expenseLabel: "Expense",
          plannedLabel: "Planned balance",
        };
      case "es-ES":
        return {
          title: "Panel",
          subtitle: "Una visión clara de tus finanzas este mes.",
          currentBalance: "Saldo actual",
          income: "Ingresos",
          expenses: "Gastos",
          planned: "Planificado",
          addTransaction: "Nueva transacción",
          recentTransactions: "Transacciones recientes",
          noTransactions: "No se encontraron transacciones para el mes seleccionado.",
          plannedBadge: "Planificado",
          confirm: "Confirmar",
          delete: "Eliminar",
          edit: "Editar",
          incomeLabel: "Ingresos",
          expenseLabel: "Gastos",
          plannedLabel: "Saldo planificado",
        };
      case "pt-BR":
      default:
        return {
          title: "Dashboard",
          subtitle: "Uma visão clara das suas finanças neste mês.",
          currentBalance: "Saldo atual",
          income: "Receitas",
          expenses: "Despesas",
          planned: "Planejado",
          addTransaction: "Nova transação",
          recentTransactions: "Transações recentes",
          noTransactions: "Nenhuma transação encontrada no mês selecionado.",
          plannedBadge: "Planejado",
          confirm: "Confirmar",
          delete: "Apagar",
          edit: "Editar",
          incomeLabel: "Entradas",
          expenseLabel: "Saídas",
          plannedLabel: "Saldo planejado",
        };
    }
  }, [language]);

  const currentMonth = selectedMonth.getMonth();
  const currentYear = selectedMonth.getFullYear();

  const monthTransactions = transactions.filter((tx) => {
    const date = new Date(tx.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const income = monthTransactions
    .filter((tx) => tx.type === "entrada" && !tx.isPlanned)
    .reduce((acc, tx) => acc + tx.amount, 0);

  const expenses = monthTransactions
    .filter((tx) => tx.type === "saida" && !tx.isPlanned)
    .reduce((acc, tx) => acc + tx.amount, 0);

  const plannedImpact = monthTransactions
    .filter((tx) => tx.isPlanned)
    .reduce((acc, tx) => {
      return tx.type === "entrada" ? acc + tx.amount : acc - tx.amount;
    }, 0);

  const balance = income - expenses;
  const projectedBalance = balance + plannedImpact;

  const recentTransactions = [...monthTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  const getCategoryName = (categoryId?: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "-";
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="bg-zinc-900/40 border-zinc-800/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <Wallet size={16} className="text-indigo-400" />
              {text.currentBalance}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-50">
              {formatCurrency(balance, currency)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-400" />
              {text.income}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">
              {formatCurrency(income, currency)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <TrendingDown size={16} className="text-rose-400" />
              {text.expenses}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-400">
              {formatCurrency(expenses, currency)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <CalendarClock size={16} className="text-amber-400" />
              {text.planned}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">
              {formatCurrency(projectedBalance, currency)}
            </div>
            <p className="text-xs text-zinc-500 mt-2">{text.plannedLabel}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900/40 border-zinc-800/40">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-zinc-100">
            {text.recentTransactions}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-zinc-500">{text.noTransactions}</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx) => {
                const isIncome = tx.type === "entrada";
                const Icon = isIncome ? ArrowUpRight : ArrowDownRight;

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
                          {tx.isPlanned && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
                              {text.plannedBadge}
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
                          <span>{getCategoryName(tx.categoryId)}</span>
                          <span>•</span>
                          <span>{new Date(tx.date).toLocaleDateString(language)}</span>
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
                        {tx.isPlanned && (
                          <button
                            type="button"
                            onClick={() => onConfirmPlanned(tx)}
                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/15"
                          >
                            <CheckCircle2 size={14} />
                            {text.confirm}
                          </button>
                        )}

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