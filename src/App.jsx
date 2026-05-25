import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Mail,
  Palette,
  Eye,
  ExternalLink,
  Copy,
  Trash2,
  Sparkles,
  Share2,
  Wand2,
  Globe2,
  ShieldCheck,
  MessageSquareMore,
} from 'lucide-react';
import { app } from './lib/firebase';
import {
  buildContentDraft,
  buildRecipientDraft,
  buildShareMessage,
  composeWishPreview,
  contentFieldMeta,
  defaultContentOrder,
  normalizeTemplateDoc,
  normalizeWishDocument,
} from './data/templates';
import { templateSeed } from './data/templateSeed';
import { readJson, slugify, writeJson } from './lib/storage';
const ADMIN_CODE = import.meta.env.VITE_ADMIN_CODE || 'boltwish-admin';

function App() {
  const templatesState = useFirestoreTemplates();

  return (
    <Routes>
      <Route path="/" element={<HomePage templatesState={templatesState} />} />
      <Route path="/social" element={<SocialPage />} />
      <Route path="/template-picker" element={<TemplatePickerPage templatesState={templatesState} />} />
      <Route path="/template/:templateId" element={<WishFormPage templatesState={templatesState} />} />
      <Route
  path="/terms"
  element={
    <StaticPage title="Terms & Conditions">
      <p style={{ marginTop: 6 }}>
        Welcome to our website. By accessing or using this platform, you agree to comply with these Terms & Conditions. 
        Please read them carefully before using the service.
      </p>

      <h3 style={{ marginTop: 16 }}>About the Service</h3>
      <p style={{ marginTop: 6 }}>
        This website helps users create personalized wishes and greeting messages in a simple 4-step process. 
        The generated content is intended for personal, social, and non-harmful use only.
      </p>

      <h3 style={{ marginTop: 16 }}>User Responsibility</h3>
      <p style={{ marginTop: 6 }}>
        You are responsible for the text, wishes, messages, or content you generate, copy, save, or share using this platform. 
        You agree not to use the service for illegal, abusive, hateful, misleading, defamatory, or harmful purposes.
      </p>

      <h3 style={{ marginTop: 16 }}>Content Guidelines</h3>
      <p style={{ marginTop: 6 }}>
        Users should avoid sharing sensitive personal information, confidential details, or offensive material while using the website. 
        We do not actively monitor all generated content in real time.
      </p>

      <h3 style={{ marginTop: 16 }}>Intellectual Property</h3>
      <p style={{ marginTop: 6 }}>
        The website design, branding, features, and templates are owned by us unless otherwise stated. 
        Users may use generated wishes for personal or commercial greeting purposes, but may not copy or resell the platform itself.
      </p>

      <h3 style={{ marginTop: 16 }}>Service Availability</h3>
      <p style={{ marginTop: 6 }}>
        We aim to keep the website available and functioning smoothly, but we do not guarantee uninterrupted access or error-free performance at all times.
      </p>

      <h3 style={{ marginTop: 16 }}>Limitation of Liability</h3>
      <p style={{ marginTop: 6 }}>
        The platform is provided "as is" without warranties of any kind. 
        We are not responsible for any loss, damages, misuse of generated content, or issues resulting from the use of this website.
      </p>

      <h3 style={{ marginTop: 16 }}>Changes to Terms</h3>
      <p style={{ marginTop: 6 }}>
        We may update or modify these Terms & Conditions at any time without prior notice. 
        Continued use of the website after changes means you accept the updated terms.
      </p>

      <h3 style={{ marginTop: 16 }}>Contact</h3>
      <p style={{ marginTop: 6, marginBottom: 0 }}>
        If you have questions regarding these Terms & Conditions, please contact us through the website support page.
      </p>
    </StaticPage>
  }
/>
      <Route
  path="/contact"
  element={
    <StaticPage title="Contact Us">
      <p style={{ marginTop: 6 }}>
        Have feedback, suggestions, or found a bug? We'd love to hear from you. 
        Feel free to contact us anytime and we’ll try to respond as soon as possible.
      </p>

      <h3 style={{ marginTop: 16 }}>Email Support</h3>
      <p style={{ marginTop: 6 }}>
        Email us at{" "}
        <a href="mailto:rlmsgames.help@gmail.com">
          rlmsgames.help@gmail.com
        </a>
      </p>

      <h3 style={{ marginTop: 16 }}>Social Media</h3>
      <p style={{ marginTop: 6 }}>
        Follow us on Instagram for updates, new features, and announcements:
      </p>

      <p
        style={{
          marginTop: 8,
          color: "var(--muted)",
          fontSize: "0.95rem",
          fontWeight: 500,
        }}
      >
        @rlmsgames
      </p>

      <h3 style={{ marginTop: 16 }}>Support Hours</h3>
      <p style={{ marginTop: 6, marginBottom: 0 }}>
        We usually respond within 24–48 hours depending on message volume.
      </p>
    </StaticPage>
  }
/>
      <Route
  path="/vision"
  element={
    <StaticPage title="Our Vision">
      <p style={{ marginTop: 6 }}>
        Our vision is to make expressing emotions and sending heartfelt wishes
        simple, fast, and meaningful for everyone.
      </p>

      <p style={{ marginTop: 12 }}>
        We believe that even small messages can create memorable moments. 
        That’s why we built a platform where users can generate personalized wishes 
        in just 4 easy steps without needing design or writing skills.
      </p>

      <h3 style={{ marginTop: 16 }}>What We Aim To Provide</h3>

      <ul style={{ marginTop: 12, paddingLeft: 20 }}>
        <li>Simple and beginner-friendly experience</li>
        <li>Fast wish generation in only a few steps</li>
        <li>Beautiful and shareable message templates</li>
        <li>Mobile-first and clean user interface</li>
        <li>Easy personalization for every occasion</li>
        <li>Privacy-focused sharing experience</li>
      </ul>

      <h3 style={{ marginTop: 16 }}>Our Goal</h3>

      <p style={{ marginTop: 6, marginBottom: 0 }}>
        We want to help people celebrate birthdays, festivals, achievements, 
        friendships, and special moments with thoughtful wishes that feel personal and genuine.
      </p>
    </StaticPage>
  }
/>
      <Route path="/save" element={<SavePage templatesState={templatesState} />} />
      <Route path="/admin" element={<AdminPage templatesState={templatesState} />} />
      <Route path="/wish/:username" element={<WishViewPage templatesState={templatesState} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function useFirestoreTemplates() {
  const [state, setState] = useState({
    templates: [],
    loading: true,
    error: '',
  });

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    const load = async () => {
      try {
        const { collection, getDocs, getFirestore, onSnapshot } = await import('firebase/firestore');
        const db = getFirestore(app);
        const templatesRef = collection(db, 'templates');

        const initialSnapshot = await getDocs(templatesRef);
        const initialTemplates = initialSnapshot.docs
          .map((docSnapshot) => normalizeTemplateDoc(docSnapshot.id, docSnapshot.data()))
          .filter((template) => template.enabled !== false)
          .sort(sortTemplates);

        if (active) {
          setState({
            templates: initialTemplates,
            loading: false,
            error: initialTemplates.length ? '' : 'No templates found in Firebase yet.',
          });
        }

        unsubscribe = onSnapshot(
          templatesRef,
          (snapshot) => {
            const templates = snapshot.docs
              .map((docSnapshot) => normalizeTemplateDoc(docSnapshot.id, docSnapshot.data()))
              .filter((template) => template.enabled !== false)
              .sort(sortTemplates);

            if (active) {
              setState({
                templates,
                loading: false,
                error: templates.length ? '' : 'No templates found in Firebase yet.',
              });
            }
          },
          (error) => {
            if (active) {
              setState({
                templates: [],
                loading: false,
                error: error?.message || 'Showing built-in templates because Firebase templates could not be loaded.',
              });
            }
          },
        );
      } catch (error) {
        if (active) {
          setState({
            templates: [],
            loading: false,
            error: error?.message || 'Showing built-in templates because Firebase templates could not be loaded.',
          });
        }
      }
    };

    load();
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return state;
}

function resolveTemplate(templates, templateId) {
  return templates.find((template) => template.id === templateId) || null;
}

function sortTemplates(left, right) {
  const leftLabel = String(left?.label || left?.id || '');
  const rightLabel = String(right?.label || right?.id || '');
  return (left?.order ?? 0) - (right?.order ?? 0) || leftLabel.localeCompare(rightLabel);
}

function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark">
        <img src="/brand-mark.svg" alt="Boltwish logo" />
      </div>
      <div className="brand-copy">
        <strong>Boltwish</strong>
        <span>Beautiful wishes, made fast</span>
      </div>
    </div>
  );
}

function AdminGate({ onUnlock, locked }) {
  const [code, setCode] = useState('');
  return (
    <Panel className="admin-gate">
      <div className="eyebrow">Admin access</div>
      <h1>Manage templates in Firebase.</h1>
      <p className="lead">Use the admin code to unlock template editing, seeding, and cleanup tools.</p>
      <div className="admin-gate-form">
        <input
          className="admin-input"
          type="password"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Admin code"
        />
        <AppButton onClick={() => onUnlock(code)}>Unlock admin</AppButton>
      </div>
      {locked ? <div className="notice error">Invalid admin code.</div> : null}
    </Panel>
  );
}

function AppButton({ variant = 'primary', className = '', ...props }) {
  return <button className={`action-btn action-${variant} ${className}`.trim()} {...props} />;
}

function TextButton({ className = '', ...props }) {
  return <button className={`topbar-link ${className}`.trim()} {...props} />;
}

function CardButton({ className = '', ...props }) {
  return <button className={`template-card ${className}`.trim()} {...props} />;
}

function Panel({ className = '', children, ...props }) {
  return <section className={`panel ${className}`.trim()} {...props}>{children}</section>;
}

function MotionPanel({ className = '', children, ...props }) {
  return (
    <motion.section
      className={`panel ${className}`.trim()}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.section>
  );
}

function IconPill({ icon: Icon, label }) {
  return (
    <span className="icon-pill">
      <Icon size={16} strokeWidth={2.4} />
      <span>{label}</span>
    </span>
  );
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow ? <div className="eyebrow eyebrow-dark">{eyebrow}</div> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="section-action">{action}</div> : null}
    </div>
  );
}

function WishMetaLines({ metaLines = [], className = '' }) {
  if (!metaLines.length) return null;

  return (
    <div className={`wish-card-meta ${className}`.trim()}>
      {metaLines.map((line) => (
        <div key={`${line.label}-${line.value}`} className="wish-card-line">
          <span>{line.label}</span>
          <strong>{line.value}</strong>
        </div>
      ))}
    </div>
  );
}

function getCountdownRemainingMs(eventDate) {
  if (!eventDate) return 0;

  const target = new Date(`${eventDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return 0;

  return Math.max(0, target.getTime() - Date.now());
}

function formatCountdownDuration(remainingMs) {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function useCountdownRemaining(eventDate) {
  const [remainingMs, setRemainingMs] = useState(() => getCountdownRemainingMs(eventDate));

  useEffect(() => {
    if (!eventDate) return undefined;

    const updateRemaining = () => setRemainingMs(getCountdownRemainingMs(eventDate));
    updateRemaining();

    const intervalId = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(intervalId);
  }, [eventDate]);

  return remainingMs;
}

function CountdownBadge({ eventDate }) {
  const remainingMs = useCountdownRemaining(eventDate);

  if (!remainingMs) return null;

  return <div className="countdown-badge">Reveal in {formatCountdownDuration(remainingMs)}</div>;
}

function RevealCountdownScreen({ remainingMs }) {
  return (
    <div className="center-screen reveal-gate-screen">
      <Panel className="reveal-gate-panel">
        <div className="eyebrow eyebrow-dark">Grand reveal</div>
        <h1>Grand reveal in {formatCountdownDuration(remainingMs)}</h1>
        <p className="lead">Your wish is locked until the timer finishes.</p>
      </Panel>
    </div>
  );
}

function HomePage({ templatesState }) {
  const navigate = useNavigate();
  const [recentWishes, setRecentWishes] = useState(() => readJson('recentWishes', []));
  const [selectedIds, setSelectedIds] = useState(() => readJson('recentSelected', {}));

  useEffect(() => {
    setRecentWishes(readJson('recentWishes', []));
    setSelectedIds(readJson('recentSelected', {}));
  }, []);

  const toggleSelect = (url) => {
    setSelectedIds((s) => {
      const next = { ...(s || {}) , [url]: !s[url] };
      writeJson('recentSelected', next);
      return next;
    });
  };

  const recentTemplates = templatesState.templates.slice(0, 4);
  const liveTemplate = recentTemplates[0] || templatesState.templates[0] || null;
  const livePreview = liveTemplate ? composeWishPreview(liveTemplate, {
    recipientData: buildRecipientDraft(liveTemplate),
    content: buildContentDraft(liveTemplate),
  }) : null;

  return (
    <div className="page-shell landing-shell">
      <header className="topbar topbar-home">
        <Brand />
      </header>
      <main className="landing-main">
        <section className="hero-grid home-grid landing-hero">
          <MotionPanel className="hero-card hero-accent hero-glass">
            <div className="eyebrow"><Sparkles size={14} /> Make Any Occasion Unforgettable</div>
            <h1>Create stunning, interactive wishes in 30 seconds.</h1>
            <p className="lead">Splash effects, music, and animated reveals to make moments unforgettable — no design skills required.</p>
            <div className="actions-row">
              <AppButton onClick={() => navigate('/template-picker')}>Create Wish →</AppButton>
              <AppButton variant="secondary" onClick={() => navigate('/template-picker')}>Explore community</AppButton>
            </div>
            <div className="stats-grid">
              <div className="stat-card"><strong>50,000+</strong><span>Wishes created</span></div>
              <div className="stat-card"><strong>30s</strong><span>Create a wish</span></div>
              <div className="stat-card"><strong>Anywhere</strong><span>Share on WhatsApp & Instagram</span></div>
            </div>
          </MotionPanel>

                  <MotionPanel className="side-panel hero-glass" id="recent-wish">
                    <div className="eyebrow"><BadgeCheck size={14} /> Recent activity</div>
                        <h2>Explore public wishes</h2>
                    <div className="recent-hero-card">
                      {recentWishes.length ? (
                        <>
                          <div className="recent-hero-head">
                            <h3>Saved on this device</h3>
                            <span>Up to 20 items</span>
                          </div>
                          <div className="recent-list">
                            {recentWishes.map((item, idx) => (
                              <div key={item.url + idx} className="recent-item">
                                <label className="recent-select">
                                  <input type="checkbox" checked={Boolean(selectedIds[item.url])} onChange={() => toggleSelect(item.url)} />
                                </label>
                                <div className="recent-meta">
                                  <div className="recent-title">{item.metadata?.recipientName || 'Recipient'} — {item.metadata?.templateLabel || ''}</div>
                                  <div className="recent-note">{new Date(item.createdAt).toLocaleString()}</div>
                                </div>
                                <div>
                                  <a className="action-btn action-secondary small" href={item.url} target="_blank" rel="noopener noreferrer" title="Open wish" aria-label="Open wish"><ExternalLink size={14} /></a>
                                  <button className="action-btn action-secondary small" type="button" title="Copy link" aria-label="Copy link" onClick={() => { navigator.clipboard.writeText(item.url).catch(() => {}); }}><Copy size={14} /></button>
                                  <button className="action-btn small" type="button" title="Remove" aria-label="Remove" onClick={() => {
                                    if (!window.confirm('Remove this saved wish?')) return;
                                    const next = recentWishes.filter((i, j) => j !== idx);
                                    setRecentWishes(next);
                                    writeJson('recentWishes', next);
                                    const nextSelected = { ...(readJson('recentSelected', {})) };
                                    delete nextSelected[item.url];
                                    writeJson('recentSelected', nextSelected);
                                    setSelectedIds(nextSelected);
                                  }}><Trash2 size={14} /></button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="actions-row">
                            <button className="action-btn action-secondary" type="button" disabled={Object.keys(selectedIds || {}).filter((k) => selectedIds[k]).length === 0} onClick={() => {
                              const selected = Object.keys(selectedIds || {}).filter((k) => selectedIds[k]);
                              if (!selected.length) return;
                              if (!window.confirm(`Delete ${selected.length} selected wish(es)? This cannot be undone.`)) return;
                              const next = recentWishes.filter((i) => !selected.includes(i.url));
                              setRecentWishes(next);
                              writeJson('recentWishes', next);
                              const nextSelected = { ...(readJson('recentSelected', {})) };
                              selected.forEach((k) => delete nextSelected[k]);
                              writeJson('recentSelected', nextSelected);
                              setSelectedIds(nextSelected);
                            }}>Delete selected</button>

                            <button className="action-btn" type="button" onClick={() => {
                              if (!recentWishes.length) return;
                              if (!window.confirm('Remove all saved wishes? This cannot be undone.')) return;
                              setRecentWishes([]);
                              writeJson('recentWishes', []);
                              writeJson('recentSelected', {});
                              setSelectedIds({});
                            }}>Remove all</button>
                          </div>
                        </>
                      ) : (
                        <p>{'Create wishes and they will appear here.'}</p>
                      )}
                    </div>
                  </MotionPanel>
        </section>

        <section className="section-card glass-section" id="features">
          <SectionHeading
            eyebrow="Features"
            title="Built for quick, polished sharing."
            description="Everything is designed to feel calm, fast, and premium on mobile and desktop."
          />
          <div className="feature-grid">
            {[
              { icon: Palette, title: 'Elegant templates', copy: 'Choose a style for birthdays, love, friendship, anniversaries, and more.' },
              { icon: Wand2, title: 'Live editing', copy: 'See the wish update instantly as you edit the recipient and message.' },
              { icon: Share2, title: 'One-tap sharing', copy: 'Save, copy, print, or share the final wish in seconds.' },
              { icon: ShieldCheck, title: 'Trust-friendly UI', copy: 'Clear spacing, readable text, and a simple layout that works on any device.' },
            ].map(({ icon: Icon, title, copy }) => (
              <MotionPanel key={title} className="feature-card glass-card">
                <div className="feature-icon"><Icon size={20} /></div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </MotionPanel>
            ))}
          </div>
        </section>

        <section className="section-card glass-section" id="how-it-works">
          <SectionHeading
            eyebrow="How it works"
            title="Four simple steps to a thoughtful wish."
            description="A focused flow that keeps the experience calm and easy to use."
          />
          <div className="steps-grid">
            {[
              ['1', 'Pick a template', 'Start with a polished design for the occasion.'],
              ['2', 'Add recipient details', 'Enter the person’s name and any needed details.'],
              ['3', 'Edit the message', 'Fine-tune the message, highlight, and footer.'],
              ['4', 'Preview and share', 'Check the final card, then save and share it.'],
            ].map(([step, title, copy]) => (
              <MotionPanel key={step} className="step-card glass-card">
                <div className="step-badge">{step}</div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </MotionPanel>
            ))}
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}

function StaticPage({ title, children }) {
  return (
    <PageShell title={title} description="">
      <MotionPanel className="glass-card static-card">
        <div className="eyebrow eyebrow-dark"><Sparkles size={14} /> Information</div>
        <h2>{title}</h2>
        <div className="static-copy">{children}</div>
      </MotionPanel>
    </PageShell>
  );
}

function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="site-footer glass-card" aria-label="footer links">
      <div className="footer-links">
        <button className="footer-link" type="button" onClick={() => navigate('/terms')}>Terms</button>
        <button className="footer-link" type="button" onClick={() => navigate('/contact')}>Contact</button>
        <button className="footer-link" type="button" onClick={() => navigate('/vision')}>Vision</button>
      </div>
      <div className="footer-socials">
        <a className="footer-icon-link" href="mailto:rlmsgames.help@gmail.com" aria-label="Email rlmsgames" title="Email rlmsgames">
          <Mail size={16} />
          <span className="footer-social-text">rlmsgames.help@gmail.com</span>
        </a>
        <button className="footer-icon-link" type="button" onClick={() => navigate('/social')} aria-label="Social links" title="Social links">
          <MessageSquareMore size={16} />
          <span className="footer-social-text">Social</span>
        </button>
      </div>
    </footer>
  );
}

function SocialPage() {
  const navigate = useNavigate();
  return (
    <PageShell title="Social" description="Find and follow RLMS Games on social platforms." actions={<AppButton variant="secondary" onClick={() => navigate('/')}>Back</AppButton>}>
      <MotionPanel className="glass-card static-card">
        <div className="eyebrow"><Sparkles size={14} /> Follow RLMS Games</div>
        <h2>Find us on these platforms</h2>
        <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a className="action-btn action-primary" href="https://instagram.com/rlmsgames?utm_source=boltwish&utm_medium=social_page&utm_campaign=follow" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a className="action-btn action-primary" href="https://x.com/rlmsgames?utm_source=boltwish&utm_medium=social_page&utm_campaign=follow" target="_blank" rel="noopener noreferrer">X (Twitter)</a>
          <a className="action-btn action-secondary" href="mailto:rlmsgames.help@gmail.com?subject=Hello%20RLMS%20Games%20from%20Boltwish">Email</a>
        </div>
        <p style={{ marginTop: 14, color: 'var(--muted)' }}>If adblock hides icons in the footer, use this page to access social profiles.</p>
      </MotionPanel>
    </PageShell>
  );
}

function PageShell({ kicker, title, description, actions, children, aside }) {
  return (
    <div className="page-shell">
      <header className="topbar">
        <Brand />
        <div className="topbar-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {actions ? <>{actions}</> : null}
          </div>
        </div>
      </header>
      <main className="hero-grid">
        <Panel className="hero-card">
          {kicker ? <div className="eyebrow">{kicker}</div> : null}
          <h1>{title}</h1>
          {description ? <p className="lead">{description}</p> : null}
          {children}
        </Panel>
        {aside}
      </main>
    </div>
  );
}

function TemplatePickerPage({ templatesState }) {
  const navigate = useNavigate();

  return (
    <PageShell
      kicker="Step 1 of 3 · Choose style"
      title="Choose a template that fits the moment."
      description="Templates are loaded from Firebase, so the picker reflects what you manage in the backend."
      actions={<AppButton variant="secondary" onClick={() => navigate('/')}>Back to welcome</AppButton>}
      aside={<Panel className="side-panel"><h2>Next step</h2><p>After you choose a template, you’ll edit both the recipient details and the actual content before saving.</p></Panel>}
    >
      <div className="actions-row"><AppButton onClick={() => document.getElementById('template-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Pick a template</AppButton></div>
      <div className="hero-note">If no templates show here, add or fix the documents in the Firebase <span>templates</span> collection.</div>
      <section className="templates-section" id="template-grid">
        {templatesState.error ? <div className="notice error">{templatesState.error}</div> : null}
        <div className="templates-grid">
          {templatesState.loading
            ? Array.from({ length: 8 }).map((_, index) => <div key={index} className="template-card skeleton-card tall" />)
            : templatesState.templates.map((template) => (
                <CardButton key={template.id} onClick={() => { writeJson('selectedTemplateId', template.id); navigate(`/template/${template.id}`); }}>
                  <span className="chip">{template.label}</span>
                  <strong>{template.icon} {template.chip}</strong>
                  <span>{template.summary || 'Edit this template in Firebase.'}</span>
                </CardButton>
              ))}
        </div>
        {!templatesState.loading && templatesState.templates.length === 0 ? <Panel className="empty-state"><h3>No templates yet</h3><p>Create documents in the Firebase <span>templates</span> collection to make this flow work.</p></Panel> : null}
      </section>
    </PageShell>
  );
}

function AdminPage({ templatesState }) {
  const navigate = useNavigate();
  const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem('adminUnlocked') === 'true');
  const [adminError, setAdminError] = useState('');
  const [templates, setTemplates] = useState([]);
  const [editingId, setEditingId] = useState('');
  const [notice, setNotice] = useState('');
  const [showPreview, setShowPreview] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 900 : true));

  useEffect(() => {
    if (!isUnlocked) return;

    const load = async () => {
      try {
        const { collection, getDocs, getFirestore } = await import('firebase/firestore');
        const db = getFirestore(app);
        const snapshot = await getDocs(collection(db, 'templates'));
        const docs = snapshot.docs.map((docSnapshot) => normalizeTemplateDoc(docSnapshot.id, docSnapshot.data()));
        setTemplates(docs);
        setEditingId((current) => current || (docs[0]?.id || ''));
        setAdminError('');
      } catch (error) {
        setAdminError(error?.message || 'Admin auth failed.');
        setTemplates([]);
      }
    };

    load();
  }, [isUnlocked]);

  const unlockAdmin = async (code) => {
    if (code !== ADMIN_CODE) {
      setAdminError('Invalid admin code.');
      return;
    }

    localStorage.setItem('adminUnlocked', 'true');
    setIsUnlocked(true);
    setAdminError('');
  };

  const selectedTemplate = templates.find((template) => template.id === editingId) || templates[0] || null;

  const preview = useMemo(() => {
    if (!selectedTemplate) return null;
    const recipientDraft = buildRecipientDraft(selectedTemplate);
    const contentDraft = selectedTemplate.content || buildContentDraft(selectedTemplate);
    return composeWishPreview(selectedTemplate, { recipientData: recipientDraft, content: contentDraft });
  }, [selectedTemplate]);

  const saveTemplate = async (template) => {
    const { doc, getFirestore, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await setDoc(doc(db, 'templates', template.id), template, { merge: true });
    setTemplates((current) => {
      const next = current.filter((item) => item.id !== template.id);
      next.push(template);
      return next.sort(sortTemplates);
    });
    setNotice(`Saved ${template.label}.`);
  };

  const deleteTemplate = async (templateId) => {
    const { deleteDoc, doc, getFirestore } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'templates', templateId));
    setTemplates((current) => current.filter((item) => item.id !== templateId));
    setEditingId((current) => {
      const remaining = templates.filter((item) => item.id !== templateId);
      return remaining[0]?.id || current;
    });
    setNotice('Template deleted.');
  };

  const seedTemplates = async () => {
    for (const template of templateSeed) {
      // eslint-disable-next-line no-await-in-loop
      await saveTemplate(template);
    }
    setNotice('Seeded Firebase templates from the built-in catalog.');
  };

  const updateSelected = (field, value) => {
    if (!selectedTemplate) return;
    if (field === 'id') return;
    const next = { ...selectedTemplate, [field]: value };
    setTemplates((current) => current.map((item) => (item.id === next.id ? next : item)));
  };

  const updateContent = (field, value) => {
    if (!selectedTemplate) return;
    const next = { ...selectedTemplate, content: { ...(selectedTemplate.content || {}), [field]: value } };
    setTemplates((current) => current.map((item) => (item.id === next.id ? next : item)));
  };

  const updateTheme = (field, value) => {
    if (!selectedTemplate) return;
    const next = { ...selectedTemplate, theme: { ...(selectedTemplate.theme || {}), [field]: value } };
    setTemplates((current) => current.map((item) => (item.id === next.id ? next : item)));
  };

  const addTemplate = () => {
    const draft = {
      id: `template-${Date.now()}`,
      label: 'New Template',
      chip: 'New Template',
      icon: '✨',
      summary: 'Start editing this template.',
      theme: { accent: '#e85d04', accentSoft: '#fb8500', background: 'sunrise' },
      fields: ['name', 'message', 'from'],
      content: buildContentDraft({ label: 'New Template', summary: 'Start editing this template.' }),
      order: templates.length + 1,
      enabled: true,
    };
    setTemplates((current) => [draft, ...current]);
    setEditingId(draft.id);
  };

  useEffect(() => {
    const onResize = () => setShowPreview(window.innerWidth >= 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!isUnlocked) {
    return (
      <div className="page-shell admin-shell">
        <header className="topbar">
          <Brand />
          <TextButton type="button" onClick={() => navigate('/')}>Home</TextButton>
        </header>
        <AdminGate onUnlock={unlockAdmin} locked={Boolean(adminError)} />
      </div>
    );
  }

  const logoutAdmin = () => {
    localStorage.removeItem('adminUnlocked');
    setIsUnlocked(false);
    setNotice('Logged out.');
    navigate('/');
  };

  return (
    <div className="page-shell admin-shell">
      <header className="topbar">
        <Brand />
        <div className="topbar-actions">
          <TextButton type="button" onClick={() => navigate('/')}>Home</TextButton>
          <TextButton type="button" onClick={seedTemplates}>Seed templates</TextButton>
          <AppButton variant="secondary" onClick={addTemplate}>Add template</AppButton>
          <TextButton type="button" onClick={() => setShowPreview((v) => !v)}>{showPreview ? 'Hide preview' : 'Show preview'}</TextButton>
          <TextButton type="button" onClick={logoutAdmin}>Logout</TextButton>
        </div>
      </header>
      <main className="admin-layout">
        <Panel className="admin-list panel">
          <div className="section-head">
            <div>
              <h2>Templates</h2>
              <p>Manage the collection that powers the picker.</p>
            </div>
          </div>
          {adminError ? <div className="notice error">{adminError}</div> : null}
          {notice ? <div className="notice">{notice}</div> : null}
          <div className="admin-template-list">
            {templates.map((template) => (
              <button key={template.id} type="button" className={`admin-template-row ${template.id === selectedTemplate?.id ? 'active' : ''}`} onClick={() => setEditingId(template.id)}>
                <strong>{template.icon} {template.label}</strong>
                <span>{template.summary}</span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel className="admin-editor panel">
          {selectedTemplate ? (
            <>
              <div className="section-head">
                <div>
                  <h2>Edit card</h2>
                  <p>Use simple language to change what people see when they create a wish.</p>
                </div>
                <div className="actions-row">
                  <AppButton variant="secondary" onClick={() => saveTemplate(selectedTemplate)}>Save</AppButton>
                  <AppButton variant="secondary" onClick={() => deleteTemplate(selectedTemplate.id)}>Delete</AppButton>
                </div>
              </div>

              <div className="admin-form-grid friendly-grid">
                <label className="field-group field-span-2"><span>Card name</span><input value={selectedTemplate.label || ''} onChange={(event) => updateSelected('label', event.target.value)} placeholder="Birthday, Wedding, Congrats..." /></label>
                <label className="field-group field-span-2"><span>Badge text</span><input value={selectedTemplate.chip || ''} onChange={(event) => updateSelected('chip', event.target.value)} placeholder="Birthday Wish" /></label>
                <label className="field-group field-span-2"><span>Emoji</span><input value={selectedTemplate.icon || ''} onChange={(event) => updateSelected('icon', event.target.value)} placeholder="🎂" /></label>
                <label className="field-group field-span-2"><span>Short description</span><textarea rows={3} value={selectedTemplate.summary || ''} onChange={(event) => updateSelected('summary', event.target.value)} placeholder="A short sentence that explains the card." /></label>
                <label className="field-group field-span-2"><span>Main message</span><textarea rows={7} value={selectedTemplate.content?.body || ''} onChange={(event) => updateContent('body', event.target.value)} placeholder="Write the main wish message here." /></label>
                <label className="field-group field-span-2"><span>Closing line</span><textarea rows={2} value={selectedTemplate.content?.footer || ''} onChange={(event) => updateContent('footer', event.target.value)} placeholder="With love, Team, Best wishes..." /></label>
                <label className="field-group field-span-2"><span>Extra highlight</span><textarea rows={2} value={selectedTemplate.content?.highlight || ''} onChange={(event) => updateContent('highlight', event.target.value)} placeholder="Short line that stands out on the card." /></label>
                <label className="field-group field-span-2"><span>Optional quote</span><textarea rows={2} value={selectedTemplate.content?.quote || ''} onChange={(event) => updateContent('quote', event.target.value)} placeholder="A short quote or closing thought." /></label>
                <label className="field-group field-span-2"><span>Accent color</span><input type="color" value={selectedTemplate.theme?.accent || '#e85d04'} onChange={(event) => updateTheme('accent', event.target.value)} /></label>
                <label className="field-group field-span-2"><span>Soft accent</span><input type="color" value={selectedTemplate.theme?.accentSoft || '#fb8500'} onChange={(event) => updateTheme('accentSoft', event.target.value)} /></label>
                <label className="field-group field-span-2"><span>Background style</span><input value={selectedTemplate.theme?.background || ''} onChange={(event) => updateTheme('background', event.target.value)} placeholder="sunrise" /></label>
                <label className="field-group field-span-2"><span>Sort order</span><input type="number" value={selectedTemplate.order ?? 0} onChange={(event) => updateSelected('order', Number(event.target.value))} /></label>
                <label className="field-group checkbox-row field-span-2"><input type="checkbox" checked={selectedTemplate.enabled !== false} onChange={(event) => updateSelected('enabled', event.target.checked)} /> Show this template to users</label>
              </div>
            </>
          ) : (
            <div className="empty-state"><h3>No template selected</h3><p>Add or choose a template from the list.</p></div>
          )}
        </Panel>
        {showPreview ? (
          <Panel className="admin-preview panel">
          <div className="section-head">
            <div>
              <h2>Live preview</h2>
              <p>See how this template will look when used in a wish.</p>
            </div>
          </div>
          {preview ? (
            <div className="preview-card template-preview-mini" style={{ '--wish-accent': selectedTemplate?.theme?.accent || '#e85d04', '--wish-accent-soft': selectedTemplate?.theme?.accentSoft || '#fb8500' }}>
              <div className="chip">{preview.chip}</div>
              <strong>{preview.title}</strong>
              <p>{preview.subtitle}</p>
              <WishMetaLines metaLines={preview.metaLines} className="wish-card-meta-inline" />
              <div className="preview-body">{preview.body.map((p) => <p key={p}>{p}</p>)}</div>
              {preview.highlight ? <div className="preview-highlight">{preview.highlight}</div> : null}
              {preview.quote ? <div className="preview-quote">“{preview.quote}”</div> : null}
            </div>
          ) : (
            <div className="empty-state"><p>No template selected.</p></div>
          )}
          </Panel>
        ) : null}
      </main>
    </div>
  );
}

function WishFormPage({ templatesState }) {
  const navigate = useNavigate();
  const params = useParams();
  const formId = 'wish-editor-form';
  const templateId = params.templateId || readJson('selectedTemplateId', '');
  const template = useMemo(() => resolveTemplate(templatesState.templates, templateId), [templatesState.templates, templateId]);
  const [recipientData, setRecipientData] = useState({});
  const [contentData, setContentData] = useState({});
  const [currentStep, setCurrentStep] = useState(2);

  useEffect(() => {
    if (!template) return;
    setRecipientData(buildRecipientDraft(template));
    setContentData(buildContentDraft(template));
    setCurrentStep(2);
  }, [template?.id]);

  const preview = useMemo(() => composeWishPreview(template, { recipientData, content: contentData }), [template, recipientData, contentData]);
  const recipientFieldsComplete = template ? template.fields.every((field) => String(recipientData[field.key] || '').trim().length > 0) : false;
  const contentFieldsComplete = defaultContentOrder.filter((field) => field !== 'title' && field !== 'subtitle').every((field) => field === 'body' ? String(contentData[field] || '').trim().length > 0 : true);
  const canContinue = currentStep === 2 ? recipientFieldsComplete : currentStep === 3 ? contentFieldsComplete : true;
  const wizardSteps = [
    { step: 1, label: 'Template', done: true },
    { step: 2, label: 'Details', done: currentStep > 2, active: currentStep === 2 },
    { step: 3, label: 'Message', done: currentStep > 3, active: currentStep === 3 },
    { step: 4, label: 'Preview', done: false, active: currentStep === 4 },
  ];

  // SEO: update page title and meta description based on live preview
  useEffect(() => {
    if (!preview || !template) return;
    const previousTitle = document.title;
    const meta = document.querySelector('meta[name="description"]') || (() => { const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m; })();
    const previousDesc = meta.getAttribute('content') || '';
    document.title = `${preview.title} — ${template.label || 'Boltwish'}`;
    meta.setAttribute('content', preview.subtitle || template.summary || 'Create and share a personalised wish');

    // Add JSON-LD for template page
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': `${template.label} template — Boltwish`,
      'description': template.summary || preview.subtitle || '',
      'url': `${window.location.origin}/template/${template.id}`,
      'mainEntity': {
        '@type': 'CreativeWork',
        'headline': template.label,
        'description': template.summary || '',
      },
    };
    const existingLd = document.getElementById('template-json-ld');
    if (existingLd) existingLd.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'template-json-ld';
    script.text = JSON.stringify(ld);
    document.head.appendChild(script);
    return () => {
      document.title = previousTitle;
      meta.setAttribute('content', previousDesc);
      const ldEl = document.getElementById('template-json-ld');
      if (ldEl) ldEl.remove();
    };
  }, [preview, template]);

  if (templatesState.loading) {
    return <div className="center-screen"><Panel className="fallback-panel"><h1>Loading templates...</h1><p>Waiting for Firebase to return the available templates.</p></Panel></div>;
  }

  if (!template) {
    return <div className="center-screen"><Panel className="fallback-panel"><h1>Choose a template first.</h1><p>That template could not be found in Firebase.</p><AppButton onClick={() => navigate('/template-picker')}>Back to templates</AppButton></Panel></div>;
  }

  const updateRecipient = (field, value) => setRecipientData((current) => ({ ...current, [field]: value }));
  const updateContent = (field, value) => setContentData((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const cleanedRecipientData = Object.fromEntries(template.fields.map((field) => [field.key, String(recipientData[field.key] || '').trim()]));
    const cleanedContent = Object.fromEntries(defaultContentOrder.map((field) => [field, String(contentData[field] || '').trim()]));

    writeJson('selectedTemplateId', template.id);
    writeJson('finalData', { templateId: template.id, templateSnapshot: template, recipientData: cleanedRecipientData, content: cleanedContent });
    navigate('/save');
  };

  const goNext = () => {
    if (currentStep < 4) {
      if (!canContinue) return;
      setCurrentStep((step) => Math.min(4, step + 1));
      return;
    }
    handleSubmit(new Event('submit'));
  };

  const goBack = () => {
    if (currentStep > 2) {
      setCurrentStep((step) => Math.max(2, step - 1));
      return;
    }
    navigate('/template-picker');
  };

  return (
    <PageShell
      kicker="Step 2 of 4 · Personalize"
      title="Build your wish in a calm, guided flow."
      description="Edit the recipient details, message, and final preview before saving."
      actions={<AppButton variant="secondary" onClick={() => navigate('/template-picker')}>Change template</AppButton>}
      aside={
        <MotionPanel className="side-panel preview-panel glass-sidebar">
          <div className="preview-rail-top">
            <div>
                <div className="eyebrow"><Eye size={14} /> Live preview</div>
              <h2>Preview updates in real time.</h2>
            </div>
            <Sparkles size={18} className="rail-icon" />
          </div>
          <div className="preview-card premium-preview" style={{ '--wish-accent': template?.theme?.accent || '#8b5cf6', '--wish-accent-soft': template?.theme?.accentSoft || '#ec4899' }}>
            <div className="chip">{preview.chip}</div>
            <strong>{preview.title}</strong>
            <p>{preview.subtitle}</p>
            <WishMetaLines metaLines={preview.metaLines} className="wish-card-meta-inline" />
            {recipientData.eventDate && preview.countdown ? <CountdownBadge eventDate={recipientData.eventDate} /> : null}
            <div className="preview-body">{preview.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
            {preview.highlight ? <div className="preview-highlight">{preview.highlight}</div> : null}
            {preview.quote ? <div className="preview-quote">“{preview.quote}”</div> : null}
          </div>
        </MotionPanel>
      }
    >
      <div className="stepper glass-card">
        {wizardSteps.map((item) => (
          <div key={item.step} className={`stepper-item ${item.active ? 'active' : ''} ${item.done ? 'done' : ''}`}>
            <span>{item.step}</span>
            <strong>{item.label}</strong>
          </div>
        ))}
      </div>

      <form id={formId} className="editor-layout wizard-layout" onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {currentStep === 2 ? (
            <motion.section key="recipient" className="editor-card glass-card wizard-card" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.28 }}>
              <SectionHeading
                eyebrow="Step 2"
                title="Add the recipient details."
                description="Use the few fields required for the selected template."
              />
              <div className="field-grid">
                {template.fields.map((field) => (
                  <label key={field.key} className="field-group floating-field">
                    <span>{field.label}</span>
                    {field.type === 'textarea' ? (
                      <textarea value={recipientData[field.key] || ''} required={field.required} maxLength={field.maxLength} placeholder={field.placeholder} onChange={(event) => updateRecipient(field.key, event.target.value)} />
                    ) : (
                      <input type={field.type} value={recipientData[field.key] || ''} required={field.required} min={field.min} max={field.max} maxLength={field.maxLength} placeholder={field.placeholder} onChange={(event) => updateRecipient(field.key, event.target.value)} />
                    )}
                  </label>
                ))}
              </div>
            </motion.section>
          ) : null}

          {currentStep === 3 ? (
            <motion.section key="content" className="editor-card glass-card wizard-card" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.28 }}>
              <SectionHeading
                eyebrow="Step 3"
                title="Edit the message."
                description="All message fields are prefilled so you can tweak every part of the card."
              />
              <div className="content-editor-grid">
                {defaultContentOrder.map((field) => {
                  const meta = contentFieldMeta[field];
                  const isSingleLine = field === 'title' || field === 'subtitle';
                  return (
                    <label key={field} className="field-group full-width floating-field">
                      <span>{meta.label}</span>
                      {isSingleLine ? (
                        <input value={contentData[field] || ''} maxLength={meta.maxLength} placeholder={meta.placeholder} onChange={(event) => updateContent(field, event.target.value)} />
                      ) : (
                        <textarea value={contentData[field] || ''} required={field === 'body'} maxLength={meta.maxLength} placeholder={meta.placeholder} rows={field === 'body' ? 7 : 3} onChange={(event) => updateContent(field, event.target.value)} />
                      )}
                    </label>
                  );
                })}
              </div>
            </motion.section>
          ) : null}

          {currentStep === 4 ? (
            <motion.section key="review" className="editor-card glass-card wizard-card" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.28 }}>
              <SectionHeading
                eyebrow="Step 4"
                title="Review the final wish."
                description="If everything looks right, save and share it."
              />
              <div className="review-grid">
                <div className="review-panel">
                  <h3>Recipient</h3>
                  <ul>
                    {template.fields.map((field) => <li key={field.key}><strong>{field.label}:</strong> {String(recipientData[field.key] || '')}</li>)}
                  </ul>
                </div>
                <div className="review-panel">
                  <h3>Message fields</h3>
                  <ul>
                    {defaultContentOrder.map((field) => <li key={field}><strong>{contentFieldMeta[field].label}:</strong> {String(contentData[field] || '').slice(0, 80)}</li>)}
                  </ul>
                </div>
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>

        <div className="wizard-actions actions-row form-actions">
          <AppButton variant="secondary" type="button" onClick={goBack}>Back</AppButton>
          <AppButton type={currentStep === 4 ? 'submit' : 'button'} onClick={currentStep === 4 ? undefined : goNext} disabled={!canContinue}>{currentStep === 4 ? 'Save and continue' : 'Next step'}</AppButton>
        </div>
      </form>

      <div className="mobile-sticky-bar">
        <div>
          <strong>Step {currentStep} of 4</strong>
          <span>{currentStep === 4 ? 'Ready to save' : 'Continue your wish'}</span>
        </div>
        <div className="mobile-sticky-actions">
          <AppButton variant="secondary" type="button" onClick={goBack}>Back</AppButton>
          <AppButton
            type={currentStep === 4 ? 'submit' : 'button'}
            form={currentStep === 4 ? formId : undefined}
            onClick={currentStep === 4 ? undefined : goNext}
            disabled={!canContinue}
          >
            {currentStep === 4 ? 'Save' : 'Next'}
          </AppButton>
        </div>
      </div>
    </PageShell>
  );
}

function SavePage({ templatesState }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Saving your wish...');
  const [saving, setSaving] = useState(true);
  const [savedLink, setSavedLink] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [wishData, setWishData] = useState(null);

  // Read finalData once to avoid repeated reads and to keep effect stable
  const finalData = normalizeWishDocument(readJson('finalData', null) || {});
  const persistedRef = useRef(false);

  useEffect(() => {
    const persistWish = async () => {
      if (persistedRef.current) return;
      persistedRef.current = true;

      if (!finalData.templateId) {
        setStatus('Missing wish data.');
        setSaving(false);
        return;
      }

      try {
        const { doc, getFirestore, serverTimestamp, setDoc } = await import('firebase/firestore');
        const db = getFirestore(app);
        const template = finalData.templateSnapshot || resolveTemplate(templatesState.templates, finalData.templateId);
        const recipientData = finalData.recipientData || {};
        const baseName = recipientData.name || recipientData.babyName || recipientData.bride || recipientData.groom || recipientData.parentName || 'user';
        const username = `${slugify(baseName)}-${Date.now().toString().slice(-4)}`;
        const payload = { templateId: finalData.templateId, templateSnapshot: template, recipientData, content: finalData.content || {}, username, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };

        await setDoc(doc(db, 'wishes', username), payload);

        const url = `${window.location.origin}/wish/${username}`;
        const metadata = { username, template: finalData.templateId, templateLabel: template?.label || 'Wish' };

        setWishData(payload);
        setSavedLink(url);
        setStatus('Your wish is ready!');
        setSaving(false);
        setShareMessage(buildShareMessage(template, payload, url));
        // persist to recentWishes list (local device) with recipient name
        try {
          const existing = readJson('recentWishes', []);
          const recipientName = recipientData.name || recipientData.babyName || recipientData.bride || recipientData.groom || recipientData.parentName || '';
          const entry = { url, metadata: { ...metadata, recipientName }, createdAt: Date.now() };
          const next = [entry, ...existing].slice(0, 20);
          writeJson('recentWishes', next);
        } catch (e) {
          // ignore storage errors
        }
        localStorage.removeItem('finalData');
      } catch (error) {
        setStatus(error?.message || 'Error saving data.');
        setSaving(false);
      }
    };

    // Only run once on mount; avoid re-running when templates change to prevent duplicate saves
    persistWish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openWish = () => { if (savedLink) window.open(savedLink, '_blank', 'noopener,noreferrer'); };
  const shareNative = async () => {
    if (!savedLink) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Boltwish', text: shareMessage, url: savedLink });
      } else {
        await navigator.clipboard.writeText(shareMessage);
        setStatus('Share message copied.');
      }
    } catch {
      await navigator.clipboard.writeText(shareMessage).catch(() => {});
      setStatus('Share message copied.');
    }
  };

  const preview = useMemo(() => {
    if (!wishData) return null;
    const template = wishData.templateSnapshot || resolveTemplate(templatesState.templates, wishData.templateId);
    return composeWishPreview(template, wishData);
  }, [wishData, templatesState.templates]);

  return (
    <div className="center-screen save-screen">
      <div className="topbar save-topbar"><button className="topbar-link" type="button" onClick={() => navigate('/')}>← Back to home</button></div>
      <Panel className="save-panel">
        <div className="progress-card"><div className="progress-label"><span>Step 3 of 3</span><span>100%</span></div><div className="progress-bar"><div className="progress-fill" /></div></div>
        <div className={`loader ${saving ? '' : 'loader-done'}`} aria-hidden="true" />
        <h1 className="save-status">{status}</h1>
        {preview ? <div className="save-preview"><div className="chip">{preview.chip}</div><strong>{preview.title}</strong><p>{preview.subtitle}</p><WishMetaLines metaLines={preview.metaLines} className="wish-card-meta-inline" /></div> : null}
        <div className="actions-column save-actions">
          <AppButton onClick={openWish} disabled={!savedLink}>Open Your Wish</AppButton>
          <AppButton variant="secondary" onClick={() => setShareOpen(true)} disabled={!savedLink}>Share Your Wish</AppButton>
          <AppButton variant="secondary" onClick={() => navigate('/')}>Back to Home</AppButton>
        </div>
        {shareOpen ? <ShareDialog message={shareMessage} link={savedLink} onClose={() => setShareOpen(false)} onCopy={async () => navigator.clipboard.writeText(shareMessage).catch(() => {})} onOpenNative={shareNative} /> : null}
      </Panel>
    </div>
  );
}

function ShareDialog({ message, link, onClose, onCopy, onOpenNative }) {
  const channelLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
  };

  return (
    <div className="share-overlay" role="presentation" onClick={onClose}>
      <div className="share-panel" role="dialog" aria-modal="true" aria-labelledby="share-title" onClick={(event) => event.stopPropagation()}>
        <div className="share-panel-head"><h3 id="share-title">Share your wish</h3><button className="topbar-link" type="button" onClick={onClose}>Close</button></div>
        <p className="share-hint">Share a direct link to the wish, or copy the message and paste it anywhere.</p>
        <div className="share-grid">
          <a className="share-btn whatsapp" href={channelLinks.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
          <button className="share-btn snapchat" type="button" onClick={onOpenNative}>Snapchat</button>
          <button className="share-btn instagram" type="button" onClick={onOpenNative}>Instagram</button>
          <a className="share-btn twitter" href={channelLinks.twitter} target="_blank" rel="noreferrer">Twitter</a>
          <button className="share-btn copy" type="button" onClick={onCopy}>Copy Message</button>
          <button className="share-btn copy" type="button" onClick={onOpenNative}>Native Share</button>
        </div>
        <div className="share-actions-row">
          <button className="topbar-link" type="button" onClick={onClose}>Close</button>
          <button className="action-btn action-primary" type="button" onClick={onClose}>Done</button>
        </div>
        <div className="share-link-preview">{link}</div>
      </div>
    </div>
  );
}

function WishViewPage({ templatesState }) {
  const { username } = useParams();
  const [status, setStatus] = useState('Loading your wish...');
  const [wishData, setWishData] = useState(null);

  useEffect(() => {
    const loadWish = async () => {
      if (!username) {
        setStatus('Invalid URL');
        return;
      }

      try {
        const { doc, getDoc, getFirestore } = await import('firebase/firestore');
        const db = getFirestore(app);
        const snapshot = await getDoc(doc(db, 'wishes', username));

        if (!snapshot.exists()) {
          setStatus('Wish not found.');
          return;
        }

        setWishData(normalizeWishDocument(snapshot.data()));
        setStatus('');
      } catch {
        setStatus('Something went wrong loading your wish.');
      }
    };

    loadWish();
  }, [username]);

  const copyLink = async () => {
    if (!username) return;
    await navigator.clipboard.writeText(`${window.location.origin}/wish/${username}`).catch(() => {});
  };

  // Compute template/preview early so hooks are called consistently
  const template = wishData ? (wishData.templateSnapshot || resolveTemplate(templatesState.templates, wishData.templateId)) : null;
  const preview = composeWishPreview(template || {}, wishData || {});
  const theme = template?.theme || {};
  const remainingMs = useCountdownRemaining(wishData?.recipientData?.eventDate);

  // SEO: set page title and description for public wish view
  useEffect(() => {
    if (!preview || !template) return;
    const previousTitle = document.title;
    const meta = document.querySelector('meta[name="description"]') || (() => { const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m; })();
    const previousDesc = meta.getAttribute('content') || '';
    const prevOgImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
    const prevOgTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const prevOgDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    const prevTwitterImage = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || '';

    const wishUrl = `${window.location.origin}/wish/${wishData?.username || username}`;
    // Use dynamic OG endpoint when wishData is available
    const imageUrl = wishData?.username
      ? `${window.location.origin}/api/og/wish/${wishData.username}?title=${encodeURIComponent(preview.title)}&subtitle=${encodeURIComponent(preview.subtitle)}&chip=${encodeURIComponent(preview.chip)}`
      : `${window.location.origin}/brand-mark.svg`;

    document.title = `${preview.title} — ${preview.displayName || template.label || 'Wish'}`;
    meta.setAttribute('content', preview.subtitle || template.summary || 'A personalised wish');

    // Set Open Graph and Twitter meta tags (create if missing)
    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (selector.includes('property')) el.setAttribute('property', selector.match(/property=\"([^\"]+)\"/)[1]);
        else el.setAttribute('name', selector.match(/name=\"([^\"]+)\"/)[1]);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
      return el;
    };

    setMeta('meta[property="og:title"]', 'content', `${preview.title} — ${preview.displayName || template.label || 'Wish'}`);
    setMeta('meta[property="og:description"]', 'content', preview.subtitle || template.summary || 'A personalised wish');
    setMeta('meta[property="og:url"]', 'content', wishUrl);
    setMeta('meta[property="og:image"]', 'content', imageUrl);
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:image"]', 'content', imageUrl);

    // JSON-LD structured data for the wish page
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': `${preview.title} — ${preview.displayName || template.label || 'Wish'}`,
      'description': preview.subtitle || template.summary || '',
      'url': wishUrl,
      'image': imageUrl,
      'mainEntity': {
        '@type': 'CreativeWork',
        'headline': preview.title,
        'author': { '@type': 'Person', 'name': preview.displayName || '' },
      },
    };

    const existingLd = document.getElementById('wish-json-ld');
    if (existingLd) existingLd.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'wish-json-ld';
    script.text = JSON.stringify(ld);
    document.head.appendChild(script);

    return () => {
      document.title = previousTitle;
      meta.setAttribute('content', previousDesc);
      // restore previous og/twitter tags when possible
      if (prevOgImage) setMeta('meta[property="og:image"]', 'content', prevOgImage);
      if (prevOgTitle) setMeta('meta[property="og:title"]', 'content', prevOgTitle);
      if (prevOgDesc) setMeta('meta[property="og:description"]', 'content', prevOgDesc);
      if (prevTwitterImage) setMeta('meta[name="twitter:image"]', 'content', prevTwitterImage);
      const ldEl = document.getElementById('wish-json-ld');
      if (ldEl) ldEl.remove();
    };
  }, [preview, template]);

  if (status && !wishData) {
    return <div className="center-screen"><Panel className="wish-loading"><h2>{status}</h2><p>Please wait while we fetch your card.</p></Panel></div>;
  }

  if (!wishData) return null;

  if (remainingMs > 0) {
    return <RevealCountdownScreen remainingMs={remainingMs} />;
  }

  return (
    <div className="wish-view" style={{ '--wish-accent': theme.accent || '#e85d04', '--wish-accent-soft': theme.accentSoft || '#fb8500' }}>
      <div className="wish-view-shell">
        <div className="wish-card-wrap">
          <div className="wish-card panel final-card-old">
            <div className="wish-card-summary-head">
                <div className="chip">{preview.chip}</div>
            </div>

            <strong>{preview.title}</strong>
            <p className="lead wish-subtitle">{preview.subtitle}</p>
            {/* For thank-you style templates show the recipient under the subtitle */}
            {template?.id === 'thankyou' && preview.toLine ? <div className="wish-to-line">{preview.toLine}</div> : null}

            <div className="wish-decor" aria-hidden="true">
              <span>{template?.icon || '✨'}</span>
              <span>{template?.icon || '💌'}</span>
              <span>{template?.icon || '🎉'}</span>
            </div>

            <div className="wish-message-box">{preview.body.map((line) => <p key={line}>{line}</p>)}</div>
            {preview.highlight ? <div className="highlight-box">{preview.highlight}</div> : null}
            {preview.quote ? <div className="quote-box">“{preview.quote}”</div> : null}

            {preview.footer ? <footer className="wish-footer">{preview.footer.split('\n').map((line) => <div key={line}>{line}</div>)}</footer> : null}

            {/* Place sender "From:" line after the signature/footer for final/print templates */}
            {preview.fromLine ? <div className="wish-from-line" style={{ marginTop: 12 }}>{preview.fromLine}</div> : null}

            <div className="wish-actions-row">
              <AppButton variant="secondary" onClick={() => window.print()}>Print</AppButton>
              <AppButton variant="secondary" onClick={copyLink}>Copy link</AppButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;