/**
 * État d'un chargement de données, tel que le service le publie.
 * Les quatre cas de l'interface (spécifications : loading / empty / error)
 * sont décrits par le type, donc impossibles à oublier dans les pages.
 */
export type LoadStatus = 'loading' | 'loaded' | 'empty' | 'error';

export type LoadState<T> =
  | { status: 'loading' }
  | { status: 'loaded'; data: T }
  | { status: 'empty' }
  | { status: 'error'; message: string };
