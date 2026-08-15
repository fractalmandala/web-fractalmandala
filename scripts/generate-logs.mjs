#!/usr/bin/env node

/**
 * Daily Log Generator
 * Extracts browsing, development, and agent activity from local data sources
 * and produces structured JSON logs per day.
 *
 * Usage: node scripts/generate-logs.mjs [--date YYYY-MM-DD] [--range START END]
 *
 * Output: data/daily-logs/*.json + data/daily-logs/index.json
 * (consumed by src/routes/api/logs/+server.ts and DailyLogViewer.svelte)
 */

import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { homedir } from 'node:os'

// ─── Paths ───────────────────────────────────────────────────────────────────

const HISTORY_DB = '/Users/amrit/mandala/History'
const HOME = homedir()
const OUTPUT_DIR = join(import.meta.dirname, '..', 'data', 'daily-logs')
const PROJECT_ROOT = '/Users/amrit/mandala'

const START_DATE = new Date('2026-06-01T00:00:00')
const END_DATE   = new Date('2026-08-13T23:59:59')

// ─── Browsing classification ─────────────────────────────────────────────────

const NOISE_DOMAINS = new Set([
  'duckduckgo.com', 'google.com', 'bing.com', 'search.brave.com',
  'localhost', '127.0.0.1', 'newtab', 'chrome-search', 'about',
  'ogs.google.com', 'ogs-edge.google.com',
])

const DOMAIN_CATEGORIES = {
  svelte: [
    'svelte.dev', 'svelte-5-preview.vercel.app', 'kit.svelte.dev',
    'sveltesociety.dev', 'github.com/sveltejs',
  ],
  'ai-agent': [
    'openai.com', 'anthropic.com', 'claude.ai', 'chatgpt.com',
    'opencode.ai', 'codex.dev', 'huggingface.co', 'deepgram.com',
    'together.ai', 'replicate.com', 'ollama.com', 'llm.datasette.io',
    'qoder.ai', 'codium.ai', 'cursor.com', 'aider.chat', 'aider.io',
    'github.com/copilot', 'github.com/openai', 'github.com/anthropics',
    'github.com/nicepkg', 'github.com/paul-gauthier',
    'platform.openai.com', 'docs.anthropic.com',
  ],
  design: [
    'figma.com', 'dribbble.com', 'behance.net', 'awwwards.com',
    'mobbin.com', 'mobbin.design', 'ui.shadcn.com', 'shadcn.com',
    'radix-ui.com', 'melt-ui.com', 'bits-ui.com',
    'fontshare.com', 'fonts.google.com', 'typography.com',
    'unblast.com', 'freepik.com',
  ],
  tooling: [
    'prettier.io', 'eslint.org', 'vitejs.dev', 'vitest.dev',
    'playwright.dev', 'turbo.build', 'pnpm.io',
    'github.com/vitejs', 'github.com/vitest-dev',
  ],
  devdocs: [
    'developer.mozilla.org', 'mdn.io', 'nodejs.org', 'npmjs.com',
    'typescriptlang.org', 'caniuse.com', 'stackoverflow.com',
    'devdocs.io', 'vercel.com/docs', 'docs.tauri.app',
    'tauri.app', 'github.com/tauri-apps',
  ],
}

function getDomain(url) {
  try {
    const u = new URL(url)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function categorizeUrl(url, title) {
  if (url.startsWith('file://')) {
    const t = (title || url).toLowerCase()
    if (t.includes('svelte') || t.includes('fractal') || t.includes('mandala') || t.includes('flow-map'))
      return { category: 'internal', tags: ['local-file', 'project'] }
    return { category: 'internal', tags: ['local-file'] }
  }
  const domain = getDomain(url)
  for (const [cat, domains] of Object.entries(DOMAIN_CATEGORIES)) {
    if (domains.some(d => domain === d || domain.endsWith('.' + d))) {
      return { category: cat, tags: [cat, domain] }
    }
  }
  if (domain.includes('github.com')) return { category: 'github', tags: ['github'] }
  if (domain.includes('medium.com') || domain.includes('substack.com') || domain.includes('dev.to'))
    return { category: 'reading', tags: ['article'] }
  if (domain.includes('youtube.com') || domain.includes('youtu.be'))
    return { category: 'video', tags: ['youtube'] }
  return { category: 'other', tags: [domain] }
}

// ─── Date helpers ────────────────────────────────────────────────────────────

function fmtDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function daysBetween(start, end) {
  const days = []
  const cur = new Date(start)
  while (cur <= end) {
    days.push(new Date(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

function toChromeEpoch(jsDate) {
  return (BigInt(jsDate.getTime()) + 11644473600000n) * 1000n
}

function chromeEpochToJsDate(ce) {
  return new Date(Number(ce / 1000n - 11644473600000n))
}

// ─── Data extractors ─────────────────────────────────────────────────────────

function extractBrowsing(date) {
  const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0)
  const dayEnd   = new Date(date); dayEnd.setHours(23, 59, 59, 999)
  const startCe  = toChromeEpoch(dayStart)
  const endCe    = toChromeEpoch(dayEnd)

  const sql = `
    SELECT u.url, u.title, u.visit_count,
           MIN(v.visit_time) as first_visit,
           MAX(v.visit_time) as last_visit,
           SUM(v.visit_duration) as total_duration,
           COUNT(v.id) as page_views
    FROM urls u JOIN visits v ON u.id = v.url
    WHERE v.visit_time >= ${startCe} AND v.visit_time <= ${endCe}
    GROUP BY u.id ORDER BY first_visit;`

  let rows
  try {
    const raw = execSync(`sqlite3 -separator '|||' "${HISTORY_DB}" "${sql.trim()}"`,
      { encoding: 'utf-8', timeout: 30000 })
    rows = raw.trim().split('\n').filter(Boolean)
  } catch { return { entries: [], stats: { total_visits: 0, unique_urls: 0 } } }

  const entries = []
  let totalVisits = 0

  for (const row of rows) {
    const [url, title, vc, fv, lv, dur, pv] = row.split('|||')
    if (!url) continue
    const domain = getDomain(url)
    if (NOISE_DOMAINS.has(domain)) continue

    const { category, tags } = categorizeUrl(url, title)
    const visitCount = parseInt(vc) || 1
    totalVisits += parseInt(pv) || 1

    const ts = fv ? chromeEpochToJsDate(BigInt(fv)) : dayStart
    entries.push({
      id: `b_${entries.length.toString().padStart(3, '0')}`,
      timestamp: ts.toISOString(),
      url, title: title || domain, domain, category, tags,
      visit_count: visitCount,
      page_views: parseInt(pv) || 1,
      duration_ms: parseInt(dur) / 1000 || 0,
      relevance: ['svelte', 'ai-agent', 'design'].includes(category) ? 'high'
        : ['tooling', 'devdocs', 'internal'].includes(category) ? 'medium' : 'low',
      summary: title || domain,
    })
  }

  entries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  entries.forEach((e, i) => { e.id = `b_${i.toString().padStart(3, '0')}` })

  const relevant = entries.filter(e => e.relevance !== 'low')
  return { entries: relevant, stats: { total_visits: totalVisits, unique_urls: entries.length } }
}

function extractGitCommits(date) {
  const ds = fmtDate(date)
  const de = fmtDate(new Date(date.getTime() + 86400000))

  let output
  try {
    output = execSync(
      `git -C "${PROJECT_ROOT}" log --all --format="%H|||%h|||%s|||%an|||%aI|||%d" --since="${ds}T00:00:00" --until="${de}T00:00:00"`,
      { encoding: 'utf-8', timeout: 15000 })
  } catch { return [] }

  const commits = []
  for (const line of output.trim().split('\n').filter(Boolean)) {
    const [hash, short, message, author, ts, refs] = line.split('|||')
    let branch = 'unknown'
    const bm = (refs || '').match(/HEAD -> ([^,)]+)/)
    if (bm) branch = bm[1]
    else {
      const rm = (refs || '').match(/([^,)]+)/)
      if (rm) branch = rm[1].trim()
    }
    const tm = message.match(/^(\w+)(?:\(([^)]+)\))?:/)
    commits.push({ hash, short_hash: short, message, author, branch,
      timestamp: ts, type: tm?.[1] || 'other', scope: tm?.[2] || null,
      workspace: inferWorkspace(branch, message) })
  }
  return commits
}

function inferWorkspace(branch, message) {
  const m = (branch || '').match(/^feat\/([^/]+)/)
  if (m) return m[1].replace(/-/g, ' ')
  const sm = (message || '').match(/(?:feat|fix|chore|docs|refactor)\(([^)]+)\)/)
  if (sm) return sm[1]
  return null
}

function extractBranches(date) {
  const ds = fmtDate(date)
  const de = fmtDate(new Date(date.getTime() + 86400000))
  let output
  try {
    output = execSync(
      `git -C "${PROJECT_ROOT}" reflog --format="%gd|||%gs|||%ci" --since="${ds}T00:00:00" --until="${de}T00:00:00"`,
      { encoding: 'utf-8', timeout: 15000 })
  } catch { return [] }

  const branches = new Map()
  for (const line of output.trim().split('\n').filter(Boolean)) {
    const [, gs, ci] = line.split('|||')
    const mm = gs.match(/merge ([^ :]+).*finished/)
    if (mm) {
      const name = mm[1]
      if (!branches.has(name)) {
        branches.set(name, { name, status: 'merged', merged_at: ci,
          description: name.replace(/^feat\//, '').replace(/-/g, ' ') })
      }
    }
  }
  return [...branches.values()]
}

function readJsonl(path) {
  if (!existsSync(path)) return []
  const content = readFileSync(path, 'utf-8').trim()
  return content.split('\n').filter(Boolean).map(l => {
    try { return JSON.parse(l) } catch { return null }
  }).filter(Boolean)
}

function extractClaudeSessions(date) {
  const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0)
  const dayEnd   = new Date(date); dayEnd.setHours(23, 59, 59, 999)
  const projDir = join(HOME, '.claude/projects')
  if (!existsSync(projDir)) return []

  const sessions = []
  const projectDirs = readdirSync(projDir).filter(d => {
    try { return statSync(join(projDir, d)).isDirectory() } catch { return false }
  })

  for (const dir of projectDirs) {
    const files = readdirSync(join(projDir, dir)).filter(f => f.endsWith('.jsonl'))
    for (const file of files) {
      const lines = readJsonl(join(projDir, dir, file))
      if (!lines.length) continue

      const timestamps = lines
        .map(l => l.timestamp ? new Date(l.timestamp) : null)
        .filter(t => t && !isNaN(t.getTime()))
      if (!timestamps.length) continue

      const first = new Date(Math.min(...timestamps))
      const last  = new Date(Math.max(...timestamps))

      // Session overlaps with our date
      if (last < dayStart || first > dayEnd) continue

      const dayLines = lines.filter(l => {
        if (!l.timestamp) return false
        const t = new Date(l.timestamp)
        return t >= dayStart && t <= dayEnd
      })
      if (!dayLines.length) continue

      const userMsgs = dayLines.filter(l => l.type === 'human' || l.role === 'human' || l.display)
      const topics = userMsgs.slice(0, 5).map(l => l.display || l.text || '').filter(t => t.length > 0 && t.length < 150)
      const duration = (last.getTime() - first.getTime()) / 60000

      sessions.push({
        id: `claude_${sessions.length}`,
        host: 'claude-code',
        project: dir.replace(/-/g, '/').replace(/^\//, '/'),
        session_id: file.replace('.jsonl', '').slice(0, 12) + '...',
        started_at: first.toISOString(),
        ended_at: last.toISOString(),
        duration_minutes: Math.round(duration),
        topic: topics[0] || `${dayLines.length} messages`,
        messages: dayLines.length,
        key_actions: topics.slice(0, 4),
      })
    }
  }
  return sessions
}

function extractCodexSessions(date) {
  const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0)
  const dayEnd   = new Date(date); dayEnd.setHours(23, 59, 59, 999)
  const sessions = []

  // session_index.jsonl — named threads
  const indexPath = join(HOME, '.codex/session_index.jsonl')
  if (existsSync(indexPath)) {
    for (const entry of readJsonl(indexPath)) {
      if (!entry.updated_at) continue
      const updated = new Date(entry.updated_at)
      if (updated < dayStart || updated > dayEnd) continue
      sessions.push({
        id: `codex_${sessions.length}`,
        host: 'codex-cli',
        project: 'unknown',
        session_id: (entry.id || '').slice(0, 16) + '...',
        started_at: entry.updated_at,
        duration_minutes: null,
        topic: entry.thread_name || 'Unknown',
        messages: null,
        key_actions: [],
      })
    }
  }

  // history.jsonl — individual commands
  const histPath = join(HOME, '.codex/history.jsonl')
  if (existsSync(histPath)) {
    const cmds = readJsonl(histPath).filter(e => {
      if (!e.ts) return false
      const t = new Date(e.ts * 1000)
      return t >= dayStart && t <= dayEnd
    })
    if (cmds.length) {
      sessions.push({
        id: `codex_hist`,
        host: 'codex-cli-history',
        project: 'various',
        session_id: 'history',
        started_at: new Date(cmds[0].ts * 1000).toISOString(),
        duration_minutes: cmds.length > 1
          ? Math.round((cmds[cmds.length - 1].ts - cmds[0].ts) / 60) : null,
        topic: `${cmds.length} commands`,
        messages: cmds.length,
        key_actions: cmds.slice(0, 5).map(c => c.text || '').filter(Boolean),
      })
    }
  }

  return sessions
}

function extractHandoffs(date) {
  const ds = fmtDate(date)
  const dir = join(PROJECT_ROOT, 'handoffs')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter(f => f.startsWith(ds) && f.endsWith('.md'))
    .map(f => {
      const content = readFileSync(join(dir, f), 'utf-8')
      const hm = content.match(/^#\s+(.+)$/m)
      return {
        file: f,
        topic: hm?.[1]?.replace(/^Daily .*?—\s*/, '') || f.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace('.md', '').replace(/-/g, ' '),
        status: /TODO|action/i.test(content) ? 'actionable' : 'context',
      }
    })
}

// ─── Theme extraction ────────────────────────────────────────────────────────

function extractThemes(browsing, commits, sessions) {
  const themes = []
  const catCount = {}
  for (const e of browsing) {
    if (e.relevance === 'low') continue
    catCount[e.category] = (catCount[e.category] || 0) + 1
  }
  for (const [cat, count] of Object.entries(catCount)) {
    if (count >= 2) {
      themes.push({
        label: cat.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        confidence: Math.min(0.95, 0.3 + count * 0.1),
        evidence: browsing.filter(e => e.category === cat).slice(0, 3).map(e => e.title || e.url),
      })
    }
  }

  const scopes = {}
  for (const c of commits) {
    const key = c.workspace || c.scope || 'general'
    if (key === 'unknown') continue
    if (!scopes[key]) scopes[key] = { count: 0, branch: c.branch }
    scopes[key].count++
  }
  for (const [scope, data] of Object.entries(scopes)) {
    const clean = scope.replace(/^\(refs\//, '').replace(/\/stash$/, '').trim()
    if (!clean || clean.length < 2) continue
    if (data.count >= 1) {
      themes.push({
        label: `Dev: ${clean}`,
        confidence: Math.min(0.95, 0.4 + data.count * 0.15),
        evidence: commits.filter(c => (c.scope || c.branch).includes(scope)).slice(0, 3).map(c => c.message),
      })
    }
  }
  return themes
}

// ─── Per-day log builder ─────────────────────────────────────────────────────

function buildLog(date) {
  const browsing   = extractBrowsing(date)
  const commits    = extractGitCommits(date)
  const branches   = extractBranches(date)
  const claudeSess = extractClaudeSessions(date)
  const codexSess  = extractCodexSessions(date)
  const handoffs   = extractHandoffs(date)
  const allSessions = [...claudeSess, ...codexSess]
  const themes     = extractThemes(browsing.entries, commits, allSessions)

  const sessionCounts = {}
  for (const s of allSessions) sessionCounts[s.host] = (sessionCounts[s.host] || 0) + 1

  const firstAct = browsing.entries[0]?.timestamp || null
  const lastAct  = browsing.entries.at(-1)?.timestamp || null

  return {
    $schema: 'daily-log-v1',
    date: fmtDate(date),
    day_of_week: date.toLocaleDateString('en-US', { weekday: 'long' }),
    meta: {
      generated_at: new Date().toISOString(),
      sources: ['browser-history', ...(claudeSess.length ? ['claude-code'] : []),
        ...(codexSess.length ? ['codex-cli'] : []), ...(commits.length ? ['git'] : [])],
    },
    stats: {
      browser: {
        total_visits: browsing.stats.total_visits,
        unique_urls: browsing.stats.unique_urls,
        first_activity: firstAct,
        last_activity: lastAct,
      },
      development: {
        commits: commits.length,
        branches_merged: branches.length,
        handoffs_written: handoffs.length,
      },
      agent_sessions: {
        ...sessionCounts,
        total: allSessions.length,
      },
    },
    browsing: browsing.entries,
    development: { commits, branches, agent_sessions: allSessions },
    handoffs,
    themes,
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const argIdx = process.argv.indexOf('--date')
  let startDate = START_DATE, endDate = END_DATE

  if (argIdx !== -1 && process.argv[argIdx + 1]) {
    const d = new Date(process.argv[argIdx + 1] + 'T00:00:00')
    startDate = d
    endDate = new Date(d.getTime() + 86400000 - 1)
  }

  mkdirSync(OUTPUT_DIR, { recursive: true })

  const days = daysBetween(startDate, endDate)
  console.log(`Generating ${days.length} daily logs: ${fmtDate(startDate)} → ${fmtDate(endDate)}`)

  const index = []
  for (const day of days) {
    const log  = buildLog(day)
    const file = `${fmtDate(day)}.json`
    writeFileSync(join(OUTPUT_DIR, file), JSON.stringify(log, null, 2))
    index.push({ date: log.date, day_of_week: log.day_of_week, file,
      browsing_entries: log.browsing.length, commits: log.development.commits.length,
      agent_sessions: log.development.agent_sessions.length, handoffs: log.handoffs.length })
    console.log(`  ${log.date} (${log.day_of_week.slice(0, 3)}): ` +
      `${log.browsing.length} browse, ${log.development.commits.length} commits, ` +
      `${log.development.agent_sessions.length} sessions, ${log.handoffs.length} handoffs`)
  }

  writeFileSync(join(OUTPUT_DIR, 'index.json'), JSON.stringify({
    $schema: 'daily-log-index-v1',
    generated_at: new Date().toISOString(),
    date_range: { start: fmtDate(startDate), end: fmtDate(endDate) },
    total_days: days.length,
    days: index,
  }, null, 2))

  console.log(`\nDone! ${days.length} logs written to ${OUTPUT_DIR}`)
}

main()
