import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
  // PWA configuration will be handled by next-pwa
  // For now, basic setup is in place. Full PWA config can be added later.
};

export default withNextIntl(nextConfig);
