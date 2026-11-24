import 'server-only'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { getIdentity } from './server.mjs'
import { requireRole } from '../domain.mjs'

export const currentIdentity = cache(async () => getIdentity(await headers()))

export async function pageIdentity(allowed) {
  const identity = await currentIdentity()
  if (!identity) redirect('/')
  requireRole(identity, allowed)
  return identity
}
