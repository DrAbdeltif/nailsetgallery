import fs from 'node:fs';
import path from 'node:path';

const DEST_DIR = 'C:\\Users\\adrarez\\Pictures\\nailsetgallery';
const DEST_IMG_DIR = path.join(DEST_DIR, 'images');
const BLOG_DIR = path.resolve('src/content/blog');
const PUBLIC_DIR = path.resolve('public');
const BASE_URL = 'https://nailsetgallery.com';

if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}
if (!fs.existsSync(DEST_IMG_DIR)) {
  fs.mkdirSync(DEST_IMG_DIR, { recursive: true });
}

function parseYamlFrontmatter(content) {
  const cleanContent = content.replace(/^\uFEFF/, '');
  const match = cleanContent.match(/^---\r?\n([\s\S]+?)\r?\n---/);
  if (!match) return null;
  const yamlText = match[1];
  const data = {};

  yamlText.split(/\r?\n/).forEach((line) => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();

    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    } else if (val.startsWith('[') && val.endsWith(']')) {
      val = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
    }
    data[key] = val;
  });

  return data;
}

function getBoardName(category, tags = []) {
  const cat = (category || '').toLowerCase();
  const tagList = Array.isArray(tags) ? tags.map((t) => t.toLowerCase()) : [];

  if (tagList.includes('transition-nails') || tagList.includes('late-summer-nails') || tagList.includes('early-fall-nails')) {
    return 'Fall & Seasonal Transition Nails';
  }
  if (tagList.includes('teen-nails') || tagList.includes('back-to-school-nails') || tagList.includes('school-nails') || tagList.includes('first-day-of-school-nails') || tagList.includes('nails-for-teens-short')) {
    return 'Teen Nails & Back to School Art';
  }
  if (tagList.includes('halloween-nails') || tagList.includes('spooky-nails') || tagList.includes('gothic-nails') || tagList.includes('fall-nails') || tagList.includes('dark-nails')) {
    return 'Fall & Halloween Nail Art Ideas';
  }
  if (cat === 'tutorials' || tagList.includes('tutorials') || tagList.includes('diy-nails')) {
    return 'Nail Art Tutorials & DIY Care';
  }
  if (cat === 'colors' || tagList.includes('color-guide') || tagList.includes('colors')) {
    return 'Nail Set Colors & Palettes';
  }
  if (cat === 'styles' || tagList.includes('styles') || tagList.includes('aesthetic-nails')) {
    return 'Nail Shapes & Aesthetic Styles';
  }
  if (cat === 'seasons' || tagList.includes('seasonal-nails') || tagList.includes('seasons')) {
    return 'Seasonal Nail Art & Pedicure Ideas';
  }
  return '2026 Trending Manicures & Nail Art';
}

function buildHashtags(category, tags = []) {
  const base = ['#nailsetgallery', '#nailart', '#manicure', '#nailinspo', '#nailartdesigns'];
  if (category) base.push(`#${category.replace(/[^a-z0-9]/gi, '')}`);
  if (Array.isArray(tags)) {
    tags.slice(0, 5).forEach((tag) => {
      const formatted = `#${tag.replace(/[^a-z0-9]/gi, '')}`;
      if (!base.includes(formatted)) base.push(formatted);
    });
  }
  return base.join(' ');
}

function generateShortVideoPrompt(title, category, tags = [], description = '') {
  const tagList = Array.isArray(tags) ? tags.join(', ') : '';
  const cleanTitle = title.replace(/[^\w\s-&]/g, '').trim();

  return `9:16 vertical short video (Pinterest Idea Pin / TikTok / Reels). Ultra-aesthetic 4K macro beauty shot of manicured hands showcasing ${cleanTitle}. Smooth slow-motion camera pan and subtle hand tilt revealing ultra-glossy gel reflections, intricate textures, and flawless cuticle work. Studio beauty lighting, clean aesthetic background, 60fps cinematic video, high-fashion nail salon quality.`;
}

function generatePinTitleForImage(altText, fileName, postTitle) {
  if (fileName.includes('cute-ghost')) return 'Cute Ghost Nails: Adorable Halloween Nail Art Inspo';
  if (fileName.includes('ghost-face')) return 'Ghost Face Nails: Spooky Scream Mask Coffin Nail Art';
  if (fileName.includes('simple-short-halloween')) return 'Simple Short Halloween Nails: Minimalist Squoval Inspo';
  if (fileName.includes('spooky-velvet-cat-eye')) return 'Spooky Velvet Cat-Eye Nails: Magnetic Emerald & Plum Art';
  if (fileName.includes('halloween-themed-nail-designs-hero')) return 'Halloween-Themed Nail Designs: Cute, Simple & Spooky Ideas';

  // Extract clean descriptive title from altText
  const cleanAlt = altText.split('.')[0].trim();
  if (cleanAlt.length > 10 && cleanAlt.length <= 90) {
    return cleanAlt;
  }
  const cleanFile = path.basename(fileName, path.extname(fileName)).replace(/[-_]/g, ' ');
  return `${cleanFile.charAt(0).toUpperCase() + cleanFile.slice(1)} | NailSet Gallery`;
}

function generatePinDescriptionForImage(altText, fileName, postDescription, hashtags) {
  return `${altText}\n\nExplore step-by-step manicure ideas & tutorials on NailSet Gallery.\n\n${hashtags}`.slice(0, 500);
}

function escapeCsvField(field) {
  if (field === null || field === undefined) return '""';
  const str = String(field).replace(/"/g, '""');
  return `"${str}"`;
}

async function main() {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md')).sort();
  console.log(`Found ${files.length} blog post files.`);

  const pinRecords = [];

  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const frontmatter = parseYamlFrontmatter(content);

    if (!frontmatter || frontmatter.draft === 'true' || frontmatter.draft === true) {
      continue;
    }

    const slug = file.replace(/\.md$/, '');
    const canonicalLink = `${BASE_URL}/blog/${slug}/`;
    const boardName = getBoardName(frontmatter.category, frontmatter.tags);
    const hashtags = buildHashtags(frontmatter.category, frontmatter.tags);
    const seenImages = new Set();

    // 1. Primary Hero Image Pin
    const heroImageRel = frontmatter.heroImage || '/images/og-default.jpg';
    seenImages.add(heroImageRel);
    const heroImageSrc = path.join(PUBLIC_DIR, heroImageRel.replace(/^\//, ''));
    const heroFileName = path.basename(heroImageRel);
    const heroImageDest = path.join(DEST_IMG_DIR, heroFileName);

    if (fs.existsSync(heroImageSrc)) {
      fs.copyFileSync(heroImageSrc, heroImageDest);
    }

    const pinTitle = (frontmatter.title || slug).slice(0, 100);
    const pinDescription = `${frontmatter.description || ''}\n\nExplore full tutorial & color guide on NailSet Gallery.\n\n${hashtags}`.slice(0, 500);
    const altText = frontmatter.heroImageAlt || frontmatter.title || 'Nail set art design inspiration';
    const mediaUrl = `${BASE_URL}${heroImageRel}`;
    const videoPrompt = generateShortVideoPrompt(
      frontmatter.title || slug,
      frontmatter.category,
      frontmatter.tags,
      frontmatter.description
    );

    pinRecords.push({
      Title: pinTitle,
      Description: pinDescription,
      Destination_Link: canonicalLink,
      Board_Name: boardName,
      Image_File_Name: heroFileName,
      Image_Local_Path: heroImageDest,
      Media_URL: mediaUrl,
      Alt_Text: altText,
      Category: frontmatter.category || 'general',
      Tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.join(', ') : '',
      Video_Prompt: videoPrompt,
    });

    // 2. In-Article Body Images Pins
    const bodyImages = Array.from(content.matchAll(/!\[(.*?)\]\((\/images\/[^)]+)\)/g));
    for (const match of bodyImages) {
      const imgAlt = match[1].trim();
      const imgRel = match[2].trim();
      if (seenImages.has(imgRel)) continue;
      seenImages.add(imgRel);

      const imgSrc = path.join(PUBLIC_DIR, imgRel.replace(/^\//, ''));
      if (!fs.existsSync(imgSrc)) continue;

      const imgFileName = path.basename(imgRel);
      const imgDest = path.join(DEST_IMG_DIR, imgFileName);
      fs.copyFileSync(imgSrc, imgDest);

      const inBodyTitle = generatePinTitleForImage(imgAlt, imgFileName, frontmatter.title);
      const inBodyDesc = generatePinDescriptionForImage(imgAlt, imgFileName, frontmatter.description, hashtags);
      const inBodyVideoPrompt = generateShortVideoPrompt(inBodyTitle, frontmatter.category, frontmatter.tags, inBodyDesc);

      pinRecords.push({
        Title: inBodyTitle.slice(0, 100),
        Description: inBodyDesc,
        Destination_Link: canonicalLink,
        Board_Name: boardName,
        Image_File_Name: imgFileName,
        Image_Local_Path: imgDest,
        Media_URL: `${BASE_URL}${imgRel}`,
        Alt_Text: imgAlt,
        Category: frontmatter.category || 'general',
        Tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.join(', ') : '',
        Video_Prompt: inBodyVideoPrompt,
      });
    }
  }

  // 1. Export CSV for Excel / Pinterest Bulk Upload (with UTF-8 BOM)
  const csvHeaders = [
    'Title',
    'Description',
    'Destination_Link',
    'Board_Name',
    'Image_File_Name',
    'Image_Local_Path',
    'Media_URL',
    'Alt_Text',
    'Category',
    'Tags',
    'Video_Prompt',
  ];

  const csvRows = [
    csvHeaders.join(','),
    ...pinRecords.map((rec) =>
      csvHeaders.map((header) => escapeCsvField(rec[header])).join(',')
    ),
  ];

  const csvPath = path.join(DEST_DIR, 'pinterest_pins_bulk_upload.csv');
  const bom = '\uFEFF';
  fs.writeFileSync(csvPath, bom + csvRows.join('\r\n'), 'utf8');

  // 2. Export JSON
  const jsonPath = path.join(DEST_DIR, 'pinterest_pins.json');
  fs.writeFileSync(jsonPath, JSON.stringify(pinRecords, null, 2), 'utf8');

  console.log(`\n✅ Pinterest Export Complete!`);
  console.log(`📁 Destination Folder: ${DEST_DIR}`);
  console.log(`📌 Total Pins Exported: ${pinRecords.length}`);
  console.log(`🖼️  Images Copied: ${pinRecords.length} files into ${DEST_IMG_DIR}`);
  console.log(`📊 Excel CSV Created: ${csvPath}`);
  console.log(`📄 JSON Dataset Created: ${jsonPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
