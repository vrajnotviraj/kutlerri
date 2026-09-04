// Rebuild every page from src/.
//
//   node src/build.js
//
// The .html files in the project root are self-extracting bundles. Line 390
// holds the page template as a JSON string; everything else in the file is the
// gzipped runtime and the font binaries. Only the template is ours to change.
//
// Each bundle carries its OWN asset ids: a different runtime <script src> and a
// different set of @font-face urls per file. So rather than hardcoding those,
// the build reads the head out of each existing template and splices the new
// body into it. That keeps the bundles valid no matter how the assets are
// renamed upstream.

const fs = require('fs');
const path = require('path');

const SRC = __dirname;
const ROOT = path.join(SRC, '..');
const TEMPLATE_LINE = 389; // zero-indexed; line 390 in an editor

const read = (f) => fs.readFileSync(path.join(SRC, f), 'utf8');

const CSS = read('app.css');
const NAV = read('nav.html');
const FOOTER = read('footer.html');

// The four pages that survive. Everything else redirects into one of them.
const PAGES = [
  {
    file: 'index.html',
    nav: null,
    title: 'Kutlerri, AI agents for restaurant P&amp;Ls',
    description: 'Kutlerri finds revenue opportunities, cuts avoidable costs and helps execute the work across catering, food, labor and expansion. Built for multi-location restaurant operators.'
  },
  {
    file: 'catering.html',
    nav: 'catering',
    title: 'Catering Agent, Kutlerri',
    description: 'Kutlerri maps catering demand around every restaurant, finds the buyers who order lunch and runs the outreach and follow-up that turns them into recurring accounts.'
  },
  {
    file: 'about.html',
    nav: 'about',
    title: 'About Kutlerri, making restaurant profit less random',
    description: 'Why we built Kutlerri: restaurant operators have more data than ever, and the most expensive decisions still end with "I think."'
  },
  {
    file: 'contact.html',
    nav: null,
    title: 'Talk to Kutlerri',
    description: 'Tell us the restaurant and we will come back with the P&amp;L levers worth working on first, and how we would measure them.'
  }
];

// Retired routes. Kept as real files so inbound links and bookmarks land
// somewhere useful instead of a 404.
const REDIRECTS = [
  { file: 'revenue.html', to: 'index.html#revenue', label: 'revenue agents' },
  { file: 'margin.html', to: 'index.html#margin', label: 'margin agents' },
  { file: 'how-it-works.html', to: 'index.html#how', label: 'how Kutlerri works' },
  { file: 'get-a-demo.html', to: 'contact.html', label: 'the contact page' }
];

// ---------------------------------------------------------------------------
// Bundle plumbing
// ---------------------------------------------------------------------------

function loadBundle(file) {
  const abs = path.join(ROOT, file);
  const lines = fs.readFileSync(abs, 'utf8').split('\n');
  if (lines[TEMPLATE_LINE - 1].trim() !== '<script type="__bundler/template">') {
    throw new Error(`${file}: unexpected bundle layout at line ${TEMPLATE_LINE}`);
  }
  return { abs, lines, template: JSON.parse(lines[TEMPLATE_LINE]) };
}

function writeBundle(bundle, template) {
  // Escaping every `<` stops a literal </script> from closing the wrapper tag.
  bundle.lines[TEMPLATE_LINE] = JSON.stringify(template).replace(/</g, '\\u003C');
  fs.writeFileSync(bundle.abs, bundle.lines.join('\n'));
}

// The runtime <script src="..."> from this bundle's own head.
function runtimeTag(template, file) {
  const m = template.match(/<script src="[^"]+"><\/script>/);
  if (!m) throw new Error(`${file}: no runtime script tag in the existing template`);
  return m[0];
}

// The first <style> block is always the @font-face set, with this bundle's own
// font asset ids. Everything after it is page CSS we are replacing.
function fontBlock(template, file) {
  const m = template.match(/<style>[\s\S]*?<\/style>/);
  if (!m || !/@font-face/.test(m[0])) throw new Error(`${file}: no @font-face block found`);
  return m[0];
}

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------

function navFor(current) {
  if (!current) return NAV;
  return NAV.replace(`data-nav="${current}"`, `data-nav="${current}" aria-current="page"`);
}

function page(bundle, spec) {
  const body = read(spec.file.replace('.html', '.body.html'));
  const logic = read(spec.file.replace('.html', '.logic.js'));

  // Page-scoped CSS, optional. Keeps assets only this page renders out of the
  // other three bundles.
  const extraPath = path.join(SRC, spec.file.replace('.html', '.css'));
  const extra = fs.existsSync(extraPath) ? '\n' + fs.readFileSync(extraPath, 'utf8') : '';

  const motion = spec.file === 'index.html'
    ? '<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>\n<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>'
    : '';

  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${runtimeTag(bundle.template, spec.file)}
${motion}

</head>
<body>
<x-dc>
<helmet>
<title>${spec.title}</title>
<meta name="description" content="${spec.description}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
${fontBlock(bundle.template, spec.file)}
<style>
${CSS}${extra}</style>
</helmet>

${navFor(spec.nav)}
${body}
${FOOTER}
</x-dc>
<script type="text/x-dc" data-dc-script="" data-props="{}">
${logic}</script>
</body></html>`;
}

function redirect(bundle, spec) {
  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${runtimeTag(bundle.template, spec.file)}

</head>
<body>
<x-dc>
<helmet>
<title>Moved</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${spec.to}">
${fontBlock(bundle.template, spec.file)}
<style>
${CSS}</style>
</helmet>

<main class="wrap sec" style="min-height: 60vh;">
  <h1 class="h2">This page has moved.</h1>
  <p class="body" style="margin-top: 18px;">It now lives with ${spec.label}. Taking you there.</p>
  <a href="${spec.to}" class="btn btn-primary" style="margin-top: 26px;">Continue</a>
</main>
</x-dc>
<script type="text/x-dc" data-dc-script="" data-props="{}">
class Component extends DCLogic {
  componentDidMount() {
    // replace, not assign, so the retired url does not sit in the back stack.
    window.location.replace(${JSON.stringify(spec.to)});
  }
  renderVals() { return {}; }
}</script>
</body></html>`;
}

// ---------------------------------------------------------------------------
// Guards. These fail the build rather than shipping a known-bad page.
// ---------------------------------------------------------------------------

function guard(template, file) {
  const dashes = template.match(/[–—]/g);
  if (dashes) throw new Error(`${file}: ${dashes.length} em/en dash(es) in the template`);

  // Every retired route must be gone from live markup, or the nav sends people
  // to a redirect stub instead of the real page.
  for (const dead of REDIRECTS) {
    if (template.includes(`href="${dead.file}`)) {
      throw new Error(`${file}: links to retired route ${dead.file}`);
    }
  }
}

// ---------------------------------------------------------------------------

let count = 0;

for (const spec of PAGES) {
  const bundle = loadBundle(spec.file);
  const template = page(bundle, spec);
  guard(template, spec.file);
  writeBundle(bundle, template);
  console.log(`  ${spec.file.padEnd(16)} ${template.length} bytes`);
  count++;
}

for (const spec of REDIRECTS) {
  const bundle = loadBundle(spec.file);
  const template = redirect(bundle, spec);
  writeBundle(bundle, template);
  console.log(`  ${spec.file.padEnd(16)} redirect to ${spec.to}`);
  count++;
}

console.log(`wrote ${count} pages`);
