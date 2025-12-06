import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin(
   "./i18n/request.ts" // Point explicitly to your request file
);

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
