/**
 * Enhanced UI components exports
 * Premium components with glassmorphism effects and smooth animations
 */

export { Input } from './input';
export { Button } from './button';
export { Select } from "./select";
export { Textarea } from "./textarea";
export { Modal, ModalBody, ModalFooter } from "./modal";
export { ConfirmationDialog } from "./confirmation-dialog";
export { DataTable } from "./data-table";
export { Badge } from "./badge";
export { Card, CardHeader, CardContent, CardFooter } from "./card";
export { LoadingScreen } from "./loading-screen";
export { Logo } from "./logo";
export { SecurityNotice } from "./security-notice";
export { ToastProvider, useToast } from "./toast";
export { Toggle } from "./toggle";
export { ColorPicker } from "./color-picker";
export { RadioGroup } from "./radio-group";
export { LazyWrapper, LazyImage, LazyComponent, withLazyLoading } from "./lazy-wrapper";
export { ResponsiveWrapper, withResponsive, ResponsiveText, ResponsiveSpacing } from "./responsive-wrapper";

// Re-export basic utility functions
export {
    cn,
    formatDate,
    formatDateTime,
    capitalize,
    truncate,
    formatNumber,
    debounce,
    sleep,
    getStaggerDelay,
    easings,
    generateAnimationProps,
    createRipple
} from "../../utils";

// Re-export animation utilities
export {
    useOptimizedAnimation,
    useHardwareAcceleration,
    createOptimizedRipple,
    useStaggeredAnimation,
    useScrollAnimation,
    useDebounceAnimation,
    durations,
    animationConfigs
} from "../../utils/animations";

// Re-export performance utilities
export {
    useReducedMotion,
    hardwareAcceleration,
    useIntersectionObserver,
    usePerformanceOptimizedAnimation
} from "../../utils/performance";

// Re-export responsive utilities
export {
    useBreakpoint,
    useTouchDevice,
    useOrientation,
    useResponsiveValue,
    useTouchGestures,
    useResponsiveLayout,
    useViewportHeight,
    useResponsiveImage,
    breakpoints
} from "../../utils/responsive";