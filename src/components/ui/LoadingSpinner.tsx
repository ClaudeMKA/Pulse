import { COLORS } from "@/lib/theme";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

const sizes = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12', 
  lg: 'h-16 w-16'
};

export default function LoadingSpinner({ 
  size = 'md', 
  message = 'Chargement...', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const content = (
    <div className="text-center">
      <div 
        className={`animate-spin rounded-full border-b-4 mx-auto mb-4 ${sizes[size]}`}
        style={{ borderColor: COLORS.violet }}
      ></div>
      {message && (
        <p className="text-xl text-gray-600">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
}
