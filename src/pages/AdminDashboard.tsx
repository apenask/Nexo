import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import {
  Users,
  Activity,
  UserCheck,
  UserX,
  CreditCard,
  Tags,
  ArrowRightLeft,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useProfile } from "../contexts/ProfileContext";
import { formatDate, parseLocalDate } from "../lib/utils";

type AdminProfileRow = {
  id: string;
  email: string | null;
  created_at: string | null;
  last_login: string | null;
  last_seen?: string | null;
  is_admin?: boolean | null;
  role?: string | null;
};

export function AdminDashboard() {
  const { profile } = useProfile();
  const [profiles, setProfiles] = useState<AdminProfileRow[]>([]);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [cardsCount, setCardsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const [profilesRes, txRes, catRes, cardsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, created_at, last_login, last_seen, is_admin, role")
        .order("created_at", { ascending: false }),
      supabase.from("transactions").select("id", { count: "exact", head: true }),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("cards").select("id", { count: "exact", head: true }),
    ]);

    if (profilesRes.error) {
      setErrorMessage(
        profilesRes.error.message.includes("permission")
          ? "Seu banco ainda não liberou leitura admin para profiles. Rode o SQL do pacote e tente novamente."
          : profilesRes.error.message
      );
      setProfiles([]);
      setTransactionsCount(0);
      setCategoriesCount(0);
      setCardsCount(0);
      setIsLoading(false);
      return;
    }

    setProfiles(profilesRes.data ?? []);
    setTransactionsCount(txRes.count ?? 0);
    setCategoriesCount(catRes.count ?? 0);
    setCardsCount(cardsRes.count ?? 0);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (profile?.isAdmin) {
      loadAdminData();
    }
  }, [profile?.isAdmin, loadAdminData]);

  const now = new Date();

  const metrics = useMemo(() => {
    const activeToday = profiles.filter((item) => {
      if (!item.last_login) return false;
      return new Date(item.last_login).toDateString() === now.toDateString();
    }).length;

    const onlineUsers = profiles.filter((item) => {
      if (!item.last_seen) return false;
      const diff = now.getTime() - new Date(item.last_seen).getTime();
      return diff <= 5 * 60 * 1000;
    }).length;

    const active30Days = profiles.filter((item) => {
      const reference = item.last_seen ?? item.last_login;
      if (!reference) return false;
      const diff = now.getTime() - new Date(reference).getTime();
      return diff <= 30 * 24 * 60 * 60 * 1000;
    }).length;

    const offlineUsers = Math.max(profiles.length - onlineUsers, 0);

    return {
      totalUsers: profiles.length,
      activeToday,
      active30Days,
      onlineUsers,
      offlineUsers,
    };
  }, [profiles]);

  const recentUsers = useMemo(() => profiles.slice(0, 5), [profiles]);

  if (!profile?.isAdmin) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Admin</h1>
          <p className="text-zinc-400 mt-1">Acesso restrito.</p>
        </div>

        <Card className="bg-zinc-900/40 border-zinc-800/40">
          <CardContent className="py-8 flex items-center gap-3 text-zinc-300">
            <ShieldAlert className="text-amber-400" size={18} />
            Sua conta não possui permissão de administrador.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Admin</h1>
          <p className="text-zinc-400 mt-1">Métricas internas do sistema e atividade das contas.</p>
        </div>

        <Button
          variant="outline"
          onClick={loadAdminData}
          className="border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-100"
        >
          <RefreshCw size={16} className="mr-2" />
          Atualizar métricas
        </Button>
      </div>

      {errorMessage && (
        <Card className="bg-rose-950/20 border-rose-900/40">
          <CardContent className="py-4 text-sm text-rose-200">{errorMessage}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users size={16} />} label="Usuários cadastrados" value={metrics.totalUsers} />
        <StatCard icon={<UserCheck size={16} />} label="Ativos hoje" value={metrics.activeToday} />
        <StatCard icon={<Activity size={16} />} label="Ativos 30 dias" value={metrics.active30Days} />
        <StatCard icon={<UserCheck size={16} />} label="Online agora" value={metrics.onlineUsers} />
        <StatCard icon={<UserX size={16} />} label="Offline agora" value={metrics.offlineUsers} />
        <StatCard icon={<ArrowRightLeft size={16} />} label="Transações" value={transactionsCount} />
        <StatCard icon={<Tags size={16} />} label="Categorias" value={categoriesCount} />
        <StatCard icon={<CreditCard size={16} />} label="Cartões" value={cardsCount} />
      </div>

      <Card className="bg-zinc-900/40 border-zinc-800/40">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-100">Contas recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-zinc-400 text-sm">Carregando métricas...</div>
          ) : recentUsers.length === 0 ? (
            <div className="text-zinc-400 text-sm">Nenhuma conta encontrada.</div>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((user) => {
                const isOnline = Boolean(user.last_seen) && now.getTime() - new Date(user.last_seen as string).getTime() <= 5 * 60 * 1000;
                const isAdmin = Boolean(user.is_admin) || user.role === "admin";

                return (
                  <div
                    key={user.id}
                    className="flex flex-col gap-2 rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-4 py-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-zinc-100 truncate">{user.email || "Sem e-mail"}</span>
                        {isAdmin && (
                          <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                            Admin
                          </span>
                        )}
                        <span
                          className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded-full border ${
                            isOnline
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
                              : "bg-zinc-800/70 text-zinc-400 border-zinc-700/60"
                          }`}
                        >
                          {isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-zinc-500 break-all">{user.id}</div>
                    </div>

                    <div className="text-xs text-zinc-400 md:text-right">
                      <div>Criado em {user.created_at ? formatDate(user.created_at) : "-"}</div>
                      <div>Último acesso {user.last_login ? new Date(user.last_login).toLocaleString("pt-BR") : "-"}</div>
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

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card className="bg-zinc-900/40 border-zinc-800/40">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2 text-zinc-300">
          {icon} {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
