import React, { useMemo, useState } from "react";
import { FinancialChallenge } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Trophy, Target, Trash2 } from "lucide-react";
import {
  formatCurrency,
  formatCurrencyInput,
  formatDate,
  parseCurrencyInput,
  toDateInputValue,
} from "../lib/utils";
import { useProfile } from "../contexts/ProfileContext";
import { useLanguage } from "../contexts/LanguageContext";

type ChallengesPageProps = {
  challenges: FinancialChallenge[];
  onAddChallenge: (
    challenge: Omit<FinancialChallenge, "id" | "created_at" | "currentAmount">
  ) => void;
  onAddProgress: (challengeId: string, value: number) => void;
  onDeleteChallenge: (challengeId: string) => void;
};

export function ChallengesPage({
  challenges,
  onAddChallenge,
  onAddProgress,
  onDeleteChallenge,
}: ChallengesPageProps) {
  const { currency } = useProfile();
  const { language } = useLanguage();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmountInput, setTargetAmountInput] = useState("");
  const [startDate, setStartDate] = useState(toDateInputValue(new Date()));
  const [endDate, setEndDate] = useState("");

  const text =
    language === "en-US"
      ? {
          title: "Challenges",
          subtitle:
            "Create challenges to save money and make the app more engaging.",
          newChallenge: "New challenge",
          create: "Create challenge",
          challengeName: "Challenge name",
          challengeDesc: "Description",
          target: "Target amount",
          empty: "No challenge created yet.",
          progress: "Progress",
          addProgress: "Add progress",
          recent: "How much did you save?",
        }
      : language === "es-ES"
      ? {
          title: "Desafíos",
          subtitle:
            "Crea desafíos para ahorrar dinero y hacer la app más adictiva.",
          newChallenge: "Nuevo desafío",
          create: "Crear desafío",
          challengeName: "Nombre del desafío",
          challengeDesc: "Descripción",
          target: "Meta",
          empty: "Todavía no hay desafíos.",
          progress: "Progreso",
          addProgress: "Agregar progreso",
          recent: "¿Cuánto ahorraste?",
        }
      : {
          title: "Desafios",
          subtitle:
            "Crie desafios para economizar dinheiro e deixar o app mais viciante.",
          newChallenge: "Novo desafio",
          create: "Criar desafio",
          challengeName: "Nome do desafio",
          challengeDesc: "Descrição",
          target: "Meta",
          empty: "Nenhum desafio criado ainda.",
          progress: "Progresso",
          addProgress: "Adicionar progresso",
          recent: "Quanto você economizou?",
        };

  const totalSaved = useMemo(
    () => challenges.reduce((sum, item) => sum + Number(item.currentAmount || 0), 0),
    [challenges]
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
          {text.title}
        </h1>
        <p className="text-zinc-400 mt-1">{text.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900/40 border-zinc-800/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4 text-zinc-400">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/70 border border-zinc-700/60 flex items-center justify-center text-zinc-200">
                <Trophy size={18} />
              </div>
              <span className="text-sm">Economia em desafios</span>
            </div>
            <div className="text-2xl font-semibold tracking-tight text-zinc-50">
              {formatCurrency(totalSaved, currency, language)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800/40">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-100">{text.newChallenge}</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                const parsed = parseCurrencyInput(targetAmountInput, language);
                if (!title.trim() || parsed <= 0 || !endDate) return;

                onAddChallenge({
                  title: title.trim(),
                  description: description.trim() || undefined,
                  targetAmount: parsed,
                  startDate,
                  endDate,
                });

                setTitle("");
                setDescription("");
                setTargetAmountInput("");
                setStartDate(toDateInputValue(new Date()));
                setEndDate("");
              }}
            >
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={text.challengeName}
                className="h-11 bg-zinc-950/60 border-zinc-800"
              />
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={text.challengeDesc}
                className="h-11 bg-zinc-950/60 border-zinc-800"
              />
              <Input
                value={targetAmountInput}
                onChange={(e) =>
                  setTargetAmountInput(
                    formatCurrencyInput(e.target.value, currency, language)
                  )
                }
                inputMode="numeric"
                placeholder={text.target}
                className="h-11 bg-zinc-950/60 border-zinc-800"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-11 bg-zinc-950/60 border-zinc-800"
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-11 bg-zinc-950/60 border-zinc-800"
                />
              </div>
              <Button type="submit" className="h-11">
                {text.create}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {challenges.length === 0 ? (
        <Card className="bg-zinc-900/40 border-zinc-800/40">
          <CardContent className="py-10 text-center text-zinc-400">
            {text.empty}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onAddProgress={onAddProgress}
              onDeleteChallenge={onDeleteChallenge}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ChallengeCard({
  challenge,
  onAddProgress,
  onDeleteChallenge,
}: {
  challenge: FinancialChallenge;
  onAddProgress: (challengeId: string, value: number) => void;
  onDeleteChallenge: (challengeId: string) => void;
}) {
  const { currency } = useProfile();
  const { language } = useLanguage();
  const [progressInput, setProgressInput] = useState("");

  const progress = Math.min(
    (Number(challenge.currentAmount || 0) /
      Math.max(Number(challenge.targetAmount || 0), 1)) *
      100,
    100
  );

  return (
    <Card className="bg-zinc-900/40 border-zinc-800/40">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-lg text-zinc-100">{challenge.title}</CardTitle>
          {challenge.description ? (
            <p className="mt-2 text-sm text-zinc-400">{challenge.description}</p>
          ) : null}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDeleteChallenge(challenge.id)}
          className="text-zinc-500 hover:text-rose-300"
        >
          <Trash2 size={16} />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
          <div className="flex items-center gap-2 text-zinc-300">
            <Target size={16} />
            <span>
              {formatCurrency(challenge.currentAmount, currency, language)} de{" "}
              {formatCurrency(challenge.targetAmount, currency, language)}
            </span>
          </div>
          <div className="mt-3 h-3 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-emerald-400"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            {progress.toFixed(0)}% • {formatDate(challenge.startDate, language)} até{" "}
            {formatDate(challenge.endDate, language)}
          </div>
        </div>

        <form
          className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const parsed = parseCurrencyInput(progressInput, language);
            if (parsed <= 0) return;
            onAddProgress(challenge.id, parsed);
            setProgressInput("");
          }}
        >
          <Input
            value={progressInput}
            onChange={(e) =>
              setProgressInput(formatCurrencyInput(e.target.value, currency, language))
            }
            inputMode="numeric"
            placeholder={
              language === "en-US"
                ? "How much did you save?"
                : language === "es-ES"
                ? "¿Cuánto ahorraste?"
                : "Quanto você economizou?"
            }
            className="h-11 bg-zinc-950/60 border-zinc-800"
          />
          <Button type="submit" className="h-11">
            {language === "en-US"
              ? "Add progress"
              : language === "es-ES"
              ? "Agregar progreso"
              : "Adicionar progresso"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}