import type { Rule } from '../../types/index.js';

const EXTERNAL_PAYMENT_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /stripe\.com\/pay/i, label: 'Stripe payment link' },
  { pattern: /buy\.stripe\.com/i, label: 'Stripe Buy button URL' },
  { pattern: /checkout\.stripe\.com/i, label: 'Stripe Checkout URL' },
  { pattern: /paypal\.me\//i, label: 'PayPal.me link' },
  { pattern: /ko-fi\.com\//i, label: 'Ko-fi link' },
  { pattern: /patreon\.com\//i, label: 'Patreon link' },
  {
    pattern: /["']subscribe on our website["']/i,
    label: 'External subscription reference',
  },
  { pattern: /["']purchase at["']/i, label: 'External purchase reference' },
  { pattern: /["']buy on our site["']/i, label: 'External purchase reference' },
];

export const externalPaymentLinks: Rule = {
  meta: {
    id: 'payments/external-payment-links',
    title: 'External Payment Links',
    description:
      'App contains links or references to external payment methods. Apple may reject apps that direct users to purchase outside the App Store.',
    severity: 'warning',
    category: 'payments',
    fixable: true,
  },

  check(context) {
    const violations = [];

    for (const file of context.sourceFiles) {
      for (const { pattern, label } of EXTERNAL_PAYMENT_PATTERNS) {
        if (pattern.test(file.content)) {
          violations.push({
            message: `Found ${label} in source file. Apple may reject apps that direct users to external payment methods.`,
            file: file.path,
            fix: {
              prompt: `Remove the external payment reference (${label}) from this file. If the app needs to sell digital goods or subscriptions, use StoreKit / In-App Purchases instead. Physical goods and services are exempt from this requirement.`,
              files: [file.path],
            },
          });
          break; // One violation per file
        }
      }
    }

    return { violations };
  },
};
