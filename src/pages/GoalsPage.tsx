import React, { useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Goal, GoalContribution } from "../types";
import {
  formatCurrency,
  formatCurrencyInput,
  formatDate,
  parseCurrencyInput,
  toDateInputValue,
} from "../lib/utils";
import { PiggyBank, Target, Trash2, Wallet } from "lucide-react";
import { useProfile } from "../contexts/ProfileContext";
import { useLanguage } from "../contexts/LanguageContext";

type GoalsPageProps = {
  goals: Goal[];
  contributions: GoalContribution[];
  onAddGoal: (goal: Omit<Goal, "id" | "currentAmount" | "created_at">) => void;
  onAddContribution: (
    goalId: string,
    amount: number,
    contributionDate?: string,
    notes?: string
  ) => void;
  onDeleteGoal: (goalId: string) => void;
};

export function GoalsPage({
  goals,
  contributions,
  onAddGoal,
  onAddContribution,
  onDeleteGoal,
}: GoalsPageProps) {
  const { currency } = useProfile();
  const { language } = useLanguage();

  const [name, setName] = useState("");
  const [targetAmountInput, setTargetAmountInput] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const text = useMemo(() => {
    if (language === "en-US") {
      return {
        title: "Goals",
        subtitle:
          "Create goals, track your progress, and save money with more clarity.",
        totalGoal: "Total goal",
        totalSaved: "Saved so far",
        totalRemaining: "Remaining",
        newGoal: "New goal",
        goalPlaceholder: "Ex.: Motorcycle, trip, emergency fund",
        amountPlaceholder: "Target amount",
        createGoal: "Create goal",
        empty:
          "You haven't created any goals yet. Create your first one to start planning.",
        progress: "Progress",
        remaining: "Remaining",
        deadline: "Deadline",
        perMonth: "Per month",
        noDeadline: "Open date",
        setDeadline: "Set a deadline",
        contributionPlaceholder: "How much did you save?",
        addValue: "Add amount",
        recentEntries: "Recent goal entries",
        noEntries: "No entries yet.",
      };
    }

    if (language === "es-ES") {
      return {
        title: "Metas",
        subtitle:
          "Crea objetivos, sigue tu progreso y guarda dinero con más claridad.",
        totalGoal: "Meta total",
        totalSaved: "Ahorrado",
        totalRemaining: "Falta",
        newGoal: "Nueva meta",
        goalPlaceholder: "Ej.: Moto, viaje, fondo de emergencia",
        amountPlaceholder: "Valor objetivo",
        createGoal: "Crear meta",
        empty:
          "Aún no has creado ninguna meta. Crea la primera para comenzar.",
        progress: "Progreso",
        remaining: "Falta",
        deadline: "Plazo",
        perMonth: "Por mes",
        noDeadline: "Libre",
        setDeadline: "Define un plazo",
        contributionPlaceholder: "¿Cuánto guardaste?",
        addValue: "Agregar valor",
        recentEntries: "Últimos movimientos de la meta",
        noEntries: "Todavía no hay movimientos.",
      };
    }

    return {
      title: "Metas",
      subtitle:
        "Crie objetivos, acompanhe sua evolução e guarde dinheiro com mais clareza.",
      totalGoal: "Meta total",
      totalSaved: "Já guardado",
      totalRemaining: "Ainda falta",
      newGoal: "Nova meta",
      goalPlaceholder: "Ex.: Moto, viagem, reserva de emergência",
      amountPlaceholder: "Valor alvo",
      createGoal: "Criar meta",
      empty:
        "Você ainda não criou nenhuma meta. Crie a primeira para começar a planejar.",
      progress: "Progresso",
      remaining: "Falta",
      deadline: "Prazo",
      perMonth: "Por mês",
      noDeadline: "Livre",
      setDeadline: "Defina um prazo",
      contributionPlaceholder: "Quanto você guardou?",
      addValue: "Adicionar valor",
      recentEntries: "Últimos lançamentos da meta",
      noEntries: "Nenhum valor adicionado ainda.",
    };
  }, [language]);

  const totals = useMemo(() => {
    const totalTarget = goals.reduce(
      (sum, goal) => sum + Number(goal.targetAmount || 0),
      0
    );
    const totalSaved = goals.reduce(
      (sum, goal) => sum + Number(goal.currentAmount || 0),
      0
    );
    return {
      totalTarget,
      totalSaved,
      totalRemaining: Math.max(totalTarget - totalSaved, 0),
    };
  }, [goals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedTarget = parseCurrencyInput(targetAmountInput, language);

    if (!name.trim() || parsedTarget <= 0) return;

    onAddGoal({
      name: name.trim(),
      targetAmount: parsedTarget,
      targetDate: targetDate || undefined,
    });

    setName("");
    setTargetAmountInput("");
    setTargetDate("");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
          {text.title}
        </h1>
        <p className="text-zinc-400 mt-1">{text.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          icon={<Target size={16} />}
          label={text.totalGoal}
          value={formatCurrency(totals.totalTarget, currency, language)}
        />
        <SummaryCard
          icon={<PiggyBank size={16} />}
          label={text.totalSaved}
          value={formatCurrency(totals.totalSaved, currency, language)}
        />
        <SummaryCard
          icon={<Wallet size={16} />}
          label={text.totalRemaining}
          value={formatCurrency(totals.totalRemaining, currency, language)}
        />
      </div>

      <Card className="bg-zinc-900/40 border-zinc-800/40">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-100">{text.newGoal}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto]"
            onSubmit={handleSubmit}
          >
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={text.goalPlaceholder}
              className="h-12 bg-zinc-950/60 border-zinc-800"
            />

            <Input
              value={targetAmountInput}
              onChange={(e) =>
                setTargetAmountInput(
                  formatCurrencyInput(e.target.value, currency, language)
                )
              }
              inputMode="numeric"
              placeholder={text.amountPlaceholder}
              className="h-12 bg-zinc-950/60 border-zinc-800"
            />

            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="h-12 bg-zinc-950/60 border-zinc-800"
            />

            <Button type="submit" className="h-12">
              {text.createGoal}
            </Button>
          </form>
        </CardContent>
      </Card>

      {goals.length === 0 ? (
        <Card className="bg-zinc-900/40 border-zinc-800/40">
          <CardContent className="py-10 text-center text-zinc-400">
            {text.empty}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              contributions={contributions.filter((item) => item.goalId === goal.id)}
              onAddContribution={onAddContribution}
              onDeleteGoal={onDeleteGoal}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="bg-zinc-900/40 border-zinc-800/40">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4 text-zinc-400">
          <div className="w-9 h-9 rounded-xl bg-zinc-800/70 border border-zinc-700/60 flex items-center justify-center text-zinc-200">
            {icon}
          </div>
          <span className="text-sm">{label}</span>
        </div>
        <div className="text-2xl font-semibold tracking-tight text-zinc-50">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function GoalCard({
  goal,
  contributions,
  onAddContribution,
  onDeleteGoal,
}: {
  goal: Goal;
  contributions: GoalContribution[];
  onAddContribution: (
    goalId: string,
    amount: number,
    contributionDate?: string,
    notes?: string
  ) => void;
  onDeleteGoal: (goalId: string) => void;
}) {
  const { currency } = useProfile();
  const { language } = useLanguage();

  const [amountInput, setAmountInput] = useState("");
  const [date, setDate] = useState(toDateInputValue(new Date()));

  const progress = Math.min(
    (Number(goal.currentAmount || 0) / Math.max(Number(goal.targetAmount || 0), 1)) *
      100,
    100
  );

  const remaining = Math.max(
    Number(goal.targetAmount || 0) - Number(goal.currentAmount || 0),
    0
  );

  const monthlySuggestion = useMemo(() => {
    if (!goal.targetDate) return null;

    const now = new Date();
    const deadline = new Date(`${goal.targetDate}T12:00:00`);

    const months = Math.max(
      1,
      (deadline.getFullYear() - now.getFullYear()) * 12 +
        deadline.getMonth() -
        now.getMonth() +
        (deadline.getDate() >= now.getDate() ? 0 : -1)
    );

    return remaining / months;
  }, [goal.targetDate, remaining]);

  const recent = [...contributions]
    .sort((a, b) => {
      const dateA = new Date(`${a.contributionDate}T12:00:00`).getTime();
      const dateB = new Date(`${b.contributionDate}T12:00:00`).getTime();
      return dateB - dateA;
    })
    .slice(0, 3);

  const labels =
    language === "en-US"
      ? {
          progress: "Progress",
          remaining: "Remaining",
          deadline: "Deadline",
          perMonth: "Per month",
          noDeadline: "Open date",
          setDeadline: "Set a deadline",
          addPlaceholder: "How much did you save?",
          addValue: "Add amount",
          recentEntries: "Recent goal entries",
          noEntries: "No entries yet.",
        }
      : language === "es-ES"
      ? {
          progress: "Progreso",
          remaining: "Falta",
          deadline: "Plazo",
          perMonth: "Por mes",
          noDeadline: "Libre",
          setDeadline: "Define un plazo",
          addPlaceholder: "¿Cuánto guardaste?",
          addValue: "Agregar valor",
          recentEntries: "Últimos movimientos de la meta",
          noEntries: "Todavía no hay movimientos.",
        }
      : {
          progress: "Progresso",
          remaining: "Falta",
          deadline: "Prazo",
          perMonth: "Por mês",
          noDeadline: "Livre",
          setDeadline: "Defina um prazo",
          addPlaceholder: "Quanto você guardou?",
          addValue: "Adicionar valor",
          recentEntries: "Últimos lançamentos da meta",
          noEntries: "Nenhum valor adicionado ainda.",
        };

  return (
    <Card className="bg-zinc-900/40 border-zinc-800/40 overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-xl text-zinc-100">{goal.name}</CardTitle>
          <p className="mt-2 text-sm text-zinc-400">
            {formatCurrency(goal.currentAmount || 0, currency, language)} de{" "}
            {formatCurrency(goal.targetAmount || 0, currency, language)}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDeleteGoal(goal.id)}
          className="text-zinc-500 hover:text-rose-300"
        >
          <Trash2 size={16} />
        </Button>
      </CardHeader>

      <CardContent className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
            <span>{labels.progress}</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InfoPill
            label={labels.remaining}
            value={formatCurrency(remaining, currency, language)}
          />
          <InfoPill
            label={labels.deadline}
            value={
              goal.targetDate
                ? formatDate(goal.targetDate, language)
                : labels.noDeadline
            }
          />
          <InfoPill
            label={labels.perMonth}
            value={
              monthlySuggestion
                ? formatCurrency(monthlySuggestion, currency, language)
                : labels.setDeadline
            }
          />
        </div>

        <form
          className="grid grid-cols-1 sm:grid-cols-[0.8fr_0.8fr_auto] gap-3"
          onSubmit={(e) => {
            e.preventDefault();

            const parsed = parseCurrencyInput(amountInput, language);
            if (parsed <= 0) return;

            onAddContribution(goal.id, parsed, date);
            setAmountInput("");
          }}
        >
          <Input
            value={amountInput}
            onChange={(e) =>
              setAmountInput(formatCurrencyInput(e.target.value, currency, language))
            }
            inputMode="numeric"
            className="h-11 bg-zinc-950/60 border-zinc-800"
            placeholder={labels.addPlaceholder}
          />

          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 bg-zinc-950/60 border-zinc-800"
          />

          <Button type="submit" className="h-11">
            {labels.addValue}
          </Button>
        </form>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
          <div className="mb-3 text-sm font-medium text-zinc-200">
            {labels.recentEntries}
          </div>

          {recent.length === 0 ? (
            <div className="text-sm text-zinc-500">{labels.noEntries}</div>
          ) : (
            <div className="space-y-2">
              {recent.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-800/70 bg-zinc-900/50 px-3 py-2 text-sm"
                >
                  <span className="text-zinc-300">
                    {formatDate(item.contributionDate, language)}
                  </span>
                  <span className="font-medium text-emerald-300">
                    {formatCurrency(item.amount, currency, language)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-zinc-100">{value}</div>
    </div>
  );
}