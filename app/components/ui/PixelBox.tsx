export function PixelBox({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`pixel-box ${className}`}>{children}</div>;
}
