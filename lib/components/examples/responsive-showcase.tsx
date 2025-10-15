/**
 * Responsive showcase component
 * Demonstrates all responsive design optimizations and features
 */

import React from "react";
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveStack,
  TouchFriendlyButton,
  ResponsiveModal,
} from "../layout/responsive-layout";
import {
  ResponsiveWrapper,
  ResponsiveText,
  ResponsiveSpacing,
  LazyWrapper,
  Card,
  CardHeader,
  CardContent,
} from "../ui";
import { useResponsiveLayout, useTouchGestures } from "../../utils/responsive";

/**
 * Showcase component demonstrating responsive features
 */
export const ResponsiveShowcase: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { isMobile, isTablet, isDesktop, isTouchDevice } =
    useResponsiveLayout();

  // Touch gesture handling
  const touchGestures = useTouchGestures((gesture) => {
    console.log("Gesture detected:", gesture.direction, gesture.distance);
  });

  return (
    <ResponsiveContainer maxWidth="xl" padding="md">
      <ResponsiveSpacing size="lg">
        <ResponsiveText as="h1" size="3xl" className="text-center mb-8">
          Responsive Design Showcase
        </ResponsiveText>

        {/* Device Detection Display */}
        <Card className="mb-8">
          <CardHeader>
            <ResponsiveText as="h2" size="xl">
              Device Detection
            </ResponsiveText>
          </CardHeader>
          <CardContent>
            <ResponsiveStack
              direction={{ mobile: "column", tablet: "row", desktop: "row" }}
              spacing={{ mobile: "1rem", tablet: "2rem", desktop: "3rem" }}
            >
              <div
                className={`p-4 rounded-lg ${
                  isMobile ? "bg-blue-100" : "bg-gray-100"
                }`}
              >
                <ResponsiveText size="lg" className="font-semibold">
                  Mobile: {isMobile ? "✓" : "✗"}
                </ResponsiveText>
              </div>
              <div
                className={`p-4 rounded-lg ${
                  isTablet ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                <ResponsiveText size="lg" className="font-semibold">
                  Tablet: {isTablet ? "✓" : "✗"}
                </ResponsiveText>
              </div>
              <div
                className={`p-4 rounded-lg ${
                  isDesktop ? "bg-purple-100" : "bg-gray-100"
                }`}
              >
                <ResponsiveText size="lg" className="font-semibold">
                  Desktop: {isDesktop ? "✓" : "✗"}
                </ResponsiveText>
              </div>
              <div
                className={`p-4 rounded-lg ${
                  isTouchDevice ? "bg-orange-100" : "bg-gray-100"
                }`}
              >
                <ResponsiveText size="lg" className="font-semibold">
                  Touch: {isTouchDevice ? "✓" : "✗"}
                </ResponsiveText>
              </div>
            </ResponsiveStack>
          </CardContent>
        </Card>

        {/* Responsive Grid Example */}
        <Card className="mb-8">
          <CardHeader>
            <ResponsiveText as="h2" size="xl">
              Responsive Grid
            </ResponsiveText>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid
              columns={{ mobile: 1, tablet: 2, desktop: 3 }}
              gap={{ mobile: "1rem", tablet: "1.5rem", desktop: "2rem" }}
            >
              {Array.from({ length: 6 }, (_, i) => (
                <Card key={i} className="p-4">
                  <ResponsiveText size="base">Grid Item {i + 1}</ResponsiveText>
                </Card>
              ))}
            </ResponsiveGrid>
          </CardContent>
        </Card>

        {/* Touch-Friendly Buttons */}
        <Card className="mb-8">
          <CardHeader>
            <ResponsiveText as="h2" size="xl">
              Touch-Friendly Buttons
            </ResponsiveText>
          </CardHeader>
          <CardContent>
            <ResponsiveStack
              direction={{ mobile: "column", tablet: "row", desktop: "row" }}
              spacing={{ mobile: "1rem", tablet: "1rem", desktop: "1rem" }}
            >
              <TouchFriendlyButton variant="primary" size="sm">
                Small Button
              </TouchFriendlyButton>
              <TouchFriendlyButton variant="secondary" size="md">
                Medium Button
              </TouchFriendlyButton>
              <TouchFriendlyButton variant="outline" size="lg">
                Large Button
              </TouchFriendlyButton>
              <TouchFriendlyButton
                variant="primary"
                onClick={() => setIsModalOpen(true)}
              >
                Open Modal
              </TouchFriendlyButton>
            </ResponsiveStack>
          </CardContent>
        </Card>

        {/* Lazy Loading Example */}
        <Card className="mb-8">
          <CardHeader>
            <ResponsiveText as="h2" size="xl">
              Lazy Loading
            </ResponsiveText>
          </CardHeader>
          <CardContent>
            <LazyWrapper minHeight="200px" showSkeleton>
              <div className="p-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
                <ResponsiveText size="lg" className="text-center">
                  This content was lazy loaded!
                </ResponsiveText>
              </div>
            </LazyWrapper>
          </CardContent>
        </Card>

        {/* Touch Gestures Example */}
        <Card className="mb-8">
          <CardHeader>
            <ResponsiveText as="h2" size="xl">
              Touch Gestures
            </ResponsiveText>
          </CardHeader>
          <CardContent>
            <div
              {...touchGestures}
              className="p-8 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 text-center"
            >
              <ResponsiveText size="base">
                {isTouchDevice
                  ? "Try swiping on this area (check console for gesture events)"
                  : "Touch gestures are available on touch devices"}
              </ResponsiveText>
            </div>
          </CardContent>
        </Card>

        {/* Responsive Wrapper Example */}
        <Card className="mb-8">
          <CardHeader>
            <ResponsiveText as="h2" size="xl">
              Responsive Wrapper
            </ResponsiveText>
          </CardHeader>
          <CardContent>
            <ResponsiveWrapper
              adaptToDevice
              touchOptimized
              animateOnMount
              fullWidthOnMobile
              centerOnDesktop
              className="p-6 bg-gradient-to-br from-green-400 to-blue-500 text-white rounded-lg"
            >
              <ResponsiveText size="lg" className="text-center">
                This wrapper adapts to your device automatically!
              </ResponsiveText>
              <ResponsiveText
                size="base"
                className="text-center mt-2 opacity-90"
              >
                Full width on mobile, centered on desktop, touch-optimized
              </ResponsiveText>
            </ResponsiveWrapper>
          </CardContent>
        </Card>

        {/* Responsive Modal */}
        <ResponsiveModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Responsive Modal"
          size="md"
        >
          <ResponsiveText size="base" className="mb-4">
            This modal adapts to different screen sizes:
          </ResponsiveText>
          <ul className="list-disc list-inside space-y-2">
            <li>Full screen on mobile devices</li>
            <li>Centered dialog on tablets and desktops</li>
            <li>Touch-friendly close button</li>
            <li>Optimized animations based on device capabilities</li>
          </ul>
          <div className="mt-6 flex justify-end">
            <TouchFriendlyButton
              variant="primary"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </TouchFriendlyButton>
          </div>
        </ResponsiveModal>
      </ResponsiveSpacing>
    </ResponsiveContainer>
  );
};

export default ResponsiveShowcase;
