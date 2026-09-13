import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  expect: { timeout: 10000 },
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:8000',
    browserName: 'chromium',
    colorScheme: 'light',
    launchOptions: { args: ['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: 'compact', use: { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true } }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8000',
    reuseExistingServer: true,
    timeout: 20000
  }
});