import { Button } from '@microstore/ui';
import { ActivityIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'microstore-telemetry';

/**
 * Modo avaliador: mostra/esconde a telemetria de arquitetura (chips de
 * status no header, portas no rodapé, badges "remote · :porta").
 *
 * A preferência vira a classe `telemetry-off` no <html>; o CSS no
 * theme.css esconde os elementos [data-telemetry] — mesma engenharia do
 * dark mode: um toggle no shell alcança todos os microfrontends porque
 * compartilham o documento.
 */
export function TelemetryToggle() {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(STORAGE_KEY) !== 'off');
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !visible;
    setVisible(next);
    document.documentElement.classList.toggle('telemetry-off', !next);
    localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off');
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Carregando modo avaliador"
        disabled
      >
        <ActivityIcon />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={
        visible
          ? 'Ocultar telemetria (modo avaliador)'
          : 'Mostrar telemetria (modo avaliador)'
      }
      aria-pressed={visible}
      title="Modo avaliador — telemetria de arquitetura"
      onClick={toggle}
    >
      <ActivityIcon />
    </Button>
  );
}
