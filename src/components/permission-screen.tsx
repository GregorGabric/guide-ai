import { IconCheck, IconCircleDashed } from '@tabler/icons-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '~/src/components/ui/button';
import { Text } from '~/src/components/ui/text';
import { H2 } from '~/src/components/ui/typography';
import {
  PERMISSION_CONFIG,
  PERMISSION_REQUEST_ORDER,
  type PermissionStatus,
  type PermissionType,
} from '~/src/lib/permissions';

export interface PermissionScreenProps {
  onContinue: () => void;
  onRequestPermission: (type: PermissionType) => Promise<void>;
  permissionStatuses: Record<PermissionType, PermissionStatus>;
  isLoading?: boolean;
}

interface PermissionItemProps {
  type: PermissionType;
  status: PermissionStatus;
  onPress: () => void;
}

function PermissionItem({ type, status, onPress }: PermissionItemProps) {
  const config = PERMISSION_CONFIG[type];

  return (
    <Pressable className="flex-row items-center justify-between py-4" onPress={onPress}>
      <View className="flex-1 flex-row items-center gap-3">
        <View className="h-8 w-8 items-center justify-center">
          <Text variant="title2">{config.icon}</Text>
        </View>
        <View className="flex-1">
          <Text variant="body" className="font-medium">
            {config.title}
          </Text>
          <Text variant="footnote" color="secondary" className="mt-0.5">
            {config.description}
          </Text>
        </View>
      </View>

      <View className="h-6 w-6 items-center justify-center">
        {status === 'granted' ? (
          <IconCheck size={20} className="text-primary" />
        ) : (
          <IconCircleDashed size={20} className="text-muted-foreground" />
        )}
      </View>
    </Pressable>
  );
}

export function PermissionScreen({
  onContinue,
  onRequestPermission,
  permissionStatuses,
  isLoading = false,
}: PermissionScreenProps) {
  const insets = useSafeAreaInsets();

  const allRequiredGranted = PERMISSION_REQUEST_ORDER.filter(
    (type) => PERMISSION_CONFIG[type].isRequired
  ).every((type) => permissionStatuses[type] === 'granted');

  const handleItemPress = async (type: PermissionType) => {
    if (permissionStatuses[type] !== 'granted') {
      await onRequestPermission(type);
    }
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="pb-6 pt-8">
          <H2 className="mb-3 border-0 pb-0 text-center">Welcome to Guide AI</H2>
          <Text color="secondary" className="text-center leading-6">
            To provide the best experience, we need access to a few device features.
          </Text>
        </View>

        <View className="rounded-2xl bg-card px-4 py-2">
          {PERMISSION_REQUEST_ORDER.map((type, index) => {
            const isLastItem = index === PERMISSION_REQUEST_ORDER.length - 1;

            return (
              <View key={type}>
                <PermissionItem
                  type={type}
                  status={permissionStatuses[type]}
                  onPress={() => void handleItemPress(type)}
                />
                {!isLastItem && <View className="ml-11 h-px bg-border" />}
              </View>
            );
          })}
        </View>

        <View className="pt-6">
          <Text variant="footnote" color="tertiary" className="text-center leading-5">
            Required permissions are needed for core functionality. Optional permissions enhance
            your experience but can be skipped.
          </Text>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 bg-background px-6 pb-8"
        style={{ paddingBottom: insets.bottom + 32 }}
      >
        <Button
          onPress={onContinue}
          disabled={!allRequiredGranted || isLoading}
          size="lg"
          className="w-full"
        >
          <Text variant="body" className="font-semibold">
            {allRequiredGranted ? 'Continue' : 'Grant Required Permissions'}
          </Text>
        </Button>
      </View>
    </View>
  );
}
