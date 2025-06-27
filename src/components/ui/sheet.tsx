import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { useTheme } from '~/src/lib/theme/theme-provider';

const Sheet = ({
  ref,
  index = 0,
  backgroundStyle,
  style,
  handleIndicatorStyle,
  ...props
}: React.ComponentPropsWithoutRef<typeof BottomSheetModal> & {
  ref?: React.RefObject<BottomSheetModal | null>;
}) => {
  const { colors } = useTheme();

  const renderBackdrop = React.useCallback(
    (props: BottomSheetBackdropProps) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} />,
    []
  );
  return (
    <BottomSheetModal
      ref={ref}
      index={index}
      backgroundStyle={
        backgroundStyle ?? {
          backgroundColor: colors.card,
        }
      }
      style={
        style ?? {
          borderWidth: 1,
          borderColor: colors.grey5,
          borderTopStartRadius: 16,
          borderTopEndRadius: 16,
        }
      }
      handleIndicatorStyle={
        handleIndicatorStyle ?? {
          backgroundColor: colors.grey4,
        }
      }
      backdropComponent={renderBackdrop}
      {...props}
    />
  );
};

function useSheetRef() {
  return React.useRef<BottomSheetModal>(null);
}

type SheetRef = React.RefObject<BottomSheetModal>;

export { Sheet, useSheetRef, type SheetRef };
