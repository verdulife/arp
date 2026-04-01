import type { PageLoad } from './$types'
import { getTool } from '$lib/registry'
import { error } from '@sveltejs/kit'

export const load: PageLoad = ({ params }) => {
  const tool = getTool(params.slug)
  if (!tool) error(404, `Herramienta "${params.slug}" no encontrada`)
  return { tool }
}