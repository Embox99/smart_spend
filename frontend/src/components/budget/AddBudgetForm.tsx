import { useId, useState } from "react";
import Input from "../inputs/input";
import EmojiPickerPopup from "../EmojiPickerPopup";

export interface BudgetPayload {
  category: string;
  limit: number;
  month: string;
  icon: string;
}

const currentMonth = (): string => new Date().toISOString().slice(0, 7);

interface AddBudgetFormProps {
  onAdd: (budget: BudgetPayload) => void;
}

const AddBudgetForm = ({ onAdd }: AddBudgetFormProps) => {
  const [form, setForm] = useState({
    category: "",
    limit: "",
    month: currentMonth(),
    icon: "",
  });
  const [error, setError] = useState("");
  const monthId = useId();

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    setError("");
    if (!form.category.trim()) {
      setError("Category is required");
      return;
    }
    const limit = Number(form.limit);
    if (!form.limit || isNaN(limit) || limit <= 0) {
      setError("Enter a valid limit greater than 0");
      return;
    }
    if (!form.month) {
      setError("Month is required");
      return;
    }
    onAdd({ ...form, limit });
  };

  return (
    <div>
      <EmojiPickerPopup icon={form.icon} onSelect={(v) => set("icon", v)} />

      <Input
        label="Category"
        placeholder="Food, Rent, Transport…"
        type="text"
        value={form.category}
        onChange={({ target }) => set("category", target.value)}
      />

      <Input
        label="Monthly limit ($)"
        placeholder="500"
        type="number"
        value={form.limit}
        onChange={({ target }) => set("limit", target.value)}
      />

      <div>
        <label
          htmlFor={monthId}
          className="text-[13px] text-slate-700 dark:text-slate-300"
        >
          Month
        </label>
        <input
          id={monthId}
          type="month"
          value={form.month}
          onChange={(e) => set("month", e.target.value)}
          className="input-box"
        />
      </div>

      {error && <p className="text-red-500 text-xs mt-1 mb-2">{error}</p>}

      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={handleSubmit}
        >
          Save Budget
        </button>
      </div>
    </div>
  );
};

export default AddBudgetForm;
