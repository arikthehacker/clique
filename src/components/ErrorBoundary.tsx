/**
 * ==============================
 * FILE: src/components/ErrorBoundary.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Catches a render crash anywhere below it and shows a small "something
 * broke" screen with a retry, instead of a blank app.
 *
 * Includes:
 * - The crash message
 * - Try again button
 *
 * Notes:
 * - Mounted once, in app/_layout.tsx, around everything.
 */

import {
  Component,
  ReactNode,
} from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as Haptics from 'expo-haptics';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      error: error,
    };
  }

  handleRetry = () => {
    Haptics.selectionAsync();

    // give the screen another go
    this.setState({
      error: null,
    });
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          well, that broke
        </Text>

        <Text style={styles.message}>
          {this.state.error.message}
        </Text>

        <Pressable
          style={styles.button}
          onPress={this.handleRetry}
        >
          <Text style={styles.buttonText}>
            Try again
          </Text>
        </Pressable>
      </View>
    );
  }
}

// crash screen styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3C0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },

  title: {
    fontSize: 40,
    fontFamily: 'Gaegu-Bold',
    color: '#8f741d',
    marginBottom: 12,
  },

  message: {
    fontSize: 16,
    fontFamily: 'Figtree-Regular',
    color: '#6f6069',
    textAlign: 'center',
    marginBottom: 24,
  },

  button: {
    backgroundColor: '#b7931d',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },

  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Gaegu-Regular',
  },
});
