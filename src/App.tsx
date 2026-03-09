/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";

import { supabase } from "./lib/supabase";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { TransactionsPage } from "./pages/Transactions";
import { PlannedExpensesPage } from "./pages/PlannedExpenses";
import { CategoriesPage } from "./pages/Categories";
import { ReportsPage } from "./pages/Reports";
import { CardsPage } from "./pages/Cards";
import { RecurringTransactionsPage } from "./pages/RecurringTransactions";
import { SettingsPage } from "./pages/Settings";
import { AdminDashboard } from "./pages/AdminDashboard";
import { GoalsPage } from "./pages/GoalsPage";
import { Auth } from "./pages/Auth";

import { AddTransactionModal } from "./components/AddTransactionModal";
import { AddCategoryModal } from "./components/AddCategoryModal";
import { AddCardModal } from "./components/AddCardModal";
import { AddRecurringModal } from "./components/AddRecurringModal";

import {
  Transaction,
  Category,
  Card,
  RecurringTransaction,
  Profile,
  Goal,
  GoalContribution,
} from "./types";
import { ProfileProvider } from "./contexts/ProfileContext";
import { LanguageProvider } from "./contexts/LanguageContext";

type DbProfile = {
  id: string;
  email: string | null;
  created_at: string | null;
  last_login: string | null;
  last_seen?: string | null;
  preferred_currency: string | null;
  role: string | null;
  is_admin?: boolean | null;
};

type DbCategory = {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  budget_percentage: number | null;
  created_at?: string | null;
};

type DbCard = {
  id: string;
  user_id: string;
  name: string;
  limit_amount: number | null;
  closing_date: number | null;
  due_date: number | null;
  color?: string | null;
  created_at?: string | null;
};

type DbRecurringTransaction = {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  description: string | null;
  category_id: string | null;
  start_date: string | null;
  recurrence_type: string | null;
  status: string | null;
  notes: string | null;
  created_at?: string | null;
};

type DbTransaction = {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  description: string | null;
  date: string | null;
  category_id: string | null;
  card_id: string | null;
  is_planned: boolean | null;
  installment_index: number | null;
  installment_count: number | null;
  installment_group_id: string | null;
  recurring_transaction_id: string | null;
  created_at?: string | null;
};

type DbGoal = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number | null;
  target_date: string | null;
  created_at?: string | null;
};

type DbGoalContribution = {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  contribution_date: string | null;
  notes: string | null;
  created_at?: string | null;
};

function mapProfile(db: DbProfile): Profile {
  const isAdmin = Boolean(db.is_admin) || db.role === "admin";

  return {
    id: db.id,
    email: db.email ?? "",
    created_at: db.created_at ?? new Date().toISOString(),
    last_login: db.last_login,
    preferred_currency: db.preferred_currency ?? "BRL",
    role: isAdmin ? "admin" : "user",
    isAdmin,
    last_seen: db.last_seen ?? null,
  };
}

function mapCategory(db: DbCategory): Category {
  return {
    id: db.id,
    name: db.name,
    color: db.color ?? "#22c55e",
    budgetPercentage: Number(db.budget_percentage ?? 0),
  };
}

function mapCard(db: DbCard): Card {
  return {
    id: db.id,
    name: db.name,
    limit: Number(db.limit_amount ?? 0),
    closingDate: Number(db.closing_date ?? 1),
    dueDate: Number(db.due_date ?? 10),
    color: db.color ?? "#22c55e",
  } as Card;
}

function mapRecurringTransaction(db: DbRecurringTransaction): RecurringTransaction {
  return {
    id: db.id,
    type: db.type as "entrada" | "saida",
    amount: Number(db.amount ?? 0),
    description: db.description ?? "",
    categoryId: db.category_id ?? "",
    startDate: db.start_date ?? new Date().toISOString().split("T")[0],
    recurrenceType: (db.recurrence_type ?? "mensal") as
      | "mensal"
      | "semanal"
      | "anual",
    status: (db.status ?? "active") as "active" | "paused",
    notes: db.notes ?? "",
  };
}

function mapTransaction(db: DbTransaction): Transaction {
  return {
    id: db.id,
    type: db.type as "entrada" | "saida",
    amount: Number(db.amount ?? 0),
    description: db.description ?? "",
    date: db.date ?? new Date().toISOString(),
    categoryId: db.category_id ?? "",
    cardId: db.card_id ?? undefined,
    isPlanned: Boolean(db.is_planned),
    installmentIndex: db.installment_index ?? undefined,
    installmentCount: db.installment_count ?? undefined,
    installmentGroupId: db.installment_group_id ?? undefined,
    recurringTransactionId: db.recurring_transaction_id ?? undefined,
  };
}

function mapGoal(db: DbGoal): Goal {
  return {
    id: db.id,
    name: db.name,
    targetAmount: Number(db.target_amount ?? 0),
    currentAmount: Number(db.current_amount ?? 0),
    targetDate: db.target_date ?? undefined,
    created_at: db.created_at ?? null,
  };
}

function mapGoalContribution(db: DbGoalContribution): GoalContribution {
  return {
    id: db.id,
    goalId: db.goal_id,
    amount: Number(db.amount ?? 0),
    contributionDate: db.contribution_date ?? new Date().toISOString().split("T")[0],
    notes: db.notes ?? undefined,
    created_at: db.created_at ?? null,
  };
}

export default function App() {
  const [session, setSession] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isBooting, setIsBooting] = useState(true);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<
    RecurringTransaction[]
  >([]);

  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalContributions, setGoalContributions] = useState<GoalContribution[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(
    null
  );
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isAddRecurringModalOpen, setIsAddRecurringModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;
        setSession(session?.user ?? null);
      } catch (error) {
        console.error("Erro ao obter sessão:", error);
      } finally {
        if (mounted) setIsBooting(false);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadAppSettings = async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("maintenance_mode")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        console.warn("Não foi possível carregar app_settings:", error.message);
        return;
      }

      if (isMounted) {
        setMaintenanceMode(Boolean(data?.maintenance_mode));
      }
    };

    loadAppSettings();

    const channel = supabase
      .channel("app-settings-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_settings" },
        () => {
          void loadAppSettings();
        }
      )
      .subscribe();

    const interval = window.setInterval(() => {
      void loadAppSettings();
    }, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!session?.id) {
      setProfile(null);
      setTransactions([]);
      setCategories([]);
      setCards([]);
      setRecurringTransactions([]);
      setGoals([]);
      setGoalContributions([]);
      return;
    }

    syncAll(session).catch((error) => {
      console.error("Erro ao sincronizar dados iniciais:", error);
    });
  }, [session?.id]);

  useEffect(() => {
    if (!session?.id) return;

    let cancelled = false;
    let lastPresenceWrite = 0;
    const PRESENCE_WINDOW_MS = 45 * 1000;
    const HEARTBEAT_MS = 15 * 1000;

    const writePresence = async (isOnline = true, force = false) => {
      if (cancelled) return;

      const now = Date.now();
      if (!force && isOnline && now - lastPresenceWrite < 8_000) {
        return;
      }

      lastPresenceWrite = now;
      const nowIso = new Date(now).toISOString();
      const expiresAtIso = new Date(now + PRESENCE_WINDOW_MS).toISOString();

      const [{ error: profileError }, { error: presenceError }] = await Promise.all([
        supabase
          .from("profiles")
          .update({ last_seen: nowIso })
          .eq("id", session.id),
        supabase
          .from("user_presence")
          .upsert(
            {
              user_id: session.id,
              is_online: isOnline,
              last_seen: nowIso,
              expires_at: isOnline ? expiresAtIso : nowIso,
              updated_at: nowIso,
            },
            { onConflict: "user_id" }
          ),
      ]);

      if (profileError) {
        console.warn("Não foi possível atualizar last_seen do profile:", profileError.message);
      }

      if (presenceError) {
        console.warn("Não foi possível atualizar presença:", presenceError.message);
      }

      setProfile((current) =>
        current
          ? {
              ...current,
              last_seen: nowIso,
            }
          : current
      );
    };

    const markOnline = (force = false) => {
      void writePresence(true, force);
    };

    const markOffline = () => {
      void writePresence(false, true);
    };

    ensureUserProfile(session)
      .catch((error) => {
        console.error("Erro ao garantir profile antes da presença:", error);
      })
      .finally(() => {
        markOnline(true);
      });

    const heartbeat = window.setInterval(() => {
      markOnline();
    }, HEARTBEAT_MS);

    const handleWindowFocus = () => {
      markOnline(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        markOnline(true);
      }
    };

    const activityHandler = () => {
      markOnline();
    };

    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("pointerdown", activityHandler, { passive: true });
    window.addEventListener("keydown", activityHandler);
    window.addEventListener("touchstart", activityHandler, { passive: true });
    window.addEventListener("beforeunload", markOffline);
    window.addEventListener("pagehide", markOffline);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      markOffline();
      cancelled = true;
      window.clearInterval(heartbeat);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("pointerdown", activityHandler);
      window.removeEventListener("keydown", activityHandler);
      window.removeEventListener("touchstart", activityHandler);
      window.removeEventListener("beforeunload", markOffline);
      window.removeEventListener("pagehide", markOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [session?.id]);

  const syncAll = async (user: User) => {
    await ensureUserProfile(user);
    await loadUserData(user.id);
  };

  const ensureUserProfile = async (user: User) => {
    const now = new Date().toISOString();

    const { data: existingProfile, error: selectError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (selectError) {
      console.error("Erro ao buscar profile:", selectError);
    }

    if (!existingProfile) {
      const newProfile = {
        id: user.id,
        email: user.email ?? "",
        created_at: now,
        last_login: now,
        last_seen: now,
        preferred_currency: "BRL",
        role: "user",
        is_admin: false,
      };

      const { error: insertError } = await supabase.from("profiles").insert(newProfile);

      if (insertError) {
        console.error("Erro ao criar profile:", insertError);
        setProfile({
          id: user.id,
          email: user.email ?? "",
          created_at: now,
          last_login: now,
          preferred_currency: "BRL",
          role: "user",
          isAdmin: false,
          last_seen: now,
        });
        return;
      }

      setProfile(mapProfile(newProfile));
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        email: user.email ?? existingProfile.email,
        last_login: now,
        last_seen: now,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Erro ao atualizar profile:", updateError);
    }

    setProfile(
      mapProfile({
        ...existingProfile,
        email: user.email ?? existingProfile.email,
        last_login: now,
        last_seen: now,
      })
    );
  };

  const loadUserData = async (userId: string) => {
    const results = await Promise.allSettled([
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false }),
      supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("cards")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("recurring_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("goal_contributions")
        .select("*")
        .eq("user_id", userId)
        .order("contribution_date", { ascending: false }),
    ]);

    const [transactionsRes, categoriesRes, cardsRes, recurringRes, goalsRes, goalContributionsRes] = results;

    if (transactionsRes.status === "fulfilled" && !transactionsRes.value.error) {
      setTransactions((transactionsRes.value.data ?? []).map(mapTransaction));
    }

    if (categoriesRes.status === "fulfilled" && !categoriesRes.value.error) {
      setCategories((categoriesRes.value.data ?? []).map(mapCategory));
    }

    if (cardsRes.status === "fulfilled" && !cardsRes.value.error) {
      setCards((cardsRes.value.data ?? []).map(mapCard));
    }

    if (recurringRes.status === "fulfilled" && !recurringRes.value.error) {
      setRecurringTransactions((recurringRes.value.data ?? []).map(mapRecurringTransaction));
    }

    if (goalsRes.status === "fulfilled" && !goalsRes.value.error) {
      setGoals((goalsRes.value.data ?? []).map(mapGoal));
    }

    if (goalContributionsRes.status === "fulfilled" && !goalContributionsRes.value.error) {
      setGoalContributions((goalContributionsRes.value.data ?? []).map(mapGoalContribution));
    }
  };

  const handleAddTransaction = async (
    newTx: Omit<Transaction, "id"> | Omit<Transaction, "id">[]
  ) => {
    if (!session?.id) return;

    try {
      if (Array.isArray(newTx)) {
        const payload = newTx.map((tx) => ({
          user_id: session.id,
          type: tx.type,
          amount: tx.amount,
          description: tx.description ?? "",
          date: tx.date,
          category_id: tx.categoryId || null,
          card_id: tx.cardId || null,
          is_planned: tx.isPlanned ?? false,
          installment_index: tx.installmentIndex ?? null,
          installment_count: tx.installmentCount ?? null,
          installment_group_id: tx.installmentGroupId ?? null,
          recurring_transaction_id: tx.recurringTransactionId ?? null,
        }));

        const { data, error } = await supabase
          .from("transactions")
          .insert(payload)
          .select("*");

        if (error) throw error;

        setTransactions((prev) => [...(data ?? []).map(mapTransaction), ...prev]);
        toast.success("Transações adicionadas com sucesso!");
      } else {
        const payload = {
          user_id: session.id,
          type: newTx.type,
          amount: newTx.amount,
          description: newTx.description ?? "",
          date: newTx.date,
          category_id: newTx.categoryId || null,
          card_id: newTx.cardId || null,
          is_planned: newTx.isPlanned ?? false,
          installment_index: newTx.installmentIndex ?? null,
          installment_count: newTx.installmentCount ?? null,
          installment_group_id: newTx.installmentGroupId ?? null,
          recurring_transaction_id: newTx.recurringTransactionId ?? null,
        };

        const { data, error } = await supabase
          .from("transactions")
          .insert(payload)
          .select("*")
          .single();

        if (error) throw error;

        setTransactions((prev) => [mapTransaction(data), ...prev]);
        toast.success("Transação adicionada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      toast.error("Erro ao salvar transação.");
    }
  };

  const handleConfirmPlanned = async (tx: Transaction) => {
    if (!session?.id) return;

    try {
      if (tx.id.startsWith("proj_")) {
        const payload = {
          user_id: session.id,
          type: tx.type,
          amount: tx.amount,
          description: tx.description ?? "",
          date: tx.date,
          category_id: tx.categoryId || null,
          card_id: tx.cardId || null,
          is_planned: false,
          installment_index: tx.installmentIndex ?? null,
          installment_count: tx.installmentCount ?? null,
          installment_group_id: tx.installmentGroupId ?? null,
          recurring_transaction_id: tx.recurringTransactionId ?? null,
        };

        const { data, error } = await supabase
          .from("transactions")
          .insert(payload)
          .select("*")
          .single();

        if (error) throw error;

        setTransactions((prev) => [mapTransaction(data), ...prev]);
      } else {
        const { data, error } = await supabase
          .from("transactions")
          .update({ is_planned: false })
          .eq("id", tx.id)
          .select("*")
          .single();

        if (error) throw error;

        setTransactions((prev) =>
          prev.map((t) => (t.id === tx.id ? mapTransaction(data) : t))
        );
      }

      toast.success("Transação confirmada!");
    } catch (error) {
      console.error("Erro ao confirmar transação:", error);
      toast.error("Erro ao confirmar transação.");
    }
  };

  const handleAddCategory = async (newCat: Omit<Category, "id">) => {
    if (!session?.id) return;

    try {
      const payload = {
        user_id: session.id,
        name: newCat.name,
        color: newCat.color,
        budget_percentage: newCat.budgetPercentage ?? 0,
      };

      const { data, error } = await supabase
        .from("categories")
        .insert(payload)
        .select("*")
        .single();

      if (error) throw error;

      setCategories((prev) => [mapCategory(data), ...prev]);
      toast.success("Categoria adicionada com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      toast.error("Erro ao salvar categoria.");
    }
  };

  const handleUpdateCategory = async (updatedCategory: Category) => {
    try {
      const payload = {
        name: updatedCategory.name,
        color: updatedCategory.color,
        budget_percentage: updatedCategory.budgetPercentage ?? 0,
      };

      const { data, error } = await supabase
        .from("categories")
        .update(payload)
        .eq("id", updatedCategory.id)
        .select("*")
        .single();

      if (error) throw error;

      setCategories((prev) =>
        prev.map((c) => (c.id === updatedCategory.id ? mapCategory(data) : c))
      );

      toast.success("Categoria atualizada!");
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      toast.error("Erro ao atualizar categoria.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) throw error;

      setCategories((prev) => prev.filter((category) => category.id !== id));
      toast.success("Categoria removida com sucesso!");
    } catch (error) {
      console.error("Erro ao remover categoria:", error);
      toast.error("Erro ao remover categoria.");
    }
  };

  const openEditCategoryModal = (category: Category) => {
    setEditingCategory(category);
    setIsAddCategoryModalOpen(true);
  };

  const handleAddCard = async (newCard: Omit<Card, "id">) => {
    if (!session?.id) return;

    try {
      const payload = {
        user_id: session.id,
        name: newCard.name,
        limit_amount: Number((newCard as any).limit ?? 0),
        closing_date: Number((newCard as any).closingDate ?? 1),
        due_date: Number((newCard as any).dueDate ?? 10),
        color: (newCard as any).color ?? "#22c55e",
      };

      const { data, error } = await supabase
        .from("cards")
        .insert(payload)
        .select("*")
        .single();

      if (error) {
        console.error("Erro detalhado ao salvar cartão:", error);
        throw error;
      }

      setCards((prev) => [mapCard(data as DbCard), ...prev]);
      toast.success("Cartão adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar cartão:", error);
      toast.error("Erro ao salvar cartão.");
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      const { error } = await supabase.from("cards").delete().eq("id", id);
      if (error) throw error;

      setCards((prev) => prev.filter((card) => card.id !== id));
      toast.success("Cartão removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover cartão:", error);
      toast.error("Erro ao remover cartão.");
    }
  };

  const handleAddRecurring = async (newRt: Omit<RecurringTransaction, "id">) => {
    if (!session?.id) return;

    try {
      const payload = {
        user_id: session.id,
        type: newRt.type,
        amount: newRt.amount,
        description: newRt.description ?? "",
        category_id: newRt.categoryId || null,
        start_date: newRt.startDate,
        recurrence_type: newRt.recurrenceType,
        status: newRt.status ?? "active",
        notes: newRt.notes ?? "",
      };

      const { data, error } = await supabase
        .from("recurring_transactions")
        .insert(payload)
        .select("*")
        .single();

      if (error) throw error;

      setRecurringTransactions((prev) => [mapRecurringTransaction(data), ...prev]);
      toast.success("Transação recorrente criada!");
    } catch (error) {
      console.error("Erro ao salvar recorrente:", error);
      toast.error("Erro ao salvar transação recorrente.");
    }
  };

  const handleUpdateRecurring = async (updatedRt: RecurringTransaction) => {
    try {
      const payload = {
        type: updatedRt.type,
        amount: updatedRt.amount,
        description: updatedRt.description ?? "",
        category_id: updatedRt.categoryId || null,
        start_date: updatedRt.startDate,
        recurrence_type: updatedRt.recurrenceType,
        status: updatedRt.status ?? "active",
        notes: updatedRt.notes ?? "",
      };

      const { data, error } = await supabase
        .from("recurring_transactions")
        .update(payload)
        .eq("id", updatedRt.id)
        .select("*")
        .single();

      if (error) throw error;

      setRecurringTransactions((prev) =>
        prev.map((rt) => (rt.id === updatedRt.id ? mapRecurringTransaction(data) : rt))
      );
      toast.success("Transação recorrente atualizada!");
    } catch (error) {
      console.error("Erro ao atualizar recorrente:", error);
      toast.error("Erro ao atualizar recorrente.");
    }
  };

  const handleDeleteRecurring = async (id: string) => {
    try {
      const { error } = await supabase
        .from("recurring_transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setRecurringTransactions((prev) => prev.filter((rt) => rt.id !== id));
      toast.success("Transação recorrente removida!");
    } catch (error) {
      console.error("Erro ao remover recorrente:", error);
      toast.error("Erro ao remover recorrente.");
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;

      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success("Transação removida!");
    } catch (error) {
      console.error("Erro ao remover transação:", error);
      toast.error("Erro ao remover transação.");
    }
  };

  const handleUpdateTransaction = async (updatedTx: Transaction) => {
    try {
      const payload = {
        type: updatedTx.type,
        amount: updatedTx.amount,
        description: updatedTx.description ?? "",
        date: updatedTx.date,
        category_id: updatedTx.categoryId || null,
        card_id: updatedTx.cardId || null,
        is_planned: updatedTx.isPlanned ?? false,
        installment_index: updatedTx.installmentIndex ?? null,
        installment_count: updatedTx.installmentCount ?? null,
        installment_group_id: updatedTx.installmentGroupId ?? null,
        recurring_transaction_id: updatedTx.recurringTransactionId ?? null,
      };

      const { data, error } = await supabase
        .from("transactions")
        .update(payload)
        .eq("id", updatedTx.id)
        .select("*")
        .single();

      if (error) throw error;

      setTransactions((prev) =>
        prev.map((t) => (t.id === updatedTx.id ? mapTransaction(data) : t))
      );
      toast.success("Transação atualizada!");
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
      toast.error("Erro ao atualizar transação.");
    }
  };

  const openEditTransactionModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  const handleAddGoal = async (goal: Omit<Goal, "id" | "currentAmount" | "created_at">) => {
    if (!session?.id) return;

    try {
      const payload = {
        user_id: session.id,
        name: goal.name,
        target_amount: goal.targetAmount,
        current_amount: 0,
        target_date: goal.targetDate || null,
      };

      const { data, error } = await supabase
        .from("goals")
        .insert(payload)
        .select("*")
        .single();

      if (error) throw error;

      setGoals((prev) => [mapGoal(data as DbGoal), ...prev]);
      toast.success("Meta criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar meta:", error);
      toast.error("Erro ao criar meta.");
    }
  };

  const handleAddGoalContribution = async (goalId: string, amount: number, contributionDate?: string, notes?: string) => {
    if (!session?.id) return;

    try {
      const payload = {
        user_id: session.id,
        goal_id: goalId,
        amount,
        contribution_date: contributionDate || new Date().toISOString().split("T")[0],
        notes: notes || null,
      };

      const { data, error } = await supabase
        .from("goal_contributions")
        .insert(payload)
        .select("*")
        .single();

      if (error) throw error;

      setGoalContributions((prev) => [mapGoalContribution(data as DbGoalContribution), ...prev]);
      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === goalId
            ? { ...goal, currentAmount: Number(goal.currentAmount ?? 0) + Number(amount) }
            : goal
        )
      );
      toast.success("Valor adicionado à meta!");
    } catch (error) {
      console.error("Erro ao adicionar valor à meta:", error);
      toast.error("Erro ao adicionar valor à meta.");
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase.from("goals").delete().eq("id", goalId);
      if (error) throw error;

      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
      setGoalContributions((prev) => prev.filter((item) => item.goalId !== goalId));
      toast.success("Meta removida.");
    } catch (error) {
      console.error("Erro ao remover meta:", error);
      toast.error("Erro ao remover meta.");
    }
  };

  const getProjectedTransactions = (): Transaction[] => {
    const projected: Transaction[] = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    recurringTransactions.forEach((rt) => {
      if (rt.status !== "active") return;

      const startDate = new Date(rt.startDate);

      for (let i = 0; i < 12; i++) {
        const projectedDate = new Date(startDate);

        if (rt.recurrenceType === "mensal") {
          projectedDate.setMonth(startDate.getMonth() + i);
        } else if (rt.recurrenceType === "anual") {
          projectedDate.setFullYear(startDate.getFullYear() + i);
        } else if (rt.recurrenceType === "semanal") {
          projectedDate.setDate(startDate.getDate() + i * 7);
        }

        if (
          projectedDate < new Date(currentYear + 1, currentMonth, 1) &&
          projectedDate >= startDate
        ) {
          const exists = transactions.some((t) => {
            if (t.recurringTransactionId !== rt.id) return false;
            const tDate = new Date(t.date);

            if (rt.recurrenceType === "mensal" || rt.recurrenceType === "anual") {
              return (
                tDate.getMonth() === projectedDate.getMonth() &&
                tDate.getFullYear() === projectedDate.getFullYear()
              );
            }

            return t.date.startsWith(projectedDate.toISOString().split("T")[0]);
          });

          if (!exists) {
            projected.push({
              id: `proj_${rt.id}_${projectedDate.getTime()}`,
              type: rt.type,
              amount: rt.amount,
              date: projectedDate.toISOString(),
              description: rt.description,
              categoryId: rt.categoryId,
              isPlanned: true,
              recurringTransactionId: rt.id,
            });
          }
        }
      }
    });

    return projected;
  };

  const allTransactions = useMemo(
    () =>
      [...transactions, ...getProjectedTransactions()].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [transactions, recurringTransactions]
  );

  const dashboardFallback = (
    <Dashboard
      transactions={allTransactions}
      categories={categories}
      cards={cards}
      onAddTransaction={() => {
        setEditingTransaction(null);
        setIsAddModalOpen(true);
      }}
      onConfirmPlanned={handleConfirmPlanned}
      selectedMonth={selectedMonth}
      onMonthChange={setSelectedMonth}
      onDeleteTransaction={handleDeleteTransaction}
      onUpdateTransaction={openEditTransactionModal}
    />
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return dashboardFallback;

      case "transactions":
        return (
          <TransactionsPage
            transactions={allTransactions}
            categories={categories}
            cards={cards}
            onAddTransaction={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            onConfirmPlanned={handleConfirmPlanned}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            onDeleteTransaction={handleDeleteTransaction}
            onUpdateTransaction={openEditTransactionModal}
          />
        );

      case "planned":
        return (
          <PlannedExpensesPage
            transactions={allTransactions}
            categories={categories}
            cards={cards}
            onAddTransaction={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            onConfirmPlanned={handleConfirmPlanned}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            onDeleteTransaction={handleDeleteTransaction}
            onUpdateTransaction={openEditTransactionModal}
          />
        );

      case "recurring":
        return (
          <RecurringTransactionsPage
            recurringTransactions={recurringTransactions}
            categories={categories}
            onAdd={() => setIsAddRecurringModalOpen(true)}
            onUpdate={handleUpdateRecurring}
            onDelete={handleDeleteRecurring}
          />
        );

      case "categories":
        return (
          <CategoriesPage
            categories={categories}
            onAddCategory={() => {
              setEditingCategory(null);
              setIsAddCategoryModalOpen(true);
            }}
            onUpdateCategory={openEditCategoryModal}
            onDeleteCategory={handleDeleteCategory}
            transactions={allTransactions}
          />
        );

      case "cards":
        return (
          <CardsPage
            cards={cards}
            transactions={allTransactions}
            onAddCard={() => setIsAddCardModalOpen(true)}
            onDeleteCard={handleDeleteCard}
          />
        );

      case "reports":
        return (
          <ReportsPage
            transactions={allTransactions}
            categories={categories}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        );

      case "goals":
        return (
          <GoalsPage
            goals={goals}
            contributions={goalContributions}
            onAddGoal={handleAddGoal}
            onAddContribution={handleAddGoalContribution}
            onDeleteGoal={handleDeleteGoal}
          />
        );

      case "settings":
        return <SettingsPage />;

      case "admin":
        return profile?.isAdmin ? <AdminDashboard /> : dashboardFallback;

      default:
        return dashboardFallback;
    }
  };

  if (isBooting) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <Toaster theme="dark" position="top-right" />
        <Auth />
      </>
    );
  }

  if (maintenanceMode && profile && !profile.isAdmin) {
    return (
      <>
        <Toaster theme="dark" position="top-right" />
        <MaintenanceScreen />
      </>
    );
  }

  return (
    <LanguageProvider>
      <ProfileProvider initialProfile={profile}>
        <Toaster theme="dark" position="top-right" />
        <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
          {renderContent()}
        </Layout>

        <AddTransactionModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingTransaction(null);
          }}
          onAdd={handleAddTransaction}
          onUpdate={handleUpdateTransaction}
          categories={categories}
          cards={cards}
          initialData={editingTransaction}
        />

        <AddCategoryModal
          isOpen={isAddCategoryModalOpen}
          onClose={() => {
            setIsAddCategoryModalOpen(false);
            setEditingCategory(null);
          }}
          onAdd={handleAddCategory}
          onUpdate={handleUpdateCategory}
          initialData={editingCategory}
          categories={categories}
        />

        <AddCardModal
          isOpen={isAddCardModalOpen}
          onClose={() => setIsAddCardModalOpen(false)}
          onAdd={handleAddCard}
        />

        {isAddRecurringModalOpen && (
          <AddRecurringModal
            isOpen={isAddRecurringModalOpen}
            onClose={() => setIsAddRecurringModalOpen(false)}
            onAdd={handleAddRecurring}
            categories={categories}
          />
        )}
      </ProfileProvider>
    </LanguageProvider>
  );
}

function MaintenanceScreen() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-white/[0.03] p-8 text-center shadow-[0_30px_120px_-48px_rgba(99,102,241,0.45)] backdrop-blur-2xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-amber-400/15 bg-amber-500/10 text-amber-200">🔧</div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Nexo em manutenção</h1>
        <p className="mt-3 text-sm leading-7 text-zinc-400">Estamos aplicando melhorias e ajustes para deixar a experiência ainda melhor. Volte em breve.</p>
      </div>
    </div>
  );
}
