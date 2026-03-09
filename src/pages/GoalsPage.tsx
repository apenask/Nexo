import React, { useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Goal, GoalContribution } from "../types";
import { formatCurrency } from "../lib/utils";
import { PiggyBank, Target, Trash2, Wallet } from "lucide-react";

type GoalsPageProps = {
  goals: Goal[];
  contributions: GoalContribution[];
  onAddGoal: (goal: Omit<Goal, "id" | "currentAmount" | "created_at">) => void;
  onAddContribution: (goalId: string, amount: number, contributionDate?: string, notes?: string) => void;
  onDeleteGoal: (goalId: string) => void;
};

export function GoalsPage({ goals, contributions, onAddGoal, onAddContribution, onDeleteGoal }: GoalsPageProps) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const totals = useMemo(() => {
    const totalTarget = goals.reduce((sum, goal) => sum + Number(goal.targetAmount || 0), 0);
    const totalSaved = goals.reduce((sum, goal) => sum + Number(goal.currentAmount || 0), 0);
    return { totalTarget, totalSaved, totalRemaining: Math.max(totalTarget - totalSaved, 0) };
  }, [goals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = Number(targetAmount);
    if (!name.trim() || !parsedTarget || parsedTarget <= 0) return;

    onAddGoal({ name: name.trim(), targetAmount: parsedTarget, targetDate: targetDate || undefined });
    setName("");
    setTargetAmount("");
    setTargetDate("");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Metas</h1>
        <p className="text-zinc-400 mt-1">
          Crie objetivos, acompanhe sua evolução e registre cada valor guardado até chegar lá.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard icon={<Target size={16} />} label="Meta total" value={formatCurrency(totals.totalTarget)} />
        <SummaryCard icon={<PiggyBank size={16} />} label="Já guardado" value={formatCurrency(totals.totalSaved)} />
        <SummaryCard icon={<Wallet size={16} />} label="Ainda falta" value={formatCurrency(totals.totalRemaining)} />
      </div>

      <Card className="bg-zinc-900/40 border-zinc-800/40">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-100">Nova meta</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto]" onSubmit={handleSubmit}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Moto, viagem, reserva de emergência"
              className="h-12 bg-zinc-950/60 border-zinc-800"
            />
            <Input
              type="number"
              min="0"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="Valor alvo"
              className="h-12 bg-zinc-950/60 border-zinc-800"
            />
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="h-12 bg-zinc-950/60 border-zinc-800"
            />
            <Button type="submit" className="h-12">Criar meta</Button>
          </form>
        </CardContent>
      </Card>

      {goals.length === 0 ? (
        <Card className="bg-zinc-900/40 border-zinc-800/40">
          <CardContent className="py-10 text-center text-zinc-400">
            Você ainda não criou nenhuma meta. Crie a primeira para começar a planejar seus objetivos.
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

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="bg-zinc-900/40 border-zinc-800/40">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4 text-zinc-400">
          <div className="w-9 h-9 rounded-xl bg-zinc-800/70 border border-zinc-700/60 flex items-center justify-center text-zinc-200">
            {icon}
          </div>
          <span className="text-sm">{label}</span>
        </div>
        <div className="text-2xl font-semibold tracking-tight text-zinc-50">{value}</div>
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
  onAddContribution: (goalId: string, amount: number, contributionDate?: string, notes?: string) => void;
  onDeleteGoal: (goalId: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const progress = Math.min((Number(goal.currentAmount || 0) / Math.max(Number(goal.targetAmount || 0), 1)) * 100, 100);
  const remaining = Math.max(Number(goal.targetAmount || 0) - Number(goal.currentAmount || 0), 0);

  const monthlySuggestion = useMemo(() => {
    if (!goal.targetDate) return null;
    const now = new Date();
    const deadline = new Date(`${goal.targetDate}T12:00:00`);
    const months = Math.max(
      1,
      (deadline.getFullYear() - now.getFullYear()) * 12 + deadline.getMonth() - now.getMonth() + (deadline.getDate() >= now.getDate() ? 0 : -1)
    );
    return remaining / months;
  }, [goal.targetDate, remaining]);

  const recent = contributions.slice(0, 3);

  return (
    <Card className="bg-zinc-900/40 border-zinc-800/40 overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-xl text-zinc-100">{goal.name}</CardTitle>
          <p className="mt-2 text-sm text-zinc-400">
            {formatCurrency(goal.currentAmount || 0)} de {formatCurrency(goal.targetAmount || 0)}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onDeleteGoal(goal.id)} className="text-zinc-500 hover:text-rose-300">
          <Trash2 size={16} />
        </Button>
      </CardHeader>

      <CardContent className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
            <span>Progresso</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InfoPill label="Falta" value={formatCurrency(remaining)} />
          <InfoPill label="Prazo" value={goal.targetDate ? new Date(`${goal.targetDate}T12:00:00`).toLocaleDateString("pt-BR") : "Livre"} />
          <InfoPill label="Por mês" value={monthlySuggestion ? formatCurrency(monthlySuggestion) : "Defina um prazo"} />
        </div>

        <form
          className="grid grid-cols-1 sm:grid-cols-[0.8fr_0.8fr_auto] gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const parsed = Number(amount);
            if (!parsed || parsed <= 0) return;
            onAddContribution(goal.id, parsed, date);
            setAmount("");
          }}
        >
          <Input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-11 bg-zinc-950/60 border-zinc-800"
            placeholder="Quanto você guardou?"
          />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 bg-zinc-950/60 border-zinc-800"
          />
          <Button type="submit" className="h-11">Adicionar valor</Button>
        </form>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
          <div className="mb-3 text-sm font-medium text-zinc-200">Últimos lançamentos da meta</div>
          {recent.length === 0 ? (
            <div className="text-sm text-zinc-500">Nenhum valor adicionado ainda.</div>
          ) : (
            <div className="space-y-2">
              {recent.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl border border-zinc-800/70 bg-zinc-900/50 px-3 py-2 text-sm">
                  <span className="text-zinc-300">{new Date(`${item.contributionDate}T12:00:00`).toLocaleDateString("pt-BR")}</span>
                  <span className="font-medium text-emerald-300">{formatCurrency(item.amount)}</span>
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
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-2 text-sm font-semibold text-zinc-100">{value}</div>
    </div>
  );
}
