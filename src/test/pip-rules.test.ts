import { describe, expect, it } from "vitest";
import { validateEntry } from "@/components/pip/Guestbook";
import { describeDream } from "@/components/pip/Workshop";

describe("guestbook rules", () => {
  it("requires a nickname", () => expect(validateEntry(" ", "a wish")).not.toBeNull());
  it("caps nickname at 24 chars", () => expect(validateEntry("x".repeat(25), "a wish")).not.toBeNull());
  it("caps wish at 140 chars", () => expect(validateEntry("Pip", "x".repeat(141))).not.toBeNull());
  it("accepts a valid entry", () => expect(validateEntry("Pip", "A cozy dream")).toBeNull());
});

describe("dream workshop", () => {
  it("names moonbeams as a glowing forest", () =>
    expect(describeDream({ clouds: 0, stars: 0, moonbeams: 3, lantern: 0 }, true)).toContain("3 moonbeams"));
});
