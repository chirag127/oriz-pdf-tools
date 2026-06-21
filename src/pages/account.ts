import type { APIRoute } from 'astro'
export const GET: APIRoute = () =>
  new Response(null, { status: 302, headers: { Location: 'https://auth.oriz.in/account' } })
