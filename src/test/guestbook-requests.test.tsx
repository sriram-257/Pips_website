import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const backend = vi.hoisted(() => ({ read: vi.fn(), save: vi.fn(), count: vi.fn() }));
// The server functions return { ok, data } | { ok: false, error }; tests feed those shapes.
const toResult = (r: { data: unknown; error: unknown }) => (r.error ? { ok: false, error: String(r.error) } : { ok: true, data: r.data });
vi.mock("@/lib/public-data.functions", () => ({
  listWishes: async () => toResult(await backend.read()),
  pinWish: async () => toResult(await backend.save()),
  countVisit: (args: { data: { register: boolean } }) => backend.count(args.data.register),
}));
vi.mock("@/assets/pip_avatar_cloud.jpg.asset.json", () => ({ default: { url: "" } }));
vi.mock("@/components/pip/Decor", () => ({ SectionHeading: () => null, Star: () => null, StarField: () => null }));
vi.mock("@/lib/sound", () => ({ blip: () => {} }));
import { Guestbook, guestbookRequest } from "@/components/pip/Guestbook";
import { Odometer } from "@/components/pip/Extras";

afterEach(() => { cleanup(); vi.useRealTimers(); vi.resetAllMocks(); sessionStorage.clear(); });

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

  it("shows a real error instead of a fake save when the backend is not configured", async () => {
    backend.read.mockResolvedValue({ data: [], error: null });
    backend.save.mockResolvedValue({ data: null, error: "backend_not_configured" });
    render(<Guestbook />);
    await screen.findByText("No wishes yet. Be the very first dreamer!");
    submit();
    expect(await screen.findByRole("alert")).toHaveTextContent(/not saved/);
    expect(screen.queryByText(/Thank you/)).toBeNull();
  });
});

describe("visit counter", () => {
  it("counts the first visit of a session, then only reads", async () => {
    backend.count.mockResolvedValueOnce({ ok: true, data: 42 });
    render(<Odometer />);
    await screen.findByRole("img", { name: "42 visits counted" });
    expect(backend.count).toHaveBeenCalledWith(true);
    cleanup();
    backend.count.mockResolvedValueOnce({ ok: true, data: 42 });
    render(<Odometer />);
    await screen.findByRole("img", { name: "42 visits counted" });
    expect(backend.count).toHaveBeenLastCalledWith(false);
  });

  it("says it is unavailable instead of showing a fake number on failure", async () => {
    backend.count.mockResolvedValueOnce({ ok: false, error: "backend_not_configured" });
    render(<Odometer />);
    await screen.findByRole("img", { name: "Visit counter unavailable" });
    expect(sessionStorage.getItem("pip-visit-counted")).toBeNull();
  });
});
