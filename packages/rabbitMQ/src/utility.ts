export function resolveUrl(options: {
    username?: string
    password?: string
    url: string
}) {
    let url: URL | undefined
    let urlStr: string
    try {
        url = new URL(options.url)
    } catch (e) {
        urlStr = options.url
    }

    const {username, password} = options
    if (username && password) {
        if (url) {
            url.hostname = `${username}:${password}@${url.hostname}`
            urlStr = url.href
        } else {
            urlStr = `${username}:${password}@${urlStr!}`
        }
    }

    return urlStr!
}