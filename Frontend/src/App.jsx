import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
const API = import.meta.env.VITE_API_BASE ?? "",
  auth = () => ({
    Authorization: `Bearer ${localStorage.getItem("echo_token")}`,
  });
async function api(p, o = {}) {
  let r = await fetch(API + p, {
      ...o,
      headers: {
        "Content-Type": "application/json",
        ...auth(),
        ...(o.headers || {}),
      },
    }),
    d = await r.json();
  if (!r.ok) throw Error(d.detail || "Something went wrong");
  return d;
}
function Icon({ type, size = 24 }) {
  let paths = {
    phone: (
      <path d="M7 4 4.5 6.5c-.8.8-.7 2.2.1 3.5 2 3.2 4.7 5.9 7.9 7.9 1.3.8 2.7.9 3.5.1l2.5-2.5-3-3-2 1.5c-1.4-.7-2.5-1.8-3.2-3.2l1.5-2-3-3Z" />
    ),
    off: (
      <>
        <path d="m5 5 14 14" />
        <path d="M7 4 4.5 6.5c-.8.8-.7 2.2.1 3.5 2 3.2 4.7 5.9 7.9 7.9 1.3.8 2.7.9 3.5.1l1-1" />
      </>
    ),
    message: <path d="M19 11a7 7 0 0 1-7 7H6l-3 2 1-4.2A7 7 0 1 1 19 11Z" />,
    alarm: (
      <>
        <circle cx="12" cy="13" r="6" />
        <path d="M12 10v3l2 1M6 4 4 6m12-2 2 2" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  );
}
const Phone = ({ size }) => <Icon type="phone" size={size} />,
  PhoneOff = ({ size }) => <Icon type="off" size={size} />,
  MessageCircle = ({ size }) => <Icon type="message" size={size} />,
  AlarmClock = ({ size }) => <Icon type="alarm" size={size} />;
function Landing() {
  let foundations = [
    [
      "01",
      "Private knowledge",
      "Answers grounded in your documentation, policies, and product details.",
    ],
    [
      "02",
      "Human handoff",
      "Escalate with context, collect details, and keep your team in the loop.",
    ],
    [
      "03",
      "One public link",
      "Share a branded support experience across your website and channels.",
    ],
    [
      "04",
      "Clarity at a glance",
      "See conversations, issues, and follow-ups without switching tools.",
    ],
  ];
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <b>
          Chat Desk <small>v2.4</small>
        </b>
        <div className="landing-links">
          <a href="#foundations">Features</a>
          <a href="#workflow">How it works</a>
          <a href="#simulation">Live simulation</a>
          <a href="#security">Security</a>
        </div>
        <span />
        <Link to="/login">Log in</Link>
        <Link className="button" to="/signup">
          Sign up free
        </Link>
      </nav>
      <main className="hero landing-hero">
        <div className="hero-copy">
          <p className="eyebrow">
            AI SUPPORT, GROUNDED IN YOUR BRAND <i /> NEW RESPONSE
          </p>
          <h1>Support that knows your business.</h1>
          <p>
            Give every customer a helpful, grounded answer from your private
            docs — then seamlessly bring your team in when it matters.
          </p>
          <div>
            <Link className="button" to="/signup">
              Build your support bot
            </Link>
            <Link className="link" to="/login">
              Log in →
            </Link>
          </div>
          <div className="hero-proof">
            <span>✓ Zero hallucination guardrails</span>
            <span>✓ Set up in minutes</span>
            <span>✓ No credit card required</span>
          </div>
        </div>
        <div className="hero-device">
          <div className="call-phone" aria-label="Support Team mobile call">
            <div className="call-status">
              <span>9:41</span>
              <span>▮▮▮ ◉</span>
            </div>
            <div className="call-content">
              <div className="caller-avatar">
                <Phone size={28} />
              </div>
              <p className="call-label">Incoming call</p>
              <h2>Support Team</h2>
              <p className="call-number">+1 800 555 0147</p>
            </div>
            <div className="call-actions">
              <div>
                <span className="call-action-icon remind">
                  <AlarmClock size={22} />
                </span>
                <small>Remind Me</small>
              </div>
              <div>
                <span className="call-action-icon message">
                  <MessageCircle size={22} />
                </span>
                <small>Message</small>
              </div>
            </div>
            <div className="call-controls">
              <div>
                <span className="call-control-icon decline">
                  <PhoneOff size={27} />
                </span>
                <small>Decline</small>
              </div>
              <div>
                <span className="call-control-icon accept">
                  <Phone size={27} />
                </span>
                <small>Accept</small>
              </div>
            </div>
          </div>
          <div className="hero-float-card">
            ✓ 84.7% Deflection Rate<small>Healthy support performance</small>
          </div>
        </div>
      </main>
      <section className="landing-section foundations" id="foundations">
        <p className="eyebrow">CORE FOUNDATIONS</p>
        <h2>Designed for truth, built for human trust.</h2>
        <p className="section-lead">
          Every answer is strictly sandboxed. Your AI never invents facts, never
          makes false promises, and always knows when it needs assistance.
        </p>
        <div className="foundation-grid">
          {foundations.map((x) => (
            <article key={x[0]}>
              <span className="card-index">{x[0]}</span>
              <h3>{x[1]}</h3>
              <p>{x[2]}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="landing-section workflow" id="workflow">
        <p className="eyebrow">SET IT UP ONCE</p>
        <h2>Up in minutes, useful from the first chat.</h2>
        <p className="section-lead">
          No complex prompt engineering or lengthy multi-week training.
        </p>
        <div className="workflow-grid">
          {[
            [
              "01",
              "Create your workspace",
              "Set your tone, boundaries, and knowledge sources.",
            ],
            [
              "02",
              "Add knowledge & guardrails",
              "Ground every answer in your own trusted information.",
            ],
            [
              "03",
              "Deploy anywhere",
              "Share your public link or connect it to your site.",
            ],
          ].map((x) => (
            <article key={x[0]}>
              <span className="card-index">{x[0]}</span>
              <h3>{x[1]}</h3>
              <p>{x[2]}</p>
              <code>
                {x[0] === "01"
                  ? "workspace.configure()"
                  : x[0] === "02"
                    ? "guardrails.verify()"
                    : "support.publish()"}
              </code>
            </article>
          ))}
        </div>
      </section>
      <section className="landing-section simulation" id="simulation">
        <p className="eyebrow">LIVE INGESTION & SIMULATION</p>
        <h2>See precision in action.</h2>
        <p className="section-lead">
          Every sentence returned by Chat Desk traces directly to a verified
          source in your uploaded reference material.
        </p>
        <div className="simulation-window">
          <div className="simulation-top">
            <span>● ● ●</span>
            <b>Acme Support / Customer Chat</b>
            <em>Grounded & Relevant</em>
          </div>
          <div className="simulation-message">
            <b>Customer</b>
            <p>
              Can I return my TrailMaster hiking boots if I already wore them
              outside?
            </p>
          </div>
          <div className="simulation-message answer">
            <b>Support Assistant</b>
            <p>
              Our policy allows returns within 45 days in original condition.
              Since these were worn outside, I’ll connect you with the team to
              review the next step.
            </p>
            <small>▣ Policy: Returns & Refunds, page 2</small>
          </div>
          <div className="simulation-handoff">
            <span>! Need an exception approved?</span>
            <button>Request human handoff</button>
          </div>
        </div>
      </section>
      <section className="landing-stats" id="security">
        <div>
          <strong>&lt; 380ms</strong>
          <small>Median latency</small>
        </div>
        <div>
          <strong>88.4%</strong>
          <small>Zero-touch deflection</small>
        </div>
        <div>
          <strong>SOC 2</strong>
          <small>Type II & GDPR ready</small>
        </div>
        <div>
          <strong>0.0%</strong>
          <small>Customer data used for training</small>
        </div>
      </section>
      <section className="landing-cta">
        <p className="eyebrow">READY WHEN YOU ARE</p>
        <h2>Ready to modernize your customer support?</h2>
        <p>
          Create your private workspace today. Impress your policies in under
          five minutes and experience true hallucination-free support.
        </p>
        <Link className="button" to="/signup">
          Get started free
        </Link>
      </section>
      <footer className="landing-footer">
        <b>Chat Desk</b>
        <p>AI customer support built on verified private knowledge.</p>
        <span>© 2025 Chat Desk · Privacy · Terms</span>
      </footer>
    </div>
  );
}
function Auth({ signup = false }) {
  let nav = useNavigate(),
    [f, setF] = useState({
      company_name: "",
      name: "",
      email: "",
      password: "",
    }),
    [err, setErr] = useState("");
  async function submit(e) {
    e.preventDefault();
    try {
      let d = await api("/api/auth/" + (signup ? "signup" : "login"), {
        method: "POST",
        body: JSON.stringify(f),
      });
      localStorage.setItem("echo_token", d.token);
      nav(signup ? "/onboarding" : "/dashboard");
    } catch (e) {
      setErr(e.message);
    }
  }
  return (
    <main className="auth">
      <form onSubmit={submit}>
        <Link to="/">← Chat Desk</Link>
        <h1>{signup ? "Create your workspace" : "Welcome back"}</h1>
        {signup && (
          <>
            <input
              placeholder="Company name"
              required
              onChange={(e) => setF({ ...f, company_name: e.target.value })}
            />
            <input
              placeholder="Your name"
              required
              onChange={(e) => setF({ ...f, name: e.target.value })}
            />
          </>
        )}
        <input
          type="email"
          placeholder="Work email"
          required
          onChange={(e) => setF({ ...f, email: e.target.value })}
        />
        <input
          type="password"
          minLength="8"
          placeholder="Password (8+ characters)"
          required
          onChange={(e) => setF({ ...f, password: e.target.value })}
        />
        {err && <p className="error">{err}</p>}
        <button>{signup ? "Continue" : "Log in"}</button>
        <p>
          {signup ? "Already have an account? " : "New to Chat Desk? "}
          <Link to={signup ? "/login" : "/signup"}>
            {signup ? "Log in" : "Sign up"}
          </Link>
        </p>
      </form>
    </main>
  );
}
function Upload() {
  let [m, setM] = useState("");
  async function change(e) {
    let f = e.target.files[0],
      fd = new FormData();
    if (!f) return;
    fd.append("file", f);
    let r = await fetch(API + "/api/knowledge/upload", {
        method: "POST",
        headers: auth(),
        body: fd,
      }),
      d = await r.json();
    setM(r.ok ? f.name + " added" : d.detail);
  }
  return (
    <label className="upload">
      Upload txt, md or PDF
      <input type="file" accept=".txt,.md,.pdf" onChange={change} />
      <small>{m}</small>
    </label>
  );
}
function Onboarding() {
  let nav = useNavigate(),
    [step, setStep] = useState(1),
    [f, setF] = useState({
      website_domain: "",
      industry: "",
      knowledge_text: "",
      faqs: "",
      avoid_topics: "",
      tone: "helpful and concise",
      escalation_rules: "refunds, legal, angry customers",
      never_promise: "",
      bot_name: "Support Assistant",
      welcome_message: "Hi! How can I help today?",
      fallback_message:
        "I don't have enough information to answer that. Our team can help.",
      general_questions_enabled: false,
    }),
    [err, setErr] = useState(""),
    set = (k, v) => setF({ ...f, [k]: v });
  async function done() {
    try {
      await api("/api/onboarding", { method: "POST", body: JSON.stringify(f) });
      nav("/dashboard");
    } catch (e) {
      setErr(e.message);
    }
  }
  return (
    <main className="wizard">
      <p className="eyebrow">SETUP · {step}/3</p>
      <h1>
        {step === 1
          ? "Tell us about your business"
          : step === 2
            ? "Give your bot its knowledge"
            : "Set its boundaries and voice"}
      </h1>
      {step === 1 && (
        <>
          <label>
            Website domain
            <input
              placeholder="example.com"
              onChange={(e) => set("website_domain", e.target.value)}
            />
          </label>
          <label>
            Industry
            <input
              placeholder="e.g. ecommerce, SaaS"
              onChange={(e) => set("industry", e.target.value)}
            />
          </label>
        </>
      )}
      {step === 2 && (
        <>
          <label>
            Paste company knowledge
            <textarea
              placeholder="Policies, product details, support docs…"
              onChange={(e) => set("knowledge_text", e.target.value)}
            />
          </label>
          <label>
            FAQs
            <textarea
              placeholder="Q: … A: …"
              onChange={(e) => set("faqs", e.target.value)}
            />
          </label>
          <Upload />
        </>
      )}
      {step === 3 && (
        <>
          <label>
            Topics to avoid
            <textarea onChange={(e) => set("avoid_topics", e.target.value)} />
          </label>
          <label>
            Escalation rules
            <textarea
              value={f.escalation_rules}
              onChange={(e) => set("escalation_rules", e.target.value)}
            />
          </label>
          <label>
            Things it must never promise
            <textarea onChange={(e) => set("never_promise", e.target.value)} />
          </label>
          <label>
            Bot name
            <input
              value={f.bot_name}
              onChange={(e) => set("bot_name", e.target.value)}
            />
          </label>
          <label>
            Welcome message
            <input
              value={f.welcome_message}
              onChange={(e) => set("welcome_message", e.target.value)}
            />
          </label>
          <label>
            Fallback message
            <input
              value={f.fallback_message}
              onChange={(e) => set("fallback_message", e.target.value)}
            />
          </label>
        </>
      )}
      {err && <p className="error">{err}</p>}
      <div className="actions">
        {step > 1 && (
          <button className="ghost" onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}
        <button onClick={() => (step < 3 ? setStep(step + 1) : done())}>
          {step < 3 ? "Next" : "Launch workspace"}
        </button>
      </div>
    </main>
  );
}
function List({ rows, empty, children }) {
  return (
    <section className="panel list">
      {rows.length ? rows.map(children) : <p>{empty}</p>}
    </section>
  );
}
function Status({ row, kind }) {
  return (
    <select
      value={row.status}
      onChange={async (e) => {
        await api(`/api/dashboard/${kind}/${row.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: e.target.value }),
        });
        location.reload();
      }}
    >
      {["open", "in_progress", "resolved", "closed"].map((x) => (
        <option>{x}</option>
      ))}
    </select>
  );
}
function Dashboard() {
  let [d, setD] = useState(),
    [tab, setTab] = useState("Overview"),
    [err, setErr] = useState("");
  useEffect(() => {
    let active = true,
      timer = setTimeout(() => {
        if (active)
          setErr(
            "Workspace is taking too long to respond. Check that the backend is running and try again.",
          );
      }, 12000);
    api("/api/me")
      .then((m) =>
        Promise.all([
          m,
          api("/api/dashboard/overview"),
          api("/api/dashboard/conversations"),
          api("/api/dashboard/issues"),
          api("/api/dashboard/handoffs"),
          api("/api/settings"),
        ]),
      )
      .then((x) => {
        if (active) setD(x);
      })
      .catch((e) => {
        if (active) setErr(e.message);
      })
      .finally(() => clearTimeout(timer));
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);
  if (err)
    return (
      <main className="auth dashboard-error">
        <div className="error-icon">!</div>
        <p className="eyebrow">WORKSPACE OFFLINE</p>
        <h1>We couldn't load your workspace</h1>
        <p className="error">{err}</p>
        <button onClick={() => location.reload()}>Try again</button>
        <Link className="link" to="/">
          Back to home
        </Link>
      </main>
    );
  if (!d)
    return (
      <main className="workspace-loading">
        <div className="loading-orbit">
          <span />
        </div>
        <p className="eyebrow">SECURE WORKSPACE</p>
        <h1>Loading your workspace</h1>
        <p>Preparing conversations, issues, handoffs, and bot settings…</p>
        <div className="loading-bars">
          <i />
          <i />
          <i />
        </div>
      </main>
    );
  let [me, o, cs, is, hs, st] = d,
    chat = `${location.origin}/support/${me.company.slug}`;
  return (
    <div className="dash">
      <aside>
        <b>Chat Desk</b>
        <p>{me.company.name}</p>
        {["Overview", "Conversations", "Issues", "Handoffs", "Settings"].map(
          (x) => (
            <button
              className={tab === x ? "selected" : ""}
              onClick={() => setTab(x)}
            >
              {x}
            </button>
          ),
        )}
        <button
          onClick={() => {
            localStorage.removeItem("echo_token");
            location.href = "/";
          }}
        >
          Log out
        </button>
      </aside>
      <main>
        <header>
          <div>
            <p className="eyebrow">WORKSPACE</p>
            <h1>{tab}</h1>
          </div>
          {tab === "Overview" && (
            <a className="button" href={chat} target="_blank">
              Open chat page
            </a>
          )}
        </header>
        {tab === "Overview" && (
          <>
            <div className="metrics">
              {[
                ["Total chats", o.total_chats],
                ["Open issues", o.open_issues],
                ["Handoff requests", o.handoff_requests],
              ].map((x) => (
                <article>
                  <p>{x[0]}</p>
                  <strong>{x[1]}</strong>
                </article>
              ))}
            </div>
            <section className="panel">
              <h2>Your customer chat</h2>
              <code>{chat}</code>
              <button
                className="small"
                onClick={() => navigator.clipboard.writeText(chat)}
              >
                Copy link
              </button>
              <p>
                Embed: <code>{`<a href="${chat}">Chat with support</a>`}</code>
              </p>
            </section>
            <div className="dashboard-grid">
              <section className="panel activity-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">LIVE QUEUE</p>
                    <h2>Recent conversations</h2>
                  </div>
                  <button
                    className="ghost"
                    onClick={() => setTab("Conversations")}
                  >
                    View all
                  </button>
                </div>
                {cs.slice(0, 4).map((x) => (
                  <article className="activity-row" key={x.id}>
                    <span className="activity-dot" />
                    <div>
                      <b>Conversation #{x.id}</b>
                      <p>{x.preview || "New customer conversation"}</p>
                    </div>
                    <em>{x.has_handoff ? "Escalated" : "Active"}</em>
                  </article>
                ))}
              </section>
              <section className="panel queue-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">ACTION REQUIRED</p>
                    <h2>Handoffs</h2>
                  </div>
                  <button className="ghost" onClick={() => setTab("Handoffs")}>
                    Open queue
                  </button>
                </div>
                {hs.slice(0, 3).map((x) => (
                  <article className="queue-row" key={x.id}>
                    <span className="queue-icon">!</span>
                    <div>
                      <b>{x.name}</b>
                      <p>{x.email}</p>
                    </div>
                    <small>{x.status}</small>
                  </article>
                ))}
              </section>
            </div>
          </>
        )}
        {tab === "Conversations" && (
          <List rows={cs} empty="No customer conversations yet.">
            {(x) => (
              <article key={x.id}>
                <b>Conversation #{x.id}</b>
                {x.has_handoff && <em>Handoff</em>}
                <p>{x.preview}</p>
                <details>
                  <summary>View transcript</summary>
                  {x.messages.map((m) => (
                    <p className={m.role}>
                      <b>{m.role}:</b> {m.content}
                    </p>
                  ))}
                </details>
              </article>
            )}
          </List>
        )}
        {tab === "Issues" && (
          <List rows={is} empty="Issues are created as customers chat.">
            {(x) => (
              <article key={x.id}>
                <b>{x.summary}</b>
                <Status row={x} kind="issues" />
              </article>
            )}
          </List>
        )}
        {tab === "Handoffs" && (
          <List rows={hs} empty="No handoff requests yet.">
            {(x) => (
              <article key={x.id}>
                <b>{x.name}</b>
                <p>
                  {x.email} · {x.phone} · Conversation #{x.conversation_id}
                </p>
                <Status row={x} kind="handoffs" />
              </article>
            )}
          </List>
        )}
        {tab === "Settings" && <Settings data={st} chat={chat} />}
      </main>
    </div>
  );
}
function Settings({ data, chat }) {
  let [f, setF] = useState({
      ...data.company,
      ...data.settings,
      knowledge_text: "",
      faqs: "",
      general_questions_enabled: Boolean(
        data.settings.general_questions_enabled,
      ),
    }),
    [m, setM] = useState("");
  return (
    <section className="panel settings">
      <div className="settings-heading">
        <div>
          <p className="eyebrow">PREFERENCES</p>
          <h2>Workspace settings</h2>
        </div>
        <button
          className="theme-toggle"
          onClick={() => {
            document.body.classList.toggle("theme-dark");
            localStorage.setItem(
              "echo_theme",
              document.body.classList.contains("theme-dark") ? "dark" : "light",
            );
          }}
        >
          Toggle dark mode
        </button>
      </div>
      <label>
        Website
        <input
          value={f.website_domain || ""}
          onChange={(e) => setF({ ...f, website_domain: e.target.value })}
        />
      </label>
      <label>
        Industry
        <input
          value={f.industry || ""}
          onChange={(e) => setF({ ...f, industry: e.target.value })}
        />
      </label>
      <label>
        Bot name
        <input
          value={f.bot_name || ""}
          onChange={(e) => setF({ ...f, bot_name: e.target.value })}
        />
      </label>
      <label className="setting-switch">
        <input
          type="checkbox"
          checked={f.general_questions_enabled}
          onChange={(e) =>
            setF({ ...f, general_questions_enabled: e.target.checked })
          }
        />
        <span>
          <strong>Answer basic general questions</strong>
          <small>
            When off, the bot only answers from your company knowledge.
            Guardrails still apply when enabled.
          </small>
        </span>
      </label>
      <label>
        Knowledge
        <textarea
          placeholder="Add more knowledge"
          onChange={(e) => setF({ ...f, knowledge_text: e.target.value })}
        />
      </label>
      <label>
        Guardrails
        <textarea
          value={f.escalation_rules || ""}
          onChange={(e) => setF({ ...f, escalation_rules: e.target.value })}
        />
      </label>
      <p>
        Chat URL: <code>{chat}</code>
      </p>
      <button
        onClick={async () => {
          try {
            await api("/api/settings", {
              method: "PUT",
              body: JSON.stringify(f),
            });
            setM("Saved.");
          } catch (e) {
            setM(e.message);
          }
        }}
      >
        Save settings
      </button>
      <p>{m}</p>
      <h3>Knowledge sources</h3>
      {data.sources.map((s) => (
        <p key={s.id}>{s.title}</p>
      ))}
    </section>
  );
}
function Support() {
  let { slug } = useParams(),
    [bot, setBot] = useState(),
    [ms, setMs] = useState([]),
    [text, setText] = useState(""),
    [cid, setCid] = useState(),
    [need, setNeed] = useState(false),
    [fallbackContact, setFallbackContact] = useState(false),
    [contactOpen, setContactOpen] = useState(false),
    [ct, setCt] = useState({ name: "", email: "", phone: "" }),
    [note, setNote] = useState(""),
    [sending, setSending] = useState(false),
    visitor = localStorage.getItem("echo_visitor") || crypto.randomUUID();
  localStorage.setItem("echo_visitor", visitor);
  useEffect(() => {
    api("/api/public/support/" + slug)
      .then((d) => {
        setBot(d);
        setMs([{ role: "assistant", content: d.welcome_message }]);
      })
      .catch((e) => setNote(e.message));
  }, [slug]);
  async function send(e) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    let q = text.trim();
    setText("");
    setSending(true);
    setFallbackContact(false);
    setContactOpen(false);
    setMs((m) => [...m, { role: "visitor", content: q }]);
    try {
      let d = await api(`/api/public/support/${slug}/chat`, {
        method: "POST",
        body: JSON.stringify({
          conversation_id: cid,
          visitor_id: visitor,
          message: q,
        }),
      });
      setCid(d.conversation_id);
      setMs((m) => [...m, { role: "assistant", content: d.answer }]);
      setNeed(d.handoff_required);
      setFallbackContact(d.fallback_available);
    } catch (e) {
      setNote(e.message);
    } finally {
      setSending(false);
    }
  }
  async function submitHandoff(e) {
    e.preventDefault();
    try {
      let d = await api(`/api/public/support/${slug}/handoff`, {
        method: "POST",
        body: JSON.stringify({ ...ct, conversation_id: cid }),
      });
      setNote(d.message);
      setFallbackContact(false);
      setContactOpen(false);
    } catch (e) {
      setNote(e.message);
    }
  }
  if (!bot) return <main className="auth">{note || "Loading support…"}</main>;
  return (
    <main className="chat">
      <header>
        <p className="eyebrow">{bot.company}</p>
        <h1>{bot.bot_name}</h1>
        <p>Ask a question and get help from your support assistant.</p>
      </header>
      <section className="thread">
        {ms.map((m, i) => (
          <p className={m.role} key={i}>
            {m.content}
          </p>
        ))}
      </section>
      {need && (
        <form className="handoff" onSubmit={submitHandoff}>
          <b>Share your details and the team will follow up.</b>
          <input
            required
            placeholder="Name"
            onChange={(e) => setCt({ ...ct, name: e.target.value })}
          />
          <input
            required
            type="email"
            placeholder="Email"
            onChange={(e) => setCt({ ...ct, email: e.target.value })}
          />
          <input
            required
            placeholder="Phone"
            onChange={(e) => setCt({ ...ct, phone: e.target.value })}
          />
          <button>Request help</button>
        </form>
      )}
      {note && <p className="error">{note}</p>}
      <form className="composer" onSubmit={send}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your question…"
        />
        <button disabled={sending}>{sending ? "Sending…" : "Send"}</button>
      </form>
      {fallbackContact && !contactOpen && (
        <div className="fallback-contact">
          <p>Can't find what you need?</p>
          <button type="button" onClick={() => setContactOpen(true)}>
            Contact a human agent
          </button>
        </div>
      )}
      {fallbackContact && contactOpen && (
        <form className="handoff fallback-handoff" onSubmit={submitHandoff}>
          <b>Share your details with the support team.</b>
          <input
            required
            placeholder="Name"
            value={ct.name}
            onChange={(e) => setCt({ ...ct, name: e.target.value })}
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={ct.email}
            onChange={(e) => setCt({ ...ct, email: e.target.value })}
          />
          <input
            required
            placeholder="Phone"
            value={ct.phone}
            onChange={(e) => setCt({ ...ct, phone: e.target.value })}
          />
          <div>
            <button type="submit">Send request</button>
            <button
              type="button"
              className="ghost"
              onClick={() => setContactOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
function NotFound() {
  return (
    <main className="not-found">
      <p className="eyebrow">ERROR 404</p>
      <h1>Page not found</h1>
      <p>This page does not exist or may have moved.</p>
      <Link className="button" to="/">
        Back to home
      </Link>
    </main>
  );
}
export default function App() {
  useEffect(() => {
    if (localStorage.getItem("echo_theme") === "dark")
      document.body.classList.add("theme-dark");
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Auth signup />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/support/:slug" element={<Support />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
