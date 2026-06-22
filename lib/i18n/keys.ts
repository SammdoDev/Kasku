import idLocale from "./locales/id.json";
import type id from "./locales/id.json";

export type TranslationKey = keyof typeof id;

function toCamelCase(str: string): string {
  return str.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

type CamelCase<S extends string> = S extends `${infer P}_${infer Q}`
  ? `${Lowercase<P>}${Capitalize<CamelCase<Q>>}`
  : Lowercase<S>;

type CamelKeys = {
  [K in TranslationKey as CamelCase<K>]: K;
};

export const CONSTANT = Object.fromEntries(
  Object.keys(idLocale).map((key) => [toCamelCase(key), key]),
) as CamelKeys;
