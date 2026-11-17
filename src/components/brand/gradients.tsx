/** Brand SVG gradients, defined once per page so every icon can reference them safely. */
export function BrandGradients() {
  return (
    <svg width="0" height="0" aria-hidden focusable="false" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
      <defs>
        <linearGradient id="lg-litmus" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FF5A4F" />
          <stop offset="0.35" stopColor="#E0409A" />
          <stop offset="0.68" stopColor="#7C4DFF" />
          <stop offset="1" stopColor="#3B6BFF" />
        </linearGradient>
        <linearGradient id="ring-litmus" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF5A4F" />
          <stop offset="0.4" stopColor="#E0409A" />
          <stop offset="0.75" stopColor="#7C4DFF" />
          <stop offset="1" stopColor="#3B6BFF" />
        </linearGradient>
        <linearGradient id="atom-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF5A4F" />
          <stop offset="1" stopColor="#E0409A" />
        </linearGradient>
        <linearGradient id="atom-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7C4DFF" />
          <stop offset="1" stopColor="#3B6BFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}
