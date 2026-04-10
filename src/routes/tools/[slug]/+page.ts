import type { PageLoad } from './$types'
import { getTool, toolModules } from '$lib/registry'
import { error } from '@sveltejs/kit'

export const load: PageLoad = async ({ params, url }) => {
  const tool = getTool(params.slug)
  if (!tool) error(404, `Herramienta "${params.slug}" no encontrada`)

  const loader = toolModules[params.slug]
  const toolModule = loader ? (await loader()).default : null

  return { tool, toolModule, urlParams: url.searchParams }
}