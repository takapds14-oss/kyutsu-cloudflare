export function onRequest({request}) {
  const url = new URL(request.url);
  url.pathname = '/handbook/';
  return Response.redirect(url.toString(),308);
}
