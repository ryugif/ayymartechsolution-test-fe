import { Streamdown } from 'streamdown';

/** Render assistant text as Markdown. Safe while the text is still streaming. */
export function Markdown({ children }: { children: string }) {
  return <Streamdown>{children}</Streamdown>;
}