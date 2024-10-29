import { Circle } from 'lucide-react';
import type { UserStatus } from '../hooks/useUserStatus';

interface Props {
  status: UserStatus;
  size?: 'sm' | 'md' | 'lg';
}

export default function UserStatusBadge({ status, size = 'md' }: Props) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const statusColors = {
    online: 'text-green-500',
    idle: 'text-yellow-500',
    dnd: 'text-red-500',
    offline: 'text-gray-500'
  };

  return (
    <Circle 
      className={`${sizeClasses[size]} ${statusColors[status]} fill-current`}
      aria-label={status}
    />
  );
}