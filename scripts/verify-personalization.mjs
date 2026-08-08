import { templateSeed } from '../src/data/templateSeed.js';
import { buildContentDraft, composeWishPreview, parseField, wishTones } from '../src/data/templates.js';

const sampleValues = {
  name: 'Maya',
  age: '28',
  eventDate: '2026-12-31',
  quality: 'your kindness makes everyone feel at home',
  favoriteMemory: 'our rainy road trip when we laughed the whole way home',
  message: 'Never forget how loved you are.',
  from: 'Arjun',
  partnerOne: 'Aisha',
  partnerTwo: 'Rohan',
  years: '10',
  futureWish: 'a lifetime of laughter and new adventures',
  achievement: 'graduating with honors',
  effort: 'years of discipline and the courage to keep going',
  babyName: 'Aarav',
  parentName: 'Neha and Vikram',
  relationship: 'a close family friend',
  specialWish: 'a life filled with curiosity and kindness',
  bride: 'Priya',
  groom: 'Kabir',
  friendshipYears: '8',
  reason: 'supporting me through a difficult career change',
  impact: 'you helped me believe in myself again',
};

const failures = [];

for (const template of templateSeed) {
  const recipientData = Object.fromEntries(
    template.fields.map(parseField).map((field) => [field.key, sampleValues[field.key] ?? 'a personal detail']),
  );

  for (const tone of wishTones) {
    const preview = composeWishPreview(template, {
      recipientData,
      content: buildContentDraft(template),
      tone: tone.id,
    });
    const serialized = JSON.stringify(preview);
    const invalid = serialized.includes('{{')
      || preview.displayName === 'there'
      || !preview.title.trim()
      || preview.title.length > 90
      || !preview.body.length
      || preview.body.join('\n\n').length > 1800;

    if (invalid) failures.push(`${template.id}/${tone.id}`);
  }
}

if (failures.length) {
  throw new Error(`Personalization verification failed: ${failures.join(', ')}`);
}

console.log(`Verified ${templateSeed.length * wishTones.length} personalized template/tone combinations.`);
