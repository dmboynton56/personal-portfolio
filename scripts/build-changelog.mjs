#!/usr/bin/env node
/**
 * Parse CHANGELOG.md into a JSON manifest at public/data/changelog.json.
 * The portfolio case study page reads this to render the changelog section.
 *
 * Format expected: h2 sections starting with [version] - description,
 * followed by ### Added / ### Changed / ### Fixed / ### Removed groups
 * with bullet items.
 */
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const changelogPath = path.join(root, 'CHANGELOG.md')
const outPath = path.join(root, 'public', 'data', 'changelog.json')

function parseChangelog(markdown) {
    const lines = markdown.split(/\r?\n/)
    const entries = []
    let currentEntry = null
    let currentGroup = null

    const headingRe = /^##\s+(?:\[[^\]]+\]\s*-?\s*)?(.*)$/
    const versionRe = /^##\s+\[([^\]]+)\](?:\s*-\s*(.*))?$/
    const groupRe = /^###\s+(Added|Changed|Deprecated|Removed|Fixed|Security)\s*$/
    const bulletRe = /^-\s+(.*)$/

    for (const raw of lines) {
        const line = raw.trimEnd()

        const versionMatch = line.match(versionRe)
        if (versionMatch) {
            if (currentEntry) entries.push(currentEntry)
            currentEntry = {
                version: versionMatch[1].trim(),
                title: (versionMatch[2] || '').trim(),
                date: null,
                groups: [],
            }
            currentGroup = null
            // Next non-empty line is sometimes a date italicized: _2026-06-05_
            continue
        }

        // Unreleased section has no version tag — capture it as a pseudo-version.
        const plainHeading = line.match(headingRe)
        if (plainHeading && !line.startsWith('###')) {
            if (currentEntry) entries.push(currentEntry)
            currentEntry = {
                version: plainHeading[1].trim(),
                title: '',
                date: null,
                groups: [],
            }
            currentGroup = null
            continue
        }

        if (!currentEntry) continue

        const groupMatch = line.match(groupRe)
        if (groupMatch) {
            currentGroup = { type: groupMatch[1], items: [] }
            currentEntry.groups.push(currentGroup)
            continue
        }

        const bulletMatch = line.match(bulletRe)
        if (bulletMatch && currentGroup) {
            currentGroup.items.push(bulletMatch[1].trim())
        }
    }

    if (currentEntry) entries.push(currentEntry)

    // Normalize versions and dates.
    // 1) If version is a date "YYYY-MM-DD", treat it as the date.
    // 2) If title starts with "YYYY-MM-DD - ...", lift the date out.
    const dateOnlyRe = /^(\d{4}-\d{2}-\d{2})$/
    for (const e of entries) {
        if (!e.date && dateOnlyRe.test(e.version)) {
            e.date = e.version
            // If we have no title, set a sensible default placeholder.
            if (!e.title) e.title = '—'
        }
        if (!e.date) {
            const dateMatch = e.title.match(/^(\d{4}-\d{2}-\d{2})\s*-?\s*(.*)$/)
            if (dateMatch) {
                e.date = dateMatch[1]
                e.title = dateMatch[2].trim() || '—'
            }
        }
    }

    return entries
}

async function main() {
    const md = await fs.readFile(changelogPath, 'utf8')
    const entries = parseChangelog(md)
    const payload = {
        generatedAt: new Date().toISOString(),
        entries,
    }
    await fs.mkdir(path.dirname(outPath), { recursive: true })
    await fs.writeFile(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf8')
    console.log(`Wrote ${entries.length} changelog entries to ${path.relative(root, outPath)}`)
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
