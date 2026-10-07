const IDS_KEY = '__MICROSTORE_CART_STORE_IDS__';

type GlobalWithIds = Record<string, unknown>;

function readIds(): string[] {
  return ((globalThis as GlobalWithIds)[IDS_KEY] as string[] | undefined) ?? [];
}

function writeIds(ids: string[]): void {
  (globalThis as GlobalWithIds)[IDS_KEY] = ids;
}

/**
 * Identificador desta avaliação do módulo.
 *
 * Se o Module Federation compartilhar o pacote corretamente, todos os MFEs
 * importam a MESMA avaliação do módulo → um único id. Se cada app embalar a
 * própria cópia, cada cópia registra um id e a contagem vira > 1 — o chip de
 * status do shell denuncia a divergência em vez de falhar silenciosamente.
 */
export const storeModuleId: string =
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const initialIds = readIds();
if (!initialIds.includes(storeModuleId)) {
  writeIds([...initialIds, storeModuleId]);
}

export function getStoreInstanceIds(): string[] {
  return readIds();
}

export function resetStoreInstanceIds(): void {
  writeIds([]);
}
