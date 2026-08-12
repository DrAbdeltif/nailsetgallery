#!/usr/bin/env node
/**
 * generate-llms-full.mjs
 * Runs before `astro build` to auto-generate public/llms-full.txt
 * from all blog articles in src/content/blog/
 *
 * Usage: node scripts/generate-llms-full.mjs
 * Add to package.json: "prebuild": "node scripts/generate-llms-full.mjs"
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = join(__dirname, '../src/content/blog');
const OUTPUT_FILE = join(__dirname, '../public/llms-full.txt');
const SITE_URL = 'https://nailsetgallery.com';

function parseFrontmatter(content) {
  const match = content.match(/^---[\r\n]([\s\S]*?)---[\r\n]/);
  if (!match) return { meta: {}, body: content };

  const meta = {};
  const lines = match[1].split(/\r?\n/);
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    meta[key] = value;
  }

  const body = content.slice(match[0].length).trim();
  return { meta, body };
}

function stripMarkdown(text) {
  return text
    .replace(/^#+\s+/gm, '')         // headings
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1')    // italic
    .replace(/`([^`]+)`/g, '$1')      // code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/^\s*[-*+]\s+/gm, '• ')  // lists
    .replace(/^\s*\d+\.\s+/gm, '')    // numbered lists
    .replace(/^-{3,}$/gm, '')          // hr
    .replace(/>\s+/gm, '')             // blockquotes
    .replace(/\n{3,}/g, '\n\n')       // extra blank lines
    .trim();
}

const files = readdirSync(BLOG_DIR)
  .filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
  .sort();

let output = `# NailSet Gallery — Full Content Reference (llms-full.txt)
# Generated: ${new Date().toISOString()}
# Source: ${SITE_URL}
# Total articles: ${files.length}
#
# This file is provided for AI indexing, citation, and search engines.
# Content © NailSet Gallery. Citation with attribution is permitted.
# Reproduction without attribution is not permitted.

`;

for (const file of files) {
  const slug = file.replace(/\.(md|mdx)$/, '');
  const raw = readFileSync(join(BLOG_DIR, file), 'utf8');
  const { meta, body } = parseFrontmatter(raw);

  const url = `${SITE_URL}/blog/${slug}/`;
  const title = meta.title || slug;
  const description = meta.description || '';
  const pubDate = meta.pubDate || '';
  const updatedDate = meta.updatedDate || pubDate;
  const category = meta.category || '';
  const author = meta.author || 'NailSet Gallery';

  output += `${'='.repeat(80)}
URL: ${url}
Title: ${title}
Description: ${description}
Category: ${category}
Published: ${pubDate}
Updated: ${updatedDate}
Author: ${author}
${'='.repeat(80)}

${stripMarkdown(body)}

`;
}

writeFileSync(OUTPUT_FILE, output, 'utf8');
console.log(`✅ llms-full.txt generated — ${files.length} articles → ${OUTPUT_FILE}`);
