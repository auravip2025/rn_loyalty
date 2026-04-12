import { useIsFocused } from '@react-navigation/native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { QrCode } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

interface ScanViewProps {
  onScanComplete: (data: string) => void;
}

const ScanView: React.FC<ScanViewProps> = ({ onScanComplete }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const scannedRef = React.useRef(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setScanned(false);
      scannedRef.current = false;
    }
  }, [isFocused]);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    if (scannedRef.current || !isFocused) return;
    console.log(`Bar code with type ${type} and data ${data} has been scanned!`);
    scannedRef.current = true;
    setScanned(true);

    // Auto confirm and proceed
    onScanComplete(data);
  };

  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
      )}

      {/* Overlay */}
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.topOverlay} />

        <View style={styles.midContainer}>
          <View style={styles.leftOverlay} />
          <View style={styles.scanFrame}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />

          </View>
          <View style={styles.rightOverlay} />
        </View>

        <View style={styles.bottomOverlay}>
          <View style={styles.infoContainer}>
            <QrCode size={24} color="#ffffff" style={{ opacity: 0.8 }} />
            <Text style={styles.instructions}>Scan Singapore PayNow QR to pay</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#fff',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  midContainer: {
    flexDirection: 'row',
    height: 280,
  },
  leftOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scanFrame: {
    width: 280,
    height: 280,
    borderWidth: 0,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  rightOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    paddingTop: 40,
  },

  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
  instructions: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cornerTL: {
    position: 'absolute', top: 0, left: 0, width: 40, height: 40,
    borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#f43f5e', borderTopLeftRadius: 16
  },
  cornerTR: {
    position: 'absolute', top: 0, right: 0, width: 40, height: 40,
    borderTopWidth: 4, borderRightWidth: 4, borderColor: '#f43f5e', borderTopRightRadius: 16
  },
  cornerBL: {
    position: 'absolute', bottom: 0, left: 0, width: 40, height: 40,
    borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#f43f5e', borderBottomLeftRadius: 16
  },
  cornerBR: {
    position: 'absolute', bottom: 0, right: 0, width: 40, height: 40,
    borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#f43f5e', borderBottomRightRadius: 16
  },
});

export default ScanView;