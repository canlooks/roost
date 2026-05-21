/**
 * 统一使用"/"，并且排除"//"的情况
 * @param path
 */
export function unifySlash(path: string) {
    return path
        .replace(/\\/g, '/')
        .replace(/\/+/g, '/')
}

/**
 * 去掉末尾的"/"，执行该方法前需要先执行{@link unifySlash}
 * @param path
 */
export function dropEndSlash(path: string) {
    return path.replace(/\/+$/, '')
}

/**
 * 去掉路径的search和hash
 * @param path
 */
function dropSearchAndHash(path: string) {
    const drop = (path: string, symbol: '$' | '#') => {
        const index = path.indexOf(symbol)
        if (index > -1) {
            return path.slice(0, index)
        }
        return path
    }
    path = drop(path, '$')
    return drop(path, '#')
}

/**
 * 去掉路径的最后一段，执行该方法前需要先执行{@link unifySlash}和{@link dropSearchAndHash}
 * @param path
 */
export function dropLastPortion(path: string) {
    return path.replace(/\/[^/]+\/*$/, '')
}

/**
 * 拼接路径
 * @param paths
 */
export function joinPath(...paths: string[]) {
    if (paths.length === 0) {
        return ''
    }
    if (paths.length === 1) {
        let [path] = paths
        path = unifySlash(path)
        return dropEndSlash(path)
    }
    const fn = (prev: string, next: string) => {
        if (/^[a-zA-Z]+:/.test(next)) {
            return next
        }
        prev = unifySlash(prev)
        prev = dropSearchAndHash(prev)
        next = unifySlash(next)
        if (!prev) {
            return next
        }
        if (!next) {
            return prev
        }
        const [l] = next
        // 特殊开头，开启新路径
        if (l === '/') {
            return next
        }
        // ".."或"../"开头，去掉prev的前一段后递归
        if (next.startsWith('..')) {
            return fn(
                dropLastPortion(prev),
                next.replace(/^\.\.\/?/, '')
            )
        }
        // "."或"./"开头，直接递归
        if (l === '.') {
            return fn(prev, next.replace(/^\.\/?/, ''))
        }
        return `${dropEndSlash(prev)}/${dropEndSlash(next)}`
    }
    return paths.reduce(fn)
}

export function sortObjectKeys(obj: Record<string, any>) {

}