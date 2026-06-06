interface PixelButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'accent' | 'ghost';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

export function PixelButton({
  children,
  onClick,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  className = '',
}: PixelButtonProps) {
  const variantClass = `pixel-btn-${variant}`;
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`pixel-btn ${variantClass} ${widthClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
