import type { Preview } from "@storybook/nextjs-vite";
import "../src/app/globals.css";

// ─── Viewport presets ─────────────────────────────────────────────────────────

const VIEWPORTS = {
  mobile: {
    name: "Mobile (390px)",
    styles: { width: "390px", height: "844px" },
    type: "mobile",
  },
  mobileLg: {
    name: "Mobile Large (430px)",
    styles: { width: "430px", height: "932px" },
    type: "mobile",
  },
  tablet: {
    name: "Tablet (768px)",
    styles: { width: "768px", height: "1024px" },
    type: "tablet",
  },
  tabletLg: {
    name: "Tablet Large (1024px)",
    styles: { width: "1024px", height: "768px" },
    type: "tablet",
  },
  desktop: {
    name: "Desktop (1280px)",
    styles: { width: "1280px", height: "800px" },
    type: "desktop",
  },
  desktopLg: {
    name: "Desktop Large (1440px)",
    styles: { width: "1440px", height: "900px" },
    type: "desktop",
  },
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disable: true,
    },
    a11y: {
      test: "todo",
    },
    viewport: {
      viewports: VIEWPORTS,
      defaultViewport: "desktop",
    },
  },
  globalTypes: {
    theme: {
      description: "Global theme",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = (context.globals.theme as string) ?? "light";
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute(
          "data-theme",
          theme === "dark" ? "dark" : "",
        );
        document.documentElement.style.backgroundColor =
          theme === "dark" ? "#0a0a0f" : "#fafafa";
      }
      return Story();
    },
  ],
};

export default preview;
