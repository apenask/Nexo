import React from "react";
import {
  LayoutDashboard,
  ArrowRightLeft,
  CalendarClock,
  Tags,
  BarChart3,
  Menu,
  X,
  CreditCard,
  Repeat,
  LogOut,
  Settings,
  ShieldAlert,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { useProfile } from "../../contexts/ProfileContext";
import { useLanguage } from "../../contexts/LanguageContext";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { profile } = useProfile();
  const { language } = useLanguage();

  const text = React.useMemo(() => {
    switch (language) {
      case "en-US":
        return {
          dashboard: "Dashboard",
          transactions: "Transactions",
          planned: "Planning",
          recurring: "Recurring",
          categories: "Categories",
          cards: "Cards",
          reports: "Reports",
          goals: "Goals",
          challenges: "Challenges",
          planner: "With friends",
          settings: "Settings",
          logout: "Sign out",
          dev: "Admin",
        };
      case "es-ES":
        return {
          dashboard: "Panel",
          transactions: "Transacciones",
          planned: "Planificación",
          recurring: "Recurrentes",
          categories: "Categorías",
          cards: "Tarjetas",
          reports: "Informes",
          goals: "Metas",
          challenges: "Desafíos",
          planner: "Con amigos",
          settings: "Configuración",
          logout: "Cerrar sesión",
          dev: "Admin",
        };
      case "pt-BR":
      default:
        return {
          dashboard: "Dashboard",
          transactions: "Transações",
          planned: "Planejamento",
          recurring: "Recorrentes",
          categories: "Categorias",
          cards: "Cartões",
          reports: "Relatórios",
          goals: "Metas",
          challenges: "Desafios",
          planner: "Com amigos",
          settings: "Configurações",
          logout: "Sair da conta",
          dev: "Admin",
        };
    }
  }, [language]);

  const NAV_ITEMS = [
    { id: "dashboard", label: text.dashboard, icon: LayoutDashboard },
    { id: "transactions", label: text.transactions, icon: ArrowRightLeft },
    { id: "planned", label: text.planned, icon: CalendarClock },
    { id: "recurring", label: text.recurring, icon: Repeat },
    { id: "categories", label: text.categories, icon: Tags },
    { id: "cards", label: text.cards, icon: CreditCard },
    { id: "reports", label: text.reports, icon: BarChart3 },
    { id: "goals", label: text.goals, icon: Target },
    { id: "challenges", label: text.challenges, icon: Trophy },
    { id: "friends-planner", label: text.planner, icon: Users },
  ];

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      if (language === "en-US") {
        toast.success("You have signed out.");
      } else if (language === "es-ES") {
        toast.success("Has cerrado sesión.");
      } else {
        toast.success("Você saiu da sua conta.");
      }
    } catch (error: any) {
      if (language === "en-US") {
        toast.error("Error signing out: " + error.message);
      } else if (language === "es-ES") {
        toast.error("Error al cerrar sesión: " + error.message);
      } else {
        toast.error("Erro ao sair: " + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col md:flex-row">
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center">
            <span className="text-zinc-950 font-bold text-lg">N</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">Nexo</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-zinc-400 hover:text-zinc-50"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside
        className={cn(
          "fixed left-0 top-[72px] bottom-0 z-40 w-64 border-r border-zinc-800/50 bg-zinc-950/95 backdrop-blur-xl transform transition-transform duration-300 ease-in-out md:relative md:top-0 md:bottom-auto md:translate-x-0 flex flex-col",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="hidden md:flex items-center gap-3 p-6">
          <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center">
            <span className="text-zinc-950 font-bold text-lg">N</span>
          </div>
          <span className="font-semibold text-xl tracking-tight">Nexo</span>
        </div>

        <nav className="flex flex-col gap-2 px-4 py-4 md:py-2 flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-zinc-800/50 text-zinc-50 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                )}
              >
                <Icon
                  size={18}
                  className={cn(isActive ? "text-zinc-50" : "text-zinc-500")}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-zinc-800/50 flex flex-col gap-2">
          {profile?.isAdmin && (
            <button
              onClick={() => {
                setActiveTab("admin");
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                activeTab === "admin"
                  ? "bg-zinc-800/50 text-zinc-50 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              )}
            >
              <ShieldAlert
                size={18}
                className={cn(
                  activeTab === "admin" ? "text-zinc-50" : "text-zinc-500"
                )}
              />
              {text.dev}
            </button>
          )}

          <button
            onClick={() => {
              setActiveTab("settings");
              setIsMobileMenuOpen(false);
            }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              activeTab === "settings"
                ? "bg-zinc-800/50 text-zinc-50 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
            )}
          >
            <Settings
              size={18}
              className={cn(
                activeTab === "settings" ? "text-zinc-50" : "text-zinc-500"
              )}
            />
            {text.settings}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
          >
            <LogOut size={18} />
            {text.logout}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto w-full pb-6 md:pb-0">
        <div className="max-w-5xl mx-auto p-4 md:p-8">{children}</div>
      </main>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}