export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractToc(markdown: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(markdown)) !== null) {
    if (!match) continue;
    const [, hashes, text] = match;
    if (!hashes || !text) continue;
    const level = hashes.length;
    const id = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff]+/g, '-')
      .replace(/^-+|-+$/g, '');
    items.push({ id, text, level });
  }
  return items;
}

export const tocFadeIn = {
  hidden: { opacity: 0, x: 12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.3 + i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  }),
};
