import React, { useEffect } from 'react';
import { PermissionScreen } from '~/src/components/permission-screen';
import { useOnboarding } from '~/src/hooks/useOnboarding';
import { usePermissions } from '~/src/hooks/usePermissions';
import { REQUIRED_PERMISSIONS } from '~/src/lib/permissions';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  const {
    shouldShowOnboarding,
    isLoading: isOnboardingLoading,
    completeOnboarding,
  } = useOnboarding();

  const {
    permissionStatuses,
    requestPermission,
    checkAllPermissions,
    isLoading: isPermissionsLoading,
  } = usePermissions();

  // Check permission statuses on mount
  useEffect(() => {
    void checkAllPermissions();
  }, [checkAllPermissions]);

  const handleContinue = () => {
    // Check if all required permissions are granted
    const allRequiredGranted = REQUIRED_PERMISSIONS.every(
      (type) => permissionStatuses[type] === 'granted'
    );

    if (allRequiredGranted) {
      completeOnboarding();
    }
  };

  // Show loading state while onboarding state is being determined
  if (isOnboardingLoading) {
    return null; // Could show a loading screen here
  }

  // Show onboarding permission screen if needed
  if (shouldShowOnboarding) {
    return (
      <PermissionScreen
        onContinue={handleContinue}
        onRequestPermission={requestPermission}
        permissionStatuses={permissionStatuses}
        isLoading={isPermissionsLoading}
      />
    );
  }

  // Show main app
  return <>{children}</>;
}
