export default function Logo({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Billu"
    >
      <defs>
        <linearGradient id="billuGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#3730A3" />
        </linearGradient>
      </defs>
      {/* Receipt-shaped mark with a torn bottom edge */}
      <path
        d="M4,10 A6,6 0 0 1 10,4 L54,4 A6,6 0 0 1 60,10 L60,46 L54,52 L48,46 L42,52 L36,46 L30,52 L24,46 L18,52 L12,46 L4,52 Z"
        fill="url(#billuGrad)"
      />
      <text
        x="32"
        y="30"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fontWeight="800"
        fontSize="26"
        fill="#FFFFFF"
      >
        B
      </text>
      {/* Amber accent dot — the "bill total" mark */}
      <circle cx="49" cy="15" r="4" fill="#F59E0B" />
    </svg>
  );
}
