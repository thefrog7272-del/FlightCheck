/**
 * Thin module-level event bus for the scratchpad.
 * Allows the voice hook (deep in the tree) to control the scratchpad
 * (mounted at the Layout level) without prop-drilling.
 *
 * Usage:
 *   dispatchScratchpadEvent('toggle')   — show/hide
 *   dispatchScratchpadEvent('erase')    — clear text
 */

export type ScratchpadAction = 'toggle' | 'erase' | 'stop-voice' | 'dictate' | 'dictate-start' | 'dictate-stop' | 'voice-start' | 'voice-stop';

const EVENT_NAME = 'flightcheck:scratchpad';

export function dispatchScratchpadEvent(action: ScratchpadAction) {
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { action } }));
}

export function subscribeScratchpadEvents(
  handler: (action: ScratchpadAction) => void,
): () => void {
  const listener = (e: Event) => {
    const detail = (e as CustomEvent<{ action: ScratchpadAction }>).detail;
    handler(detail.action);
  };
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
