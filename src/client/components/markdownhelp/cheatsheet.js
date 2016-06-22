/* eslint max-len: 0 */
export default `
This page is intended to be a quick reference. For complete info, see [John Gruber's original spec](http://daringfireball.net/projects/markdown/) and the [Mastering Markdown](https://guides.github.com/features/mastering-markdown/) guide from Github.

### Headers
\`\`\`
# H1
## H2
### H3
#### H4
##### H5
###### H6

Alternatively, for H1 and H2, an underline-ish style:

Alt-H1
======

Alt-H2
------
\`\`\`

### Emphasis

*Emphasis*, aka _italics_, with \`*asterisks*\` or \`_underscores_\`.
**Strong** emphasis, aka __bold__, with \`**asterisks**\` or \`__underscores__\`.
**Combined _emphasis_** with \`**asterisks and _underscores_**\`.
~~Strikethrough~~ uses two tildes. \`~~Scratch this.~~\`

### Lists

\`\`\`
1. First ordered list item
2. Another item
  * Unordered sub-list.
1. Actual numbers don't matter, just that it's a number
  1. Ordered sub-list
4. And another item.

* Unordered list can use asterisks
- Or minuses
+ Or pluses
\`\`\`

### Links
\`\`\`
[I'm an inline-style link](https://www.google.com)
[I'm an inline-style link with title](https://www.google.com "Google's Homepage")
[I'm a reference-style link][Arbitrary case-insensitive reference text]
[I'm a relative reference to a repository file](../blob/master/LICENSE)
[You can use numbers for reference-style link definitions][1]
Or leave it empty and use the [link text itself].
\`\`\`

### Images
\`\`\`
Inline-style:
![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Logo Title Text 1")

Reference-style:
![alt text][logo]

[logo]: https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Logo Title Text 2"
\`\`\`

### Code and Syntax Highlighting

Inline \`code\` has \`\`\` \`back-ticks around\` \`\`\` it.

Code blocks should be surrounded by three back-ticks:
\`\`\`
    \`\`\`
    var s = "JavaScript syntax highlighting";
    alert(s);
    \`\`\`
\`\`\`

### Tables

\`\`\`
| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |

There must be at least 3 dashes separating each header cell.
The outer pipes (|) are optional, and you don't need to make the
raw Markdown line up prettily. You can also use inline Markdown.

Markdown | Less | Pretty
--- | --- | ---
*Still* | \`renders\` | **nicely**
1 | 2 | 3
\`\`\`

### Blockquotes

\`\`\`
> Blockquotes are very handy in email to emulate reply text.
> This line is part of the same quote.

Quote break.

> This is a very long line that will still be quoted properly when it wraps. Oh boy let's keep writing to make sure this is long enough to actually wrap for everyone. Oh, you can *put* **Markdown** into a blockquote.
\`\`\`

### Horizontal Rule
\`\`\`
Three or more...

---
Hyphens

***
Asterisks

___
Underscores
\`\`\`

### Widgets

Anything that can be embedded via iframe, can be inserted into Shard chat using widget syntax.
E.g. to insert youtube video you can use the following markup:
\`\`\`
%%% widget=https://www.youtube.com/embed/b3ADsUFJ46Y
\`\`\`
`;
