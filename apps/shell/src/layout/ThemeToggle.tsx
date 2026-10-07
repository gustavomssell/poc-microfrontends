import { Button } from '@microstore/ui';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * Toggle claro/escuro do shell.
 *
 * O next-themes aplica/remove a classe `.dark` no <html>; como shell e
 * remotes compartilham o mesmo documento, o tema propagado por CSS
 * alcança todos os microfrontends sem nenhuma coordenação em JS.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Carregando preferência de tema"
        disabled
      >
        <SunIcon />
      </Button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? 'Mudar para o modo claro' : 'Mudar para o modo escuro'}
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
