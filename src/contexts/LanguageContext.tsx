import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "pt-BR" | "en-US" | "es-ES";

type TranslationKeys =
  | "settings.title"
  | "settings.subtitle"
  | "settings.account"
  | "settings.email"
  | "settings.accountType"
  | "settings.admin"
  | "settings.user"
  | "settings.currencyTitle"
  | "settings.currencyDescription"
  | "settings.selectedCurrency"
  | "settings.saveCurrency"
  | "settings.languagePrompt.title"
  | "settings.languagePrompt.description"
  | "settings.languagePrompt.body"
  | "settings.languagePrompt.cancel"
  | "settings.languagePrompt.keep"
  | "settings.languagePrompt.change"
  | "toast.currencyUpdated"
  | "toast.languageUpdated"
  | "toast.userNotIdentified";

type Translations = Record<Language, Record<TranslationKeys, string>>;

const translations: Translations = {
  "pt-BR": {
    "settings.title": "Configurações",
    "settings.subtitle": "Gerencie sua conta e preferências do sistema.",
    "settings.account": "Minha conta",
    "settings.email": "E-mail",
    "settings.accountType": "Tipo de conta",
    "settings.admin": "Administrador",
    "settings.user": "Usuário",
    "settings.currencyTitle": "Preferência de moeda",
    "settings.currencyDescription":
      "Escolha a moeda principal do sistema. Ao salvar, o dashboard, relatórios e transações passarão a exibir os valores com essa moeda.",
    "settings.selectedCurrency": "Moeda selecionada",
    "settings.saveCurrency": "Salvar moeda",
    "settings.languagePrompt.title": "Mudar idioma também?",
    "settings.languagePrompt.description":
      "Você alterou a moeda. Deseja trocar o idioma do sistema também?",
    "settings.languagePrompt.body":
      "A moeda será salva agora. Você pode manter o idioma atual ou trocar o idioma do sistema.",
    "settings.languagePrompt.cancel": "Cancelar",
    "settings.languagePrompt.keep": "Permanecer no idioma atual",
    "settings.languagePrompt.change": "Mudar idioma também",
    "toast.currencyUpdated": "Moeda atualizada com sucesso!",
    "toast.languageUpdated": "Idioma atualizado com sucesso!",
    "toast.userNotIdentified": "Não foi possível identificar o usuário.",
  },
  "en-US": {
    "settings.title": "Settings",
    "settings.subtitle": "Manage your account and system preferences.",
    "settings.account": "My account",
    "settings.email": "Email",
    "settings.accountType": "Account type",
    "settings.admin": "Administrator",
    "settings.user": "User",
    "settings.currencyTitle": "Currency preference",
    "settings.currencyDescription":
      "Choose the main system currency. After saving, the dashboard, reports, and transactions will display values using this currency.",
    "settings.selectedCurrency": "Selected currency",
    "settings.saveCurrency": "Save currency",
    "settings.languagePrompt.title": "Change language too?",
    "settings.languagePrompt.description":
      "You changed the currency. Do you also want to change the system language?",
    "settings.languagePrompt.body":
      "The currency will be saved now. You can keep the current language or switch the system language.",
    "settings.languagePrompt.cancel": "Cancel",
    "settings.languagePrompt.keep": "Keep current language",
    "settings.languagePrompt.change": "Change language too",
    "toast.currencyUpdated": "Currency updated successfully!",
    "toast.languageUpdated": "Language updated successfully!",
    "toast.userNotIdentified": "Could not identify the user.",
  },
  "es-ES": {
    "settings.title": "Configuración",
    "settings.subtitle": "Administra tu cuenta y las preferencias del sistema.",
    "settings.account": "Mi cuenta",
    "settings.email": "Correo electrónico",
    "settings.accountType": "Tipo de cuenta",
    "settings.admin": "Administrador",
    "settings.user": "Usuario",
    "settings.currencyTitle": "Preferencia de moneda",
    "settings.currencyDescription":
      "Elige la moneda principal del sistema. Al guardar, el panel, los informes y las transacciones mostrarán los valores con esa moneda.",
    "settings.selectedCurrency": "Moneda seleccionada",
    "settings.saveCurrency": "Guardar moneda",
    "settings.languagePrompt.title": "¿Cambiar idioma también?",
    "settings.languagePrompt.description":
      "Has cambiado la moneda. ¿Deseas cambiar también el idioma del sistema?",
    "settings.languagePrompt.body":
      "La moneda se guardará ahora. Puedes mantener el idioma actual o cambiar el idioma del sistema.",
    "settings.languagePrompt.cancel": "Cancelar",
    "settings.languagePrompt.keep": "Mantener idioma actual",
    "settings.languagePrompt.change": "Cambiar idioma también",
    "toast.currencyUpdated": "¡Moneda actualizada con éxito!",
    "toast.languageUpdated": "¡Idioma actualizado con éxito!",
    "toast.userNotIdentified": "No se pudo identificar al usuario.",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>("pt-BR");

  useEffect(() => {
    const saved = localStorage.getItem("nexo-language") as Language | null;
    if (saved && translations[saved]) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    localStorage.setItem("nexo-language", nextLanguage);
  };

  const t = useMemo(
    () => (key: TranslationKeys) => translations[language][key] ?? key,
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage deve ser usado dentro de um LanguageProvider");
  }

  return context;
}