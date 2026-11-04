// Codemod: wrap static JSX text + common string props with tr('...')
const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const ROOT = path.resolve(__dirname, '../client/src');
const SKIP_DIRS = ['i18n', 'constants', 'theme', 'services', 'utils', 'data', 'hooks'];
const PROPS = ['title', 'subtitle', 'placeholder', 'label', 'message', 'actionLabel', 'badgeText', 'thresholdLabel', 'description'];

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (SKIP_DIRS.includes(f.name)) continue;
      walk(p, out);
    } else if (f.name.endsWith('.js') && !f.name.includes('.test.') && !/BrandLogo|SplashScreen/.test(f.name)) out.push(p);
  }
  return out;
}

const phrases = new Set();
const report = [];

function norm(s) {
  return s.replace(/\s+/g, ' ').trim();
}
function ok(s) {
  return /[A-Za-z]{2,}/.test(s) && !s.includes('&') && !s.includes('\\') && !/[{}]/.test(s);
}
const q = (s) => "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";

for (const file of walk(ROOT)) {
  let src = fs.readFileSync(file, 'utf8');
  const crlf = src.includes('\r\n');
  let count = 0;

  // 1. Static text nodes inside <Text ...>...</Text>
  src = src.replace(/(<Text\b[^<>]*?>)(\s*)([^<>{}]*[A-Za-z][^<>{}]*?)(\s*)(<\/Text>)/g, (m, open, ws1, text, ws2, close) => {
    const key = norm(text);
    if (!ok(key) || open.includes('=>')) return m;
    phrases.add(key);
    count++;
    return `${open}${ws1}{tr(${q(key)})}${ws2}${close}`;
  });

  // 2. String props: title="..." etc.
  const propRe = new RegExp(`(\\s)(${PROPS.join('|')})="([^"{}]*[A-Za-z][^"{}]*)"`, 'g');
  src = src.replace(propRe, (m, sp, prop, val) => {
    const key = norm(val);
    if (!ok(key)) return m;
    phrases.add(key);
    count++;
    return `${sp}${prop}={tr(${q(key)})}`;
  });

  if (count) {
    report.push(`${path.relative(ROOT, file)}: ${count}`);
    if (APPLY) {
      // ensure import
      const rel = path.relative(path.dirname(file), path.join(ROOT, 'i18n', 'LanguageContext')).replace(/\\/g, '/');
      const imp = rel.startsWith('.') ? rel : './' + rel;
      if (!/import\s*\{[^}]*\btr\b[^}]*\}\s*from\s*['"][^'"]*LanguageContext['"]/.test(src)) {
        if (/import\s*\{([^}]*)\}\s*from\s*['"][^'"]*LanguageContext['"]/.test(src)) {
          src = src.replace(/import\s*\{([^}]*)\}\s*from\s*(['"][^'"]*LanguageContext['"])/, (m, names, from) => `import { ${names.trim()}, tr } from ${from}`);
        } else {
          const nl = crlf ? '\r\n' : '\n';
          const lastImport = [...src.matchAll(/^import[\s\S]*?;\s*$/gm)].pop();
          const at = lastImport.index + lastImport[0].length;
          src = src.slice(0, at) + `${nl}import { tr } from '${imp}';` + src.slice(at);
        }
      }
      fs.writeFileSync(file, src);
    }
  }
}

console.log(report.join('\n'));
console.log('TOTAL phrases:', phrases.size);
fs.writeFileSync(path.resolve(__dirname, 'phrases.json'), JSON.stringify([...phrases].sort(), null, 1));
