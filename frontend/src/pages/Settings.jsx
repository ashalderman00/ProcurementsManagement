import { useEffect, useState } from "react";
import Button from "../components/Button";
import Drawer from "../components/Drawer";
import { apiGet, apiPost } from "../lib/api";
import { useAuth } from "../lib/auth";

const ROLE_OPTIONS = [
  { value: "requester", label: "Requester" },
  { value: "approver", label: "Approver" },
  { value: "buyer", label: "Buyer" },
  { value: "finance", label: "Finance" },
  { value: "admin", label: "Admin" },
];

const ROLE_LABEL = ROLE_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatRole(value) {
  return ROLE_LABEL[value] || value || "";
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return DATE_FORMAT.format(date);
}

export default function Settings() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [rules, setRules] = useState([]);
  const [ruleEditorOpen, setRuleEditorOpen] = useState(false);

  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountsError, setAccountsError] = useState("");
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);

  async function loadRules() {
    try {
      const data = await apiGet("/api/approval-rules");
      setRules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("approval-rules.load.error", error);
      setRules([]);
    }
  }

  async function loadUsers() {
    if (!isAdmin) {
      setAccounts([]);
      return;
    }
    setAccountsLoading(true);
    setAccountsError("");
    try {
      const data = await apiGet("/api/users");
      setAccounts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("users.load.error", error);
      setAccountsError("Unable to load teammates right now.");
    } finally {
      setAccountsLoading(false);
    }
  }

  useEffect(() => {
    loadRules();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [isAdmin]);

  async function handleUserCreated(result) {
    setInviteResult(result);
    setUserDrawerOpen(false);
    await loadUsers();
  }

  return (
    <div className="space-y-10">
      {isAdmin ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Workspace access</h2>
            <Button onClick={() => setUserDrawerOpen(true)}>Invite teammate</Button>
          </div>
          <p className="text-sm text-slate-500">
            Provision accounts for buyers, finance partners, and approvers.
          </p>
          {inviteResult ? <NewAccountNotice result={inviteResult} /> : null}
          <div className="overflow-x-auto rounded-2xl border bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-100">
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Created</Th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id} className="border-b border-slate-100">
                    <Td>
                      <div className="flex items-center gap-2">
                        <span>{account.email}</span>
                        {account.id === user?.id ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            You
                          </span>
                        ) : null}
                      </div>
                    </Td>
                    <Td>{formatRole(account.role)}</Td>
                    <Td>{formatDate(account.created_at)}</Td>
                  </tr>
                ))}
                {accountsLoading ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-slate-500">
                      Loading teammates…
                    </td>
                  </tr>
                ) : null}
                {!accountsLoading && accountsError ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-red-600">
                      {accountsError}
                    </td>
                  </tr>
                ) : null}
                {!accountsLoading && !accountsError && accounts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-slate-500">
                      No teammates yet. Invite colleagues to collaborate.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <UserDrawer
            open={userDrawerOpen}
            onClose={() => setUserDrawerOpen(false)}
            onCreated={handleUserCreated}
          />
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Approval rules</h2>
          <Button onClick={() => setRuleEditorOpen(true)}>New rule</Button>
        </div>

        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-100">
                <Th>Name</Th>
                <Th>Amount range</Th>
                <Th>Category</Th>
                <Th>Vendor</Th>
                <Th>Stages</Th>
                <Th>Active</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <RuleRow key={rule.id} rule={rule} onChanged={loadRules} />
              ))}
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-slate-500">
                    No rules yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <RuleEditor
          open={ruleEditorOpen}
          onClose={() => {
            setRuleEditorOpen(false);
            loadRules();
          }}
        />
      </section>
    </div>
  );
}

function Th({ children }) {
  return <th className="px-3 py-2 text-left font-medium text-slate-600">{children}</th>;
}

function Td({ children }) {
  return <td className="px-3 py-2">{children}</td>;
}

function NewAccountNotice({ result }) {
  if (!result || !result.user) return null;
  const { user, temporaryPassword } = result;
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-sm">
      <div className="font-semibold">
        {formatRole(user.role)} account created for {user.email}.
      </div>
      {temporaryPassword ? (
        <div className="mt-2 space-y-1">
          <div>
            Temporary password:
            <code className="ml-2 rounded bg-white px-2 py-0.5 text-sm text-emerald-700 shadow-sm">
              {temporaryPassword}
            </code>
          </div>
          <p className="text-xs text-emerald-700">
            Share this password with your teammate so they can sign in and change it.
          </p>
        </div>
      ) : (
        <p className="mt-2 text-xs text-emerald-700">
          The teammate can sign in with the password you provided.
        </p>
      )}
    </div>
  );
}

function UserDrawer({ open, onClose, onCreated }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("requester");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setEmail("");
      setRole("requester");
      setPassword("");
      setError("");
    }
  }, [open]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!email || !email.includes("@")) {
      setError("Enter a valid work email.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        email,
        role,
        password: password.trim() ? password.trim() : undefined,
      };
      const result = await apiPost("/api/users", payload);
      onCreated?.(result);
    } catch (err) {
      const message = String(err?.message || "");
      const friendly = message.includes("409")
        ? "That email is already registered."
        : "Could not create the account. Please try again.";
      setError(friendly);
    } finally {
      setLoading(false);
    }
  }

  const formId = "create-user-form";

  return (
    <Drawer
      open={open}
      title="Invite teammate"
      onClose={onClose}
      footer={
        <Button type="submit" form={formId} disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      }
    >
      <form id={formId} onSubmit={submit} className="space-y-4">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        ) : null}
        <div className="space-y-1">
          <label htmlFor="invite-email" className="text-sm font-medium text-slate-600">
            Work email
          </label>
          <input
            id="invite-email"
            type="email"
            required
            className="w-full rounded-lg border px-3 py-2"
            placeholder="teammate@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="invite-role" className="text-sm font-medium text-slate-600">
            Role
          </label>
          <select
            id="invite-role"
            className="w-full rounded-lg border px-3 py-2"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="invite-password" className="text-sm font-medium text-slate-600">
            Set password (optional)
          </label>
          <input
            id="invite-password"
            type="text"
            autoComplete="off"
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Leave blank to generate a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <p className="text-xs text-slate-500">
            Leave blank to generate a secure temporary password for this teammate.
          </p>
        </div>
      </form>
    </Drawer>
  );
}

function RuleRow({ rule, onChanged }) {
  const [editing, setEditing] = useState(false);

  async function del() {
    if (!window.confirm("Delete this rule?")) return;
    await fetch(`/api/approval-rules/${rule.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });
    onChanged();
  }

  return (
    <tr className="border-b border-slate-100">
      <Td>{rule.name}</Td>
      <Td>
        {`${Number(rule.min_amount).toFixed(2)} – ${
          rule.max_amount === null ? "∞" : Number(rule.max_amount).toFixed(2)
        }`}
      </Td>
      <Td>{rule.category_id || "Any"}</Td>
      <Td>{rule.vendor_id || "Any"}</Td>
      <Td>
        <code className="text-xs">
          {Array.isArray(rule.stages)
            ? rule.stages.join(" → ")
            : JSON.parse(rule.stages || "[]").join(" → ")}
        </code>
      </Td>
      <Td>{String(rule.active)}</Td>
      <Td>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button variant="ghost" onClick={del}>
            Delete
          </Button>
        </div>
        {editing ? (
          <RuleEditor
            open={editing}
            onClose={() => {
              setEditing(false);
              onChanged();
            }}
            rule={rule}
          />
        ) : null}
      </Td>
    </tr>
  );
}

function RuleEditor({ open, onClose, rule }) {
  const [cats, setCats] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [name, setName] = useState(rule?.name || "");
  const [min, setMin] = useState(String(rule?.min_amount ?? 0));
  const [max, setMax] = useState(rule?.max_amount === null ? "" : String(rule?.max_amount ?? ""));
  const [categoryId, setCategoryId] = useState(rule?.category_id ?? "");
  const [vendorId, setVendorId] = useState(rule?.vendor_id ?? "");
  const [stagesText, setStagesText] = useState(
    Array.isArray(rule?.stages)
      ? JSON.stringify(rule.stages)
      : rule?.stages || '["approver"]'
  );
  const [active, setActive] = useState(Boolean(rule?.active ?? true));

  useEffect(() => {
    (async () => {
      try {
        setCats(await apiGet("/api/categories"));
      } catch {}
      try {
        setVendors(await apiGet("/api/vendors"));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (rule) {
      setName(rule.name || "");
      setMin(String(rule.min_amount ?? 0));
      setMax(rule.max_amount === null ? "" : String(rule.max_amount ?? ""));
      setCategoryId(rule.category_id ?? "");
      setVendorId(rule.vendor_id ?? "");
      setStagesText(
        Array.isArray(rule.stages)
          ? JSON.stringify(rule.stages)
          : rule.stages || '["approver"]'
      );
      setActive(Boolean(rule.active ?? true));
    }
  }, [rule]);

  async function save() {
    const stages = JSON.parse(stagesText || "[]");
    const body = {
      name,
      min_amount: Number(min || 0),
      max_amount: max === "" ? null : Number(max),
      category_id: categoryId === "" ? null : Number(categoryId),
      vendor_id: vendorId === "" ? null : Number(vendorId),
      stages,
      active,
    };
    const token = localStorage.getItem("token") || "";
    if (rule) {
      await fetch(`/api/approval-rules/${rule.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
    } else {
      await apiPost("/api/approval-rules", body);
    }
    onClose?.();
  }

  return (
    <Drawer
      open={open}
      title={rule ? "Edit rule" : "New approval rule"}
      onClose={onClose}
      footer={<Button onClick={save}>{rule ? "Save" : "Create"}</Button>}
    >
      <div className="space-y-3">
        <Field label="Name">
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Default $0–$1k"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Min amount">
            <input
              className="w-full rounded-lg border px-3 py-2"
              type="number"
              value={min}
              onChange={(event) => setMin(event.target.value)}
            />
          </Field>
          <Field label="Max amount (blank = no limit)">
            <input
              className="w-full rounded-lg border px-3 py-2"
              type="number"
              value={max}
              onChange={(event) => setMax(event.target.value)}
              placeholder=""
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <select
              className="w-full rounded-lg border px-3 py-2"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              <option value="">Any</option>
              {cats.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Vendor">
            <select
              className="w-full rounded-lg border px-3 py-2"
              value={vendorId}
              onChange={(event) => setVendorId(event.target.value)}
            >
              <option value="">Any</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label='Stages (JSON, e.g. ["approver","finance"])'>
          <input
            className="w-full rounded-lg border px-3 py-2 font-mono text-sm"
            value={stagesText}
            onChange={(event) => setStagesText(event.target.value)}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
          />
          Active
        </label>
      </div>
    </Drawer>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="mb-1 text-sm text-slate-600">{label}</div>
      {children}
    </div>
  );
}
