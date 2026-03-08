import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthSelectorProps {
  selectedMonth: Date;
  onChange: (date: Date) => void;
}

export function MonthSelector({ selectedMonth, onChange }: MonthSelectorProps) {
  const handlePrev = () => onChange(subMonths(selectedMonth, 1));
  const handleNext = () => onChange(addMonths(selectedMonth, 1));

  return (
    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-full sm:w-64">
      <button
        onClick={handlePrev}
        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <ChevronLeft size={20} />
      </button>
      <div className="flex-1 text-center font-medium capitalize text-zinc-100">
        {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
      </div>
      <button
        onClick={handleNext}
        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
