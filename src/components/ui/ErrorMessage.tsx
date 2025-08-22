import { COLORS } from "@/lib/theme";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
  fullScreen?: boolean;
}

export default function ErrorMessage({ 
  message, 
  onRetry, 
  onBack, 
  fullScreen = false 
}: ErrorMessageProps) {
  const content = (
    <div className="text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <p className="text-xl text-red-600 mb-6">{message}</p>
      <div className="space-x-4">
        {onBack && (
          <button 
            onClick={onBack} 
            className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition"
            style={{ backgroundColor: COLORS.rose }}
          >
            Retour
          </button>
        )}
        {onRetry && (
          <button 
            onClick={onRetry} 
            className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition"
            style={{ backgroundColor: COLORS.violet }}
          >
            Réessayer
          </button>
        )}
      </div>
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
