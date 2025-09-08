import * as React from 'react';

declare module '@/components/theme-provider' {
  export interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: string;
    storageKey?: string;
  }
  
  export function ThemeProvider(props: ThemeProviderProps): JSX.Element;
}
