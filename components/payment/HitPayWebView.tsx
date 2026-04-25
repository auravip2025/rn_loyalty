import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react-native';

interface HitPayWebViewProps {
  visible: boolean;
  paymentUrl: string;
  paymentId: string;       // our internal payment ID for polling
  cashRequired: number;
  onSuccess: () => void;   // payment completed
  onFailure: (reason: string) => void;
  onClose: () => void;     // user dismissed
  pollUrl: string;         // e.g. http://localhost:3000/api/payments/:id
}

type ScreenState = 'loading' | 'webview' | 'polling' | 'success' | 'failed';

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 150; // 5 minutes

const HitPayWebView: React.FC<HitPayWebViewProps> = ({
  visible,
  paymentUrl,
  paymentId,
  cashRequired,
  onSuccess,
  onFailure,
  onClose,
  pollUrl,
}) => {
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState<ScreenState>('loading');
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const attempts  = useRef(0);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    attempts.current = 0;
    setScreen('polling');

    pollRef.current = setInterval(async () => {
      attempts.current += 1;
      if (attempts.current > POLL_MAX_ATTEMPTS) {
        stopPolling();
        setScreen('failed');
        onFailure('Payment timed out. Please try again.');
        return;
      }

      try {
        const res = await fetch(pollUrl);
        if (!res.ok) return; // keep polling
        const data = await res.json();

        if (data.status === 'COMPLETED') {
          stopPolling();
          setScreen('success');
          setTimeout(onSuccess, 1200); // brief success flash before closing
        } else if (data.status === 'FAILED') {
          stopPolling();
          setScreen('failed');
          onFailure(data.failureReason || 'Payment failed');
        }
        // PENDING → keep polling
      } catch (_) {
        // Network error — keep polling until max attempts
      }
    }, POLL_INTERVAL_MS);
  }, [pollUrl, stopPolling, onSuccess, onFailure]);

  // Clean up on unmount
  useEffect(() => () => stopPolling(), [stopPolling]);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setScreen('loading');
      attempts.current = 0;
      stopPolling();
    } else {
      stopPolling();
    }
  }, [visible, stopPolling]);

  /**
   * WebView navigation change handler.
   * HitPay redirects to our redirect_url on completion.
   * We detect this and switch to polling mode.
   */
  const handleNavChange = useCallback((navState: any) => {
    const url: string = navState.url || '';
    // Our redirect_url contains '/hitpay/redirect' — detect it
    if (url.includes('/hitpay/redirect') || url.includes('hitpay/redirect')) {
      // Payment attempt finished — start polling for webhook confirmation
      startPolling();
    }
  }, [startPolling]);

  const handleClose = useCallback(() => {
    stopPolling();
    onClose();
  }, [stopPolling, onClose]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <ArrowLeft size={20} color="#0f172a" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Secure Payment</Text>
            <Text style={styles.headerSub}>SGD {cashRequired.toFixed(2)} via HitPay</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* WebView — shown until redirect detected */}
        {(screen === 'loading' || screen === 'webview') && (
          <>
            {screen === 'loading' && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text style={styles.loadingText}>Loading payment page…</Text>
              </View>
            )}
            <WebView
              source={{ uri: paymentUrl }}
              style={[styles.webview, screen === 'loading' && styles.hidden]}
              onLoadEnd={() => setScreen('webview')}
              onNavigationStateChange={handleNavChange}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState={false}
            />
          </>
        )}

        {/* Polling state */}
        {screen === 'polling' && (
          <View style={styles.statusScreen}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text style={styles.statusTitle}>Confirming payment…</Text>
            <Text style={styles.statusSub}>
              This usually takes a few seconds.{'\n'}Please don't close this screen.
            </Text>
          </View>
        )}

        {/* Success state */}
        {screen === 'success' && (
          <View style={styles.statusScreen}>
            <CheckCircle2 size={64} color="#10b981" />
            <Text style={[styles.statusTitle, { color: '#10b981' }]}>Payment successful!</Text>
            <Text style={styles.statusSub}>Preparing your QR code…</Text>
          </View>
        )}

        {/* Failed state */}
        {screen === 'failed' && (
          <View style={styles.statusScreen}>
            <XCircle size={64} color="#ef4444" />
            <Text style={[styles.statusTitle, { color: '#ef4444' }]}>Payment failed</Text>
            <Text style={styles.statusSub}>
              Your tokens have been returned to your wallet.
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleClose}>
              <Text style={styles.retryText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 1,
  },
  webview: {
    flex: 1,
  },
  hidden: {
    opacity: 0,
    height: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    zIndex: 10,
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  statusScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 32,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
  },
  statusSub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: '#0f172a',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
  },
});

export default HitPayWebView;
