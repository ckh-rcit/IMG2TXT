export function cleanOutput(text: string, mode = 'default'): string {
  let s = text.trim()
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim()
  }

  // Remove fenced blocks if the model wraps its answer.
  s = s.replace(/^```\w*\n([\s\S]*?)```\s*$/s, '$1').trim()

  if (mode === 'ocr') {
    s = s.replace(/^```\w*\n([\s\S]*?)```\s*$/s, '$1').replace(/```[\s\S]*$/, '').trim()
  }

  if (mode === 'flux1' || mode === 'flux2') {
    // Strip common markdown/list/label artifacts from generated prompts.
    s = s
      .replace(/^\s{0,3}[-*+]\s+/gm, '')
      .replace(/^\s{0,3}\d+\.\s+/gm, '')
      .replace(/^\s{0,3}#{1,6}\s+/gm, '')
      .replace(/\b(subject|action|location|style|camera(?:\s+settings)?|lighting|colors?|effects?|context|additional\s+elements)\s*:\s*/gi, '')
      .replace(/[\u2013\u2014]/g, ', ')
      .replace(/\b(e\.g\.|i\.e\.|etc\.?)(?=\s|$)/gi, '')
      .replace(/\s+/g, ' ')
      .replace(/\s+,/g, ',')
      .replace(/,{2,}/g, ',')
      .replace(/\s+([.;:!?])/g, '$1')
      .trim()
  }

  return s
}
