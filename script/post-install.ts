#!/usr/bin/env ts-node
/* eslint-disable no-sync */

import * as Path from 'path'
import * as Fs from 'fs'
import { spawnSync, SpawnSyncOptions } from 'child_process'

import glob from 'glob'
import { forceUnwrap } from '../app/src/lib/fatal-error'

const root = Path.dirname(__dirname)

const options: SpawnSyncOptions = {
  cwd: root,
  stdio: 'inherit',
}

/** Check if the caller has set the OFFLINe environment variable */
function isOffline() {
  return process.env.OFFLINE === '1'
}

/** Format the arguments to ensure these work offline */
function getYarnArgs(baseArgs: Array<string>): Array<string> {
  const args = baseArgs

  if (isOffline()) {
    args.splice(1, 0, '--offline')
  }

  return args
}

function findYarnVersion(callback: (path: string) => void) {
  glob('vendor/yarn-*.js', (error, files) => {
    if (error != null) {
      throw error
    }

    // this ensures the paths returned by glob are sorted alphabetically
    files.sort()

    // use the latest version here if multiple are found
    callback(forceUnwrap('Missing vendored yarn', files.at(-1)))
  })
}

console.log('---> Running post-install script...')

findYarnVersion(path => {
  const installArgs = getYarnArgs([path, '--cwd', 'app', 'install', '--force'])

  let result = spawnSync('node', installArgs, options)

  if (result.status !== 0) {
    console.error('Failed to install app dependencies. Code:', result.status)
    process.exit(result.status || 1)
  }

  if (!isOffline()) {
    result = spawnSync(
      'git',
      ['submodule', 'update', '--recursive', '--init'],
      options
    )

    if (result.status !== 0) {
      console.error('Failed to update submodules. Code:', result.status)
      process.exit(result.status || 1)
    }
  }

  result = spawnSync('node', getYarnArgs([path, 'compile:script']), options)

  if (result.status !== 0) {
    console.error('Failed to compile app dependencies. Code:', result.status)
    process.exit(result.status || 1)
  }

  if (process.platform === 'linux') {
    result = spawnSync('node', getYarnArgs([path, 'patch-package']), options)

    if (result.status !== 0) {
      console.error('Failed to run patch-package. Code:', result.status)
      process.exit(result.status || 1)
    }
  }
})

if (process.env.FLATPAK_ID) {
  console.log('Making flatpak-specific adjustments…')

  const indexHtml = Path.join(root, 'app', 'static', 'index.html')

  if (!Fs.existsSync(indexHtml)) {
    throw new Error(`Index file not found: ${indexHtml}`)
  }
  try {
    const indexHtmlContents = Fs.readFileSync(indexHtml, 'utf8')
    const updatedIndexHtmlContents = indexHtmlContents.replace(
      'GitHub Desktop Plus',
      'Desktop Plus'
    )
    Fs.writeFileSync(indexHtml, updatedIndexHtmlContents, 'utf8')
    console.log('Successfully updated branding in index.html')
  } catch (error) {
    throw new Error(`Failed to update index.html for Flatpak build: ${error}`)
  }
}
