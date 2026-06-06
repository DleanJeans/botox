import { useWindowDimensions } from 'react-native';

const BREAKPOINT = 768;

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const isLandscape = width > height;

  return {
    isDesktop,
    isMobile: !isDesktop,
    isLandscape,
    isPortrait: !isLandscape,
    width,
    height,
    sidebarWidth: 280,
    breakpoint: BREAKPOINT,
  };
}

export function useSidebar() {
  const { isDesktop } = useResponsive();
  return {
    persistent: isDesktop,
    // On mobile, panels slide in from left/right as overlays
    // On desktop, they're fixed sidebars
  };
}
