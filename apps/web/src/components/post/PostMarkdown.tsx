import { useMemo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/atom-one-dark.css';

const REMARK_PLUGINS = [remarkGfm, remarkMath];
const REHYPE_PLUGINS = [rehypeHighlight, rehypeKatex];

export function usePostMarkdownComponents() {
  return useMemo(
    () => ({
      h2: ({ children, ...props }: React.ComponentPropsWithoutRef<'h2'>) => {
        const text = String(children).replace(/[*_`#]/g, '').trim();
        const headingId = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '');
        return <h2 id={headingId} className="scroll-mt-20" {...props}>{children}</h2>;
      },
      h3: ({ children, ...props }: React.ComponentPropsWithoutRef<'h3'>) => {
        const text = String(children).replace(/[*_`#]/g, '').trim();
        const headingId = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '');
        return <h3 id={headingId} className="scroll-mt-20" {...props}>{children}</h3>;
      },
      pre: ({ children, ...props }: React.ComponentPropsWithoutRef<'pre'> & { children?: React.ReactNode }) => {
        return <pre className="not-prose" {...props}>{children}</pre>;
      },
      code: ({ className, children, ...props }: React.ComponentPropsWithoutRef<'code'> & { children?: React.ReactNode }) => {
        const isInline = !className;
        if (isInline) {
          return <code className="rounded bg-muted px-1 py-0.5 text-[13px]" {...props}>{children}</code>;
        }
        return <code className={className} {...props}>{children}</code>;
      },
    }),
    [],
  );
}

interface PostMarkdownProps {
  content: string;
}

export function PostMarkdown({ content }: PostMarkdownProps) {
  const components = usePostMarkdownComponents();

  return (
    <Markdown remarkPlugins={REMARK_PLUGINS} rehypePlugins={REHYPE_PLUGINS} components={components}>
      {content}
    </Markdown>
  );
}
