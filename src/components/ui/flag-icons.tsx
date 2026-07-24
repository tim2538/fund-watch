import * as React from "react";

/** Outline flag of the United Kingdom (used for the EN language option). */
export function FlagEN({ className }: { className?: string }) {
  const id = React.useId();
  return (
    <svg viewBox="0 0 30 30" className={className} aria-hidden="true">
      <clipPath id={id}>
        <rect width="30" height="30" rx="5" />
      </clipPath>
      <clipPath id={`${id}-tri`}>
        <path d="M15,15 h15 v15 z v15 h-15 z h-15 v-15 z v-15 h15 z" />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <rect width="30" height="30" fill="#012169" />
        <path d="M0,0 L30,30 M30,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path
          d="M0,0 L30,30 M30,0 L0,30"
          clipPath={`url(#${id}-tri)`}
          stroke="#C8102E"
          strokeWidth="4"
        />
        <path d="M15,0 v30 M0,15 h30" stroke="#fff" strokeWidth="10" />
        <path d="M15,0 v30 M0,15 h30" stroke="#C8102E" strokeWidth="6" />
        <rect
          x="0.5"
          y="0.5"
          width="29"
          height="29"
          rx="4.5"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.25"
        />
      </g>
    </svg>
  );
}

/** Outline flag of Thailand (used for the TH language option). */
export function FlagTH({ className }: { className?: string }) {
  const id = React.useId();
  return (
    <svg viewBox="0 0 30 30" className={className} aria-hidden="true">
      <clipPath id={id}>
        <rect width="30" height="30" rx="5" />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <rect width="30" height="30" fill="#A51931" />
        <rect y="5" width="30" height="20" fill="#F4F5F8" />
        <rect y="10" width="30" height="10" fill="#2D2A4A" />
        <rect
          x="0.5"
          y="0.5"
          width="29"
          height="29"
          rx="4.5"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.25"
        />
      </g>
    </svg>
  );
}
