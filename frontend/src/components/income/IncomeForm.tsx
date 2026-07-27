import { useState } from "react";
import Input from "../inputs/input";
import TextArea from "../inputs/TextArea";
import EmojiPickerPopup from "../EmojiPickerPopup";
import {
  EMPTY_INCOME_FORM,
  NOTE_MAX_LENGTH,
  type IncomeFormValues,
} from "../../utils/transactionForm";

interface IncomeFormProps {
  onSubmit: (income: IncomeFormValues) => void;
  /** Present when editing an existing record. */
  initialValues?: IncomeFormValues;
  submitLabel?: string;
}

const IncomeForm = ({
  onSubmit,
  initialValues,
  submitLabel = "Add Income",
}: IncomeFormProps) => {
  const [form, setForm] = useState<IncomeFormValues>(
    initialValues ?? EMPTY_INCOME_FORM
  );

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
      <TextArea
        value={form.note}
        onChange={({ target }) => set("note", target.value)}
        label="Note (optional)"
        placeholder="What was this for?"
        maxLength={NOTE_MAX_LENGTH}
      />
      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={() => onSubmit(form)}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
};

export default IncomeForm;
