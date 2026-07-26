// Slim re-export shim — real AI code lives in /packages/ai.
// Only import from server-side call sites. Do NOT import this from a client component.
export { llmChat, generateArticle, coverImageFor } from '@/packages/ai';
export { generateSocial } from '@/packages/social';
export { slugify, pollinationsUrl } from '@/packages/utils';
