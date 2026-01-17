'use client';
import { SerwistProvider as Provider } from '@serwist/turbopack/react';

export default function SerwistProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider swUrl="/serwist/sw.js">{children}</Provider>;
}
