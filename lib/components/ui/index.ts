/**
 * Enhanced UI components exports
 * Premium components with glassmorphism effects and smooth animations
 */

export { Input } from './input';
export { Button } from './button';
export { Select } from "./select";
export { Textarea } from "./textarea";
export { Modal, ModalBody, ModalFooter } from "./modal";
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

// Re-export utility functions for animations and styling
export {
    cn,
    createRipple,
    getStaggerDelay,
    easings,
    generateAnimationProps,
    useOptimizedAnimation,
    useHardwareAcceleration,
    createOptimizedRipple,
    useStaggeredAnimation,
    useReducedMotion,
    useBreakpoint,
    useTouchDevice,
    useResponsiveValue,
    useTouchGestures,
    useResponsiveLayout
} from "../../utils";