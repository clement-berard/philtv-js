import { defineConfig } from 'vitepress';
import SideBarMenuAutoGen from '../lib/typedoc-sidebar.json';

const releaseVersion = process.env.RELEASE_VERSION || 'dev';
const buildDate = new Date().toISOString().split('T')[0];

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'philtv-js',
  description: 'A simple library to pair and interact with Philips TV',
  base: process.env.CI ? '/philtv-js/' : '/',
  head: [
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en_US' }],
    ['meta', { property: 'og:site_name', content: 'philtv-js - A simple library to pair and interact with Philips TV' }],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: 'Home', link: '../get-started.md' }],
    sidebar: [
      { text: 'Get Started', link: '/get-started.md' },
      { text: 'Pairing TV', link: '/pairing.md' },
      { text: 'API usage', link: '/api-usage.md' },
      ...SideBarMenuAutoGen,
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/clement-berard/philtv-js' }],
    footer: {
      message: `Version ${releaseVersion} - Built on ${buildDate}`,
    },
  },
});
