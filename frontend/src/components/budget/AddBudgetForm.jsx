import { useState } from "react";
import Input from "../inputs/input";
import EmojiPickerPopup from "../EmojiPickerPopup";

const currentMonth = () => new Date().toISOString().slice(0, 7);

const AddBudgetForm = ({ onAdd }) => {
  const [form, setForm] = useState({
    category: "",
    limit: "",
    month: currentMonth(),
    icon: "",
  });
  const [error, setError] = useState("");

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = () => {
    setError("");
    if (!form.category.trim()) { setError("Category is required"); return; }
    if (!form.limit || isNaN(form.limit) || Number(form.limit) <= 0) {
      setError("Enter a valid limit greater than 0");
      return;
    }
    if (!form.month) { setError("Month is required"); return; }
    onAdd({ ...form, limit: Number(form.limit) });
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

      {/* Month picker — native <input type="month"> */}
      <div>
        <label className="text-[13px] text-slate-700 dark:text-slate-300">Month</label>
        <input
          type="month"
          value={form.month}
          onChange={(e) => set("month", e.target.value)}
          className="input-box"
        />
      </div>

      {error && <p className="text-red-500 text-xs mt-1 mb-2">{error}</p>}

      <div className="flex justify-end mt-6">
        <button type="button" className="add-btn add-btn-fill" onClick={handleSubmit}>
          Save Budget
        </button>
      </div>
    </div>
  );
};

export default AddBudgetForm;
