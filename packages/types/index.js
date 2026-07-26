// Type shapes for the app. Written as JSDoc for zero-runtime cost.
// Convert to TypeScript when promoting to full monorepo.

/**
 * @typedef {Object} Article
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string} section
 * @property {string=} categoryId
 * @property {string=} excerpt
 * @property {string=} content
 * @property {string=} coverImage
 * @property {string[]=} hashtags
 * @property {Object=} seo
 * @property {Object=} socialPosts
 * @property {'draft'|'scheduled'|'published'|'archived'} status
 * @property {Date=} publishedAt
 * @property {Date=} scheduledFor
 * @property {string=} authorId
 * @property {string=} provider
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} JournalEntry
 * @property {string} id
 * @property {string=} userId
 * @property {string=} title
 * @property {string=} content
 * @property {string=} mood
 * @property {string[]=} photos
 * @property {string=} voiceNoteUrl
 * @property {string=} reflections
 * @property {string=} lessons
 * @property {string[]=} memories
 * @property {Date} entryDate
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} SocialQueueItem
 * @property {string} id
 * @property {string} articleId
 * @property {'linkedin'|'instagram'|'twitter'|'threads'} platform
 * @property {any} content
 * @property {'pending'|'scheduled'|'posting'|'posted'|'failed'|'cancelled'} status
 * @property {Date=} scheduledAt
 * @property {Date=} postedAt
 */

export const ArticleStatus = ['draft', 'scheduled', 'published', 'archived'];
export const Platforms = ['linkedin', 'instagram', 'twitter', 'threads', 'facebook'];
export const Moods = ['radiant', 'calm', 'focused', 'restless', 'heavy'];
