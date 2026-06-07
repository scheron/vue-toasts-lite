import hljs from "highlight.js/lib/core"
import bash from "highlight.js/lib/languages/bash"
import css from "highlight.js/lib/languages/css"
import javascript from "highlight.js/lib/languages/javascript"
import xml from "highlight.js/lib/languages/xml"

import "highlight.js/styles/github-dark.css"

let registered = false

function ensureRegistered() {
  if (registered) return
  hljs.registerLanguage("javascript", javascript)
  hljs.registerLanguage("xml", xml)
  hljs.registerLanguage("css", css)
  hljs.registerLanguage("bash", bash)
  registered = true
}

export function highlightInto(el: HTMLElement) {
  ensureRegistered()
  el.removeAttribute("data-highlighted")
  hljs.highlightElement(el)
}
