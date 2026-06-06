import React, { useState, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  useWindowDimensions,
} from 'react-native';

interface GameLayoutProps {
  /** The main game area (circle/room view) */
  gameArea: ReactNode;
  /** Player list sidebar content */
  playerListPanel: ReactNode;
  /** Role browser sidebar content */
  roleBrowserPanel: ReactNode;
  /** Whether we're on desktop width */
  isDesktop: boolean;
}

export default function GameLayout({
  gameArea,
  playerListPanel,
  roleBrowserPanel,
  isDesktop,
}: GameLayoutProps) {
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);

  // On desktop, sidebars are always visible
  if (isDesktop) {
    return (
      <View style={styles.desktopContainer}>
        {/* Left sidebar — Player List */}
        <View style={styles.leftSidebar}>{playerListPanel}</View>

        {/* Center — Game Area */}
        <View style={styles.centerArea}>{gameArea}</View>

        {/* Right sidebar — Role Browser */}
        <View style={styles.rightSidebar}>{roleBrowserPanel}</View>
      </View>
    );
  }

  // On mobile, show game area full-screen with overlay panels
  return (
    <View style={styles.mobileContainer}>
      {/* Game area (full screen) */}
      <View style={styles.mobileGameArea}>{gameArea}</View>

      {/* Toggle buttons */}
      <View style={styles.mobileToggles}>
        <Pressable
          style={styles.mobileToggleBtn}
          onPress={() => setShowLeftPanel(true)}
        >
          <Text style={styles.mobileToggleIcon}></Text>
        </Pressable>
        <Pressable
          style={styles.mobileToggleBtn}
          onPress={() => setShowRightPanel(true)}
        >
          <Text style={styles.mobileToggleIcon}></Text>
        </Pressable>
      </View>

      {/* Left panel overlay */}
      {showLeftPanel && (
        <View style={styles.panelOverlay}>
          <View style={styles.panelLeft}>
            {React.cloneElement(playerListPanel as React.ReactElement<{onClose?: () => void}>, {
              onClose: () => setShowLeftPanel(false),
            })}
          </View>
          <Pressable
            style={styles.panelBackdrop}
            onPress={() => setShowLeftPanel(false)}
          />
        </View>
      )}

      {/* Right panel overlay */}
      {showRightPanel && (
        <View style={styles.panelOverlay}>
          <View style={styles.panelRight}>
            {React.cloneElement(roleBrowserPanel as React.ReactElement<{onClose?: () => void}>, {
              onClose: () => setShowRightPanel(false),
            })}
          </View>
          <Pressable
            style={styles.panelBackdrop}
            onPress={() => setShowRightPanel(false)}
          />
        </View>
      )}
    </View>
  );
}

const SIDEBAR_WIDTH = 300;

const styles = StyleSheet.create({
  // Desktop: three-column layout
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftSidebar: {
    width: SIDEBAR_WIDTH,
    borderRightWidth: 1,
    borderRightColor: '#2f313a',
  },
  centerArea: {
    flex: 1,
    minWidth: 300,
  },
  rightSidebar: {
    width: SIDEBAR_WIDTH,
    borderLeftWidth: 1,
    borderLeftColor: '#2f313a',
  },

  // Mobile: full-screen game area with overlay panels
  mobileContainer: {
    flex: 1,
    position: 'relative',
  },
  mobileGameArea: {
    flex: 1,
  },
  mobileToggles: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    flexDirection: 'row',
    gap: 8,
    zIndex: 20,
  },
  mobileToggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fcb93c',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  mobileToggleIcon: {
    fontSize: 20,
  },

  // Panel overlays for mobile
  panelOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 100,
  },
  panelLeft: {
    width: SIDEBAR_WIDTH,
    maxWidth: '85%',
    zIndex: 2,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  panelRight: {
    width: SIDEBAR_WIDTH,
    maxWidth: '85%',
    marginLeft: 'auto',
    zIndex: 2,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  panelBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
});
