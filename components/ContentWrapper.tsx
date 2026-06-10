import type React from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
  children: React.ReactNode;
  isWide?: boolean;
  maxWidth?: number;
}

/**
 * Content wrapper that adds horizontal margins and caps max width
 * so content doesn't stretch too wide on large screens.
 * In landscape (isWide), it adds extra left margin to account for sidebar.
 */
export default function ContentWrapper({
  children,
  isWide = false,
  maxWidth = 800,
}: Props) {
  return (
    <View
      style={[
        styles.container,
        isWide && styles.containerWide,
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            maxWidth,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  containerWide: {
    paddingLeft: 40,
    paddingRight: 40,
  },
  inner: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
});
