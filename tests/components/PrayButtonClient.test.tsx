import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  cleanup,
} from "@testing-library/react";
import PrayButtonClient from "@/components/prayers/PrayButtonClient";

// ---------------------------------------------------------------------------
// Mock server actions
// ---------------------------------------------------------------------------

vi.mock("@/app/actions/prayers/pray", () => ({
  prayAction: vi.fn(),
  unprayAction: vi.fn(),
}));

// next/cache is not needed in component tests but may be imported transitively
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { prayAction, unprayAction } from "@/app/actions/prayers/pray";

// ---------------------------------------------------------------------------
// PrayButtonClient
// ---------------------------------------------------------------------------

describe("PrayButtonClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the initial count and 'Orei por você' label when not prayed", () => {
    render(
      <PrayButtonClient
        prayerId="prayer-1"
        initialCount={5}
        initialHasPrayed={false}
        currentUserId="user-1"
      />,
    );
    expect(screen.getByRole("button")).toHaveTextContent("Orei por você");
    expect(screen.getByRole("button")).toHaveTextContent("(5)");
  });

  it("renders 'Você orou por este pedido' when already prayed", () => {
    render(
      <PrayButtonClient
        prayerId="prayer-1"
        initialCount={5}
        initialHasPrayed={true}
        currentUserId="user-1"
      />,
    );
    expect(screen.getByRole("button")).toHaveTextContent(
      "Você orou por este pedido",
    );
    expect(screen.getByRole("button")).toHaveTextContent("(5)");
  });

  it("is disabled when currentUserId is null", () => {
    render(
      <PrayButtonClient
        prayerId="prayer-1"
        initialCount={3}
        initialHasPrayed={false}
        currentUserId={null}
      />,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("increments count and toggles label after successful prayAction", async () => {
    vi.mocked(prayAction).mockResolvedValue({ success: true } as never);

    render(
      <PrayButtonClient
        prayerId="prayer-1"
        initialCount={5}
        initialHasPrayed={false}
        currentUserId="user-1"
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });

    expect(prayAction).toHaveBeenCalledWith("prayer-1");
    expect(screen.getByRole("button")).toHaveTextContent(
      "Você orou por este pedido",
    );
    expect(screen.getByRole("button")).toHaveTextContent("(6)");
  });

  it("decrements count and toggles label after successful unprayAction", async () => {
    vi.mocked(unprayAction).mockResolvedValue({ success: true } as never);

    render(
      <PrayButtonClient
        prayerId="prayer-1"
        initialCount={5}
        initialHasPrayed={true}
        currentUserId="user-1"
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });

    expect(unprayAction).toHaveBeenCalledWith("prayer-1");
    expect(screen.getByRole("button")).toHaveTextContent("Orei por você");
    expect(screen.getByRole("button")).toHaveTextContent("(4)");
  });

  it("does not update state when prayAction returns success: false", async () => {
    vi.mocked(prayAction).mockResolvedValue({
      success: false,
      error: "Você já orou por este pedido.",
    } as never);

    render(
      <PrayButtonClient
        prayerId="prayer-1"
        initialCount={5}
        initialHasPrayed={false}
        currentUserId="user-1"
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });

    // State should remain unchanged
    expect(screen.getByRole("button")).toHaveTextContent("Orei por você");
    expect(screen.getByRole("button")).toHaveTextContent("(5)");
  });

  it("does not fire action when button is disabled (no user)", async () => {
    render(
      <PrayButtonClient
        prayerId="prayer-1"
        initialCount={5}
        initialHasPrayed={false}
        currentUserId={null}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });

    expect(prayAction).not.toHaveBeenCalled();
    expect(unprayAction).not.toHaveBeenCalled();
  });
});
