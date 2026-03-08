import React from "react";
import {
  CreditCard,
  Plus,
  CalendarDays,
  Wallet,
  BadgeDollarSign,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Card as CardType, Transaction } from "../types";
import { Card, CardContent } from "../components/ui/card";
import { formatCurrency } from "../lib/utils";
import { useProfile } from "../contexts/ProfileContext";
import { useLanguage } from "../contexts/LanguageContext";

interface CardsPageProps {
  cards: CardType[];
  transactions: Transaction[];
  onAddCard: () => void;
  onDeleteCard: (id: string) => void;
}

export function CardsPage({
  cards,
  transactions,
  onAddCard,
  onDeleteCard,
}: CardsPageProps) {
  const { currency } = useProfile();
  const { language } = useLanguage();

  const text = React.useMemo(() => {
    switch (language) {
      case "en-US":
        return {
          title: "Credit Cards",
          subtitle: "Manage your cards and invoices.",
          addCard: "New Card",
          noCards: "No cards registered",
          noCardsDescription:
            "Add your first credit card to start managing invoices and installments.",
          addFirstCard: "Add Card",
          limit: "Limit",
          closingDate: "Closing date",
          dueDate: "Due date",
          currentBill: "Current invoice",
          available: "Available",
          statusPaid: "Paid",
          statusOpen: "Open",
          delete: "Delete card",
        };
      case "es-ES":
        return {
          title: "Tarjetas de Crédito",
          subtitle: "Administra tus tarjetas y facturas.",
          addCard: "Nueva Tarjeta",
          noCards: "No hay tarjetas registradas",
          noCardsDescription:
            "Agrega tu primera tarjeta de crédito para comenzar a gestionar facturas y cuotas.",
          addFirstCard: "Agregar Tarjeta",
          limit: "Límite",
          closingDate: "Cierre",
          dueDate: "Vencimiento",
          currentBill: "Factura actual",
          available: "Disponible",
          statusPaid: "Pagada",
          statusOpen: "Abierta",
          delete: "Eliminar tarjeta",
        };
      default:
        return {
          title: "Cartões de Crédito",
          subtitle: "Gerencie seus cartões e faturas.",
          addCard: "Novo Cartão",
          noCards: "Nenhum cartão cadastrado",
          noCardsDescription:
            "Adicione seu primeiro cartão de crédito para começar a gerenciar faturas e parcelamentos.",
          addFirstCard: "Adicionar Cartão",
          limit: "Limite",
          closingDate: "Fechamento",
          dueDate: "Vencimento",
          currentBill: "Fatura atual",
          available: "Disponível",
          statusPaid: "Paga",
          statusOpen: "Em aberto",
          delete: "Apagar cartão",
        };
    }
  }, [language]);

  const cardBills = React.useMemo(() => {
    const bills = new Map<string, number>();

    transactions.forEach((tx) => {
      if (tx.type === "saida" && tx.cardId && !tx.isPlanned) {
        bills.set(tx.cardId, (bills.get(tx.cardId) || 0) + tx.amount);
      }
    });

    return bills;
  }, [transactions]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">{text.title}</h1>
          <p className="text-zinc-400 mt-1">{text.subtitle}</p>
        </div>

        <button
          type="button"
          onClick={onAddCard}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-zinc-200 transition w-full sm:w-auto"
        >
          <Plus size={16} />
          {text.addCard}
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/20 p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/60">
            <CreditCard size={28} className="text-zinc-500" />
          </div>

          <h2 className="text-xl font-semibold text-zinc-100">{text.noCards}</h2>
          <p className="mt-2 text-sm text-zinc-500 max-w-xl mx-auto">
            {text.noCardsDescription}
          </p>

          <button
            type="button"
            onClick={onAddCard}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-100 hover:bg-zinc-800"
          >
            <Plus size={16} />
            {text.addFirstCard}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cards.map((card) => {
            const currentBill = cardBills.get(card.id) || 0;
            const limit = Number((card as any).limit ?? 0);
            const available = Math.max(limit - currentBill, 0);
            const usagePercent = limit > 0 ? Math.min((currentBill / limit) * 100, 100) : 0;
            const color = (card as any).color ?? "#22c55e";
            const isPaid = currentBill <= 0;

            return (
              <div
                key={card.id}
                className="rounded-3xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.45)] overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${color}26 0%, rgba(24,24,27,0.96) 42%, rgba(9,9,11,1) 100%)`,
                }}
              >
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-400">
                        Nexo Card
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold text-zinc-50">{card.name}</h3>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border ${
                            isPaid
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                              : "border-amber-500/20 bg-amber-500/10 text-amber-300"
                          }`}
                        >
                          {isPaid ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                          {isPaid ? text.statusPaid : text.statusOpen}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteCard(card.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/15"
                    >
                      <Trash2 size={14} />
                      {text.delete}
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="bg-black/20 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                          <BadgeDollarSign size={14} />
                          <span>{text.limit}</span>
                        </div>
                        <p className="text-base font-semibold text-zinc-100">
                          {formatCurrency(limit, currency)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-black/20 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                          <CalendarDays size={14} />
                          <span>{text.closingDate}</span>
                        </div>
                        <p className="text-base font-semibold text-zinc-100">
                          {(card as any).closingDate ?? "-"}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-black/20 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                          <Wallet size={14} />
                          <span>{text.dueDate}</span>
                        </div>
                        <p className="text-base font-semibold text-zinc-100">
                          {(card as any).dueDate ?? "-"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-zinc-400">{text.currentBill}</p>
                        <p className="mt-1 text-2xl font-bold text-zinc-50">
                          {formatCurrency(currentBill, currency)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-zinc-400">{text.available}</p>
                        <p className="mt-1 text-lg font-semibold text-zinc-100">
                          {formatCurrency(available, currency)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 h-3 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${usagePercent}%`,
                          background: `linear-gradient(90deg, ${color} 0%, rgba(255,255,255,0.92) 100%)`,
                        }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                      <span>{formatCurrency(currentBill, currency)}</span>
                      <span>{formatCurrency(limit, currency)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}