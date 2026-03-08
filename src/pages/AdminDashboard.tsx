import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Users, Activity, UserCheck, UserX, CreditCard, Tags, ArrowRightLeft } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  created_at: string;
  last_login: string | null;
}

export function AdminDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [cardsCount, setCardsCount] = useState(0);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    const { data: profilesData } = await supabase.from("profiles").select("*");
    const { count: txCount } = await supabase.from("transactions").select("*", { count: "exact", head: true });
    const { count: catCount } = await supabase.from("categories").select("*", { count: "exact", head: true });
    const { count: cardsCount } = await supabase.from("cards").select("*", { count: "exact", head: true });

    if (profilesData) setProfiles(profilesData);
    if (txCount) setTransactionsCount(txCount);
    if (catCount) setCategoriesCount(catCount);
    if (cardsCount) setCardsCount(cardsCount);
  };

  const today = new Date();

  const activeToday = profiles.filter((p) => {
    if (!p.last_login) return false;
    const login = new Date(p.last_login);
    return login.toDateString() === today.toDateString();
  }).length;

  const active30Days = profiles.filter((p) => {
    if (!p.last_login) return false;
    const login = new Date(p.last_login);
    const diff = today.getTime() - login.getTime();
    return diff <= 30 * 24 * 60 * 60 * 1000;
  }).length;

  const onlineUsers = profiles.filter((p) => {
    if (!p.last_login) return false;
    const login = new Date(p.last_login);
    const diff = today.getTime() - login.getTime();
    return diff <= 5 * 60 * 1000;
  }).length;

  const offlineUsers = profiles.length - onlineUsers;

  const recentUsers = [...profiles]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Dev</h1>
        <p className="text-zinc-400 mt-1">Métricas e monitoramento do sistema.</p>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card className="bg-zinc-900/40 border-zinc-800/40">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-zinc-300">
              <Users size={16} /> Usuários cadastrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{profiles.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800/40">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-zinc-300">
              <UserCheck size={16} /> Ativos hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeToday}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800/40">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-zinc-300">
              <Activity size={16} /> Ativos 30 dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{active30Days}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800/40">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-zinc-300">
              <UserCheck size={16} /> Online
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{onlineUsers}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800/40">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-zinc-300">
              <UserX size={16} /> Offline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{offlineUsers}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800/40">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-zinc-300">
              <ArrowRightLeft size={16} /> Transações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{transactionsCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800/40">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-zinc-300">
              <Tags size={16} /> Categorias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{categoriesCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800/40">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-zinc-300">
              <CreditCard size={16} /> Cartões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{cardsCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Usuários recentes */}
      <Card className="bg-zinc-900/40 border-zinc-800/40">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-100">Usuários recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between border-b border-zinc-800 pb-2"
              >
                <span className="text-zinc-300">{user.email}</span>
                <span className="text-xs text-zinc-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}