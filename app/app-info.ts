import { getSHA } from './git-info'
import { getUpdatesURL, getChannel } from '../script/dist-info'
import { version, productName } from './package.json'

const devClientId = '3a723b10ac5575cc5bb9'
const devClientSecret = '22c34d87789a365981ed921352a7b9a8c3f69d54'
const devClientIdBitbucket = 'Cu6ZDZgjKEAMEj45cg'
const devClientSecretBitbucket = 'DYGdmTAJKdk2YsX4Lch5M2ghtCMeCZry'

const channel = getChannel()

const s = JSON.stringify

export function getReplacements() {
  const isDevBuild = channel === 'development'

  return {
    __OAUTH_CLIENT_ID__: s(process.env.DESKTOP_OAUTH_CLIENT_ID || devClientId),
    __OAUTH_SECRET__: s(
      process.env.DESKTOP_OAUTH_CLIENT_SECRET || devClientSecret
    ),
    __OAUTH_CLIENT_ID_BITBUCKET__: s(
      process.env.DESKTOP_OAUTH_CLIENT_ID_BITBUCKET || devClientIdBitbucket
    ),
    __OAUTH_SECRET_BITBUCKET__: s(
      process.env.DESKTOP_OAUTH_CLIENT_SECRET_BITBUCKET ||
        devClientSecretBitbucket
    ),
    __DARWIN__: process.platform === 'darwin',
    __WIN32__: process.platform === 'win32',
    __LINUX__: process.platform === 'linux',
    __FLATPAK__:
      process.platform === 'linux' && process.env.FLATPAK_ID !== undefined,
    __APP_NAME__: s(productName),
    __APP_VERSION__: s(version),
    __DEV__: isDevBuild,
    __DEV_SECRETS__: isDevBuild || !process.env.DESKTOP_OAUTH_CLIENT_SECRET,
    __RELEASE_CHANNEL__: s(channel),
    __UPDATES_URL__: s(getUpdatesURL()),
    __SHA__: s(getSHA()),
    'process.platform': s(process.platform),
    'process.env.NODE_ENV': s(process.env.NODE_ENV || 'development'),
    'process.env.TEST_ENV': s(process.env.TEST_ENV),
  }
}
