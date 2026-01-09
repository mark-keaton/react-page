/* eslint-disable @typescript-eslint/ban-types */
import type { Dispatch } from 'react';
import React from 'react';
import type { ReactReduxContextValue, TypedUseSelectorHook } from 'react-redux';
import {
  createDispatchHook,
  createSelectorHook,
  createStoreHook,
  Provider,
} from 'react-redux';
import type { RootState } from './types';
import type { UnknownAction } from 'redux';

export const ReduxContext = React.createContext<ReactReduxContextValue<
  RootState,
  UnknownAction
> | null>(null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ReduxProvider = ({ store, ...props }: any) => (
  <Provider store={store} context={ReduxContext} {...props} />
);

export const useStore = createStoreHook(ReduxContext);
export const useDispatch = createDispatchHook(
  ReduxContext
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) as () => Dispatch<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useSelectorBase = createSelectorHook(ReduxContext as any);
export const useSelector: TypedUseSelectorHook<RootState> = useSelectorBase;
