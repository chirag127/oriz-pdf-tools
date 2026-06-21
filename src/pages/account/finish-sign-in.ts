import type { APIRoute } from 'astro'
export const GET: APIRoute = ({ url }) =>
  new Response(null, {
    status: 302,
    headers: { Location: `https://auth.oriz.in/finish-sign-in${url.search}` },
  })
