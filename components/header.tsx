import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeft, MoreVertical } from 'lucide-react-native';
import { Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  gradient?: [string, string, ...Array<string>];
  variant?: 'default' | 'gradient' | 'glass';
  showOptions?: boolean;
  onOptionsPress?: () => void;
}

function Header({
  title,
  showBackButton = true,
  onBackPress,
  gradient,
  variant = 'default',
  showOptions = false,
  onOptionsPress,
}: HeaderProps) {
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const gradientColors: [string, string, ...Array<string>] = gradient || ['#FAFAFA', '#FFFFFF'];

  const getStatusBarHeight = () => {
    return Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
  };

  const renderContent = () => (
    <View
      className="flex-row items-end justify-between px-5 pb-4"
      style={{
        height: 96 + getStatusBarHeight(),
        paddingTop: Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 0) + 12,
      }}>
      {/* Back Button */}
      {showBackButton ? (
        <TouchableOpacity
          className={`h-10 w-10 items-center justify-center rounded-2xl ${
            variant === 'gradient'
              ? 'border border-white/20 bg-white/15'
              : 'bg-surface/80 border-divider/50 border'
          }`}
          onPress={handleBackPress}
          activeOpacity={0.7}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: variant === 'gradient' ? 0.1 : 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}>
          <ChevronLeft
            size={20}
            color={variant === 'gradient' ? '#FFFFFF' : '#374151'}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      ) : (
        <View className="w-10" />
      )}

      {/* Title */}
      <View className="flex-1 items-center">
        <Text
          className={`font-quicksand-bold text-xl tracking-tight ${
            variant === 'gradient' ? 'text-white' : 'text-text'
          }`}
          style={{
            letterSpacing: -0.5,
          }}>
          {title}
        </Text>
      </View>

      {/* Options Button */}
      {showOptions ? (
        <TouchableOpacity
          className={`h-10 w-10 items-center justify-center rounded-2xl ${
            variant === 'gradient'
              ? 'border border-white/20 bg-white/15'
              : 'bg-surface/80 border-divider/50 border'
          }`}
          onPress={onOptionsPress}
          activeOpacity={0.7}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: variant === 'gradient' ? 0.1 : 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}>
          <MoreVertical
            size={20}
            color={variant === 'gradient' ? '#FFFFFF' : '#6B7280'}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      ) : (
        <View className="w-10" />
      )}
    </View>
  );

  if (variant === 'glass') {
    return (
      <BlurView className="relative border-b border-white/10" intensity={90} tint="light">
        {renderContent()}
      </BlurView>
    );
  }

  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="relative">
        {renderContent()}
        {/* Subtle bottom border */}
        <View className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
      </LinearGradient>
    );
  }

  // Default variant - more minimal
  return (
    <View className="bg-background/95 border-divider/30 relative border-b backdrop-blur-xl">
      {renderContent()}
    </View>
  );
}

export default Header;
