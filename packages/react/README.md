# @universal-i18n/next

The Next.js integration for `universal-i18n`. Delivers **Absolute Zero-Config Server Proxies** to securely translate content without exposing your API keys to the browser.

## Installation

```bash
npm install @universal-i18n/next
```

## Setup (2 Steps)

### 1. The Secure Server Proxy

Create `src/app/api/universal-i18n/route.ts` (API route):

```ts
// src/app/api/universal-i18n/route.ts
import { createTranslationRoute } from "@universal-i18n/next/server";

export const POST = createTranslationRoute();
```

### 2. The Root Layout Provider

Wrap your layout with `<NextAutoTranslate>`:

```tsx
// src/app/layout.tsx
import { NextAutoTranslate } from "@universal-i18n/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NextAutoTranslate showSwitcher={true}>{children}</NextAutoTranslate>
      </body>
    </html>
  );
}
```

Add your `LINGODOTDEV_API_KEY` to your `.env` and Next.js is now fully translated in real-time.

## API Reference

See the [Mono-repo README](https://github.com/universal-i18n/universal-i18n) for full documentation.
