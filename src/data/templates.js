/**
 * Templates utility module
 * - Provides normalized template documents and helpers for building drafts/previews
 */

export const fieldLabels = {
  name: "Recipient's Name",
  age: 'Age',
  eventDate: 'Event Date',
  years: 'Years Together',
  message: 'Message',
  from: 'Your Name',
  achievement: 'Achievement',
  babyName: 'Baby Name',
  parentName: 'Parent(s) Name',
  bride: 'Bride Name',
  groom: 'Groom Name',
  to: "Recipient",
};

export const fieldMeta = {
  name: { type: 'text', placeholder: 'e.g., John Smith', maxLength: 50, required: true },
  age: { type: 'number', placeholder: 'Enter a number (e.g. 30)', min: 0, max: 150, required: true },
  eventDate: { type: 'date', required: true },
  years: { type: 'number', placeholder: 'Enter a number (e.g. 5)', min: 0, max: 100, required: true },
  message: { type: 'textarea', placeholder: 'Write a short personal message', maxLength: 300, required: true },
  from: { type: 'text', placeholder: 'e.g., Alex', maxLength: 50, required: true },
  achievement: { type: 'text', placeholder: 'e.g., New job, Graduation', maxLength: 80, required: true },
  babyName: { type: 'text', placeholder: 'e.g., Baby Liam', maxLength: 50, required: true },
  parentName: { type: 'text', placeholder: 'e.g., Sarah & Tom', maxLength: 50, required: true },
  bride: { type: 'text', placeholder: 'e.g., Jane', maxLength: 50, required: true },
  groom: { type: 'text', placeholder: 'e.g., Sam', maxLength: 50, required: true },
  to: { type: 'text', placeholder: "e.g., John Smith", maxLength: 50, required: false },
};

export const contentFieldMeta = {
  title: { label: 'Wish title', placeholder: 'Write a strong opening line', maxLength: 90 },
  subtitle: { label: 'Subtitle', placeholder: 'A short supporting line', maxLength: 140 },
  body: { label: 'Main message', placeholder: 'Write the main wish content', maxLength: 1800 },
  highlight: { label: 'Highlight', placeholder: 'A short highlight or punch line', maxLength: 180 },
  quote: { label: 'Quote', placeholder: 'Optional closing quote', maxLength: 180 },
  footer: { label: 'Signature line', placeholder: 'How should the wish sign off?', maxLength: 90 },
};

export const defaultContentOrder = ['title', 'subtitle', 'body', 'highlight', 'quote', 'footer'];

/**
 * Parse a field entry (string or object) into a normalized field descriptor.
 * @param {string|object} entry
 * @returns {object|null}
 */
export function parseField(entry) {
  if (!entry) return null;

  if (typeof entry === 'string') {
    const key = entry;
    const meta = fieldMeta[key] || {};
    return {
      key,
      label: fieldLabels[key] || key,
      type: meta.type || 'text',
      placeholder: meta.placeholder || '',
      required: meta.required !== false,
      maxLength: meta.maxLength,
      min: meta.min,
      max: meta.max,
      helpText: '',
    };
  }

  if (typeof entry === 'object') {
    const key = entry.key || entry.name || entry.id;
    if (!key) return null;
    const meta = fieldMeta[key] || {};
    return {
      key,
      label: entry.label || fieldLabels[key] || key,
      type: entry.type || meta.type || 'text',
      placeholder: entry.placeholder || meta.placeholder || '',
      required: entry.required !== false,
      maxLength: entry.maxLength ?? meta.maxLength,
      min: entry.min ?? meta.min,
      max: entry.max ?? meta.max,
      helpText: entry.helpText || entry.helperText || '',
    };
  }

  return null;
}

/**
 * Build default content values for a template.
 * @param {object} template
 */
export function getContentFieldDefaults(template = {}) {
  const label = template.label || 'Wish';
  const lowerLabel = label.toLowerCase();
  const summary = template.summary || `A thoughtful note made for your ${lowerLabel} card.`;

  return {
    title: `${label} wish`,
    subtitle: summary,
    body: `${summary}\n\nWishing you a day filled with joy, warmth, and memorable moments.`,
    highlight: 'A special message made just for you.',
    quote: 'Celebrate the moment and keep shining.',
    footer: 'With warm wishes',
  };
}

/**
 * Format a local YYYY-MM-DD value for date inputs.
 */
export function getTodayDateValue(referenceDate = new Date()) {
  const offsetMinutes = referenceDate.getTimezoneOffset();
  const localDate = new Date(referenceDate.getTime() - offsetMinutes * 60000);
  return localDate.toISOString().slice(0, 10);
}

/**
 * Replace {{placeholders}} in template copy with values from the provided context.
 * @param {string} text
 * @param {object} context
 */
export function resolveTemplateText(text, context = {}) {
  return String(text || '').replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const value = context[key];
    return value == null ? '' : String(value);
  });
}

/**
 * Compute a human-friendly countdown label for a date string.
 * @param {string} eventDate
 */
export function getCountdownInfo(eventDate) {
  if (!eventDate) return null;

  const target = new Date(`${eventDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diffDays === 0) return { days: 0, label: 'Reveals today', isToday: true, isPast: false };
  if (diffDays > 0) {
    return {
      days: diffDays,
      label: `Reveals in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
      isToday: false,
      isPast: false,
    };
  }

  const pastDays = Math.abs(diffDays);
  return {
    days: diffDays,
    label: pastDays === 1 ? 'Revealed yesterday' : `Revealed ${pastDays} days ago`,
    isToday: false,
    isPast: true,
  };
}

/**
 * Normalize a template document stored in the DB into a predictable shape used by the app.
 * @param {string} docId
 * @param {object} data
 */
export function normalizeTemplateDoc(docId, data = {}) {
  const fieldsSource = data.fields || data.recipientFields || data.formFields || [];
  const fields = (Array.isArray(fieldsSource) ? fieldsSource : []).map(parseField).filter(Boolean);
  if (!fields.some((field) => field.key === 'eventDate')) {
    fields.push(parseField('eventDate'));
  }

  const contentSource = data.content || data.defaults || data.copy || {};
  const fallback = getContentFieldDefaults({ label: data.label || docId, summary: data.summary || '' });

  const content = defaultContentOrder.reduce((acc, key) => {
    const value = contentSource[key];
    acc[key] = typeof value === 'string' ? value : (value ?? fallback[key]);
    return acc;
  }, {});

  const theme = {
    accent: data.theme?.accent || data.accent || '#e85d04',
    accentSoft: data.theme?.accentSoft || data.accentSoft || '#fb8500',
    background: data.theme?.background || data.background || 'sunrise',
  };

  return {
    id: docId,
    label: data.label || docId,
    chip: data.chip || data.label || docId,
    icon: data.icon || '✨',
    summary: data.summary || '',
    theme,
    fields,
    content,
    order: data.order ?? 0,
    enabled: data.enabled !== false,
  };
}

/**
 * Build an empty recipient draft from a template's fields.
 * @param {object} template
 */
export function buildRecipientDraft(template = {}) {
  const draft = {};
  (template.fields || []).forEach((f) => {
    draft[f.key] = '';
  });

  if (!Object.prototype.hasOwnProperty.call(draft, 'eventDate')) {
    draft.eventDate = '';
  }

  return draft;
}

/**
 * Build an editable content draft for a template.
 * @param {object} template
 */
export function buildContentDraft(template) {
  return { ...getContentFieldDefaults(template) };
}

/**
 * Split text into paragraphs (blocks separated by one or more blank lines).
 * @param {string} text
 */
export function splitParagraphs(text) {
  return String(text || '')
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Create a preview object used by the UI from a template + wish data.
 * @param {object} template
 * @param {object} wishData
 */
export function composeWishPreview(template, wishData = {}) {
  const safeTemplate = template || {};
  const recipientData = wishData.recipientData || {};
  const content = { ...getContentFieldDefaults(safeTemplate), ...(wishData.content || {}) };
  const contentContext = { ...recipientData, ...content };
  const displayName = recipientData.name || recipientData.babyName || recipientData.parentName || recipientData.bride || recipientData.groom || 'there';
  const countdown = getCountdownInfo(recipientData.eventDate);

  const resolved = {
    chip: safeTemplate.chip || 'Special Wish',
    title: resolveTemplateText(content.title || `${safeTemplate.label || 'Wish'} wish`, contentContext),
    subtitle: resolveTemplateText(content.subtitle || safeTemplate.summary || '', contentContext),
    body: splitParagraphs(resolveTemplateText(content.body, contentContext)),
    highlight: resolveTemplateText(content.highlight || '', contentContext),
    quote: resolveTemplateText(content.quote || '', contentContext),
    footer: resolveTemplateText(content.footer || '', contentContext),
    displayName,
  };

  // Additional optional lines for final/print preview: show sender and explicit "To:" line
  resolved.fromLine = recipientData.from ? `From: ${recipientData.from}` : '';
  resolved.toLine = `To: ${displayName}`;
  resolved.metaLines = [];

  if (recipientData.age !== undefined && String(recipientData.age).trim() !== '') {
    resolved.metaLines.push({ label: 'Age', value: String(recipientData.age) });
  }

  resolved.countdown = countdown;

  if (!resolved.body.length && safeTemplate.summary) resolved.body = [safeTemplate.summary];

  return resolved;
}

/**
 * Friendly share message for social or copy-paste sharing.
 */
export function buildShareMessage(template, wishData, url) {
  const preview = composeWishPreview(template, wishData);
  const recipientData = wishData?.recipientData || {};
  const displayName = preview.displayName || 'there';
  const sender = recipientData.from || 'Someone';
  const title = preview.title || template?.label || 'Wish';
  const body = preview.subtitle || template?.summary || 'Open the wish to see it.';

  return `${sender} created a ${title} for ${displayName} - ${body}. Open it here: ${url}`;
}

export function normalizeWishDocument(data = {}) {
  return {
    templateId: data.templateId || data.template || '',
    recipientData: data.recipientData || {},
    content: data.content || {},
    templateSnapshot: data.templateSnapshot || null,
    username: data.username || '',
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
  };
}
