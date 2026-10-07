const IDS_KEY = '__MICROSTORE_EVENT_BUS_IDS__';

type GlobalWithIds = Record<string, unknown>;

function readIds(): string[] {
  return ((globalThis as GlobalWithIds)[IDS_KEY] as string[] | undefined) ?? [];
}

function writeIds(ids: string[]): void {
  (globalThis as GlobalWithIds)[IDS_KEY] = ids;
}

/**
 * Mesmo truque da cart-store: cada avaliação do módulo registra seu id.
 * Uma cópia por app = ids > 1 = emissores e ouvintes falando com silêncio.
 */
export const busModuleId: string =
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const initialIds = readIds();
if (!initialIds.includes(busModuleId)) {
  writeIds([...initialIds, busModuleId]);
}

export function getEventBusInstanceIds(): string[] {
  return readIds();
}

export function resetEventBusInstanceIds(): void {
  writeIds([]);
}
