import { COLORS } from "@/lib/theme";
import { getGenreColor, getTypeColor } from "@/lib/eventUtils";

interface EventBadgeProps {
  type: 'genre' | 'eventType';
  value: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base'
};

export default function EventBadge({ type, value, size = 'md' }: EventBadgeProps) {
  const isGenre = type === 'genre';
  const backgroundColor = isGenre ? getGenreColor(value) : getTypeColor(value);
  const textColor = isGenre ? 'white' : COLORS.violet;

  return (
    <span
      className={`rounded-full font-medium ${sizes[size]}`}
      style={{ 
        backgroundColor,
        color: textColor
      }}
    >
      {value}
    </span>
  );
}
