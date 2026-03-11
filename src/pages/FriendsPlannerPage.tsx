import React, { useMemo, useState } from "react";
import { FriendsEvent } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { CheckCircle2, Plus, Trash2, Users } from "lucide-react";
import { formatDate, toDateInputValue } from "../lib/utils";
import { useLanguage } from "../contexts/LanguageContext";

type FriendsPlannerPageProps = {
  events: FriendsEvent[];
  onAddEvent: (event: Omit<FriendsEvent, "id" | "items" | "created_at">) => void;
  onDeleteEvent: (eventId: string) => void;
  onAddItem: (eventId: string, label: string, assignedTo: string) => void;
  onToggleItem: (eventId: string, itemId: string) => void;
  onDeleteItem: (eventId: string, itemId: string) => void;
};

export function FriendsPlannerPage({
  events,
  onAddEvent,
  onDeleteEvent,
  onAddItem,
  onToggleItem,
  onDeleteItem,
}: FriendsPlannerPageProps) {
  const { language } = useLanguage();

  const text =
    language === "en-US"
      ? {
          title: "With friends",
          subtitle:
            "Create events and organize who brings what. This is one of the viral parts of Nexo.",
          newEvent: "New event",
          eventName: "Event name",
          description: "Description",
          location: "Location",
          create: "Create event",
          empty: "No event created yet.",
        }
      : language === "es-ES"
      ? {
          title: "Con amigos",
          subtitle:
            "Crea eventos y organiza quién lleva qué. Esta es una de las partes virales de Nexo.",
          newEvent: "Nuevo evento",
          eventName: "Nombre del evento",
          description: "Descripción",
          location: "Lugar",
          create: "Crear evento",
          empty: "Todavía no hay eventos.",
        }
      : {
          title: "Com amigos",
          subtitle:
            "Crie eventos e organize quem vai levar o quê. Essa é uma das partes virais do Nexo.",
          newEvent: "Novo evento",
          eventName: "Nome do evento",
          description: "Descrição",
          location: "Local",
          create: "Criar evento",
          empty: "Nenhum evento criado ainda.",
        };

  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState(toDateInputValue(new Date()));
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const totalItems = useMemo(
    () => events.reduce((sum, event) => sum + event.items.length, 0),
    [events]
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
          {text.title}
        </h1>
        <p className="text-zinc-400 mt-1">{text.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900/40 border-zinc-800/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4 text-zinc-400">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/70 border border-zinc-700/60 flex items-center justify-center text-zinc-200">
                <Users size={18} />
              </div>
              <span className="text-sm">
                {language === "en-US"
                  ? "Organized items"
                  : language === "es-ES"
                  ? "Ítems organizados"
                  : "Itens organizados"}
              </span>
            </div>
            <div className="text-2xl font-semibold tracking-tight text-zinc-50">
              {totalItems}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800/40">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-100">{text.newEvent}</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!title.trim() || !eventDate) return;

                onAddEvent({
                  title: title.trim(),
                  eventDate,
                  location: location.trim() || undefined,
                  description: description.trim() || undefined,
                });

                setTitle("");
                setEventDate(toDateInputValue(new Date()));
                setLocation("");
                setDescription("");
              }}
            >
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={text.eventName}
                className="h-11 bg-zinc-950/60 border-zinc-800"
              />
              <Input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="h-11 bg-zinc-950/60 border-zinc-800"
              />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={text.location}
                className="h-11 bg-zinc-950/60 border-zinc-800"
              />
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={text.description}
                className="h-11 bg-zinc-950/60 border-zinc-800"
              />
              <Button type="submit" className="h-11">
                {text.create}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {events.length === 0 ? (
        <Card className="bg-zinc-900/40 border-zinc-800/40">
          <CardContent className="py-10 text-center text-zinc-400">
            {text.empty}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {events.map((event) => (
            <FriendsEventCard
              key={event.id}
              event={event}
              onDeleteEvent={onDeleteEvent}
              onAddItem={onAddItem}
              onToggleItem={onToggleItem}
              onDeleteItem={onDeleteItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FriendsEventCard({
  event,
  onDeleteEvent,
  onAddItem,
  onToggleItem,
  onDeleteItem,
}: {
  event: FriendsEvent;
  onDeleteEvent: (eventId: string) => void;
  onAddItem: (eventId: string, label: string, assignedTo: string) => void;
  onToggleItem: (eventId: string, itemId: string) => void;
  onDeleteItem: (eventId: string, itemId: string) => void;
}) {
  const { language } = useLanguage();
  const [label, setLabel] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const doneCount = event.items.filter((item) => item.status === "ok").length;

  return (
    <Card className="bg-zinc-900/40 border-zinc-800/40">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-lg text-zinc-100">{event.title}</CardTitle>
          <p className="mt-2 text-sm text-zinc-400">
            {formatDate(event.eventDate, language)}
            {event.location ? ` • ${event.location}` : ""}
          </p>
          {event.description ? (
            <p className="mt-2 text-sm text-zinc-500">{event.description}</p>
          ) : null}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDeleteEvent(event.id)}
          className="text-zinc-500 hover:text-rose-300"
        >
          <Trash2 size={16} />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 text-sm text-zinc-300">
          {language === "en-US"
            ? `${doneCount} of ${event.items.length} items confirmed`
            : language === "es-ES"
            ? `${doneCount} de ${event.items.length} ítems confirmados`
            : `${doneCount} de ${event.items.length} itens confirmados`}
        </div>

        <form
          className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!label.trim() || !assignedTo.trim()) return;
            onAddItem(event.id, label.trim(), assignedTo.trim());
            setLabel("");
            setAssignedTo("");
          }}
        >
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={
              language === "en-US"
                ? "Item"
                : language === "es-ES"
                ? "Ítem"
                : "Item"
            }
            className="h-11 bg-zinc-950/60 border-zinc-800"
          />
          <Input
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder={
              language === "en-US"
                ? "Who will bring it?"
                : language === "es-ES"
                ? "¿Quién lo llevará?"
                : "Quem vai levar?"
            }
            className="h-11 bg-zinc-950/60 border-zinc-800"
          />
          <Button type="submit" className="h-11">
            <Plus size={16} />
          </Button>
        </form>

        <div className="space-y-2">
          {event.items.length === 0 ? (
            <div className="text-sm text-zinc-500">
              {language === "en-US"
                ? "No items added yet."
                : language === "es-ES"
                ? "Todavía no hay ítems."
                : "Nenhum item adicionado ainda."}
            </div>
          ) : (
            event.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800/70 bg-zinc-900/50 px-3 py-3"
              >
                <div>
                  <div className="text-sm font-medium text-zinc-100">
                    {item.label}
                  </div>
                  <div className="text-xs text-zinc-400">{item.assignedTo}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleItem(event.id, item.id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition ${
                      item.status === "ok"
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    {item.status === "ok"
                      ? language === "en-US"
                        ? "Confirmed"
                        : language === "es-ES"
                        ? "Confirmado"
                        : "Confirmado"
                      : language === "en-US"
                      ? "Pending"
                      : language === "es-ES"
                      ? "Pendiente"
                      : "Pendente"}
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteItem(event.id, item.id)}
                    className="inline-flex items-center rounded-xl px-3 py-2 text-xs font-medium text-rose-300 border border-rose-500/20 bg-rose-500/10"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}