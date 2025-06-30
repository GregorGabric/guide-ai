import { IconChevronRight } from '@tabler/icons-react-native';
import { TouchableOpacity, View } from 'react-native';
import { useStore } from 'zustand';
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemTitle,
  DropdownMenuLabel,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '~/src/components/ui/dropdown-menu';
import { Large, P } from '~/src/components/ui/typography';
import { VOICE_CONFIG } from '~/src/features/chat/voice-config';
import { languageStore } from '~/src/features/settings/store';
import { useColorScheme } from '~/src/lib/useColorScheme';
import { cn } from '~/src/lib/utils';

interface Props {
  className?: string;
}

export function LanguageSelect({ className }: Props) {
  const { setLanguage, language } = useStore(languageStore);
  const { colors } = useColorScheme();

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger>
        <TouchableOpacity
          activeOpacity={0.7}
          style={{ borderCurve: 'continuous' }}
          className={cn(className, 'border-border/30 w-full rounded-2xl border p-5')}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Large className="mb-1">Language</Large>
              <P>Interface language</P>
            </View>
            <View className="flex-row items-center">
              <View className="bg-primary/10 mr-3 rounded-full px-3 py-2">
                <P className="text-sm text-foreground">{language.name}</P>
              </View>
              <IconChevronRight size={20} color={colors.foreground} />
            </View>
          </View>
        </TouchableOpacity>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Languages</DropdownMenuLabel>
          {Object.entries(VOICE_CONFIG).map(([key, value]) => (
            <DropdownMenuItem
              key={key}
              onSelect={() => {
                setLanguage(value);
              }}
            >
              <DropdownMenuItemTitle>{value.name}</DropdownMenuItemTitle>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}
