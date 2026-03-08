import { Category, Transaction } from "../types";

export const MOCK_CATEGORIES: Category[] = [
  { id: "cat_1", name: "Alimentação", color: "#f43f5e", budgetPercentage: 20 }, // rose-500
  { id: "cat_2", name: "Transporte", color: "#eab308", budgetPercentage: 10 }, // yellow-500
  { id: "cat_3", name: "Lazer", color: "#8b5cf6", budgetPercentage: 15 }, // violet-500
  { id: "cat_4", name: "Saúde", color: "#10b981", budgetPercentage: 10 }, // emerald-500
  { id: "cat_5", name: "Casa", color: "#3b82f6", budgetPercentage: 25 }, // blue-500
  { id: "cat_6", name: "Trabalho", color: "#6366f1", budgetPercentage: 0 }, // indigo-500
  { id: "cat_7", name: "Outros", color: "#71717a", budgetPercentage: 5 }, // zinc-500
];

const today = new Date();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

function createDate(day: number, monthOffset = 0) {
  return new Date(currentYear, currentMonth + monthOffset, day).toISOString();
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tx_1",
    type: "entrada",
    amount: 15000,
    date: createDate(1),
    description: "Salário",
    categoryId: "cat_6",
  },
  {
    id: "tx_2",
    type: "saida",
    amount: 2500,
    date: createDate(5),
    description: "Aluguel",
    categoryId: "cat_5",
  },
  {
    id: "tx_3",
    type: "saida",
    amount: 450,
    date: createDate(8),
    description: "Supermercado",
    categoryId: "cat_1",
  },
  {
    id: "tx_4",
    type: "saida",
    amount: 120,
    date: createDate(10),
    description: "Uber",
    categoryId: "cat_2",
  },
  {
    id: "tx_5",
    type: "saida",
    amount: 350,
    date: createDate(12),
    description: "Restaurante",
    categoryId: "cat_3",
  },
  {
    id: "tx_6",
    type: "entrada",
    amount: 1200,
    date: createDate(15),
    description: "Freela",
    categoryId: "cat_6",
  },
  {
    id: "tx_7",
    type: "saida",
    amount: 180,
    date: createDate(18),
    description: "Farmácia",
    categoryId: "cat_4",
  },
  // Planned transactions (future)
  {
    id: "tx_8",
    type: "saida",
    amount: 300,
    date: createDate(25),
    description: "Conta de Luz",
    categoryId: "cat_5",
    isPlanned: true,
  },
  {
    id: "tx_9",
    type: "saida",
    amount: 150,
    date: createDate(28),
    description: "Internet",
    categoryId: "cat_5",
    isPlanned: true,
  },
  {
    id: "tx_10",
    type: "entrada",
    amount: 5000,
    date: createDate(1, 1), // Next month
    description: "Bônus",
    categoryId: "cat_6",
    isPlanned: true,
  },
];
