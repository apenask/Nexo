import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Profile } from "../types";
import { supabase } from "../lib/supabase";

export type CurrencyType = "BRL" | "USD" | "EUR";

interface ProfileContextType {
  profile: Profile | null;
  currency: CurrencyType;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: React.ReactNode;
  initialProfile: Profile | null;
}

export function ProfileProvider({ children, initialProfile }: ProfileProviderProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const refreshProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      const isAdmin = Boolean(data.is_admin) || data.role === "admin";

      const mappedProfile: Profile = {
        id: data.id,
        email: data.email ?? "",
        created_at: data.created_at ?? new Date().toISOString(),
        last_login: data.last_login ?? null,
        preferred_currency: data.preferred_currency ?? "BRL",
        role: isAdmin ? "admin" : "user",
        isAdmin,
        last_seen: data.last_seen ?? null,
      };

      setProfile(mappedProfile);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    }
  };

  const currency = useMemo<CurrencyType>(() => {
    return (profile?.preferred_currency as CurrencyType) || "BRL";
  }, [profile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        currency,
        setProfile,
        refreshProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile deve ser usado dentro de um ProfileProvider");
  }

  return context;
}
