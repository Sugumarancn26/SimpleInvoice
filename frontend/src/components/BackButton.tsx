import { useNavigate } from 'react-router-dom';
import { Button } from './Button.tsx';

export function BackButton({
  to,
  children = 'Back to invoice list',
}: {
  to: string;
  children?: string;
}) {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      onClick={() => navigate(to)}
      className="mb-4"
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path
          d="M12.5 5 7.5 10l5 5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </Button>
  );
}
