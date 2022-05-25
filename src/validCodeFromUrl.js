const codeRegExp = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/


module.exports = function validCodeFromUrl(url) {
    if (typeof url === 'string') {
        const u = new URL(url, 'https://www.youtube.com/watch')
        if (u && (u.host === 'youtu.be' || u.host === 'www.youtube.com')) {
            const m = u.href.match(codeRegExp)
            if (m && m[6]) {
                return m['6']
            }
        }
    }
}