/**
 * Cloudflare Workers entrypoint used by Sites.
 *
 * Vite emits the collection as static files. The Sites runtime binds those
 * files to `ASSETS`, so the worker only needs to pass requests through.
 */
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
