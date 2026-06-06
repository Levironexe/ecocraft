const PARTICLE_COLORS = [
  'var(--primary)',
  'var(--accent)',
  'var(--primary-light)',
  'var(--accent-light)',
  'var(--border)',
];

export function PixelParticles() {
  return (
    <>
      {Array.from({ length: 15 }, (_, i) => (
        <div
          key={i}
          className="pixel-particle"
          style={{
            left: `${(i * 7 + 3) % 100}%`,
            animationDuration: `${15 + (i * 1.4) % 20}s`,
            animationDelay: `${(i * 1.3) % 20}s`,
            backgroundColor: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
          }}
        />
      ))}
    </>
  );
}
