import React from 'react';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  align = 'center',
  className = '',
}) => {
  const alignClass = align === 'left' ? 'text-left items-start' : 'text-center items-center';

  return (
    <div className={`flex flex-col ${alignClass} ${className}`.trim()}>
      {eyebrow ? (
        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs tracking-[0.35em] text-white/70 backdrop-blur">
          <span className="text-mystic-gold font-semibold tracking-[0.25em]">{eyebrow}</span>
          <span className="h-3 w-px bg-white/10" />
          <span>GUIDE</span>
        </div>
      ) : null}

      <h2 className="mt-6 text-[clamp(1.75rem,4vw,2.5rem)] font-semibold text-white tracking-[0.15em]">
        {title}
      </h2>

      {description ? (
        <p className="mt-4 max-w-2xl text-white/70 leading-relaxed">
          {description}
        </p>
      ) : null}

      <div className={`mt-8 h-px w-24 bg-gradient-to-r from-transparent via-mystic-gold/70 to-transparent ${align === 'left' ? 'self-start' : ''}`} />
    </div>
  );
};

export default SectionHeader;

