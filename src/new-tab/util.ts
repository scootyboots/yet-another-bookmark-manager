export const PROMPT_OPEN_SELECTOR = '[data-prompt-open="true"]'

export function checkPromptOpen() {
  const el = document.querySelector(PROMPT_OPEN_SELECTOR)
  return Boolean(el)
}
