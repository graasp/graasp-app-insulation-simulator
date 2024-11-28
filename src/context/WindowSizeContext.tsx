import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { Vector3 } from 'three';

import { undefinedContextErrorFactory } from '@/utils/context';

const WindowScaleSize = {
  Small: new Vector3(0.8, 0.8, 1),
  Medium: new Vector3(1, 1, 1),
  Large: new Vector3(1.2, 1.2, 1),
} as const;

export const WindowSizes = Object.keys(WindowScaleSize);

export type WindowSizeType = keyof typeof WindowScaleSize;

type WindowSizeContextType = {
  windowScaleSize: Vector3;
  windowSize: WindowSizeType;
  changeWindowSize: (newSize: WindowSizeType) => void;
};

const WindowSizeContext = createContext<WindowSizeContextType | null>(null);

type Props = {
  children: ReactNode;
};

export const WindowSizeProvider = ({ children }: Props): ReactNode => {
  const [windowSize, setWindowSize] = useState<WindowSizeType>('Medium');

  const changeWindowSize = useCallback(
    (newSize: WindowSizeType): void => setWindowSize(newSize),
    [],
  );

  const contextValue = useMemo(
    () => ({
      windowSize,
      windowScaleSize: WindowScaleSize[windowSize],
      changeWindowSize,
    }),
    [windowSize, changeWindowSize],
  );

  return (
    <WindowSizeContext.Provider value={contextValue}>
      {children}
    </WindowSizeContext.Provider>
  );
};

export const useWindowSize = (): WindowSizeContextType => {
  const context = useContext(WindowSizeContext);

  if (!context) {
    throw undefinedContextErrorFactory('WindowSize');
  }

  return context;
};
