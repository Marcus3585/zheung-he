import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { CharacterDef } from '../data/characters';

export interface DialogueChoiceView {
  key: string;
  text: string;
  hint?: string;
  disabled?: boolean;
  onSelect: () => void;
}

interface DialoguePanelProps {
  kicker: string;
  title: string;
  speaker: CharacterDef;
  text: string;
  aside?: { speaker: CharacterDef; text: string } | null;
  narration?: string;
  blurb?: string;
  blurbOpen: boolean;
  onToggleBlurb: () => void;
  attitude?: string;
  changes: string[];
  choices: DialogueChoiceView[];
  minimized: boolean;
  onToggleMinimized: () => void;
  footnote?: string;
}

const DialoguePanel: React.FC<DialoguePanelProps> = ({
  kicker,
  title,
  speaker,
  text,
  aside,
  narration,
  blurb,
  blurbOpen,
  onToggleBlurb,
  attitude,
  changes,
  choices,
  minimized,
  onToggleMinimized,
  footnote,
}) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [moreBelow, setMoreBelow] = useState(false);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const check = () => {
      setMoreBelow(el.scrollHeight - el.scrollTop - el.clientHeight > 12);
    };
    check();
    el.addEventListener('scroll', check);
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', check);
      observer.disconnect();
    };
  }, [text, narration, aside?.text, blurbOpen]);

  if (minimized) {
    return (
      <button
        type="button"
        onClick={onToggleMinimized}
        className="absolute right-3 bottom-24 z-20 pointer-events-auto bg-imperial-parchment text-imperial-ink border-2 border-imperial-ink/30 rounded-l-xl rounded-r-md shadow-xl px-3 py-4 font-serif font-bold flex items-center gap-2"
      >
        <Maximize2 size={16} />
        <span>對談</span>
      </button>
    );
  }

  return (
    <aside className="absolute right-3 top-24 bottom-3 z-20 w-[min(24rem,calc(100%-1.5rem))] pointer-events-none flex min-h-0 flex-col">
      <div className="pointer-events-auto flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border-2 border-imperial-ink/30 bg-imperial-parchment text-imperial-ink shadow-2xl font-serif">
        <div className="absolute inset-0 bg-imperial-gold/5 pointer-events-none" />
        <header className="relative z-10 flex items-start gap-3 border-b border-imperial-ink/10 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold tracking-widest text-imperial-red">{kicker}</div>
            <h2 className="text-lg font-bold leading-snug">{title}</h2>
            {attitude && <p className="mt-1 text-xs text-imperial-ink/70">{speaker.name}：{attitude}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {blurb && (
              <button
                type="button"
                onClick={onToggleBlurb}
                className="rounded px-2 py-1 text-xs font-bold text-imperial-ocean hover:bg-imperial-ocean/10"
              >
                {blurbOpen ? '收起考證' : '岸上考證'}
              </button>
            )}
            <button
              type="button"
              onClick={onToggleMinimized}
              className="rounded p-1 text-imperial-ink/60 hover:bg-white/60 hover:text-imperial-ink"
              aria-label="收起對談"
            >
              <Minimize2 size={16} />
            </button>
          </div>
        </header>

        {blurbOpen && blurb && (
          <p className="relative z-10 border-b border-imperial-ink/10 bg-white/40 px-4 py-2 text-xs leading-relaxed text-imperial-ink/80">
            {blurb}
          </p>
        )}

        <div ref={bodyRef} className="talk-scroll relative z-10 min-h-[7.5rem] flex-1 overflow-y-scroll px-4 py-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-imperial-ink/15 bg-white text-xl" aria-hidden>
              {speaker.emoji}
            </span>
            <div>
              <div className="font-bold leading-tight">{speaker.name}</div>
              {speaker.title && <div className="text-xs text-imperial-ink/60">{speaker.title}</div>}
            </div>
          </div>
          <p className="rounded-r border-l-4 border-imperial-gold bg-imperial-gold/10 px-3 py-2 text-[15px] leading-relaxed">
            {text}
          </p>
          {narration && (
            <p className="mt-3 text-sm leading-relaxed text-imperial-ink/75">{narration}</p>
          )}
          {aside && (
            <div className="mt-3 rounded-lg border border-imperial-ink/10 bg-white/70 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs font-bold text-imperial-ocean">
                <span aria-hidden>{aside.speaker.emoji}</span>
                {aside.speaker.name}
                <span className="font-normal text-imperial-ink/50">在旁邊說</span>
              </div>
              <p className="text-sm leading-relaxed">{aside.text}</p>
            </div>
          )}
          {changes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {changes.map((change) => (
                <span
                  key={change}
                  className={`rounded border px-2 py-0.5 text-xs font-bold ${
                    change.includes('-')
                      ? 'border-game-trust bg-game-trust/10 text-game-trust'
                      : 'border-game-morale bg-game-morale/10 text-game-morale'
                  }`}
                >
                  {change}
                </span>
              ))}
            </div>
          )}
        </div>
        {moreBelow && (
          <div className="relative z-10 shrink-0 border-t border-imperial-gold/40 bg-imperial-gold/15 px-3 py-1 text-center text-xs font-bold text-imperial-red">
            下面還有
          </div>
        )}

        <div className="talk-scroll relative z-10 max-h-[52%] min-h-0 shrink-0 overflow-y-auto border-t border-imperial-ink/10 bg-white/35 px-3 py-2">
          {footnote && <p className="mb-2 text-[11px] text-imperial-ink/55">{footnote}</p>}
          <div className="grid gap-2">
            {choices.map((choice) => (
              <button
                key={choice.key}
                type="button"
                disabled={choice.disabled}
                onClick={choice.onSelect}
                className={`rounded-lg border-2 px-3 py-2.5 text-left text-sm font-bold leading-snug transition-colors ${
                  choice.disabled
                    ? 'cursor-not-allowed border-gray-300 bg-gray-200 text-imperial-ink/50'
                    : 'border-imperial-ink/10 bg-white hover:border-imperial-gold hover:text-imperial-red'
                }`}
              >
                <span className="block">{choice.text}</span>
                {choice.hint && (
                  <span className={`mt-1 block text-xs font-sans font-bold ${choice.disabled ? 'text-imperial-red' : 'text-imperial-ink/50'}`}>
                    {choice.hint}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DialoguePanel;
