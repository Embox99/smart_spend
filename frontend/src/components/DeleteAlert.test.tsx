import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteAlert from "./DeleteAlert";

const renderAlert = () => {
  const onDelete = vi.fn();
  const onCancel = vi.fn();
  render(
    <DeleteAlert
      content="Are you sure?"
      onDelete={onDelete}
      onCancel={onCancel}
    />
  );
  return { onDelete, onCancel };
};

describe("DeleteAlert", () => {
  it("offers a way out as well as a way through", () => {
    renderAlert();

    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("does not open with the destructive action focused", () => {
    renderAlert();

    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Cancel" })
    );
  });

  it("calls back on cancel without deleting", async () => {
    const { onDelete, onCancel } = renderAlert();

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("deletes on confirm", async () => {
    const { onDelete, onCancel } = renderAlert();

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(onDelete).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
  });
});
