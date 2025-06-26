import type { ScrollViewProps } from 'react-native';
import { ScrollView as RNScrollView } from 'react-native';

export function ScrollView(props: ScrollViewProps) {
  return (
    <RNScrollView
      contentInsetAdjustmentBehavior={props.contentInsetAdjustmentBehavior ?? 'automatic'}
      {...props}
    />
  );
}
