/**
 * Shared provider utilities.
 *
 * @module providers/utils
 */

/**
 * Prefixes that indicate internal/system content which should be hidden from the UI.
 * @type {readonly string[]}
 */
export const INTERNAL_CONTENT_PREFIXES = Object.freeze([
  '<command-name>',
  '<command-message>',
  '<command-args>',
  '<local-command-stdout>',
  '<system-reminder>',
  'Caveat:',
  'This session is being continued from a previous',
  '[Request interrupted',
]);

/**
 * Check if user text content is internal/system that should be skipped.
 * @param {string} content
 * @returns {boolean}
 */
export function isInternalContent(content) {
  return INTERNAL_CONTENT_PREFIXES.some(prefix => content.startsWith(prefix));
}

/**
 * Strip the image-note framing the server appends to user commands before
 * sending them to the Claude SDK (see claude-sdk.js::handleImages). The note
 * looks like "\n\n[Images provided at the following paths:]\n1. /path" and is
 * internal plumbing, not user-authored text — it should not appear in the UI.
 * @param {string} content
 * @returns {string}
 */
export function stripImageNote(content) {
  if (!content) return content;
  return content.replace(/\n\n\[Images provided at the following paths:\][\s\S]*$/, '');
}
