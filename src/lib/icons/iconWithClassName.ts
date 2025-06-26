import type { Icon } from '@tabler/icons-react-native';
import { cssInterop } from 'nativewind';

export function iconWithClassName(icon: Icon) {
  cssInterop(icon, {
    className: {
      target: 'style',
      nativeStyleToProp: {
        color: true,
        opacity: true,
      },
    },
  });
}
