import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, relative, join, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const manifest = JSON.parse(readFileSync(join(root, 'tools/skills-sources.json'), 'utf8'))

function inventory(directory, base = directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    assert(!entry.isSymbolicLink(), `Unexpected link: ${path}`)
    return entry.isDirectory() ? inventory(path, base) : [relative(base, path).split(sep).join('/')]
  }).sort()
}

assert.equal(manifest.skills.length, 7)
for (const skill of manifest.skills) {
  assert(/^[a-f0-9]{40}$/.test(skill.commit))
  const expected = Object.keys(skill.files).sort()
  for (const folder of ['.agents/skills', '.claude/skills']) {
    const directory = resolve(root, folder, skill.name)
    assert.deepEqual(inventory(directory), expected, `Incomplete skill: ${folder}/${skill.name}`)
    for (const [file, hash] of Object.entries(skill.files)) {
      assert.equal(createHash('sha256').update(readFileSync(join(directory, file))).digest('hex'), hash, `Changed file: ${skill.name}/${file}`)
    }
  }
}
const skillNames = (folder) => readdirSync(join(root, folder), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()
assert.deepEqual(skillNames('.agents/skills'), skillNames('.claude/skills'))
assert.equal(skillNames('.agents/skills').length, 13)

for (const name of skillNames('.agents/skills')) {
  const source = join(root, '.agents/skills', name)
  const destination = join(root, '.claude/skills', name)
  assert.deepEqual(inventory(source), inventory(destination))
  for (const file of inventory(source)) {
    assert(readFileSync(join(source, file)).equals(readFileSync(join(destination, file))), `Divergent copy: ${name}/${file}`)
  }
}
console.log('13 skills por cliente; 7 oficiales verificadas contra sus hashes y procedencia.')
