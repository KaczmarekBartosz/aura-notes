#!/usr/bin/env node
/**
 * Frontmatter Auto-Generator for Aura Notes
 * Automatically analyzes markdown files and adds YAML frontmatter
 */

let fs;
let path;

const MEMORY_DIR = '/home/ubuntu/clawd/aura-notes/memory';

// Category mapping based on file name patterns and content
function inferCategory(filename, content) {
  const lowerFile = filename.toLowerCase();
  const lowerContent = content.toLowerCase().slice(0, 5000);
  
  // Explicit patterns
  if (lowerFile.includes('gold_fitness') || lowerFile.includes('fitness-protocol')) {
    return { category: 'fitness-health', subcategory: 'protocols' };
  }
  if (lowerFile.includes('gold_design')) {
    return { category: 'design', subcategory: 'ui-ux' };
  }
  if (lowerFile.includes('gold_ai_agents') || lowerFile.includes('ai-agents')) {
    return { category: 'ai-agents', subcategory: 'automation' };
  }
  if (lowerFile.includes('gold_dev')) {
    return { category: 'ai-agents', subcategory: 'development' };
  }
  if (lowerFile.includes('gold_content')) {
    return { category: 'growth-marketing', subcategory: 'content' };
  }
  if (lowerFile.includes('gold_growth') || lowerFile.includes('growth_tactics')) {
    return { category: 'growth-marketing', subcategory: 'seo' };
  }
  if (lowerFile.includes('gold_indie')) {
    return { category: 'growth-marketing', subcategory: 'indie-hacker' };
  }
  if (lowerFile.includes('gold_productivity')) {
    return { category: 'golden-protocols', subcategory: 'productivity' };
  }
  if (lowerFile.includes('gold_psychology')) {
    return { category: 'fitness-health', subcategory: 'psychology' };
  }
  if (lowerFile.includes('ksiega_peptydow') || lowerFile.includes('peptydy') || lowerFile.includes('peptide')) {
    return { category: 'fitness-health', subcategory: 'peptides' };
  }
  if (lowerFile.includes('x-bookmark') || lowerFile.includes('x_bookmark')) {
    return { category: 'bookmarks', subcategory: 'x-twitter' };
  }
  if (lowerFile.includes('recipe')) {
    return { category: 'recipes', subcategory: 'code' };
  }
  if (lowerFile.includes('cron-summary') || lowerFile.includes('cron_summary')) {
    return { category: 'ai-agents', subcategory: 'automation' };
  }
  if (lowerFile.includes('user_taste')) {
    return { category: 'taste', subcategory: 'personal' };
  }
  if (lowerFile.includes('perplexity')) {
    return { category: 'ai-agents', subcategory: 'research' };
  }
  if (lowerFile.includes('token')) {
    return { category: 'ai-agents', subcategory: 'monitoring' };
  }
  if (lowerFile.includes('workflow')) {
    return { category: 'ai-agents', subcategory: 'workflows' };
  }
  
  // Content-based inference
  if (lowerContent.includes('peptyd') || lowerContent.includes('bpc-157') || lowerContent.includes('cjc') || lowerContent.includes('tb500')) {
    return { category: 'fitness-health', subcategory: 'peptides' };
  }
  if (lowerContent.includes('openclaw') || lowerContent.includes('claude code') || lowerContent.includes('ai agent')) {
    return { category: 'ai-agents', subcategory: 'automation' };
  }
  if (lowerContent.includes('fitness') || lowerContent.includes('trening') || lowerContent.includes('protein') || lowerContent.includes('kreatyn')) {
    return { category: 'fitness-health', subcategory: 'training' };
  }
  if (lowerContent.includes('design') || lowerContent.includes('ui/ux') || lowerContent.includes('figma')) {
    return { category: 'design', subcategory: 'ui-ux' };
  }
  if (lowerContent.includes('marketing') || lowerContent.includes('seo') || lowerContent.includes('growth')) {
    return { category: 'growth-marketing', subcategory: 'seo' };
  }
  
  // Date-based files (daily logs)
  if (/^\d{4}-\d{2}-\d{2}/.test(lowerFile)) {
    return { category: 'daily-log', subcategory: null };
  }
  
  return { category: 'note', subcategory: null };
}

function inferType(filename) {
  const lowerFile = filename.toLowerCase();
  
  if (lowerFile.startsWith('gold_')) return 'protocol';
  if (lowerFile.startsWith('research_')) return 'research';
  if (lowerFile.startsWith('knowledge_')) return 'research';
  if (lowerFile.startsWith('projekt_')) return 'protocol';
  if (lowerFile.includes('x-bookmark')) return 'bookmark';
  if (lowerFile.includes('recipe')) return 'note';
  if (/^\d{4}-\d{2}-\d{2}/.test(lowerFile)) return 'daily-log';
  if (lowerFile.includes('protocol')) return 'protocol';
  
  return 'note';
}

function inferSource(filename, content) {
  const lowerFile = filename.toLowerCase();
  
  if (lowerFile.includes('x-bookmark')) return 'x-bookmark';
  if (lowerFile.includes('perplexity')) return 'perplexity';
  if (lowerFile.includes('glm')) return 'claude';
  if (lowerFile.includes('cron')) return 'claude';
  
  // Check content for AI markers
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes('source: https://x.com') || lowerContent.includes('bookmark') || lowerContent.includes('tweet')) {
    return 'x-bookmark';
  }
  
  return 'manual';
}

function generateTags(content, category, subcategory) {
  const tags = [];
  const lowerContent = content.toLowerCase().slice(0, 3000);
  
  // Category-based tags
  if (category === 'fitness-health') {
    tags.push('health', 'fitness');
    if (subcategory === 'peptides') tags.push('peptides', 'biohacking');
    if (subcategory === 'training') tags.push('training', 'workout');
  }
  if (category === 'ai-agents') {
    tags.push('ai', 'automation');
    if (subcategory === 'development') tags.push('coding', 'development');
  }
  if (category === 'design') tags.push('design', 'ui', 'ux');
  if (category === 'bookmarks') tags.push('bookmarks', 'resources');
  if (category === 'golden-protocols') tags.push('protocol', 'system');
  if (category === 'growth-marketing') tags.push('marketing', 'growth');
  
  // Content-based tags
  if (lowerContent.includes('openclaw')) tags.push('openclaw');
  if (lowerContent.includes('claude')) tags.push('claude');
  if (lowerContent.includes('peptyd')) tags.push('peptides');
  if (lowerContent.includes('trening')) tags.push('training');
  if (lowerContent.includes('protokol')) tags.push('protocol');
  
  // Unique tags only, max 7
  return [...new Set(tags)].slice(0, 7);
}

function extractTitle(content, filename) {
  // Try to find H1 heading
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }
  
  // Try to find first heading of any level
  const anyHeading = content.match(/^#{1,6}\s+(.+)$/m);
  if (anyHeading) {
    return anyHeading[1].trim();
  }
  
  // Use filename without extension
  return filename.replace('.md', '').replace(/-/g, ' ').replace(/_/g, ' ');
}

function extractDate(filename) {
  // Try to extract date from filename
  const dateMatch = filename.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    return `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
  }
  return null;
}

function generateFrontmatter(filePath) {
  const filename = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Skip if already has frontmatter
  if (content.trim().startsWith('---')) {
    return null;
  }
  
  const title = extractTitle(content, filename);
  const { category, subcategory } = inferCategory(filename, content);
  const type = inferType(filename);
  const source = inferSource(filename, content);
  const tags = generateTags(content, category, subcategory);
  const created = extractDate(filename) || '2026-02-01';
  const updated = created;
  
  const frontmatter = `---
title: "${title}"${subcategory ? `
subcategory: "${subcategory}"` : ''}
category: "${category}"
tags: [${tags.map(t => `"${t}"`).join(', ')}]
type: "${type}"
created: "${created}"
updated: "${updated}"
source: "${source}"
ai_generated: false
---

`;
  
  return frontmatter;
}

function processFile(filePath) {
  try {
    const frontmatter = generateFrontmatter(filePath);
    if (!frontmatter) {
      console.log(`SKIP: ${filePath} (already has frontmatter)`);
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    fs.writeFileSync(filePath, frontmatter + content);
    console.log(`DONE: ${filePath}`);
    return true;
  } catch (err) {
    console.error(`ERROR: ${filePath} - ${err.message}`);
    return false;
  }
}

function findMarkdownFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath));
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function main() {
  ({ default: fs } = await import('node:fs'));
  ({ default: path } = await import('node:path'));

  console.log('=== Frontmatter Generator for Aura Notes ===\n');

  const files = findMarkdownFiles(MEMORY_DIR);
  console.log(`Found ${files.length} markdown files\n`);

  let processed = 0;
  let skipped = 0;

  for (const file of files) {
    if (processFile(file)) {
      processed++;
    } else {
      skipped++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Processed: ${processed}`);
  console.log(`Skipped (already has frontmatter): ${skipped}`);
  console.log(`Total: ${files.length}`);
}

void main();
