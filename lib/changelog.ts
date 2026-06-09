import 'server-only'
import fs from 'fs/promises'
import path from 'path'

export type ChangelogEntry = {
    version: string
    title: string
    date: string | null
    groups: Array<{
        type: 'Added' | 'Changed' | 'Deprecated' | 'Removed' | 'Fixed' | 'Security'
        items: string[]
    }>
}

export type ChangelogPayload = {
    generatedAt: string
    entries: ChangelogEntry[]
}

export async function getChangelog(): Promise<ChangelogPayload | null> {
    try {
        const file = path.join(process.cwd(), 'public', 'data', 'changelog.json')
        const raw = await fs.readFile(file, 'utf8')
        return JSON.parse(raw) as ChangelogPayload
    } catch (err) {
        // File missing is expected on first run before build:changelog has executed.
        console.warn('getChangelog: could not read public/data/changelog.json', err)
        return null
    }
}
