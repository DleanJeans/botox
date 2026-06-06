import React from 'react';
import { View, Text } from 'react-native';
import * as Lucide from 'lucide-react-native';

type IconName =
  | 'theater' | 'scroll' | 'users' | 'book' | 'moon' | 'sun'
  | 'pencil' | 'circle' | 'square' | 'heart' | 'skull' | 'ghost'
  | 'x' | 'check' | 'arrowLeft' | 'arrowRight' | 'chevronDown'
  | 'chevronUp' | 'trash2' | 'user' | 'plus' | 'menu' | 'search'
  | 'dice' | 'package' | 'messageCircle' | 'edit3' | 'settings'
  | 'alertCircle' | 'info' | 'star' | 'mail' | 'discord'
  | 'home' | 'gamepad2' | 'list' | 'filter' | 'moreHorizontal'
  | 'crown' | 'target' | 'eye' | 'eyeOff' | 'smartphone'
  | 'monitor' | 'tablet' | 'play' | 'pause' | 'chevronLeft'
  | 'chevronRight' | 'download' | 'upload' | 'save' | 'refreshCw'
  | 'move';

const ICON_MAP: Record<string, IconName> = {
  '🎭': 'theater',
  '📜': 'scroll',
  '👥': 'users',
  '📖': 'book',
  '🌙': 'moon',
  '☀️': 'sun',
  '✏️': 'pencil',
  '⭕': 'circle',
  '⬜': 'square',
  '❤️': 'heart',
  '💀': 'skull',
  '👻': 'ghost',
  '✕': 'x',
  '✓': 'check',
  '←': 'arrowLeft',
  '→': 'arrowRight',
  '▼': 'chevronDown',
  '▲': 'chevronUp',
  '🗑️': 'trash2',
  '👤': 'user',
  '➕': 'plus',
  '+': 'plus',
  '☰': 'menu',
  '🔍': 'search',
  '🎲': 'dice',
  '📦': 'package',
  '💬': 'messageCircle',
  '💗': 'heart',
  '📝': 'edit3',
  '🔮': 'circle',
  '👹': 'alertCircle',
  '😈': 'alertCircle',
  '⭐': 'star',
  '🏠': 'home',
  '🍺': 'alertCircle',
  '😇': 'star',
  '🗡️': 'target',
  '🏅': 'crown',
};

interface IconProps {
  name: string | IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const LUCIDE_COMPONENTS: Record<string, React.ComponentType<any>> = {
  theater: Lucide.Theater,
  scroll: Lucide.Scroll,
  users: Lucide.Users,
  book: Lucide.Book,
  moon: Lucide.Moon,
  sun: Lucide.Sun,
  pencil: Lucide.Pencil,
  circle: Lucide.Circle,
  square: Lucide.Square,
  heart: Lucide.Heart,
  skull: Lucide.Skull,
  ghost: Lucide.Ghost,
  x: Lucide.X,
  check: Lucide.Check,
  arrowLeft: Lucide.ArrowLeft,
  arrowRight: Lucide.ArrowRight,
  chevronDown: Lucide.ChevronDown,
  chevronUp: Lucide.ChevronUp,
  trash2: Lucide.Trash2,
  user: Lucide.User,
  plus: Lucide.Plus,
  menu: Lucide.Menu,
  search: Lucide.Search,
  dice: Lucide.Gamepad2,
  package: Lucide.Package,
  messageCircle: Lucide.MessageCircle,
  edit3: Lucide.Edit3,
  settings: Lucide.Settings,
  alertCircle: Lucide.AlertCircle,
  info: Lucide.Info,
  star: Lucide.Star,
  mail: Lucide.Mail,
  home: Lucide.Home,
  gamepad2: Lucide.Gamepad2,
  list: Lucide.List,
  filter: Lucide.Filter,
  moreHorizontal: Lucide.MoreHorizontal,
  crown: Lucide.Crown,
  target: Lucide.Target,
  eye: Lucide.Eye,
  eyeOff: Lucide.EyeOff,
  smartphone: Lucide.Smartphone,
  monitor: Lucide.Monitor,
  tablet: Lucide.Tablet,
  play: Lucide.Play,
  pause: Lucide.Pause,
  chevronLeft: Lucide.ChevronLeft,
  chevronRight: Lucide.ChevronRight,
  download: Lucide.Download,
  upload: Lucide.Upload,
  save: Lucide.Save,
  refreshCw: Lucide.RefreshCw,
  move: Lucide.Move,
};

export default function Icon({
  name,
  size = 20,
  color = '#888',
  strokeWidth = 1.5,
}: IconProps) {
  // If it's an emoji, try to map it
  const iconName = ICON_MAP[name] || name;
  const LucideComponent = LUCIDE_COMPONENTS[iconName];

  if (!LucideComponent) {
    // Fallback: render the raw emoji
    return <Text style={{ fontSize: size }}>{name}</Text>;
  }

  return (
    <LucideComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
    />
  );
}
