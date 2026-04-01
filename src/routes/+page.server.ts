import { redirect } from '@sveltejs/kit'
import { registry } from '$lib/registry'

export function load() {
	redirect(307, `/tools/${registry[0].slug}`)
}