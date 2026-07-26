import { useState } from "react";
import Input from "../inputs/input";
import EmojiPickerPopup from "../EmojiPickerPopup";

export interface IncomeFormValues {
  source: string;
  amount: string;
  date: string;
  icon: string;
}

const EMPTY: IncomeFormValues = { source: "", amount: "", date: "", icon: "" };

interface AddIncomeFormProps {
  onAddIncome: (income: IncomeFormValues) => void;
}

const AddIncomeForm = ({ onAddIncome }: AddIncomeFormProps) => {
  const [form, setForm] = useState<IncomeFormValues>(EMPTY);

  const set = <K extends keyof IncomeFormValues>(
    key: K,
    value: IncomeFormValues[K]
  ) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div>
      <EmojiPickerPopup
        icon={form.icon}
        onSelect={(selectedIcon) => set("icon", selectedIcon)}
      />
      <Input
        value={form.source}
        onChange={({ target }) => set("source", target.value)}
        label="Income Source"
        placeholder="Freelance, Salary, etc"
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
          type="button"
          className="add-btn add-btn-fill"
          onClick={() => onAddIncome(form)}
        >
          Add Income
        </button>
      </div>
    </div>
  );
};

export default AddIncomeForm;
