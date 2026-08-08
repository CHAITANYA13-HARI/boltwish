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
  partnerOne: 'First Partner',
  partnerTwo: 'Second Partner',
  relationship: 'Your Relationship',
  favoriteMemory: 'Favorite Memory',
  quality: 'What Makes Them Special',
  futureWish: 'Your Wish for Their Future',
  effort: 'What It Took',
  specialWish: 'A Special Wish',
  friendshipYears: 'Years of Friendship',
  reason: 'What You Are Thanking Them For',
  impact: 'The Difference It Made',
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
  partnerOne: { type: 'text', placeholder: 'e.g., Aisha', maxLength: 50, required: true },
  partnerTwo: { type: 'text', placeholder: 'e.g., Rohan', maxLength: 50, required: true },
  relationship: { type: 'text', placeholder: 'e.g., Best friend, sister, colleague', maxLength: 80, required: true },
  favoriteMemory: { type: 'textarea', placeholder: 'Share one specific moment you remember', maxLength: 220, required: true },
  quality: { type: 'textarea', placeholder: 'Describe what makes this person special', maxLength: 180, required: true },
  futureWish: { type: 'textarea', placeholder: 'What do you hope comes next for them?', maxLength: 180, required: true },
  effort: { type: 'textarea', placeholder: 'What work, courage, or persistence did this take?', maxLength: 220, required: true },
  specialWish: { type: 'textarea', placeholder: 'Write a wish that feels personal to this family', maxLength: 200, required: true },
  friendshipYears: { type: 'number', placeholder: 'e.g., 8', min: 0, max: 100, required: false },
  reason: { type: 'textarea', placeholder: 'Name the specific kindness, help, or support', maxLength: 220, required: true },
  impact: { type: 'textarea', placeholder: 'Explain why it mattered to you', maxLength: 220, required: true },
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

export const wishTones = [
  { id: 'heartfelt', label: 'Heartfelt', description: 'Warm, emotional, and personal', emoji: '💛' },
  { id: 'playful', label: 'Playful', description: 'Light, cheerful, and energetic', emoji: '🎉' },
  { id: 'elegant', label: 'Elegant', description: 'Polished, graceful, and timeless', emoji: '✨' },
  { id: 'concise', label: 'Short & sweet', description: 'Personal without being lengthy', emoji: '💌' },
];

const toneContentByTemplate = {
  birthday: {
    playful: {
      title: '{{name}}, It’s Party Time! 🎂',
      subtitle: 'Today’s agenda: celebrate you properly and make some excellent memories.',
      body: 'Dear {{name}},\n\n{{ageCelebration}}\n\nYou deserve a huge celebration because {{quality}}.\n\nI still laugh when I remember {{favoriteMemory}}. That one belongs in the friendship hall of fame.\n\n{{message}}',
      highlight: 'More cake, more laughter, and absolutely no acting your age today.',
      footer: 'Big birthday energy from',
    },
    elegant: {
      title: 'Celebrating You, {{name}}',
      subtitle: 'A birthday is a beautiful moment to honor the life you have lived and the joy you bring.',
      body: 'Dear {{name}},\n\n{{ageCelebration}}\n\nYour {{quality}} has touched more lives than you may realize.\n\nI remain especially grateful for {{favoriteMemory}}, a memory I will always hold close.\n\n{{message}}',
      highlight: 'May the year ahead be rich with purpose, happiness, and moments worthy of remembering.',
      footer: 'With warmest birthday wishes',
    },
    concise: {
      title: 'Happy Birthday, {{name}}! 🎂',
      subtitle: '{{ageCelebration}}',
      body: 'What makes you special is {{quality}}.\n\nI will always smile about {{favoriteMemory}}.\n\n{{message}}',
      highlight: 'Have the wonderful birthday you deserve.',
      footer: 'With love',
    },
  },
  anniversary: {
    playful: {
      title: '{{coupleName}}, Still an Amazing Team! 🥂',
      subtitle: '{{yearsCelebration}} You are still proving that love and laughter make the best partnership.',
      body: 'Here’s to {{partnerOne}} and {{partnerTwo}}—two people who make together look very good.\n\nI still love remembering {{favoriteMemory}}. It captures your partnership perfectly.\n\n{{message}}',
      highlight: 'Keep choosing each other, laughing loudly, and winning at life as a team.',
      footer: 'Cheers to you both',
    },
    elegant: {
      title: 'In Celebration of {{coupleName}}',
      subtitle: '{{yearsCelebration}} your life together continues to be a beautiful testament to love.',
      body: '{{partnerOne}} and {{partnerTwo}}, the grace and devotion within your partnership are deeply admired.\n\nI will always remember {{favoriteMemory}}, a moment that reflects the strength of your bond.\n\n{{message}}',
      highlight: 'May every year deepen the trust, tenderness, and joy you have created together.',
      footer: 'With warm anniversary wishes',
    },
    concise: {
      title: 'Happy Anniversary, {{coupleName}}!',
      subtitle: '{{yearsCelebration}} and still creating a beautiful story.',
      body: 'I will always remember {{favoriteMemory}}.\n\n{{message}}',
      highlight: 'Here’s to many more happy chapters together.',
      footer: 'Celebrating you both',
    },
  },
  love: {
    playful: {
      title: '{{name}}, You’re My Favorite ❤️',
      subtitle: 'A very official reminder that life is significantly better with you in it.',
      body: 'I love {{quality}}—and yes, I notice it every time.\n\nI would happily relive {{favoriteMemory}} on repeat.\n\nNext on our list: {{futureWish}}.\n\n{{message}}',
      highlight: 'Still choosing you. Still smiling about it.',
      footer: 'All my love',
    },
    elegant: {
      title: 'For {{name}}, With All My Love',
      subtitle: 'The deepest affection is often found in the details we quietly treasure.',
      body: '{{name}}, I cherish {{quality}}.\n\nThe memory of {{favoriteMemory}} remains especially dear to me.\n\nI look forward to {{futureWish}}, and to every chapter we have yet to write.\n\n{{message}}',
      highlight: 'You are both my comfort and my favorite adventure.',
      footer: 'Yours, always',
    },
    concise: {
      title: 'For You, {{name}} ❤️',
      subtitle: 'A little reminder of how much you mean to me.',
      body: 'I love {{quality}}.\n\nI treasure {{favoriteMemory}}, and I cannot wait for {{futureWish}}.\n\n{{message}}',
      highlight: 'You make my world better.',
      footer: 'With all my heart',
    },
  },
  congrats: {
    playful: {
      title: '{{name}}, You Absolutely Crushed It! 🎉',
      subtitle: '{{achievement}}: completed. Celebration mode: activated.',
      body: 'This win came from {{effort}}, and now you get to enjoy every bit of it.\n\nNext stop: {{futureWish}}. I cannot wait to see what you do next.\n\n{{message}}',
      highlight: 'Be proud, celebrate loudly, and take the victory lap.',
      footer: 'Cheering for you',
    },
    elegant: {
      title: 'Congratulations, {{name}}',
      subtitle: 'Your achievement—{{achievement}}—is worthy of genuine admiration.',
      body: 'This distinction reflects {{effort}}. Your commitment has led to a truly deserved result.\n\nMay this accomplishment open the way to {{futureWish}}.\n\n{{message}}',
      highlight: 'May this milestone be the beginning of an even more remarkable chapter.',
      footer: 'With sincere congratulations',
    },
    concise: {
      title: 'You Did It, {{name}}! 🎉',
      subtitle: 'Congratulations on {{achievement}}.',
      body: 'Your {{effort}} made this possible.\n\nWishing you {{futureWish}}.\n\n{{message}}',
      highlight: 'This moment is yours—enjoy it.',
      footer: 'So proud of you',
    },
  },
  newbaby: {
    playful: {
      title: 'Hello, {{babyName}}! 👶',
      subtitle: 'Tiny human, enormous personality loading—and a whole family already in love.',
      body: 'Dear {{parentName}}, your sweetest new adventure has officially begun. As {{relationship}}, I am thrilled for all of you.\n\n{{babyName}}, may your life bring {{specialWish}}.\n\n{{message}}',
      highlight: 'Welcome to the cuddles, giggles, and wonderfully sleepy days.',
      footer: 'Sending love and happy wishes',
    },
    elegant: {
      title: 'Welcome, Dear {{babyName}}',
      subtitle: 'A precious new life, received with immeasurable love.',
      body: 'Dear {{parentName}}, it is a privilege to celebrate this beautiful addition to your family. As {{relationship}}, I share deeply in your joy.\n\nMay {{babyName}} be blessed with {{specialWish}}.\n\n{{message}}',
      highlight: 'May your home be filled with tenderness, wonder, and lasting happiness.',
      footer: 'With warmest wishes to your family',
    },
    concise: {
      title: 'Welcome, {{babyName}}! 👶',
      subtitle: 'So tiny, so loved, and already so special.',
      body: 'Congratulations, {{parentName}}.\n\nMy wish for {{babyName}} is {{specialWish}}.\n\n{{message}}',
      highlight: 'Sending love to your beautiful growing family.',
      footer: 'With love',
    },
  },
  wedding: {
    playful: {
      title: '{{coupleName}} Made It Official! 💒',
      subtitle: 'Two favorite people, one excellent decision, and a lifetime of adventures ahead.',
      body: 'Knowing you as {{relationship}}, seeing this day feels extra special.\n\nI will always remember {{favoriteMemory}}—proof that the two of you are at your best together.\n\nHere’s to {{futureWish}}.',
      highlight: 'Love each other, laugh often, and always share the last piece of cake.',
      footer: 'Celebrating you both',
    },
    elegant: {
      title: 'With Love to {{coupleName}}',
      subtitle: 'May this day mark the beginning of a marriage filled with grace, devotion, and joy.',
      body: 'Our connection as {{relationship}} makes it especially meaningful to witness this new chapter.\n\nI will always treasure {{favoriteMemory}}, a moment that reflects the beauty of your partnership.\n\nMay your marriage bring {{futureWish}}.',
      highlight: 'May you build a life that is both a sanctuary and an adventure.',
      footer: 'With warmest wishes for your marriage',
    },
    concise: {
      title: 'Congratulations, {{coupleName}}! 💒',
      subtitle: 'Wishing you a beautiful life together.',
      body: 'I will always remember {{favoriteMemory}}.\n\nMay your marriage bring {{futureWish}}.',
      highlight: 'Here’s to love, laughter, and a lifetime together.',
      footer: 'With love',
    },
  },
  friendship: {
    playful: {
      title: '{{name}}, Thanks for Being My Person 🤝',
      subtitle: '{{friendshipCelebration}} Somehow, the stories keep getting better.',
      body: 'Nothing summarizes us better than {{favoriteMemory}}.\n\nYou are a brilliant friend because {{quality}}. Thanks for every laugh, rescue mission, and questionable idea.\n\n{{message}}',
      highlight: 'Here’s to more adventures and even better inside jokes.',
      footer: 'Your partner in chaos',
    },
    elegant: {
      title: 'For My Dear Friend, {{name}}',
      subtitle: '{{friendshipCelebration}} Your friendship remains one of life’s finest gifts.',
      body: 'I often think fondly of {{favoriteMemory}}.\n\nYour {{quality}} has made your friendship a source of strength and happiness in my life.\n\n{{message}}',
      highlight: 'Thank you for the constancy, honesty, and joy of your friendship.',
      footer: 'With lasting friendship',
    },
    concise: {
      title: 'For You, {{name}} 🤝',
      subtitle: '{{friendshipCelebration}}',
      body: 'I will always smile about {{favoriteMemory}}.\n\nThank you for {{quality}}.\n\n{{message}}',
      highlight: 'Life is better with you as my friend.',
      footer: 'Your friend, always',
    },
  },
  thankyou: {
    playful: {
      title: '{{name}}, You’re the Best! 🙏',
      subtitle: 'A quick but very enthusiastic appreciation announcement.',
      body: 'Thank you for {{reason}}. Seriously—you made a huge difference.\n\nBecause of you, {{impact}}.\n\n{{message}}',
      highlight: 'Kindness level: unforgettable.',
      footer: 'A very grateful',
    },
    elegant: {
      title: 'With Gratitude to {{name}}',
      subtitle: 'Your generosity deserves to be acknowledged with sincerity.',
      body: 'Please accept my heartfelt thanks for {{reason}}.\n\nYour kindness had a lasting impact: {{impact}}. I remain deeply grateful.\n\n{{message}}',
      highlight: 'What you gave was not merely help, but genuine encouragement.',
      footer: 'With sincere appreciation',
    },
    concise: {
      title: 'Thank You, {{name}} 🙏',
      subtitle: 'I truly appreciate what you did.',
      body: 'Thank you for {{reason}}.\n\nIt mattered because {{impact}}.\n\n{{message}}',
      highlight: 'Your kindness made a real difference.',
      footer: 'With gratitude',
    },
  },
};

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

function formatOrdinal(value) {
  if (String(value ?? '').trim() === '') return '';
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return String(value || '');
  const lastTwo = number % 100;
  const suffix = lastTwo >= 11 && lastTwo <= 13
    ? 'th'
    : ({ 1: 'st', 2: 'nd', 3: 'rd' }[number % 10] || 'th');
  return `${number}${suffix}`;
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
    personalizationVersion: data.personalizationVersion ?? 0,
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

  return draft;
}

/**
 * Build an editable content draft for a template.
 * @param {object} template
 */
export function buildContentDraft(template) {
  return { ...getContentFieldDefaults(template), ...(template?.content || {}) };
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
  const tone = wishData.tone || 'heartfelt';
  const toneContent = toneContentByTemplate[safeTemplate.id]?.[tone] || {};
  const content = { ...getContentFieldDefaults(safeTemplate), ...(wishData.content || {}), ...toneContent };
  const previewRecipient = {
    ...recipientData,
    name: recipientData.name || 'someone special',
    babyName: recipientData.babyName || 'little one',
    parentName: recipientData.parentName || 'the proud family',
    bride: recipientData.bride || 'one wonderful person',
    groom: recipientData.groom || 'their favorite person',
    partnerOne: recipientData.partnerOne || 'one wonderful person',
    partnerTwo: recipientData.partnerTwo || 'their favorite person',
    relationship: recipientData.relationship || 'someone close to you',
    favoriteMemory: recipientData.favoriteMemory || 'a memory you both treasure',
    quality: recipientData.quality || 'the way you make people feel valued',
    futureWish: recipientData.futureWish || 'many meaningful adventures ahead',
    achievement: recipientData.achievement || 'this incredible milestone',
    effort: recipientData.effort || 'dedication, courage, and persistence',
    specialWish: recipientData.specialWish || 'a life filled with love and wonder',
    reason: recipientData.reason || 'the kindness you showed',
    impact: recipientData.impact || 'it made a real and lasting difference',
  };
  const weddingCouple = [previewRecipient.bride, previewRecipient.groom].filter(Boolean).join(' & ');
  const anniversaryCouple = [previewRecipient.partnerOne, previewRecipient.partnerTwo].filter(Boolean).join(' & ');
  const coupleName = weddingCouple || anniversaryCouple;
  const ageOrdinal = formatOrdinal(recipientData.age);
  const years = String(recipientData.years || '').trim();
  const friendshipYears = String(recipientData.friendshipYears || '').trim();
  const contentContext = {
    ...previewRecipient,
    ...content,
    coupleName,
    ageOrdinal,
    ageCelebration: ageOrdinal ? `Cheers to your ${ageOrdinal} birthday and the wonderful person you have become.` : '',
    yearsCelebration: years ? `After ${years} wonderful year${years === '1' ? '' : 's'} together,` : 'Through every season together,',
    friendshipCelebration: friendshipYears ? `${friendshipYears} year${friendshipYears === '1' ? '' : 's'} of friendship, countless memories.` : 'Through every season of friendship,',
  };
  const displayName = recipientData.name || recipientData.babyName || coupleName || recipientData.parentName || 'there';
  const countdown = getCountdownInfo(recipientData.eventDate);

  const resolved = {
    chip: safeTemplate.chip || 'Special Wish',
    title: resolveTemplateText(content.title || `${safeTemplate.label || 'Wish'} wish`, contentContext).replace(/\s+/g, ' ').trim(),
    subtitle: resolveTemplateText(content.subtitle || safeTemplate.summary || '', contentContext).replace(/\s+/g, ' ').trim(),
    body: splitParagraphs(resolveTemplateText(content.body, contentContext)),
    highlight: resolveTemplateText(content.highlight || '', contentContext),
    quote: resolveTemplateText(content.quote || '', contentContext),
    footer: resolveTemplateText(content.footer || '', contentContext),
    displayName,
    tone,
  };

  // Additional optional lines for final/print preview: show sender and explicit "To:" line
  resolved.fromLine = recipientData.from ? `From: ${recipientData.from}` : '';
  resolved.toLine = `To: ${displayName}`;
  resolved.metaLines = [];

  if (recipientData.age !== undefined && String(recipientData.age).trim() !== '') {
    resolved.metaLines.push({ label: 'Celebrating', value: ageOrdinal });
  }

  if (years) resolved.metaLines.push({ label: 'Together', value: `${years} year${years === '1' ? '' : 's'}` });
  if (friendshipYears) resolved.metaLines.push({ label: 'Friends for', value: `${friendshipYears} year${friendshipYears === '1' ? '' : 's'}` });
  if (recipientData.achievement) resolved.metaLines.push({ label: 'Achievement', value: String(recipientData.achievement) });

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
    tone: data.tone || 'heartfelt',
    visibility: data.visibility || 'unlisted',
    expiresAt: data.expiresAt || null,
    revealAt: data.revealAt || null,
    ownerUid: data.ownerUid || '',
  };
}
