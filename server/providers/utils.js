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

/**
 * Strip the thinking-mode prefix the composer prepends when the user selects
 * a Think/Ultrathink mode. Prefixes come from
 * src/components/chat/constants/thinkingModes.ts and are appended as
 * `${prefix}: ${userText}` before being sent to the SDK. Claude Code treats
 * these as budget-trigger magic words, never as user-authored text, so they
 * should not render in the user's chat bubble.
 * @param {string} content
 * @returns {string}
 */
export function stripThinkingPrefix(content) {
  if (!content) return content;
  return content.replace(/^(think harder|think hard|ultrathink|think): /, '');
}

/**
 * Apply all internal framing strippers (image note, thinking prefix).
 * @param {string} content
 * @returns {string}
 */
export function stripInternalFraming(content) {
  if (!content) return content;
  return stripThinkingPrefix(stripImageNote(content));
}
