import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthContext } from "./lib/auth.jsx";

function renderAppWithRole(role = "admin", initialEntries = ["/app"]) {
  const authValue = {
    user: { id: 1, email: "user@example.com", role },
    status: "authenticated",
    setSession: () => {},
    logout: () => {},
    bootstrap: () => {},
  };

  render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

test("admin sees requests navigation button", () => {
  renderAppWithRole("admin");
  const requestLinks = screen.getAllByRole("link", { name: /requests/i });
  expect(requestLinks.length).toBeGreaterThan(0);
});

test("approver role hides settings navigation", () => {
  renderAppWithRole("approver");
  expect(screen.queryByRole("link", { name: /settings/i })).toBeNull();
  const approvalsLinks = screen.getAllByRole("link", { name: /approvals/i });
  expect(approvalsLinks.length).toBeGreaterThan(0);
});

test("buyer sees purchase orders and vendors", () => {
  renderAppWithRole("buyer");
  const poLinks = screen.getAllByRole("link", { name: /purchase orders/i });
  expect(poLinks.length).toBeGreaterThan(0);
  const vendorLinks = screen.getAllByRole("link", { name: /vendors/i });
  expect(vendorLinks.length).toBeGreaterThan(0);
  expect(screen.queryByRole("link", { name: /settings/i })).toBeNull();
});

test("finance workspace includes integrations link", () => {
  renderAppWithRole("finance");
  const integrationsLinks = screen.getAllByRole("link", { name: /integrations/i });
  expect(integrationsLinks.length).toBeGreaterThan(0);
  expect(screen.queryByRole("link", { name: /vendors/i })).toBeNull();
});
