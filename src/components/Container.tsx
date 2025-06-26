import { ScrollView } from '~/src/components/ui/scroll-view';

export const Container = ({ children }: { children: React.ReactNode }) => {
  return <ScrollView className={styles.container}>{children}</ScrollView>;
};

const styles = {
  container: 'flex flex-1 m-6',
};
