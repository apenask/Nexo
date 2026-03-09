import React from "react";
import {
  PieChart,
  BarChart3,
  Wallet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Transaction, Category } from "../types";
import { formatCurrency } from "../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { MonthSelector } from "../components/MonthSelector";
import { useProfile } from "../contexts/ProfileContext";
import { useLanguage } from "../contexts/LanguageContext";

interface ReportsPageProps {
  transactions: Transaction[];
  categories: Category[];
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function ReportsPage({
  transactions,
  categories,
  selectedMonth,
  onMonthChange,
}: ReportsPageProps) {
  const { currency } = useProfile();
  const { language } = useLanguage();

  const text = React.useMemo(() => {
    switch (language) {
      case "en-US":
        return {
          title: "Reports",
          subtitle: "Analyze how your money is distributed.",
          income: "Income",
          expenses: "Expenses",
          balance: "Balance",
          categoryExpenses: "Expenses by category",
          incomeVsExpenses: "Income vs expenses",
          noData: "No data for the selected month.",
        };

      case "es-ES":
        return {
          title: "Informes",
          subtitle: "Analiza cómo se distribuye tu dinero.",
          income: "Ingresos",
          expenses: "Gastos",
          balance: "Saldo",
          categoryExpenses: "Gastos por categoría",
          incomeVsExpenses: "Ingresos vs gastos",
          noData: "No hay datos para el mes seleccionado.",
        };

      default:
        return {
          title: "Relatórios",
          subtitle: "Analise como seu dinheiro está distribuído.",
          income: "Receitas",
          expenses: "Despesas",
          balance: "Saldo",
          categoryExpenses: "Despesas por categoria",
          incomeVsExpenses: "Receitas vs despesas",
          noData: "Sem dados para o mês selecionado.",
        };
    }
  }, [language]);

  const month = selectedMonth.getMonth();
  const year = selectedMonth.getFullYear();

  const monthTransactions = transactions.filter((tx) => {
    const d = new Date(tx.date);
    return d.getMonth() === month && d.getFullYear() === year && !tx.isPlanned;
  });

  const income = monthTransactions
    .filter((tx) => tx.type === "entrada")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expenses = monthTransactions
    .filter((tx) => tx.type === "saida")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const balance = income - expenses;

  const expensesByCategory = categories.map((cat) => {
    const total = monthTransactions
      .filter((tx) => tx.type === "saida" && tx.categoryId === cat.id)
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      name: cat.name,
      color: cat.color,
      value: total,
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
            {text.title}
          </h1>
          <p className="text-zinc-400 mt-1">{text.subtitle}</p>
        </div>

        <MonthSelector selectedMonth={selectedMonth} onChange={onMonthChange} />
      </div>

      {/* RESUMO FINANCEIRO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900/40 border-zinc-800/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
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
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
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
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <Wallet size={16} className="text-indigo-400" />
              {text.balance}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {formatCurrency(balance, currency)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GASTOS POR CATEGORIA */}
      <Card className="bg-zinc-900/40 border-zinc-800/40">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
            <PieChart size={18} />
            {text.categoryExpenses}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {expensesByCategory.every((c) => c.value === 0) ? (
            <p className="text-zinc-500 text-sm">{text.noData}</p>
          ) : (
            <div className="space-y-3">
              {expensesByCategory.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between p-3 border border-zinc-800 rounded-xl bg-zinc-900/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-zinc-200 text-sm">{cat.name}</span>
                  </div>

                  <span className="text-sm font-medium text-zinc-100">
                    {formatCurrency(cat.value, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* COMPARAÇÃO */}
      <Card className="bg-zinc-900/40 border-zinc-800/40">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
            <BarChart3 size={18} />
            {text.incomeVsExpenses}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {income === 0 && expenses === 0 ? (
            <p className="text-zinc-500 text-sm">{text.noData}</p>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-zinc-400 mb-1">
                  <span>{text.income}</span>
                  <span>{formatCurrency(income, currency)}</span>
                </div>

                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className="bg-emerald-400 h-2 rounded-full"
                    style={{
                      width: `${
                        income + expenses === 0
                          ? 0
                          : (income / (income + expenses)) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm text-zinc-400 mb-1">
                  <span>{text.expenses}</span>
                  <span>{formatCurrency(expenses, currency)}</span>
                </div>

                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className="bg-rose-400 h-2 rounded-full"
                    style={{
                      width: `${
                        income + expenses === 0
                          ? 0
                          : (expenses / (income + expenses)) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}