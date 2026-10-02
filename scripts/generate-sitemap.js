import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

function buildUrlXml(loc, changefreq = 'monthly', priority = '0.5', lastmod) {
  const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
  return `  <url>\n    <loc>${loc}</loc>${lastmodTag}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

async function main() {
  const deploymentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const siteUrl = process.env.SITE_URL || (deploymentHost ? `https://${deploymentHost}` : 'https://boltwish.vercel.app');
  
  // All core static pages
  const staticRoutes = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/template-picker', changefreq: 'weekly', priority: '0.9' },
    // All 8 dedicated template landing routes for SEO discovery
    { path: '/template/birthday', changefreq: 'weekly', priority: '0.9' },
    { path: '/template/anniversary', changefreq: 'weekly', priority: '0.8' },
    { path: '/template/love', changefreq: 'weekly', priority: '0.8' },
    { path: '/template/congrats', changefreq: 'weekly', priority: '0.8' },
    { path: '/template/newbaby', changefreq: 'weekly', priority: '0.8' },
    { path: '/template/wedding', changefreq: 'weekly', priority: '0.8' },
    { path: '/template/friendship', changefreq: 'weekly', priority: '0.8' },
    { path: '/template/thankyou', changefreq: 'weekly', priority: '0.8' },
    { path: '/vision', changefreq: 'monthly', priority: '0.5' },
    { path: '/terms', changefreq: 'monthly', priority: '0.3' },
    { path: '/contact', changefreq: 'monthly', priority: '0.4' },
    { path: '/social', changefreq: 'monthly', priority: '0.4' },
  ];

  const urls = [...staticRoutes];

  // optional: fetch wishes from Firestore when FETCH_WISHES=true and credentials are supplied
  const wishPaths = await fetchWishesFromFirestore();
  for (const p of wishPaths) urls.push({ path: p, changefreq: 'monthly', priority: '0.6' });

  const xmlParts = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  const today = new Date().toISOString().slice(0, 10);
  for (const u of urls) {
    xmlParts.push(buildUrlXml(`${siteUrl.replace(/\/$/, '')}${u.path}`, u.changefreq, u.priority, today));
  }
  xmlParts.push('</urlset>');

  const publicDir = path.join(__dirname, '..', 'public');
  const outPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(outPath, xmlParts.join('\n') + '\n', 'utf8');
  console.log(`Wrote sitemap with ${urls.length} URLs to ${outPath}`);

  // Automatically sync robots.txt with active domain
  const robotsPath = path.join(publicDir, 'robots.txt');
  const robotsContent = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /save\nSitemap: ${siteUrl.replace(/\/$/, '')}/sitemap.xml\n`;
  fs.writeFileSync(robotsPath, robotsContent, 'utf8');
  console.log(`Synchronized robots.txt with ${siteUrl}/sitemap.xml`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
