/**
 * Templates utility module
 * - Provides normalized template documents and helpers for building drafts/previews
 * - Streamlined to only essential fields: Recipient, Personal Message, Sender, and Date
 */

export const fieldLabels = {
  name: "Recipient's Name",
  from: 'Your Name (Sender)',
  message: 'Personal Message',
  eventDate: 'Celebration Date',
  age: 'Age (optional)',
  years: 'Years Together (optional)',
  achievement: 'What are they celebrating?',
  partnerOne: 'Partner 1 Name',
  partnerTwo: 'Partner 2 Name',
  bride: "Bride's Name",
  groom: "Groom's Name",
  babyName: "Baby's Name",
  parentName: "Parents' Name",
};

export const fieldMeta = {
  name: { type: 'text', placeholder: 'e.g., Alex', maxLength: 50, required: true },
  from: { type: 'text', placeholder: 'e.g., Sarah', maxLength: 50, required: true },
  message: { type: 'textarea', placeholder: 'Write your heartfelt wish or memories...', maxLength: 1000, required: true },
  eventDate: { type: 'date', required: false },
  age: { type: 'number', placeholder: 'e.g., 25', min: 1, max: 120, required: false },
  years: { type: 'number', placeholder: 'e.g., 5', min: 1, max: 100, required: false },
  achievement: { type: 'text', placeholder: 'e.g., New Job, Graduation', maxLength: 80, required: true },
  partnerOne: { type: 'text', placeholder: 'e.g., Aisha', maxLength: 50, required: true },
  partnerTwo: { type: 'text', placeholder: 'e.g., Rohan', maxLength: 50, required: true },
  bride: { type: 'text', placeholder: 'e.g., Emily', maxLength: 50, required: true },
  groom: { type: 'text', placeholder: 'e.g., James', maxLength: 50, required: true },
  babyName: { type: 'text', placeholder: 'e.g., Baby Liam', maxLength: 50, required: true },
  parentName: { type: 'text', placeholder: 'e.g., Sarah & Tom', maxLength: 50, required: true },
};

export const defaultWishMessages = {
  birthday: 'Today is a celebration of the laughter you bring into every room and the way you make life brighter for everyone around you. I hope this year treats you with the same warmth, big adventures, and joy you give to the world. Eat the extra slice of cake—you have earned every bit of today!',
  anniversary: 'Seeing the love, trust, and deep laughter you share is a true inspiration. May the years ahead bring even more quiet comfort, shared jokes, and reasons to fall in love all over again. Happy Anniversary!',
  love: 'In a world that moves fast, you are my favorite place to slow down. Thank you for your warmth, your smile, and for making ordinary days feel like moments worth remembering forever. Loving you is the easiest choice I make every single day.',
  congrats: 'You did that! People see the victory today, but we remember all the grit, late nights, and perseverance it took to get here. This milestone is proof of what happens when dedication meets pure heart. Enjoy every second of this win!',
  newbaby: 'Congratulations on your beautiful new arrival! A tiny new life has filled the world with unimaginable wonder. Wishing your growing family a lifetime of health, peaceful sleep, and precious cuddles.',
  wedding: 'Congratulations on your wedding day! It is such a joy to see you two begin married life together. May your home always be filled with deep patience, loud laughter, and a love that grows stronger with every sunrise.',
  friendship: 'To the friend who knows all my wildest stories because you were right there laughing with me: thank you for being my anchor, my comic relief, and my favorite person to talk to. Here is to a lifetime of memories ahead!',
  thankyou: 'Thank you from the bottom of my heart for your kindness, support, and generosity. Having you in my corner made all the difference when I needed it most, and I will always remember it with deep gratitude!',
  graduation: 'Congratulations on graduating! Watching your commitment, late-night study sessions, and perseverance pay off makes everyone so proud today. The diploma is yours, and the future is waiting for you to conquer it!',
  farewell: 'Working alongside you has been an absolute delight. Your positive energy, dedication, and humor made every day better. Wishing you soaring success, exciting new projects, and endless happiness in this next chapter!',
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
      subtitle: 'Today’s agenda: celebrate you properly and make some great memories.',
      body: 'Dear {{name}},\n\n{{ageCelebration}}\n\n{{message}}',
      highlight: 'More cake, more laughter, and absolutely no acting your age today.',
      footer: 'Big birthday energy from',
    },
    elegant: {
      title: 'Celebrating You, {{name}} ✨',
      subtitle: 'A birthday is a beautiful moment to honor the life you live and the joy you bring.',
      body: 'Dear {{name}},\n\n{{ageCelebration}}\n\n{{message}}',
      highlight: 'May the year ahead be rich with purpose, happiness, and moments worthy of remembering.',
      footer: 'With warmest birthday wishes',
    },
    concise: {
      title: 'Happy Birthday, {{name}}! 🎂',
      subtitle: '{{ageCelebration}}',
      body: 'Dear {{name}},\n\n{{message}}',
      highlight: 'Have the wonderful birthday you deserve.',
      footer: 'With love',
    },
  },
  anniversary: {
    playful: {
      title: '{{coupleName}}, Still an Amazing Team! 🥂',
      subtitle: '{{yearsCelebration}} Still proving that love and laughter make the best partnership.',
      body: 'Here’s to {{partnerOne}} and {{partnerTwo}}—two people who make together look very good.\n\n{{message}}',
      highlight: 'Keep choosing each other, laughing loudly, and winning at life as a team.',
      footer: 'Cheers to you both',
    },
    elegant: {
      title: 'In Celebration of {{coupleName}} 🥂',
      subtitle: '{{yearsCelebration}} your journey together is a beautiful testament to love.',
      body: '{{partnerOne}} and {{partnerTwo}}, the devotion and warmth in your partnership are deeply admired.\n\n{{message}}',
      highlight: 'May every year deepen the trust, tenderness, and joy you have created together.',
      footer: 'With warm anniversary wishes',
    },
    concise: {
      title: 'Happy Anniversary, {{coupleName}}!',
      subtitle: '{{yearsCelebration}} and still creating a beautiful story.',
      body: '{{partnerOne}} and {{partnerTwo}},\n\n{{message}}',
      highlight: 'Here’s to many more happy chapters together.',
      footer: 'Celebrating you both',
    },
  },
  love: {
    playful: {
      title: '{{name}}, You’re My Favorite ❤️',
      subtitle: 'A very official reminder that life is significantly better with you in it.',
      body: 'Dearest {{name}},\n\n{{message}}',
      highlight: 'Still choosing you. Still smiling about it.',
      footer: 'All my love',
    },
    elegant: {
      title: 'For {{name}}, With All My Love ❤️',
      subtitle: 'The deepest affection is found in the moments we quietly treasure.',
      body: 'Dearest {{name}},\n\n{{message}}',
      highlight: 'You are both my comfort and my favorite adventure.',
      footer: 'Yours, always',
    },
    concise: {
      title: 'For You, {{name}} ❤️',
      subtitle: 'A little reminder of how much you mean to me.',
      body: 'Dearest {{name}},\n\n{{message}}',
      highlight: 'You make my world better.',
      footer: 'With all my heart',
    },
  },
  congrats: {
    playful: {
      title: '{{name}}, You Crushed It! 🎉',
      subtitle: '{{achievement}}: completed. Celebration mode: activated.',
      body: 'Dear {{name}},\n\nThis win is huge, and you get to enjoy every bit of it!\n\n{{message}}',
      highlight: 'Be proud, celebrate loudly, and take the victory lap.',
      footer: 'Cheering for you',
    },
    elegant: {
      title: 'Congratulations, {{name}} 🎉',
      subtitle: 'Your achievement—{{achievement}}—is worthy of genuine admiration.',
      body: 'Dear {{name}},\n\nYour dedication and commitment have led to a truly deserved result.\n\n{{message}}',
      highlight: 'May this milestone be the beginning of an even more remarkable chapter.',
      footer: 'With sincere congratulations',
    },
    concise: {
      title: 'You Did It, {{name}}! 🎉',
      subtitle: 'Congratulations on {{achievement}}.',
      body: 'Dear {{name}},\n\n{{message}}',
      highlight: 'This moment is yours—enjoy it.',
      footer: 'So proud of you',
    },
  },
  newbaby: {
    playful: {
      title: 'Hello, {{babyName}}! 👶',
      subtitle: 'Tiny human, enormous personality loading—and a whole family in love.',
      body: 'Dear {{parentName}},\n\nYour sweetest new adventure has officially begun!\n\n{{message}}',
      highlight: 'Welcome to the cuddles, giggles, and wonderfully sleepy days.',
      footer: 'Sending love and happy wishes',
    },
    elegant: {
      title: 'Welcome, Dear {{babyName}} 👶',
      subtitle: 'A precious new life, received with immeasurable love.',
      body: 'Dear {{parentName}},\n\nIt is such a joy to celebrate this beautiful addition to your family.\n\n{{message}}',
      highlight: 'May your home be filled with tenderness, wonder, and lasting happiness.',
      footer: 'With warmest wishes to your family',
    },
    concise: {
      title: 'Welcome, {{babyName}}! 👶',
      subtitle: 'So tiny, so loved, and already so special.',
      body: 'Congratulations, {{parentName}}!\n\n{{message}}',
      highlight: 'Sending love to your beautiful growing family.',
      footer: 'With love',
    },
  },
  wedding: {
    playful: {
      title: '{{coupleName}} Made It Official! 💒',
      subtitle: 'Two favorite people, one excellent decision, and a lifetime ahead.',
      body: 'To {{coupleName}},\n\nSeeing this day is so special!\n\n{{message}}',
      highlight: 'Love each other, laugh often, and always share the last piece of cake.',
      footer: 'Celebrating you both',
    },
    elegant: {
      title: 'With Love to {{coupleName}} 💒',
      subtitle: 'May this day mark the beginning of a marriage filled with devotion and joy.',
      body: 'To {{coupleName}},\n\nIt is a true honor to witness this wonderful new chapter.\n\n{{message}}',
      highlight: 'May you build a life that is both a sanctuary and an adventure.',
      footer: 'With warmest wishes for your marriage',
    },
    concise: {
      title: 'Congratulations, {{coupleName}}! 💒',
      subtitle: 'Wishing you a beautiful life together.',
      body: 'To {{coupleName}},\n\n{{message}}',
      highlight: 'Here’s to love, laughter, and a lifetime together.',
      footer: 'With love',
    },
  },
  friendship: {
    playful: {
      title: '{{name}}, Thanks for Being My Person 🤝',
      subtitle: 'Somehow, the stories keep getting better.',
      body: 'Dear {{name}},\n\n{{message}}',
      highlight: 'Here’s to more adventures and even better inside jokes.',
      footer: 'Your partner in chaos',
    },
    elegant: {
      title: 'For My Dear Friend, {{name}} 🤝',
      subtitle: 'Your friendship remains one of life’s finest gifts.',
      body: 'Dear {{name}},\n\n{{message}}',
      highlight: 'Thank you for the constancy, honesty, and joy of your friendship.',
      footer: 'With lasting friendship',
    },
    concise: {
      title: 'For You, {{name}} 🤝',
      subtitle: 'Celebrating our friendship.',
      body: 'Dear {{name}},\n\n{{message}}',
      highlight: 'Life is better with you as my friend.',
      footer: 'Your friend, always',
    },
  },
  thankyou: {
    playful: {
      title: '{{name}}, You’re the Best! 🙏',
      subtitle: 'A quick but very enthusiastic appreciation announcement.',
      body: 'Dear {{name}},\n\n{{message}}',
      highlight: 'Kindness level: unforgettable.',
      footer: 'A very grateful',
    },
    elegant: {
      title: 'With Gratitude to {{name}} 🙏',
      subtitle: 'Your generosity deserves to be acknowledged with sincerity.',
      body: 'Dear {{name}},\n\n{{message}}',
      highlight: 'What you gave was not merely help, but genuine encouragement.',
      footer: 'With sincere appreciation',
    },
    concise: {
      title: 'Thank You, {{name}} 🙏',
      subtitle: 'I truly appreciate what you did.',
      body: 'Dear {{name}},\n\n{{message}}',
      highlight: 'Your kindness made a real difference.',
      footer: 'With gratitude',
    },
  },
  graduation: {
    playful: {
      title: 'Cap Tossed, Future Bossed! 🎓',
      subtitle: '{{achievement}} is officially complete—time to celebrate properly.',
      body: 'Dear {{name}},\n\n{{message}}',
      highlight: 'Turn the tassel, throw the cap, and take a bow!',
      footer: 'Your biggest fan',
    },
    elegant: {
      title: 'Honoring Your Graduation, {{name}} 🎓',
      subtitle: 'Celebrating your milestone accomplishment in {{achievement}}.',
      body: 'Dear {{name}},\n\n{{message}}',
      highlight: 'May your education be the foundation of a purposeful and inspiring career.',
      footer: 'With proud congratulations',
    },
    concise: {
      title: 'Congratulations, Graduate {{name}}! 🎓',
      subtitle: 'Celebrating {{achievement}}.',
      body: 'Dear {{name}},\n\n{{message}}',
      highlight: 'So proud of everything you’ve achieved.',
      footer: 'With love and pride',
    },
  },
  farewell: {
    playful: {
      title: '{{name}}, We’ll Miss You Like Crazy! 🚀',
      subtitle: 'Off to conquer {{achievement}}—don’t forget us back here.',
      body: 'Dear {{name}},\n\n{{message}}',
      highlight: 'Whoever gets to work with you next is extraordinarily lucky.',
      footer: 'Your favorite team',
    },
    elegant: {
      title: 'Wishing You Great Success, {{name}} 🚀',
      subtitle: 'As you embark upon your new journey in {{achievement}}.',
      body: 'Dear {{name}},\n\n{{message}}',
      highlight: 'May every step of this new chapter bring fulfillment, triumph, and joy.',
      footer: 'With highest regards and best wishes',
    },
    concise: {
      title: 'Best of Luck, {{name}}! 🚀',
      subtitle: 'On your new chapter in {{achievement}}.',
      body: 'Dear {{name}},\n\n{{message}}',
      highlight: 'Wishing you all the best on your journey ahead.',
      footer: 'Warmest wishes',
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
 * Build an empty or pre-filled recipient draft from a template's fields.
 * @param {object} template
 */
export function buildRecipientDraft(template = {}) {
  const draft = {};
  (template.fields || []).forEach((f) => {
    if (f.key === 'message') {
      draft[f.key] = defaultWishMessages[template.id] || '';
    } else {
      draft[f.key] = '';
    }
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

  const defaultMsg = defaultWishMessages[safeTemplate.id] || 'Wishing you a wonderful celebration and great happiness!';
  const activeMessage = recipientData.message?.trim() || defaultMsg;

  const previewRecipient = {
    ...recipientData,
    name: recipientData.name || 'Someone Special',
    babyName: recipientData.babyName || 'Little One',
    parentName: recipientData.parentName || 'The Proud Family',
    bride: recipientData.bride || 'The Bride',
    groom: recipientData.groom || 'The Groom',
    partnerOne: recipientData.partnerOne || 'Partner 1',
    partnerTwo: recipientData.partnerTwo || 'Partner 2',
    achievement: recipientData.achievement || 'this wonderful milestone',
    message: activeMessage,
  };

  const weddingCouple = [recipientData.bride, recipientData.groom].filter(Boolean).join(' & ');
  const anniversaryCouple = [recipientData.partnerOne, recipientData.partnerTwo].filter(Boolean).join(' & ');
  const coupleName = weddingCouple || anniversaryCouple || 'The Happy Couple';

  const ageOrdinal = formatOrdinal(recipientData.age);
  const years = String(recipientData.years || '').trim();

  const contentContext = {
    ...previewRecipient,
    ...content,
    coupleName,
    ageOrdinal,
    ageCelebration: ageOrdinal ? `Cheers to your ${ageOrdinal} birthday and the wonderful person you are!` : '',
    yearsCelebration: years ? `After ${years} wonderful year${years === '1' ? '' : 's'} together,` : 'Through every season together,',
  };

  const displayName = recipientData.name
    || recipientData.babyName
    || (weddingCouple || anniversaryCouple)
    || recipientData.parentName
    || 'there';

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

  resolved.fromLine = recipientData.from ? `From: ${recipientData.from}` : '';
  const coSigners = wishData?.templateSnapshot?.theme?.coSigners || template?.theme?.coSigners || recipientData.specialWish;
  if (coSigners && String(coSigners).trim()) {
    resolved.coSigners = String(coSigners).trim();
  }
  resolved.toLine = `To: ${displayName}`;
  resolved.metaLines = [];

  if (recipientData.age !== undefined && String(recipientData.age).trim() !== '') {
    resolved.metaLines.push({ label: 'Celebrating', value: ageOrdinal });
  }

  if (years) resolved.metaLines.push({ label: 'Together', value: `${years} year${years === '1' ? '' : 's'}` });
  if (recipientData.achievement) resolved.metaLines.push({ label: 'Milestone', value: String(recipientData.achievement) });

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

  return `✨ I made a special celebration card for you, ${displayName}!\n\n"${title}"\n\nOpen your card here: ${url}\n\n— With love from ${sender}`;
}

export function createWishSchedule(Timestamp, eventDate) {
  if (!eventDate) return { expiresAt: null, revealAt: null };
  const target = new Date(`${eventDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return { expiresAt: null, revealAt: null };

  const revealAt = Timestamp.fromDate(target);
  const expiryDate = new Date(target.getTime() + 7 * 24 * 60 * 60 * 1000);
  const expiresAt = Timestamp.fromDate(expiryDate);
  return { expiresAt, revealAt };
}

export function normalizeWishDocument(data = {}) {
  return {
    templateId: data.templateId || '',
    templateSnapshot: data.templateSnapshot || null,
    recipientData: data.recipientData || {},
    content: data.content || {},
    tone: data.tone || 'heartfelt',
    visibility: data.visibility || 'unlisted',
    ownerUid: data.ownerUid || '',
    username: data.username || '',
    passcodeHash: data.passcodeHash || '',
    expiresAt: data.expiresAt || null,
    revealAt: data.revealAt || null,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
  };
}
