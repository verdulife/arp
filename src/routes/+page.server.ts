import { redirect } from '@sveltejs/kit'
import { resolve } from '$app/paths'
import { registry } from '$lib/registry'

export function load() {
	redirect(307, resolve(`/tools/${registry[0].slug}`))
}