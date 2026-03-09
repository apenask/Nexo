import React, { useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  LayoutDashboard,
  Loader2,
  Lock,
  Mail,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  HeartHandshake,
  Copy,
  Instagram,
  ExternalLink,
} from "lucide-react";

type AuthView = "landing" | "login" | "signup";

const SUPPORT_PIX_KEY = "225161c5-c97a-413e-8a20-801fb8d40f02";
const SUPPORT_OWNER = "Rickelme Alexandre Souza da Silva";
const SUPPORT_LABEL = "Ajude o criador";
const CREATOR_INSTAGRAM_HANDLE = "@rickelme3s";
const CREATOR_INSTAGRAM_URL = "https://instagram.com/rickelme3s";

const featureCards = [
  {
    icon: LayoutDashboard,
    title: "Visão clara do seu dinheiro",
    description:
      "Dashboard premium para acompanhar saldo, receitas, despesas e evolução do mês sem confusão.",
  },
  {
    icon: TrendingUp,
    title: "Decisões melhores no dia a dia",
    description:
      "Organize lançamentos, categorias e cartões em um fluxo simples, rápido e agradável no celular.",
  },
  {
    icon: ShieldCheck,
    title: "Mais controle, menos bagunça",
    description:
      "Tenha suas finanças organizadas com um fluxo direto, visual e seguro para acompanhar tudo no mesmo lugar.",
  },
];

const highlightItems = [
  "Veja saldo, receitas e despesas de forma clara e bonita",
  "Organize cartões, categorias e lançamentos sem complicação",
  "Tenha relatórios visuais para entender para onde seu dinheiro vai",
  "Use no celular com uma experiência premium e fluida",
];

export function Auth() {
  const formRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<AuthView>("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const isLogin = view === "login";
  const mascotMood = useMemo(() => {
    if (focusedField === "password") return "covered" as const;
    if (focusedField === "email") return "watching" as const;
    return "idle" as const;
  }, [focusedField]);

  const scrollToForm = (nextView: Exclude<AuthView, "landing">) => {
    setView(nextView);
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const copyToClipboard = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(successMessage);
    } catch {
      toast.error("Não foi possível copiar agora.");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Login realizado com sucesso!");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (!data.session) {
          const loginFallback = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (loginFallback.error) {
            throw new Error(
              "A conta foi criada, mas o login automático não aconteceu. Desative a confirmação por e-mail no Supabase para o fluxo entrar direto."
            );
          }
        }

        toast.success("Conta criada com sucesso! Você já entrou no sistema.");
      }
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro na autenticação.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-zinc-950 text-zinc-50 selection:bg-indigo-500/30">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-28 left-[-6rem] h-72 w-72 rounded-full bg-indigo-500/14 blur-3xl" />
        <div className="absolute top-[18%] right-[-6rem] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-[-5rem] left-[12%] h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_40%)]" />
        <div className="absolute inset-0 auth-grid-mask" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/90 shadow-[0_12px_40px_-18px_rgba(255,255,255,0.8)]">
              <span className="text-lg font-black text-zinc-950">N</span>
            </div>
            <div>
              <div className="text-sm font-semibold tracking-[0.24em] text-zinc-300 uppercase">Nexo</div>
              <div className="text-xs text-zinc-500">Controle Financeiro Pessoal</div>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Button
              variant="ghost"
              className="text-zinc-300 hover:bg-white/5 hover:text-white"
              onClick={() => scrollToForm("login")}
            >
              Entrar
            </Button>
            <Button className="bg-white text-zinc-950 hover:bg-zinc-200" onClick={() => scrollToForm("signup")}>
              Testar agora
            </Button>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-8 pb-6 lg:pr-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-xs font-medium text-indigo-200 backdrop-blur-xl">
              <Sparkles size={14} />
              Experiência premium para organizar sua vida financeira
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
Tenha clareza financeira com uma experiência premium, simples e feita para o seu dia a dia.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
O Nexo reúne seus lançamentos, cartões, categorias e relatórios em uma experiência visual elegante, rápida no celular e confortável também no computador. Tudo para ajudar você a tomar decisões melhores com o seu dinheiro.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <MetricChip label="Entrada rápida" value="Cadastre e acesse" />
              <MetricChip label="Compatível" value="Celular e desktop" />
              <MetricChip label="Experiência" value="Premium e fluida" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {featureCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-2xl shadow-[0_20px_80px_-40px_rgba(0,0,0,0.8)]"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
                      <Icon size={18} />
                    </div>
                    <h3 className="text-base font-semibold text-zinc-100">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{item.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[30px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-2xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300 border border-emerald-400/15">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">Tudo em um só lugar</div>
                    <div className="text-xs text-zinc-500">Controle suas finanças em um ambiente claro, organizado e agradável de acompanhar</div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {highlightItems.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" />
                      <span className="text-sm leading-6 text-zinc-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-zinc-950/60 p-6 backdrop-blur-2xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">Por que vale a pena testar</div>
                    <p className="mt-1 text-sm text-zinc-500">Uma experiência pensada para quem quer mais controle sem complicar a rotina.</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-200 border border-indigo-400/20">
                    <PlayCircle size={18} />
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    "Acompanhe saldo, receitas e despesas em uma interface bonita e fácil de entender.",
                    "Tenha uma rotina mais organizada para lançar gastos, cartões e categorias sem esforço.",
                    "Visualize melhor seus hábitos financeiros e identifique para onde o dinheiro está indo.",
                    "Use uma experiência rápida, fluida e agradável tanto no celular quanto no desktop.",
                  ].map((item, index) => (
                    <div key={item} className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/8 text-sm font-semibold text-zinc-100">
                        0{index + 1}
                      </div>
                      <p className="text-sm leading-6 text-zinc-400">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section ref={formRef} className="lg:pl-4">
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(24,24,27,0.92),rgba(9,9,11,0.98))] p-5 shadow-[0_30px_120px_-48px_rgba(99,102,241,0.55)] backdrop-blur-2xl sm:p-7">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                    <BadgeCheck size={14} />
                    {view === "landing" ? "Escolha como entrar" : isLogin ? "Área de login" : "Criar conta"}
                  </div>
                  <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {view === "landing"
                      ? "Teste o Nexo agora"
                      : isLogin
                      ? "Acesse sua conta"
                      : "Crie sua conta e entre na hora"}
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">
                    {view === "landing"
                      ? "Escolha como entrar e conheça uma plataforma feita para funcionar muito bem no celular, sem abrir mão de uma ótima experiência no computador."
                      : isLogin
                      ? "Volte para o seu painel e continue acompanhando suas finanças com uma experiência premium."
                      : "Crie sua conta em instantes e comece a usar o sistema logo após o cadastro."}
                  </p>
                </div>

                <MascotCard mood={mascotMood} />
              </div>

              {view === "landing" ? (
                <div className="mt-7 space-y-4">
                  <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                    <div className="mb-4 flex items-center gap-3 text-zinc-300">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-200 border border-cyan-400/15">
                        <BarChart3 size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-100">Experimente sem complicação</div>
                        <div className="text-xs text-zinc-500">Teste o produto em poucos segundos e descubra como organizar melhor sua rotina financeira.</div>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <Button
                        className="h-12 w-full bg-white text-zinc-950 hover:bg-zinc-200 text-base font-semibold"
                        onClick={() => scrollToForm("signup")}
                      >
                        Testar criando uma conta
                        <ArrowRight size={18} className="ml-2" />
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 w-full border-white/10 bg-white/[0.03] text-zinc-100 hover:bg-white/[0.06] text-base"
                        onClick={() => scrollToForm("login")}
                      >
                        Já tenho conta
                      </Button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowSupportModal(true)}
                      className="mt-4 flex w-full items-center justify-between rounded-[22px] border border-emerald-400/15 bg-emerald-500/8 px-4 py-4 text-left transition hover:bg-emerald-500/12"
                    >
                      <div>
                        <div className="text-sm font-semibold text-zinc-100">{SUPPORT_LABEL}</div>
                        <p className="mt-1 text-xs leading-5 text-zinc-400">
                          Se o projeto fizer sentido para você, existe um caminho discreto para apoiar a evolução do Nexo.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                        Apoiar
                      </div>
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <QuickInfo title="Cadastro" value="Rápido" />
                    <QuickInfo title="Acesso" value="Automático" />
                    <QuickInfo title="Uso" value="Mobile + desktop" />
                  </div>
                </div>
              ) : (
                <form className="mt-7 space-y-5" onSubmit={handleAuth}>
                  <div>
                    <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                      Email
                    </label>
                    <div className="group relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-indigo-300" size={18} />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-14 rounded-2xl border-white/10 bg-white/[0.04] pl-12 pr-4 text-base text-zinc-50 placeholder:text-zinc-500 focus-visible:ring-indigo-400/40"
                        placeholder="voce@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                      Senha
                    </label>
                    <div className="group relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-indigo-300" size={18} />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        required
                        minLength={6}
                        value={password}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-14 rounded-2xl border-white/10 bg-white/[0.04] pl-12 pr-14 text-base text-zinc-50 placeholder:text-zinc-500 focus-visible:ring-indigo-400/40"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-200"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-14 w-full rounded-2xl bg-white text-base font-semibold text-zinc-950 hover:bg-zinc-200"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : isLogin ? (
                      "Entrar agora"
                    ) : (
                      "Criar conta e entrar"
                    )}
                  </Button>

                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
                    {isLogin ? (
                      <span>
                        Ainda não tem conta?{" "}
                        <button
                          type="button"
                          className="font-semibold text-white transition hover:text-indigo-300"
                          onClick={() => setView("signup")}
                        >
                          Criar agora
                        </button>
                      </span>
                    ) : (
                      <span>
                        Já tem conta?{" "}
                        <button
                          type="button"
                          className="font-semibold text-white transition hover:text-indigo-300"
                          onClick={() => setView("login")}
                        >
                          Fazer login
                        </button>
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setView("landing")}
                    className="w-full text-sm text-zinc-500 transition hover:text-zinc-300"
                  >
                    Voltar para apresentação do sistema
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>

      {showSupportModal && (
        <SupportModal
          onClose={() => setShowSupportModal(false)}
          onCopyPixKey={() => copyToClipboard(SUPPORT_PIX_KEY, "Chave Pix copiada com sucesso!")}
        />
      )}
    </div>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-2 text-lg font-semibold text-zinc-100">{value}</div>
    </div>
  );
}

function QuickInfo({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{title}</div>
      <div className="mt-2 text-sm font-semibold text-zinc-100">{value}</div>
    </div>
  );
}

function MascotCard({ mood }: { mood: "idle" | "watching" | "covered" }) {
  const pupilsClass =
    mood === "watching" ? "translate-x-[2px] -translate-y-[1px]" : "translate-x-0 translate-y-0";

  return (
    <div className="relative hidden h-[132px] w-[132px] shrink-0 rounded-[32px] border border-white/10 bg-white/[0.04] p-4 sm:block">
      <div className="absolute inset-4 rounded-[24px] bg-gradient-to-br from-indigo-500/25 to-cyan-400/10 blur-2xl" />
      <div className="relative flex h-full flex-col items-center justify-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-zinc-900 shadow-inner shadow-black/30">
          <div className="absolute top-5 flex gap-3">
            <div className="relative h-5 w-5 overflow-hidden rounded-full bg-white/95">
              {mood === "covered" ? (
                <div className="absolute inset-x-0 top-[6px] h-[3px] rounded-full bg-zinc-950/80 animate-[auth-hand-cover_0.22s_ease-out]" />
              ) : (
                <div className={`absolute left-[6px] top-[6px] h-2.5 w-2.5 rounded-full bg-zinc-950 transition-transform duration-300 ${pupilsClass}`} />
              )}
            </div>
            <div className="relative h-5 w-5 overflow-hidden rounded-full bg-white/95">
              {mood === "covered" ? (
                <div className="absolute inset-x-0 top-[6px] h-[3px] rounded-full bg-zinc-950/80 animate-[auth-hand-cover_0.22s_ease-out]" />
              ) : (
                <div className={`absolute left-[6px] top-[6px] h-2.5 w-2.5 rounded-full bg-zinc-950 transition-transform duration-300 ${pupilsClass}`} />
              )}
            </div>
          </div>

          {mood === "covered" && (
            <>
              <div className="absolute left-[10px] top-[22px] h-5 w-10 rounded-full border border-zinc-700/70 bg-zinc-800/95 rotate-[-16deg] animate-[auth-hand-cover_0.25s_ease-out]" />
              <div className="absolute right-[10px] top-[22px] h-5 w-10 rounded-full border border-zinc-700/70 bg-zinc-800/95 rotate-[16deg] animate-[auth-hand-cover_0.25s_ease-out]" />
            </>
          )}

          <div className="absolute bottom-5 h-2.5 w-8 rounded-full border border-zinc-700/60 bg-zinc-800/80" />
        </div>
        <div className="mt-3 text-center text-[11px] uppercase tracking-[0.18em] text-zinc-400">
          {mood === "covered" ? "Senha protegida" : mood === "watching" ? "Acompanhando o email" : "Pronto para entrar"}
        </div>
      </div>
    </div>
  );
}

function SupportModal({
  onClose,
  onCopyPixKey,
}: {
  onClose: () => void;
  onCopyPixKey: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 bg-zinc-950 p-6 shadow-[0_30px_120px_-48px_rgba(16,185,129,0.5)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400 transition hover:text-white"
        >
          Fechar
        </button>

        <div className="pr-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-200">
            <HeartHandshake size={14} />
            {SUPPORT_LABEL}
          </div>
          <h3 className="mt-4 text-2xl font-bold text-white">Apoie a evolução do Nexo</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Se o projeto fizer sentido para você, existe uma forma simples de apoiar o desenvolvimento. Também deixei abaixo o perfil do criador.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-zinc-100">Destinatário</div>
                <p className="mt-1 text-xs leading-5 text-zinc-500">{SUPPORT_OWNER}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                Pix
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/8 bg-black/30 px-4 py-3 text-sm break-all text-zinc-200">
              {SUPPORT_PIX_KEY}
            </div>

            <Button
              type="button"
              className="mt-4 h-11 w-full rounded-2xl bg-white text-zinc-950 hover:bg-zinc-200"
              onClick={onCopyPixKey}
            >
              <Copy size={16} className="mr-2" />
              Copiar chave Pix
            </Button>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
              <Instagram size={16} />
              Criador do projeto
            </div>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Você pode deixar seu Instagram aqui para reforçar autoria, confiança e contato direto com quem criou o Nexo.
            </p>

            <a
              href={CREATOR_INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center justify-between rounded-2xl border border-white/8 bg-black/30 px-4 py-3 text-sm text-zinc-200 transition hover:bg-white/[0.04]"
            >
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Instagram do criador</div>
                <div className="mt-1 font-medium text-zinc-100">{CREATOR_INSTAGRAM_HANDLE}</div>
              </div>
              <ExternalLink size={16} className="text-zinc-500" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
