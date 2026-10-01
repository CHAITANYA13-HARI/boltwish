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
  CheckCircle2,
  CircleOff,
  Mail,
  Palette,
  Eye,
  ExternalLink,
  Copy,
  LayoutDashboard,
  LogOut,
  Plus,
  RotateCcw,
  Save,
  Search,
  Trash2,
  Sparkles,
  Share2,
  Wand2,
  Globe2,
  ShieldCheck,
  MessageSquareMore,
  LockKeyhole,
  PartyPopper,
} from 'lucide-react';
// Firebase initialization (eager) — keep the original import to match existing usage.
import { EnvelopeUnboxing } from './components/EnvelopeUnboxing';
import { BirthdayCake } from './components/BirthdayCake';
import { SendLoveBack } from './components/SendLoveBack';
import { GiftTagModal } from './components/GiftTagModal';
import { adminApp, app } from './lib/firebase';
import {
  defaultWishMessages,
  buildContentDraft,
  buildRecipientDraft,
  buildShareMessage,
  composeWishPreview,
  defaultContentOrder,
  normalizeTemplateDoc,
  normalizeWishDocument,
  wishTones,
} from './data/templates';
import { templateSeed } from './data/templateSeed';
import { createSecureId, readJson, slugify, writeJson } from './lib/storage';
const SITE_NAME = 'Boltwish';
const SITE_DESCRIPTION = 'Create and share beautiful wish cards with personalized templates, live previews, and one-tap sharing.';
const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://boltwish.vercel.app').replace(/\/$/, '');
const DEFAULT_OG_IMAGE = `${SITE_URL}/brand-mark.svg`;

function toAbsoluteUrl(pathname = '/') {
  if (!pathname) return SITE_URL;
  if (/^https?:\/\//i.test(pathname)) return pathname;
  return `${SITE_URL}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

function upsertMeta(selector, attribute, value) {
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    const nameMatch = selector.match(/name="([^"]+)"/);
    const propertyMatch = selector.match(/property="([^"]+)"/);
    if (nameMatch) element.setAttribute('name', nameMatch[1]);
    if (propertyMatch) element.setAttribute('property', propertyMatch[1]);
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
  return element;
}

function upsertCanonical(href) {
  let element = document.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
  return element;
}

function useSeoMeta({
  title,
  description,
  canonicalPath = '/',
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  robots = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
  jsonLd,
  jsonLdId = 'page-json-ld',
}) {
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const previousTitle = document.title;
    const previousDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const previousRobots = document.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
    const previousCanonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
    const previousOgTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const previousOgDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    const previousOgUrl = document.querySelector('meta[property="og:url"]')?.getAttribute('content') || '';
    const previousOgImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
    const previousOgType = document.querySelector('meta[property="og:type"]')?.getAttribute('content') || '';
    const previousOgSiteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') || '';
    const previousTwitterCard = document.querySelector('meta[name="twitter:card"]')?.getAttribute('content') || '';
    const previousTwitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || '';
    const previousTwitterDescription = document.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || '';
    const previousTwitterImage = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || '';

    document.title = title || SITE_NAME;
    upsertMeta('meta[name="description"]', 'content', description || SITE_DESCRIPTION);
    upsertMeta('meta[name="robots"]', 'content', robots);
    upsertCanonical(toAbsoluteUrl(canonicalPath));
    upsertMeta('meta[property="og:title"]', 'content', title || SITE_NAME);
    upsertMeta('meta[property="og:description"]', 'content', description || SITE_DESCRIPTION);
    upsertMeta('meta[property="og:url"]', 'content', toAbsoluteUrl(canonicalPath));
    upsertMeta('meta[property="og:image"]', 'content', image);
    upsertMeta('meta[property="og:type"]', 'content', type);
    upsertMeta('meta[property="og:site_name"]', 'content', SITE_NAME);
    upsertMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    upsertMeta('meta[name="twitter:title"]', 'content', title || SITE_NAME);
    upsertMeta('meta[name="twitter:description"]', 'content', description || SITE_DESCRIPTION);
    upsertMeta('meta[name="twitter:image"]', 'content', image);

    const existingLd = document.getElementById(jsonLdId);
    if (existingLd) existingLd.remove();

    if (jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = jsonLdId;
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      document.title = previousTitle;
      upsertMeta('meta[name="description"]', 'content', previousDescription || SITE_DESCRIPTION);
      upsertMeta('meta[name="robots"]', 'content', previousRobots || 'index,follow');
      upsertCanonical(previousCanonical || toAbsoluteUrl('/'));
      upsertMeta('meta[property="og:title"]', 'content', previousOgTitle || SITE_NAME);
      upsertMeta('meta[property="og:description"]', 'content', previousOgDescription || SITE_DESCRIPTION);
      upsertMeta('meta[property="og:url"]', 'content', previousOgUrl || toAbsoluteUrl(canonicalPath));
      upsertMeta('meta[property="og:image"]', 'content', previousOgImage || DEFAULT_OG_IMAGE);
      upsertMeta('meta[property="og:type"]', 'content', previousOgType || 'website');
      upsertMeta('meta[property="og:site_name"]', 'content', previousOgSiteName || SITE_NAME);
      upsertMeta('meta[name="twitter:card"]', 'content', previousTwitterCard || 'summary_large_image');
      upsertMeta('meta[name="twitter:title"]', 'content', previousTwitterTitle || SITE_NAME);
      upsertMeta('meta[name="twitter:description"]', 'content', previousTwitterDescription || SITE_DESCRIPTION);
      upsertMeta('meta[name="twitter:image"]', 'content', previousTwitterImage || DEFAULT_OG_IMAGE);
      const ldEl = document.getElementById(jsonLdId);
      if (ldEl) ldEl.remove();
    };
  }, [canonicalPath, description, image, jsonLd, jsonLdId, title, type, robots]);
}

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
      <Route path="/manage/:username" element={<ManageWishPage templatesState={templatesState} />} />
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
        const { app } = await import('./lib/firebase');
        const db = getFirestore(app);
        const templatesRef = collection(db, 'templates');

        const initialSnapshot = await getDocs(templatesRef);
        const initialTemplates = initialSnapshot.docs
          .map((docSnapshot) => normalizeTemplateDoc(docSnapshot.id, prepareTemplateDocument(docSnapshot.id, docSnapshot.data())))
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
              .map((docSnapshot) => normalizeTemplateDoc(docSnapshot.id, prepareTemplateDocument(docSnapshot.id, docSnapshot.data())))
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

function prepareTemplateDocument(templateId, data = {}) {
  const personalizedTemplate = templateSeed.find((template) => template.id === templateId);
  if (!personalizedTemplate || Number(data.personalizationVersion || 0) >= 3) return data;

  return {
    ...personalizedTemplate,
    ...data,
    summary: personalizedTemplate.summary,
    fields: personalizedTemplate.fields,
    content: personalizedTemplate.content,
    personalizationVersion: 3,
  };
}

function sortTemplates(left, right) {
  const leftLabel = String(left?.label || left?.id || '');
  const rightLabel = String(right?.label || right?.id || '');
  return (left?.order ?? 0) - (right?.order ?? 0) || leftLabel.localeCompare(rightLabel);
}

function getStaticPageMeta(title) {
  const map = {
    'Terms & Conditions': {
      description: 'Read the terms for using Boltwish, including content rules, liability, and service availability.',
      canonicalPath: '/terms',
    },
    'Contact Us': {
      description: 'Contact the Boltwish team for support, feedback, and feature requests.',
      canonicalPath: '/contact',
    },
    'Our Vision': {
      description: 'See how Boltwish helps people create thoughtful wishes quickly with a clean, mobile-friendly flow.',
      canonicalPath: '/vision',
    },
  };

  return map[title] || {
    description: SITE_DESCRIPTION,
    canonicalPath: '/',
  };
}

function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark">
        <img src="/brand-mark.svg" alt="Boltwish logo" width="48" height="48" role="img" />
      </div>
      <div className="brand-copy">
        <strong>Boltwish</strong>
        <span>Beautiful wishes, made fast</span>
      </div>
    </div>
  );
}

function AdminGate({ onUnlock, error, busy }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = (event) => {
    event.preventDefault();
    onUnlock({ email: email.trim(), password });
  };

  return (
    <Panel className="admin-gate">
      <div className="admin-lock-icon"><LockKeyhole size={26} /></div>
      <div className="eyebrow">Protected admin area</div>
      <h1>Sign in to manage Boltwish.</h1>
      <p className="lead">Your password is checked securely by Firebase Authentication. It is never stored in this website's code.</p>
      <form className="admin-gate-form" onSubmit={submit}>
        <input
          className="admin-input"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Admin email"
          autoComplete="username"
          required
        />
        <input
          className="admin-input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          minLength={6}
          required
        />
        <AppButton type="submit" disabled={busy}>{busy ? 'Checking access…' : 'Sign in securely'}</AppButton>
      </form>
      <p className="admin-security-note"><ShieldCheck size={16} /> Access also requires an admin record in the backend.</p>
      {error ? <div className="notice error" role="alert">{error}</div> : null}
    </Panel>
  );
}

function cleanForFirestore(value) {
  if (Array.isArray(value)) return value.map(cleanForFirestore);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key, cleanForFirestore(entry)]),
    );
  }
  return value;
}

async function ensureWishOwner() {
  const { getAuth, signInAnonymously, signOut } = await import('firebase/auth');
  const auth = getAuth(app);
  if (auth.currentUser?.isAnonymous) return auth.currentUser;
  if (auth.currentUser) await signOut(auth);
  const credential = await signInAnonymously(auth);
  return credential.user;
}

function valueToMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.toDate === 'function') return value.toDate().getTime();
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  const parsed = new Date(String(value).includes('T') ? value : `${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function valueToDateInput(value) {
  const millis = valueToMillis(value);
  if (!millis) return '';
  const date = new Date(millis);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

const WISH_ACCESS_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

function createWishSchedule(Timestamp, eventDate) {
  const revealMillis = valueToMillis(eventDate);
  if (!revealMillis) throw new Error('Please enter a valid event date.');

  return {
    revealAt: Timestamp.fromMillis(revealMillis),
    expiresAt: Timestamp.fromMillis(revealMillis + WISH_ACCESS_WINDOW_MS),
  };
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

function WishExperience({ preview, template, compact = false, children }) {
  const icon = template?.icon || '✨';
  const displayName = preview?.displayName && preview.displayName !== 'there' ? preview.displayName : '';
  const visualStyle = slugify(template?.theme?.background || template?.id || 'celebration');
  const motifSets = {
    sunrise: ['✦', '●', '🎈', '✦'],
    blush: ['♡', '✦', '∞', '♡'],
    rose: ['♥', '✦', '♡', '♥'],
    violet: ['★', '✦', '◆', '★'],
    sky: ['☁', '★', '☾', '☁'],
    peach: ['❀', '✦', '♡', '❀'],
    mint: ['✦', '☻', '◆', '✦'],
    teal: ['✦', '♡', '●', '✦'],
  };
  const motifs = motifSets[visualStyle] || ['✦', '●', '◆', '✦'];

  return (
    <article className={`wish-experience wish-style-${visualStyle} wish-tone-${preview.tone || 'heartfelt'} ${compact ? 'wish-experience-compact' : 'wish-experience-full'}`.trim()}>
      <div className="wish-aurora wish-aurora-one" aria-hidden="true" />
      <div className="wish-aurora wish-aurora-two" aria-hidden="true" />
      <div className="wish-confetti" aria-hidden="true">
        {Array.from({ length: compact ? 8 : 16 }).map((_, index) => <i key={index} />)}
      </div>
      <div className="wish-motifs" aria-hidden="true">{motifs.map((motif, index) => <span key={`${motif}-${index}`}>{motif}</span>)}</div>
      <div className="wish-experience-content">
        <div className="wish-occasion-pill"><PartyPopper size={15} /> {preview.chip}</div>
        <div className="wish-icon-orbit" aria-hidden="true"><span>{icon}</span></div>
        {displayName ? <p className="wish-dedication">A special wish for</p> : null}
        {displayName ? <div className="wish-recipient-name">{displayName}</div> : null}
        <h2>{preview.title}</h2>
        {preview.subtitle ? <p className="wish-experience-subtitle">{preview.subtitle}</p> : null}
        <WishMetaLines metaLines={preview.metaLines} className="wish-experience-meta" />
        <div className="wish-story">
          {preview.body.map((paragraph, index) => <p key={`${paragraph}-${index}`}>{paragraph}</p>)}
        </div>
        {preview.highlight ? <div className="wish-highlight"><Sparkles size={18} /> <span>{preview.highlight}</span></div> : null}
        {preview.quote ? <blockquote>“{preview.quote}”</blockquote> : null}
        {(preview.footer || preview.fromLine) ? (
          <div className="wish-signoff">
            {preview.footer ? preview.footer.split('\n').map((line, index) => <span key={`${line}-${index}`}>{line}</span>) : null}
            {preview.fromLine ? <strong>{preview.fromLine}</strong> : null}
          </div>
        ) : null}
        {children}
      </div>
    </article>
  );
}

function ToneSelector({ value, onChange }) {
  return (
    <div className="tone-section">
      <div className="tone-section-head">
        <div><span className="tone-kicker">Writing style</span><h3>How should this wish sound?</h3></div>
        <span className="tone-current">{wishTones.find((tone) => tone.id === value)?.label}</span>
      </div>
      <div className="tone-grid" role="radiogroup" aria-label="Wish tone">
        {wishTones.map((tone) => (
          <button key={tone.id} type="button" role="radio" aria-checked={value === tone.id} className={`tone-card ${value === tone.id ? 'active' : ''}`} onClick={() => onChange(tone.id)}>
            <span className="tone-emoji">{tone.emoji}</span>
            <span><strong>{tone.label}</strong><small>{tone.description}</small></span>
          </button>
        ))}
      </div>
    </div>
  );
}

function getCountdownRemainingMs(eventDate) {
  return Math.max(0, valueToMillis(eventDate) - Date.now());
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

  useSeoMeta({
    title: 'Boltwish | Beautiful wishes, made fast',
    description: SITE_DESCRIPTION,
    canonicalPath: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: toAbsoluteUrl('/'),
      description: SITE_DESCRIPTION,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${toAbsoluteUrl('/template-picker')}?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    jsonLdId: 'home-json-ld',
  });

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
            <p className="lead">Answer a few thoughtful prompts and turn your memories into a polished, private wish—no writing or design skills required.</p>
            <div className="actions-row">
              <AppButton onClick={() => navigate('/template-picker')}>Create Wish →</AppButton>
              <AppButton variant="secondary" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>See how it works</AppButton>
            </div>
            <div className="stats-grid">
              <div className="stat-card"><strong>8</strong><span>Occasion-specific designs</span></div>
              <div className="stat-card"><strong>4</strong><span>Personal writing tones</span></div>
              <div className="stat-card"><strong>Private</strong><span>Unlisted, expiring links</span></div>
            </div>
          </MotionPanel>

                  <MotionPanel className="side-panel hero-glass" id="recent-wish">
                    <div className="eyebrow"><BadgeCheck size={14} /> Recent activity</div>
                        <h2>Your wishes on this device</h2>
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
  const meta = getStaticPageMeta(title);

  useSeoMeta({
    title: `${title} | Boltwish`,
    description: meta.description,
    canonicalPath: meta.canonicalPath,
  });

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

  useSeoMeta({
    title: 'Social links | Boltwish',
    description: 'Find Boltwish on social platforms and email support.',
    canonicalPath: '/social',
  });

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
      <main id="main-content" className="hero-grid">
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

  useSeoMeta({
    title: 'Choose a template | Boltwish',
    description: 'Browse wish templates for birthdays, anniversaries, weddings, congratulations, and more.',
    canonicalPath: '/template-picker',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Template picker | Boltwish',
      description: 'Browse wish templates for birthdays, anniversaries, weddings, congratulations, and more.',
      url: toAbsoluteUrl('/template-picker'),
    },
    jsonLdId: 'template-picker-json-ld',
  });

  return (
    <PageShell
      kicker="Choose an occasion · Pick a design"
      title="Choose a template that fits the moment."
      description="Each occasion has its own visual personality, writing tones, and thoughtful prompts."
      actions={<AppButton variant="secondary" onClick={() => navigate('/')}>Back to welcome</AppButton>}
      aside={<Panel className="side-panel"><h2>Next step</h2><p>Choose a writing tone, answer a few personal prompts, and watch the finished wish come to life.</p></Panel>}
    >
      <div className="actions-row"><AppButton onClick={() => document.getElementById('template-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Pick a template</AppButton></div>
      <section className="templates-section" id="template-grid">
        {templatesState.error ? <div className="notice error">{templatesState.error}</div> : null}
        <div className="templates-grid">
          {templatesState.loading
            ? Array.from({ length: 8 }).map((_, index) => <div key={index} className="template-card skeleton-card tall" />)
            : templatesState.templates.map((template) => (
                <CardButton key={template.id} className={`visual-template-card template-card-${slugify(template.theme?.background || template.id)}`} style={{ '--template-accent': template.theme?.accent, '--template-soft': template.theme?.accentSoft }} onClick={() => { writeJson('selectedTemplateId', template.id); navigate(`/template/${template.id}`); }}>
                  <span className="template-card-art" aria-hidden="true"><i>{template.icon}</i><b>✦</b><b>●</b></span>
                  <span className="chip">{template.label}</span>
                  <strong>{template.chip}</strong>
                  <span>{template.summary || 'A thoughtful wish for this occasion.'}</span>
                  <span className="template-card-cta">Personalize this design <ArrowRight size={14} /></span>
                </CardButton>
              ))}
        </div>
        {!templatesState.loading && templatesState.templates.length === 0 ? <Panel className="empty-state"><h3>No templates yet</h3><p>Create documents in the Firebase <span>templates</span> collection to make this flow work.</p></Panel> : null}
      </section>
    </PageShell>
  );
}

function AdminPage() {
  const navigate = useNavigate();
  const [authStatus, setAuthStatus] = useState('checking');
  const [adminUser, setAdminUser] = useState(null);
  const [adminError, setAdminError] = useState('');
  const [templates, setTemplates] = useState([]);
  const [savedTemplates, setSavedTemplates] = useState({});
  const [editingId, setEditingId] = useState('');
  const [notice, setNotice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [savingId, setSavingId] = useState('');
  const [previewTone, setPreviewTone] = useState('heartfelt');
  const [showPreview, setShowPreview] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 900 : true));
  const [adminTab, setAdminTab] = useState('templates');
  const [liveWishes, setLiveWishes] = useState([]);
  const [loadingWishes, setLoadingWishes] = useState(false);
  const [wishSearch, setWishSearch] = useState('');

  const isUnlocked = authStatus === 'authorized';

  const loadWishes = async () => {
    setLoadingWishes(true);
    try {
      const { collection, getDocs, getFirestore, limit, query } = await import('firebase/firestore');
      const db = getFirestore(adminApp);
      const snapshot = await getDocs(query(collection(db, 'wishes'), limit(80)));
      const list = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      setLiveWishes(list);
    } catch (err) {
      setNotice('Could not load live wishes: ' + (err?.message || 'Error'));
    } finally {
      setLoadingWishes(false);
    }
  };

  const deleteWishAsAdmin = async (wishId) => {
    if (!window.confirm(`Permanently delete wish "${wishId}"? This will immediately remove it from live viewing.`)) return;
    try {
      const { doc, deleteDoc, getFirestore } = await import('firebase/firestore');
      await deleteDoc(doc(getFirestore(adminApp), 'wishes', wishId));
      setLiveWishes((prev) => prev.filter((w) => w.id !== wishId));
      setNotice(`Wish "${wishId}" successfully deleted.`);
    } catch (err) {
      setNotice('Failed to delete wish: ' + (err?.message || 'Error'));
    }
  };
  const cloneTemplate = (template) => JSON.parse(JSON.stringify(template));
  const templateSignature = (template) => JSON.stringify(cleanForFirestore(template || {}));

  useSeoMeta({
    title: 'Admin dashboard | Boltwish',
    description: 'Private template management dashboard for Boltwish.',
    canonicalPath: '/admin',
    robots: 'noindex,nofollow',
  });

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    const watchAuth = async () => {
      const { getAuth, onAuthStateChanged, signOut } = await import('firebase/auth');
      const { doc, getDoc, getFirestore } = await import('firebase/firestore');
      const auth = getAuth(adminApp);

      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!active) return;
        if (!user) {
          setAdminUser(null);
          setAuthStatus('signed-out');
          return;
        }

        setAuthStatus('checking');
        try {
          const adminRecord = await getDoc(doc(getFirestore(adminApp), 'admins', user.uid));
          if (!adminRecord.exists()) {
            await signOut(auth);
            if (active) setAdminError('This account is valid, but it is not listed in the admins collection.');
            return;
          }
          if (active) {
            setAdminUser(user);
            setAdminError('');
            setAuthStatus('authorized');
          }
        } catch (error) {
          await signOut(auth).catch(() => {});
          if (active) {
            setAdminError(error?.code === 'permission-denied'
              ? 'Admin access is blocked by Firestore. Publish the latest firestore.rules to this Firebase project.'
              : 'Admin access could not be verified right now.');
            setAuthStatus('signed-out');
          }
        }
      });
    };

    watchAuth().catch(() => {
      if (active) {
        setAdminError('Authentication is not available right now.');
        setAuthStatus('signed-out');
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isUnlocked) return undefined;

    const load = async () => {
      try {
        const { collection, getDocs, getFirestore } = await import('firebase/firestore');
        const snapshot = await getDocs(collection(getFirestore(adminApp), 'templates'));
        const docs = snapshot.docs
          .map((docSnapshot) => normalizeTemplateDoc(docSnapshot.id, prepareTemplateDocument(docSnapshot.id, docSnapshot.data())))
          .sort(sortTemplates);
        setTemplates(docs);
        setSavedTemplates(Object.fromEntries(docs.map((template) => [template.id, cloneTemplate(template)])));
        setEditingId((current) => current || (docs[0]?.id || ''));
        setAdminError('');
      } catch (error) {
        setAdminError(error?.code === 'permission-denied'
          ? 'Template access is blocked. Publish the latest Firestore rules and sign in again.'
          : error?.message || 'Templates could not be loaded.');
        setTemplates([]);
      }
    };

    load();
    return undefined;
  }, [isUnlocked]);

  const unlockAdmin = async ({ email, password }) => {
    setAuthStatus('checking');
    setAdminError('');
    try {
      const { browserSessionPersistence, getAuth, setPersistence, signInWithEmailAndPassword } = await import('firebase/auth');
      const auth = getAuth(adminApp);
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const message = error?.code === 'auth/invalid-credential'
        ? 'The admin email or password is incorrect.'
        : error?.code === 'auth/too-many-requests'
          ? 'Too many attempts. Wait a moment and try again.'
          : 'Sign-in failed. Check that Email/Password authentication is enabled.';
      setAdminError(message);
      setAuthStatus('signed-out');
    }
  };

  const selectedTemplate = templates.find((template) => template.id === editingId) || templates[0] || null;
  const isDirty = Boolean(selectedTemplate) && templateSignature(selectedTemplate) !== templateSignature(savedTemplates[selectedTemplate.id]);
  const enabledCount = templates.filter((template) => template.enabled !== false).length;
  const hiddenCount = templates.length - enabledCount;
  const totalPrompts = templates.reduce((total, template) => total + (template.fields?.length || 0), 0);

  const filteredTemplates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return templates.filter((template) => {
      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'enabled' && template.enabled !== false)
        || (statusFilter === 'hidden' && template.enabled === false);
      const matchesQuery = !query || `${template.label} ${template.chip} ${template.summary} ${template.id}`.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [searchQuery, statusFilter, templates]);

  const preview = useMemo(() => {
    if (!selectedTemplate) return null;
    const recipientDraft = buildRecipientDraft(selectedTemplate);
    const contentDraft = selectedTemplate.content || buildContentDraft(selectedTemplate);
    return composeWishPreview(selectedTemplate, { recipientData: recipientDraft, content: contentDraft, tone: previewTone });
  }, [previewTone, selectedTemplate]);

  const saveTemplate = async (template) => {
    if (!template?.id || !template?.label?.trim()) {
      setAdminError('Every template needs a name before it can be saved.');
      return;
    }
    setSavingId(template.id);
    setNotice('');
    setAdminError('');
    try {
      const { doc, getFirestore, setDoc } = await import('firebase/firestore');
      const cleanTemplate = cleanForFirestore(template);
      await setDoc(doc(getFirestore(adminApp), 'templates', template.id), cleanTemplate, { merge: true });
      setTemplates((current) => current.map((item) => (item.id === template.id ? template : item)).sort(sortTemplates));
      setSavedTemplates((current) => ({ ...current, [template.id]: cloneTemplate(template) }));
      setNotice(`${template.label} is saved and ready.`);
    } catch (error) {
      setAdminError(error?.code === 'permission-denied'
        ? 'Firebase blocked this save. Publish the latest Firestore rules and confirm this UID is in admins.'
        : error?.message || 'This template could not be saved.');
    } finally {
      setSavingId('');
    }
  };

  const deleteTemplate = async (template) => {
    if (!template || !window.confirm(`Delete “${template.label}”? This removes it from the template picker.`)) return;
    setSavingId(template.id);
    setNotice('');
    try {
      const { deleteDoc, doc, getFirestore } = await import('firebase/firestore');
      await deleteDoc(doc(getFirestore(adminApp), 'templates', template.id));
      const remaining = templates.filter((item) => item.id !== template.id);
      setTemplates(remaining);
      setSavedTemplates((current) => {
        const next = { ...current };
        delete next[template.id];
        return next;
      });
      setEditingId(remaining[0]?.id || '');
      setNotice(`${template.label} was deleted.`);
    } catch (error) {
      setAdminError(error?.code === 'permission-denied' ? 'Firebase blocked this delete.' : error?.message || 'This template could not be deleted.');
    } finally {
      setSavingId('');
    }
  };

  const seedTemplates = async () => {
    if (!window.confirm('Install the eight personalized starter templates? Existing templates with the same IDs will be updated.')) return;
    setSavingId('seed');
    setNotice('Installing personalized templates…');
    setAdminError('');
    try {
      const { doc, getFirestore, setDoc } = await import('firebase/firestore');
      const db = getFirestore(adminApp);
      await Promise.all(templateSeed.map((template) => setDoc(doc(db, 'templates', template.id), cleanForFirestore(template), { merge: true })));
      const installed = templateSeed.map((template) => normalizeTemplateDoc(template.id, template));
      const installedIds = new Set(installed.map((template) => template.id));
      const next = [...installed, ...templates.filter((template) => !installedIds.has(template.id))].sort(sortTemplates);
      setTemplates(next);
      setSavedTemplates((current) => ({ ...current, ...Object.fromEntries(installed.map((template) => [template.id, cloneTemplate(template)])) }));
      setEditingId(next[0]?.id || '');
      setNotice('Eight personalized templates are installed.');
    } catch (error) {
      setAdminError(error?.code === 'permission-denied' ? 'Firebase blocked the install. Publish the latest Firestore rules first.' : error?.message || 'Templates could not be installed.');
      setNotice('');
    } finally {
      setSavingId('');
    }
  };

  const updateSelected = (field, value) => {
    if (!selectedTemplate || field === 'id') return;
    setTemplates((current) => current.map((item) => (item.id === selectedTemplate.id ? { ...item, [field]: value } : item)));
  };

  const updateContent = (field, value) => {
    if (!selectedTemplate) return;
    setTemplates((current) => current.map((item) => (item.id === selectedTemplate.id ? { ...item, content: { ...(item.content || {}), [field]: value } } : item)));
  };

  const updateTheme = (field, value) => {
    if (!selectedTemplate) return;
    setTemplates((current) => current.map((item) => (item.id === selectedTemplate.id ? { ...item, theme: { ...(item.theme || {}), [field]: value } } : item)));
  };

  const selectTemplate = (templateId) => {
    if (isDirty && !window.confirm('Discard the unsaved changes to this template?')) return;
    setEditingId(templateId);
    setNotice('');
  };

  const resetSelected = () => {
    if (!selectedTemplate) return;
    const saved = savedTemplates[selectedTemplate.id];
    if (!saved) {
      setTemplates((current) => current.filter((item) => item.id !== selectedTemplate.id));
      setEditingId(templates.find((item) => item.id !== selectedTemplate.id)?.id || '');
      return;
    }
    setTemplates((current) => current.map((item) => (item.id === selectedTemplate.id ? cloneTemplate(saved) : item)));
    setNotice('Unsaved changes were reset.');
  };

  const addTemplate = () => {
    if (isDirty && !window.confirm('Discard the current unsaved changes and create a new template?')) return;
    const draft = {
      id: `template-${createSecureId(8)}`,
      label: 'New occasion',
      chip: 'A special wish',
      icon: '✨',
      summary: 'Describe when people should choose this template.',
      theme: { accent: '#7c3aed', accentSoft: '#ec4899', background: 'violet' },
      fields: ['name', 'message', 'eventDate', 'from'],
      content: buildContentDraft({ label: 'New occasion', summary: 'A thoughtful wish made just for you.' }),
      personalizationVersion: 3,
      order: templates.length + 1,
      enabled: false,
    };
    setTemplates((current) => [draft, ...current]);
    setEditingId(draft.id);
    setNotice('New templates start hidden. Finish the copy, then switch it live.');
  };

  const logoutAdmin = async () => {
    const { getAuth, signOut } = await import('firebase/auth');
    await signOut(getAuth(adminApp));
    setAdminUser(null);
    setAuthStatus('signed-out');
    setTemplates([]);
    setSavedTemplates({});
  };

  useEffect(() => {
    const onResize = () => setShowPreview(window.innerWidth >= 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!isUnlocked) {
    return (
      <div className="page-shell admin-shell admin-login-shell">
        <header className="topbar">
          <Brand />
          <TextButton type="button" onClick={() => navigate('/')}>Back to website</TextButton>
        </header>
        <AdminGate onUnlock={unlockAdmin} error={adminError} busy={authStatus === 'checking'} />
      </div>
    );
  }

  return (
    <div className="page-shell admin-shell admin-dashboard">
      <header className="topbar admin-topbar">
        <Brand />
        <div className="topbar-actions admin-account-actions">
          <div className="admin-session"><ShieldCheck size={15} /><span><small>Secure admin</small>{adminUser?.email}</span></div>
          <TextButton type="button" onClick={() => navigate('/')}>View website</TextButton>
          <TextButton type="button" onClick={logoutAdmin}><LogOut size={15} /> Logout</TextButton>
        </div>
      </header>

      {/* Admin Feature Tabs */}
      <div className="admin-tab-nav">
        <button
          type="button"
          className={`admin-tab-btn ${adminTab === 'templates' ? 'active' : ''}`}
          onClick={() => setAdminTab('templates')}
        >
          🎨 Template Studio ({templates.length})
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${adminTab === 'wishes' ? 'active' : ''}`}
          onClick={() => { setAdminTab('wishes'); loadWishes(); }}
        >
          💌 Live Wishes & Moderation ({liveWishes.length || 'Browse'})
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${adminTab === 'overview' ? 'active' : ''}`}
          onClick={() => setAdminTab('overview')}
        >
          📊 System Overview
        </button>
      </div>

      {adminTab === 'wishes' && (
        <section className="admin-wishes-panel glass-card">
          <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>Live Wishes Moderation</h2>
              <p>Browse, inspect, and moderate cards created across the platform.</p>
            </div>
            <AppButton onClick={loadWishes} disabled={loadingWishes}>
              {loadingWishes ? 'Refreshing…' : 'Refresh list'}
            </AppButton>
          </div>

          <div className="admin-search-row" style={{ margin: '16px 0' }}>
            <input
              type="text"
              placeholder="Search wishes by recipient name or wish ID..."
              value={wishSearch}
              onChange={(e) => setWishSearch(e.target.value)}
              className="admin-search-input"
            />
          </div>

          {loadingWishes ? (
            <p>Loading active wishes from database...</p>
          ) : (
            <div className="admin-wishes-table-wrap">
              <table className="admin-wishes-table">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Template</th>
                    <th>Sender</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {liveWishes
                    .filter((w) => {
                      if (!wishSearch.trim()) return true;
                      const q = wishSearch.toLowerCase();
                      const name = (w.recipientData?.name || w.recipientData?.babyName || w.id || '').toLowerCase();
                      return name.includes(q) || (w.id || '').toLowerCase().includes(q);
                    })
                    .map((w) => {
                      const name = w.recipientData?.name || w.recipientData?.babyName || w.recipientData?.bride || 'Recipient';
                      const sender = w.recipientData?.from || 'Unknown';
                      return (
                        <tr key={w.id}>
                          <td><strong>{name}</strong></td>
                          <td><span className="chip" style={{ fontSize: '0.72rem' }}>{w.templateId || 'Wish'}</span></td>
                          <td>{sender}</td>
                          <td><small>{w.createdAt?.seconds ? new Date(w.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}</small></td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <a
                                href={`/wish/${w.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="action-btn action-secondary small"
                              >
                                View ↗
                              </a>
                              <button
                                type="button"
                                className="action-btn small"
                                style={{ background: '#fee2e2', color: '#b91c1c' }}
                                onClick={() => deleteWishAsAdmin(w.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {liveWishes.length === 0 && !loadingWishes && (
                <p style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No wishes found in database.</p>
              )}
            </div>
          )}
        </section>
      )}

      {adminTab === 'overview' && (
        <section className="admin-overview-panel glass-card">
          <SectionHeading
            eyebrow="System Overview"
            title="Boltwish Health & Analytics"
            description="Status of your database, templates, and active platform instances."
          />
          <div className="stats-grid" style={{ margin: '20px 0' }}>
            <div className="stat-card">
              <strong>{templates.length}</strong>
              <span>Active Templates</span>
            </div>
            <div className="stat-card">
              <strong>{liveWishes.length || 'Active'}</strong>
              <span>Live Wishes</span>
            </div>
            <div className="stat-card">
              <strong style={{ color: '#059669' }}>Online</strong>
              <span>Firestore Status</span>
            </div>
          </div>
          <div className="admin-status-box" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <p><strong>Admin Authenticated:</strong> {adminUser?.email}</p>
            <p><strong>Security Rules:</strong> Firestore Rules Active</p>
            <p><strong>Host Environment:</strong> Production Web Application</p>
          </div>
        </section>
      )}

      {adminTab === 'templates' && (
        <>
          <section className="admin-dashboard-hero">
            <div>
              <div className="eyebrow"><LayoutDashboard size={15} /> Boltwish control center</div>
              <h1>Template studio</h1>
              <p>Manage every occasion, refine the writing, and preview the exact experience before it goes live.</p>
            </div>
            <div className="admin-hero-actions">
              <AppButton variant="secondary" type="button" onClick={seedTemplates} disabled={Boolean(savingId)}>Install starter set</AppButton>
              <AppButton type="button" onClick={addTemplate}><Plus size={17} /> New template</AppButton>
            </div>
          </section>

          <section className="admin-stat-grid" aria-label="Template overview">
            <div className="admin-stat-card"><span><CheckCircle2 size={18} /> Live templates</span><strong>{enabledCount}</strong><small>Visible in the picker</small></div>
            <div className="admin-stat-card"><span><CircleOff size={18} /> Hidden drafts</span><strong>{hiddenCount}</strong><small>Safe to keep editing</small></div>
            <div className="admin-stat-card"><span><Sparkles size={18} /> Personal prompts</span><strong>{totalPrompts}</strong><small>Across {templates.length} occasions</small></div>
          </section>
          {adminError ? <div className="notice error admin-global-notice" role="alert">{adminError}</div> : null}
          {notice ? <div className="notice admin-global-notice" role="status">{notice}</div> : null}

          <main className={`admin-layout admin-dashboard-grid ${showPreview ? '' : 'preview-hidden'}`}>
        <Panel className="admin-list panel">
          <div className="section-head compact-head">
            <div><h2>Templates</h2><p>{filteredTemplates.length} shown</p></div>
            <button className="admin-icon-button" type="button" onClick={() => setShowPreview((value) => !value)} aria-label={showPreview ? 'Hide preview' : 'Show preview'}><Eye size={17} /></button>
          </div>
          <label className="admin-search"><Search size={17} /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search templates" /></label>
          <div className="admin-filter-tabs" role="group" aria-label="Filter templates">
            {['all', 'enabled', 'hidden'].map((filter) => <button key={filter} className={statusFilter === filter ? 'active' : ''} type="button" onClick={() => setStatusFilter(filter)}>{filter === 'all' ? 'All' : filter === 'enabled' ? 'Live' : 'Hidden'}</button>)}
          </div>
          <div className="admin-template-list">
            {filteredTemplates.map((template) => (
              <button key={template.id} type="button" className={`admin-template-row ${template.id === selectedTemplate?.id ? 'active' : ''}`} onClick={() => selectTemplate(template.id)}>
                <span className="admin-template-row-top"><strong><span className="admin-template-icon">{template.icon}</span>{template.label}</strong><span className={`admin-status-pill ${template.enabled === false ? 'hidden' : 'live'}`}>{template.enabled === false ? 'Hidden' : 'Live'}</span></span>
                <span className="admin-template-summary">{template.summary}</span>
                <span className="admin-template-meta">Order {template.order ?? 0} · {template.fields?.length || 0} prompts</span>
              </button>
            ))}
            {!filteredTemplates.length ? <div className="admin-empty-list"><Search size={22} /><strong>No templates found</strong><span>Try another search or filter.</span></div> : null}
          </div>
        </Panel>

        <Panel className="admin-editor panel">
          {selectedTemplate ? (
            <>
              <div className="admin-editor-head">
                <div>
                  <div className="admin-editor-title-line"><h2>{selectedTemplate.icon} {selectedTemplate.label}</h2>{isDirty ? <span className="admin-unsaved-badge">Unsaved</span> : <span className="admin-saved-badge">Saved</span>}</div>
                  <p>Template ID: <code>{selectedTemplate.id}</code></p>
                </div>
                <div className="admin-editor-actions">
                  <button className="admin-icon-button" type="button" onClick={resetSelected} disabled={!isDirty} title="Reset unsaved changes"><RotateCcw size={17} /></button>
                  <AppButton variant="secondary" type="button" className="admin-delete-button" onClick={() => deleteTemplate(selectedTemplate)} disabled={Boolean(savingId)}><Trash2 size={16} /> Delete</AppButton>
                  <AppButton type="button" onClick={() => saveTemplate(selectedTemplate)} disabled={!isDirty || Boolean(savingId)}><Save size={16} /> {savingId === selectedTemplate.id ? 'Saving…' : 'Save changes'}</AppButton>
                </div>
              </div>

              <section className="admin-form-section">
                <div className="admin-form-section-head"><span>1</span><div><h3>Picker details</h3><p>How this occasion appears before someone starts writing.</p></div></div>
                <div className="admin-form-grid">
                  <label className="field-group"><span>Card name</span><input value={selectedTemplate.label || ''} maxLength={80} onChange={(event) => updateSelected('label', event.target.value)} placeholder="Birthday" /></label>
                  <label className="field-group"><span>Badge text</span><input value={selectedTemplate.chip || ''} maxLength={80} onChange={(event) => updateSelected('chip', event.target.value)} placeholder="Birthday wish" /></label>
                  <label className="field-group"><span>Emoji</span><input value={selectedTemplate.icon || ''} maxLength={8} onChange={(event) => updateSelected('icon', event.target.value)} placeholder="🎂" /></label>
                  <label className="field-group"><span>Sort order</span><input type="number" min="0" value={selectedTemplate.order ?? 0} onChange={(event) => updateSelected('order', Number(event.target.value))} /></label>
                  <label className="field-group field-span-2"><span>Short description</span><textarea rows={3} maxLength={180} value={selectedTemplate.summary || ''} onChange={(event) => updateSelected('summary', event.target.value)} placeholder="Tell people when to choose this template." /></label>
                </div>
              </section>

              <section className="admin-form-section">
                <div className="admin-form-section-head"><span>2</span><div><h3>Wish writing</h3><p>The starting copy that personalization shapes for each recipient.</p></div></div>
                <div className="admin-form-grid">
                  <label className="field-group"><span>Headline</span><input value={selectedTemplate.content?.title || ''} maxLength={90} onChange={(event) => updateContent('title', event.target.value)} placeholder="A beautiful day for {{name}}" /></label>
                  <label className="field-group"><span>Subtitle</span><input value={selectedTemplate.content?.subtitle || ''} maxLength={140} onChange={(event) => updateContent('subtitle', event.target.value)} placeholder="A personal opening line" /></label>
                  <label className="field-group field-span-2"><span>Main message</span><textarea rows={8} maxLength={1800} value={selectedTemplate.content?.body || ''} onChange={(event) => updateContent('body', event.target.value)} placeholder="Write the main wish message here." /></label>
                  <label className="field-group field-span-2"><span>Highlight</span><textarea rows={2} maxLength={180} value={selectedTemplate.content?.highlight || ''} onChange={(event) => updateContent('highlight', event.target.value)} placeholder="A short line that deserves attention." /></label>
                  <label className="field-group"><span>Optional quote</span><textarea rows={3} maxLength={180} value={selectedTemplate.content?.quote || ''} onChange={(event) => updateContent('quote', event.target.value)} /></label>
                  <label className="field-group"><span>Closing line</span><textarea rows={3} maxLength={90} value={selectedTemplate.content?.footer || ''} onChange={(event) => updateContent('footer', event.target.value)} /></label>
                </div>
              </section>

              <section className="admin-form-section">
                <div className="admin-form-section-head"><span>3</span><div><h3>Style and publishing</h3><p>Control the look and decide when it is ready for users.</p></div></div>
                <div className="admin-form-grid admin-appearance-grid">
                  <label className="field-group"><span>Accent color</span><div className="admin-color-field"><input type="color" value={selectedTemplate.theme?.accent || '#7c3aed'} onChange={(event) => updateTheme('accent', event.target.value)} /><code>{selectedTemplate.theme?.accent || '#7c3aed'}</code></div></label>
                  <label className="field-group"><span>Soft accent</span><div className="admin-color-field"><input type="color" value={selectedTemplate.theme?.accentSoft || '#ec4899'} onChange={(event) => updateTheme('accentSoft', event.target.value)} /><code>{selectedTemplate.theme?.accentSoft || '#ec4899'}</code></div></label>
                  <label className="field-group"><span>Background style</span><input list="admin-backgrounds" value={selectedTemplate.theme?.background || ''} onChange={(event) => updateTheme('background', event.target.value)} placeholder="violet" /><datalist id="admin-backgrounds"><option value="sunrise" /><option value="blush" /><option value="rose" /><option value="violet" /><option value="sky" /><option value="peach" /><option value="mint" /><option value="teal" /></datalist></label>
                  <label className="admin-publish-toggle"><input type="checkbox" checked={selectedTemplate.enabled !== false} onChange={(event) => updateSelected('enabled', event.target.checked)} /><span><strong>{selectedTemplate.enabled === false ? 'Hidden draft' : 'Live in picker'}</strong><small>{selectedTemplate.enabled === false ? 'Only admins can work on it.' : 'People can choose this template now.'}</small></span></label>
                </div>
                <div className="admin-prompt-summary"><span>Personalization prompts</span><div>{(selectedTemplate.fields || []).map((field) => { const key = typeof field === 'string' ? field : field.key; const label = typeof field === 'string' ? field : field.label || field.key; return <span key={key}>{label}</span>; })}</div><small>Prompts stay occasion-specific so the final wish feels personal.</small></div>
              </section>
            </>
          ) : <div className="empty-state"><h3>No template selected</h3><p>Create or choose a template from the list.</p></div>}
        </Panel>

        {showPreview ? (
          <Panel className="admin-preview panel">
            <div className="section-head compact-head"><div><h2>Live preview</h2><p>Updates while you type</p></div><span className="admin-live-dot">Live</span></div>
            <ToneSelector value={previewTone} onChange={setPreviewTone} />
            {preview ? <div className="admin-preview-stage" style={{ '--wish-accent': selectedTemplate?.theme?.accent || '#7c3aed', '--wish-accent-soft': selectedTemplate?.theme?.accentSoft || '#ec4899' }}><WishExperience preview={preview} template={selectedTemplate} compact /></div> : <div className="empty-state"><p>No template selected.</p></div>}
          </Panel>
        ) : null}
      </main>
        </>
      )}
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
  const [tone, setTone] = useState('heartfelt');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!template) return;
    setRecipientData(buildRecipientDraft(template));
    setContentData(buildContentDraft(template));
    setTone('heartfelt');
  }, [template?.id]);

  const preview = useMemo(() => composeWishPreview(template, { recipientData, content: contentData, tone }), [template, recipientData, contentData, tone]);
  const canContinue = template ? template.fields.every((field) => field.required === false || String(recipientData[field.key] || '').trim().length > 0) : false;

  useSeoMeta({
    title: template ? `${template.label} template | Boltwish` : 'Boltwish',
    description: template?.summary || preview.subtitle || SITE_DESCRIPTION,
    canonicalPath: template ? `/template/${template.id}` : '/template-picker',
    robots: 'noindex,follow',
  });

  if (templatesState.loading) {
    return <div className="center-screen"><Panel className="fallback-panel"><h1>Loading templates...</h1><p>Waiting for templates to load.</p></Panel></div>;
  }

  if (!template) {
    return <div className="center-screen"><Panel className="fallback-panel"><h1>Choose a template first.</h1><p>That template could not be found.</p><AppButton onClick={() => navigate('/template-picker')}>Back to templates</AppButton></Panel></div>;
  }

  const updateRecipient = (field, value) => setRecipientData((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event) => {
    if (event?.preventDefault) event.preventDefault();
    if (!canContinue || saving) return;
    setSaving(true);
    const cleanedRecipientData = Object.fromEntries(template.fields.map((field) => [field.key, String(recipientData[field.key] || '').trim()]));
    const cleanedContent = Object.fromEntries(defaultContentOrder.map((field) => [field, String(contentData[field] || '').trim()]));

    writeJson('selectedTemplateId', template.id);
    writeJson('finalData', { templateId: template.id, templateSnapshot: template, recipientData: cleanedRecipientData, content: cleanedContent, tone, visibility: 'unlisted' });
    navigate('/save');
  };

  const fillSampleMessage = () => {
    const sample = defaultWishMessages[template.id] || 'Wishing you all the joy and happiness in the world!';
    updateRecipient('message', sample);
  };

  return (
    <PageShell
      kicker={`${template.label} celebration card`}
      title={`Make it personal for ${preview.displayName || 'them'}.`}
      description="Fill in the essential details below. The live preview updates in real time as you type."
      actions={<AppButton variant="secondary" onClick={() => navigate('/template-picker')}>Change template</AppButton>}
      aside={
        <MotionPanel className="side-panel preview-panel glass-sidebar">
          <div className="preview-rail-top">
            <div>
              <div className="eyebrow"><Eye size={14} /> Live preview</div>
              <h2>Updates in real time</h2>
            </div>
            <Sparkles size={18} className="rail-icon" />
          </div>
          <div className="preview-card premium-preview" style={{ '--wish-accent': template?.theme?.accent || '#8b5cf6', '--wish-accent-soft': template?.theme?.accentSoft || '#ec4899' }}>
            <WishExperience preview={preview} template={template} compact />
            {recipientData.eventDate && preview.countdown ? <CountdownBadge eventDate={recipientData.eventDate} /> : null}
          </div>
        </MotionPanel>
      }
    >
      <form id={formId} className="editor-layout wizard-layout" onSubmit={handleSubmit}>
        <section className="editor-card glass-card wizard-card">
          <ToneSelector value={tone} onChange={setTone} />

          <SectionHeading
            eyebrow="Details"
            title="The essential details"
            description="Just who it is for, your personal message, and who it is from."
          />
          <div className="field-grid">
            {template.fields.map((field) => (
              <label key={field.key} className={`field-group floating-field ${field.type === 'textarea' ? 'field-wide' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span>{field.label}{field.required === false ? '' : ' *'}</span>
                  {field.key === 'message' && (
                    <button
                      type="button"
                      className="topbar-link"
                      style={{ fontSize: '0.75rem', padding: '2px 8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      onClick={fillSampleMessage}
                      title="Insert pre-written celebration wish"
                    >
                      ✨ Reset to sample wish
                    </button>
                  )}
                </div>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={4}
                    value={recipientData[field.key] || ''}
                    required={field.required}
                    maxLength={field.maxLength}
                    placeholder={field.placeholder}
                    onChange={(event) => updateRecipient(field.key, event.target.value)}
                  />
                ) : (
                  <input
                    type={field.type}
                    value={recipientData[field.key] || ''}
                    required={field.required}
                    min={field.key === 'eventDate' ? new Date().toISOString().slice(0, 10) : field.min}
                    max={field.max}
                    maxLength={field.maxLength}
                    placeholder={field.placeholder}
                    onChange={(event) => updateRecipient(field.key, event.target.value)}
                  />
                )}
                <small>{field.helpText || (field.maxLength ? `${String(recipientData[field.key] || '').length}/${field.maxLength}` : '')}</small>
              </label>
            ))}
          </div>

          <div className="share-settings" style={{ marginTop: '22px' }}>
            <div className="share-settings-head">
              <ShieldCheck size={18} />
              <div>
                <h3>Private unlisted link</h3>
                <p>Only people with the link can view this card. You can edit or delete it anytime from your device.</p>
              </div>
            </div>
          </div>

          <div className="wizard-actions actions-row form-actions" style={{ marginTop: '24px' }}>
            <AppButton variant="secondary" type="button" onClick={() => navigate('/template-picker')}>Back</AppButton>
            <AppButton type="submit" disabled={!canContinue || saving}>
              {saving ? 'Creating wish...' : 'Create & Get Link →'}
            </AppButton>
          </div>
        </section>
      </form>

      <div className="mobile-sticky-bar">
        <div>
          <strong>Ready to send?</strong>
          <span>Live preview updates as you type</span>
        </div>
        <div className="mobile-sticky-actions">
          <AppButton
            type="submit"
            form={formId}
            disabled={!canContinue || saving}
          >
            {saving ? 'Creating...' : 'Create Wish →'}
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

  useSeoMeta({
    title: 'Saving wish | Boltwish',
    description: 'Saving your wish and preparing the shareable link.',
    canonicalPath: '/save',
    robots: 'noindex,nofollow',
  });

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
        const { doc, getFirestore, serverTimestamp, setDoc, Timestamp } = await import('firebase/firestore');
        const owner = await ensureWishOwner();
        const db = getFirestore(app);
        const template = finalData.templateSnapshot || resolveTemplate(templatesState.templates, finalData.templateId);
        const recipientData = finalData.recipientData || {};
        const baseName = recipientData.name || recipientData.babyName || recipientData.bride || recipientData.groom || recipientData.partnerOne || recipientData.parentName || 'user';
        const username = `${slugify(baseName)}-${createSecureId()}`;
        const { expiresAt, revealAt } = createWishSchedule(Timestamp, recipientData.eventDate);
        const payload = {
          templateId: finalData.templateId,
          templateSnapshot: cleanForFirestore(template),
          recipientData,
          content: finalData.content || {},
          tone: finalData.tone || 'heartfelt',
          visibility: 'unlisted',
          ownerUid: owner.uid,
          expiresAt,
          revealAt,
          username,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

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
          const recipientName = recipientData.name || recipientData.babyName || recipientData.bride || recipientData.groom || recipientData.partnerOne || recipientData.parentName || '';
          const entry = { url, manageUrl: `${window.location.origin}/manage/${username}`, metadata: { ...metadata, recipientName }, createdAt: Date.now() };
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
        <div className="progress-card"><div className="progress-label"><span>Your card link is ready!</span><span>🎉 100%</span></div><div className="progress-bar"><div className="progress-fill" /></div></div>
        <div className={`loader ${saving ? '' : 'loader-done'}`} aria-hidden="true" />
        <h1 className="save-status">{status}</h1>
        {preview ? <div className="save-preview"><div className="chip">{preview.chip}</div><strong>{preview.title}</strong><p>{preview.subtitle}</p><WishMetaLines metaLines={preview.metaLines} className="wish-card-meta-inline" /></div> : null}
        <div className="actions-column save-actions">
          <AppButton onClick={openWish} disabled={!savedLink}>Open Your Wish</AppButton>
          <AppButton variant="secondary" onClick={() => setShareOpen(true)} disabled={!savedLink}>Share Your Wish</AppButton>
          <AppButton variant="secondary" onClick={() => savedLink && navigate(`/manage/${savedLink.split('/').pop()}`)} disabled={!savedLink}>Manage or edit</AppButton>
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

function ManageWishPage({ templatesState }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying ownership…');
  const [wishData, setWishData] = useState(null);
  const [recipientData, setRecipientData] = useState({});
  const [tone, setTone] = useState('heartfelt');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  useSeoMeta({
    title: 'Manage wish | Boltwish',
    description: 'Private creator controls for a Boltwish wish.',
    canonicalPath: `/manage/${username || ''}`,
    robots: 'noindex,nofollow',
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!username) {
        setStatus('Invalid management link.');
        return;
      }
      try {
        const owner = await ensureWishOwner();
        const { doc, getDoc, getFirestore } = await import('firebase/firestore');
        const snapshot = await getDoc(doc(getFirestore(app), 'wishes', username));
        if (!snapshot.exists()) {
          if (active) setStatus('This wish is unavailable or has expired.');
          return;
        }
        const wish = normalizeWishDocument(snapshot.data());
        if (wish.ownerUid !== owner.uid) {
          if (active) setStatus('This wish belongs to a different browser or device.');
          return;
        }
        if (active) {
          setWishData(wish);
          setRecipientData({
            ...(wish.recipientData || {}),
            eventDate: wish.recipientData?.eventDate || valueToDateInput(wish.revealAt),
          });
          setTone(wish.tone || 'heartfelt');
          setStatus('');
        }
      } catch (error) {
        if (active) setStatus(error?.code === 'auth/operation-not-allowed' ? 'Anonymous creator access must be enabled in Firebase Authentication.' : 'Could not verify this wish owner.');
      }
    };
    load();
    return () => { active = false; };
  }, [username]);

  const template = useMemo(() => {
    if (!wishData) return null;
    if (wishData.templateSnapshot) return normalizeTemplateDoc(wishData.templateId, prepareTemplateDocument(wishData.templateId, wishData.templateSnapshot));
    return resolveTemplate(templatesState.templates, wishData.templateId);
  }, [templatesState.templates, wishData]);

  const preview = useMemo(() => composeWishPreview(template || {}, { ...(wishData || {}), recipientData, tone }), [template, wishData, recipientData, tone]);

  const saveChanges = async (event) => {
    event.preventDefault();
    if (!wishData || !template || !username) return;
    setSaving(true);
    setNotice('');
    try {
      const { doc, getFirestore, serverTimestamp, Timestamp, updateDoc } = await import('firebase/firestore');
      const cleanedRecipientData = Object.fromEntries(template.fields.map((field) => [field.key, String(recipientData[field.key] || '').trim()]));
      const { expiresAt, revealAt } = createWishSchedule(Timestamp, cleanedRecipientData.eventDate);
      await updateDoc(doc(getFirestore(app), 'wishes', username), {
        recipientData: cleanedRecipientData,
        tone,
        expiresAt,
        revealAt,
        updatedAt: serverTimestamp(),
      });
      setWishData((current) => ({ ...current, recipientData: cleanedRecipientData, tone, expiresAt, revealAt }));
      setRecipientData(cleanedRecipientData);
      setNotice('Changes saved. The shared link now shows the updated wish.');
    } catch (error) {
      setNotice(error?.message || 'Could not save these changes.');
    } finally {
      setSaving(false);
    }
  };

  const deleteWish = async () => {
    if (!username || !window.confirm('Delete this wish permanently? The shared link will stop working.')) return;
    try {
      const { deleteDoc, doc, getFirestore } = await import('firebase/firestore');
      await deleteDoc(doc(getFirestore(app), 'wishes', username));
      const remaining = readJson('recentWishes', []).filter((item) => !item.url.endsWith(`/wish/${username}`));
      writeJson('recentWishes', remaining);
      navigate('/', { replace: true });
    } catch (error) {
      setNotice(error?.message || 'Could not delete this wish.');
    }
  };

  if (status || !wishData || !template) {
    return <div className="center-screen"><Panel className="fallback-panel"><div className="eyebrow">Creator controls</div><h1>{status || 'Loading wish…'}</h1><p>Wish management is available only in the browser that created it.</p><AppButton variant="secondary" onClick={() => navigate('/')}>Back home</AppButton></Panel></div>;
  }

  return (
    <PageShell
      kicker="Private creator controls"
      title={`Manage ${preview.displayName}’s wish.`}
      description="Update the personal details, change the writing style, or remove the wish. The event date controls when the link opens and expires."
      actions={
        <div style={{ display: 'flex', gap: '8px' }}>
          <AppButton variant="secondary" onClick={() => setGiftTagOpen(true)}>Print Gift Tag 🎁</AppButton>
          <AppButton variant="secondary" onClick={() => navigate(`/wish/${username}`)}>View shared wish</AppButton>
        </div>
      }
      aside={<MotionPanel className="side-panel preview-panel glass-sidebar"><div className="eyebrow"><Eye size={14} /> Live preview</div><div className="preview-card premium-preview" style={{ '--wish-accent': template.theme?.accent, '--wish-accent-soft': template.theme?.accentSoft }}><WishExperience preview={preview} template={template} compact /></div></MotionPanel>}
    >
      <form className="editor-card glass-card wizard-card manage-wish-form" onSubmit={saveChanges}>
        <ToneSelector value={tone} onChange={setTone} />
        <div className="field-grid">
          {template.fields.map((field) => (
            <label key={field.key} className={`field-group floating-field ${field.type === 'textarea' ? 'field-wide' : ''}`}>
              <span>{field.label}{field.required === false ? '' : ' *'}</span>
              {field.type === 'textarea'
                ? <textarea value={recipientData[field.key] || ''} required={field.required} maxLength={field.maxLength} placeholder={field.placeholder} onChange={(event) => setRecipientData((current) => ({ ...current, [field.key]: event.target.value }))} />
                : <input type={field.type} value={recipientData[field.key] || ''} required={field.required} min={field.key === 'eventDate' ? undefined : field.min} max={field.max} maxLength={field.maxLength} placeholder={field.placeholder} onChange={(event) => setRecipientData((current) => ({ ...current, [field.key]: event.target.value }))} />}
            </label>
          ))}
        </div>
        <div className="share-settings">
          <div className="share-settings-head"><ShieldCheck size={18} /><div><h3>Automatic seven-day access</h3><p>The shared link opens on the event date above and closes exactly seven days later.</p></div></div>
        </div>
        {notice ? <div className={`notice ${notice.includes('Could not') ? 'error' : ''}`} role="status">{notice}</div> : null}
        <div className="manage-actions"><AppButton type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</AppButton><AppButton variant="secondary" type="button" onClick={deleteWish}>Delete wish</AppButton></div>
      </form>
    </PageShell>
  );
}

function WishViewPage({ templatesState }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Loading your wish...');
  const [wishData, setWishData] = useState(null);
  const [viewerUid, setViewerUid] = useState('');

  useEffect(() => {
    let unsubscribe = () => {};
    import('firebase/auth').then(({ getAuth, onAuthStateChanged }) => {
      unsubscribe = onAuthStateChanged(getAuth(app), (user) => setViewerUid(user?.uid || ''));
    });
    return () => unsubscribe();
  }, []);

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
  const remainingMs = useCountdownRemaining(wishData?.revealAt || wishData?.recipientData?.eventDate);

  const wishUrl = `${SITE_URL}/wish/${wishData?.username || username}`;
  const imageUrl = wishData?.username
    ? `${SITE_URL}/api/og/wish/${wishData.username}?title=${encodeURIComponent(preview.title)}&subtitle=${encodeURIComponent(preview.subtitle)}&chip=${encodeURIComponent(preview.chip)}`
    : DEFAULT_OG_IMAGE;

  useSeoMeta({
    title: `${preview.title} — ${preview.displayName || template?.label || 'Wish'}`,
    description: preview.subtitle || template?.summary || 'A personalised wish',
    canonicalPath: `/wish/${wishData?.username || username || ''}`,
    image: imageUrl,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `${preview.title} — ${preview.displayName || template?.label || 'Wish'}`,
      description: preview.subtitle || template?.summary || '',
      url: wishUrl,
      image: imageUrl,
      mainEntity: {
        '@type': 'CreativeWork',
        headline: preview.title,
        author: { '@type': 'Person', name: preview.displayName || '' },
      },
    },
    jsonLdId: 'wish-json-ld',
  });

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
          <WishExperience preview={preview} template={template}>
            <div className="wish-actions-row wish-experience-actions">
              <AppButton variant="secondary" onClick={() => window.print()}>Print keepsake</AppButton>
              <AppButton variant="secondary" onClick={copyLink}>Copy link</AppButton>
              {viewerUid && viewerUid === wishData.ownerUid ? <AppButton variant="secondary" onClick={() => navigate(`/manage/${username}`)}>Manage wish</AppButton> : null}
            </div>
          </WishExperience>
          <button className="wish-create-own" type="button" onClick={() => window.location.assign('/template-picker')}>Create your own wish <ArrowRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}

export default App;
