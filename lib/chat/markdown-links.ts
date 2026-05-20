/**
 * Converts bare URLs and email addresses into markdown links so ReactMarkdown renders them clickable.
 */
export function enrichMarkdownLinks(content: string): string {
  let result = content

  result = result.replace(
    /(?<!\]\()(https?:\/\/[^\s)\]]+)/gi,
    (match) => {
      const trailingMatch = match.match(/[.,;:!?)]+$/)
      const trailing = trailingMatch?.[0] ?? ''
      const url = trailing ? match.slice(0, -trailing.length) : match
      return `[${url}](${url})${trailing}`
    }
  )

  result = result.replace(
    /(?<![(\[<])([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?![\w.-])/g,
    '[$1](mailto:$1)'
  )

  return result
}
