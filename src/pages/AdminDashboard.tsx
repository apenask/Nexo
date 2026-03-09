import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Users, UserCheck, UserX, RefreshCw, ShieldAlert, Wrench } from "lucide-react";
import { Button } from "../components/ui/button";
import { useProfile } from "../contexts/ProfileContext";
import { formatDate } from "../lib/utils";

type MetricsRow = {
  total_users: number;
  online_users: number;
  offline_users: number;
};

type RecentUserRow = {
  id: string;
  email: string | null;
  created_at: string | null;
  last_login: string | null;
  is_admin: boolean | null;
  role: string | null;
  is_online: boolean;
  presence_last_seen: string | null;
};

export function AdminDashboard() {
  const { profile } = useProfile();
  const [metrics, setMetrics] = useState<MetricsRow>({
    total_users: 0,
    online_users: 0,
    offline_users: 0,
  });
  const [recentUsers, setRecentUsers] = useState<RecentUserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isTogglingMaintenance, setIsTogglingMaintenance] = useState(false);

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const syncRes = await supabase.rpc("sync_profiles_from_auth");
    if (syncRes.error) {
      console.warn("Não foi possível sincronizar profiles com auth.users:", syncRes.error.message);
    }

    const [metricsRes, recentUsersRes, settingsRes] = await Promise.all([
      supabase.rpc("admin_dashboard_metrics"),
      supabase.rpc("admin_recent_users", { limit_count: 20 }),
      supabase.rpc("get_maintenance_mode"),
    ]);

    if (metricsRes.error) {
      setErrorMessage(
        metricsRes.error.message.includes("permission")
          ? "Seu banco ainda não liberou o painel admin. Rode o SQL mais recente do pacote e tente novamente."
          : metricsRes.error.message
      );
      setMetrics({ total_users: 0, online_users: 0, offline_users: 0 });
      setRecentUsers([]);
      setIsLoading(false);
      return;
    }

    if (recentUsersRes.error) {
      setErrorMessage(
        recentUsersRes.error.message.includes("permission")
          ? "Seu banco ainda não liberou a listagem admin. Rode o SQL mais recente do pacote e tente novamente."
          : recentUsersRes.error.message
      );
      setRecentUsers([]);
    } else {
      setRecentUsers((recentUsersRes.data ?? []) as RecentUserRow[]);
    }

    if (!settingsRes.error) {
      setMaintenanceMode(Boolean(settingsRes.data));
    }

    const rawMetrics = metricsRes.data as MetricsRow | MetricsRow[] | null;
    const metricsRow = (Array.isArray(rawMetrics) ? rawMetrics[0] : rawMetrics) ?? {
      total_users: 0,
      online_users: 0,
      offline_users: 0,
    };

    setMetrics(metricsRow);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!profile?.isAdmin) return;

    loadAdminData();

    const channel = supabase
      .channel("admin-live-metrics")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => loadAdminData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_presence" },
        () => loadAdminData()
      )
      .subscribe();

    const interval = window.setInterval(() => {
      loadAdminData();
    }, 8000);

    return () => {
      window.clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [profile?.isAdmin, loadAdminData]);

  const onlineCount = useMemo(() => Number(metrics.online_users || 0), [metrics.online_users]);
  const totalCount = useMemo(() => Number(metrics.total_users || 0), [metrics.total_users]);
  const offlineCount = useMemo(
    () => Math.max(Number(metrics.offline_users || 0), totalCount - onlineCount, 0),
    [metrics.offline_users, totalCount, onlineCount]
  );


  const toggleMaintenanceMode = async () => {
    setIsTogglingMaintenance(true);
    setErrorMessage(null);

    const nextValue = !maintenanceMode;

    const { error } = await supabase.rpc("set_maintenance_mode", {
      enabled: nextValue,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setMaintenanceMode(nextValue);
    }

    setIsTogglingMaintenance(false);
  };

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
          <p className="text-zinc-400 mt-1">
            Acompanhe em tempo quase real quantas contas estão usando a plataforma.
          </p>
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

      <Card className="bg-zinc-900/40 border-zinc-800/40">
        <CardContent className="p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-400/15 flex items-center justify-center text-amber-200">
              <Wrench size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-100">Modo manutenção</div>
              <p className="mt-1 text-sm text-zinc-400">Quando ativado, apenas contas admin continuam acessando o app. Os demais usuários veem a tela de manutenção.</p>
            </div>
          </div>

          <Button
            onClick={toggleMaintenanceMode}
            disabled={isTogglingMaintenance}
            className={maintenanceMode ? "bg-amber-300 text-zinc-950 hover:bg-amber-200" : "bg-white text-zinc-950 hover:bg-zinc-200"}
          >
            {isTogglingMaintenance ? "Salvando..." : maintenanceMode ? "Desativar manutenção" : "Ativar manutenção"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Users size={16} />} label="Usuários cadastrados" value={totalCount} />
        <StatCard icon={<UserCheck size={16} />} label="Online agora" value={onlineCount} />
        <StatCard icon={<UserX size={16} />} label="Offline agora" value={offlineCount} />
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
                            user.is_online
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
                              : "bg-zinc-800/70 text-zinc-400 border-zinc-700/60"
                          }`}
                        >
                          {user.is_online ? "Online" : "Offline"}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-zinc-500 break-all">{user.id}</div>
                    </div>

                    <div className="text-xs text-zinc-400 md:text-right">
                      <div>Criado em {user.created_at ? formatDate(user.created_at) : "-"}</div>
                      <div>
                        Último login {user.last_login ? new Date(user.last_login).toLocaleString("pt-BR") : "-"}
                      </div>
                      <div>
                        Última presença {user.presence_last_seen ? new Date(user.presence_last_seen).toLocaleString("pt-BR") : "-"}
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

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="bg-zinc-900/40 border-zinc-800/40">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4 text-zinc-400">
          <div className="w-9 h-9 rounded-xl bg-zinc-800/70 border border-zinc-700/60 flex items-center justify-center text-zinc-200">
            {icon}
          </div>
          <span className="text-sm">{label}</span>
        </div>
        <div className="text-3xl font-semibold tracking-tight text-zinc-50">{value}</div>
      </CardContent>
    </Card>
  );
}
