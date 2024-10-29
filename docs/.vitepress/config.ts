import { defineConfig } from 'vitepress';
import SideBarMenuAutoGen from '../lib/typedoc-sidebar.json';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'philtv-js',
  description: 'A simple library to pair and interact with Philips TV',
  base: process.env.CI ? '/philtv-js/' : '/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: 'Home', link: '../lib/index.md' }],
    sidebar: [{ text: 'Get Started', link: '/lib/index.md' }, ...SideBarMenuAutoGen],
    socialLinks: [{ icon: 'github', link: 'https://github.com/clement-berard/philtv-js' }],
  },
});
