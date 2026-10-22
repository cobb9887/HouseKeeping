import React from 'react';
import {
  Sofa,
  Utensils,
  Bath,
  Bed,
  DoorOpen,
  Sparkles,
  ClipboardCheck,
  Tv,
  Box,
  Shirt,
  Flame,
  Trophy,
  Crown,
  Zap,
  Timer,
  CheckCircle2,
  FolderSync,
  Laptop,
  Briefcase,
  Monitor,
} from 'lucide-react';

interface RoomIconProps {
  name: string;
  className?: string;
}

export const RoomIcon: React.FC<RoomIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name.toLowerCase()) {
    case 'office':
    case 'laptop':
      return <Laptop className={className} />;
    case 'briefcase':
      return <Briefcase className={className} />;
    case 'monitor':
      return <Monitor className={className} />;
    case 'sofa':
      return <Sofa className={className} />;
    case 'utensils':
      return <Utensils className={className} />;
    case 'bath':
      return <Bath className={className} />;
    case 'bed':
      return <Bed className={className} />;
    case 'door-open':
    case 'door':
      return <DoorOpen className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'clipboard-check':
    case 'check':
      return <ClipboardCheck className={className} />;
    case 'tv':
      return <Tv className={className} />;
    case 'box':
      return <Box className={className} />;
    case 'shirt':
    case 'laundry':
      return <Shirt className={className} />;
    case 'flame':
      return <Flame className={className} />;
    case 'trophy':
      return <Trophy className={className} />;
    case 'crown':
      return <Crown className={className} />;
    case 'zap':
      return <Zap className={className} />;
    case 'timer':
      return <Timer className={className} />;
    case 'sync':
      return <FolderSync className={className} />;
    default:
      return <CheckCircle2 className={className} />;
  }
};
