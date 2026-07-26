import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "./Modal";

const renderModal = (props: Partial<Parameters<typeof Modal>[0]> = {}) => {
  const onClose = vi.fn();
  render(
    <Modal isOpen onClose={onClose} title="Add Expense" {...props}>
      <button type="button">Save</button>
    </Modal>
  );
  return { onClose };
};

describe("Modal", () => {
  it("renders nothing while closed", () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Hidden">
        <p>body</p>
      </Modal>
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("exposes a labelled dialog", () => {
    renderModal();

    expect(screen.getByRole("dialog")).toHaveAccessibleName("Add Expense");
  });

  it("closes on Escape", async () => {
    const { onClose } = renderModal();

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes when the backdrop is clicked but not the panel", async () => {
    const { onClose } = renderModal();

    await userEvent.click(screen.getByRole("dialog"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes from the close button", async () => {
    const { onClose } = renderModal();

    await userEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("locks background scrolling while open", () => {
    renderModal();

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("moves focus into the dialog", () => {
    renderModal();

    expect(document.activeElement).not.toBe(document.body);
    expect(screen.getByRole("dialog")).toContainElement(
      document.activeElement as HTMLElement
    );
  });
});
