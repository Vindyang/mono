import React from "react";

interface MonoLogoProps {
  className?: string;
}

export function MonoLogo({ className = "size-6" }: MonoLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Abstract "M" formed by connected task boxes */}
      {/* Left vertical bar */}
      <rect x="3" y="4" width="3" height="16" rx="1" fill="currentColor" />

      {/* Middle peak - forms the M shape */}
      <path
        d="M9 4H12V12L12 20H9V12L9 4Z"
        fill="currentColor"
        opacity="0.8"
      />

      {/* Right vertical bar */}
      <rect x="18" y="4" width="3" height="16" rx="1" fill="currentColor" />

      {/* Connecting diagonal lines to form M */}
      <path
        d="M6 6L10.5 11L12 12.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <path
        d="M18 6L13.5 11L12 12.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />

      {/* Subtle checkmarks to represent completed tasks */}
      <path
        d="M4.5 10L5 10.5L5.5 10"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.5 15L20 15.5L20.5 15"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MonoLogoSimple({ className = "size-6" }: MonoLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Minimalist stacked layers - representing organized tasks/projects */}
      <rect
        x="4"
        y="8"
        width="16"
        height="3"
        rx="1.5"
        fill="currentColor"
      />
      <rect
        x="4"
        y="13"
        width="12"
        height="3"
        rx="1.5"
        fill="currentColor"
        opacity="0.6"
      />
      <rect
        x="4"
        y="18"
        width="8"
        height="3"
        rx="1.5"
        fill="currentColor"
        opacity="0.3"
      />
    </svg>
  );
}

export function MonoLogoMinimal({ className = "size-6" }: MonoLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Pure minimalist - single stroke "M" */}
      <path
        d="M5 17V7L12 14L19 7V17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
