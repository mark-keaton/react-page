import type { ComponentProps, ComponentType, ReactElement } from 'react';
import React, { useEffect, useState } from 'react';

import { Suspense } from 'react';
import { lazyWithPreload } from 'react-lazy-with-preload';

function useIsServer() {
  const [isServer, setIsServer] = useState(true);
  useEffect(() => {
    setIsServer(false);
  }, []);
  return isServer;
}

/**
 * Normalize ESM/CJS module interop - handles various module formats that bundlers may produce
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeModule = <T extends ComponentType<any>>(
  mod: unknown
): { default: T } => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const m = mod as any;

  // Case 1: Direct component (no wrapper)
  if (typeof m === 'function') {
    return { default: m as T };
  }

  // Case 2: { default: { default: Component } } (double-wrapped)
  if (m?.default && typeof m.default === 'object' && 'default' in m.default) {
    return { default: m.default.default as T };
  }

  // Case 3: { default: Component } (normal ESM)
  if (m?.default && typeof m.default === 'function') {
    return m as { default: T };
  }

  // Case 4: Module with __esModule flag and default
  if (m?.__esModule && m?.default) {
    if (typeof m.default === 'function') {
      return { default: m.default as T };
    }
    if (m.default?.default && typeof m.default.default === 'function') {
      return { default: m.default.default as T };
    }
  }

  // Fallback - return as-is and hope for the best
  return mod as { default: T };
};

/**
 *
 * @param factory function that retuns a promise of a component
 * @returns a lazy loaded component. you can pass a fallback to the component that renders on server or when the component is not loaded
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const loadable = <T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) => {
  // Wrap factory to normalize module format for ESM/CJS interop
  const normalizedFactory = () => factory().then(normalizeModule);
  const Component = lazyWithPreload(normalizedFactory);

  const LoadableComponent = React.forwardRef(
    (
      {
        fallback = null,
        ...props
      }: ComponentProps<T> & {
        /**
         * render a fallback on server or if the component is not loaded
         */
        fallback?: ReactElement;
      },
      ref
    ) => {
      const isServer = useIsServer();
      if (isServer) {
        return fallback ?? null;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Inner = Component as any;

      return (
        <Suspense fallback={fallback}>
          <Inner ref={ref} {...props} />
        </Suspense>
      );
    }
  );

  const LoadableComponentWithPreload: typeof LoadableComponent & {
    load: () => Promise<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = LoadableComponent as any;
  LoadableComponentWithPreload.load = Component.preload;

  return LoadableComponentWithPreload;
};

export default loadable;
