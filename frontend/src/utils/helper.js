import { format, parseISO } from "date-fns";

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const getInitials = (name) => {
  if (!name) return "";
  const words = name.split(" ");
  let initials = "";
  for (let i = 0; i < Math.min(words.length, 2); i++) {
    initials += words[i][0];
  }
  return initials.toUpperCase();
};

export const addThousandsSeparator = (num) => {
  if (num == null || isNaN(num)) return "";
  const [integerPart, fractionalPart] = num.toString().split(".");
  const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fractionalPart ? `${formatted}.${fractionalPart}` : formatted;
};

const formatDate = (date) => {
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "do MMM");
  } catch {
    return String(date);
  }
};

export const prepareExpenseBarChartData = (data = []) =>
  data.map((item) => ({
    category: item?.category,
    amount: item?.amount,
  }));

export const prepareIncomeBarChartData = (data = []) =>
  [...data]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((item) => ({
      month: formatDate(item?.date),
      amount: item?.amount,
    }));

export const prepareExpenseLineChartData = (data = []) =>
  [...data]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((item) => ({
      month: formatDate(item?.date),
      amount: item?.amount,
      category: item?.category,
    }));
