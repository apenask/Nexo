import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Users, UserCheck, UserX, RefreshCw, ShieldAlert } from "lucide-react";
import { Button } from "../components/ui/button";
import { useProfile } from "../contexts/ProfileContext";
import { formatDate } from "../lib/utils";

type AdminProfileRow = {
  id: string;
  email: string | null;
  created_at: string | null;
  last_login: string | null;
  is_admin?: boolean | null;
  role?: string | null;
};

type PresenceRow = {
  user_id: string;
  is_online: boolean | null;
  last_seen: string | null;
  expires_at: string | null;
};

const ONLINE_WINDOW_MS = 90 * 1000;

export function AdminDashboard() {
  const { profile } = useProfile();
  const [profiles, setProfiles] = useState<AdminProfileRow[]>([]);
  const [presenceRows, setPresenceRows] = useState<PresenceRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const [profilesRes, presenceRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, created_at, last_login, is_admin, role")
        .order("created_at", { ascending: false }),
      supabase
        .from("user_presence")
        .select("user_id, is_online, last_seen, expires_at"),
    ]);

    if (profilesRes.error) {
      setErrorMessage(
        profilesRes.error.message.includes("permission")
          ? "Seu banco ainda não liberou leitura admin para profiles. Rode o SQL do pacote e tente novamente."
          : profilesRes.error.message
      );
      setProfiles([]);
      setPresenceRows([]);
      setIsLoading(false);
      return;
    }

    if (presenceRes.error) {
      setErrorMessage(
        presenceRes.error.message.includes("permission")
          ? "Seu banco ainda não liberou leitura admin para user_presence. Rode o SQL do pacote e tente novamente."
          : presenceRes.error.message
      );
      setPresenceRows([]);
    } else {
      setPresenceRows(presenceRes.data ?? []);
    }

    setProfiles(profilesRes.data ?? []);
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
        () => {
          loadAdminData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_presence" },
        () => {
          loadAdminData();
        }
      )
      .subscribe();

    const interval = window.setInterval(() => {
      loadAdminData();
    }, 15000);

    return () => {
      window.clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [profile?.isAdmin, loadAdminData]);

  const presenceMap = useMemo(() => {
    return new Map(presenceRows.map((item) => [item.user_id, item]));
  }, [presenceRows]);

  const metrics = useMemo(() => {
    const now = Date.now();

    const onlineUsers = profiles.filter((item) => {
      const presence = presenceMap.get(item.id);
      if (!presence?.expires_at) return false;
      const expiresAt = new Date(presence.expires_at).getTime();
      return Boolean(presence.is_online) && expiresAt > now - ONLINE_WINDOW_MS;
    }).length;

    const totalUsers = profiles.length;
    const offlineUsers = Math.max(totalUsers - onlineUsers, 0);

    return {
      totalUsers,
      onlineUsers,
      offlineUsers,
    };
  }, [profiles, presenceMap]);

  const recentUsers = useMemo(() => {
    return profiles.slice(0, 20).map((user) => {
      const presence = presenceMap.get(user.id);
      const isOnline = Boolean(presence?.is_online) && Boolean(presence?.expires_at) && new Date(presence!.expires_at as string).getTime() > Date.now() - ONLINE_WINDOW_MS;

      return {
        ...user,
        isOnline,
        presenceLastSeen: presence?.last_seen ?? null,
      };
    });
  }, [profiles, presenceMap]);

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
          <p className="text-zinc-400 mt-1">Acompanhe em tempo quase real quantas contas estão usando a plataforma.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Users size={16} />} label="Usuários cadastrados" value={metrics.totalUsers} />
        <StatCard icon={<UserCheck size={16} />} label="Online agora" value={metrics.onlineUsers} />
        <StatCard icon={<UserX size={16} />} label="Offline agora" value={metrics.offlineUsers} />
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
                            user.isOnline
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
                              : "bg-zinc-800/70 text-zinc-400 border-zinc-700/60"
                          }`}
                        >
                          {user.isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-zinc-500 break-all">{user.id}</div>
                    </div>

                    <div className="text-xs text-zinc-400 md:text-right">
                      <div>Criado em {user.created_at ? formatDate(user.created_at) : "-"}</div>
                      <div>Último login {user.last_login ? new Date(user.last_login).toLocaleString("pt-BR") : "-"}</div>
                      <div>Última presença {user.presenceLastSeen ? new Date(user.presenceLastSeen).toLocaleString("pt-BR") : "-"}</div>
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
