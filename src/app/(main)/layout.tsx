'use client';

import { FC, ReactNode, useEffect, useState } from 'react';

import { ColorPrefrencesProvider  } from '@/providers/color-preferences';
import { ThemeProvider } from '@/providers/theme-provider';
import MainContent from '@/components/main-content';
import { WebSocketProvider } from '@/providers/web-socket';
import { QueryProvider } from '@/providers/query-provider';

const MainLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Ensures client-only rendering after component mounts
  }, []);

  if (!isMounted) return null; // Prevents SSR from rendering until client mount

  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      disableTransitionOnChange
    >
      <WebSocketProvider>
        <ColorPrefrencesProvider>
          <MainContent>
            <QueryProvider>
              {children}
            </QueryProvider>
          </MainContent>
        </ColorPrefrencesProvider>
      </WebSocketProvider>
    </ThemeProvider>
  );
};

export default MainLayout;
