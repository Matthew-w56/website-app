/**
 * WebView App
 * Provides a native app experience for a specific website
 *
 * @format
 */

import React, { useRef, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  ToastAndroid,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

const WEBSITE_URL = 'https://github.com';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState(WEBSITE_URL);
  const [backPressCount, setBackPressCount] = useState(0);
  const backPressTimer = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      
      // Check if we're on the start URL
      const isOnStartUrl = currentUrl === WEBSITE_URL || 
                          currentUrl.replace(/\/$/, '') === WEBSITE_URL.replace(/\/$/, '');
      
      if (isOnStartUrl) {
        if (backPressCount === 0) {
          setBackPressCount(1);
          ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
          
          // Reset counter after 2 seconds
          backPressTimer.current = setTimeout(() => {
            setBackPressCount(0);
          }, 2000);
          
          return true;
        } else if (backPressCount === 1) {
          // Exit the app
          if (backPressTimer.current) {
            clearTimeout(backPressTimer.current);
          }
          BackHandler.exitApp();
          return true;
        }
      }
      
      return false;
    });

    return () => {
      backHandler.remove();
      if (backPressTimer.current) {
        clearTimeout(backPressTimer.current);
      }
    };
  }, [canGoBack, currentUrl, backPressCount]);

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCurrentUrl(navState.url);
    // Reset back press count when navigating to a different page
    if (backPressCount > 0) {
      setBackPressCount(0);
      if (backPressTimer.current) {
        clearTimeout(backPressTimer.current);
      }
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load the website. Please check your internet connection.');
  };

  const handleReload = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.reloadButton} onPress={handleReload}>
        <Text style={styles.reloadButtonText}>Reload</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#000' : '#fff'}
      />
      <SafeAreaView style={styles.container}>
        {error ? (
          renderError()
        ) : (
          <>
            <WebView
              ref={webViewRef}
              source={{ uri: WEBSITE_URL }}
              style={styles.webview}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={false}
              scalesPageToFit={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              allowsBackForwardNavigationGestures={true}
              onNavigationStateChange={handleNavigationStateChange}
              onLoadStart={handleLoadStart}
              onLoadEnd={handleLoadEnd}
              onError={handleError}
              userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
              mixedContentMode="compatibility"
              thirdPartyCookiesEnabled={true}
              sharedCookiesEnabled={true}
            />
            {isLoading && renderLoading()}
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  reloadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  reloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;
