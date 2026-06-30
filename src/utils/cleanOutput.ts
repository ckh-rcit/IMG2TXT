export function cleanOutput(text: string, mode = 'default'): string {
  let s = text.trim()
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim()
  }
  if (mode === 'ocr') {
    s = s.replace(/^```\w*\n([\s\S]*?)```\s*$/s, '$1').replace(/```[\s\S]*$/, '').trim()
  }
  return s
}