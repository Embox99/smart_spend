import { useState } from "react";
import Input from "../inputs/input";
import TextArea from "../inputs/TextArea";
import EmojiPickerPopup from "../EmojiPickerPopup";
import {
  EMPTY_EXPENSE_FORM,
  NOTE_MAX_LENGTH,
  type ExpenseFormValues,
} from "../../utils/transactionForm";

interface ExpenseFormProps {
  onSubmit: (expense: ExpenseFormValues) => void;
  /** Present when editing an existing record. */
  initialValues?: ExpenseFormValues;
  submitLabel?: string;
}

const ExpenseForm = ({
  onSubmit,
  initialValues,
  submitLabel = "Add Expense",
}: ExpenseFormProps) => {
  const [form, setForm] = useState<ExpenseFormValues>(
    initialValues ?? EMPTY_EXPENSE_FORM
  );

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
      <TextArea
        value={form.note}
        onChange={({ target }) => set("note", target.value)}
        label="Note (optional)"
        placeholder="What was this for?"
        maxLength={NOTE_MAX_LENGTH}
      />
      <div className="flex justify-end mt-6">
        <button
          className="add-btn add-btn-fill"
          type="button"
          onClick={() => onSubmit(form)}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
};

export default ExpenseForm;
