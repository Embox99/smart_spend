import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Expense } from "@shared/types";
import ExpenseForm from "./ExpenseForm";
import { toExpenseFormValues } from "../../utils/transactionForm";
import { ThemeProvider } from "../../context/themeContext";

const expense: Expense = {
  _id: "e1",
  userId: "u1",
  category: "Coffee",
  amount: 7.5,
  date: "2024-03-15T00:00:00.000Z",
  icon: "https://cdn.example.com/i.png",
  createdAt: "",
  updatedAt: "",
};

const renderForm = (props: Partial<Parameters<typeof ExpenseForm>[0]> = {}) => {
  const onSubmit = vi.fn();
  render(
    <ThemeProvider>
      <ExpenseForm onSubmit={onSubmit} {...props} />
    </ThemeProvider>
  );
  return { onSubmit };
};

describe("toExpenseFormValues", () => {
  it("maps a record onto the form, taking the UTC day", () => {
    expect(toExpenseFormValues(expense)).toEqual({
      category: "Coffee",
      amount: "7.5",
      date: "2024-03-15",
      icon: "https://cdn.example.com/i.png",
    });
  });

  it("turns a missing icon into an empty string", () => {
    expect(toExpenseFormValues({ ...expense, icon: null }).icon).toBe("");
  });
});

describe("ExpenseForm", () => {
  it("starts blank when creating", () => {
    renderForm();

    expect(screen.getByLabelText<HTMLInputElement>(/category/i).value).toBe("");
    expect(
      screen.getByRole("button", { name: "Add Expense" })
    ).toBeInTheDocument();
  });

  it("pre-fills the fields when editing", () => {
    renderForm({
      initialValues: toExpenseFormValues(expense),
      submitLabel: "Save Changes",
    });

    expect(screen.getByLabelText<HTMLInputElement>(/category/i).value).toBe(
      "Coffee"
    );
    expect(screen.getByLabelText<HTMLInputElement>(/amount/i).value).toBe("7.5");
    expect(screen.getByLabelText<HTMLInputElement>(/date/i).value).toBe(
      "2024-03-15"
    );
    expect(
      screen.getByRole("button", { name: "Save Changes" })
    ).toBeInTheDocument();
  });

  it("submits the edited values", async () => {
    const { onSubmit } = renderForm({
      initialValues: toExpenseFormValues(expense),
      submitLabel: "Save Changes",
    });

    const category = screen.getByLabelText<HTMLInputElement>(/category/i);
    await userEvent.clear(category);
    await userEvent.type(category, "Tea");
    await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ category: "Tea", amount: "7.5" })
    );
  });
});
