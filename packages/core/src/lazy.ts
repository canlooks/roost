export function lazy<T extends () => Promise<{ default: any }>>(load: T): T {
    return load
}