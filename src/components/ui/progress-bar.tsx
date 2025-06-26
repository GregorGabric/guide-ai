import { View } from 'react-native';
import { cn } from '~/src/lib/utils';
import { Text } from './text';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'primary',
  size = 'md',
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <View className={cn('w-full', className)}>
      {label && (
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-foreground">{label}</Text>
          {showPercentage && (
            <Text className="text-sm text-muted-foreground">{Math.round(percentage)}%</Text>
          )}
        </View>
      )}
      <View className={cn('w-full overflow-hidden rounded-full bg-muted', sizeClasses[size])}>
        <View
          className={cn('h-full rounded-full', colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
}
