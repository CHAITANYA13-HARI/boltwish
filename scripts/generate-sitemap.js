import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { templateSeed } from '../src/data/templateSeed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchWishesFromFirestore() {
  if (!process.env.FETCH_WISHES) return [];
  try {
    // attempt to import firebase-admin dynamically
    const admin = await import('firebase-admin');
    let creds = null;
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      creds = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }

    if (creds) {
      admin.initializeApp({ credential: admin.credential.cert(creds) });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp();
    } else {
      console.warn('No Firebase credentials found in env; skipping wishes fetch.');
      return [];
    }

    const db = admin.firestore();
    const snapshot = await db.collection('wishes').get();
    const urls = [];
    snapshot.forEach((doc) => {
      const id = doc.id;
      urls.push(`/wish/${id}`);
    });
    return urls;
  } catch (err) {
    console.warn('Could not fetch wishes from Firestore:', err.message || err);
    return [];
  }
}

function buildUrlXml(loc, changefreq = 'monthly', priority = '0.5') {
  return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

async function main() {
  const siteUrl = process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://boltwish.vercel.app');
  const staticRoutes = ['/', '/template-picker', '/terms', '/contact', '/vision', '/save', '/admin'];

  const urls = [];
  // static
  for (const r of staticRoutes) urls.push({ path: r, changefreq: r === '/' ? 'daily' : 'monthly', priority: r === '/' ? '1.0' : '0.5' });

  // templates from local seed
  for (const t of templateSeed) {
    urls.push({ path: `/template/${t.id}`, changefreq: 'weekly', priority: '0.8' });
  }

  // optional: fetch wishes from Firestore when FETCH_WISHES=true and credentials are supplied
  const wishPaths = await fetchWishesFromFirestore();
  for (const p of wishPaths) urls.push({ path: p, changefreq: 'monthly', priority: '0.6' });

  const xmlParts = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  for (const u of urls) {
    xmlParts.push(buildUrlXml(`${siteUrl.replace(/\/$/, '')}${u.path}`, u.changefreq, u.priority));
  }
  xmlParts.push('</urlset>');

  const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, xmlParts.join('\n') + '\n', 'utf8');
  console.log(`Wrote sitemap with ${urls.length} URLs to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
