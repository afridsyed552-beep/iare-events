// SSR smoke test — renders every route with renderToString to catch runtime errors.
// Uses Vite's SSR loader so TSX/CSS imports resolve exactly as in the app.
// WebGL/three only loads client-side (lazy + ready flag), so it doesn't execute here.
import { createServer } from "vite";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
  url: "http://localhost:5173/",
});
const g = globalThis;
g.window = dom.window;
g.document = dom.window.document;
Object.defineProperty(g, "navigator", { value: dom.window.navigator, configurable: true });
g.HTMLElement = dom.window.HTMLElement;
g.SVGElement = dom.window.SVGElement;
g.Element = dom.window.Element;
g.Node = dom.window.Node;
g.CSSStyleDeclaration = dom.window.CSSStyleDeclaration;
g.localStorage = dom.window.localStorage;
g.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
g.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
g.cancelAnimationFrame = (id) => clearTimeout(id);
g.scrollTo = () => {};
g.IS_REACT_ACT_ENVIRONMENT = true;

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

const React = await import("react");
const { renderToString } = await import("react-dom/server");
const { MemoryRouter } = await import("react-router-dom");
const { default: App } = await vite.ssrLoadModule("/src/App.tsx");
const { useStore } = await vite.ssrLoadModule("/src/store.ts");

const routes = [
  ["/", "Home"],
  ["/events", "Events"],
  ["/events/skyfiesta-2026", "EventDetail"],
  ["/events/nope", "EventDetail-missing"],
  ["/clubs", "Clubs"],
  ["/clubs/aero", "ClubDetail"],
  ["/clubs/nope", "ClubDetail-missing"],
  ["/calendar", "Calendar"],
  ["/announcements", "Announcements"],
  ["/profile", "Profile-guest"],
  ["/auth", "Auth"],
  ["/create", "CreateEvent"],
  ["/search", "Search"],
  ["/whatever", "NotFound"],
];

let failed = 0;
for (const [path, name] of routes) {
  try {
    const html = renderToString(
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(MemoryRouter, { initialEntries: [path] }, React.createElement(App))
      )
    );
    if (!html || html.length < 200) throw new Error("HTML too short");
    console.log(`✔ ${name.padEnd(20)} ${path.padEnd(24)} ${html.length} chars`);
  } catch (e) {
    failed++;
    console.error(`✘ ${name} ${path}`);
    console.error("  ", e.message.split("\n").slice(0, 6).join("\n   "));
  }
}

// Profile (signed-in) requires store state — set user then render
try {
  useStore.getState().login({
    name: "Aarav Kumar",
    email: "aarav@iare.ac.in",
    regNo: "22CSE0421",
    branch: "CSE",
    year: "3rd Year",
    color: "from-violet-400 to-purple-600",
    isClubAdmin: false,
  });
  useStore.getState().setRsvp("skyfiesta-2026", "going");
  useStore.getState().setRsvp("hackverse-7", "saved");
  useStore.getState().joinClub("aero");
  const html = renderToString(
    React.createElement(MemoryRouter, { initialEntries: ["/profile"] }, React.createElement(App))
  );
  console.log(`✔ ${"Profile-signed-in".padEnd(20)} ${"/profile".padEnd(24)} ${html.length} chars`);
} catch (e) {
  failed++;
  console.error("✘ Profile-signed-in", e.message.split("\n").slice(0, 6).join("\n   "));
}

await vite.close();
console.log(failed === 0 ? "\nALL ROUTES PASSED ✓" : `\n${failed} ROUTES FAILED ✗`);
process.exit(failed === 0 ? 0 : 1);
