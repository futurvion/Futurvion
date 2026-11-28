import { beforeEach, describe, expect, it, vi } from "vitest";

const { systemLookup, resolve4 } = vi.hoisted(() => ({ systemLookup: vi.fn(), resolve4: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("node:dns", () => ({ default: {
  lookup: systemLookup,
  setServers: vi.fn(),
  getServers: () => ["1.1.1.1"],
  Resolver: class { setServers = vi.fn(); resolve4 = resolve4; },
} }));
import dns from "node:dns";
import "@/lib/db";

describe("database DNS fallback", () => {
  beforeEach(() => { systemLookup.mockReset(); resolve4.mockReset(); });

  it("preserves successful all-address results used by internal HTTP requests", () => {
    const addresses = [{ address: "127.0.0.1", family: 4 }];
    systemLookup.mockImplementation((_host, _options, callback) => callback(null, addresses));
    const callback = vi.fn();
    dns.lookup("localhost", { all: true }, callback);
    expect(callback).toHaveBeenCalledWith(null, addresses, undefined);
    expect(resolve4).not.toHaveBeenCalled();
  });

  it("falls back to IPv4 only after system lookup fails", () => {
    systemLookup.mockImplementation((_host, _options, callback) => callback(new Error("lookup failed")));
    resolve4.mockImplementation((_host, callback) => callback(null, ["192.0.2.1"]));
    const callback = vi.fn();
    dns.lookup("database.example", { all: true }, callback);
    expect(callback).toHaveBeenCalledWith(null, [{ address: "192.0.2.1", family: 4 }], 4);
  });

  it("returns the system error if fallback has no address list", () => {
    const error = Object.assign(new Error("lookup failed"), { code: "ENOTFOUND" });
    systemLookup.mockImplementation((_host, _options, callback) => callback(error));
    resolve4.mockImplementation((_host, callback) => callback(null, undefined));
    const callback = vi.fn();
    expect(() => dns.lookup("database.example", callback)).not.toThrow();
    expect(callback).toHaveBeenCalledWith(error);
  });
});
