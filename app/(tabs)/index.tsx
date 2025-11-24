import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ProgressIndicator } from '@/components/progress-indicator';
import { TargetIcon } from '@/components/icons/target-icon';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Home</ThemedText>

        {/* Progress Indicator Examples */}
        <ThemedView style={styles.section}>
          <ProgressIndicator
            seconds={12}
            maxSeconds={45}
            label="Adem ingehouden"
            icon={<TargetIcon />}
          />

          <ProgressIndicator
            seconds={30}
            maxSeconds={45}
            label="Ademhalingstechnieken"
            icon={<TargetIcon />}
          />

          <ProgressIndicator
            seconds={45}
            maxSeconds={45}
            label="Voltooide oefeningen"
            icon={<TargetIcon />}
          />
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  title: {
    marginBottom: 10,
  },
  section: {
    gap: 16,
  },
});
