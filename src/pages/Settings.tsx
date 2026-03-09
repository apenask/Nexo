import React from "react";
import { supabase } from "../lib/supabase";
import { useProfile } from "../contexts/ProfileContext";
import { useLanguage, Language } from "../contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Settings, Mail, ShieldCheck, Wallet, Save, Languages, Activity } from "lucide-react";
import { toast } from "sonner";

type CurrencyOption = "BRL" | "USD" | "EUR";

const currencyOptions: { value: CurrencyOption; label: string; symbol: string }[] = [
  { value: "BRL", label: "Real Brasileiro", symbol: "R$" },
  { value: "USD", label: "Dólar Americano", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
];

const languageByCurrency: Record<CurrencyOption, Language> = {
  BRL: "pt-BR",
  USD: "en-US",
  EUR: "es-ES",
};

export function SettingsPage() {
  const { profile, currency, refreshProfile } = useProfile();
  const { language, setLanguage, t } = useLanguage();

  const [selectedCurrency, setSelectedCurrency] = React.useState<CurrencyOption>(
    (currency as CurrencyOption) || "BRL"
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [showLanguagePrompt, setShowLanguagePrompt] = React.useState(false);

  const isPresenceOnline = React.useMemo(() => {
    if (!profile?.last_seen) return false;
    return Date.now() - new Date(profile.last_seen).getTime() < 60_000;
  }, [profile?.last_seen]);

  React.useEffect(() => {
    if (currency) {
      setSelectedCurrency(currency as CurrencyOption);
    }
  }, [currency]);

  const saveCurrencyOnly = async () => {
    if (!profile?.id) {
      toast.error(t("toast.userNotIdentified"));
      return;
    }

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from("profiles")
        .update({ preferred_currency: selectedCurrency })
        .eq("id", profile.id);

      if (error) throw error;

      if (refreshProfile) {
        await refreshProfile();
      }

      toast.success(t("toast.currencyUpdated"));
    } catch (error: any) {
      console.error("Erro ao atualizar moeda:", error);
      toast.error(error?.message || "Erro ao atualizar moeda.");
    } finally {
      setIsSaving(false);
      setShowLanguagePrompt(false);
    }
  };

  const handleSaveCurrency = async () => {
    if (!profile?.id) {
      toast.error(t("toast.userNotIdentified"));
      return;
    }

    setShowLanguagePrompt(true);
  };

  const handleKeepLanguage = async () => {
    await saveCurrencyOnly();
  };

  const handleChangeLanguageToo = async () => {
    await saveCurrencyOnly();

    const nextLanguage = languageByCurrency[selectedCurrency];
    if (nextLanguage !== language) {
      setLanguage(nextLanguage);
      toast.success(t("toast.languageUpdated"));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">{t("settings.title")}</h1>
        <p className="text-zinc-400 mt-1">{t("settings.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-1 bg-zinc-900/40 border-zinc-800/40">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-zinc-100 flex items-center gap-2">
              <Settings size={20} className="text-indigo-400" />
              {t("settings.account")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Mail size={16} className="text-zinc-400" />
                <span className="text-sm text-zinc-400">{t("settings.email")}</span>
              </div>
              <p className="text-sm font-medium text-zinc-100 break-all">
                {profile?.email || "Não disponível"}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="text-sm text-zinc-400">{t("settings.accountType")}</span>
              </div>
              <p className="text-sm font-medium text-zinc-100">
                {profile?.isAdmin ? t("settings.admin") : t("settings.user")}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Activity size={16} className={isPresenceOnline ? "text-emerald-400" : "text-zinc-500"} />
                <span className="text-sm text-zinc-400">Status da presença</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex h-2.5 w-2.5 rounded-full ${
                    isPresenceOnline ? "bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.8)]" : "bg-zinc-600"
                  }`}
                />
                <p className="text-sm font-medium text-zinc-100">
                  {isPresenceOnline ? "Online agora" : "Offline no momento"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2 bg-zinc-900/40 border-zinc-800/40">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-zinc-100 flex items-center gap-2">
              <Wallet size={20} className="text-emerald-400" />
              {t("settings.currencyTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-zinc-400 mb-4">{t("settings.currencyDescription")}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currencyOptions.map((option) => {
                  const isActive = selectedCurrency === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedCurrency(option.value)}
                      className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                        isActive
                          ? "border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]"
                          : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-zinc-100">{option.symbol}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            isActive
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {option.value}
                        </span>
                      </div>

                      <p className="mt-3 text-sm font-medium text-zinc-100">{option.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div>
                <p className="text-sm text-zinc-400">{t("settings.selectedCurrency")}</p>
                <p className="text-base font-semibold text-zinc-100 mt-1">
                  {currencyOptions.find((item) => item.value === selectedCurrency)?.label} (
                  {selectedCurrency})
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveCurrency}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-zinc-200 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {isSaving ? "Salvando..." : t("settings.saveCurrency")}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {showLanguagePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-zinc-900 p-2 border border-zinc-800">
                <Languages size={18} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">
                  {t("settings.languagePrompt.title")}
                </h3>
                <p className="text-sm text-zinc-400">
                  {t("settings.languagePrompt.description")}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-300">
              {t("settings.languagePrompt.body")}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={() => setShowLanguagePrompt(false)}
                className="rounded-xl border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-900"
              >
                {t("settings.languagePrompt.cancel")}
              </button>

              <button
                type="button"
                onClick={handleKeepLanguage}
                disabled={isSaving}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-100 hover:bg-zinc-800 disabled:opacity-60"
              >
                {t("settings.languagePrompt.keep")}
              </button>

              <button
                type="button"
                onClick={handleChangeLanguageToo}
                disabled={isSaving}
                className="rounded-xl bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
              >
                {t("settings.languagePrompt.change")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}