import "@testing-library/jest-dom";

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: jest.fn(),
});

// Mock CSS.supports for backdrop-filter
Object.defineProperty(CSS, "supports", {
  writable: true,
  value: jest.fn().mockImplementation((property, value) => {
    if (
      property === "backdrop-filter" ||
      property === "-webkit-backdrop-filter"
    ) {
      return true;
    }
    return false;
  }),
});

// Suppress console warnings during tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes("Warning: ReactDOM.render is no longer supported")
  ) {
    return;
  }
  originalConsoleWarn.call(console, ...args);
};

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: jest.fn(() => "/"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock recharts to avoid canvas rendering issues in tests
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  Bar: () => <div data-testid="bar" />,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  Line: () => <div data-testid="line" />,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
}));

// Add custom matchers
expect.extend({
  toHaveGlassmorphismStyles(received) {
    const hasBackdropFilter =
      received.style.backdropFilter ||
      received.classList.contains("backdrop-blur-xl") ||
      received.classList.contains("backdrop-blur-sm");

    const hasTransparency =
      received.style.background?.includes("rgba") ||
      received.classList.toString().includes("bg-white/") ||
      received.classList.toString().includes("bg-black/");

    const pass = hasBackdropFilter && hasTransparency;

    if (pass) {
      return {
        message: () => `expected ${received} not to have glassmorphism styles`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to have glassmorphism styles (backdrop-filter and transparency)`,
        pass: false,
      };
    }
  },
});
