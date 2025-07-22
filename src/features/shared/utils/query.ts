export const parseAsSet = <T>() => ({
  parse: (value: string) =>
    value ? (new Set(JSON.parse(decodeURIComponent(value))) as Set<T>) : null,
  serialize: (value: Set<T>) =>
    encodeURIComponent(JSON.stringify(Array.from(value))),
});
