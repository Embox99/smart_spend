import { useState } from "react";
import Input from "../inputs/input";
import EmojiPickerPopup from "../EmojiPickerPopup";

export interface ExpenseFormValues {
  category: string;
  amount: string;
  date: string;
  icon: string;
}

const EMPTY: ExpenseFormValues = {
  category: "",
  amount: "",
  date: "",
  icon: "",
};

interface AddExpenseFormProps {
  onAddExpense: (expense: ExpenseFormValues) => void;
}

const AddExpenseForm = ({ onAddExpense }: AddExpenseFormProps) => {
  const [form, setForm] = useState<ExpenseFormValues>(EMPTY);

  const set = <K extends keyof ExpenseFormValues>(
    key: K,
    value: ExpenseFormValues[K]
  ) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div>
      <EmojiPickerPopup
        icon={form.icon}
        onSelect={(selectedIcon) => set("icon", selectedIcon)}
      />
      <Input
        value={form.category}
        onChange={({ target }) => set("category", target.value)}
        label="Category"
        placeholder="Rent, Groceries, etc"
        type="text"
      />
      <Input
        value={form.amount}
        onChange={({ target }) => set("amount", target.value)}
        label="Amount"
        type="number"
      />
      <Input
        value={form.date}
        onChange={({ target }) => set("date", target.value)}
        label="Date"
        type="date"
      />
      <div className="flex justify-end mt-6">
        <button
          className="add-btn add-btn-fill"
          type="button"
          onClick={() => onAddExpense(form)}
        >
          Add Expense
        </button>
      </div>
    </div>
  );
};

export default AddExpenseForm;
