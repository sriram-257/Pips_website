import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const backend = vi.hoisted(() => ({ read: vi.fn(), save: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({
    select: () => ({ order: () => ({ limit: () => ({ abortSignal: backend.read }) }) }),
    insert: () => ({ select: () => ({ abortSignal: (signal: AbortSignal) => ({ single: () => backend.save(signal) }) }) }),
  }) },
}));
vi.mock("@/components/pip/Decor", () => ({ SectionHeading: () => null, Star: () => null, StarField: () => null }));
vi.mock("@/lib/sound", () => ({ blip: () => {} }));
import { Guestbook, guestbookRequest } from "@/components/pip/Guestbook";

afterEach(() => { cleanup(); vi.useRealTimers(); vi.resetAllMocks(); });

const saved = { id: "saved-id", nickname: "Pip", message: "A cozy dream", created_at: new Date().toISOString() };
function submit() {
  fireEvent.change(screen.getByLabelText("Nickname"), { target: { value: "Pip" } });
  fireEvent.change(screen.getByLabelText("Your dream wish"), { target: { value: "A cozy dream" } });
  fireEvent.submit(screen.getByLabelText("Nickname").closest("form") as HTMLFormElement);
}

describe("guestbook requests", () => {
  it("bounds a stalled request and aborts it", async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    const pending = guestbookRequest((s) => { signal = s; return new Promise(() => {}); });
    const assertion = expect(pending).rejects.toThrow("guestbook_timeout");
    await vi.advanceTimersByTimeAsync(15_000);
    await assertion;
    expect(signal?.aborted).toBe(true);
  });

  it("resolves loading after a thrown read error and allows retry", async () => {
    backend.read.mockRejectedValueOnce(new Error("Network failed")).mockResolvedValue({ data: [], error: null });
    render(<Guestbook />);
    fireEvent.click(await screen.findByRole("button", { name: "Try again" }));
    await waitFor(() => expect(backend.read).toHaveBeenCalledTimes(2));
    await screen.findByText("No wishes yet. Be the very first dreamer!");
  });

  it("does not submit twice and refreshes only after a confirmed save", async () => {
    backend.read.mockResolvedValue({ data: [], error: null });
    let resolve: ((value: unknown) => void) | undefined;
    backend.save.mockImplementation(() => new Promise((r) => { resolve = r; }));
    render(<Guestbook />);
    await screen.findByText("No wishes yet. Be the very first dreamer!");
    submit(); submit();
    await waitFor(() => expect(backend.save).toHaveBeenCalledTimes(1));
    backend.read.mockResolvedValue({ data: [saved], error: null });
    await act(async () => { resolve?.({ data: saved, error: null }); });
    await waitFor(() => expect(backend.read).toHaveBeenCalledTimes(2));
    expect(screen.getByRole("button", { name: /Pin my wish/ })).toBeEnabled();
    expect(screen.getByText(/Thank you, Pip/)).toBeInTheDocument();
  });

  it("releases submission on failure without reporting success", async () => {
    backend.read.mockResolvedValue({ data: [], error: null });
    backend.save.mockRejectedValue(new Error("Network failed"));
    render(<Guestbook />);
    await screen.findByText("No wishes yet. Be the very first dreamer!");
    submit();
    await screen.findByRole("alert");
    expect(screen.getByRole("button", { name: /Pin my wish/ })).toBeEnabled();
    expect(screen.queryByText(/Thank you/)).toBeNull();
    expect(screen.getByLabelText("Your dream wish")).toHaveValue("A cozy dream");
  });

  it("releases both stalled loading and stalled submission", async () => {
    vi.useFakeTimers();
    backend.read.mockImplementation(() => new Promise(() => {}));
    backend.save.mockImplementation(() => new Promise(() => {}));
    render(<Guestbook />);
    submit();
    await act(async () => { await vi.advanceTimersByTimeAsync(15_000); });
    expect(screen.getByRole("button", { name: /Pin my wish/ })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(screen.queryByText(/Thank you/)).toBeNull();
  });
});