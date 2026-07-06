export function highlightedRegexMatch({
  toMatch,
  query,
}: {
  toMatch: string
  query: string
}) {
  function splitQueryToRegexChunks(query: string) {
    // TODO: replace with RegExp.escape() https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/escape
    // ... or pull in package
    const replacedQuery = query.replace(
      /([\^\$\.\*\+\?\\(\\)\[\]\{\}\|])/g,
      '\\$1',
    )
    const chunks: RegExp[] = []
    const queryChars = replacedQuery.split('')
    const regexString = '[\\s:\\[\\];:"\'-=+_]*'
    let store = ''
    let storeWithRegex = ''
    let lap = 0
    for (let j = 0; j < queryChars.length; j++) {
      for (let i = 0 + lap; i < queryChars.length; i++) {
        const char = queryChars[i]
        let charWithRegex = char + regexString
        if (char === ' ') {
          charWithRegex = ''
        }
        const isFirst = i - lap === 0
        const isLast = i === queryChars.length - 1
        if (isLast) {
          charWithRegex = char
        }
        if (isFirst) {
          store = ''
          storeWithRegex = ''
        }
        if (isLast) {
          lap++
        }
        store = store + char
        storeWithRegex = storeWithRegex + charWithRegex
        try {
          chunks.push(new RegExp(storeWithRegex, 'i'))
        } catch {
          console.log('failed to parse to regex: \n\n', storeWithRegex)
        }
      }
    }
    return [...new Set([...chunks])]
  }
  const emptyMatch = { beforeMatch: 0, matched: 0, afterMatched: 0 }
  const regexChunks = splitQueryToRegexChunks(query)
  const matchingRegex = regexChunks.filter((reg) => reg.test(toMatch))
  const [longestMatch] = matchingRegex.sort(
    (a, b) => `${b}`.length - `${a}`.length,
  )
  const matchGroup = toMatch.match(longestMatch)
  if (!matchGroup) return emptyMatch

  const [matchedText] = matchGroup
  const matchIndex = matchGroup.index ?? 0
  const splitMatch = toMatch.split('')
  const start = splitMatch.slice(0, matchIndex)
  const matched = splitMatch.slice(matchIndex, matchIndex + matchedText.length)
  const remaining = splitMatch.slice(matchIndex + matchedText.length)
  return { beforeMatch: start, matched, afterMatched: remaining }
}
