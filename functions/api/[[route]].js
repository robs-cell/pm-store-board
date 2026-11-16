// Cloudflare Pages Function: sends every /api/* request to the shared handler.
import { handleApi } from "../../src/api.js";

export const onRequest = (context) =>
  handleApi(context.request, context.env, { waitUntil: (p) => context.waitUntil(p) });
