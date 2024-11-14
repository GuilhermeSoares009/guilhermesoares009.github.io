/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./source/assets/css/app.scss":
/*!************************************!*\
  !*** ./source/assets/css/app.scss ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./node_modules/highlight.js/lib/core.js":
/*!***********************************************!*\
  !*** ./node_modules/highlight.js/lib/core.js ***!
  \***********************************************/
/***/ ((module) => {

/* eslint-disable no-multi-assign */

function deepFreeze(obj) {
  if (obj instanceof Map) {
    obj.clear =
      obj.delete =
      obj.set =
        function () {
          throw new Error('map is read-only');
        };
  } else if (obj instanceof Set) {
    obj.add =
      obj.clear =
      obj.delete =
        function () {
          throw new Error('set is read-only');
        };
  }

  // Freeze self
  Object.freeze(obj);

  Object.getOwnPropertyNames(obj).forEach((name) => {
    const prop = obj[name];
    const type = typeof prop;

    // Freeze prop if it is an object or function and also not already frozen
    if ((type === 'object' || type === 'function') && !Object.isFrozen(prop)) {
      deepFreeze(prop);
    }
  });

  return obj;
}

/** @typedef {import('highlight.js').CallbackResponse} CallbackResponse */
/** @typedef {import('highlight.js').CompiledMode} CompiledMode */
/** @implements CallbackResponse */

class Response {
  /**
   * @param {CompiledMode} mode
   */
  constructor(mode) {
    // eslint-disable-next-line no-undefined
    if (mode.data === undefined) mode.data = {};

    this.data = mode.data;
    this.isMatchIgnored = false;
  }

  ignoreMatch() {
    this.isMatchIgnored = true;
  }
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeHTML(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * performs a shallow merge of multiple objects into one
 *
 * @template T
 * @param {T} original
 * @param {Record<string,any>[]} objects
 * @returns {T} a single new object
 */
function inherit$1(original, ...objects) {
  /** @type Record<string,any> */
  const result = Object.create(null);

  for (const key in original) {
    result[key] = original[key];
  }
  objects.forEach(function(obj) {
    for (const key in obj) {
      result[key] = obj[key];
    }
  });
  return /** @type {T} */ (result);
}

/**
 * @typedef {object} Renderer
 * @property {(text: string) => void} addText
 * @property {(node: Node) => void} openNode
 * @property {(node: Node) => void} closeNode
 * @property {() => string} value
 */

/** @typedef {{scope?: string, language?: string, sublanguage?: boolean}} Node */
/** @typedef {{walk: (r: Renderer) => void}} Tree */
/** */

const SPAN_CLOSE = '</span>';

/**
 * Determines if a node needs to be wrapped in <span>
 *
 * @param {Node} node */
const emitsWrappingTags = (node) => {
  // rarely we can have a sublanguage where language is undefined
  // TODO: track down why
  return !!node.scope;
};

/**
 *
 * @param {string} name
 * @param {{prefix:string}} options
 */
const scopeToCSSClass = (name, { prefix }) => {
  // sub-language
  if (name.startsWith("language:")) {
    return name.replace("language:", "language-");
  }
  // tiered scope: comment.line
  if (name.includes(".")) {
    const pieces = name.split(".");
    return [
      `${prefix}${pieces.shift()}`,
      ...(pieces.map((x, i) => `${x}${"_".repeat(i + 1)}`))
    ].join(" ");
  }
  // simple scope
  return `${prefix}${name}`;
};

/** @type {Renderer} */
class HTMLRenderer {
  /**
   * Creates a new HTMLRenderer
   *
   * @param {Tree} parseTree - the parse tree (must support `walk` API)
   * @param {{classPrefix: string}} options
   */
  constructor(parseTree, options) {
    this.buffer = "";
    this.classPrefix = options.classPrefix;
    parseTree.walk(this);
  }

  /**
   * Adds texts to the output stream
   *
   * @param {string} text */
  addText(text) {
    this.buffer += escapeHTML(text);
  }

  /**
   * Adds a node open to the output stream (if needed)
   *
   * @param {Node} node */
  openNode(node) {
    if (!emitsWrappingTags(node)) return;

    const className = scopeToCSSClass(node.scope,
      { prefix: this.classPrefix });
    this.span(className);
  }

  /**
   * Adds a node close to the output stream (if needed)
   *
   * @param {Node} node */
  closeNode(node) {
    if (!emitsWrappingTags(node)) return;

    this.buffer += SPAN_CLOSE;
  }

  /**
   * returns the accumulated buffer
  */
  value() {
    return this.buffer;
  }

  // helpers

  /**
   * Builds a span element
   *
   * @param {string} className */
  span(className) {
    this.buffer += `<span class="${className}">`;
  }
}

/** @typedef {{scope?: string, language?: string, children: Node[]} | string} Node */
/** @typedef {{scope?: string, language?: string, children: Node[]} } DataNode */
/** @typedef {import('highlight.js').Emitter} Emitter */
/**  */

/** @returns {DataNode} */
const newNode = (opts = {}) => {
  /** @type DataNode */
  const result = { children: [] };
  Object.assign(result, opts);
  return result;
};

class TokenTree {
  constructor() {
    /** @type DataNode */
    this.rootNode = newNode();
    this.stack = [this.rootNode];
  }

  get top() {
    return this.stack[this.stack.length - 1];
  }

  get root() { return this.rootNode; }

  /** @param {Node} node */
  add(node) {
    this.top.children.push(node);
  }

  /** @param {string} scope */
  openNode(scope) {
    /** @type Node */
    const node = newNode({ scope });
    this.add(node);
    this.stack.push(node);
  }

  closeNode() {
    if (this.stack.length > 1) {
      return this.stack.pop();
    }
    // eslint-disable-next-line no-undefined
    return undefined;
  }

  closeAllNodes() {
    while (this.closeNode());
  }

  toJSON() {
    return JSON.stringify(this.rootNode, null, 4);
  }

  /**
   * @typedef { import("./html_renderer").Renderer } Renderer
   * @param {Renderer} builder
   */
  walk(builder) {
    // this does not
    return this.constructor._walk(builder, this.rootNode);
    // this works
    // return TokenTree._walk(builder, this.rootNode);
  }

  /**
   * @param {Renderer} builder
   * @param {Node} node
   */
  static _walk(builder, node) {
    if (typeof node === "string") {
      builder.addText(node);
    } else if (node.children) {
      builder.openNode(node);
      node.children.forEach((child) => this._walk(builder, child));
      builder.closeNode(node);
    }
    return builder;
  }

  /**
   * @param {Node} node
   */
  static _collapse(node) {
    if (typeof node === "string") return;
    if (!node.children) return;

    if (node.children.every(el => typeof el === "string")) {
      // node.text = node.children.join("");
      // delete node.children;
      node.children = [node.children.join("")];
    } else {
      node.children.forEach((child) => {
        TokenTree._collapse(child);
      });
    }
  }
}

/**
  Currently this is all private API, but this is the minimal API necessary
  that an Emitter must implement to fully support the parser.

  Minimal interface:

  - addText(text)
  - __addSublanguage(emitter, subLanguageName)
  - startScope(scope)
  - endScope()
  - finalize()
  - toHTML()

*/

/**
 * @implements {Emitter}
 */
class TokenTreeEmitter extends TokenTree {
  /**
   * @param {*} options
   */
  constructor(options) {
    super();
    this.options = options;
  }

  /**
   * @param {string} text
   */
  addText(text) {
    if (text === "") { return; }

    this.add(text);
  }

  /** @param {string} scope */
  startScope(scope) {
    this.openNode(scope);
  }

  endScope() {
    this.closeNode();
  }

  /**
   * @param {Emitter & {root: DataNode}} emitter
   * @param {string} name
   */
  __addSublanguage(emitter, name) {
    /** @type DataNode */
    const node = emitter.root;
    if (name) node.scope = `language:${name}`;

    this.add(node);
  }

  toHTML() {
    const renderer = new HTMLRenderer(this, this.options);
    return renderer.value();
  }

  finalize() {
    this.closeAllNodes();
    return true;
  }
}

/**
 * @param {string} value
 * @returns {RegExp}
 * */

/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function source(re) {
  if (!re) return null;
  if (typeof re === "string") return re;

  return re.source;
}

/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function lookahead(re) {
  return concat('(?=', re, ')');
}

/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function anyNumberOfTimes(re) {
  return concat('(?:', re, ')*');
}

/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function optional(re) {
  return concat('(?:', re, ')?');
}

/**
 * @param {...(RegExp | string) } args
 * @returns {string}
 */
function concat(...args) {
  const joined = args.map((x) => source(x)).join("");
  return joined;
}

/**
 * @param { Array<string | RegExp | Object> } args
 * @returns {object}
 */
function stripOptionsFromArgs(args) {
  const opts = args[args.length - 1];

  if (typeof opts === 'object' && opts.constructor === Object) {
    args.splice(args.length - 1, 1);
    return opts;
  } else {
    return {};
  }
}

/** @typedef { {capture?: boolean} } RegexEitherOptions */

/**
 * Any of the passed expresssions may match
 *
 * Creates a huge this | this | that | that match
 * @param {(RegExp | string)[] | [...(RegExp | string)[], RegexEitherOptions]} args
 * @returns {string}
 */
function either(...args) {
  /** @type { object & {capture?: boolean} }  */
  const opts = stripOptionsFromArgs(args);
  const joined = '('
    + (opts.capture ? "" : "?:")
    + args.map((x) => source(x)).join("|") + ")";
  return joined;
}

/**
 * @param {RegExp | string} re
 * @returns {number}
 */
function countMatchGroups(re) {
  return (new RegExp(re.toString() + '|')).exec('').length - 1;
}

/**
 * Does lexeme start with a regular expression match at the beginning
 * @param {RegExp} re
 * @param {string} lexeme
 */
function startsWith(re, lexeme) {
  const match = re && re.exec(lexeme);
  return match && match.index === 0;
}

// BACKREF_RE matches an open parenthesis or backreference. To avoid
// an incorrect parse, it additionally matches the following:
// - [...] elements, where the meaning of parentheses and escapes change
// - other escape sequences, so we do not misparse escape sequences as
//   interesting elements
// - non-matching or lookahead parentheses, which do not capture. These
//   follow the '(' with a '?'.
const BACKREF_RE = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;

// **INTERNAL** Not intended for outside usage
// join logically computes regexps.join(separator), but fixes the
// backreferences so they continue to match.
// it also places each individual regular expression into it's own
// match group, keeping track of the sequencing of those match groups
// is currently an exercise for the caller. :-)
/**
 * @param {(string | RegExp)[]} regexps
 * @param {{joinWith: string}} opts
 * @returns {string}
 */
function _rewriteBackreferences(regexps, { joinWith }) {
  let numCaptures = 0;

  return regexps.map((regex) => {
    numCaptures += 1;
    const offset = numCaptures;
    let re = source(regex);
    let out = '';

    while (re.length > 0) {
      const match = BACKREF_RE.exec(re);
      if (!match) {
        out += re;
        break;
      }
      out += re.substring(0, match.index);
      re = re.substring(match.index + match[0].length);
      if (match[0][0] === '\\' && match[1]) {
        // Adjust the backreference.
        out += '\\' + String(Number(match[1]) + offset);
      } else {
        out += match[0];
        if (match[0] === '(') {
          numCaptures++;
        }
      }
    }
    return out;
  }).map(re => `(${re})`).join(joinWith);
}

/** @typedef {import('highlight.js').Mode} Mode */
/** @typedef {import('highlight.js').ModeCallback} ModeCallback */

// Common regexps
const MATCH_NOTHING_RE = /\b\B/;
const IDENT_RE = '[a-zA-Z]\\w*';
const UNDERSCORE_IDENT_RE = '[a-zA-Z_]\\w*';
const NUMBER_RE = '\\b\\d+(\\.\\d+)?';
const C_NUMBER_RE = '(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)'; // 0x..., 0..., decimal, float
const BINARY_NUMBER_RE = '\\b(0b[01]+)'; // 0b...
const RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';

/**
* @param { Partial<Mode> & {binary?: string | RegExp} } opts
*/
const SHEBANG = (opts = {}) => {
  const beginShebang = /^#![ ]*\//;
  if (opts.binary) {
    opts.begin = concat(
      beginShebang,
      /.*\b/,
      opts.binary,
      /\b.*/);
  }
  return inherit$1({
    scope: 'meta',
    begin: beginShebang,
    end: /$/,
    relevance: 0,
    /** @type {ModeCallback} */
    "on:begin": (m, resp) => {
      if (m.index !== 0) resp.ignoreMatch();
    }
  }, opts);
};

// Common modes
const BACKSLASH_ESCAPE = {
  begin: '\\\\[\\s\\S]', relevance: 0
};
const APOS_STRING_MODE = {
  scope: 'string',
  begin: '\'',
  end: '\'',
  illegal: '\\n',
  contains: [BACKSLASH_ESCAPE]
};
const QUOTE_STRING_MODE = {
  scope: 'string',
  begin: '"',
  end: '"',
  illegal: '\\n',
  contains: [BACKSLASH_ESCAPE]
};
const PHRASAL_WORDS_MODE = {
  begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
};
/**
 * Creates a comment mode
 *
 * @param {string | RegExp} begin
 * @param {string | RegExp} end
 * @param {Mode | {}} [modeOptions]
 * @returns {Partial<Mode>}
 */
const COMMENT = function(begin, end, modeOptions = {}) {
  const mode = inherit$1(
    {
      scope: 'comment',
      begin,
      end,
      contains: []
    },
    modeOptions
  );
  mode.contains.push({
    scope: 'doctag',
    // hack to avoid the space from being included. the space is necessary to
    // match here to prevent the plain text rule below from gobbling up doctags
    begin: '[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)',
    end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
    excludeBegin: true,
    relevance: 0
  });
  const ENGLISH_WORD = either(
    // list of common 1 and 2 letter words in English
    "I",
    "a",
    "is",
    "so",
    "us",
    "to",
    "at",
    "if",
    "in",
    "it",
    "on",
    // note: this is not an exhaustive list of contractions, just popular ones
    /[A-Za-z]+['](d|ve|re|ll|t|s|n)/, // contractions - can't we'd they're let's, etc
    /[A-Za-z]+[-][a-z]+/, // `no-way`, etc.
    /[A-Za-z][a-z]{2,}/ // allow capitalized words at beginning of sentences
  );
  // looking like plain text, more likely to be a comment
  mode.contains.push(
    {
      // TODO: how to include ", (, ) without breaking grammars that use these for
      // comment delimiters?
      // begin: /[ ]+([()"]?([A-Za-z'-]{3,}|is|a|I|so|us|[tT][oO]|at|if|in|it|on)[.]?[()":]?([.][ ]|[ ]|\))){3}/
      // ---

      // this tries to find sequences of 3 english words in a row (without any
      // "programming" type syntax) this gives us a strong signal that we've
      // TRULY found a comment - vs perhaps scanning with the wrong language.
      // It's possible to find something that LOOKS like the start of the
      // comment - but then if there is no readable text - good chance it is a
      // false match and not a comment.
      //
      // for a visual example please see:
      // https://github.com/highlightjs/highlight.js/issues/2827

      begin: concat(
        /[ ]+/, // necessary to prevent us gobbling up doctags like /* @author Bob Mcgill */
        '(',
        ENGLISH_WORD,
        /[.]?[:]?([.][ ]|[ ])/,
        '){3}') // look for 3 words in a row
    }
  );
  return mode;
};
const C_LINE_COMMENT_MODE = COMMENT('//', '$');
const C_BLOCK_COMMENT_MODE = COMMENT('/\\*', '\\*/');
const HASH_COMMENT_MODE = COMMENT('#', '$');
const NUMBER_MODE = {
  scope: 'number',
  begin: NUMBER_RE,
  relevance: 0
};
const C_NUMBER_MODE = {
  scope: 'number',
  begin: C_NUMBER_RE,
  relevance: 0
};
const BINARY_NUMBER_MODE = {
  scope: 'number',
  begin: BINARY_NUMBER_RE,
  relevance: 0
};
const REGEXP_MODE = {
  scope: "regexp",
  begin: /\/(?=[^/\n]*\/)/,
  end: /\/[gimuy]*/,
  contains: [
    BACKSLASH_ESCAPE,
    {
      begin: /\[/,
      end: /\]/,
      relevance: 0,
      contains: [BACKSLASH_ESCAPE]
    }
  ]
};
const TITLE_MODE = {
  scope: 'title',
  begin: IDENT_RE,
  relevance: 0
};
const UNDERSCORE_TITLE_MODE = {
  scope: 'title',
  begin: UNDERSCORE_IDENT_RE,
  relevance: 0
};
const METHOD_GUARD = {
  // excludes method names from keyword processing
  begin: '\\.\\s*' + UNDERSCORE_IDENT_RE,
  relevance: 0
};

/**
 * Adds end same as begin mechanics to a mode
 *
 * Your mode must include at least a single () match group as that first match
 * group is what is used for comparison
 * @param {Partial<Mode>} mode
 */
const END_SAME_AS_BEGIN = function(mode) {
  return Object.assign(mode,
    {
      /** @type {ModeCallback} */
      'on:begin': (m, resp) => { resp.data._beginMatch = m[1]; },
      /** @type {ModeCallback} */
      'on:end': (m, resp) => { if (resp.data._beginMatch !== m[1]) resp.ignoreMatch(); }
    });
};

var MODES = /*#__PURE__*/Object.freeze({
  __proto__: null,
  APOS_STRING_MODE: APOS_STRING_MODE,
  BACKSLASH_ESCAPE: BACKSLASH_ESCAPE,
  BINARY_NUMBER_MODE: BINARY_NUMBER_MODE,
  BINARY_NUMBER_RE: BINARY_NUMBER_RE,
  COMMENT: COMMENT,
  C_BLOCK_COMMENT_MODE: C_BLOCK_COMMENT_MODE,
  C_LINE_COMMENT_MODE: C_LINE_COMMENT_MODE,
  C_NUMBER_MODE: C_NUMBER_MODE,
  C_NUMBER_RE: C_NUMBER_RE,
  END_SAME_AS_BEGIN: END_SAME_AS_BEGIN,
  HASH_COMMENT_MODE: HASH_COMMENT_MODE,
  IDENT_RE: IDENT_RE,
  MATCH_NOTHING_RE: MATCH_NOTHING_RE,
  METHOD_GUARD: METHOD_GUARD,
  NUMBER_MODE: NUMBER_MODE,
  NUMBER_RE: NUMBER_RE,
  PHRASAL_WORDS_MODE: PHRASAL_WORDS_MODE,
  QUOTE_STRING_MODE: QUOTE_STRING_MODE,
  REGEXP_MODE: REGEXP_MODE,
  RE_STARTERS_RE: RE_STARTERS_RE,
  SHEBANG: SHEBANG,
  TITLE_MODE: TITLE_MODE,
  UNDERSCORE_IDENT_RE: UNDERSCORE_IDENT_RE,
  UNDERSCORE_TITLE_MODE: UNDERSCORE_TITLE_MODE
});

/**
@typedef {import('highlight.js').CallbackResponse} CallbackResponse
@typedef {import('highlight.js').CompilerExt} CompilerExt
*/

// Grammar extensions / plugins
// See: https://github.com/highlightjs/highlight.js/issues/2833

// Grammar extensions allow "syntactic sugar" to be added to the grammar modes
// without requiring any underlying changes to the compiler internals.

// `compileMatch` being the perfect small example of now allowing a grammar
// author to write `match` when they desire to match a single expression rather
// than being forced to use `begin`.  The extension then just moves `match` into
// `begin` when it runs.  Ie, no features have been added, but we've just made
// the experience of writing (and reading grammars) a little bit nicer.

// ------

// TODO: We need negative look-behind support to do this properly
/**
 * Skip a match if it has a preceding dot
 *
 * This is used for `beginKeywords` to prevent matching expressions such as
 * `bob.keyword.do()`. The mode compiler automatically wires this up as a
 * special _internal_ 'on:begin' callback for modes with `beginKeywords`
 * @param {RegExpMatchArray} match
 * @param {CallbackResponse} response
 */
function skipIfHasPrecedingDot(match, response) {
  const before = match.input[match.index - 1];
  if (before === ".") {
    response.ignoreMatch();
  }
}

/**
 *
 * @type {CompilerExt}
 */
function scopeClassName(mode, _parent) {
  // eslint-disable-next-line no-undefined
  if (mode.className !== undefined) {
    mode.scope = mode.className;
    delete mode.className;
  }
}

/**
 * `beginKeywords` syntactic sugar
 * @type {CompilerExt}
 */
function beginKeywords(mode, parent) {
  if (!parent) return;
  if (!mode.beginKeywords) return;

  // for languages with keywords that include non-word characters checking for
  // a word boundary is not sufficient, so instead we check for a word boundary
  // or whitespace - this does no harm in any case since our keyword engine
  // doesn't allow spaces in keywords anyways and we still check for the boundary
  // first
  mode.begin = '\\b(' + mode.beginKeywords.split(' ').join('|') + ')(?!\\.)(?=\\b|\\s)';
  mode.__beforeBegin = skipIfHasPrecedingDot;
  mode.keywords = mode.keywords || mode.beginKeywords;
  delete mode.beginKeywords;

  // prevents double relevance, the keywords themselves provide
  // relevance, the mode doesn't need to double it
  // eslint-disable-next-line no-undefined
  if (mode.relevance === undefined) mode.relevance = 0;
}

/**
 * Allow `illegal` to contain an array of illegal values
 * @type {CompilerExt}
 */
function compileIllegal(mode, _parent) {
  if (!Array.isArray(mode.illegal)) return;

  mode.illegal = either(...mode.illegal);
}

/**
 * `match` to match a single expression for readability
 * @type {CompilerExt}
 */
function compileMatch(mode, _parent) {
  if (!mode.match) return;
  if (mode.begin || mode.end) throw new Error("begin & end are not supported with match");

  mode.begin = mode.match;
  delete mode.match;
}

/**
 * provides the default 1 relevance to all modes
 * @type {CompilerExt}
 */
function compileRelevance(mode, _parent) {
  // eslint-disable-next-line no-undefined
  if (mode.relevance === undefined) mode.relevance = 1;
}

// allow beforeMatch to act as a "qualifier" for the match
// the full match begin must be [beforeMatch][begin]
const beforeMatchExt = (mode, parent) => {
  if (!mode.beforeMatch) return;
  // starts conflicts with endsParent which we need to make sure the child
  // rule is not matched multiple times
  if (mode.starts) throw new Error("beforeMatch cannot be used with starts");

  const originalMode = Object.assign({}, mode);
  Object.keys(mode).forEach((key) => { delete mode[key]; });

  mode.keywords = originalMode.keywords;
  mode.begin = concat(originalMode.beforeMatch, lookahead(originalMode.begin));
  mode.starts = {
    relevance: 0,
    contains: [
      Object.assign(originalMode, { endsParent: true })
    ]
  };
  mode.relevance = 0;

  delete originalMode.beforeMatch;
};

// keywords that should have no default relevance value
const COMMON_KEYWORDS = [
  'of',
  'and',
  'for',
  'in',
  'not',
  'or',
  'if',
  'then',
  'parent', // common variable name
  'list', // common variable name
  'value' // common variable name
];

const DEFAULT_KEYWORD_SCOPE = "keyword";

/**
 * Given raw keywords from a language definition, compile them.
 *
 * @param {string | Record<string,string|string[]> | Array<string>} rawKeywords
 * @param {boolean} caseInsensitive
 */
function compileKeywords(rawKeywords, caseInsensitive, scopeName = DEFAULT_KEYWORD_SCOPE) {
  /** @type {import("highlight.js/private").KeywordDict} */
  const compiledKeywords = Object.create(null);

  // input can be a string of keywords, an array of keywords, or a object with
  // named keys representing scopeName (which can then point to a string or array)
  if (typeof rawKeywords === 'string') {
    compileList(scopeName, rawKeywords.split(" "));
  } else if (Array.isArray(rawKeywords)) {
    compileList(scopeName, rawKeywords);
  } else {
    Object.keys(rawKeywords).forEach(function(scopeName) {
      // collapse all our objects back into the parent object
      Object.assign(
        compiledKeywords,
        compileKeywords(rawKeywords[scopeName], caseInsensitive, scopeName)
      );
    });
  }
  return compiledKeywords;

  // ---

  /**
   * Compiles an individual list of keywords
   *
   * Ex: "for if when while|5"
   *
   * @param {string} scopeName
   * @param {Array<string>} keywordList
   */
  function compileList(scopeName, keywordList) {
    if (caseInsensitive) {
      keywordList = keywordList.map(x => x.toLowerCase());
    }
    keywordList.forEach(function(keyword) {
      const pair = keyword.split('|');
      compiledKeywords[pair[0]] = [scopeName, scoreForKeyword(pair[0], pair[1])];
    });
  }
}

/**
 * Returns the proper score for a given keyword
 *
 * Also takes into account comment keywords, which will be scored 0 UNLESS
 * another score has been manually assigned.
 * @param {string} keyword
 * @param {string} [providedScore]
 */
function scoreForKeyword(keyword, providedScore) {
  // manual scores always win over common keywords
  // so you can force a score of 1 if you really insist
  if (providedScore) {
    return Number(providedScore);
  }

  return commonKeyword(keyword) ? 0 : 1;
}

/**
 * Determines if a given keyword is common or not
 *
 * @param {string} keyword */
function commonKeyword(keyword) {
  return COMMON_KEYWORDS.includes(keyword.toLowerCase());
}

/*

For the reasoning behind this please see:
https://github.com/highlightjs/highlight.js/issues/2880#issuecomment-747275419

*/

/**
 * @type {Record<string, boolean>}
 */
const seenDeprecations = {};

/**
 * @param {string} message
 */
const error = (message) => {
  console.error(message);
};

/**
 * @param {string} message
 * @param {any} args
 */
const warn = (message, ...args) => {
  console.log(`WARN: ${message}`, ...args);
};

/**
 * @param {string} version
 * @param {string} message
 */
const deprecated = (version, message) => {
  if (seenDeprecations[`${version}/${message}`]) return;

  console.log(`Deprecated as of ${version}. ${message}`);
  seenDeprecations[`${version}/${message}`] = true;
};

/* eslint-disable no-throw-literal */

/**
@typedef {import('highlight.js').CompiledMode} CompiledMode
*/

const MultiClassError = new Error();

/**
 * Renumbers labeled scope names to account for additional inner match
 * groups that otherwise would break everything.
 *
 * Lets say we 3 match scopes:
 *
 *   { 1 => ..., 2 => ..., 3 => ... }
 *
 * So what we need is a clean match like this:
 *
 *   (a)(b)(c) => [ "a", "b", "c" ]
 *
 * But this falls apart with inner match groups:
 *
 * (a)(((b)))(c) => ["a", "b", "b", "b", "c" ]
 *
 * Our scopes are now "out of alignment" and we're repeating `b` 3 times.
 * What needs to happen is the numbers are remapped:
 *
 *   { 1 => ..., 2 => ..., 5 => ... }
 *
 * We also need to know that the ONLY groups that should be output
 * are 1, 2, and 5.  This function handles this behavior.
 *
 * @param {CompiledMode} mode
 * @param {Array<RegExp | string>} regexes
 * @param {{key: "beginScope"|"endScope"}} opts
 */
function remapScopeNames(mode, regexes, { key }) {
  let offset = 0;
  const scopeNames = mode[key];
  /** @type Record<number,boolean> */
  const emit = {};
  /** @type Record<number,string> */
  const positions = {};

  for (let i = 1; i <= regexes.length; i++) {
    positions[i + offset] = scopeNames[i];
    emit[i + offset] = true;
    offset += countMatchGroups(regexes[i - 1]);
  }
  // we use _emit to keep track of which match groups are "top-level" to avoid double
  // output from inside match groups
  mode[key] = positions;
  mode[key]._emit = emit;
  mode[key]._multi = true;
}

/**
 * @param {CompiledMode} mode
 */
function beginMultiClass(mode) {
  if (!Array.isArray(mode.begin)) return;

  if (mode.skip || mode.excludeBegin || mode.returnBegin) {
    error("skip, excludeBegin, returnBegin not compatible with beginScope: {}");
    throw MultiClassError;
  }

  if (typeof mode.beginScope !== "object" || mode.beginScope === null) {
    error("beginScope must be object");
    throw MultiClassError;
  }

  remapScopeNames(mode, mode.begin, { key: "beginScope" });
  mode.begin = _rewriteBackreferences(mode.begin, { joinWith: "" });
}

/**
 * @param {CompiledMode} mode
 */
function endMultiClass(mode) {
  if (!Array.isArray(mode.end)) return;

  if (mode.skip || mode.excludeEnd || mode.returnEnd) {
    error("skip, excludeEnd, returnEnd not compatible with endScope: {}");
    throw MultiClassError;
  }

  if (typeof mode.endScope !== "object" || mode.endScope === null) {
    error("endScope must be object");
    throw MultiClassError;
  }

  remapScopeNames(mode, mode.end, { key: "endScope" });
  mode.end = _rewriteBackreferences(mode.end, { joinWith: "" });
}

/**
 * this exists only to allow `scope: {}` to be used beside `match:`
 * Otherwise `beginScope` would necessary and that would look weird

  {
    match: [ /def/, /\w+/ ]
    scope: { 1: "keyword" , 2: "title" }
  }

 * @param {CompiledMode} mode
 */
function scopeSugar(mode) {
  if (mode.scope && typeof mode.scope === "object" && mode.scope !== null) {
    mode.beginScope = mode.scope;
    delete mode.scope;
  }
}

/**
 * @param {CompiledMode} mode
 */
function MultiClass(mode) {
  scopeSugar(mode);

  if (typeof mode.beginScope === "string") {
    mode.beginScope = { _wrap: mode.beginScope };
  }
  if (typeof mode.endScope === "string") {
    mode.endScope = { _wrap: mode.endScope };
  }

  beginMultiClass(mode);
  endMultiClass(mode);
}

/**
@typedef {import('highlight.js').Mode} Mode
@typedef {import('highlight.js').CompiledMode} CompiledMode
@typedef {import('highlight.js').Language} Language
@typedef {import('highlight.js').HLJSPlugin} HLJSPlugin
@typedef {import('highlight.js').CompiledLanguage} CompiledLanguage
*/

// compilation

/**
 * Compiles a language definition result
 *
 * Given the raw result of a language definition (Language), compiles this so
 * that it is ready for highlighting code.
 * @param {Language} language
 * @returns {CompiledLanguage}
 */
function compileLanguage(language) {
  /**
   * Builds a regex with the case sensitivity of the current language
   *
   * @param {RegExp | string} value
   * @param {boolean} [global]
   */
  function langRe(value, global) {
    return new RegExp(
      source(value),
      'm'
      + (language.case_insensitive ? 'i' : '')
      + (language.unicodeRegex ? 'u' : '')
      + (global ? 'g' : '')
    );
  }

  /**
    Stores multiple regular expressions and allows you to quickly search for
    them all in a string simultaneously - returning the first match.  It does
    this by creating a huge (a|b|c) regex - each individual item wrapped with ()
    and joined by `|` - using match groups to track position.  When a match is
    found checking which position in the array has content allows us to figure
    out which of the original regexes / match groups triggered the match.

    The match object itself (the result of `Regex.exec`) is returned but also
    enhanced by merging in any meta-data that was registered with the regex.
    This is how we keep track of which mode matched, and what type of rule
    (`illegal`, `begin`, end, etc).
  */
  class MultiRegex {
    constructor() {
      this.matchIndexes = {};
      // @ts-ignore
      this.regexes = [];
      this.matchAt = 1;
      this.position = 0;
    }

    // @ts-ignore
    addRule(re, opts) {
      opts.position = this.position++;
      // @ts-ignore
      this.matchIndexes[this.matchAt] = opts;
      this.regexes.push([opts, re]);
      this.matchAt += countMatchGroups(re) + 1;
    }

    compile() {
      if (this.regexes.length === 0) {
        // avoids the need to check length every time exec is called
        // @ts-ignore
        this.exec = () => null;
      }
      const terminators = this.regexes.map(el => el[1]);
      this.matcherRe = langRe(_rewriteBackreferences(terminators, { joinWith: '|' }), true);
      this.lastIndex = 0;
    }

    /** @param {string} s */
    exec(s) {
      this.matcherRe.lastIndex = this.lastIndex;
      const match = this.matcherRe.exec(s);
      if (!match) { return null; }

      // eslint-disable-next-line no-undefined
      const i = match.findIndex((el, i) => i > 0 && el !== undefined);
      // @ts-ignore
      const matchData = this.matchIndexes[i];
      // trim off any earlier non-relevant match groups (ie, the other regex
      // match groups that make up the multi-matcher)
      match.splice(0, i);

      return Object.assign(match, matchData);
    }
  }

  /*
    Created to solve the key deficiently with MultiRegex - there is no way to
    test for multiple matches at a single location.  Why would we need to do
    that?  In the future a more dynamic engine will allow certain matches to be
    ignored.  An example: if we matched say the 3rd regex in a large group but
    decided to ignore it - we'd need to started testing again at the 4th
    regex... but MultiRegex itself gives us no real way to do that.

    So what this class creates MultiRegexs on the fly for whatever search
    position they are needed.

    NOTE: These additional MultiRegex objects are created dynamically.  For most
    grammars most of the time we will never actually need anything more than the
    first MultiRegex - so this shouldn't have too much overhead.

    Say this is our search group, and we match regex3, but wish to ignore it.

      regex1 | regex2 | regex3 | regex4 | regex5    ' ie, startAt = 0

    What we need is a new MultiRegex that only includes the remaining
    possibilities:

      regex4 | regex5                               ' ie, startAt = 3

    This class wraps all that complexity up in a simple API... `startAt` decides
    where in the array of expressions to start doing the matching. It
    auto-increments, so if a match is found at position 2, then startAt will be
    set to 3.  If the end is reached startAt will return to 0.

    MOST of the time the parser will be setting startAt manually to 0.
  */
  class ResumableMultiRegex {
    constructor() {
      // @ts-ignore
      this.rules = [];
      // @ts-ignore
      this.multiRegexes = [];
      this.count = 0;

      this.lastIndex = 0;
      this.regexIndex = 0;
    }

    // @ts-ignore
    getMatcher(index) {
      if (this.multiRegexes[index]) return this.multiRegexes[index];

      const matcher = new MultiRegex();
      this.rules.slice(index).forEach(([re, opts]) => matcher.addRule(re, opts));
      matcher.compile();
      this.multiRegexes[index] = matcher;
      return matcher;
    }

    resumingScanAtSamePosition() {
      return this.regexIndex !== 0;
    }

    considerAll() {
      this.regexIndex = 0;
    }

    // @ts-ignore
    addRule(re, opts) {
      this.rules.push([re, opts]);
      if (opts.type === "begin") this.count++;
    }

    /** @param {string} s */
    exec(s) {
      const m = this.getMatcher(this.regexIndex);
      m.lastIndex = this.lastIndex;
      let result = m.exec(s);

      // The following is because we have no easy way to say "resume scanning at the
      // existing position but also skip the current rule ONLY". What happens is
      // all prior rules are also skipped which can result in matching the wrong
      // thing. Example of matching "booger":

      // our matcher is [string, "booger", number]
      //
      // ....booger....

      // if "booger" is ignored then we'd really need a regex to scan from the
      // SAME position for only: [string, number] but ignoring "booger" (if it
      // was the first match), a simple resume would scan ahead who knows how
      // far looking only for "number", ignoring potential string matches (or
      // future "booger" matches that might be valid.)

      // So what we do: We execute two matchers, one resuming at the same
      // position, but the second full matcher starting at the position after:

      //     /--- resume first regex match here (for [number])
      //     |/---- full match here for [string, "booger", number]
      //     vv
      // ....booger....

      // Which ever results in a match first is then used. So this 3-4 step
      // process essentially allows us to say "match at this position, excluding
      // a prior rule that was ignored".
      //
      // 1. Match "booger" first, ignore. Also proves that [string] does non match.
      // 2. Resume matching for [number]
      // 3. Match at index + 1 for [string, "booger", number]
      // 4. If #2 and #3 result in matches, which came first?
      if (this.resumingScanAtSamePosition()) {
        if (result && result.index === this.lastIndex) ; else { // use the second matcher result
          const m2 = this.getMatcher(0);
          m2.lastIndex = this.lastIndex + 1;
          result = m2.exec(s);
        }
      }

      if (result) {
        this.regexIndex += result.position + 1;
        if (this.regexIndex === this.count) {
          // wrap-around to considering all matches again
          this.considerAll();
        }
      }

      return result;
    }
  }

  /**
   * Given a mode, builds a huge ResumableMultiRegex that can be used to walk
   * the content and find matches.
   *
   * @param {CompiledMode} mode
   * @returns {ResumableMultiRegex}
   */
  function buildModeRegex(mode) {
    const mm = new ResumableMultiRegex();

    mode.contains.forEach(term => mm.addRule(term.begin, { rule: term, type: "begin" }));

    if (mode.terminatorEnd) {
      mm.addRule(mode.terminatorEnd, { type: "end" });
    }
    if (mode.illegal) {
      mm.addRule(mode.illegal, { type: "illegal" });
    }

    return mm;
  }

  /** skip vs abort vs ignore
   *
   * @skip   - The mode is still entered and exited normally (and contains rules apply),
   *           but all content is held and added to the parent buffer rather than being
   *           output when the mode ends.  Mostly used with `sublanguage` to build up
   *           a single large buffer than can be parsed by sublanguage.
   *
   *             - The mode begin ands ends normally.
   *             - Content matched is added to the parent mode buffer.
   *             - The parser cursor is moved forward normally.
   *
   * @abort  - A hack placeholder until we have ignore.  Aborts the mode (as if it
   *           never matched) but DOES NOT continue to match subsequent `contains`
   *           modes.  Abort is bad/suboptimal because it can result in modes
   *           farther down not getting applied because an earlier rule eats the
   *           content but then aborts.
   *
   *             - The mode does not begin.
   *             - Content matched by `begin` is added to the mode buffer.
   *             - The parser cursor is moved forward accordingly.
   *
   * @ignore - Ignores the mode (as if it never matched) and continues to match any
   *           subsequent `contains` modes.  Ignore isn't technically possible with
   *           the current parser implementation.
   *
   *             - The mode does not begin.
   *             - Content matched by `begin` is ignored.
   *             - The parser cursor is not moved forward.
   */

  /**
   * Compiles an individual mode
   *
   * This can raise an error if the mode contains certain detectable known logic
   * issues.
   * @param {Mode} mode
   * @param {CompiledMode | null} [parent]
   * @returns {CompiledMode | never}
   */
  function compileMode(mode, parent) {
    const cmode = /** @type CompiledMode */ (mode);
    if (mode.isCompiled) return cmode;

    [
      scopeClassName,
      // do this early so compiler extensions generally don't have to worry about
      // the distinction between match/begin
      compileMatch,
      MultiClass,
      beforeMatchExt
    ].forEach(ext => ext(mode, parent));

    language.compilerExtensions.forEach(ext => ext(mode, parent));

    // __beforeBegin is considered private API, internal use only
    mode.__beforeBegin = null;

    [
      beginKeywords,
      // do this later so compiler extensions that come earlier have access to the
      // raw array if they wanted to perhaps manipulate it, etc.
      compileIllegal,
      // default to 1 relevance if not specified
      compileRelevance
    ].forEach(ext => ext(mode, parent));

    mode.isCompiled = true;

    let keywordPattern = null;
    if (typeof mode.keywords === "object" && mode.keywords.$pattern) {
      // we need a copy because keywords might be compiled multiple times
      // so we can't go deleting $pattern from the original on the first
      // pass
      mode.keywords = Object.assign({}, mode.keywords);
      keywordPattern = mode.keywords.$pattern;
      delete mode.keywords.$pattern;
    }
    keywordPattern = keywordPattern || /\w+/;

    if (mode.keywords) {
      mode.keywords = compileKeywords(mode.keywords, language.case_insensitive);
    }

    cmode.keywordPatternRe = langRe(keywordPattern, true);

    if (parent) {
      if (!mode.begin) mode.begin = /\B|\b/;
      cmode.beginRe = langRe(cmode.begin);
      if (!mode.end && !mode.endsWithParent) mode.end = /\B|\b/;
      if (mode.end) cmode.endRe = langRe(cmode.end);
      cmode.terminatorEnd = source(cmode.end) || '';
      if (mode.endsWithParent && parent.terminatorEnd) {
        cmode.terminatorEnd += (mode.end ? '|' : '') + parent.terminatorEnd;
      }
    }
    if (mode.illegal) cmode.illegalRe = langRe(/** @type {RegExp | string} */ (mode.illegal));
    if (!mode.contains) mode.contains = [];

    mode.contains = [].concat(...mode.contains.map(function(c) {
      return expandOrCloneMode(c === 'self' ? mode : c);
    }));
    mode.contains.forEach(function(c) { compileMode(/** @type Mode */ (c), cmode); });

    if (mode.starts) {
      compileMode(mode.starts, parent);
    }

    cmode.matcher = buildModeRegex(cmode);
    return cmode;
  }

  if (!language.compilerExtensions) language.compilerExtensions = [];

  // self is not valid at the top-level
  if (language.contains && language.contains.includes('self')) {
    throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
  }

  // we need a null object, which inherit will guarantee
  language.classNameAliases = inherit$1(language.classNameAliases || {});

  return compileMode(/** @type Mode */ (language));
}

/**
 * Determines if a mode has a dependency on it's parent or not
 *
 * If a mode does have a parent dependency then often we need to clone it if
 * it's used in multiple places so that each copy points to the correct parent,
 * where-as modes without a parent can often safely be re-used at the bottom of
 * a mode chain.
 *
 * @param {Mode | null} mode
 * @returns {boolean} - is there a dependency on the parent?
 * */
function dependencyOnParent(mode) {
  if (!mode) return false;

  return mode.endsWithParent || dependencyOnParent(mode.starts);
}

/**
 * Expands a mode or clones it if necessary
 *
 * This is necessary for modes with parental dependenceis (see notes on
 * `dependencyOnParent`) and for nodes that have `variants` - which must then be
 * exploded into their own individual modes at compile time.
 *
 * @param {Mode} mode
 * @returns {Mode | Mode[]}
 * */
function expandOrCloneMode(mode) {
  if (mode.variants && !mode.cachedVariants) {
    mode.cachedVariants = mode.variants.map(function(variant) {
      return inherit$1(mode, { variants: null }, variant);
    });
  }

  // EXPAND
  // if we have variants then essentially "replace" the mode with the variants
  // this happens in compileMode, where this function is called from
  if (mode.cachedVariants) {
    return mode.cachedVariants;
  }

  // CLONE
  // if we have dependencies on parents then we need a unique
  // instance of ourselves, so we can be reused with many
  // different parents without issue
  if (dependencyOnParent(mode)) {
    return inherit$1(mode, { starts: mode.starts ? inherit$1(mode.starts) : null });
  }

  if (Object.isFrozen(mode)) {
    return inherit$1(mode);
  }

  // no special dependency issues, just return ourselves
  return mode;
}

var version = "11.10.0";

class HTMLInjectionError extends Error {
  constructor(reason, html) {
    super(reason);
    this.name = "HTMLInjectionError";
    this.html = html;
  }
}

/*
Syntax highlighting with language autodetection.
https://highlightjs.org/
*/



/**
@typedef {import('highlight.js').Mode} Mode
@typedef {import('highlight.js').CompiledMode} CompiledMode
@typedef {import('highlight.js').CompiledScope} CompiledScope
@typedef {import('highlight.js').Language} Language
@typedef {import('highlight.js').HLJSApi} HLJSApi
@typedef {import('highlight.js').HLJSPlugin} HLJSPlugin
@typedef {import('highlight.js').PluginEvent} PluginEvent
@typedef {import('highlight.js').HLJSOptions} HLJSOptions
@typedef {import('highlight.js').LanguageFn} LanguageFn
@typedef {import('highlight.js').HighlightedHTMLElement} HighlightedHTMLElement
@typedef {import('highlight.js').BeforeHighlightContext} BeforeHighlightContext
@typedef {import('highlight.js/private').MatchType} MatchType
@typedef {import('highlight.js/private').KeywordData} KeywordData
@typedef {import('highlight.js/private').EnhancedMatch} EnhancedMatch
@typedef {import('highlight.js/private').AnnotatedError} AnnotatedError
@typedef {import('highlight.js').AutoHighlightResult} AutoHighlightResult
@typedef {import('highlight.js').HighlightOptions} HighlightOptions
@typedef {import('highlight.js').HighlightResult} HighlightResult
*/


const escape = escapeHTML;
const inherit = inherit$1;
const NO_MATCH = Symbol("nomatch");
const MAX_KEYWORD_HITS = 7;

/**
 * @param {any} hljs - object that is extended (legacy)
 * @returns {HLJSApi}
 */
const HLJS = function(hljs) {
  // Global internal variables used within the highlight.js library.
  /** @type {Record<string, Language>} */
  const languages = Object.create(null);
  /** @type {Record<string, string>} */
  const aliases = Object.create(null);
  /** @type {HLJSPlugin[]} */
  const plugins = [];

  // safe/production mode - swallows more errors, tries to keep running
  // even if a single syntax or parse hits a fatal error
  let SAFE_MODE = true;
  const LANGUAGE_NOT_FOUND = "Could not find the language '{}', did you forget to load/include a language module?";
  /** @type {Language} */
  const PLAINTEXT_LANGUAGE = { disableAutodetect: true, name: 'Plain text', contains: [] };

  // Global options used when within external APIs. This is modified when
  // calling the `hljs.configure` function.
  /** @type HLJSOptions */
  let options = {
    ignoreUnescapedHTML: false,
    throwUnescapedHTML: false,
    noHighlightRe: /^(no-?highlight)$/i,
    languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
    classPrefix: 'hljs-',
    cssSelector: 'pre code',
    languages: null,
    // beta configuration options, subject to change, welcome to discuss
    // https://github.com/highlightjs/highlight.js/issues/1086
    __emitter: TokenTreeEmitter
  };

  /* Utility functions */

  /**
   * Tests a language name to see if highlighting should be skipped
   * @param {string} languageName
   */
  function shouldNotHighlight(languageName) {
    return options.noHighlightRe.test(languageName);
  }

  /**
   * @param {HighlightedHTMLElement} block - the HTML element to determine language for
   */
  function blockLanguage(block) {
    let classes = block.className + ' ';

    classes += block.parentNode ? block.parentNode.className : '';

    // language-* takes precedence over non-prefixed class names.
    const match = options.languageDetectRe.exec(classes);
    if (match) {
      const language = getLanguage(match[1]);
      if (!language) {
        warn(LANGUAGE_NOT_FOUND.replace("{}", match[1]));
        warn("Falling back to no-highlight mode for this block.", block);
      }
      return language ? match[1] : 'no-highlight';
    }

    return classes
      .split(/\s+/)
      .find((_class) => shouldNotHighlight(_class) || getLanguage(_class));
  }

  /**
   * Core highlighting function.
   *
   * OLD API
   * highlight(lang, code, ignoreIllegals, continuation)
   *
   * NEW API
   * highlight(code, {lang, ignoreIllegals})
   *
   * @param {string} codeOrLanguageName - the language to use for highlighting
   * @param {string | HighlightOptions} optionsOrCode - the code to highlight
   * @param {boolean} [ignoreIllegals] - whether to ignore illegal matches, default is to bail
   *
   * @returns {HighlightResult} Result - an object that represents the result
   * @property {string} language - the language name
   * @property {number} relevance - the relevance score
   * @property {string} value - the highlighted HTML code
   * @property {string} code - the original raw code
   * @property {CompiledMode} top - top of the current mode stack
   * @property {boolean} illegal - indicates whether any illegal matches were found
  */
  function highlight(codeOrLanguageName, optionsOrCode, ignoreIllegals) {
    let code = "";
    let languageName = "";
    if (typeof optionsOrCode === "object") {
      code = codeOrLanguageName;
      ignoreIllegals = optionsOrCode.ignoreIllegals;
      languageName = optionsOrCode.language;
    } else {
      // old API
      deprecated("10.7.0", "highlight(lang, code, ...args) has been deprecated.");
      deprecated("10.7.0", "Please use highlight(code, options) instead.\nhttps://github.com/highlightjs/highlight.js/issues/2277");
      languageName = codeOrLanguageName;
      code = optionsOrCode;
    }

    // https://github.com/highlightjs/highlight.js/issues/3149
    // eslint-disable-next-line no-undefined
    if (ignoreIllegals === undefined) { ignoreIllegals = true; }

    /** @type {BeforeHighlightContext} */
    const context = {
      code,
      language: languageName
    };
    // the plugin can change the desired language or the code to be highlighted
    // just be changing the object it was passed
    fire("before:highlight", context);

    // a before plugin can usurp the result completely by providing it's own
    // in which case we don't even need to call highlight
    const result = context.result
      ? context.result
      : _highlight(context.language, context.code, ignoreIllegals);

    result.code = context.code;
    // the plugin can change anything in result to suite it
    fire("after:highlight", result);

    return result;
  }

  /**
   * private highlight that's used internally and does not fire callbacks
   *
   * @param {string} languageName - the language to use for highlighting
   * @param {string} codeToHighlight - the code to highlight
   * @param {boolean?} [ignoreIllegals] - whether to ignore illegal matches, default is to bail
   * @param {CompiledMode?} [continuation] - current continuation mode, if any
   * @returns {HighlightResult} - result of the highlight operation
  */
  function _highlight(languageName, codeToHighlight, ignoreIllegals, continuation) {
    const keywordHits = Object.create(null);

    /**
     * Return keyword data if a match is a keyword
     * @param {CompiledMode} mode - current mode
     * @param {string} matchText - the textual match
     * @returns {KeywordData | false}
     */
    function keywordData(mode, matchText) {
      return mode.keywords[matchText];
    }

    function processKeywords() {
      if (!top.keywords) {
        emitter.addText(modeBuffer);
        return;
      }

      let lastIndex = 0;
      top.keywordPatternRe.lastIndex = 0;
      let match = top.keywordPatternRe.exec(modeBuffer);
      let buf = "";

      while (match) {
        buf += modeBuffer.substring(lastIndex, match.index);
        const word = language.case_insensitive ? match[0].toLowerCase() : match[0];
        const data = keywordData(top, word);
        if (data) {
          const [kind, keywordRelevance] = data;
          emitter.addText(buf);
          buf = "";

          keywordHits[word] = (keywordHits[word] || 0) + 1;
          if (keywordHits[word] <= MAX_KEYWORD_HITS) relevance += keywordRelevance;
          if (kind.startsWith("_")) {
            // _ implied for relevance only, do not highlight
            // by applying a class name
            buf += match[0];
          } else {
            const cssClass = language.classNameAliases[kind] || kind;
            emitKeyword(match[0], cssClass);
          }
        } else {
          buf += match[0];
        }
        lastIndex = top.keywordPatternRe.lastIndex;
        match = top.keywordPatternRe.exec(modeBuffer);
      }
      buf += modeBuffer.substring(lastIndex);
      emitter.addText(buf);
    }

    function processSubLanguage() {
      if (modeBuffer === "") return;
      /** @type HighlightResult */
      let result = null;

      if (typeof top.subLanguage === 'string') {
        if (!languages[top.subLanguage]) {
          emitter.addText(modeBuffer);
          return;
        }
        result = _highlight(top.subLanguage, modeBuffer, true, continuations[top.subLanguage]);
        continuations[top.subLanguage] = /** @type {CompiledMode} */ (result._top);
      } else {
        result = highlightAuto(modeBuffer, top.subLanguage.length ? top.subLanguage : null);
      }

      // Counting embedded language score towards the host language may be disabled
      // with zeroing the containing mode relevance. Use case in point is Markdown that
      // allows XML everywhere and makes every XML snippet to have a much larger Markdown
      // score.
      if (top.relevance > 0) {
        relevance += result.relevance;
      }
      emitter.__addSublanguage(result._emitter, result.language);
    }

    function processBuffer() {
      if (top.subLanguage != null) {
        processSubLanguage();
      } else {
        processKeywords();
      }
      modeBuffer = '';
    }

    /**
     * @param {string} text
     * @param {string} scope
     */
    function emitKeyword(keyword, scope) {
      if (keyword === "") return;

      emitter.startScope(scope);
      emitter.addText(keyword);
      emitter.endScope();
    }

    /**
     * @param {CompiledScope} scope
     * @param {RegExpMatchArray} match
     */
    function emitMultiClass(scope, match) {
      let i = 1;
      const max = match.length - 1;
      while (i <= max) {
        if (!scope._emit[i]) { i++; continue; }
        const klass = language.classNameAliases[scope[i]] || scope[i];
        const text = match[i];
        if (klass) {
          emitKeyword(text, klass);
        } else {
          modeBuffer = text;
          processKeywords();
          modeBuffer = "";
        }
        i++;
      }
    }

    /**
     * @param {CompiledMode} mode - new mode to start
     * @param {RegExpMatchArray} match
     */
    function startNewMode(mode, match) {
      if (mode.scope && typeof mode.scope === "string") {
        emitter.openNode(language.classNameAliases[mode.scope] || mode.scope);
      }
      if (mode.beginScope) {
        // beginScope just wraps the begin match itself in a scope
        if (mode.beginScope._wrap) {
          emitKeyword(modeBuffer, language.classNameAliases[mode.beginScope._wrap] || mode.beginScope._wrap);
          modeBuffer = "";
        } else if (mode.beginScope._multi) {
          // at this point modeBuffer should just be the match
          emitMultiClass(mode.beginScope, match);
          modeBuffer = "";
        }
      }

      top = Object.create(mode, { parent: { value: top } });
      return top;
    }

    /**
     * @param {CompiledMode } mode - the mode to potentially end
     * @param {RegExpMatchArray} match - the latest match
     * @param {string} matchPlusRemainder - match plus remainder of content
     * @returns {CompiledMode | void} - the next mode, or if void continue on in current mode
     */
    function endOfMode(mode, match, matchPlusRemainder) {
      let matched = startsWith(mode.endRe, matchPlusRemainder);

      if (matched) {
        if (mode["on:end"]) {
          const resp = new Response(mode);
          mode["on:end"](match, resp);
          if (resp.isMatchIgnored) matched = false;
        }

        if (matched) {
          while (mode.endsParent && mode.parent) {
            mode = mode.parent;
          }
          return mode;
        }
      }
      // even if on:end fires an `ignore` it's still possible
      // that we might trigger the end node because of a parent mode
      if (mode.endsWithParent) {
        return endOfMode(mode.parent, match, matchPlusRemainder);
      }
    }

    /**
     * Handle matching but then ignoring a sequence of text
     *
     * @param {string} lexeme - string containing full match text
     */
    function doIgnore(lexeme) {
      if (top.matcher.regexIndex === 0) {
        // no more regexes to potentially match here, so we move the cursor forward one
        // space
        modeBuffer += lexeme[0];
        return 1;
      } else {
        // no need to move the cursor, we still have additional regexes to try and
        // match at this very spot
        resumeScanAtSamePosition = true;
        return 0;
      }
    }

    /**
     * Handle the start of a new potential mode match
     *
     * @param {EnhancedMatch} match - the current match
     * @returns {number} how far to advance the parse cursor
     */
    function doBeginMatch(match) {
      const lexeme = match[0];
      const newMode = match.rule;

      const resp = new Response(newMode);
      // first internal before callbacks, then the public ones
      const beforeCallbacks = [newMode.__beforeBegin, newMode["on:begin"]];
      for (const cb of beforeCallbacks) {
        if (!cb) continue;
        cb(match, resp);
        if (resp.isMatchIgnored) return doIgnore(lexeme);
      }

      if (newMode.skip) {
        modeBuffer += lexeme;
      } else {
        if (newMode.excludeBegin) {
          modeBuffer += lexeme;
        }
        processBuffer();
        if (!newMode.returnBegin && !newMode.excludeBegin) {
          modeBuffer = lexeme;
        }
      }
      startNewMode(newMode, match);
      return newMode.returnBegin ? 0 : lexeme.length;
    }

    /**
     * Handle the potential end of mode
     *
     * @param {RegExpMatchArray} match - the current match
     */
    function doEndMatch(match) {
      const lexeme = match[0];
      const matchPlusRemainder = codeToHighlight.substring(match.index);

      const endMode = endOfMode(top, match, matchPlusRemainder);
      if (!endMode) { return NO_MATCH; }

      const origin = top;
      if (top.endScope && top.endScope._wrap) {
        processBuffer();
        emitKeyword(lexeme, top.endScope._wrap);
      } else if (top.endScope && top.endScope._multi) {
        processBuffer();
        emitMultiClass(top.endScope, match);
      } else if (origin.skip) {
        modeBuffer += lexeme;
      } else {
        if (!(origin.returnEnd || origin.excludeEnd)) {
          modeBuffer += lexeme;
        }
        processBuffer();
        if (origin.excludeEnd) {
          modeBuffer = lexeme;
        }
      }
      do {
        if (top.scope) {
          emitter.closeNode();
        }
        if (!top.skip && !top.subLanguage) {
          relevance += top.relevance;
        }
        top = top.parent;
      } while (top !== endMode.parent);
      if (endMode.starts) {
        startNewMode(endMode.starts, match);
      }
      return origin.returnEnd ? 0 : lexeme.length;
    }

    function processContinuations() {
      const list = [];
      for (let current = top; current !== language; current = current.parent) {
        if (current.scope) {
          list.unshift(current.scope);
        }
      }
      list.forEach(item => emitter.openNode(item));
    }

    /** @type {{type?: MatchType, index?: number, rule?: Mode}}} */
    let lastMatch = {};

    /**
     *  Process an individual match
     *
     * @param {string} textBeforeMatch - text preceding the match (since the last match)
     * @param {EnhancedMatch} [match] - the match itself
     */
    function processLexeme(textBeforeMatch, match) {
      const lexeme = match && match[0];

      // add non-matched text to the current mode buffer
      modeBuffer += textBeforeMatch;

      if (lexeme == null) {
        processBuffer();
        return 0;
      }

      // we've found a 0 width match and we're stuck, so we need to advance
      // this happens when we have badly behaved rules that have optional matchers to the degree that
      // sometimes they can end up matching nothing at all
      // Ref: https://github.com/highlightjs/highlight.js/issues/2140
      if (lastMatch.type === "begin" && match.type === "end" && lastMatch.index === match.index && lexeme === "") {
        // spit the "skipped" character that our regex choked on back into the output sequence
        modeBuffer += codeToHighlight.slice(match.index, match.index + 1);
        if (!SAFE_MODE) {
          /** @type {AnnotatedError} */
          const err = new Error(`0 width match regex (${languageName})`);
          err.languageName = languageName;
          err.badRule = lastMatch.rule;
          throw err;
        }
        return 1;
      }
      lastMatch = match;

      if (match.type === "begin") {
        return doBeginMatch(match);
      } else if (match.type === "illegal" && !ignoreIllegals) {
        // illegal match, we do not continue processing
        /** @type {AnnotatedError} */
        const err = new Error('Illegal lexeme "' + lexeme + '" for mode "' + (top.scope || '<unnamed>') + '"');
        err.mode = top;
        throw err;
      } else if (match.type === "end") {
        const processed = doEndMatch(match);
        if (processed !== NO_MATCH) {
          return processed;
        }
      }

      // edge case for when illegal matches $ (end of line) which is technically
      // a 0 width match but not a begin/end match so it's not caught by the
      // first handler (when ignoreIllegals is true)
      if (match.type === "illegal" && lexeme === "") {
        // advance so we aren't stuck in an infinite loop
        return 1;
      }

      // infinite loops are BAD, this is a last ditch catch all. if we have a
      // decent number of iterations yet our index (cursor position in our
      // parsing) still 3x behind our index then something is very wrong
      // so we bail
      if (iterations > 100000 && iterations > match.index * 3) {
        const err = new Error('potential infinite loop, way more iterations than matches');
        throw err;
      }

      /*
      Why might be find ourselves here?  An potential end match that was
      triggered but could not be completed.  IE, `doEndMatch` returned NO_MATCH.
      (this could be because a callback requests the match be ignored, etc)

      This causes no real harm other than stopping a few times too many.
      */

      modeBuffer += lexeme;
      return lexeme.length;
    }

    const language = getLanguage(languageName);
    if (!language) {
      error(LANGUAGE_NOT_FOUND.replace("{}", languageName));
      throw new Error('Unknown language: "' + languageName + '"');
    }

    const md = compileLanguage(language);
    let result = '';
    /** @type {CompiledMode} */
    let top = continuation || md;
    /** @type Record<string,CompiledMode> */
    const continuations = {}; // keep continuations for sub-languages
    const emitter = new options.__emitter(options);
    processContinuations();
    let modeBuffer = '';
    let relevance = 0;
    let index = 0;
    let iterations = 0;
    let resumeScanAtSamePosition = false;

    try {
      if (!language.__emitTokens) {
        top.matcher.considerAll();

        for (;;) {
          iterations++;
          if (resumeScanAtSamePosition) {
            // only regexes not matched previously will now be
            // considered for a potential match
            resumeScanAtSamePosition = false;
          } else {
            top.matcher.considerAll();
          }
          top.matcher.lastIndex = index;

          const match = top.matcher.exec(codeToHighlight);
          // console.log("match", match[0], match.rule && match.rule.begin)

          if (!match) break;

          const beforeMatch = codeToHighlight.substring(index, match.index);
          const processedCount = processLexeme(beforeMatch, match);
          index = match.index + processedCount;
        }
        processLexeme(codeToHighlight.substring(index));
      } else {
        language.__emitTokens(codeToHighlight, emitter);
      }

      emitter.finalize();
      result = emitter.toHTML();

      return {
        language: languageName,
        value: result,
        relevance,
        illegal: false,
        _emitter: emitter,
        _top: top
      };
    } catch (err) {
      if (err.message && err.message.includes('Illegal')) {
        return {
          language: languageName,
          value: escape(codeToHighlight),
          illegal: true,
          relevance: 0,
          _illegalBy: {
            message: err.message,
            index,
            context: codeToHighlight.slice(index - 100, index + 100),
            mode: err.mode,
            resultSoFar: result
          },
          _emitter: emitter
        };
      } else if (SAFE_MODE) {
        return {
          language: languageName,
          value: escape(codeToHighlight),
          illegal: false,
          relevance: 0,
          errorRaised: err,
          _emitter: emitter,
          _top: top
        };
      } else {
        throw err;
      }
    }
  }

  /**
   * returns a valid highlight result, without actually doing any actual work,
   * auto highlight starts with this and it's possible for small snippets that
   * auto-detection may not find a better match
   * @param {string} code
   * @returns {HighlightResult}
   */
  function justTextHighlightResult(code) {
    const result = {
      value: escape(code),
      illegal: false,
      relevance: 0,
      _top: PLAINTEXT_LANGUAGE,
      _emitter: new options.__emitter(options)
    };
    result._emitter.addText(code);
    return result;
  }

  /**
  Highlighting with language detection. Accepts a string with the code to
  highlight. Returns an object with the following properties:

  - language (detected language)
  - relevance (int)
  - value (an HTML string with highlighting markup)
  - secondBest (object with the same structure for second-best heuristically
    detected language, may be absent)

    @param {string} code
    @param {Array<string>} [languageSubset]
    @returns {AutoHighlightResult}
  */
  function highlightAuto(code, languageSubset) {
    languageSubset = languageSubset || options.languages || Object.keys(languages);
    const plaintext = justTextHighlightResult(code);

    const results = languageSubset.filter(getLanguage).filter(autoDetection).map(name =>
      _highlight(name, code, false)
    );
    results.unshift(plaintext); // plaintext is always an option

    const sorted = results.sort((a, b) => {
      // sort base on relevance
      if (a.relevance !== b.relevance) return b.relevance - a.relevance;

      // always award the tie to the base language
      // ie if C++ and Arduino are tied, it's more likely to be C++
      if (a.language && b.language) {
        if (getLanguage(a.language).supersetOf === b.language) {
          return 1;
        } else if (getLanguage(b.language).supersetOf === a.language) {
          return -1;
        }
      }

      // otherwise say they are equal, which has the effect of sorting on
      // relevance while preserving the original ordering - which is how ties
      // have historically been settled, ie the language that comes first always
      // wins in the case of a tie
      return 0;
    });

    const [best, secondBest] = sorted;

    /** @type {AutoHighlightResult} */
    const result = best;
    result.secondBest = secondBest;

    return result;
  }

  /**
   * Builds new class name for block given the language name
   *
   * @param {HTMLElement} element
   * @param {string} [currentLang]
   * @param {string} [resultLang]
   */
  function updateClassName(element, currentLang, resultLang) {
    const language = (currentLang && aliases[currentLang]) || resultLang;

    element.classList.add("hljs");
    element.classList.add(`language-${language}`);
  }

  /**
   * Applies highlighting to a DOM node containing code.
   *
   * @param {HighlightedHTMLElement} element - the HTML element to highlight
  */
  function highlightElement(element) {
    /** @type HTMLElement */
    let node = null;
    const language = blockLanguage(element);

    if (shouldNotHighlight(language)) return;

    fire("before:highlightElement",
      { el: element, language });

    if (element.dataset.highlighted) {
      console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.", element);
      return;
    }

    // we should be all text, no child nodes (unescaped HTML) - this is possibly
    // an HTML injection attack - it's likely too late if this is already in
    // production (the code has likely already done its damage by the time
    // we're seeing it)... but we yell loudly about this so that hopefully it's
    // more likely to be caught in development before making it to production
    if (element.children.length > 0) {
      if (!options.ignoreUnescapedHTML) {
        console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk.");
        console.warn("https://github.com/highlightjs/highlight.js/wiki/security");
        console.warn("The element with unescaped HTML:");
        console.warn(element);
      }
      if (options.throwUnescapedHTML) {
        const err = new HTMLInjectionError(
          "One of your code blocks includes unescaped HTML.",
          element.innerHTML
        );
        throw err;
      }
    }

    node = element;
    const text = node.textContent;
    const result = language ? highlight(text, { language, ignoreIllegals: true }) : highlightAuto(text);

    element.innerHTML = result.value;
    element.dataset.highlighted = "yes";
    updateClassName(element, language, result.language);
    element.result = {
      language: result.language,
      // TODO: remove with version 11.0
      re: result.relevance,
      relevance: result.relevance
    };
    if (result.secondBest) {
      element.secondBest = {
        language: result.secondBest.language,
        relevance: result.secondBest.relevance
      };
    }

    fire("after:highlightElement", { el: element, result, text });
  }

  /**
   * Updates highlight.js global options with the passed options
   *
   * @param {Partial<HLJSOptions>} userOptions
   */
  function configure(userOptions) {
    options = inherit(options, userOptions);
  }

  // TODO: remove v12, deprecated
  const initHighlighting = () => {
    highlightAll();
    deprecated("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
  };

  // TODO: remove v12, deprecated
  function initHighlightingOnLoad() {
    highlightAll();
    deprecated("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
  }

  let wantsHighlight = false;

  /**
   * auto-highlights all pre>code elements on the page
   */
  function highlightAll() {
    // if we are called too early in the loading process
    if (document.readyState === "loading") {
      wantsHighlight = true;
      return;
    }

    const blocks = document.querySelectorAll(options.cssSelector);
    blocks.forEach(highlightElement);
  }

  function boot() {
    // if a highlight was requested before DOM was loaded, do now
    if (wantsHighlight) highlightAll();
  }

  // make sure we are in the browser environment
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('DOMContentLoaded', boot, false);
  }

  /**
   * Register a language grammar module
   *
   * @param {string} languageName
   * @param {LanguageFn} languageDefinition
   */
  function registerLanguage(languageName, languageDefinition) {
    let lang = null;
    try {
      lang = languageDefinition(hljs);
    } catch (error$1) {
      error("Language definition for '{}' could not be registered.".replace("{}", languageName));
      // hard or soft error
      if (!SAFE_MODE) { throw error$1; } else { error(error$1); }
      // languages that have serious errors are replaced with essentially a
      // "plaintext" stand-in so that the code blocks will still get normal
      // css classes applied to them - and one bad language won't break the
      // entire highlighter
      lang = PLAINTEXT_LANGUAGE;
    }
    // give it a temporary name if it doesn't have one in the meta-data
    if (!lang.name) lang.name = languageName;
    languages[languageName] = lang;
    lang.rawDefinition = languageDefinition.bind(null, hljs);

    if (lang.aliases) {
      registerAliases(lang.aliases, { languageName });
    }
  }

  /**
   * Remove a language grammar module
   *
   * @param {string} languageName
   */
  function unregisterLanguage(languageName) {
    delete languages[languageName];
    for (const alias of Object.keys(aliases)) {
      if (aliases[alias] === languageName) {
        delete aliases[alias];
      }
    }
  }

  /**
   * @returns {string[]} List of language internal names
   */
  function listLanguages() {
    return Object.keys(languages);
  }

  /**
   * @param {string} name - name of the language to retrieve
   * @returns {Language | undefined}
   */
  function getLanguage(name) {
    name = (name || '').toLowerCase();
    return languages[name] || languages[aliases[name]];
  }

  /**
   *
   * @param {string|string[]} aliasList - single alias or list of aliases
   * @param {{languageName: string}} opts
   */
  function registerAliases(aliasList, { languageName }) {
    if (typeof aliasList === 'string') {
      aliasList = [aliasList];
    }
    aliasList.forEach(alias => { aliases[alias.toLowerCase()] = languageName; });
  }

  /**
   * Determines if a given language has auto-detection enabled
   * @param {string} name - name of the language
   */
  function autoDetection(name) {
    const lang = getLanguage(name);
    return lang && !lang.disableAutodetect;
  }

  /**
   * Upgrades the old highlightBlock plugins to the new
   * highlightElement API
   * @param {HLJSPlugin} plugin
   */
  function upgradePluginAPI(plugin) {
    // TODO: remove with v12
    if (plugin["before:highlightBlock"] && !plugin["before:highlightElement"]) {
      plugin["before:highlightElement"] = (data) => {
        plugin["before:highlightBlock"](
          Object.assign({ block: data.el }, data)
        );
      };
    }
    if (plugin["after:highlightBlock"] && !plugin["after:highlightElement"]) {
      plugin["after:highlightElement"] = (data) => {
        plugin["after:highlightBlock"](
          Object.assign({ block: data.el }, data)
        );
      };
    }
  }

  /**
   * @param {HLJSPlugin} plugin
   */
  function addPlugin(plugin) {
    upgradePluginAPI(plugin);
    plugins.push(plugin);
  }

  /**
   * @param {HLJSPlugin} plugin
   */
  function removePlugin(plugin) {
    const index = plugins.indexOf(plugin);
    if (index !== -1) {
      plugins.splice(index, 1);
    }
  }

  /**
   *
   * @param {PluginEvent} event
   * @param {any} args
   */
  function fire(event, args) {
    const cb = event;
    plugins.forEach(function(plugin) {
      if (plugin[cb]) {
        plugin[cb](args);
      }
    });
  }

  /**
   * DEPRECATED
   * @param {HighlightedHTMLElement} el
   */
  function deprecateHighlightBlock(el) {
    deprecated("10.7.0", "highlightBlock will be removed entirely in v12.0");
    deprecated("10.7.0", "Please use highlightElement now.");

    return highlightElement(el);
  }

  /* Interface definition */
  Object.assign(hljs, {
    highlight,
    highlightAuto,
    highlightAll,
    highlightElement,
    // TODO: Remove with v12 API
    highlightBlock: deprecateHighlightBlock,
    configure,
    initHighlighting,
    initHighlightingOnLoad,
    registerLanguage,
    unregisterLanguage,
    listLanguages,
    getLanguage,
    registerAliases,
    autoDetection,
    inherit,
    addPlugin,
    removePlugin
  });

  hljs.debugMode = function() { SAFE_MODE = false; };
  hljs.safeMode = function() { SAFE_MODE = true; };
  hljs.versionString = version;

  hljs.regex = {
    concat: concat,
    lookahead: lookahead,
    either: either,
    optional: optional,
    anyNumberOfTimes: anyNumberOfTimes
  };

  for (const key in MODES) {
    // @ts-ignore
    if (typeof MODES[key] === "object") {
      // @ts-ignore
      deepFreeze(MODES[key]);
    }
  }

  // merge all the modes/regexes into our main object
  Object.assign(hljs, MODES);

  return hljs;
};

// Other names for the variable may break build script
const highlight = HLJS({});

// returns a new instance of the highlighter to be used for extensions
// check https://github.com/wooorm/lowlight/issues/47
highlight.newInstance = () => HLJS({});

module.exports = highlight;
highlight.HighlightJS = highlight;
highlight.default = highlight;


/***/ }),

/***/ "./node_modules/highlight.js/lib/languages/bash.js":
/*!*********************************************************!*\
  !*** ./node_modules/highlight.js/lib/languages/bash.js ***!
  \*********************************************************/
/***/ ((module) => {

/*
Language: Bash
Author: vah <vahtenberg@gmail.com>
Contributrors: Benjamin Pannell <contact@sierrasoftworks.com>
Website: https://www.gnu.org/software/bash/
Category: common, scripting
*/

/** @type LanguageFn */
function bash(hljs) {
  const regex = hljs.regex;
  const VAR = {};
  const BRACED_VAR = {
    begin: /\$\{/,
    end: /\}/,
    contains: [
      "self",
      {
        begin: /:-/,
        contains: [ VAR ]
      } // default values
    ]
  };
  Object.assign(VAR, {
    className: 'variable',
    variants: [
      { begin: regex.concat(/\$[\w\d#@][\w\d_]*/,
        // negative look-ahead tries to avoid matching patterns that are not
        // Perl at all like $ident$, @ident@, etc.
        `(?![\\w\\d])(?![$])`) },
      BRACED_VAR
    ]
  });

  const SUBST = {
    className: 'subst',
    begin: /\$\(/,
    end: /\)/,
    contains: [ hljs.BACKSLASH_ESCAPE ]
  };
  const COMMENT = hljs.inherit(
    hljs.COMMENT(),
    {
      match: [
        /(^|\s)/,
        /#.*$/
      ],
      scope: {
        2: 'comment'
      }
    }
  );
  const HERE_DOC = {
    begin: /<<-?\s*(?=\w+)/,
    starts: { contains: [
      hljs.END_SAME_AS_BEGIN({
        begin: /(\w+)/,
        end: /(\w+)/,
        className: 'string'
      })
    ] }
  };
  const QUOTE_STRING = {
    className: 'string',
    begin: /"/,
    end: /"/,
    contains: [
      hljs.BACKSLASH_ESCAPE,
      VAR,
      SUBST
    ]
  };
  SUBST.contains.push(QUOTE_STRING);
  const ESCAPED_QUOTE = {
    match: /\\"/
  };
  const APOS_STRING = {
    className: 'string',
    begin: /'/,
    end: /'/
  };
  const ESCAPED_APOS = {
    match: /\\'/
  };
  const ARITHMETIC = {
    begin: /\$?\(\(/,
    end: /\)\)/,
    contains: [
      {
        begin: /\d+#[0-9a-f]+/,
        className: "number"
      },
      hljs.NUMBER_MODE,
      VAR
    ]
  };
  const SH_LIKE_SHELLS = [
    "fish",
    "bash",
    "zsh",
    "sh",
    "csh",
    "ksh",
    "tcsh",
    "dash",
    "scsh",
  ];
  const KNOWN_SHEBANG = hljs.SHEBANG({
    binary: `(${SH_LIKE_SHELLS.join("|")})`,
    relevance: 10
  });
  const FUNCTION = {
    className: 'function',
    begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
    returnBegin: true,
    contains: [ hljs.inherit(hljs.TITLE_MODE, { begin: /\w[\w\d_]*/ }) ],
    relevance: 0
  };

  const KEYWORDS = [
    "if",
    "then",
    "else",
    "elif",
    "fi",
    "for",
    "while",
    "until",
    "in",
    "do",
    "done",
    "case",
    "esac",
    "function",
    "select"
  ];

  const LITERALS = [
    "true",
    "false"
  ];

  // to consume paths to prevent keyword matches inside them
  const PATH_MODE = { match: /(\/[a-z._-]+)+/ };

  // http://www.gnu.org/software/bash/manual/html_node/Shell-Builtin-Commands.html
  const SHELL_BUILT_INS = [
    "break",
    "cd",
    "continue",
    "eval",
    "exec",
    "exit",
    "export",
    "getopts",
    "hash",
    "pwd",
    "readonly",
    "return",
    "shift",
    "test",
    "times",
    "trap",
    "umask",
    "unset"
  ];

  const BASH_BUILT_INS = [
    "alias",
    "bind",
    "builtin",
    "caller",
    "command",
    "declare",
    "echo",
    "enable",
    "help",
    "let",
    "local",
    "logout",
    "mapfile",
    "printf",
    "read",
    "readarray",
    "source",
    "sudo",
    "type",
    "typeset",
    "ulimit",
    "unalias"
  ];

  const ZSH_BUILT_INS = [
    "autoload",
    "bg",
    "bindkey",
    "bye",
    "cap",
    "chdir",
    "clone",
    "comparguments",
    "compcall",
    "compctl",
    "compdescribe",
    "compfiles",
    "compgroups",
    "compquote",
    "comptags",
    "comptry",
    "compvalues",
    "dirs",
    "disable",
    "disown",
    "echotc",
    "echoti",
    "emulate",
    "fc",
    "fg",
    "float",
    "functions",
    "getcap",
    "getln",
    "history",
    "integer",
    "jobs",
    "kill",
    "limit",
    "log",
    "noglob",
    "popd",
    "print",
    "pushd",
    "pushln",
    "rehash",
    "sched",
    "setcap",
    "setopt",
    "stat",
    "suspend",
    "ttyctl",
    "unfunction",
    "unhash",
    "unlimit",
    "unsetopt",
    "vared",
    "wait",
    "whence",
    "where",
    "which",
    "zcompile",
    "zformat",
    "zftp",
    "zle",
    "zmodload",
    "zparseopts",
    "zprof",
    "zpty",
    "zregexparse",
    "zsocket",
    "zstyle",
    "ztcp"
  ];

  const GNU_CORE_UTILS = [
    "chcon",
    "chgrp",
    "chown",
    "chmod",
    "cp",
    "dd",
    "df",
    "dir",
    "dircolors",
    "ln",
    "ls",
    "mkdir",
    "mkfifo",
    "mknod",
    "mktemp",
    "mv",
    "realpath",
    "rm",
    "rmdir",
    "shred",
    "sync",
    "touch",
    "truncate",
    "vdir",
    "b2sum",
    "base32",
    "base64",
    "cat",
    "cksum",
    "comm",
    "csplit",
    "cut",
    "expand",
    "fmt",
    "fold",
    "head",
    "join",
    "md5sum",
    "nl",
    "numfmt",
    "od",
    "paste",
    "ptx",
    "pr",
    "sha1sum",
    "sha224sum",
    "sha256sum",
    "sha384sum",
    "sha512sum",
    "shuf",
    "sort",
    "split",
    "sum",
    "tac",
    "tail",
    "tr",
    "tsort",
    "unexpand",
    "uniq",
    "wc",
    "arch",
    "basename",
    "chroot",
    "date",
    "dirname",
    "du",
    "echo",
    "env",
    "expr",
    "factor",
    // "false", // keyword literal already
    "groups",
    "hostid",
    "id",
    "link",
    "logname",
    "nice",
    "nohup",
    "nproc",
    "pathchk",
    "pinky",
    "printenv",
    "printf",
    "pwd",
    "readlink",
    "runcon",
    "seq",
    "sleep",
    "stat",
    "stdbuf",
    "stty",
    "tee",
    "test",
    "timeout",
    // "true", // keyword literal already
    "tty",
    "uname",
    "unlink",
    "uptime",
    "users",
    "who",
    "whoami",
    "yes"
  ];

  return {
    name: 'Bash',
    aliases: [
      'sh',
      'zsh'
    ],
    keywords: {
      $pattern: /\b[a-z][a-z0-9._-]+\b/,
      keyword: KEYWORDS,
      literal: LITERALS,
      built_in: [
        ...SHELL_BUILT_INS,
        ...BASH_BUILT_INS,
        // Shell modifiers
        "set",
        "shopt",
        ...ZSH_BUILT_INS,
        ...GNU_CORE_UTILS
      ]
    },
    contains: [
      KNOWN_SHEBANG, // to catch known shells and boost relevancy
      hljs.SHEBANG(), // to catch unknown shells but still highlight the shebang
      FUNCTION,
      ARITHMETIC,
      COMMENT,
      HERE_DOC,
      PATH_MODE,
      QUOTE_STRING,
      ESCAPED_QUOTE,
      APOS_STRING,
      ESCAPED_APOS,
      VAR
    ]
  };
}

module.exports = bash;


/***/ }),

/***/ "./node_modules/highlight.js/lib/languages/http.js":
/*!*********************************************************!*\
  !*** ./node_modules/highlight.js/lib/languages/http.js ***!
  \*********************************************************/
/***/ ((module) => {

/*
Language: HTTP
Description: HTTP request and response headers with automatic body highlighting
Author: Ivan Sagalaev <maniac@softwaremaniacs.org>
Category: protocols, web
Website: https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview
*/

function http(hljs) {
  const regex = hljs.regex;
  const VERSION = 'HTTP/([32]|1\\.[01])';
  const HEADER_NAME = /[A-Za-z][A-Za-z0-9-]*/;
  const HEADER = {
    className: 'attribute',
    begin: regex.concat('^', HEADER_NAME, '(?=\\:\\s)'),
    starts: { contains: [
      {
        className: "punctuation",
        begin: /: /,
        relevance: 0,
        starts: {
          end: '$',
          relevance: 0
        }
      }
    ] }
  };
  const HEADERS_AND_BODY = [
    HEADER,
    {
      begin: '\\n\\n',
      starts: {
        subLanguage: [],
        endsWithParent: true
      }
    }
  ];

  return {
    name: 'HTTP',
    aliases: [ 'https' ],
    illegal: /\S/,
    contains: [
      // response
      {
        begin: '^(?=' + VERSION + " \\d{3})",
        end: /$/,
        contains: [
          {
            className: "meta",
            begin: VERSION
          },
          {
            className: 'number',
            begin: '\\b\\d{3}\\b'
          }
        ],
        starts: {
          end: /\b\B/,
          illegal: /\S/,
          contains: HEADERS_AND_BODY
        }
      },
      // request
      {
        begin: '(?=^[A-Z]+ (.*?) ' + VERSION + '$)',
        end: /$/,
        contains: [
          {
            className: 'string',
            begin: ' ',
            end: ' ',
            excludeBegin: true,
            excludeEnd: true
          },
          {
            className: "meta",
            begin: VERSION
          },
          {
            className: 'keyword',
            begin: '[A-Z]+'
          }
        ],
        starts: {
          end: /\b\B/,
          illegal: /\S/,
          contains: HEADERS_AND_BODY
        }
      },
      // to allow headers to work even without a preamble
      hljs.inherit(HEADER, { relevance: 0 })
    ]
  };
}

module.exports = http;


/***/ }),

/***/ "./node_modules/highlight.js/lib/languages/php.js":
/*!********************************************************!*\
  !*** ./node_modules/highlight.js/lib/languages/php.js ***!
  \********************************************************/
/***/ ((module) => {

/*
Language: PHP
Author: Victor Karamzin <Victor.Karamzin@enterra-inc.com>
Contributors: Evgeny Stepanischev <imbolk@gmail.com>, Ivan Sagalaev <maniac@softwaremaniacs.org>
Website: https://www.php.net
Category: common
*/

/**
 * @param {HLJSApi} hljs
 * @returns {LanguageDetail}
 * */
function php(hljs) {
  const regex = hljs.regex;
  // negative look-ahead tries to avoid matching patterns that are not
  // Perl at all like $ident$, @ident@, etc.
  const NOT_PERL_ETC = /(?![A-Za-z0-9])(?![$])/;
  const IDENT_RE = regex.concat(
    /[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/,
    NOT_PERL_ETC);
  // Will not detect camelCase classes
  const PASCAL_CASE_CLASS_NAME_RE = regex.concat(
    /(\\?[A-Z][a-z0-9_\x7f-\xff]+|\\?[A-Z]+(?=[A-Z][a-z0-9_\x7f-\xff])){1,}/,
    NOT_PERL_ETC);
  const VARIABLE = {
    scope: 'variable',
    match: '\\$+' + IDENT_RE,
  };
  const PREPROCESSOR = {
    scope: 'meta',
    variants: [
      { begin: /<\?php/, relevance: 10 }, // boost for obvious PHP
      { begin: /<\?=/ },
      // less relevant per PSR-1 which says not to use short-tags
      { begin: /<\?/, relevance: 0.1 },
      { begin: /\?>/ } // end php tag
    ]
  };
  const SUBST = {
    scope: 'subst',
    variants: [
      { begin: /\$\w+/ },
      {
        begin: /\{\$/,
        end: /\}/
      }
    ]
  };
  const SINGLE_QUOTED = hljs.inherit(hljs.APOS_STRING_MODE, { illegal: null, });
  const DOUBLE_QUOTED = hljs.inherit(hljs.QUOTE_STRING_MODE, {
    illegal: null,
    contains: hljs.QUOTE_STRING_MODE.contains.concat(SUBST),
  });

  const HEREDOC = {
    begin: /<<<[ \t]*(?:(\w+)|"(\w+)")\n/,
    end: /[ \t]*(\w+)\b/,
    contains: hljs.QUOTE_STRING_MODE.contains.concat(SUBST),
    'on:begin': (m, resp) => { resp.data._beginMatch = m[1] || m[2]; },
    'on:end': (m, resp) => { if (resp.data._beginMatch !== m[1]) resp.ignoreMatch(); },
  };

  const NOWDOC = hljs.END_SAME_AS_BEGIN({
    begin: /<<<[ \t]*'(\w+)'\n/,
    end: /[ \t]*(\w+)\b/,
  });
  // list of valid whitespaces because non-breaking space might be part of a IDENT_RE
  const WHITESPACE = '[ \t\n]';
  const STRING = {
    scope: 'string',
    variants: [
      DOUBLE_QUOTED,
      SINGLE_QUOTED,
      HEREDOC,
      NOWDOC
    ]
  };
  const NUMBER = {
    scope: 'number',
    variants: [
      { begin: `\\b0[bB][01]+(?:_[01]+)*\\b` }, // Binary w/ underscore support
      { begin: `\\b0[oO][0-7]+(?:_[0-7]+)*\\b` }, // Octals w/ underscore support
      { begin: `\\b0[xX][\\da-fA-F]+(?:_[\\da-fA-F]+)*\\b` }, // Hex w/ underscore support
      // Decimals w/ underscore support, with optional fragments and scientific exponent (e) suffix.
      { begin: `(?:\\b\\d+(?:_\\d+)*(\\.(?:\\d+(?:_\\d+)*))?|\\B\\.\\d+)(?:[eE][+-]?\\d+)?` }
    ],
    relevance: 0
  };
  const LITERALS = [
    "false",
    "null",
    "true"
  ];
  const KWS = [
    // Magic constants:
    // <https://www.php.net/manual/en/language.constants.predefined.php>
    "__CLASS__",
    "__DIR__",
    "__FILE__",
    "__FUNCTION__",
    "__COMPILER_HALT_OFFSET__",
    "__LINE__",
    "__METHOD__",
    "__NAMESPACE__",
    "__TRAIT__",
    // Function that look like language construct or language construct that look like function:
    // List of keywords that may not require parenthesis
    "die",
    "echo",
    "exit",
    "include",
    "include_once",
    "print",
    "require",
    "require_once",
    // These are not language construct (function) but operate on the currently-executing function and can access the current symbol table
    // 'compact extract func_get_arg func_get_args func_num_args get_called_class get_parent_class ' +
    // Other keywords:
    // <https://www.php.net/manual/en/reserved.php>
    // <https://www.php.net/manual/en/language.types.type-juggling.php>
    "array",
    "abstract",
    "and",
    "as",
    "binary",
    "bool",
    "boolean",
    "break",
    "callable",
    "case",
    "catch",
    "class",
    "clone",
    "const",
    "continue",
    "declare",
    "default",
    "do",
    "double",
    "else",
    "elseif",
    "empty",
    "enddeclare",
    "endfor",
    "endforeach",
    "endif",
    "endswitch",
    "endwhile",
    "enum",
    "eval",
    "extends",
    "final",
    "finally",
    "float",
    "for",
    "foreach",
    "from",
    "global",
    "goto",
    "if",
    "implements",
    "instanceof",
    "insteadof",
    "int",
    "integer",
    "interface",
    "isset",
    "iterable",
    "list",
    "match|0",
    "mixed",
    "new",
    "never",
    "object",
    "or",
    "private",
    "protected",
    "public",
    "readonly",
    "real",
    "return",
    "string",
    "switch",
    "throw",
    "trait",
    "try",
    "unset",
    "use",
    "var",
    "void",
    "while",
    "xor",
    "yield"
  ];

  const BUILT_INS = [
    // Standard PHP library:
    // <https://www.php.net/manual/en/book.spl.php>
    "Error|0",
    "AppendIterator",
    "ArgumentCountError",
    "ArithmeticError",
    "ArrayIterator",
    "ArrayObject",
    "AssertionError",
    "BadFunctionCallException",
    "BadMethodCallException",
    "CachingIterator",
    "CallbackFilterIterator",
    "CompileError",
    "Countable",
    "DirectoryIterator",
    "DivisionByZeroError",
    "DomainException",
    "EmptyIterator",
    "ErrorException",
    "Exception",
    "FilesystemIterator",
    "FilterIterator",
    "GlobIterator",
    "InfiniteIterator",
    "InvalidArgumentException",
    "IteratorIterator",
    "LengthException",
    "LimitIterator",
    "LogicException",
    "MultipleIterator",
    "NoRewindIterator",
    "OutOfBoundsException",
    "OutOfRangeException",
    "OuterIterator",
    "OverflowException",
    "ParentIterator",
    "ParseError",
    "RangeException",
    "RecursiveArrayIterator",
    "RecursiveCachingIterator",
    "RecursiveCallbackFilterIterator",
    "RecursiveDirectoryIterator",
    "RecursiveFilterIterator",
    "RecursiveIterator",
    "RecursiveIteratorIterator",
    "RecursiveRegexIterator",
    "RecursiveTreeIterator",
    "RegexIterator",
    "RuntimeException",
    "SeekableIterator",
    "SplDoublyLinkedList",
    "SplFileInfo",
    "SplFileObject",
    "SplFixedArray",
    "SplHeap",
    "SplMaxHeap",
    "SplMinHeap",
    "SplObjectStorage",
    "SplObserver",
    "SplPriorityQueue",
    "SplQueue",
    "SplStack",
    "SplSubject",
    "SplTempFileObject",
    "TypeError",
    "UnderflowException",
    "UnexpectedValueException",
    "UnhandledMatchError",
    // Reserved interfaces:
    // <https://www.php.net/manual/en/reserved.interfaces.php>
    "ArrayAccess",
    "BackedEnum",
    "Closure",
    "Fiber",
    "Generator",
    "Iterator",
    "IteratorAggregate",
    "Serializable",
    "Stringable",
    "Throwable",
    "Traversable",
    "UnitEnum",
    "WeakReference",
    "WeakMap",
    // Reserved classes:
    // <https://www.php.net/manual/en/reserved.classes.php>
    "Directory",
    "__PHP_Incomplete_Class",
    "parent",
    "php_user_filter",
    "self",
    "static",
    "stdClass"
  ];

  /** Dual-case keywords
   *
   * ["then","FILE"] =>
   *     ["then", "THEN", "FILE", "file"]
   *
   * @param {string[]} items */
  const dualCase = (items) => {
    /** @type string[] */
    const result = [];
    items.forEach(item => {
      result.push(item);
      if (item.toLowerCase() === item) {
        result.push(item.toUpperCase());
      } else {
        result.push(item.toLowerCase());
      }
    });
    return result;
  };

  const KEYWORDS = {
    keyword: KWS,
    literal: dualCase(LITERALS),
    built_in: BUILT_INS,
  };

  /**
   * @param {string[]} items */
  const normalizeKeywords = (items) => {
    return items.map(item => {
      return item.replace(/\|\d+$/, "");
    });
  };

  const CONSTRUCTOR_CALL = { variants: [
    {
      match: [
        /new/,
        regex.concat(WHITESPACE, "+"),
        // to prevent built ins from being confused as the class constructor call
        regex.concat("(?!", normalizeKeywords(BUILT_INS).join("\\b|"), "\\b)"),
        PASCAL_CASE_CLASS_NAME_RE,
      ],
      scope: {
        1: "keyword",
        4: "title.class",
      },
    }
  ] };

  const CONSTANT_REFERENCE = regex.concat(IDENT_RE, "\\b(?!\\()");

  const LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON = { variants: [
    {
      match: [
        regex.concat(
          /::/,
          regex.lookahead(/(?!class\b)/)
        ),
        CONSTANT_REFERENCE,
      ],
      scope: { 2: "variable.constant", },
    },
    {
      match: [
        /::/,
        /class/,
      ],
      scope: { 2: "variable.language", },
    },
    {
      match: [
        PASCAL_CASE_CLASS_NAME_RE,
        regex.concat(
          /::/,
          regex.lookahead(/(?!class\b)/)
        ),
        CONSTANT_REFERENCE,
      ],
      scope: {
        1: "title.class",
        3: "variable.constant",
      },
    },
    {
      match: [
        PASCAL_CASE_CLASS_NAME_RE,
        regex.concat(
          "::",
          regex.lookahead(/(?!class\b)/)
        ),
      ],
      scope: { 1: "title.class", },
    },
    {
      match: [
        PASCAL_CASE_CLASS_NAME_RE,
        /::/,
        /class/,
      ],
      scope: {
        1: "title.class",
        3: "variable.language",
      },
    }
  ] };

  const NAMED_ARGUMENT = {
    scope: 'attr',
    match: regex.concat(IDENT_RE, regex.lookahead(':'), regex.lookahead(/(?!::)/)),
  };
  const PARAMS_MODE = {
    relevance: 0,
    begin: /\(/,
    end: /\)/,
    keywords: KEYWORDS,
    contains: [
      NAMED_ARGUMENT,
      VARIABLE,
      LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
      hljs.C_BLOCK_COMMENT_MODE,
      STRING,
      NUMBER,
      CONSTRUCTOR_CALL,
    ],
  };
  const FUNCTION_INVOKE = {
    relevance: 0,
    match: [
      /\b/,
      // to prevent keywords from being confused as the function title
      regex.concat("(?!fn\\b|function\\b|", normalizeKeywords(KWS).join("\\b|"), "|", normalizeKeywords(BUILT_INS).join("\\b|"), "\\b)"),
      IDENT_RE,
      regex.concat(WHITESPACE, "*"),
      regex.lookahead(/(?=\()/)
    ],
    scope: { 3: "title.function.invoke", },
    contains: [ PARAMS_MODE ]
  };
  PARAMS_MODE.contains.push(FUNCTION_INVOKE);

  const ATTRIBUTE_CONTAINS = [
    NAMED_ARGUMENT,
    LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
    hljs.C_BLOCK_COMMENT_MODE,
    STRING,
    NUMBER,
    CONSTRUCTOR_CALL,
  ];

  const ATTRIBUTES = {
    begin: regex.concat(/#\[\s*/, PASCAL_CASE_CLASS_NAME_RE),
    beginScope: "meta",
    end: /]/,
    endScope: "meta",
    keywords: {
      literal: LITERALS,
      keyword: [
        'new',
        'array',
      ]
    },
    contains: [
      {
        begin: /\[/,
        end: /]/,
        keywords: {
          literal: LITERALS,
          keyword: [
            'new',
            'array',
          ]
        },
        contains: [
          'self',
          ...ATTRIBUTE_CONTAINS,
        ]
      },
      ...ATTRIBUTE_CONTAINS,
      {
        scope: 'meta',
        match: PASCAL_CASE_CLASS_NAME_RE
      }
    ]
  };

  return {
    case_insensitive: false,
    keywords: KEYWORDS,
    contains: [
      ATTRIBUTES,
      hljs.HASH_COMMENT_MODE,
      hljs.COMMENT('//', '$'),
      hljs.COMMENT(
        '/\\*',
        '\\*/',
        { contains: [
          {
            scope: 'doctag',
            match: '@[A-Za-z]+'
          }
        ] }
      ),
      {
        match: /__halt_compiler\(\);/,
        keywords: '__halt_compiler',
        starts: {
          scope: "comment",
          end: hljs.MATCH_NOTHING_RE,
          contains: [
            {
              match: /\?>/,
              scope: "meta",
              endsParent: true
            }
          ]
        }
      },
      PREPROCESSOR,
      {
        scope: 'variable.language',
        match: /\$this\b/
      },
      VARIABLE,
      FUNCTION_INVOKE,
      LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
      {
        match: [
          /const/,
          /\s/,
          IDENT_RE,
        ],
        scope: {
          1: "keyword",
          3: "variable.constant",
        },
      },
      CONSTRUCTOR_CALL,
      {
        scope: 'function',
        relevance: 0,
        beginKeywords: 'fn function',
        end: /[;{]/,
        excludeEnd: true,
        illegal: '[$%\\[]',
        contains: [
          { beginKeywords: 'use', },
          hljs.UNDERSCORE_TITLE_MODE,
          {
            begin: '=>', // No markup, just a relevance booster
            endsParent: true
          },
          {
            scope: 'params',
            begin: '\\(',
            end: '\\)',
            excludeBegin: true,
            excludeEnd: true,
            keywords: KEYWORDS,
            contains: [
              'self',
              VARIABLE,
              LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
              hljs.C_BLOCK_COMMENT_MODE,
              STRING,
              NUMBER
            ]
          },
        ]
      },
      {
        scope: 'class',
        variants: [
          {
            beginKeywords: "enum",
            illegal: /[($"]/
          },
          {
            beginKeywords: "class interface trait",
            illegal: /[:($"]/
          }
        ],
        relevance: 0,
        end: /\{/,
        excludeEnd: true,
        contains: [
          { beginKeywords: 'extends implements' },
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      // both use and namespace still use "old style" rules (vs multi-match)
      // because the namespace name can include `\` and we still want each
      // element to be treated as its own *individual* title
      {
        beginKeywords: 'namespace',
        relevance: 0,
        end: ';',
        illegal: /[.']/,
        contains: [ hljs.inherit(hljs.UNDERSCORE_TITLE_MODE, { scope: "title.class" }) ]
      },
      {
        beginKeywords: 'use',
        relevance: 0,
        end: ';',
        contains: [
          // TODO: title.function vs title.class
          {
            match: /\b(as|const|function)\b/,
            scope: "keyword"
          },
          // TODO: could be title.class or title.function
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      STRING,
      NUMBER,
    ]
  };
}

module.exports = php;


/***/ }),

/***/ "./node_modules/highlight.js/lib/languages/rust.js":
/*!*********************************************************!*\
  !*** ./node_modules/highlight.js/lib/languages/rust.js ***!
  \*********************************************************/
/***/ ((module) => {

/*
Language: Rust
Author: Andrey Vlasovskikh <andrey.vlasovskikh@gmail.com>
Contributors: Roman Shmatov <romanshmatov@gmail.com>, Kasper Andersen <kma_untrusted@protonmail.com>
Website: https://www.rust-lang.org
Category: common, system
*/

/** @type LanguageFn */

function rust(hljs) {
  const regex = hljs.regex;
  // ============================================
  // Added to support the r# keyword, which is a raw identifier in Rust.
  const RAW_IDENTIFIER = /(r#)?/;
  const UNDERSCORE_IDENT_RE = regex.concat(RAW_IDENTIFIER, hljs.UNDERSCORE_IDENT_RE);
  const IDENT_RE = regex.concat(RAW_IDENTIFIER, hljs.IDENT_RE);
  // ============================================
  const FUNCTION_INVOKE = {
    className: "title.function.invoke",
    relevance: 0,
    begin: regex.concat(
      /\b/,
      /(?!let|for|while|if|else|match\b)/,
      IDENT_RE,
      regex.lookahead(/\s*\(/))
  };
  const NUMBER_SUFFIX = '([ui](8|16|32|64|128|size)|f(32|64))\?';
  const KEYWORDS = [
    "abstract",
    "as",
    "async",
    "await",
    "become",
    "box",
    "break",
    "const",
    "continue",
    "crate",
    "do",
    "dyn",
    "else",
    "enum",
    "extern",
    "false",
    "final",
    "fn",
    "for",
    "if",
    "impl",
    "in",
    "let",
    "loop",
    "macro",
    "match",
    "mod",
    "move",
    "mut",
    "override",
    "priv",
    "pub",
    "ref",
    "return",
    "self",
    "Self",
    "static",
    "struct",
    "super",
    "trait",
    "true",
    "try",
    "type",
    "typeof",
    "union",
    "unsafe",
    "unsized",
    "use",
    "virtual",
    "where",
    "while",
    "yield"
  ];
  const LITERALS = [
    "true",
    "false",
    "Some",
    "None",
    "Ok",
    "Err"
  ];
  const BUILTINS = [
    // functions
    'drop ',
    // traits
    "Copy",
    "Send",
    "Sized",
    "Sync",
    "Drop",
    "Fn",
    "FnMut",
    "FnOnce",
    "ToOwned",
    "Clone",
    "Debug",
    "PartialEq",
    "PartialOrd",
    "Eq",
    "Ord",
    "AsRef",
    "AsMut",
    "Into",
    "From",
    "Default",
    "Iterator",
    "Extend",
    "IntoIterator",
    "DoubleEndedIterator",
    "ExactSizeIterator",
    "SliceConcatExt",
    "ToString",
    // macros
    "assert!",
    "assert_eq!",
    "bitflags!",
    "bytes!",
    "cfg!",
    "col!",
    "concat!",
    "concat_idents!",
    "debug_assert!",
    "debug_assert_eq!",
    "env!",
    "eprintln!",
    "panic!",
    "file!",
    "format!",
    "format_args!",
    "include_bytes!",
    "include_str!",
    "line!",
    "local_data_key!",
    "module_path!",
    "option_env!",
    "print!",
    "println!",
    "select!",
    "stringify!",
    "try!",
    "unimplemented!",
    "unreachable!",
    "vec!",
    "write!",
    "writeln!",
    "macro_rules!",
    "assert_ne!",
    "debug_assert_ne!"
  ];
  const TYPES = [
    "i8",
    "i16",
    "i32",
    "i64",
    "i128",
    "isize",
    "u8",
    "u16",
    "u32",
    "u64",
    "u128",
    "usize",
    "f32",
    "f64",
    "str",
    "char",
    "bool",
    "Box",
    "Option",
    "Result",
    "String",
    "Vec"
  ];
  return {
    name: 'Rust',
    aliases: [ 'rs' ],
    keywords: {
      $pattern: hljs.IDENT_RE + '!?',
      type: TYPES,
      keyword: KEYWORDS,
      literal: LITERALS,
      built_in: BUILTINS
    },
    illegal: '</',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.COMMENT('/\\*', '\\*/', { contains: [ 'self' ] }),
      hljs.inherit(hljs.QUOTE_STRING_MODE, {
        begin: /b?"/,
        illegal: null
      }),
      {
        className: 'string',
        variants: [
          { begin: /b?r(#*)"(.|\n)*?"\1(?!#)/ },
          { begin: /b?'\\?(x\w{2}|u\w{4}|U\w{8}|.)'/ }
        ]
      },
      {
        className: 'symbol',
        begin: /'[a-zA-Z_][a-zA-Z0-9_]*/
      },
      {
        className: 'number',
        variants: [
          { begin: '\\b0b([01_]+)' + NUMBER_SUFFIX },
          { begin: '\\b0o([0-7_]+)' + NUMBER_SUFFIX },
          { begin: '\\b0x([A-Fa-f0-9_]+)' + NUMBER_SUFFIX },
          { begin: '\\b(\\d[\\d_]*(\\.[0-9_]+)?([eE][+-]?[0-9_]+)?)'
                   + NUMBER_SUFFIX }
        ],
        relevance: 0
      },
      {
        begin: [
          /fn/,
          /\s+/,
          UNDERSCORE_IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "title.function"
        }
      },
      {
        className: 'meta',
        begin: '#!?\\[',
        end: '\\]',
        contains: [
          {
            className: 'string',
            begin: /"/,
            end: /"/,
            contains: [
              hljs.BACKSLASH_ESCAPE
            ]
          }
        ]
      },
      {
        begin: [
          /let/,
          /\s+/,
          /(?:mut\s+)?/,
          UNDERSCORE_IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "keyword",
          4: "variable"
        }
      },
      // must come before impl/for rule later
      {
        begin: [
          /for/,
          /\s+/,
          UNDERSCORE_IDENT_RE,
          /\s+/,
          /in/
        ],
        className: {
          1: "keyword",
          3: "variable",
          5: "keyword"
        }
      },
      {
        begin: [
          /type/,
          /\s+/,
          UNDERSCORE_IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        begin: [
          /(?:trait|enum|struct|union|impl|for)/,
          /\s+/,
          UNDERSCORE_IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        begin: hljs.IDENT_RE + '::',
        keywords: {
          keyword: "Self",
          built_in: BUILTINS,
          type: TYPES
        }
      },
      {
        className: "punctuation",
        begin: '->'
      },
      FUNCTION_INVOKE
    ]
  };
}

module.exports = rust;


/***/ }),

/***/ "./node_modules/highlight.js/lib/languages/shell.js":
/*!**********************************************************!*\
  !*** ./node_modules/highlight.js/lib/languages/shell.js ***!
  \**********************************************************/
/***/ ((module) => {

/*
Language: Shell Session
Requires: bash.js
Author: TSUYUSATO Kitsune <make.just.on@gmail.com>
Category: common
Audit: 2020
*/

/** @type LanguageFn */
function shell(hljs) {
  return {
    name: 'Shell Session',
    aliases: [
      'console',
      'shellsession'
    ],
    contains: [
      {
        className: 'meta.prompt',
        // We cannot add \s (spaces) in the regular expression otherwise it will be too broad and produce unexpected result.
        // For instance, in the following example, it would match "echo /path/to/home >" as a prompt:
        // echo /path/to/home > t.exe
        begin: /^\s{0,3}[/~\w\d[\]()@-]*[>%$#][ ]?/,
        starts: {
          end: /[^\\](?=\s*$)/,
          subLanguage: 'bash'
        }
      }
    ]
  };
}

module.exports = shell;


/***/ }),

/***/ "./node_modules/highlight.js/lib/languages/sql.js":
/*!********************************************************!*\
  !*** ./node_modules/highlight.js/lib/languages/sql.js ***!
  \********************************************************/
/***/ ((module) => {

/*
 Language: SQL
 Website: https://en.wikipedia.org/wiki/SQL
 Category: common, database
 */

/*

Goals:

SQL is intended to highlight basic/common SQL keywords and expressions

- If pretty much every single SQL server includes supports, then it's a canidate.
- It is NOT intended to include tons of vendor specific keywords (Oracle, MySQL,
  PostgreSQL) although the list of data types is purposely a bit more expansive.
- For more specific SQL grammars please see:
  - PostgreSQL and PL/pgSQL - core
  - T-SQL - https://github.com/highlightjs/highlightjs-tsql
  - sql_more (core)

 */

function sql(hljs) {
  const regex = hljs.regex;
  const COMMENT_MODE = hljs.COMMENT('--', '$');
  const STRING = {
    className: 'string',
    variants: [
      {
        begin: /'/,
        end: /'/,
        contains: [ { begin: /''/ } ]
      }
    ]
  };
  const QUOTED_IDENTIFIER = {
    begin: /"/,
    end: /"/,
    contains: [ { begin: /""/ } ]
  };

  const LITERALS = [
    "true",
    "false",
    // Not sure it's correct to call NULL literal, and clauses like IS [NOT] NULL look strange that way.
    // "null",
    "unknown"
  ];

  const MULTI_WORD_TYPES = [
    "double precision",
    "large object",
    "with timezone",
    "without timezone"
  ];

  const TYPES = [
    'bigint',
    'binary',
    'blob',
    'boolean',
    'char',
    'character',
    'clob',
    'date',
    'dec',
    'decfloat',
    'decimal',
    'float',
    'int',
    'integer',
    'interval',
    'nchar',
    'nclob',
    'national',
    'numeric',
    'real',
    'row',
    'smallint',
    'time',
    'timestamp',
    'varchar',
    'varying', // modifier (character varying)
    'varbinary'
  ];

  const NON_RESERVED_WORDS = [
    "add",
    "asc",
    "collation",
    "desc",
    "final",
    "first",
    "last",
    "view"
  ];

  // https://jakewheat.github.io/sql-overview/sql-2016-foundation-grammar.html#reserved-word
  const RESERVED_WORDS = [
    "abs",
    "acos",
    "all",
    "allocate",
    "alter",
    "and",
    "any",
    "are",
    "array",
    "array_agg",
    "array_max_cardinality",
    "as",
    "asensitive",
    "asin",
    "asymmetric",
    "at",
    "atan",
    "atomic",
    "authorization",
    "avg",
    "begin",
    "begin_frame",
    "begin_partition",
    "between",
    "bigint",
    "binary",
    "blob",
    "boolean",
    "both",
    "by",
    "call",
    "called",
    "cardinality",
    "cascaded",
    "case",
    "cast",
    "ceil",
    "ceiling",
    "char",
    "char_length",
    "character",
    "character_length",
    "check",
    "classifier",
    "clob",
    "close",
    "coalesce",
    "collate",
    "collect",
    "column",
    "commit",
    "condition",
    "connect",
    "constraint",
    "contains",
    "convert",
    "copy",
    "corr",
    "corresponding",
    "cos",
    "cosh",
    "count",
    "covar_pop",
    "covar_samp",
    "create",
    "cross",
    "cube",
    "cume_dist",
    "current",
    "current_catalog",
    "current_date",
    "current_default_transform_group",
    "current_path",
    "current_role",
    "current_row",
    "current_schema",
    "current_time",
    "current_timestamp",
    "current_path",
    "current_role",
    "current_transform_group_for_type",
    "current_user",
    "cursor",
    "cycle",
    "date",
    "day",
    "deallocate",
    "dec",
    "decimal",
    "decfloat",
    "declare",
    "default",
    "define",
    "delete",
    "dense_rank",
    "deref",
    "describe",
    "deterministic",
    "disconnect",
    "distinct",
    "double",
    "drop",
    "dynamic",
    "each",
    "element",
    "else",
    "empty",
    "end",
    "end_frame",
    "end_partition",
    "end-exec",
    "equals",
    "escape",
    "every",
    "except",
    "exec",
    "execute",
    "exists",
    "exp",
    "external",
    "extract",
    "false",
    "fetch",
    "filter",
    "first_value",
    "float",
    "floor",
    "for",
    "foreign",
    "frame_row",
    "free",
    "from",
    "full",
    "function",
    "fusion",
    "get",
    "global",
    "grant",
    "group",
    "grouping",
    "groups",
    "having",
    "hold",
    "hour",
    "identity",
    "in",
    "indicator",
    "initial",
    "inner",
    "inout",
    "insensitive",
    "insert",
    "int",
    "integer",
    "intersect",
    "intersection",
    "interval",
    "into",
    "is",
    "join",
    "json_array",
    "json_arrayagg",
    "json_exists",
    "json_object",
    "json_objectagg",
    "json_query",
    "json_table",
    "json_table_primitive",
    "json_value",
    "lag",
    "language",
    "large",
    "last_value",
    "lateral",
    "lead",
    "leading",
    "left",
    "like",
    "like_regex",
    "listagg",
    "ln",
    "local",
    "localtime",
    "localtimestamp",
    "log",
    "log10",
    "lower",
    "match",
    "match_number",
    "match_recognize",
    "matches",
    "max",
    "member",
    "merge",
    "method",
    "min",
    "minute",
    "mod",
    "modifies",
    "module",
    "month",
    "multiset",
    "national",
    "natural",
    "nchar",
    "nclob",
    "new",
    "no",
    "none",
    "normalize",
    "not",
    "nth_value",
    "ntile",
    "null",
    "nullif",
    "numeric",
    "octet_length",
    "occurrences_regex",
    "of",
    "offset",
    "old",
    "omit",
    "on",
    "one",
    "only",
    "open",
    "or",
    "order",
    "out",
    "outer",
    "over",
    "overlaps",
    "overlay",
    "parameter",
    "partition",
    "pattern",
    "per",
    "percent",
    "percent_rank",
    "percentile_cont",
    "percentile_disc",
    "period",
    "portion",
    "position",
    "position_regex",
    "power",
    "precedes",
    "precision",
    "prepare",
    "primary",
    "procedure",
    "ptf",
    "range",
    "rank",
    "reads",
    "real",
    "recursive",
    "ref",
    "references",
    "referencing",
    "regr_avgx",
    "regr_avgy",
    "regr_count",
    "regr_intercept",
    "regr_r2",
    "regr_slope",
    "regr_sxx",
    "regr_sxy",
    "regr_syy",
    "release",
    "result",
    "return",
    "returns",
    "revoke",
    "right",
    "rollback",
    "rollup",
    "row",
    "row_number",
    "rows",
    "running",
    "savepoint",
    "scope",
    "scroll",
    "search",
    "second",
    "seek",
    "select",
    "sensitive",
    "session_user",
    "set",
    "show",
    "similar",
    "sin",
    "sinh",
    "skip",
    "smallint",
    "some",
    "specific",
    "specifictype",
    "sql",
    "sqlexception",
    "sqlstate",
    "sqlwarning",
    "sqrt",
    "start",
    "static",
    "stddev_pop",
    "stddev_samp",
    "submultiset",
    "subset",
    "substring",
    "substring_regex",
    "succeeds",
    "sum",
    "symmetric",
    "system",
    "system_time",
    "system_user",
    "table",
    "tablesample",
    "tan",
    "tanh",
    "then",
    "time",
    "timestamp",
    "timezone_hour",
    "timezone_minute",
    "to",
    "trailing",
    "translate",
    "translate_regex",
    "translation",
    "treat",
    "trigger",
    "trim",
    "trim_array",
    "true",
    "truncate",
    "uescape",
    "union",
    "unique",
    "unknown",
    "unnest",
    "update",
    "upper",
    "user",
    "using",
    "value",
    "values",
    "value_of",
    "var_pop",
    "var_samp",
    "varbinary",
    "varchar",
    "varying",
    "versioning",
    "when",
    "whenever",
    "where",
    "width_bucket",
    "window",
    "with",
    "within",
    "without",
    "year",
  ];

  // these are reserved words we have identified to be functions
  // and should only be highlighted in a dispatch-like context
  // ie, array_agg(...), etc.
  const RESERVED_FUNCTIONS = [
    "abs",
    "acos",
    "array_agg",
    "asin",
    "atan",
    "avg",
    "cast",
    "ceil",
    "ceiling",
    "coalesce",
    "corr",
    "cos",
    "cosh",
    "count",
    "covar_pop",
    "covar_samp",
    "cume_dist",
    "dense_rank",
    "deref",
    "element",
    "exp",
    "extract",
    "first_value",
    "floor",
    "json_array",
    "json_arrayagg",
    "json_exists",
    "json_object",
    "json_objectagg",
    "json_query",
    "json_table",
    "json_table_primitive",
    "json_value",
    "lag",
    "last_value",
    "lead",
    "listagg",
    "ln",
    "log",
    "log10",
    "lower",
    "max",
    "min",
    "mod",
    "nth_value",
    "ntile",
    "nullif",
    "percent_rank",
    "percentile_cont",
    "percentile_disc",
    "position",
    "position_regex",
    "power",
    "rank",
    "regr_avgx",
    "regr_avgy",
    "regr_count",
    "regr_intercept",
    "regr_r2",
    "regr_slope",
    "regr_sxx",
    "regr_sxy",
    "regr_syy",
    "row_number",
    "sin",
    "sinh",
    "sqrt",
    "stddev_pop",
    "stddev_samp",
    "substring",
    "substring_regex",
    "sum",
    "tan",
    "tanh",
    "translate",
    "translate_regex",
    "treat",
    "trim",
    "trim_array",
    "unnest",
    "upper",
    "value_of",
    "var_pop",
    "var_samp",
    "width_bucket",
  ];

  // these functions can
  const POSSIBLE_WITHOUT_PARENS = [
    "current_catalog",
    "current_date",
    "current_default_transform_group",
    "current_path",
    "current_role",
    "current_schema",
    "current_transform_group_for_type",
    "current_user",
    "session_user",
    "system_time",
    "system_user",
    "current_time",
    "localtime",
    "current_timestamp",
    "localtimestamp"
  ];

  // those exist to boost relevance making these very
  // "SQL like" keyword combos worth +1 extra relevance
  const COMBOS = [
    "create table",
    "insert into",
    "primary key",
    "foreign key",
    "not null",
    "alter table",
    "add constraint",
    "grouping sets",
    "on overflow",
    "character set",
    "respect nulls",
    "ignore nulls",
    "nulls first",
    "nulls last",
    "depth first",
    "breadth first"
  ];

  const FUNCTIONS = RESERVED_FUNCTIONS;

  const KEYWORDS = [
    ...RESERVED_WORDS,
    ...NON_RESERVED_WORDS
  ].filter((keyword) => {
    return !RESERVED_FUNCTIONS.includes(keyword);
  });

  const VARIABLE = {
    className: "variable",
    begin: /@[a-z0-9][a-z0-9_]*/,
  };

  const OPERATOR = {
    className: "operator",
    begin: /[-+*/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?/,
    relevance: 0,
  };

  const FUNCTION_CALL = {
    begin: regex.concat(/\b/, regex.either(...FUNCTIONS), /\s*\(/),
    relevance: 0,
    keywords: { built_in: FUNCTIONS }
  };

  // keywords with less than 3 letters are reduced in relevancy
  function reduceRelevancy(list, {
    exceptions, when
  } = {}) {
    const qualifyFn = when;
    exceptions = exceptions || [];
    return list.map((item) => {
      if (item.match(/\|\d+$/) || exceptions.includes(item)) {
        return item;
      } else if (qualifyFn(item)) {
        return `${item}|0`;
      } else {
        return item;
      }
    });
  }

  return {
    name: 'SQL',
    case_insensitive: true,
    // does not include {} or HTML tags `</`
    illegal: /[{}]|<\//,
    keywords: {
      $pattern: /\b[\w\.]+/,
      keyword:
        reduceRelevancy(KEYWORDS, { when: (x) => x.length < 3 }),
      literal: LITERALS,
      type: TYPES,
      built_in: POSSIBLE_WITHOUT_PARENS
    },
    contains: [
      {
        begin: regex.either(...COMBOS),
        relevance: 0,
        keywords: {
          $pattern: /[\w\.]+/,
          keyword: KEYWORDS.concat(COMBOS),
          literal: LITERALS,
          type: TYPES
        },
      },
      {
        className: "type",
        begin: regex.either(...MULTI_WORD_TYPES)
      },
      FUNCTION_CALL,
      VARIABLE,
      STRING,
      QUOTED_IDENTIFIER,
      hljs.C_NUMBER_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      COMMENT_MODE,
      OPERATOR
    ]
  };
}

module.exports = sql;


/***/ }),

/***/ "./node_modules/highlight.js/lib/languages/xml.js":
/*!********************************************************!*\
  !*** ./node_modules/highlight.js/lib/languages/xml.js ***!
  \********************************************************/
/***/ ((module) => {

/*
Language: HTML, XML
Website: https://www.w3.org/XML/
Category: common, web
Audit: 2020
*/

/** @type LanguageFn */
function xml(hljs) {
  const regex = hljs.regex;
  // XML names can have the following additional letters: https://www.w3.org/TR/xml/#NT-NameChar
  // OTHER_NAME_CHARS = /[:\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]/;
  // Element names start with NAME_START_CHAR followed by optional other Unicode letters, ASCII digits, hyphens, underscores, and periods
  // const TAG_NAME_RE = regex.concat(/[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, regex.optional(/[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*:/), /[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*/);;
  // const XML_IDENT_RE = /[A-Z_a-z:\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]+/;
  // const TAG_NAME_RE = regex.concat(/[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, regex.optional(/[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*:/), /[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*/);
  // however, to cater for performance and more Unicode support rely simply on the Unicode letter class
  const TAG_NAME_RE = regex.concat(/[\p{L}_]/u, regex.optional(/[\p{L}0-9_.-]*:/u), /[\p{L}0-9_.-]*/u);
  const XML_IDENT_RE = /[\p{L}0-9._:-]+/u;
  const XML_ENTITIES = {
    className: 'symbol',
    begin: /&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/
  };
  const XML_META_KEYWORDS = {
    begin: /\s/,
    contains: [
      {
        className: 'keyword',
        begin: /#?[a-z_][a-z1-9_-]+/,
        illegal: /\n/
      }
    ]
  };
  const XML_META_PAR_KEYWORDS = hljs.inherit(XML_META_KEYWORDS, {
    begin: /\(/,
    end: /\)/
  });
  const APOS_META_STRING_MODE = hljs.inherit(hljs.APOS_STRING_MODE, { className: 'string' });
  const QUOTE_META_STRING_MODE = hljs.inherit(hljs.QUOTE_STRING_MODE, { className: 'string' });
  const TAG_INTERNALS = {
    endsWithParent: true,
    illegal: /</,
    relevance: 0,
    contains: [
      {
        className: 'attr',
        begin: XML_IDENT_RE,
        relevance: 0
      },
      {
        begin: /=\s*/,
        relevance: 0,
        contains: [
          {
            className: 'string',
            endsParent: true,
            variants: [
              {
                begin: /"/,
                end: /"/,
                contains: [ XML_ENTITIES ]
              },
              {
                begin: /'/,
                end: /'/,
                contains: [ XML_ENTITIES ]
              },
              { begin: /[^\s"'=<>`]+/ }
            ]
          }
        ]
      }
    ]
  };
  return {
    name: 'HTML, XML',
    aliases: [
      'html',
      'xhtml',
      'rss',
      'atom',
      'xjb',
      'xsd',
      'xsl',
      'plist',
      'wsf',
      'svg'
    ],
    case_insensitive: true,
    unicodeRegex: true,
    contains: [
      {
        className: 'meta',
        begin: /<![a-z]/,
        end: />/,
        relevance: 10,
        contains: [
          XML_META_KEYWORDS,
          QUOTE_META_STRING_MODE,
          APOS_META_STRING_MODE,
          XML_META_PAR_KEYWORDS,
          {
            begin: /\[/,
            end: /\]/,
            contains: [
              {
                className: 'meta',
                begin: /<![a-z]/,
                end: />/,
                contains: [
                  XML_META_KEYWORDS,
                  XML_META_PAR_KEYWORDS,
                  QUOTE_META_STRING_MODE,
                  APOS_META_STRING_MODE
                ]
              }
            ]
          }
        ]
      },
      hljs.COMMENT(
        /<!--/,
        /-->/,
        { relevance: 10 }
      ),
      {
        begin: /<!\[CDATA\[/,
        end: /\]\]>/,
        relevance: 10
      },
      XML_ENTITIES,
      // xml processing instructions
      {
        className: 'meta',
        end: /\?>/,
        variants: [
          {
            begin: /<\?xml/,
            relevance: 10,
            contains: [
              QUOTE_META_STRING_MODE
            ]
          },
          {
            begin: /<\?[a-z][a-z0-9]+/,
          }
        ]

      },
      {
        className: 'tag',
        /*
        The lookahead pattern (?=...) ensures that 'begin' only matches
        '<style' as a single word, followed by a whitespace or an
        ending bracket.
        */
        begin: /<style(?=\s|>)/,
        end: />/,
        keywords: { name: 'style' },
        contains: [ TAG_INTERNALS ],
        starts: {
          end: /<\/style>/,
          returnEnd: true,
          subLanguage: [
            'css',
            'xml'
          ]
        }
      },
      {
        className: 'tag',
        // See the comment in the <style tag about the lookahead pattern
        begin: /<script(?=\s|>)/,
        end: />/,
        keywords: { name: 'script' },
        contains: [ TAG_INTERNALS ],
        starts: {
          end: /<\/script>/,
          returnEnd: true,
          subLanguage: [
            'javascript',
            'handlebars',
            'xml'
          ]
        }
      },
      // we need this for now for jSX
      {
        className: 'tag',
        begin: /<>|<\/>/
      },
      // open tag
      {
        className: 'tag',
        begin: regex.concat(
          /</,
          regex.lookahead(regex.concat(
            TAG_NAME_RE,
            // <tag/>
            // <tag>
            // <tag ...
            regex.either(/\/>/, />/, /\s/)
          ))
        ),
        end: /\/?>/,
        contains: [
          {
            className: 'name',
            begin: TAG_NAME_RE,
            relevance: 0,
            starts: TAG_INTERNALS
          }
        ]
      },
      // close tag
      {
        className: 'tag',
        begin: regex.concat(
          /<\//,
          regex.lookahead(regex.concat(
            TAG_NAME_RE, />/
          ))
        ),
        contains: [
          {
            className: 'name',
            begin: TAG_NAME_RE,
            relevance: 0
          },
          {
            begin: />/,
            relevance: 0,
            endsParent: true
          }
        ]
      }
    ]
  };
}

module.exports = xml;


/***/ }),

/***/ "./node_modules/highlight.js/lib/languages/yaml.js":
/*!*********************************************************!*\
  !*** ./node_modules/highlight.js/lib/languages/yaml.js ***!
  \*********************************************************/
/***/ ((module) => {

/*
Language: YAML
Description: Yet Another Markdown Language
Author: Stefan Wienert <stwienert@gmail.com>
Contributors: Carl Baxter <carl@cbax.tech>
Requires: ruby.js
Website: https://yaml.org
Category: common, config
*/
function yaml(hljs) {
  const LITERALS = 'true false yes no null';

  // YAML spec allows non-reserved URI characters in tags.
  const URI_CHARACTERS = '[\\w#;/?:@&=+$,.~*\'()[\\]]+';

  // Define keys as starting with a word character
  // ...containing word chars, spaces, colons, forward-slashes, hyphens and periods
  // ...and ending with a colon followed immediately by a space, tab or newline.
  // The YAML spec allows for much more than this, but this covers most use-cases.
  const KEY = {
    className: 'attr',
    variants: [
      // added brackets support 
      { begin: /\w[\w :()\./-]*:(?=[ \t]|$)/ },
      { // double quoted keys - with brackets
        begin: /"\w[\w :()\./-]*":(?=[ \t]|$)/ },
      { // single quoted keys - with brackets
        begin: /'\w[\w :()\./-]*':(?=[ \t]|$)/ },
    ]
  };

  const TEMPLATE_VARIABLES = {
    className: 'template-variable',
    variants: [
      { // jinja templates Ansible
        begin: /\{\{/,
        end: /\}\}/
      },
      { // Ruby i18n
        begin: /%\{/,
        end: /\}/
      }
    ]
  };
  const STRING = {
    className: 'string',
    relevance: 0,
    variants: [
      {
        begin: /'/,
        end: /'/
      },
      {
        begin: /"/,
        end: /"/
      },
      { begin: /\S+/ }
    ],
    contains: [
      hljs.BACKSLASH_ESCAPE,
      TEMPLATE_VARIABLES
    ]
  };

  // Strings inside of value containers (objects) can't contain braces,
  // brackets, or commas
  const CONTAINER_STRING = hljs.inherit(STRING, { variants: [
    {
      begin: /'/,
      end: /'/
    },
    {
      begin: /"/,
      end: /"/
    },
    { begin: /[^\s,{}[\]]+/ }
  ] });

  const DATE_RE = '[0-9]{4}(-[0-9][0-9]){0,2}';
  const TIME_RE = '([Tt \\t][0-9][0-9]?(:[0-9][0-9]){2})?';
  const FRACTION_RE = '(\\.[0-9]*)?';
  const ZONE_RE = '([ \\t])*(Z|[-+][0-9][0-9]?(:[0-9][0-9])?)?';
  const TIMESTAMP = {
    className: 'number',
    begin: '\\b' + DATE_RE + TIME_RE + FRACTION_RE + ZONE_RE + '\\b'
  };

  const VALUE_CONTAINER = {
    end: ',',
    endsWithParent: true,
    excludeEnd: true,
    keywords: LITERALS,
    relevance: 0
  };
  const OBJECT = {
    begin: /\{/,
    end: /\}/,
    contains: [ VALUE_CONTAINER ],
    illegal: '\\n',
    relevance: 0
  };
  const ARRAY = {
    begin: '\\[',
    end: '\\]',
    contains: [ VALUE_CONTAINER ],
    illegal: '\\n',
    relevance: 0
  };

  const MODES = [
    KEY,
    {
      className: 'meta',
      begin: '^---\\s*$',
      relevance: 10
    },
    { // multi line string
      // Blocks start with a | or > followed by a newline
      //
      // Indentation of subsequent lines must be the same to
      // be considered part of the block
      className: 'string',
      begin: '[\\|>]([1-9]?[+-])?[ ]*\\n( +)[^ ][^\\n]*\\n(\\2[^\\n]+\\n?)*'
    },
    { // Ruby/Rails erb
      begin: '<%[%=-]?',
      end: '[%-]?%>',
      subLanguage: 'ruby',
      excludeBegin: true,
      excludeEnd: true,
      relevance: 0
    },
    { // named tags
      className: 'type',
      begin: '!\\w+!' + URI_CHARACTERS
    },
    // https://yaml.org/spec/1.2/spec.html#id2784064
    { // verbatim tags
      className: 'type',
      begin: '!<' + URI_CHARACTERS + ">"
    },
    { // primary tags
      className: 'type',
      begin: '!' + URI_CHARACTERS
    },
    { // secondary tags
      className: 'type',
      begin: '!!' + URI_CHARACTERS
    },
    { // fragment id &ref
      className: 'meta',
      begin: '&' + hljs.UNDERSCORE_IDENT_RE + '$'
    },
    { // fragment reference *ref
      className: 'meta',
      begin: '\\*' + hljs.UNDERSCORE_IDENT_RE + '$'
    },
    { // array listing
      className: 'bullet',
      // TODO: remove |$ hack when we have proper look-ahead support
      begin: '-(?=[ ]|$)',
      relevance: 0
    },
    hljs.HASH_COMMENT_MODE,
    {
      beginKeywords: LITERALS,
      keywords: { literal: LITERALS }
    },
    TIMESTAMP,
    // numbers are any valid C-style number that
    // sit isolated from other words
    {
      className: 'number',
      begin: hljs.C_NUMBER_RE + '\\b',
      relevance: 0
    },
    OBJECT,
    ARRAY,
    STRING
  ];

  const VALUE_MODES = [ ...MODES ];
  VALUE_MODES.pop();
  VALUE_MODES.push(CONTAINER_STRING);
  VALUE_CONTAINER.contains = VALUE_MODES;

  return {
    name: 'YAML',
    case_insensitive: true,
    aliases: [ 'yml' ],
    contains: MODES
  };
}

module.exports = yaml;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*********************************!*\
  !*** ./source/assets/js/app.js ***!
  \*********************************/
__webpack_require__(/*! ../css/app.scss */ "./source/assets/css/app.scss");
var hljs = __webpack_require__(/*! highlight.js/lib/core */ "./node_modules/highlight.js/lib/core.js");
hljs.registerLanguage('xml', __webpack_require__(/*! highlight.js/lib/languages/xml */ "./node_modules/highlight.js/lib/languages/xml.js"));
hljs.registerLanguage('php', __webpack_require__(/*! highlight.js/lib/languages/php */ "./node_modules/highlight.js/lib/languages/php.js"));
hljs.registerLanguage('http', __webpack_require__(/*! highlight.js/lib/languages/http */ "./node_modules/highlight.js/lib/languages/http.js"));
hljs.registerLanguage('shell', __webpack_require__(/*! highlight.js/lib/languages/shell */ "./node_modules/highlight.js/lib/languages/shell.js"));
hljs.registerLanguage('bash', __webpack_require__(/*! highlight.js/lib/languages/bash */ "./node_modules/highlight.js/lib/languages/bash.js"));
hljs.registerLanguage('rust', __webpack_require__(/*! highlight.js/lib/languages/rust */ "./node_modules/highlight.js/lib/languages/rust.js"));
hljs.registerLanguage('sql', __webpack_require__(/*! highlight.js/lib/languages/sql */ "./node_modules/highlight.js/lib/languages/sql.js"));
hljs.registerLanguage('yaml', __webpack_require__(/*! highlight.js/lib/languages/yaml */ "./node_modules/highlight.js/lib/languages/yaml.js"));
hljs.highlightAll();
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQix5QkFBeUI7QUFDekM7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLHFDQUFxQztBQUNyQztBQUNBLGdEQUFnRCxxQkFBcUI7QUFDckU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esc0JBQXNCOztBQUV0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7QUN0WkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDLEVBQUU7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0EsMkJBQTJCLEVBQUU7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQSw2QkFBNkIsY0FBYztBQUMzQztBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsV0FBVyxTQUFTO0FBQ3BCLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0VBQXdFLEdBQUc7QUFDM0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsZ0NBQWdDO0FBQ3hDLFFBQVEsZUFBZTtBQUN2QjtBQUNBLFFBQVEsOEJBQThCO0FBQ3RDLFFBQVEsZUFBZTtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxnQkFBZ0I7QUFDeEI7QUFDQSxrQkFBa0I7QUFDbEIsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBLDhEQUE4RCxnQkFBZ0I7QUFDOUU7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQix1Q0FBdUM7QUFDdEUsNkJBQTZCLHlEQUF5RDtBQUN0Rjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsc0NBQXNDO0FBQzlDLFFBQVEsd0NBQXdDO0FBQ2hELFFBQVEsb0RBQW9EO0FBQzVEO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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Q0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZTtBQUNmO0FBQ0EsK0RBQStELHNCQUFzQjtBQUNyRixPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsZUFBZTtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7O0FDcG1CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxxQ0FBcUMsc0JBQXNCO0FBQzNEO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxZQUFZLG1DQUFtQztBQUMvQyxZQUFZLG1CQUFtQixFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDL0M7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLFlBQVksd0NBQXdDO0FBQ3BELFlBQVkseUNBQXlDO0FBQ3JELFlBQVksK0NBQStDO0FBQzNELFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7O0FDM1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsSUFBSTtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7Ozs7OztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixjQUFjO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixjQUFjO0FBQ2hDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEI7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSSxJQUFJO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUixrQkFBa0IsS0FBSztBQUN2QixRQUFRO0FBQ1I7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkI7QUFDM0IsaUJBQWlCO0FBQ2pCO0FBQ0E7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Z0MsQ0FBQyxDQUFDO0FBQ3ZFQyxJQUFJLENBQUNDLGdCQUFnQixDQUFDLE1BQU0sRUFBRUYsbUJBQU8sQ0FBQywwRkFBaUMsQ0FBQyxDQUFDO0FBRXpFQyxJQUFJLENBQUNFLFlBQVksQ0FBQyxDQUFDLEMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zb3VyY2UvYXNzZXRzL2Nzcy9hcHAuc2Nzcz9lMzFhIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9oaWdobGlnaHQuanMvbGliL2NvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2hpZ2hsaWdodC5qcy9saWIvbGFuZ3VhZ2VzL2Jhc2guanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2hpZ2hsaWdodC5qcy9saWIvbGFuZ3VhZ2VzL2h0dHAuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2hpZ2hsaWdodC5qcy9saWIvbGFuZ3VhZ2VzL3BocC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvaGlnaGxpZ2h0LmpzL2xpYi9sYW5ndWFnZXMvcnVzdC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvaGlnaGxpZ2h0LmpzL2xpYi9sYW5ndWFnZXMvc2hlbGwuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2hpZ2hsaWdodC5qcy9saWIvbGFuZ3VhZ2VzL3NxbC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvaGlnaGxpZ2h0LmpzL2xpYi9sYW5ndWFnZXMveG1sLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9oaWdobGlnaHQuanMvbGliL2xhbmd1YWdlcy95YW1sLmpzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vLi9zb3VyY2UvYXNzZXRzL2pzL2FwcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBleHRyYWN0ZWQgYnkgbWluaS1jc3MtZXh0cmFjdC1wbHVnaW5cbmV4cG9ydCB7fTsiLCIvKiBlc2xpbnQtZGlzYWJsZSBuby1tdWx0aS1hc3NpZ24gKi9cblxuZnVuY3Rpb24gZGVlcEZyZWV6ZShvYmopIHtcbiAgaWYgKG9iaiBpbnN0YW5jZW9mIE1hcCkge1xuICAgIG9iai5jbGVhciA9XG4gICAgICBvYmouZGVsZXRlID1cbiAgICAgIG9iai5zZXQgPVxuICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdtYXAgaXMgcmVhZC1vbmx5Jyk7XG4gICAgICAgIH07XG4gIH0gZWxzZSBpZiAob2JqIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgb2JqLmFkZCA9XG4gICAgICBvYmouY2xlYXIgPVxuICAgICAgb2JqLmRlbGV0ZSA9XG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldCBpcyByZWFkLW9ubHknKTtcbiAgICAgICAgfTtcbiAgfVxuXG4gIC8vIEZyZWV6ZSBzZWxmXG4gIE9iamVjdC5mcmVlemUob2JqKTtcblxuICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICBjb25zdCBwcm9wID0gb2JqW25hbWVdO1xuICAgIGNvbnN0IHR5cGUgPSB0eXBlb2YgcHJvcDtcblxuICAgIC8vIEZyZWV6ZSBwcm9wIGlmIGl0IGlzIGFuIG9iamVjdCBvciBmdW5jdGlvbiBhbmQgYWxzbyBub3QgYWxyZWFkeSBmcm96ZW5cbiAgICBpZiAoKHR5cGUgPT09ICdvYmplY3QnIHx8IHR5cGUgPT09ICdmdW5jdGlvbicpICYmICFPYmplY3QuaXNGcm96ZW4ocHJvcCkpIHtcbiAgICAgIGRlZXBGcmVlemUocHJvcCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gb2JqO1xufVxuXG4vKiogQHR5cGVkZWYge2ltcG9ydCgnaGlnaGxpZ2h0LmpzJykuQ2FsbGJhY2tSZXNwb25zZX0gQ2FsbGJhY2tSZXNwb25zZSAqL1xuLyoqIEB0eXBlZGVmIHtpbXBvcnQoJ2hpZ2hsaWdodC5qcycpLkNvbXBpbGVkTW9kZX0gQ29tcGlsZWRNb2RlICovXG4vKiogQGltcGxlbWVudHMgQ2FsbGJhY2tSZXNwb25zZSAqL1xuXG5jbGFzcyBSZXNwb25zZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge0NvbXBpbGVkTW9kZX0gbW9kZVxuICAgKi9cbiAgY29uc3RydWN0b3IobW9kZSkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZmluZWRcbiAgICBpZiAobW9kZS5kYXRhID09PSB1bmRlZmluZWQpIG1vZGUuZGF0YSA9IHt9O1xuXG4gICAgdGhpcy5kYXRhID0gbW9kZS5kYXRhO1xuICAgIHRoaXMuaXNNYXRjaElnbm9yZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGlnbm9yZU1hdGNoKCkge1xuICAgIHRoaXMuaXNNYXRjaElnbm9yZWQgPSB0cnVlO1xuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBlc2NhcGVIVE1MKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZVxuICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgLnJlcGxhY2UoLycvZywgJyYjeDI3OycpO1xufVxuXG4vKipcbiAqIHBlcmZvcm1zIGEgc2hhbGxvdyBtZXJnZSBvZiBtdWx0aXBsZSBvYmplY3RzIGludG8gb25lXG4gKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7VH0gb3JpZ2luYWxcbiAqIEBwYXJhbSB7UmVjb3JkPHN0cmluZyxhbnk+W119IG9iamVjdHNcbiAqIEByZXR1cm5zIHtUfSBhIHNpbmdsZSBuZXcgb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIGluaGVyaXQkMShvcmlnaW5hbCwgLi4ub2JqZWN0cykge1xuICAvKiogQHR5cGUgUmVjb3JkPHN0cmluZyxhbnk+ICovXG4gIGNvbnN0IHJlc3VsdCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgZm9yIChjb25zdCBrZXkgaW4gb3JpZ2luYWwpIHtcbiAgICByZXN1bHRba2V5XSA9IG9yaWdpbmFsW2tleV07XG4gIH1cbiAgb2JqZWN0cy5mb3JFYWNoKGZ1bmN0aW9uKG9iaikge1xuICAgIGZvciAoY29uc3Qga2V5IGluIG9iaikge1xuICAgICAgcmVzdWx0W2tleV0gPSBvYmpba2V5XTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gLyoqIEB0eXBlIHtUfSAqLyAocmVzdWx0KTtcbn1cblxuLyoqXG4gKiBAdHlwZWRlZiB7b2JqZWN0fSBSZW5kZXJlclxuICogQHByb3BlcnR5IHsodGV4dDogc3RyaW5nKSA9PiB2b2lkfSBhZGRUZXh0XG4gKiBAcHJvcGVydHkgeyhub2RlOiBOb2RlKSA9PiB2b2lkfSBvcGVuTm9kZVxuICogQHByb3BlcnR5IHsobm9kZTogTm9kZSkgPT4gdm9pZH0gY2xvc2VOb2RlXG4gKiBAcHJvcGVydHkgeygpID0+IHN0cmluZ30gdmFsdWVcbiAqL1xuXG4vKiogQHR5cGVkZWYge3tzY29wZT86IHN0cmluZywgbGFuZ3VhZ2U/OiBzdHJpbmcsIHN1Ymxhbmd1YWdlPzogYm9vbGVhbn19IE5vZGUgKi9cbi8qKiBAdHlwZWRlZiB7e3dhbGs6IChyOiBSZW5kZXJlcikgPT4gdm9pZH19IFRyZWUgKi9cbi8qKiAqL1xuXG5jb25zdCBTUEFOX0NMT1NFID0gJzwvc3Bhbj4nO1xuXG4vKipcbiAqIERldGVybWluZXMgaWYgYSBub2RlIG5lZWRzIHRvIGJlIHdyYXBwZWQgaW4gPHNwYW4+XG4gKlxuICogQHBhcmFtIHtOb2RlfSBub2RlICovXG5jb25zdCBlbWl0c1dyYXBwaW5nVGFncyA9IChub2RlKSA9PiB7XG4gIC8vIHJhcmVseSB3ZSBjYW4gaGF2ZSBhIHN1Ymxhbmd1YWdlIHdoZXJlIGxhbmd1YWdlIGlzIHVuZGVmaW5lZFxuICAvLyBUT0RPOiB0cmFjayBkb3duIHdoeVxuICByZXR1cm4gISFub2RlLnNjb3BlO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7e3ByZWZpeDpzdHJpbmd9fSBvcHRpb25zXG4gKi9cbmNvbnN0IHNjb3BlVG9DU1NDbGFzcyA9IChuYW1lLCB7IHByZWZpeCB9KSA9PiB7XG4gIC8vIHN1Yi1sYW5ndWFnZVxuICBpZiAobmFtZS5zdGFydHNXaXRoKFwibGFuZ3VhZ2U6XCIpKSB7XG4gICAgcmV0dXJuIG5hbWUucmVwbGFjZShcImxhbmd1YWdlOlwiLCBcImxhbmd1YWdlLVwiKTtcbiAgfVxuICAvLyB0aWVyZWQgc2NvcGU6IGNvbW1lbnQubGluZVxuICBpZiAobmFtZS5pbmNsdWRlcyhcIi5cIikpIHtcbiAgICBjb25zdCBwaWVjZXMgPSBuYW1lLnNwbGl0KFwiLlwiKTtcbiAgICByZXR1cm4gW1xuICAgICAgYCR7cHJlZml4fSR7cGllY2VzLnNoaWZ0KCl9YCxcbiAgICAgIC4uLihwaWVjZXMubWFwKCh4LCBpKSA9PiBgJHt4fSR7XCJfXCIucmVwZWF0KGkgKyAxKX1gKSlcbiAgICBdLmpvaW4oXCIgXCIpO1xuICB9XG4gIC8vIHNpbXBsZSBzY29wZVxuICByZXR1cm4gYCR7cHJlZml4fSR7bmFtZX1gO1xufTtcblxuLyoqIEB0eXBlIHtSZW5kZXJlcn0gKi9cbmNsYXNzIEhUTUxSZW5kZXJlciB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IEhUTUxSZW5kZXJlclxuICAgKlxuICAgKiBAcGFyYW0ge1RyZWV9IHBhcnNlVHJlZSAtIHRoZSBwYXJzZSB0cmVlIChtdXN0IHN1cHBvcnQgYHdhbGtgIEFQSSlcbiAgICogQHBhcmFtIHt7Y2xhc3NQcmVmaXg6IHN0cmluZ319IG9wdGlvbnNcbiAgICovXG4gIGNvbnN0cnVjdG9yKHBhcnNlVHJlZSwgb3B0aW9ucykge1xuICAgIHRoaXMuYnVmZmVyID0gXCJcIjtcbiAgICB0aGlzLmNsYXNzUHJlZml4ID0gb3B0aW9ucy5jbGFzc1ByZWZpeDtcbiAgICBwYXJzZVRyZWUud2Fsayh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIHRleHRzIHRvIHRoZSBvdXRwdXQgc3RyZWFtXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0ICovXG4gIGFkZFRleHQodGV4dCkge1xuICAgIHRoaXMuYnVmZmVyICs9IGVzY2FwZUhUTUwodGV4dCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIG5vZGUgb3BlbiB0byB0aGUgb3V0cHV0IHN0cmVhbSAoaWYgbmVlZGVkKVxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGUgKi9cbiAgb3Blbk5vZGUobm9kZSkge1xuICAgIGlmICghZW1pdHNXcmFwcGluZ1RhZ3Mobm9kZSkpIHJldHVybjtcblxuICAgIGNvbnN0IGNsYXNzTmFtZSA9IHNjb3BlVG9DU1NDbGFzcyhub2RlLnNjb3BlLFxuICAgICAgeyBwcmVmaXg6IHRoaXMuY2xhc3NQcmVmaXggfSk7XG4gICAgdGhpcy5zcGFuKGNsYXNzTmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIG5vZGUgY2xvc2UgdG8gdGhlIG91dHB1dCBzdHJlYW0gKGlmIG5lZWRlZClcbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSBub2RlICovXG4gIGNsb3NlTm9kZShub2RlKSB7XG4gICAgaWYgKCFlbWl0c1dyYXBwaW5nVGFncyhub2RlKSkgcmV0dXJuO1xuXG4gICAgdGhpcy5idWZmZXIgKz0gU1BBTl9DTE9TRTtcbiAgfVxuXG4gIC8qKlxuICAgKiByZXR1cm5zIHRoZSBhY2N1bXVsYXRlZCBidWZmZXJcbiAgKi9cbiAgdmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyO1xuICB9XG5cbiAgLy8gaGVscGVyc1xuXG4gIC8qKlxuICAgKiBCdWlsZHMgYSBzcGFuIGVsZW1lbnRcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGNsYXNzTmFtZSAqL1xuICBzcGFuKGNsYXNzTmFtZSkge1xuICAgIHRoaXMuYnVmZmVyICs9IGA8c3BhbiBjbGFzcz1cIiR7Y2xhc3NOYW1lfVwiPmA7XG4gIH1cbn1cblxuLyoqIEB0eXBlZGVmIHt7c2NvcGU/OiBzdHJpbmcsIGxhbmd1YWdlPzogc3RyaW5nLCBjaGlsZHJlbjogTm9kZVtdfSB8IHN0cmluZ30gTm9kZSAqL1xuLyoqIEB0eXBlZGVmIHt7c2NvcGU/OiBzdHJpbmcsIGxhbmd1YWdlPzogc3RyaW5nLCBjaGlsZHJlbjogTm9kZVtdfSB9IERhdGFOb2RlICovXG4vKiogQHR5cGVkZWYge2ltcG9ydCgnaGlnaGxpZ2h0LmpzJykuRW1pdHRlcn0gRW1pdHRlciAqL1xuLyoqICAqL1xuXG4vKiogQHJldHVybnMge0RhdGFOb2RlfSAqL1xuY29uc3QgbmV3Tm9kZSA9IChvcHRzID0ge30pID0+IHtcbiAgLyoqIEB0eXBlIERhdGFOb2RlICovXG4gIGNvbnN0IHJlc3VsdCA9IHsgY2hpbGRyZW46IFtdIH07XG4gIE9iamVjdC5hc3NpZ24ocmVzdWx0LCBvcHRzKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmNsYXNzIFRva2VuVHJlZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8qKiBAdHlwZSBEYXRhTm9kZSAqL1xuICAgIHRoaXMucm9vdE5vZGUgPSBuZXdOb2RlKCk7XG4gICAgdGhpcy5zdGFjayA9IFt0aGlzLnJvb3ROb2RlXTtcbiAgfVxuXG4gIGdldCB0b3AoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhY2tbdGhpcy5zdGFjay5sZW5ndGggLSAxXTtcbiAgfVxuXG4gIGdldCByb290KCkgeyByZXR1cm4gdGhpcy5yb290Tm9kZTsgfVxuXG4gIC8qKiBAcGFyYW0ge05vZGV9IG5vZGUgKi9cbiAgYWRkKG5vZGUpIHtcbiAgICB0aGlzLnRvcC5jaGlsZHJlbi5wdXNoKG5vZGUpO1xuICB9XG5cbiAgLyoqIEBwYXJhbSB7c3RyaW5nfSBzY29wZSAqL1xuICBvcGVuTm9kZShzY29wZSkge1xuICAgIC8qKiBAdHlwZSBOb2RlICovXG4gICAgY29uc3Qgbm9kZSA9IG5ld05vZGUoeyBzY29wZSB9KTtcbiAgICB0aGlzLmFkZChub2RlKTtcbiAgICB0aGlzLnN0YWNrLnB1c2gobm9kZSk7XG4gIH1cblxuICBjbG9zZU5vZGUoKSB7XG4gICAgaWYgKHRoaXMuc3RhY2subGVuZ3RoID4gMSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhY2sucG9wKCk7XG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZmluZWRcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgY2xvc2VBbGxOb2RlcygpIHtcbiAgICB3aGlsZSAodGhpcy5jbG9zZU5vZGUoKSk7XG4gIH1cblxuICB0b0pTT04oKSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMucm9vdE5vZGUsIG51bGwsIDQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEB0eXBlZGVmIHsgaW1wb3J0KFwiLi9odG1sX3JlbmRlcmVyXCIpLlJlbmRlcmVyIH0gUmVuZGVyZXJcbiAgICogQHBhcmFtIHtSZW5kZXJlcn0gYnVpbGRlclxuICAgKi9cbiAgd2FsayhidWlsZGVyKSB7XG4gICAgLy8gdGhpcyBkb2VzIG5vdFxuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLl93YWxrKGJ1aWxkZXIsIHRoaXMucm9vdE5vZGUpO1xuICAgIC8vIHRoaXMgd29ya3NcbiAgICAvLyByZXR1cm4gVG9rZW5UcmVlLl93YWxrKGJ1aWxkZXIsIHRoaXMucm9vdE5vZGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7UmVuZGVyZXJ9IGJ1aWxkZXJcbiAgICogQHBhcmFtIHtOb2RlfSBub2RlXG4gICAqL1xuICBzdGF0aWMgX3dhbGsoYnVpbGRlciwgbm9kZSkge1xuICAgIGlmICh0eXBlb2Ygbm9kZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgYnVpbGRlci5hZGRUZXh0KG5vZGUpO1xuICAgIH0gZWxzZSBpZiAobm9kZS5jaGlsZHJlbikge1xuICAgICAgYnVpbGRlci5vcGVuTm9kZShub2RlKTtcbiAgICAgIG5vZGUuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHRoaXMuX3dhbGsoYnVpbGRlciwgY2hpbGQpKTtcbiAgICAgIGJ1aWxkZXIuY2xvc2VOb2RlKG5vZGUpO1xuICAgIH1cbiAgICByZXR1cm4gYnVpbGRlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAgICovXG4gIHN0YXRpYyBfY29sbGFwc2Uobm9kZSkge1xuICAgIGlmICh0eXBlb2Ygbm9kZSA9PT0gXCJzdHJpbmdcIikgcmV0dXJuO1xuICAgIGlmICghbm9kZS5jaGlsZHJlbikgcmV0dXJuO1xuXG4gICAgaWYgKG5vZGUuY2hpbGRyZW4uZXZlcnkoZWwgPT4gdHlwZW9mIGVsID09PSBcInN0cmluZ1wiKSkge1xuICAgICAgLy8gbm9kZS50ZXh0ID0gbm9kZS5jaGlsZHJlbi5qb2luKFwiXCIpO1xuICAgICAgLy8gZGVsZXRlIG5vZGUuY2hpbGRyZW47XG4gICAgICBub2RlLmNoaWxkcmVuID0gW25vZGUuY2hpbGRyZW4uam9pbihcIlwiKV07XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGUuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgVG9rZW5UcmVlLl9jb2xsYXBzZShjaGlsZCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gIEN1cnJlbnRseSB0aGlzIGlzIGFsbCBwcml2YXRlIEFQSSwgYnV0IHRoaXMgaXMgdGhlIG1pbmltYWwgQVBJIG5lY2Vzc2FyeVxuICB0aGF0IGFuIEVtaXR0ZXIgbXVzdCBpbXBsZW1lbnQgdG8gZnVsbHkgc3VwcG9ydCB0aGUgcGFyc2VyLlxuXG4gIE1pbmltYWwgaW50ZXJmYWNlOlxuXG4gIC0gYWRkVGV4dCh0ZXh0KVxuICAtIF9fYWRkU3VibGFuZ3VhZ2UoZW1pdHRlciwgc3ViTGFuZ3VhZ2VOYW1lKVxuICAtIHN0YXJ0U2NvcGUoc2NvcGUpXG4gIC0gZW5kU2NvcGUoKVxuICAtIGZpbmFsaXplKClcbiAgLSB0b0hUTUwoKVxuXG4qL1xuXG4vKipcbiAqIEBpbXBsZW1lbnRzIHtFbWl0dGVyfVxuICovXG5jbGFzcyBUb2tlblRyZWVFbWl0dGVyIGV4dGVuZHMgVG9rZW5UcmVlIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7Kn0gb3B0aW9uc1xuICAgKi9cbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICAgKi9cbiAgYWRkVGV4dCh0ZXh0KSB7XG4gICAgaWYgKHRleHQgPT09IFwiXCIpIHsgcmV0dXJuOyB9XG5cbiAgICB0aGlzLmFkZCh0ZXh0KTtcbiAgfVxuXG4gIC8qKiBAcGFyYW0ge3N0cmluZ30gc2NvcGUgKi9cbiAgc3RhcnRTY29wZShzY29wZSkge1xuICAgIHRoaXMub3Blbk5vZGUoc2NvcGUpO1xuICB9XG5cbiAgZW5kU2NvcGUoKSB7XG4gICAgdGhpcy5jbG9zZU5vZGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0VtaXR0ZXIgJiB7cm9vdDogRGF0YU5vZGV9fSBlbWl0dGVyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqL1xuICBfX2FkZFN1Ymxhbmd1YWdlKGVtaXR0ZXIsIG5hbWUpIHtcbiAgICAvKiogQHR5cGUgRGF0YU5vZGUgKi9cbiAgICBjb25zdCBub2RlID0gZW1pdHRlci5yb290O1xuICAgIGlmIChuYW1lKSBub2RlLnNjb3BlID0gYGxhbmd1YWdlOiR7bmFtZX1gO1xuXG4gICAgdGhpcy5hZGQobm9kZSk7XG4gIH1cblxuICB0b0hUTUwoKSB7XG4gICAgY29uc3QgcmVuZGVyZXIgPSBuZXcgSFRNTFJlbmRlcmVyKHRoaXMsIHRoaXMub3B0aW9ucyk7XG4gICAgcmV0dXJuIHJlbmRlcmVyLnZhbHVlKCk7XG4gIH1cblxuICBmaW5hbGl6ZSgpIHtcbiAgICB0aGlzLmNsb3NlQWxsTm9kZXMoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICogQHJldHVybnMge1JlZ0V4cH1cbiAqICovXG5cbi8qKlxuICogQHBhcmFtIHtSZWdFeHAgfCBzdHJpbmcgfSByZVxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gc291cmNlKHJlKSB7XG4gIGlmICghcmUpIHJldHVybiBudWxsO1xuICBpZiAodHlwZW9mIHJlID09PSBcInN0cmluZ1wiKSByZXR1cm4gcmU7XG5cbiAgcmV0dXJuIHJlLnNvdXJjZTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1JlZ0V4cCB8IHN0cmluZyB9IHJlXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBsb29rYWhlYWQocmUpIHtcbiAgcmV0dXJuIGNvbmNhdCgnKD89JywgcmUsICcpJyk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtSZWdFeHAgfCBzdHJpbmcgfSByZVxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gYW55TnVtYmVyT2ZUaW1lcyhyZSkge1xuICByZXR1cm4gY29uY2F0KCcoPzonLCByZSwgJykqJyk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtSZWdFeHAgfCBzdHJpbmcgfSByZVxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gb3B0aW9uYWwocmUpIHtcbiAgcmV0dXJuIGNvbmNhdCgnKD86JywgcmUsICcpPycpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7Li4uKFJlZ0V4cCB8IHN0cmluZykgfSBhcmdzXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBjb25jYXQoLi4uYXJncykge1xuICBjb25zdCBqb2luZWQgPSBhcmdzLm1hcCgoeCkgPT4gc291cmNlKHgpKS5qb2luKFwiXCIpO1xuICByZXR1cm4gam9pbmVkO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IEFycmF5PHN0cmluZyB8IFJlZ0V4cCB8IE9iamVjdD4gfSBhcmdzXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxuICovXG5mdW5jdGlvbiBzdHJpcE9wdGlvbnNGcm9tQXJncyhhcmdzKSB7XG4gIGNvbnN0IG9wdHMgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XG5cbiAgaWYgKHR5cGVvZiBvcHRzID09PSAnb2JqZWN0JyAmJiBvcHRzLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICBhcmdzLnNwbGljZShhcmdzLmxlbmd0aCAtIDEsIDEpO1xuICAgIHJldHVybiBvcHRzO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB7fTtcbiAgfVxufVxuXG4vKiogQHR5cGVkZWYgeyB7Y2FwdHVyZT86IGJvb2xlYW59IH0gUmVnZXhFaXRoZXJPcHRpb25zICovXG5cbi8qKlxuICogQW55IG9mIHRoZSBwYXNzZWQgZXhwcmVzc3Npb25zIG1heSBtYXRjaFxuICpcbiAqIENyZWF0ZXMgYSBodWdlIHRoaXMgfCB0aGlzIHwgdGhhdCB8IHRoYXQgbWF0Y2hcbiAqIEBwYXJhbSB7KFJlZ0V4cCB8IHN0cmluZylbXSB8IFsuLi4oUmVnRXhwIHwgc3RyaW5nKVtdLCBSZWdleEVpdGhlck9wdGlvbnNdfSBhcmdzXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBlaXRoZXIoLi4uYXJncykge1xuICAvKiogQHR5cGUgeyBvYmplY3QgJiB7Y2FwdHVyZT86IGJvb2xlYW59IH0gICovXG4gIGNvbnN0IG9wdHMgPSBzdHJpcE9wdGlvbnNGcm9tQXJncyhhcmdzKTtcbiAgY29uc3Qgam9pbmVkID0gJygnXG4gICAgKyAob3B0cy5jYXB0dXJlID8gXCJcIiA6IFwiPzpcIilcbiAgICArIGFyZ3MubWFwKCh4KSA9PiBzb3VyY2UoeCkpLmpvaW4oXCJ8XCIpICsgXCIpXCI7XG4gIHJldHVybiBqb2luZWQ7XG59XG5cbi8qKlxuICogQHBhcmFtIHtSZWdFeHAgfCBzdHJpbmd9IHJlXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiBjb3VudE1hdGNoR3JvdXBzKHJlKSB7XG4gIHJldHVybiAobmV3IFJlZ0V4cChyZS50b1N0cmluZygpICsgJ3wnKSkuZXhlYygnJykubGVuZ3RoIC0gMTtcbn1cblxuLyoqXG4gKiBEb2VzIGxleGVtZSBzdGFydCB3aXRoIGEgcmVndWxhciBleHByZXNzaW9uIG1hdGNoIGF0IHRoZSBiZWdpbm5pbmdcbiAqIEBwYXJhbSB7UmVnRXhwfSByZVxuICogQHBhcmFtIHtzdHJpbmd9IGxleGVtZVxuICovXG5mdW5jdGlvbiBzdGFydHNXaXRoKHJlLCBsZXhlbWUpIHtcbiAgY29uc3QgbWF0Y2ggPSByZSAmJiByZS5leGVjKGxleGVtZSk7XG4gIHJldHVybiBtYXRjaCAmJiBtYXRjaC5pbmRleCA9PT0gMDtcbn1cblxuLy8gQkFDS1JFRl9SRSBtYXRjaGVzIGFuIG9wZW4gcGFyZW50aGVzaXMgb3IgYmFja3JlZmVyZW5jZS4gVG8gYXZvaWRcbi8vIGFuIGluY29ycmVjdCBwYXJzZSwgaXQgYWRkaXRpb25hbGx5IG1hdGNoZXMgdGhlIGZvbGxvd2luZzpcbi8vIC0gWy4uLl0gZWxlbWVudHMsIHdoZXJlIHRoZSBtZWFuaW5nIG9mIHBhcmVudGhlc2VzIGFuZCBlc2NhcGVzIGNoYW5nZVxuLy8gLSBvdGhlciBlc2NhcGUgc2VxdWVuY2VzLCBzbyB3ZSBkbyBub3QgbWlzcGFyc2UgZXNjYXBlIHNlcXVlbmNlcyBhc1xuLy8gICBpbnRlcmVzdGluZyBlbGVtZW50c1xuLy8gLSBub24tbWF0Y2hpbmcgb3IgbG9va2FoZWFkIHBhcmVudGhlc2VzLCB3aGljaCBkbyBub3QgY2FwdHVyZS4gVGhlc2Vcbi8vICAgZm9sbG93IHRoZSAnKCcgd2l0aCBhICc/Jy5cbmNvbnN0IEJBQ0tSRUZfUkUgPSAvXFxbKD86W15cXFxcXFxdXXxcXFxcLikqXFxdfFxcKFxcPz98XFxcXChbMS05XVswLTldKil8XFxcXC4vO1xuXG4vLyAqKklOVEVSTkFMKiogTm90IGludGVuZGVkIGZvciBvdXRzaWRlIHVzYWdlXG4vLyBqb2luIGxvZ2ljYWxseSBjb21wdXRlcyByZWdleHBzLmpvaW4oc2VwYXJhdG9yKSwgYnV0IGZpeGVzIHRoZVxuLy8gYmFja3JlZmVyZW5jZXMgc28gdGhleSBjb250aW51ZSB0byBtYXRjaC5cbi8vIGl0IGFsc28gcGxhY2VzIGVhY2ggaW5kaXZpZHVhbCByZWd1bGFyIGV4cHJlc3Npb24gaW50byBpdCdzIG93blxuLy8gbWF0Y2ggZ3JvdXAsIGtlZXBpbmcgdHJhY2sgb2YgdGhlIHNlcXVlbmNpbmcgb2YgdGhvc2UgbWF0Y2ggZ3JvdXBzXG4vLyBpcyBjdXJyZW50bHkgYW4gZXhlcmNpc2UgZm9yIHRoZSBjYWxsZXIuIDotKVxuLyoqXG4gKiBAcGFyYW0geyhzdHJpbmcgfCBSZWdFeHApW119IHJlZ2V4cHNcbiAqIEBwYXJhbSB7e2pvaW5XaXRoOiBzdHJpbmd9fSBvcHRzXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBfcmV3cml0ZUJhY2tyZWZlcmVuY2VzKHJlZ2V4cHMsIHsgam9pbldpdGggfSkge1xuICBsZXQgbnVtQ2FwdHVyZXMgPSAwO1xuXG4gIHJldHVybiByZWdleHBzLm1hcCgocmVnZXgpID0+IHtcbiAgICBudW1DYXB0dXJlcyArPSAxO1xuICAgIGNvbnN0IG9mZnNldCA9IG51bUNhcHR1cmVzO1xuICAgIGxldCByZSA9IHNvdXJjZShyZWdleCk7XG4gICAgbGV0IG91dCA9ICcnO1xuXG4gICAgd2hpbGUgKHJlLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IG1hdGNoID0gQkFDS1JFRl9SRS5leGVjKHJlKTtcbiAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgb3V0ICs9IHJlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIG91dCArPSByZS5zdWJzdHJpbmcoMCwgbWF0Y2guaW5kZXgpO1xuICAgICAgcmUgPSByZS5zdWJzdHJpbmcobWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGgpO1xuICAgICAgaWYgKG1hdGNoWzBdWzBdID09PSAnXFxcXCcgJiYgbWF0Y2hbMV0pIHtcbiAgICAgICAgLy8gQWRqdXN0IHRoZSBiYWNrcmVmZXJlbmNlLlxuICAgICAgICBvdXQgKz0gJ1xcXFwnICsgU3RyaW5nKE51bWJlcihtYXRjaFsxXSkgKyBvZmZzZXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3V0ICs9IG1hdGNoWzBdO1xuICAgICAgICBpZiAobWF0Y2hbMF0gPT09ICcoJykge1xuICAgICAgICAgIG51bUNhcHR1cmVzKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbiAgfSkubWFwKHJlID0+IGAoJHtyZX0pYCkuam9pbihqb2luV2l0aCk7XG59XG5cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCdoaWdobGlnaHQuanMnKS5Nb2RlfSBNb2RlICovXG4vKiogQHR5cGVkZWYge2ltcG9ydCgnaGlnaGxpZ2h0LmpzJykuTW9kZUNhbGxiYWNrfSBNb2RlQ2FsbGJhY2sgKi9cblxuLy8gQ29tbW9uIHJlZ2V4cHNcbmNvbnN0IE1BVENIX05PVEhJTkdfUkUgPSAvXFxiXFxCLztcbmNvbnN0IElERU5UX1JFID0gJ1thLXpBLVpdXFxcXHcqJztcbmNvbnN0IFVOREVSU0NPUkVfSURFTlRfUkUgPSAnW2EtekEtWl9dXFxcXHcqJztcbmNvbnN0IE5VTUJFUl9SRSA9ICdcXFxcYlxcXFxkKyhcXFxcLlxcXFxkKyk/JztcbmNvbnN0IENfTlVNQkVSX1JFID0gJygtPykoXFxcXGIwW3hYXVthLWZBLUYwLTldK3woXFxcXGJcXFxcZCsoXFxcXC5cXFxcZCopP3xcXFxcLlxcXFxkKykoW2VFXVstK10/XFxcXGQrKT8pJzsgLy8gMHguLi4sIDAuLi4sIGRlY2ltYWwsIGZsb2F0XG5jb25zdCBCSU5BUllfTlVNQkVSX1JFID0gJ1xcXFxiKDBiWzAxXSspJzsgLy8gMGIuLi5cbmNvbnN0IFJFX1NUQVJURVJTX1JFID0gJyF8IT18IT09fCV8JT18JnwmJnwmPXxcXFxcKnxcXFxcKj18XFxcXCt8XFxcXCs9fCx8LXwtPXwvPXwvfDp8O3w8PHw8PD18PD18PHw9PT18PT18PXw+Pj49fD4+PXw+PXw+Pj58Pj58PnxcXFxcP3xcXFxcW3xcXFxce3xcXFxcKHxcXFxcXnxcXFxcXj18XFxcXHx8XFxcXHw9fFxcXFx8XFxcXHx8fic7XG5cbi8qKlxuKiBAcGFyYW0geyBQYXJ0aWFsPE1vZGU+ICYge2JpbmFyeT86IHN0cmluZyB8IFJlZ0V4cH0gfSBvcHRzXG4qL1xuY29uc3QgU0hFQkFORyA9IChvcHRzID0ge30pID0+IHtcbiAgY29uc3QgYmVnaW5TaGViYW5nID0gL14jIVsgXSpcXC8vO1xuICBpZiAob3B0cy5iaW5hcnkpIHtcbiAgICBvcHRzLmJlZ2luID0gY29uY2F0KFxuICAgICAgYmVnaW5TaGViYW5nLFxuICAgICAgLy4qXFxiLyxcbiAgICAgIG9wdHMuYmluYXJ5LFxuICAgICAgL1xcYi4qLyk7XG4gIH1cbiAgcmV0dXJuIGluaGVyaXQkMSh7XG4gICAgc2NvcGU6ICdtZXRhJyxcbiAgICBiZWdpbjogYmVnaW5TaGViYW5nLFxuICAgIGVuZDogLyQvLFxuICAgIHJlbGV2YW5jZTogMCxcbiAgICAvKiogQHR5cGUge01vZGVDYWxsYmFja30gKi9cbiAgICBcIm9uOmJlZ2luXCI6IChtLCByZXNwKSA9PiB7XG4gICAgICBpZiAobS5pbmRleCAhPT0gMCkgcmVzcC5pZ25vcmVNYXRjaCgpO1xuICAgIH1cbiAgfSwgb3B0cyk7XG59O1xuXG4vLyBDb21tb24gbW9kZXNcbmNvbnN0IEJBQ0tTTEFTSF9FU0NBUEUgPSB7XG4gIGJlZ2luOiAnXFxcXFxcXFxbXFxcXHNcXFxcU10nLCByZWxldmFuY2U6IDBcbn07XG5jb25zdCBBUE9TX1NUUklOR19NT0RFID0ge1xuICBzY29wZTogJ3N0cmluZycsXG4gIGJlZ2luOiAnXFwnJyxcbiAgZW5kOiAnXFwnJyxcbiAgaWxsZWdhbDogJ1xcXFxuJyxcbiAgY29udGFpbnM6IFtCQUNLU0xBU0hfRVNDQVBFXVxufTtcbmNvbnN0IFFVT1RFX1NUUklOR19NT0RFID0ge1xuICBzY29wZTogJ3N0cmluZycsXG4gIGJlZ2luOiAnXCInLFxuICBlbmQ6ICdcIicsXG4gIGlsbGVnYWw6ICdcXFxcbicsXG4gIGNvbnRhaW5zOiBbQkFDS1NMQVNIX0VTQ0FQRV1cbn07XG5jb25zdCBQSFJBU0FMX1dPUkRTX01PREUgPSB7XG4gIGJlZ2luOiAvXFxiKGF8YW58dGhlfGFyZXxJJ218aXNuJ3R8ZG9uJ3R8ZG9lc24ndHx3b24ndHxidXR8anVzdHxzaG91bGR8cHJldHR5fHNpbXBseXxlbm91Z2h8Z29ubmF8Z29pbmd8d3RmfHNvfHN1Y2h8d2lsbHx5b3V8eW91cnx0aGV5fGxpa2V8bW9yZSlcXGIvXG59O1xuLyoqXG4gKiBDcmVhdGVzIGEgY29tbWVudCBtb2RlXG4gKlxuICogQHBhcmFtIHtzdHJpbmcgfCBSZWdFeHB9IGJlZ2luXG4gKiBAcGFyYW0ge3N0cmluZyB8IFJlZ0V4cH0gZW5kXG4gKiBAcGFyYW0ge01vZGUgfCB7fX0gW21vZGVPcHRpb25zXVxuICogQHJldHVybnMge1BhcnRpYWw8TW9kZT59XG4gKi9cbmNvbnN0IENPTU1FTlQgPSBmdW5jdGlvbihiZWdpbiwgZW5kLCBtb2RlT3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IG1vZGUgPSBpbmhlcml0JDEoXG4gICAge1xuICAgICAgc2NvcGU6ICdjb21tZW50JyxcbiAgICAgIGJlZ2luLFxuICAgICAgZW5kLFxuICAgICAgY29udGFpbnM6IFtdXG4gICAgfSxcbiAgICBtb2RlT3B0aW9uc1xuICApO1xuICBtb2RlLmNvbnRhaW5zLnB1c2goe1xuICAgIHNjb3BlOiAnZG9jdGFnJyxcbiAgICAvLyBoYWNrIHRvIGF2b2lkIHRoZSBzcGFjZSBmcm9tIGJlaW5nIGluY2x1ZGVkLiB0aGUgc3BhY2UgaXMgbmVjZXNzYXJ5IHRvXG4gICAgLy8gbWF0Y2ggaGVyZSB0byBwcmV2ZW50IHRoZSBwbGFpbiB0ZXh0IHJ1bGUgYmVsb3cgZnJvbSBnb2JibGluZyB1cCBkb2N0YWdzXG4gICAgYmVnaW46ICdbIF0qKD89KFRPRE98RklYTUV8Tk9URXxCVUd8T1BUSU1JWkV8SEFDS3xYWFgpOiknLFxuICAgIGVuZDogLyhUT0RPfEZJWE1FfE5PVEV8QlVHfE9QVElNSVpFfEhBQ0t8WFhYKTovLFxuICAgIGV4Y2x1ZGVCZWdpbjogdHJ1ZSxcbiAgICByZWxldmFuY2U6IDBcbiAgfSk7XG4gIGNvbnN0IEVOR0xJU0hfV09SRCA9IGVpdGhlcihcbiAgICAvLyBsaXN0IG9mIGNvbW1vbiAxIGFuZCAyIGxldHRlciB3b3JkcyBpbiBFbmdsaXNoXG4gICAgXCJJXCIsXG4gICAgXCJhXCIsXG4gICAgXCJpc1wiLFxuICAgIFwic29cIixcbiAgICBcInVzXCIsXG4gICAgXCJ0b1wiLFxuICAgIFwiYXRcIixcbiAgICBcImlmXCIsXG4gICAgXCJpblwiLFxuICAgIFwiaXRcIixcbiAgICBcIm9uXCIsXG4gICAgLy8gbm90ZTogdGhpcyBpcyBub3QgYW4gZXhoYXVzdGl2ZSBsaXN0IG9mIGNvbnRyYWN0aW9ucywganVzdCBwb3B1bGFyIG9uZXNcbiAgICAvW0EtWmEtel0rWyddKGR8dmV8cmV8bGx8dHxzfG4pLywgLy8gY29udHJhY3Rpb25zIC0gY2FuJ3Qgd2UnZCB0aGV5J3JlIGxldCdzLCBldGNcbiAgICAvW0EtWmEtel0rWy1dW2Etel0rLywgLy8gYG5vLXdheWAsIGV0Yy5cbiAgICAvW0EtWmEtel1bYS16XXsyLH0vIC8vIGFsbG93IGNhcGl0YWxpemVkIHdvcmRzIGF0IGJlZ2lubmluZyBvZiBzZW50ZW5jZXNcbiAgKTtcbiAgLy8gbG9va2luZyBsaWtlIHBsYWluIHRleHQsIG1vcmUgbGlrZWx5IHRvIGJlIGEgY29tbWVudFxuICBtb2RlLmNvbnRhaW5zLnB1c2goXG4gICAge1xuICAgICAgLy8gVE9ETzogaG93IHRvIGluY2x1ZGUgXCIsICgsICkgd2l0aG91dCBicmVha2luZyBncmFtbWFycyB0aGF0IHVzZSB0aGVzZSBmb3JcbiAgICAgIC8vIGNvbW1lbnQgZGVsaW1pdGVycz9cbiAgICAgIC8vIGJlZ2luOiAvWyBdKyhbKClcIl0/KFtBLVphLXonLV17Myx9fGlzfGF8SXxzb3x1c3xbdFRdW29PXXxhdHxpZnxpbnxpdHxvbilbLl0/WygpXCI6XT8oWy5dWyBdfFsgXXxcXCkpKXszfS9cbiAgICAgIC8vIC0tLVxuXG4gICAgICAvLyB0aGlzIHRyaWVzIHRvIGZpbmQgc2VxdWVuY2VzIG9mIDMgZW5nbGlzaCB3b3JkcyBpbiBhIHJvdyAod2l0aG91dCBhbnlcbiAgICAgIC8vIFwicHJvZ3JhbW1pbmdcIiB0eXBlIHN5bnRheCkgdGhpcyBnaXZlcyB1cyBhIHN0cm9uZyBzaWduYWwgdGhhdCB3ZSd2ZVxuICAgICAgLy8gVFJVTFkgZm91bmQgYSBjb21tZW50IC0gdnMgcGVyaGFwcyBzY2FubmluZyB3aXRoIHRoZSB3cm9uZyBsYW5ndWFnZS5cbiAgICAgIC8vIEl0J3MgcG9zc2libGUgdG8gZmluZCBzb21ldGhpbmcgdGhhdCBMT09LUyBsaWtlIHRoZSBzdGFydCBvZiB0aGVcbiAgICAgIC8vIGNvbW1lbnQgLSBidXQgdGhlbiBpZiB0aGVyZSBpcyBubyByZWFkYWJsZSB0ZXh0IC0gZ29vZCBjaGFuY2UgaXQgaXMgYVxuICAgICAgLy8gZmFsc2UgbWF0Y2ggYW5kIG5vdCBhIGNvbW1lbnQuXG4gICAgICAvL1xuICAgICAgLy8gZm9yIGEgdmlzdWFsIGV4YW1wbGUgcGxlYXNlIHNlZTpcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9oaWdobGlnaHRqcy9oaWdobGlnaHQuanMvaXNzdWVzLzI4MjdcblxuICAgICAgYmVnaW46IGNvbmNhdChcbiAgICAgICAgL1sgXSsvLCAvLyBuZWNlc3NhcnkgdG8gcHJldmVudCB1cyBnb2JibGluZyB1cCBkb2N0YWdzIGxpa2UgLyogQGF1dGhvciBCb2IgTWNnaWxsICovXG4gICAgICAgICcoJyxcbiAgICAgICAgRU5HTElTSF9XT1JELFxuICAgICAgICAvWy5dP1s6XT8oWy5dWyBdfFsgXSkvLFxuICAgICAgICAnKXszfScpIC8vIGxvb2sgZm9yIDMgd29yZHMgaW4gYSByb3dcbiAgICB9XG4gICk7XG4gIHJldHVybiBtb2RlO1xufTtcbmNvbnN0IENfTElORV9DT01NRU5UX01PREUgPSBDT01NRU5UKCcvLycsICckJyk7XG5jb25zdCBDX0JMT0NLX0NPTU1FTlRfTU9ERSA9IENPTU1FTlQoJy9cXFxcKicsICdcXFxcKi8nKTtcbmNvbnN0IEhBU0hfQ09NTUVOVF9NT0RFID0gQ09NTUVOVCgnIycsICckJyk7XG5jb25zdCBOVU1CRVJfTU9ERSA9IHtcbiAgc2NvcGU6ICdudW1iZXInLFxuICBiZWdpbjogTlVNQkVSX1JFLFxuICByZWxldmFuY2U6IDBcbn07XG5jb25zdCBDX05VTUJFUl9NT0RFID0ge1xuICBzY29wZTogJ251bWJlcicsXG4gIGJlZ2luOiBDX05VTUJFUl9SRSxcbiAgcmVsZXZhbmNlOiAwXG59O1xuY29uc3QgQklOQVJZX05VTUJFUl9NT0RFID0ge1xuICBzY29wZTogJ251bWJlcicsXG4gIGJlZ2luOiBCSU5BUllfTlVNQkVSX1JFLFxuICByZWxldmFuY2U6IDBcbn07XG5jb25zdCBSRUdFWFBfTU9ERSA9IHtcbiAgc2NvcGU6IFwicmVnZXhwXCIsXG4gIGJlZ2luOiAvXFwvKD89W14vXFxuXSpcXC8pLyxcbiAgZW5kOiAvXFwvW2dpbXV5XSovLFxuICBjb250YWluczogW1xuICAgIEJBQ0tTTEFTSF9FU0NBUEUsXG4gICAge1xuICAgICAgYmVnaW46IC9cXFsvLFxuICAgICAgZW5kOiAvXFxdLyxcbiAgICAgIHJlbGV2YW5jZTogMCxcbiAgICAgIGNvbnRhaW5zOiBbQkFDS1NMQVNIX0VTQ0FQRV1cbiAgICB9XG4gIF1cbn07XG5jb25zdCBUSVRMRV9NT0RFID0ge1xuICBzY29wZTogJ3RpdGxlJyxcbiAgYmVnaW46IElERU5UX1JFLFxuICByZWxldmFuY2U6IDBcbn07XG5jb25zdCBVTkRFUlNDT1JFX1RJVExFX01PREUgPSB7XG4gIHNjb3BlOiAndGl0bGUnLFxuICBiZWdpbjogVU5ERVJTQ09SRV9JREVOVF9SRSxcbiAgcmVsZXZhbmNlOiAwXG59O1xuY29uc3QgTUVUSE9EX0dVQVJEID0ge1xuICAvLyBleGNsdWRlcyBtZXRob2QgbmFtZXMgZnJvbSBrZXl3b3JkIHByb2Nlc3NpbmdcbiAgYmVnaW46ICdcXFxcLlxcXFxzKicgKyBVTkRFUlNDT1JFX0lERU5UX1JFLFxuICByZWxldmFuY2U6IDBcbn07XG5cbi8qKlxuICogQWRkcyBlbmQgc2FtZSBhcyBiZWdpbiBtZWNoYW5pY3MgdG8gYSBtb2RlXG4gKlxuICogWW91ciBtb2RlIG11c3QgaW5jbHVkZSBhdCBsZWFzdCBhIHNpbmdsZSAoKSBtYXRjaCBncm91cCBhcyB0aGF0IGZpcnN0IG1hdGNoXG4gKiBncm91cCBpcyB3aGF0IGlzIHVzZWQgZm9yIGNvbXBhcmlzb25cbiAqIEBwYXJhbSB7UGFydGlhbDxNb2RlPn0gbW9kZVxuICovXG5jb25zdCBFTkRfU0FNRV9BU19CRUdJTiA9IGZ1bmN0aW9uKG1vZGUpIHtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24obW9kZSxcbiAgICB7XG4gICAgICAvKiogQHR5cGUge01vZGVDYWxsYmFja30gKi9cbiAgICAgICdvbjpiZWdpbic6IChtLCByZXNwKSA9PiB7IHJlc3AuZGF0YS5fYmVnaW5NYXRjaCA9IG1bMV07IH0sXG4gICAgICAvKiogQHR5cGUge01vZGVDYWxsYmFja30gKi9cbiAgICAgICdvbjplbmQnOiAobSwgcmVzcCkgPT4geyBpZiAocmVzcC5kYXRhLl9iZWdpbk1hdGNoICE9PSBtWzFdKSByZXNwLmlnbm9yZU1hdGNoKCk7IH1cbiAgICB9KTtcbn07XG5cbnZhciBNT0RFUyA9IC8qI19fUFVSRV9fKi9PYmplY3QuZnJlZXplKHtcbiAgX19wcm90b19fOiBudWxsLFxuICBBUE9TX1NUUklOR19NT0RFOiBBUE9TX1NUUklOR19NT0RFLFxuICBCQUNLU0xBU0hfRVNDQVBFOiBCQUNLU0xBU0hfRVNDQVBFLFxuICBCSU5BUllfTlVNQkVSX01PREU6IEJJTkFSWV9OVU1CRVJfTU9ERSxcbiAgQklOQVJZX05VTUJFUl9SRTogQklOQVJZX05VTUJFUl9SRSxcbiAgQ09NTUVOVDogQ09NTUVOVCxcbiAgQ19CTE9DS19DT01NRU5UX01PREU6IENfQkxPQ0tfQ09NTUVOVF9NT0RFLFxuICBDX0xJTkVfQ09NTUVOVF9NT0RFOiBDX0xJTkVfQ09NTUVOVF9NT0RFLFxuICBDX05VTUJFUl9NT0RFOiBDX05VTUJFUl9NT0RFLFxuICBDX05VTUJFUl9SRTogQ19OVU1CRVJfUkUsXG4gIEVORF9TQU1FX0FTX0JFR0lOOiBFTkRfU0FNRV9BU19CRUdJTixcbiAgSEFTSF9DT01NRU5UX01PREU6IEhBU0hfQ09NTUVOVF9NT0RFLFxuICBJREVOVF9SRTogSURFTlRfUkUsXG4gIE1BVENIX05PVEhJTkdfUkU6IE1BVENIX05PVEhJTkdfUkUsXG4gIE1FVEhPRF9HVUFSRDogTUVUSE9EX0dVQVJELFxuICBOVU1CRVJfTU9ERTogTlVNQkVSX01PREUsXG4gIE5VTUJFUl9SRTogTlVNQkVSX1JFLFxuICBQSFJBU0FMX1dPUkRTX01PREU6IFBIUkFTQUxfV09SRFNfTU9ERSxcbiAgUVVPVEVfU1RSSU5HX01PREU6IFFVT1RFX1NUUklOR19NT0RFLFxuICBSRUdFWFBfTU9ERTogUkVHRVhQX01PREUsXG4gIFJFX1NUQVJURVJTX1JFOiBSRV9TVEFSVEVSU19SRSxcbiAgU0hFQkFORzogU0hFQkFORyxcbiAgVElUTEVfTU9ERTogVElUTEVfTU9ERSxcbiAgVU5ERVJTQ09SRV9JREVOVF9SRTogVU5ERVJTQ09SRV9JREVOVF9SRSxcbiAgVU5ERVJTQ09SRV9USVRMRV9NT0RFOiBVTkRFUlNDT1JFX1RJVExFX01PREVcbn0pO1xuXG4vKipcbkB0eXBlZGVmIHtpbXBvcnQoJ2hpZ2hsaWdodC5qcycpLkNhbGxiYWNrUmVzcG9uc2V9IENhbGxiYWNrUmVzcG9uc2VcbkB0eXBlZGVmIHtpbXBvcnQoJ2hpZ2hsaWdodC5qcycpLkNvbXBpbGVyRXh0fSBDb21waWxlckV4dFxuKi9cblxuLy8gR3JhbW1hciBleHRlbnNpb25zIC8gcGx1Z2luc1xuLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vaGlnaGxpZ2h0anMvaGlnaGxpZ2h0LmpzL2lzc3Vlcy8yODMzXG5cbi8vIEdyYW1tYXIgZXh0ZW5zaW9ucyBhbGxvdyBcInN5bnRhY3RpYyBzdWdhclwiIHRvIGJlIGFkZGVkIHRvIHRoZSBncmFtbWFyIG1vZGVzXG4vLyB3aXRob3V0IHJlcXVpcmluZyBhbnkgdW5kZXJseWluZyBjaGFuZ2VzIHRvIHRoZSBjb21waWxlciBpbnRlcm5hbHMuXG5cbi8vIGBjb21waWxlTWF0Y2hgIGJlaW5nIHRoZSBwZXJmZWN0IHNtYWxsIGV4YW1wbGUgb2Ygbm93IGFsbG93aW5nIGEgZ3JhbW1hclxuLy8gYXV0aG9yIHRvIHdyaXRlIGBtYXRjaGAgd2hlbiB0aGV5IGRlc2lyZSB0byBtYXRjaCBhIHNpbmdsZSBleHByZXNzaW9uIHJhdGhlclxuLy8gdGhhbiBiZWluZyBmb3JjZWQgdG8gdXNlIGBiZWdpbmAuICBUaGUgZXh0ZW5zaW9uIHRoZW4ganVzdCBtb3ZlcyBgbWF0Y2hgIGludG9cbi8vIGBiZWdpbmAgd2hlbiBpdCBydW5zLiAgSWUsIG5vIGZlYXR1cmVzIGhhdmUgYmVlbiBhZGRlZCwgYnV0IHdlJ3ZlIGp1c3QgbWFkZVxuLy8gdGhlIGV4cGVyaWVuY2Ugb2Ygd3JpdGluZyAoYW5kIHJlYWRpbmcgZ3JhbW1hcnMpIGEgbGl0dGxlIGJpdCBuaWNlci5cblxuLy8gLS0tLS0tXG5cbi8vIFRPRE86IFdlIG5lZWQgbmVnYXRpdmUgbG9vay1iZWhpbmQgc3VwcG9ydCB0byBkbyB0aGlzIHByb3Blcmx5XG4vKipcbiAqIFNraXAgYSBtYXRjaCBpZiBpdCBoYXMgYSBwcmVjZWRpbmcgZG90XG4gKlxuICogVGhpcyBpcyB1c2VkIGZvciBgYmVnaW5LZXl3b3Jkc2AgdG8gcHJldmVudCBtYXRjaGluZyBleHByZXNzaW9ucyBzdWNoIGFzXG4gKiBgYm9iLmtleXdvcmQuZG8oKWAuIFRoZSBtb2RlIGNvbXBpbGVyIGF1dG9tYXRpY2FsbHkgd2lyZXMgdGhpcyB1cCBhcyBhXG4gKiBzcGVjaWFsIF9pbnRlcm5hbF8gJ29uOmJlZ2luJyBjYWxsYmFjayBmb3IgbW9kZXMgd2l0aCBgYmVnaW5LZXl3b3Jkc2BcbiAqIEBwYXJhbSB7UmVnRXhwTWF0Y2hBcnJheX0gbWF0Y2hcbiAqIEBwYXJhbSB7Q2FsbGJhY2tSZXNwb25zZX0gcmVzcG9uc2VcbiAqL1xuZnVuY3Rpb24gc2tpcElmSGFzUHJlY2VkaW5nRG90KG1hdGNoLCByZXNwb25zZSkge1xuICBjb25zdCBiZWZvcmUgPSBtYXRjaC5pbnB1dFttYXRjaC5pbmRleCAtIDFdO1xuICBpZiAoYmVmb3JlID09PSBcIi5cIikge1xuICAgIHJlc3BvbnNlLmlnbm9yZU1hdGNoKCk7XG4gIH1cbn1cblxuLyoqXG4gKlxuICogQHR5cGUge0NvbXBpbGVyRXh0fVxuICovXG5mdW5jdGlvbiBzY29wZUNsYXNzTmFtZShtb2RlLCBfcGFyZW50KSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZmluZWRcbiAgaWYgKG1vZGUuY2xhc3NOYW1lICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2RlLnNjb3BlID0gbW9kZS5jbGFzc05hbWU7XG4gICAgZGVsZXRlIG1vZGUuY2xhc3NOYW1lO1xuICB9XG59XG5cbi8qKlxuICogYGJlZ2luS2V5d29yZHNgIHN5bnRhY3RpYyBzdWdhclxuICogQHR5cGUge0NvbXBpbGVyRXh0fVxuICovXG5mdW5jdGlvbiBiZWdpbktleXdvcmRzKG1vZGUsIHBhcmVudCkge1xuICBpZiAoIXBhcmVudCkgcmV0dXJuO1xuICBpZiAoIW1vZGUuYmVnaW5LZXl3b3JkcykgcmV0dXJuO1xuXG4gIC8vIGZvciBsYW5ndWFnZXMgd2l0aCBrZXl3b3JkcyB0aGF0IGluY2x1ZGUgbm9uLXdvcmQgY2hhcmFjdGVycyBjaGVja2luZyBmb3JcbiAgLy8gYSB3b3JkIGJvdW5kYXJ5IGlzIG5vdCBzdWZmaWNpZW50LCBzbyBpbnN0ZWFkIHdlIGNoZWNrIGZvciBhIHdvcmQgYm91bmRhcnlcbiAgLy8gb3Igd2hpdGVzcGFjZSAtIHRoaXMgZG9lcyBubyBoYXJtIGluIGFueSBjYXNlIHNpbmNlIG91ciBrZXl3b3JkIGVuZ2luZVxuICAvLyBkb2Vzbid0IGFsbG93IHNwYWNlcyBpbiBrZXl3b3JkcyBhbnl3YXlzIGFuZCB3ZSBzdGlsbCBjaGVjayBmb3IgdGhlIGJvdW5kYXJ5XG4gIC8vIGZpcnN0XG4gIG1vZGUuYmVnaW4gPSAnXFxcXGIoJyArIG1vZGUuYmVnaW5LZXl3b3Jkcy5zcGxpdCgnICcpLmpvaW4oJ3wnKSArICcpKD8hXFxcXC4pKD89XFxcXGJ8XFxcXHMpJztcbiAgbW9kZS5fX2JlZm9yZUJlZ2luID0gc2tpcElmSGFzUHJlY2VkaW5nRG90O1xuICBtb2RlLmtleXdvcmRzID0gbW9kZS5rZXl3b3JkcyB8fCBtb2RlLmJlZ2luS2V5d29yZHM7XG4gIGRlbGV0ZSBtb2RlLmJlZ2luS2V5d29yZHM7XG5cbiAgLy8gcHJldmVudHMgZG91YmxlIHJlbGV2YW5jZSwgdGhlIGtleXdvcmRzIHRoZW1zZWx2ZXMgcHJvdmlkZVxuICAvLyByZWxldmFuY2UsIHRoZSBtb2RlIGRvZXNuJ3QgbmVlZCB0byBkb3VibGUgaXRcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmaW5lZFxuICBpZiAobW9kZS5yZWxldmFuY2UgPT09IHVuZGVmaW5lZCkgbW9kZS5yZWxldmFuY2UgPSAwO1xufVxuXG4vKipcbiAqIEFsbG93IGBpbGxlZ2FsYCB0byBjb250YWluIGFuIGFycmF5IG9mIGlsbGVnYWwgdmFsdWVzXG4gKiBAdHlwZSB7Q29tcGlsZXJFeHR9XG4gKi9cbmZ1bmN0aW9uIGNvbXBpbGVJbGxlZ2FsKG1vZGUsIF9wYXJlbnQpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KG1vZGUuaWxsZWdhbCkpIHJldHVybjtcblxuICBtb2RlLmlsbGVnYWwgPSBlaXRoZXIoLi4ubW9kZS5pbGxlZ2FsKTtcbn1cblxuLyoqXG4gKiBgbWF0Y2hgIHRvIG1hdGNoIGEgc2luZ2xlIGV4cHJlc3Npb24gZm9yIHJlYWRhYmlsaXR5XG4gKiBAdHlwZSB7Q29tcGlsZXJFeHR9XG4gKi9cbmZ1bmN0aW9uIGNvbXBpbGVNYXRjaChtb2RlLCBfcGFyZW50KSB7XG4gIGlmICghbW9kZS5tYXRjaCkgcmV0dXJuO1xuICBpZiAobW9kZS5iZWdpbiB8fCBtb2RlLmVuZCkgdGhyb3cgbmV3IEVycm9yKFwiYmVnaW4gJiBlbmQgYXJlIG5vdCBzdXBwb3J0ZWQgd2l0aCBtYXRjaFwiKTtcblxuICBtb2RlLmJlZ2luID0gbW9kZS5tYXRjaDtcbiAgZGVsZXRlIG1vZGUubWF0Y2g7XG59XG5cbi8qKlxuICogcHJvdmlkZXMgdGhlIGRlZmF1bHQgMSByZWxldmFuY2UgdG8gYWxsIG1vZGVzXG4gKiBAdHlwZSB7Q29tcGlsZXJFeHR9XG4gKi9cbmZ1bmN0aW9uIGNvbXBpbGVSZWxldmFuY2UobW9kZSwgX3BhcmVudCkge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZpbmVkXG4gIGlmIChtb2RlLnJlbGV2YW5jZSA9PT0gdW5kZWZpbmVkKSBtb2RlLnJlbGV2YW5jZSA9IDE7XG59XG5cbi8vIGFsbG93IGJlZm9yZU1hdGNoIHRvIGFjdCBhcyBhIFwicXVhbGlmaWVyXCIgZm9yIHRoZSBtYXRjaFxuLy8gdGhlIGZ1bGwgbWF0Y2ggYmVnaW4gbXVzdCBiZSBbYmVmb3JlTWF0Y2hdW2JlZ2luXVxuY29uc3QgYmVmb3JlTWF0Y2hFeHQgPSAobW9kZSwgcGFyZW50KSA9PiB7XG4gIGlmICghbW9kZS5iZWZvcmVNYXRjaCkgcmV0dXJuO1xuICAvLyBzdGFydHMgY29uZmxpY3RzIHdpdGggZW5kc1BhcmVudCB3aGljaCB3ZSBuZWVkIHRvIG1ha2Ugc3VyZSB0aGUgY2hpbGRcbiAgLy8gcnVsZSBpcyBub3QgbWF0Y2hlZCBtdWx0aXBsZSB0aW1lc1xuICBpZiAobW9kZS5zdGFydHMpIHRocm93IG5ldyBFcnJvcihcImJlZm9yZU1hdGNoIGNhbm5vdCBiZSB1c2VkIHdpdGggc3RhcnRzXCIpO1xuXG4gIGNvbnN0IG9yaWdpbmFsTW9kZSA9IE9iamVjdC5hc3NpZ24oe30sIG1vZGUpO1xuICBPYmplY3Qua2V5cyhtb2RlKS5mb3JFYWNoKChrZXkpID0+IHsgZGVsZXRlIG1vZGVba2V5XTsgfSk7XG5cbiAgbW9kZS5rZXl3b3JkcyA9IG9yaWdpbmFsTW9kZS5rZXl3b3JkcztcbiAgbW9kZS5iZWdpbiA9IGNvbmNhdChvcmlnaW5hbE1vZGUuYmVmb3JlTWF0Y2gsIGxvb2thaGVhZChvcmlnaW5hbE1vZGUuYmVnaW4pKTtcbiAgbW9kZS5zdGFydHMgPSB7XG4gICAgcmVsZXZhbmNlOiAwLFxuICAgIGNvbnRhaW5zOiBbXG4gICAgICBPYmplY3QuYXNzaWduKG9yaWdpbmFsTW9kZSwgeyBlbmRzUGFyZW50OiB0cnVlIH0pXG4gICAgXVxuICB9O1xuICBtb2RlLnJlbGV2YW5jZSA9IDA7XG5cbiAgZGVsZXRlIG9yaWdpbmFsTW9kZS5iZWZvcmVNYXRjaDtcbn07XG5cbi8vIGtleXdvcmRzIHRoYXQgc2hvdWxkIGhhdmUgbm8gZGVmYXVsdCByZWxldmFuY2UgdmFsdWVcbmNvbnN0IENPTU1PTl9LRVlXT1JEUyA9IFtcbiAgJ29mJyxcbiAgJ2FuZCcsXG4gICdmb3InLFxuICAnaW4nLFxuICAnbm90JyxcbiAgJ29yJyxcbiAgJ2lmJyxcbiAgJ3RoZW4nLFxuICAncGFyZW50JywgLy8gY29tbW9uIHZhcmlhYmxlIG5hbWVcbiAgJ2xpc3QnLCAvLyBjb21tb24gdmFyaWFibGUgbmFtZVxuICAndmFsdWUnIC8vIGNvbW1vbiB2YXJpYWJsZSBuYW1lXG5dO1xuXG5jb25zdCBERUZBVUxUX0tFWVdPUkRfU0NPUEUgPSBcImtleXdvcmRcIjtcblxuLyoqXG4gKiBHaXZlbiByYXcga2V5d29yZHMgZnJvbSBhIGxhbmd1YWdlIGRlZmluaXRpb24sIGNvbXBpbGUgdGhlbS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZyB8IFJlY29yZDxzdHJpbmcsc3RyaW5nfHN0cmluZ1tdPiB8IEFycmF5PHN0cmluZz59IHJhd0tleXdvcmRzXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGNhc2VJbnNlbnNpdGl2ZVxuICovXG5mdW5jdGlvbiBjb21waWxlS2V5d29yZHMocmF3S2V5d29yZHMsIGNhc2VJbnNlbnNpdGl2ZSwgc2NvcGVOYW1lID0gREVGQVVMVF9LRVlXT1JEX1NDT1BFKSB7XG4gIC8qKiBAdHlwZSB7aW1wb3J0KFwiaGlnaGxpZ2h0LmpzL3ByaXZhdGVcIikuS2V5d29yZERpY3R9ICovXG4gIGNvbnN0IGNvbXBpbGVkS2V5d29yZHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIC8vIGlucHV0IGNhbiBiZSBhIHN0cmluZyBvZiBrZXl3b3JkcywgYW4gYXJyYXkgb2Yga2V5d29yZHMsIG9yIGEgb2JqZWN0IHdpdGhcbiAgLy8gbmFtZWQga2V5cyByZXByZXNlbnRpbmcgc2NvcGVOYW1lICh3aGljaCBjYW4gdGhlbiBwb2ludCB0byBhIHN0cmluZyBvciBhcnJheSlcbiAgaWYgKHR5cGVvZiByYXdLZXl3b3JkcyA9PT0gJ3N0cmluZycpIHtcbiAgICBjb21waWxlTGlzdChzY29wZU5hbWUsIHJhd0tleXdvcmRzLnNwbGl0KFwiIFwiKSk7XG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyYXdLZXl3b3JkcykpIHtcbiAgICBjb21waWxlTGlzdChzY29wZU5hbWUsIHJhd0tleXdvcmRzKTtcbiAgfSBlbHNlIHtcbiAgICBPYmplY3Qua2V5cyhyYXdLZXl3b3JkcykuZm9yRWFjaChmdW5jdGlvbihzY29wZU5hbWUpIHtcbiAgICAgIC8vIGNvbGxhcHNlIGFsbCBvdXIgb2JqZWN0cyBiYWNrIGludG8gdGhlIHBhcmVudCBvYmplY3RcbiAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgIGNvbXBpbGVkS2V5d29yZHMsXG4gICAgICAgIGNvbXBpbGVLZXl3b3JkcyhyYXdLZXl3b3Jkc1tzY29wZU5hbWVdLCBjYXNlSW5zZW5zaXRpdmUsIHNjb3BlTmFtZSlcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGNvbXBpbGVkS2V5d29yZHM7XG5cbiAgLy8gLS0tXG5cbiAgLyoqXG4gICAqIENvbXBpbGVzIGFuIGluZGl2aWR1YWwgbGlzdCBvZiBrZXl3b3Jkc1xuICAgKlxuICAgKiBFeDogXCJmb3IgaWYgd2hlbiB3aGlsZXw1XCJcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNjb3BlTmFtZVxuICAgKiBAcGFyYW0ge0FycmF5PHN0cmluZz59IGtleXdvcmRMaXN0XG4gICAqL1xuICBmdW5jdGlvbiBjb21waWxlTGlzdChzY29wZU5hbWUsIGtleXdvcmRMaXN0KSB7XG4gICAgaWYgKGNhc2VJbnNlbnNpdGl2ZSkge1xuICAgICAga2V5d29yZExpc3QgPSBrZXl3b3JkTGlzdC5tYXAoeCA9PiB4LnRvTG93ZXJDYXNlKCkpO1xuICAgIH1cbiAgICBrZXl3b3JkTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGtleXdvcmQpIHtcbiAgICAgIGNvbnN0IHBhaXIgPSBrZXl3b3JkLnNwbGl0KCd8Jyk7XG4gICAgICBjb21waWxlZEtleXdvcmRzW3BhaXJbMF1dID0gW3Njb3BlTmFtZSwgc2NvcmVGb3JLZXl3b3JkKHBhaXJbMF0sIHBhaXJbMV0pXTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHByb3BlciBzY29yZSBmb3IgYSBnaXZlbiBrZXl3b3JkXG4gKlxuICogQWxzbyB0YWtlcyBpbnRvIGFjY291bnQgY29tbWVudCBrZXl3b3Jkcywgd2hpY2ggd2lsbCBiZSBzY29yZWQgMCBVTkxFU1NcbiAqIGFub3RoZXIgc2NvcmUgaGFzIGJlZW4gbWFudWFsbHkgYXNzaWduZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5d29yZFxuICogQHBhcmFtIHtzdHJpbmd9IFtwcm92aWRlZFNjb3JlXVxuICovXG5mdW5jdGlvbiBzY29yZUZvcktleXdvcmQoa2V5d29yZCwgcHJvdmlkZWRTY29yZSkge1xuICAvLyBtYW51YWwgc2NvcmVzIGFsd2F5cyB3aW4gb3ZlciBjb21tb24ga2V5d29yZHNcbiAgLy8gc28geW91IGNhbiBmb3JjZSBhIHNjb3JlIG9mIDEgaWYgeW91IHJlYWxseSBpbnNpc3RcbiAgaWYgKHByb3ZpZGVkU2NvcmUpIHtcbiAgICByZXR1cm4gTnVtYmVyKHByb3ZpZGVkU2NvcmUpO1xuICB9XG5cbiAgcmV0dXJuIGNvbW1vbktleXdvcmQoa2V5d29yZCkgPyAwIDogMTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIGEgZ2l2ZW4ga2V5d29yZCBpcyBjb21tb24gb3Igbm90XG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGtleXdvcmQgKi9cbmZ1bmN0aW9uIGNvbW1vbktleXdvcmQoa2V5d29yZCkge1xuICByZXR1cm4gQ09NTU9OX0tFWVdPUkRTLmluY2x1ZGVzKGtleXdvcmQudG9Mb3dlckNhc2UoKSk7XG59XG5cbi8qXG5cbkZvciB0aGUgcmVhc29uaW5nIGJlaGluZCB0aGlzIHBsZWFzZSBzZWU6XG5odHRwczovL2dpdGh1Yi5jb20vaGlnaGxpZ2h0anMvaGlnaGxpZ2h0LmpzL2lzc3Vlcy8yODgwI2lzc3VlY29tbWVudC03NDcyNzU0MTlcblxuKi9cblxuLyoqXG4gKiBAdHlwZSB7UmVjb3JkPHN0cmluZywgYm9vbGVhbj59XG4gKi9cbmNvbnN0IHNlZW5EZXByZWNhdGlvbnMgPSB7fTtcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZVxuICovXG5jb25zdCBlcnJvciA9IChtZXNzYWdlKSA9PiB7XG4gIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlXG4gKiBAcGFyYW0ge2FueX0gYXJnc1xuICovXG5jb25zdCB3YXJuID0gKG1lc3NhZ2UsIC4uLmFyZ3MpID0+IHtcbiAgY29uc29sZS5sb2coYFdBUk46ICR7bWVzc2FnZX1gLCAuLi5hcmdzKTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHZlcnNpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlXG4gKi9cbmNvbnN0IGRlcHJlY2F0ZWQgPSAodmVyc2lvbiwgbWVzc2FnZSkgPT4ge1xuICBpZiAoc2VlbkRlcHJlY2F0aW9uc1tgJHt2ZXJzaW9ufS8ke21lc3NhZ2V9YF0pIHJldHVybjtcblxuICBjb25zb2xlLmxvZyhgRGVwcmVjYXRlZCBhcyBvZiAke3ZlcnNpb259LiAke21lc3NhZ2V9YCk7XG4gIHNlZW5EZXByZWNhdGlvbnNbYCR7dmVyc2lvbn0vJHttZXNzYWdlfWBdID0gdHJ1ZTtcbn07XG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXRocm93LWxpdGVyYWwgKi9cblxuLyoqXG5AdHlwZWRlZiB7aW1wb3J0KCdoaWdobGlnaHQuanMnKS5Db21waWxlZE1vZGV9IENvbXBpbGVkTW9kZVxuKi9cblxuY29uc3QgTXVsdGlDbGFzc0Vycm9yID0gbmV3IEVycm9yKCk7XG5cbi8qKlxuICogUmVudW1iZXJzIGxhYmVsZWQgc2NvcGUgbmFtZXMgdG8gYWNjb3VudCBmb3IgYWRkaXRpb25hbCBpbm5lciBtYXRjaFxuICogZ3JvdXBzIHRoYXQgb3RoZXJ3aXNlIHdvdWxkIGJyZWFrIGV2ZXJ5dGhpbmcuXG4gKlxuICogTGV0cyBzYXkgd2UgMyBtYXRjaCBzY29wZXM6XG4gKlxuICogICB7IDEgPT4gLi4uLCAyID0+IC4uLiwgMyA9PiAuLi4gfVxuICpcbiAqIFNvIHdoYXQgd2UgbmVlZCBpcyBhIGNsZWFuIG1hdGNoIGxpa2UgdGhpczpcbiAqXG4gKiAgIChhKShiKShjKSA9PiBbIFwiYVwiLCBcImJcIiwgXCJjXCIgXVxuICpcbiAqIEJ1dCB0aGlzIGZhbGxzIGFwYXJ0IHdpdGggaW5uZXIgbWF0Y2ggZ3JvdXBzOlxuICpcbiAqIChhKSgoKGIpKSkoYykgPT4gW1wiYVwiLCBcImJcIiwgXCJiXCIsIFwiYlwiLCBcImNcIiBdXG4gKlxuICogT3VyIHNjb3BlcyBhcmUgbm93IFwib3V0IG9mIGFsaWdubWVudFwiIGFuZCB3ZSdyZSByZXBlYXRpbmcgYGJgIDMgdGltZXMuXG4gKiBXaGF0IG5lZWRzIHRvIGhhcHBlbiBpcyB0aGUgbnVtYmVycyBhcmUgcmVtYXBwZWQ6XG4gKlxuICogICB7IDEgPT4gLi4uLCAyID0+IC4uLiwgNSA9PiAuLi4gfVxuICpcbiAqIFdlIGFsc28gbmVlZCB0byBrbm93IHRoYXQgdGhlIE9OTFkgZ3JvdXBzIHRoYXQgc2hvdWxkIGJlIG91dHB1dFxuICogYXJlIDEsIDIsIGFuZCA1LiAgVGhpcyBmdW5jdGlvbiBoYW5kbGVzIHRoaXMgYmVoYXZpb3IuXG4gKlxuICogQHBhcmFtIHtDb21waWxlZE1vZGV9IG1vZGVcbiAqIEBwYXJhbSB7QXJyYXk8UmVnRXhwIHwgc3RyaW5nPn0gcmVnZXhlc1xuICogQHBhcmFtIHt7a2V5OiBcImJlZ2luU2NvcGVcInxcImVuZFNjb3BlXCJ9fSBvcHRzXG4gKi9cbmZ1bmN0aW9uIHJlbWFwU2NvcGVOYW1lcyhtb2RlLCByZWdleGVzLCB7IGtleSB9KSB7XG4gIGxldCBvZmZzZXQgPSAwO1xuICBjb25zdCBzY29wZU5hbWVzID0gbW9kZVtrZXldO1xuICAvKiogQHR5cGUgUmVjb3JkPG51bWJlcixib29sZWFuPiAqL1xuICBjb25zdCBlbWl0ID0ge307XG4gIC8qKiBAdHlwZSBSZWNvcmQ8bnVtYmVyLHN0cmluZz4gKi9cbiAgY29uc3QgcG9zaXRpb25zID0ge307XG5cbiAgZm9yIChsZXQgaSA9IDE7IGkgPD0gcmVnZXhlcy5sZW5ndGg7IGkrKykge1xuICAgIHBvc2l0aW9uc1tpICsgb2Zmc2V0XSA9IHNjb3BlTmFtZXNbaV07XG4gICAgZW1pdFtpICsgb2Zmc2V0XSA9IHRydWU7XG4gICAgb2Zmc2V0ICs9IGNvdW50TWF0Y2hHcm91cHMocmVnZXhlc1tpIC0gMV0pO1xuICB9XG4gIC8vIHdlIHVzZSBfZW1pdCB0byBrZWVwIHRyYWNrIG9mIHdoaWNoIG1hdGNoIGdyb3VwcyBhcmUgXCJ0b3AtbGV2ZWxcIiB0byBhdm9pZCBkb3VibGVcbiAgLy8gb3V0cHV0IGZyb20gaW5zaWRlIG1hdGNoIGdyb3Vwc1xuICBtb2RlW2tleV0gPSBwb3NpdGlvbnM7XG4gIG1vZGVba2V5XS5fZW1pdCA9IGVtaXQ7XG4gIG1vZGVba2V5XS5fbXVsdGkgPSB0cnVlO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7Q29tcGlsZWRNb2RlfSBtb2RlXG4gKi9cbmZ1bmN0aW9uIGJlZ2luTXVsdGlDbGFzcyhtb2RlKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShtb2RlLmJlZ2luKSkgcmV0dXJuO1xuXG4gIGlmIChtb2RlLnNraXAgfHwgbW9kZS5leGNsdWRlQmVnaW4gfHwgbW9kZS5yZXR1cm5CZWdpbikge1xuICAgIGVycm9yKFwic2tpcCwgZXhjbHVkZUJlZ2luLCByZXR1cm5CZWdpbiBub3QgY29tcGF0aWJsZSB3aXRoIGJlZ2luU2NvcGU6IHt9XCIpO1xuICAgIHRocm93IE11bHRpQ2xhc3NFcnJvcjtcbiAgfVxuXG4gIGlmICh0eXBlb2YgbW9kZS5iZWdpblNjb3BlICE9PSBcIm9iamVjdFwiIHx8IG1vZGUuYmVnaW5TY29wZSA9PT0gbnVsbCkge1xuICAgIGVycm9yKFwiYmVnaW5TY29wZSBtdXN0IGJlIG9iamVjdFwiKTtcbiAgICB0aHJvdyBNdWx0aUNsYXNzRXJyb3I7XG4gIH1cblxuICByZW1hcFNjb3BlTmFtZXMobW9kZSwgbW9kZS5iZWdpbiwgeyBrZXk6IFwiYmVnaW5TY29wZVwiIH0pO1xuICBtb2RlLmJlZ2luID0gX3Jld3JpdGVCYWNrcmVmZXJlbmNlcyhtb2RlLmJlZ2luLCB7IGpvaW5XaXRoOiBcIlwiIH0pO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7Q29tcGlsZWRNb2RlfSBtb2RlXG4gKi9cbmZ1bmN0aW9uIGVuZE11bHRpQ2xhc3MobW9kZSkge1xuICBpZiAoIUFycmF5LmlzQXJyYXkobW9kZS5lbmQpKSByZXR1cm47XG5cbiAgaWYgKG1vZGUuc2tpcCB8fCBtb2RlLmV4Y2x1ZGVFbmQgfHwgbW9kZS5yZXR1cm5FbmQpIHtcbiAgICBlcnJvcihcInNraXAsIGV4Y2x1ZGVFbmQsIHJldHVybkVuZCBub3QgY29tcGF0aWJsZSB3aXRoIGVuZFNjb3BlOiB7fVwiKTtcbiAgICB0aHJvdyBNdWx0aUNsYXNzRXJyb3I7XG4gIH1cblxuICBpZiAodHlwZW9mIG1vZGUuZW5kU2NvcGUgIT09IFwib2JqZWN0XCIgfHwgbW9kZS5lbmRTY29wZSA9PT0gbnVsbCkge1xuICAgIGVycm9yKFwiZW5kU2NvcGUgbXVzdCBiZSBvYmplY3RcIik7XG4gICAgdGhyb3cgTXVsdGlDbGFzc0Vycm9yO1xuICB9XG5cbiAgcmVtYXBTY29wZU5hbWVzKG1vZGUsIG1vZGUuZW5kLCB7IGtleTogXCJlbmRTY29wZVwiIH0pO1xuICBtb2RlLmVuZCA9IF9yZXdyaXRlQmFja3JlZmVyZW5jZXMobW9kZS5lbmQsIHsgam9pbldpdGg6IFwiXCIgfSk7XG59XG5cbi8qKlxuICogdGhpcyBleGlzdHMgb25seSB0byBhbGxvdyBgc2NvcGU6IHt9YCB0byBiZSB1c2VkIGJlc2lkZSBgbWF0Y2g6YFxuICogT3RoZXJ3aXNlIGBiZWdpblNjb3BlYCB3b3VsZCBuZWNlc3NhcnkgYW5kIHRoYXQgd291bGQgbG9vayB3ZWlyZFxuXG4gIHtcbiAgICBtYXRjaDogWyAvZGVmLywgL1xcdysvIF1cbiAgICBzY29wZTogeyAxOiBcImtleXdvcmRcIiAsIDI6IFwidGl0bGVcIiB9XG4gIH1cblxuICogQHBhcmFtIHtDb21waWxlZE1vZGV9IG1vZGVcbiAqL1xuZnVuY3Rpb24gc2NvcGVTdWdhcihtb2RlKSB7XG4gIGlmIChtb2RlLnNjb3BlICYmIHR5cGVvZiBtb2RlLnNjb3BlID09PSBcIm9iamVjdFwiICYmIG1vZGUuc2NvcGUgIT09IG51bGwpIHtcbiAgICBtb2RlLmJlZ2luU2NvcGUgPSBtb2RlLnNjb3BlO1xuICAgIGRlbGV0ZSBtb2RlLnNjb3BlO1xuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIHtDb21waWxlZE1vZGV9IG1vZGVcbiAqL1xuZnVuY3Rpb24gTXVsdGlDbGFzcyhtb2RlKSB7XG4gIHNjb3BlU3VnYXIobW9kZSk7XG5cbiAgaWYgKHR5cGVvZiBtb2RlLmJlZ2luU2NvcGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICBtb2RlLmJlZ2luU2NvcGUgPSB7IF93cmFwOiBtb2RlLmJlZ2luU2NvcGUgfTtcbiAgfVxuICBpZiAodHlwZW9mIG1vZGUuZW5kU2NvcGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICBtb2RlLmVuZFNjb3BlID0geyBfd3JhcDogbW9kZS5lbmRTY29wZSB9O1xuICB9XG5cbiAgYmVnaW5NdWx0aUNsYXNzKG1vZGUpO1xuICBlbmRNdWx0aUNsYXNzKG1vZGUpO1xufVxuXG4vKipcbkB0eXBlZGVmIHtpbXBvcnQoJ2hpZ2hsaWdodC5qcycpLk1vZGV9IE1vZGVcbkB0eXBlZGVmIHtpbXBvcnQoJ2hpZ2hsaWdodC5qcycpLkNvbXBpbGVkTW9kZX0gQ29tcGlsZWRNb2RlXG5AdHlwZWRlZiB7aW1wb3J0KCdoaWdobGlnaHQuanMnKS5MYW5ndWFnZX0gTGFuZ3VhZ2VcbkB0eXBlZGVmIHtpbXBvcnQoJ2hpZ2hsaWdodC5qcycpLkhMSlNQbHVnaW59IEhMSlNQbHVnaW5cbkB0eXBlZGVmIHtpbXBvcnQoJ2hpZ2hsaWdodC5qcycpLkNvbXBpbGVkTGFuZ3VhZ2V9IENvbXBpbGVkTGFuZ3VhZ2VcbiovXG5cbi8vIGNvbXBpbGF0aW9uXG5cbi8qKlxuICogQ29tcGlsZXMgYSBsYW5ndWFnZSBkZWZpbml0aW9uIHJlc3VsdFxuICpcbiAqIEdpdmVuIHRoZSByYXcgcmVzdWx0IG9mIGEgbGFuZ3VhZ2UgZGVmaW5pdGlvbiAoTGFuZ3VhZ2UpLCBjb21waWxlcyB0aGlzIHNvXG4gKiB0aGF0IGl0IGlzIHJlYWR5IGZvciBoaWdobGlnaHRpbmcgY29kZS5cbiAqIEBwYXJhbSB7TGFuZ3VhZ2V9IGxhbmd1YWdlXG4gKiBAcmV0dXJucyB7Q29tcGlsZWRMYW5ndWFnZX1cbiAqL1xuZnVuY3Rpb24gY29tcGlsZUxhbmd1YWdlKGxhbmd1YWdlKSB7XG4gIC8qKlxuICAgKiBCdWlsZHMgYSByZWdleCB3aXRoIHRoZSBjYXNlIHNlbnNpdGl2aXR5IG9mIHRoZSBjdXJyZW50IGxhbmd1YWdlXG4gICAqXG4gICAqIEBwYXJhbSB7UmVnRXhwIHwgc3RyaW5nfSB2YWx1ZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtnbG9iYWxdXG4gICAqL1xuICBmdW5jdGlvbiBsYW5nUmUodmFsdWUsIGdsb2JhbCkge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKFxuICAgICAgc291cmNlKHZhbHVlKSxcbiAgICAgICdtJ1xuICAgICAgKyAobGFuZ3VhZ2UuY2FzZV9pbnNlbnNpdGl2ZSA/ICdpJyA6ICcnKVxuICAgICAgKyAobGFuZ3VhZ2UudW5pY29kZVJlZ2V4ID8gJ3UnIDogJycpXG4gICAgICArIChnbG9iYWwgPyAnZycgOiAnJylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAgU3RvcmVzIG11bHRpcGxlIHJlZ3VsYXIgZXhwcmVzc2lvbnMgYW5kIGFsbG93cyB5b3UgdG8gcXVpY2tseSBzZWFyY2ggZm9yXG4gICAgdGhlbSBhbGwgaW4gYSBzdHJpbmcgc2ltdWx0YW5lb3VzbHkgLSByZXR1cm5pbmcgdGhlIGZpcnN0IG1hdGNoLiAgSXQgZG9lc1xuICAgIHRoaXMgYnkgY3JlYXRpbmcgYSBodWdlIChhfGJ8YykgcmVnZXggLSBlYWNoIGluZGl2aWR1YWwgaXRlbSB3cmFwcGVkIHdpdGggKClcbiAgICBhbmQgam9pbmVkIGJ5IGB8YCAtIHVzaW5nIG1hdGNoIGdyb3VwcyB0byB0cmFjayBwb3NpdGlvbi4gIFdoZW4gYSBtYXRjaCBpc1xuICAgIGZvdW5kIGNoZWNraW5nIHdoaWNoIHBvc2l0aW9uIGluIHRoZSBhcnJheSBoYXMgY29udGVudCBhbGxvd3MgdXMgdG8gZmlndXJlXG4gICAgb3V0IHdoaWNoIG9mIHRoZSBvcmlnaW5hbCByZWdleGVzIC8gbWF0Y2ggZ3JvdXBzIHRyaWdnZXJlZCB0aGUgbWF0Y2guXG5cbiAgICBUaGUgbWF0Y2ggb2JqZWN0IGl0c2VsZiAodGhlIHJlc3VsdCBvZiBgUmVnZXguZXhlY2ApIGlzIHJldHVybmVkIGJ1dCBhbHNvXG4gICAgZW5oYW5jZWQgYnkgbWVyZ2luZyBpbiBhbnkgbWV0YS1kYXRhIHRoYXQgd2FzIHJlZ2lzdGVyZWQgd2l0aCB0aGUgcmVnZXguXG4gICAgVGhpcyBpcyBob3cgd2Uga2VlcCB0cmFjayBvZiB3aGljaCBtb2RlIG1hdGNoZWQsIGFuZCB3aGF0IHR5cGUgb2YgcnVsZVxuICAgIChgaWxsZWdhbGAsIGBiZWdpbmAsIGVuZCwgZXRjKS5cbiAgKi9cbiAgY2xhc3MgTXVsdGlSZWdleCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICB0aGlzLm1hdGNoSW5kZXhlcyA9IHt9O1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgdGhpcy5yZWdleGVzID0gW107XG4gICAgICB0aGlzLm1hdGNoQXQgPSAxO1xuICAgICAgdGhpcy5wb3NpdGlvbiA9IDA7XG4gICAgfVxuXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGFkZFJ1bGUocmUsIG9wdHMpIHtcbiAgICAgIG9wdHMucG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uKys7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICB0aGlzLm1hdGNoSW5kZXhlc1t0aGlzLm1hdGNoQXRdID0gb3B0cztcbiAgICAgIHRoaXMucmVnZXhlcy5wdXNoKFtvcHRzLCByZV0pO1xuICAgICAgdGhpcy5tYXRjaEF0ICs9IGNvdW50TWF0Y2hHcm91cHMocmUpICsgMTtcbiAgICB9XG5cbiAgICBjb21waWxlKCkge1xuICAgICAgaWYgKHRoaXMucmVnZXhlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gYXZvaWRzIHRoZSBuZWVkIHRvIGNoZWNrIGxlbmd0aCBldmVyeSB0aW1lIGV4ZWMgaXMgY2FsbGVkXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgdGhpcy5leGVjID0gKCkgPT4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHRlcm1pbmF0b3JzID0gdGhpcy5yZWdleGVzLm1hcChlbCA9PiBlbFsxXSk7XG4gICAgICB0aGlzLm1hdGNoZXJSZSA9IGxhbmdSZShfcmV3cml0ZUJhY2tyZWZlcmVuY2VzKHRlcm1pbmF0b3JzLCB7IGpvaW5XaXRoOiAnfCcgfSksIHRydWUpO1xuICAgICAgdGhpcy5sYXN0SW5kZXggPSAwO1xuICAgIH1cblxuICAgIC8qKiBAcGFyYW0ge3N0cmluZ30gcyAqL1xuICAgIGV4ZWMocykge1xuICAgICAgdGhpcy5tYXRjaGVyUmUubGFzdEluZGV4ID0gdGhpcy5sYXN0SW5kZXg7XG4gICAgICBjb25zdCBtYXRjaCA9IHRoaXMubWF0Y2hlclJlLmV4ZWMocyk7XG4gICAgICBpZiAoIW1hdGNoKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZmluZWRcbiAgICAgIGNvbnN0IGkgPSBtYXRjaC5maW5kSW5kZXgoKGVsLCBpKSA9PiBpID4gMCAmJiBlbCAhPT0gdW5kZWZpbmVkKTtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIGNvbnN0IG1hdGNoRGF0YSA9IHRoaXMubWF0Y2hJbmRleGVzW2ldO1xuICAgICAgLy8gdHJpbSBvZmYgYW55IGVhcmxpZXIgbm9uLXJlbGV2YW50IG1hdGNoIGdyb3VwcyAoaWUsIHRoZSBvdGhlciByZWdleFxuICAgICAgLy8gbWF0Y2ggZ3JvdXBzIHRoYXQgbWFrZSB1cCB0aGUgbXVsdGktbWF0Y2hlcilcbiAgICAgIG1hdGNoLnNwbGljZSgwLCBpKTtcblxuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24obWF0Y2gsIG1hdGNoRGF0YSk7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgICBDcmVhdGVkIHRvIHNvbHZlIHRoZSBrZXkgZGVmaWNpZW50bHkgd2l0aCBNdWx0aVJlZ2V4IC0gdGhlcmUgaXMgbm8gd2F5IHRvXG4gICAgdGVzdCBmb3IgbXVsdGlwbGUgbWF0Y2hlcyBhdCBhIHNpbmdsZSBsb2NhdGlvbi4gIFdoeSB3b3VsZCB3ZSBuZWVkIHRvIGRvXG4gICAgdGhhdD8gIEluIHRoZSBmdXR1cmUgYSBtb3JlIGR5bmFtaWMgZW5naW5lIHdpbGwgYWxsb3cgY2VydGFpbiBtYXRjaGVzIHRvIGJlXG4gICAgaWdub3JlZC4gIEFuIGV4YW1wbGU6IGlmIHdlIG1hdGNoZWQgc2F5IHRoZSAzcmQgcmVnZXggaW4gYSBsYXJnZSBncm91cCBidXRcbiAgICBkZWNpZGVkIHRvIGlnbm9yZSBpdCAtIHdlJ2QgbmVlZCB0byBzdGFydGVkIHRlc3RpbmcgYWdhaW4gYXQgdGhlIDR0aFxuICAgIHJlZ2V4Li4uIGJ1dCBNdWx0aVJlZ2V4IGl0c2VsZiBnaXZlcyB1cyBubyByZWFsIHdheSB0byBkbyB0aGF0LlxuXG4gICAgU28gd2hhdCB0aGlzIGNsYXNzIGNyZWF0ZXMgTXVsdGlSZWdleHMgb24gdGhlIGZseSBmb3Igd2hhdGV2ZXIgc2VhcmNoXG4gICAgcG9zaXRpb24gdGhleSBhcmUgbmVlZGVkLlxuXG4gICAgTk9URTogVGhlc2UgYWRkaXRpb25hbCBNdWx0aVJlZ2V4IG9iamVjdHMgYXJlIGNyZWF0ZWQgZHluYW1pY2FsbHkuICBGb3IgbW9zdFxuICAgIGdyYW1tYXJzIG1vc3Qgb2YgdGhlIHRpbWUgd2Ugd2lsbCBuZXZlciBhY3R1YWxseSBuZWVkIGFueXRoaW5nIG1vcmUgdGhhbiB0aGVcbiAgICBmaXJzdCBNdWx0aVJlZ2V4IC0gc28gdGhpcyBzaG91bGRuJ3QgaGF2ZSB0b28gbXVjaCBvdmVyaGVhZC5cblxuICAgIFNheSB0aGlzIGlzIG91ciBzZWFyY2ggZ3JvdXAsIGFuZCB3ZSBtYXRjaCByZWdleDMsIGJ1dCB3aXNoIHRvIGlnbm9yZSBpdC5cblxuICAgICAgcmVnZXgxIHwgcmVnZXgyIHwgcmVnZXgzIHwgcmVnZXg0IHwgcmVnZXg1ICAgICcgaWUsIHN0YXJ0QXQgPSAwXG5cbiAgICBXaGF0IHdlIG5lZWQgaXMgYSBuZXcgTXVsdGlSZWdleCB0aGF0IG9ubHkgaW5jbHVkZXMgdGhlIHJlbWFpbmluZ1xuICAgIHBvc3NpYmlsaXRpZXM6XG5cbiAgICAgIHJlZ2V4NCB8IHJlZ2V4NSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIGllLCBzdGFydEF0ID0gM1xuXG4gICAgVGhpcyBjbGFzcyB3cmFwcyBhbGwgdGhhdCBjb21wbGV4aXR5IHVwIGluIGEgc2ltcGxlIEFQSS4uLiBgc3RhcnRBdGAgZGVjaWRlc1xuICAgIHdoZXJlIGluIHRoZSBhcnJheSBvZiBleHByZXNzaW9ucyB0byBzdGFydCBkb2luZyB0aGUgbWF0Y2hpbmcuIEl0XG4gICAgYXV0by1pbmNyZW1lbnRzLCBzbyBpZiBhIG1hdGNoIGlzIGZvdW5kIGF0IHBvc2l0aW9uIDIsIHRoZW4gc3RhcnRBdCB3aWxsIGJlXG4gICAgc2V0IHRvIDMuICBJZiB0aGUgZW5kIGlzIHJlYWNoZWQgc3RhcnRBdCB3aWxsIHJldHVybiB0byAwLlxuXG4gICAgTU9TVCBvZiB0aGUgdGltZSB0aGUgcGFyc2VyIHdpbGwgYmUgc2V0dGluZyBzdGFydEF0IG1hbnVhbGx5IHRvIDAuXG4gICovXG4gIGNsYXNzIFJlc3VtYWJsZU11bHRpUmVnZXgge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgdGhpcy5ydWxlcyA9IFtdO1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgdGhpcy5tdWx0aVJlZ2V4ZXMgPSBbXTtcbiAgICAgIHRoaXMuY291bnQgPSAwO1xuXG4gICAgICB0aGlzLmxhc3RJbmRleCA9IDA7XG4gICAgICB0aGlzLnJlZ2V4SW5kZXggPSAwO1xuICAgIH1cblxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBnZXRNYXRjaGVyKGluZGV4KSB7XG4gICAgICBpZiAodGhpcy5tdWx0aVJlZ2V4ZXNbaW5kZXhdKSByZXR1cm4gdGhpcy5tdWx0aVJlZ2V4ZXNbaW5kZXhdO1xuXG4gICAgICBjb25zdCBtYXRjaGVyID0gbmV3IE11bHRpUmVnZXgoKTtcbiAgICAgIHRoaXMucnVsZXMuc2xpY2UoaW5kZXgpLmZvckVhY2goKFtyZSwgb3B0c10pID0+IG1hdGNoZXIuYWRkUnVsZShyZSwgb3B0cykpO1xuICAgICAgbWF0Y2hlci5jb21waWxlKCk7XG4gICAgICB0aGlzLm11bHRpUmVnZXhlc1tpbmRleF0gPSBtYXRjaGVyO1xuICAgICAgcmV0dXJuIG1hdGNoZXI7XG4gICAgfVxuXG4gICAgcmVzdW1pbmdTY2FuQXRTYW1lUG9zaXRpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZWdleEluZGV4ICE9PSAwO1xuICAgIH1cblxuICAgIGNvbnNpZGVyQWxsKCkge1xuICAgICAgdGhpcy5yZWdleEluZGV4ID0gMDtcbiAgICB9XG5cbiAgICAvLyBAdHMtaWdub3JlXG4gICAgYWRkUnVsZShyZSwgb3B0cykge1xuICAgICAgdGhpcy5ydWxlcy5wdXNoKFtyZSwgb3B0c10pO1xuICAgICAgaWYgKG9wdHMudHlwZSA9PT0gXCJiZWdpblwiKSB0aGlzLmNvdW50Kys7XG4gICAgfVxuXG4gICAgLyoqIEBwYXJhbSB7c3RyaW5nfSBzICovXG4gICAgZXhlYyhzKSB7XG4gICAgICBjb25zdCBtID0gdGhpcy5nZXRNYXRjaGVyKHRoaXMucmVnZXhJbmRleCk7XG4gICAgICBtLmxhc3RJbmRleCA9IHRoaXMubGFzdEluZGV4O1xuICAgICAgbGV0IHJlc3VsdCA9IG0uZXhlYyhzKTtcblxuICAgICAgLy8gVGhlIGZvbGxvd2luZyBpcyBiZWNhdXNlIHdlIGhhdmUgbm8gZWFzeSB3YXkgdG8gc2F5IFwicmVzdW1lIHNjYW5uaW5nIGF0IHRoZVxuICAgICAgLy8gZXhpc3RpbmcgcG9zaXRpb24gYnV0IGFsc28gc2tpcCB0aGUgY3VycmVudCBydWxlIE9OTFlcIi4gV2hhdCBoYXBwZW5zIGlzXG4gICAgICAvLyBhbGwgcHJpb3IgcnVsZXMgYXJlIGFsc28gc2tpcHBlZCB3aGljaCBjYW4gcmVzdWx0IGluIG1hdGNoaW5nIHRoZSB3cm9uZ1xuICAgICAgLy8gdGhpbmcuIEV4YW1wbGUgb2YgbWF0Y2hpbmcgXCJib29nZXJcIjpcblxuICAgICAgLy8gb3VyIG1hdGNoZXIgaXMgW3N0cmluZywgXCJib29nZXJcIiwgbnVtYmVyXVxuICAgICAgLy9cbiAgICAgIC8vIC4uLi5ib29nZXIuLi4uXG5cbiAgICAgIC8vIGlmIFwiYm9vZ2VyXCIgaXMgaWdub3JlZCB0aGVuIHdlJ2QgcmVhbGx5IG5lZWQgYSByZWdleCB0byBzY2FuIGZyb20gdGhlXG4gICAgICAvLyBTQU1FIHBvc2l0aW9uIGZvciBvbmx5OiBbc3RyaW5nLCBudW1iZXJdIGJ1dCBpZ25vcmluZyBcImJvb2dlclwiIChpZiBpdFxuICAgICAgLy8gd2FzIHRoZSBmaXJzdCBtYXRjaCksIGEgc2ltcGxlIHJlc3VtZSB3b3VsZCBzY2FuIGFoZWFkIHdobyBrbm93cyBob3dcbiAgICAgIC8vIGZhciBsb29raW5nIG9ubHkgZm9yIFwibnVtYmVyXCIsIGlnbm9yaW5nIHBvdGVudGlhbCBzdHJpbmcgbWF0Y2hlcyAob3JcbiAgICAgIC8vIGZ1dHVyZSBcImJvb2dlclwiIG1hdGNoZXMgdGhhdCBtaWdodCBiZSB2YWxpZC4pXG5cbiAgICAgIC8vIFNvIHdoYXQgd2UgZG86IFdlIGV4ZWN1dGUgdHdvIG1hdGNoZXJzLCBvbmUgcmVzdW1pbmcgYXQgdGhlIHNhbWVcbiAgICAgIC8vIHBvc2l0aW9uLCBidXQgdGhlIHNlY29uZCBmdWxsIG1hdGNoZXIgc3RhcnRpbmcgYXQgdGhlIHBvc2l0aW9uIGFmdGVyOlxuXG4gICAgICAvLyAgICAgLy0tLSByZXN1bWUgZmlyc3QgcmVnZXggbWF0Y2ggaGVyZSAoZm9yIFtudW1iZXJdKVxuICAgICAgLy8gICAgIHwvLS0tLSBmdWxsIG1hdGNoIGhlcmUgZm9yIFtzdHJpbmcsIFwiYm9vZ2VyXCIsIG51bWJlcl1cbiAgICAgIC8vICAgICB2dlxuICAgICAgLy8gLi4uLmJvb2dlci4uLi5cblxuICAgICAgLy8gV2hpY2ggZXZlciByZXN1bHRzIGluIGEgbWF0Y2ggZmlyc3QgaXMgdGhlbiB1c2VkLiBTbyB0aGlzIDMtNCBzdGVwXG4gICAgICAvLyBwcm9jZXNzIGVzc2VudGlhbGx5IGFsbG93cyB1cyB0byBzYXkgXCJtYXRjaCBhdCB0aGlzIHBvc2l0aW9uLCBleGNsdWRpbmdcbiAgICAgIC8vIGEgcHJpb3IgcnVsZSB0aGF0IHdhcyBpZ25vcmVkXCIuXG4gICAgICAvL1xuICAgICAgLy8gMS4gTWF0Y2ggXCJib29nZXJcIiBmaXJzdCwgaWdub3JlLiBBbHNvIHByb3ZlcyB0aGF0IFtzdHJpbmddIGRvZXMgbm9uIG1hdGNoLlxuICAgICAgLy8gMi4gUmVzdW1lIG1hdGNoaW5nIGZvciBbbnVtYmVyXVxuICAgICAgLy8gMy4gTWF0Y2ggYXQgaW5kZXggKyAxIGZvciBbc3RyaW5nLCBcImJvb2dlclwiLCBudW1iZXJdXG4gICAgICAvLyA0LiBJZiAjMiBhbmQgIzMgcmVzdWx0IGluIG1hdGNoZXMsIHdoaWNoIGNhbWUgZmlyc3Q/XG4gICAgICBpZiAodGhpcy5yZXN1bWluZ1NjYW5BdFNhbWVQb3NpdGlvbigpKSB7XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LmluZGV4ID09PSB0aGlzLmxhc3RJbmRleCkgOyBlbHNlIHsgLy8gdXNlIHRoZSBzZWNvbmQgbWF0Y2hlciByZXN1bHRcbiAgICAgICAgICBjb25zdCBtMiA9IHRoaXMuZ2V0TWF0Y2hlcigwKTtcbiAgICAgICAgICBtMi5sYXN0SW5kZXggPSB0aGlzLmxhc3RJbmRleCArIDE7XG4gICAgICAgICAgcmVzdWx0ID0gbTIuZXhlYyhzKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIHRoaXMucmVnZXhJbmRleCArPSByZXN1bHQucG9zaXRpb24gKyAxO1xuICAgICAgICBpZiAodGhpcy5yZWdleEluZGV4ID09PSB0aGlzLmNvdW50KSB7XG4gICAgICAgICAgLy8gd3JhcC1hcm91bmQgdG8gY29uc2lkZXJpbmcgYWxsIG1hdGNoZXMgYWdhaW5cbiAgICAgICAgICB0aGlzLmNvbnNpZGVyQWxsKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYSBtb2RlLCBidWlsZHMgYSBodWdlIFJlc3VtYWJsZU11bHRpUmVnZXggdGhhdCBjYW4gYmUgdXNlZCB0byB3YWxrXG4gICAqIHRoZSBjb250ZW50IGFuZCBmaW5kIG1hdGNoZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7Q29tcGlsZWRNb2RlfSBtb2RlXG4gICAqIEByZXR1cm5zIHtSZXN1bWFibGVNdWx0aVJlZ2V4fVxuICAgKi9cbiAgZnVuY3Rpb24gYnVpbGRNb2RlUmVnZXgobW9kZSkge1xuICAgIGNvbnN0IG1tID0gbmV3IFJlc3VtYWJsZU11bHRpUmVnZXgoKTtcblxuICAgIG1vZGUuY29udGFpbnMuZm9yRWFjaCh0ZXJtID0+IG1tLmFkZFJ1bGUodGVybS5iZWdpbiwgeyBydWxlOiB0ZXJtLCB0eXBlOiBcImJlZ2luXCIgfSkpO1xuXG4gICAgaWYgKG1vZGUudGVybWluYXRvckVuZCkge1xuICAgICAgbW0uYWRkUnVsZShtb2RlLnRlcm1pbmF0b3JFbmQsIHsgdHlwZTogXCJlbmRcIiB9KTtcbiAgICB9XG4gICAgaWYgKG1vZGUuaWxsZWdhbCkge1xuICAgICAgbW0uYWRkUnVsZShtb2RlLmlsbGVnYWwsIHsgdHlwZTogXCJpbGxlZ2FsXCIgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1tO1xuICB9XG5cbiAgLyoqIHNraXAgdnMgYWJvcnQgdnMgaWdub3JlXG4gICAqXG4gICAqIEBza2lwICAgLSBUaGUgbW9kZSBpcyBzdGlsbCBlbnRlcmVkIGFuZCBleGl0ZWQgbm9ybWFsbHkgKGFuZCBjb250YWlucyBydWxlcyBhcHBseSksXG4gICAqICAgICAgICAgICBidXQgYWxsIGNvbnRlbnQgaXMgaGVsZCBhbmQgYWRkZWQgdG8gdGhlIHBhcmVudCBidWZmZXIgcmF0aGVyIHRoYW4gYmVpbmdcbiAgICogICAgICAgICAgIG91dHB1dCB3aGVuIHRoZSBtb2RlIGVuZHMuICBNb3N0bHkgdXNlZCB3aXRoIGBzdWJsYW5ndWFnZWAgdG8gYnVpbGQgdXBcbiAgICogICAgICAgICAgIGEgc2luZ2xlIGxhcmdlIGJ1ZmZlciB0aGFuIGNhbiBiZSBwYXJzZWQgYnkgc3VibGFuZ3VhZ2UuXG4gICAqXG4gICAqICAgICAgICAgICAgIC0gVGhlIG1vZGUgYmVnaW4gYW5kcyBlbmRzIG5vcm1hbGx5LlxuICAgKiAgICAgICAgICAgICAtIENvbnRlbnQgbWF0Y2hlZCBpcyBhZGRlZCB0byB0aGUgcGFyZW50IG1vZGUgYnVmZmVyLlxuICAgKiAgICAgICAgICAgICAtIFRoZSBwYXJzZXIgY3Vyc29yIGlzIG1vdmVkIGZvcndhcmQgbm9ybWFsbHkuXG4gICAqXG4gICAqIEBhYm9ydCAgLSBBIGhhY2sgcGxhY2Vob2xkZXIgdW50aWwgd2UgaGF2ZSBpZ25vcmUuICBBYm9ydHMgdGhlIG1vZGUgKGFzIGlmIGl0XG4gICAqICAgICAgICAgICBuZXZlciBtYXRjaGVkKSBidXQgRE9FUyBOT1QgY29udGludWUgdG8gbWF0Y2ggc3Vic2VxdWVudCBgY29udGFpbnNgXG4gICAqICAgICAgICAgICBtb2Rlcy4gIEFib3J0IGlzIGJhZC9zdWJvcHRpbWFsIGJlY2F1c2UgaXQgY2FuIHJlc3VsdCBpbiBtb2Rlc1xuICAgKiAgICAgICAgICAgZmFydGhlciBkb3duIG5vdCBnZXR0aW5nIGFwcGxpZWQgYmVjYXVzZSBhbiBlYXJsaWVyIHJ1bGUgZWF0cyB0aGVcbiAgICogICAgICAgICAgIGNvbnRlbnQgYnV0IHRoZW4gYWJvcnRzLlxuICAgKlxuICAgKiAgICAgICAgICAgICAtIFRoZSBtb2RlIGRvZXMgbm90IGJlZ2luLlxuICAgKiAgICAgICAgICAgICAtIENvbnRlbnQgbWF0Y2hlZCBieSBgYmVnaW5gIGlzIGFkZGVkIHRvIHRoZSBtb2RlIGJ1ZmZlci5cbiAgICogICAgICAgICAgICAgLSBUaGUgcGFyc2VyIGN1cnNvciBpcyBtb3ZlZCBmb3J3YXJkIGFjY29yZGluZ2x5LlxuICAgKlxuICAgKiBAaWdub3JlIC0gSWdub3JlcyB0aGUgbW9kZSAoYXMgaWYgaXQgbmV2ZXIgbWF0Y2hlZCkgYW5kIGNvbnRpbnVlcyB0byBtYXRjaCBhbnlcbiAgICogICAgICAgICAgIHN1YnNlcXVlbnQgYGNvbnRhaW5zYCBtb2Rlcy4gIElnbm9yZSBpc24ndCB0ZWNobmljYWxseSBwb3NzaWJsZSB3aXRoXG4gICAqICAgICAgICAgICB0aGUgY3VycmVudCBwYXJzZXIgaW1wbGVtZW50YXRpb24uXG4gICAqXG4gICAqICAgICAgICAgICAgIC0gVGhlIG1vZGUgZG9lcyBub3QgYmVnaW4uXG4gICAqICAgICAgICAgICAgIC0gQ29udGVudCBtYXRjaGVkIGJ5IGBiZWdpbmAgaXMgaWdub3JlZC5cbiAgICogICAgICAgICAgICAgLSBUaGUgcGFyc2VyIGN1cnNvciBpcyBub3QgbW92ZWQgZm9yd2FyZC5cbiAgICovXG5cbiAgLyoqXG4gICAqIENvbXBpbGVzIGFuIGluZGl2aWR1YWwgbW9kZVxuICAgKlxuICAgKiBUaGlzIGNhbiByYWlzZSBhbiBlcnJvciBpZiB0aGUgbW9kZSBjb250YWlucyBjZXJ0YWluIGRldGVjdGFibGUga25vd24gbG9naWNcbiAgICogaXNzdWVzLlxuICAgKiBAcGFyYW0ge01vZGV9IG1vZGVcbiAgICogQHBhcmFtIHtDb21waWxlZE1vZGUgfCBudWxsfSBbcGFyZW50XVxuICAgKiBAcmV0dXJucyB7Q29tcGlsZWRNb2RlIHwgbmV2ZXJ9XG4gICAqL1xuICBmdW5jdGlvbiBjb21waWxlTW9kZShtb2RlLCBwYXJlbnQpIHtcbiAgICBjb25zdCBjbW9kZSA9IC8qKiBAdHlwZSBDb21waWxlZE1vZGUgKi8gKG1vZGUpO1xuICAgIGlmIChtb2RlLmlzQ29tcGlsZWQpIHJldHVybiBjbW9kZTtcblxuICAgIFtcbiAgICAgIHNjb3BlQ2xhc3NOYW1lLFxuICAgICAgLy8gZG8gdGhpcyBlYXJseSBzbyBjb21waWxlciBleHRlbnNpb25zIGdlbmVyYWxseSBkb24ndCBoYXZlIHRvIHdvcnJ5IGFib3V0XG4gICAgICAvLyB0aGUgZGlzdGluY3Rpb24gYmV0d2VlbiBtYXRjaC9iZWdpblxuICAgICAgY29tcGlsZU1hdGNoLFxuICAgICAgTXVsdGlDbGFzcyxcbiAgICAgIGJlZm9yZU1hdGNoRXh0XG4gICAgXS5mb3JFYWNoKGV4dCA9PiBleHQobW9kZSwgcGFyZW50KSk7XG5cbiAgICBsYW5ndWFnZS5jb21waWxlckV4dGVuc2lvbnMuZm9yRWFjaChleHQgPT4gZXh0KG1vZGUsIHBhcmVudCkpO1xuXG4gICAgLy8gX19iZWZvcmVCZWdpbiBpcyBjb25zaWRlcmVkIHByaXZhdGUgQVBJLCBpbnRlcm5hbCB1c2Ugb25seVxuICAgIG1vZGUuX19iZWZvcmVCZWdpbiA9IG51bGw7XG5cbiAgICBbXG4gICAgICBiZWdpbktleXdvcmRzLFxuICAgICAgLy8gZG8gdGhpcyBsYXRlciBzbyBjb21waWxlciBleHRlbnNpb25zIHRoYXQgY29tZSBlYXJsaWVyIGhhdmUgYWNjZXNzIHRvIHRoZVxuICAgICAgLy8gcmF3IGFycmF5IGlmIHRoZXkgd2FudGVkIHRvIHBlcmhhcHMgbWFuaXB1bGF0ZSBpdCwgZXRjLlxuICAgICAgY29tcGlsZUlsbGVnYWwsXG4gICAgICAvLyBkZWZhdWx0IHRvIDEgcmVsZXZhbmNlIGlmIG5vdCBzcGVjaWZpZWRcbiAgICAgIGNvbXBpbGVSZWxldmFuY2VcbiAgICBdLmZvckVhY2goZXh0ID0+IGV4dChtb2RlLCBwYXJlbnQpKTtcblxuICAgIG1vZGUuaXNDb21waWxlZCA9IHRydWU7XG5cbiAgICBsZXQga2V5d29yZFBhdHRlcm4gPSBudWxsO1xuICAgIGlmICh0eXBlb2YgbW9kZS5rZXl3b3JkcyA9PT0gXCJvYmplY3RcIiAmJiBtb2RlLmtleXdvcmRzLiRwYXR0ZXJuKSB7XG4gICAgICAvLyB3ZSBuZWVkIGEgY29weSBiZWNhdXNlIGtleXdvcmRzIG1pZ2h0IGJlIGNvbXBpbGVkIG11bHRpcGxlIHRpbWVzXG4gICAgICAvLyBzbyB3ZSBjYW4ndCBnbyBkZWxldGluZyAkcGF0dGVybiBmcm9tIHRoZSBvcmlnaW5hbCBvbiB0aGUgZmlyc3RcbiAgICAgIC8vIHBhc3NcbiAgICAgIG1vZGUua2V5d29yZHMgPSBPYmplY3QuYXNzaWduKHt9LCBtb2RlLmtleXdvcmRzKTtcbiAgICAgIGtleXdvcmRQYXR0ZXJuID0gbW9kZS5rZXl3b3Jkcy4kcGF0dGVybjtcbiAgICAgIGRlbGV0ZSBtb2RlLmtleXdvcmRzLiRwYXR0ZXJuO1xuICAgIH1cbiAgICBrZXl3b3JkUGF0dGVybiA9IGtleXdvcmRQYXR0ZXJuIHx8IC9cXHcrLztcblxuICAgIGlmIChtb2RlLmtleXdvcmRzKSB7XG4gICAgICBtb2RlLmtleXdvcmRzID0gY29tcGlsZUtleXdvcmRzKG1vZGUua2V5d29yZHMsIGxhbmd1YWdlLmNhc2VfaW5zZW5zaXRpdmUpO1xuICAgIH1cblxuICAgIGNtb2RlLmtleXdvcmRQYXR0ZXJuUmUgPSBsYW5nUmUoa2V5d29yZFBhdHRlcm4sIHRydWUpO1xuXG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgaWYgKCFtb2RlLmJlZ2luKSBtb2RlLmJlZ2luID0gL1xcQnxcXGIvO1xuICAgICAgY21vZGUuYmVnaW5SZSA9IGxhbmdSZShjbW9kZS5iZWdpbik7XG4gICAgICBpZiAoIW1vZGUuZW5kICYmICFtb2RlLmVuZHNXaXRoUGFyZW50KSBtb2RlLmVuZCA9IC9cXEJ8XFxiLztcbiAgICAgIGlmIChtb2RlLmVuZCkgY21vZGUuZW5kUmUgPSBsYW5nUmUoY21vZGUuZW5kKTtcbiAgICAgIGNtb2RlLnRlcm1pbmF0b3JFbmQgPSBzb3VyY2UoY21vZGUuZW5kKSB8fCAnJztcbiAgICAgIGlmIChtb2RlLmVuZHNXaXRoUGFyZW50ICYmIHBhcmVudC50ZXJtaW5hdG9yRW5kKSB7XG4gICAgICAgIGNtb2RlLnRlcm1pbmF0b3JFbmQgKz0gKG1vZGUuZW5kID8gJ3wnIDogJycpICsgcGFyZW50LnRlcm1pbmF0b3JFbmQ7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChtb2RlLmlsbGVnYWwpIGNtb2RlLmlsbGVnYWxSZSA9IGxhbmdSZSgvKiogQHR5cGUge1JlZ0V4cCB8IHN0cmluZ30gKi8gKG1vZGUuaWxsZWdhbCkpO1xuICAgIGlmICghbW9kZS5jb250YWlucykgbW9kZS5jb250YWlucyA9IFtdO1xuXG4gICAgbW9kZS5jb250YWlucyA9IFtdLmNvbmNhdCguLi5tb2RlLmNvbnRhaW5zLm1hcChmdW5jdGlvbihjKSB7XG4gICAgICByZXR1cm4gZXhwYW5kT3JDbG9uZU1vZGUoYyA9PT0gJ3NlbGYnID8gbW9kZSA6IGMpO1xuICAgIH0pKTtcbiAgICBtb2RlLmNvbnRhaW5zLmZvckVhY2goZnVuY3Rpb24oYykgeyBjb21waWxlTW9kZSgvKiogQHR5cGUgTW9kZSAqLyAoYyksIGNtb2RlKTsgfSk7XG5cbiAgICBpZiAobW9kZS5zdGFydHMpIHtcbiAgICAgIGNvbXBpbGVNb2RlKG1vZGUuc3RhcnRzLCBwYXJlbnQpO1xuICAgIH1cblxuICAgIGNtb2RlLm1hdGNoZXIgPSBidWlsZE1vZGVSZWdleChjbW9kZSk7XG4gICAgcmV0dXJuIGNtb2RlO1xuICB9XG5cbiAgaWYgKCFsYW5ndWFnZS5jb21waWxlckV4dGVuc2lvbnMpIGxhbmd1YWdlLmNvbXBpbGVyRXh0ZW5zaW9ucyA9IFtdO1xuXG4gIC8vIHNlbGYgaXMgbm90IHZhbGlkIGF0IHRoZSB0b3AtbGV2ZWxcbiAgaWYgKGxhbmd1YWdlLmNvbnRhaW5zICYmIGxhbmd1YWdlLmNvbnRhaW5zLmluY2x1ZGVzKCdzZWxmJykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJFUlI6IGNvbnRhaW5zIGBzZWxmYCBpcyBub3Qgc3VwcG9ydGVkIGF0IHRoZSB0b3AtbGV2ZWwgb2YgYSBsYW5ndWFnZS4gIFNlZSBkb2N1bWVudGF0aW9uLlwiKTtcbiAgfVxuXG4gIC8vIHdlIG5lZWQgYSBudWxsIG9iamVjdCwgd2hpY2ggaW5oZXJpdCB3aWxsIGd1YXJhbnRlZVxuICBsYW5ndWFnZS5jbGFzc05hbWVBbGlhc2VzID0gaW5oZXJpdCQxKGxhbmd1YWdlLmNsYXNzTmFtZUFsaWFzZXMgfHwge30pO1xuXG4gIHJldHVybiBjb21waWxlTW9kZSgvKiogQHR5cGUgTW9kZSAqLyAobGFuZ3VhZ2UpKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIGEgbW9kZSBoYXMgYSBkZXBlbmRlbmN5IG9uIGl0J3MgcGFyZW50IG9yIG5vdFxuICpcbiAqIElmIGEgbW9kZSBkb2VzIGhhdmUgYSBwYXJlbnQgZGVwZW5kZW5jeSB0aGVuIG9mdGVuIHdlIG5lZWQgdG8gY2xvbmUgaXQgaWZcbiAqIGl0J3MgdXNlZCBpbiBtdWx0aXBsZSBwbGFjZXMgc28gdGhhdCBlYWNoIGNvcHkgcG9pbnRzIHRvIHRoZSBjb3JyZWN0IHBhcmVudCxcbiAqIHdoZXJlLWFzIG1vZGVzIHdpdGhvdXQgYSBwYXJlbnQgY2FuIG9mdGVuIHNhZmVseSBiZSByZS11c2VkIGF0IHRoZSBib3R0b20gb2ZcbiAqIGEgbW9kZSBjaGFpbi5cbiAqXG4gKiBAcGFyYW0ge01vZGUgfCBudWxsfSBtb2RlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBpcyB0aGVyZSBhIGRlcGVuZGVuY3kgb24gdGhlIHBhcmVudD9cbiAqICovXG5mdW5jdGlvbiBkZXBlbmRlbmN5T25QYXJlbnQobW9kZSkge1xuICBpZiAoIW1vZGUpIHJldHVybiBmYWxzZTtcblxuICByZXR1cm4gbW9kZS5lbmRzV2l0aFBhcmVudCB8fCBkZXBlbmRlbmN5T25QYXJlbnQobW9kZS5zdGFydHMpO1xufVxuXG4vKipcbiAqIEV4cGFuZHMgYSBtb2RlIG9yIGNsb25lcyBpdCBpZiBuZWNlc3NhcnlcbiAqXG4gKiBUaGlzIGlzIG5lY2Vzc2FyeSBmb3IgbW9kZXMgd2l0aCBwYXJlbnRhbCBkZXBlbmRlbmNlaXMgKHNlZSBub3RlcyBvblxuICogYGRlcGVuZGVuY3lPblBhcmVudGApIGFuZCBmb3Igbm9kZXMgdGhhdCBoYXZlIGB2YXJpYW50c2AgLSB3aGljaCBtdXN0IHRoZW4gYmVcbiAqIGV4cGxvZGVkIGludG8gdGhlaXIgb3duIGluZGl2aWR1YWwgbW9kZXMgYXQgY29tcGlsZSB0aW1lLlxuICpcbiAqIEBwYXJhbSB7TW9kZX0gbW9kZVxuICogQHJldHVybnMge01vZGUgfCBNb2RlW119XG4gKiAqL1xuZnVuY3Rpb24gZXhwYW5kT3JDbG9uZU1vZGUobW9kZSkge1xuICBpZiAobW9kZS52YXJpYW50cyAmJiAhbW9kZS5jYWNoZWRWYXJpYW50cykge1xuICAgIG1vZGUuY2FjaGVkVmFyaWFudHMgPSBtb2RlLnZhcmlhbnRzLm1hcChmdW5jdGlvbih2YXJpYW50KSB7XG4gICAgICByZXR1cm4gaW5oZXJpdCQxKG1vZGUsIHsgdmFyaWFudHM6IG51bGwgfSwgdmFyaWFudCk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBFWFBBTkRcbiAgLy8gaWYgd2UgaGF2ZSB2YXJpYW50cyB0aGVuIGVzc2VudGlhbGx5IFwicmVwbGFjZVwiIHRoZSBtb2RlIHdpdGggdGhlIHZhcmlhbnRzXG4gIC8vIHRoaXMgaGFwcGVucyBpbiBjb21waWxlTW9kZSwgd2hlcmUgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgZnJvbVxuICBpZiAobW9kZS5jYWNoZWRWYXJpYW50cykge1xuICAgIHJldHVybiBtb2RlLmNhY2hlZFZhcmlhbnRzO1xuICB9XG5cbiAgLy8gQ0xPTkVcbiAgLy8gaWYgd2UgaGF2ZSBkZXBlbmRlbmNpZXMgb24gcGFyZW50cyB0aGVuIHdlIG5lZWQgYSB1bmlxdWVcbiAgLy8gaW5zdGFuY2Ugb2Ygb3Vyc2VsdmVzLCBzbyB3ZSBjYW4gYmUgcmV1c2VkIHdpdGggbWFueVxuICAvLyBkaWZmZXJlbnQgcGFyZW50cyB3aXRob3V0IGlzc3VlXG4gIGlmIChkZXBlbmRlbmN5T25QYXJlbnQobW9kZSkpIHtcbiAgICByZXR1cm4gaW5oZXJpdCQxKG1vZGUsIHsgc3RhcnRzOiBtb2RlLnN0YXJ0cyA/IGluaGVyaXQkMShtb2RlLnN0YXJ0cykgOiBudWxsIH0pO1xuICB9XG5cbiAgaWYgKE9iamVjdC5pc0Zyb3plbihtb2RlKSkge1xuICAgIHJldHVybiBpbmhlcml0JDEobW9kZSk7XG4gIH1cblxuICAvLyBubyBzcGVjaWFsIGRlcGVuZGVuY3kgaXNzdWVzLCBqdXN0IHJldHVybiBvdXJzZWx2ZXNcbiAgcmV0dXJuIG1vZGU7XG59XG5cbnZhciB2ZXJzaW9uID0gXCIxMS4xMC4wXCI7XG5cbmNsYXNzIEhUTUxJbmplY3Rpb25FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IocmVhc29uLCBodG1sKSB7XG4gICAgc3VwZXIocmVhc29uKTtcbiAgICB0aGlzLm5hbWUgPSBcIkhUTUxJbmplY3Rpb25FcnJvclwiO1xuICAgIHRoaXMuaHRtbCA9IGh0bWw7XG4gIH1cbn1cblxuLypcblN5bnRheCBoaWdobGlnaHRpbmcgd2l0aCBsYW5ndWFnZSBhdXRvZGV0ZWN0aW9uLlxuaHR0cHM6Ly9oaWdobGlnaHRqcy5vcmcvXG4qL1xuXG5cblxuLyoqXG5AdHlwZWRlZiB7aW1wb3J0KCdoaWdobGlnaHQuanMnKS5Nb2RlfSBNb2RlXG5AdHlwZWRlZiB7aW1wb3J0KCdoaWdobGlnaHQuanMnKS5Db21waWxlZE1vZGV9IENvbXBpbGVkTW9kZVxuQHR5cGVkZWYge2ltcG9ydCgnaGlnaGxpZ2h0LmpzJykuQ29tcGlsZWRTY29wZX0gQ29tcGlsZWRTY29wZVxuQHR5cGVkZWYge2ltcG9ydCgnaGlnaGxpZ2h0LmpzJykuTGFuZ3VhZ2V9IExhbmd1YWdlXG5AdHlwZWRlZiB7aW1wb3J0KCdoaWdobGlnaHQuanMnKS5ITEpTQXBpfSBITEpTQXBpXG5AdHlwZWRlZiB7aW1wb3J0KCdoaWdobGlnaHQuanMnKS5ITEpTUGx1Z2lufSBITEpTUGx1Z2luXG5AdHlwZWRlZiB7aW1wb3J0KCdoaWdobGlnaHQuanMnKS5QbHVnaW5FdmVudH0gUGx1Z2luRXZlbnRcbkB0eXBlZGVmIHtpbXBvcnQoJ2hpZ2hsaWdodC5qcycpLkhMSlNPcHRpb25zfSBITEpTT3B0aW9uc1xuQHR5cGVkZWYge2ltcG9ydCgnaGlnaGxpZ2h0LmpzJykuTGFuZ3VhZ2VGbn0gTGFuZ3VhZ2VGblxuQHR5cGVkZWYge2ltcG9ydCgnaGlnaGxpZ2h0LmpzJykuSGlnaGxpZ2h0ZWRIVE1MRWxlbWVudH0gSGlnaGxpZ2h0ZWRIVE1MRWxlbWVudFxuQHR5cGVkZWYge2ltcG9ydCgnaGlnaGxpZ2h0LmpzJykuQmVmb3JlSGlnaGxpZ2h0Q29udGV4dH0gQmVmb3JlSGlnaGxpZ2h0Q29udGV4dFxuQHR5cGVkZWYge2ltcG9ydCgnaGlnaGxpZ2h0LmpzL3ByaXZhdGUnKS5NYXRjaFR5cGV9IE1hdGNoVHlwZVxuQHR5cGVkZWYge2ltcG9ydCgnaGlnaGxpZ2h0LmpzL3ByaXZhdGUnKS5LZXl3b3JkRGF0YX0gS2V5d29yZERhdGFcbkB0eXBlZGVmIHtpbXBvcnQoJ2hpZ2hsaWdodC5qcy9wcml2YXRlJykuRW5oYW5jZWRNYXRjaH0gRW5oYW5jZWRNYXRjaFxuQHR5cGVkZWYge2ltcG9ydCgnaGlnaGxpZ2h0LmpzL3ByaXZhdGUnKS5Bbm5vdGF0ZWRFcnJvcn0gQW5ub3RhdGVkRXJyb3JcbkB0eXBlZGVmIHtpbXBvcnQoJ2hpZ2hsaWdodC5qcycpLkF1dG9IaWdobGlnaHRSZXN1bHR9IEF1dG9IaWdobGlnaHRSZXN1bHRcbkB0eXBlZGVmIHtpbXBvcnQoJ2hpZ2hsaWdodC5qcycpLkhpZ2hsaWdodE9wdGlvbnN9IEhpZ2hsaWdodE9wdGlvbnNcbkB0eXBlZGVmIHtpbXBvcnQoJ2hpZ2hsaWdodC5qcycpLkhpZ2hsaWdodFJlc3VsdH0gSGlnaGxpZ2h0UmVzdWx0XG4qL1xuXG5cbmNvbnN0IGVzY2FwZSA9IGVzY2FwZUhUTUw7XG5jb25zdCBpbmhlcml0ID0gaW5oZXJpdCQxO1xuY29uc3QgTk9fTUFUQ0ggPSBTeW1ib2woXCJub21hdGNoXCIpO1xuY29uc3QgTUFYX0tFWVdPUkRfSElUUyA9IDc7XG5cbi8qKlxuICogQHBhcmFtIHthbnl9IGhsanMgLSBvYmplY3QgdGhhdCBpcyBleHRlbmRlZCAobGVnYWN5KVxuICogQHJldHVybnMge0hMSlNBcGl9XG4gKi9cbmNvbnN0IEhMSlMgPSBmdW5jdGlvbihobGpzKSB7XG4gIC8vIEdsb2JhbCBpbnRlcm5hbCB2YXJpYWJsZXMgdXNlZCB3aXRoaW4gdGhlIGhpZ2hsaWdodC5qcyBsaWJyYXJ5LlxuICAvKiogQHR5cGUge1JlY29yZDxzdHJpbmcsIExhbmd1YWdlPn0gKi9cbiAgY29uc3QgbGFuZ3VhZ2VzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgLyoqIEB0eXBlIHtSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+fSAqL1xuICBjb25zdCBhbGlhc2VzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgLyoqIEB0eXBlIHtITEpTUGx1Z2luW119ICovXG4gIGNvbnN0IHBsdWdpbnMgPSBbXTtcblxuICAvLyBzYWZlL3Byb2R1Y3Rpb24gbW9kZSAtIHN3YWxsb3dzIG1vcmUgZXJyb3JzLCB0cmllcyB0byBrZWVwIHJ1bm5pbmdcbiAgLy8gZXZlbiBpZiBhIHNpbmdsZSBzeW50YXggb3IgcGFyc2UgaGl0cyBhIGZhdGFsIGVycm9yXG4gIGxldCBTQUZFX01PREUgPSB0cnVlO1xuICBjb25zdCBMQU5HVUFHRV9OT1RfRk9VTkQgPSBcIkNvdWxkIG5vdCBmaW5kIHRoZSBsYW5ndWFnZSAne30nLCBkaWQgeW91IGZvcmdldCB0byBsb2FkL2luY2x1ZGUgYSBsYW5ndWFnZSBtb2R1bGU/XCI7XG4gIC8qKiBAdHlwZSB7TGFuZ3VhZ2V9ICovXG4gIGNvbnN0IFBMQUlOVEVYVF9MQU5HVUFHRSA9IHsgZGlzYWJsZUF1dG9kZXRlY3Q6IHRydWUsIG5hbWU6ICdQbGFpbiB0ZXh0JywgY29udGFpbnM6IFtdIH07XG5cbiAgLy8gR2xvYmFsIG9wdGlvbnMgdXNlZCB3aGVuIHdpdGhpbiBleHRlcm5hbCBBUElzLiBUaGlzIGlzIG1vZGlmaWVkIHdoZW5cbiAgLy8gY2FsbGluZyB0aGUgYGhsanMuY29uZmlndXJlYCBmdW5jdGlvbi5cbiAgLyoqIEB0eXBlIEhMSlNPcHRpb25zICovXG4gIGxldCBvcHRpb25zID0ge1xuICAgIGlnbm9yZVVuZXNjYXBlZEhUTUw6IGZhbHNlLFxuICAgIHRocm93VW5lc2NhcGVkSFRNTDogZmFsc2UsXG4gICAgbm9IaWdobGlnaHRSZTogL14obm8tP2hpZ2hsaWdodCkkL2ksXG4gICAgbGFuZ3VhZ2VEZXRlY3RSZTogL1xcYmxhbmcoPzp1YWdlKT8tKFtcXHctXSspXFxiL2ksXG4gICAgY2xhc3NQcmVmaXg6ICdobGpzLScsXG4gICAgY3NzU2VsZWN0b3I6ICdwcmUgY29kZScsXG4gICAgbGFuZ3VhZ2VzOiBudWxsLFxuICAgIC8vIGJldGEgY29uZmlndXJhdGlvbiBvcHRpb25zLCBzdWJqZWN0IHRvIGNoYW5nZSwgd2VsY29tZSB0byBkaXNjdXNzXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2hpZ2hsaWdodGpzL2hpZ2hsaWdodC5qcy9pc3N1ZXMvMTA4NlxuICAgIF9fZW1pdHRlcjogVG9rZW5UcmVlRW1pdHRlclxuICB9O1xuXG4gIC8qIFV0aWxpdHkgZnVuY3Rpb25zICovXG5cbiAgLyoqXG4gICAqIFRlc3RzIGEgbGFuZ3VhZ2UgbmFtZSB0byBzZWUgaWYgaGlnaGxpZ2h0aW5nIHNob3VsZCBiZSBza2lwcGVkXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBsYW5ndWFnZU5hbWVcbiAgICovXG4gIGZ1bmN0aW9uIHNob3VsZE5vdEhpZ2hsaWdodChsYW5ndWFnZU5hbWUpIHtcbiAgICByZXR1cm4gb3B0aW9ucy5ub0hpZ2hsaWdodFJlLnRlc3QobGFuZ3VhZ2VOYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0hpZ2hsaWdodGVkSFRNTEVsZW1lbnR9IGJsb2NrIC0gdGhlIEhUTUwgZWxlbWVudCB0byBkZXRlcm1pbmUgbGFuZ3VhZ2UgZm9yXG4gICAqL1xuICBmdW5jdGlvbiBibG9ja0xhbmd1YWdlKGJsb2NrKSB7XG4gICAgbGV0IGNsYXNzZXMgPSBibG9jay5jbGFzc05hbWUgKyAnICc7XG5cbiAgICBjbGFzc2VzICs9IGJsb2NrLnBhcmVudE5vZGUgPyBibG9jay5wYXJlbnROb2RlLmNsYXNzTmFtZSA6ICcnO1xuXG4gICAgLy8gbGFuZ3VhZ2UtKiB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgbm9uLXByZWZpeGVkIGNsYXNzIG5hbWVzLlxuICAgIGNvbnN0IG1hdGNoID0gb3B0aW9ucy5sYW5ndWFnZURldGVjdFJlLmV4ZWMoY2xhc3Nlcyk7XG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICBjb25zdCBsYW5ndWFnZSA9IGdldExhbmd1YWdlKG1hdGNoWzFdKTtcbiAgICAgIGlmICghbGFuZ3VhZ2UpIHtcbiAgICAgICAgd2FybihMQU5HVUFHRV9OT1RfRk9VTkQucmVwbGFjZShcInt9XCIsIG1hdGNoWzFdKSk7XG4gICAgICAgIHdhcm4oXCJGYWxsaW5nIGJhY2sgdG8gbm8taGlnaGxpZ2h0IG1vZGUgZm9yIHRoaXMgYmxvY2suXCIsIGJsb2NrKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsYW5ndWFnZSA/IG1hdGNoWzFdIDogJ25vLWhpZ2hsaWdodCc7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNsYXNzZXNcbiAgICAgIC5zcGxpdCgvXFxzKy8pXG4gICAgICAuZmluZCgoX2NsYXNzKSA9PiBzaG91bGROb3RIaWdobGlnaHQoX2NsYXNzKSB8fCBnZXRMYW5ndWFnZShfY2xhc3MpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb3JlIGhpZ2hsaWdodGluZyBmdW5jdGlvbi5cbiAgICpcbiAgICogT0xEIEFQSVxuICAgKiBoaWdobGlnaHQobGFuZywgY29kZSwgaWdub3JlSWxsZWdhbHMsIGNvbnRpbnVhdGlvbilcbiAgICpcbiAgICogTkVXIEFQSVxuICAgKiBoaWdobGlnaHQoY29kZSwge2xhbmcsIGlnbm9yZUlsbGVnYWxzfSlcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGNvZGVPckxhbmd1YWdlTmFtZSAtIHRoZSBsYW5ndWFnZSB0byB1c2UgZm9yIGhpZ2hsaWdodGluZ1xuICAgKiBAcGFyYW0ge3N0cmluZyB8IEhpZ2hsaWdodE9wdGlvbnN9IG9wdGlvbnNPckNvZGUgLSB0aGUgY29kZSB0byBoaWdobGlnaHRcbiAgICogQHBhcmFtIHtib29sZWFufSBbaWdub3JlSWxsZWdhbHNdIC0gd2hldGhlciB0byBpZ25vcmUgaWxsZWdhbCBtYXRjaGVzLCBkZWZhdWx0IGlzIHRvIGJhaWxcbiAgICpcbiAgICogQHJldHVybnMge0hpZ2hsaWdodFJlc3VsdH0gUmVzdWx0IC0gYW4gb2JqZWN0IHRoYXQgcmVwcmVzZW50cyB0aGUgcmVzdWx0XG4gICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBsYW5ndWFnZSAtIHRoZSBsYW5ndWFnZSBuYW1lXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSByZWxldmFuY2UgLSB0aGUgcmVsZXZhbmNlIHNjb3JlXG4gICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2YWx1ZSAtIHRoZSBoaWdobGlnaHRlZCBIVE1MIGNvZGVcbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IGNvZGUgLSB0aGUgb3JpZ2luYWwgcmF3IGNvZGVcbiAgICogQHByb3BlcnR5IHtDb21waWxlZE1vZGV9IHRvcCAtIHRvcCBvZiB0aGUgY3VycmVudCBtb2RlIHN0YWNrXG4gICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gaWxsZWdhbCAtIGluZGljYXRlcyB3aGV0aGVyIGFueSBpbGxlZ2FsIG1hdGNoZXMgd2VyZSBmb3VuZFxuICAqL1xuICBmdW5jdGlvbiBoaWdobGlnaHQoY29kZU9yTGFuZ3VhZ2VOYW1lLCBvcHRpb25zT3JDb2RlLCBpZ25vcmVJbGxlZ2Fscykge1xuICAgIGxldCBjb2RlID0gXCJcIjtcbiAgICBsZXQgbGFuZ3VhZ2VOYW1lID0gXCJcIjtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnNPckNvZGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIGNvZGUgPSBjb2RlT3JMYW5ndWFnZU5hbWU7XG4gICAgICBpZ25vcmVJbGxlZ2FscyA9IG9wdGlvbnNPckNvZGUuaWdub3JlSWxsZWdhbHM7XG4gICAgICBsYW5ndWFnZU5hbWUgPSBvcHRpb25zT3JDb2RlLmxhbmd1YWdlO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBvbGQgQVBJXG4gICAgICBkZXByZWNhdGVkKFwiMTAuNy4wXCIsIFwiaGlnaGxpZ2h0KGxhbmcsIGNvZGUsIC4uLmFyZ3MpIGhhcyBiZWVuIGRlcHJlY2F0ZWQuXCIpO1xuICAgICAgZGVwcmVjYXRlZChcIjEwLjcuMFwiLCBcIlBsZWFzZSB1c2UgaGlnaGxpZ2h0KGNvZGUsIG9wdGlvbnMpIGluc3RlYWQuXFxuaHR0cHM6Ly9naXRodWIuY29tL2hpZ2hsaWdodGpzL2hpZ2hsaWdodC5qcy9pc3N1ZXMvMjI3N1wiKTtcbiAgICAgIGxhbmd1YWdlTmFtZSA9IGNvZGVPckxhbmd1YWdlTmFtZTtcbiAgICAgIGNvZGUgPSBvcHRpb25zT3JDb2RlO1xuICAgIH1cblxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9oaWdobGlnaHRqcy9oaWdobGlnaHQuanMvaXNzdWVzLzMxNDlcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZpbmVkXG4gICAgaWYgKGlnbm9yZUlsbGVnYWxzID09PSB1bmRlZmluZWQpIHsgaWdub3JlSWxsZWdhbHMgPSB0cnVlOyB9XG5cbiAgICAvKiogQHR5cGUge0JlZm9yZUhpZ2hsaWdodENvbnRleHR9ICovXG4gICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgIGNvZGUsXG4gICAgICBsYW5ndWFnZTogbGFuZ3VhZ2VOYW1lXG4gICAgfTtcbiAgICAvLyB0aGUgcGx1Z2luIGNhbiBjaGFuZ2UgdGhlIGRlc2lyZWQgbGFuZ3VhZ2Ugb3IgdGhlIGNvZGUgdG8gYmUgaGlnaGxpZ2h0ZWRcbiAgICAvLyBqdXN0IGJlIGNoYW5naW5nIHRoZSBvYmplY3QgaXQgd2FzIHBhc3NlZFxuICAgIGZpcmUoXCJiZWZvcmU6aGlnaGxpZ2h0XCIsIGNvbnRleHQpO1xuXG4gICAgLy8gYSBiZWZvcmUgcGx1Z2luIGNhbiB1c3VycCB0aGUgcmVzdWx0IGNvbXBsZXRlbHkgYnkgcHJvdmlkaW5nIGl0J3Mgb3duXG4gICAgLy8gaW4gd2hpY2ggY2FzZSB3ZSBkb24ndCBldmVuIG5lZWQgdG8gY2FsbCBoaWdobGlnaHRcbiAgICBjb25zdCByZXN1bHQgPSBjb250ZXh0LnJlc3VsdFxuICAgICAgPyBjb250ZXh0LnJlc3VsdFxuICAgICAgOiBfaGlnaGxpZ2h0KGNvbnRleHQubGFuZ3VhZ2UsIGNvbnRleHQuY29kZSwgaWdub3JlSWxsZWdhbHMpO1xuXG4gICAgcmVzdWx0LmNvZGUgPSBjb250ZXh0LmNvZGU7XG4gICAgLy8gdGhlIHBsdWdpbiBjYW4gY2hhbmdlIGFueXRoaW5nIGluIHJlc3VsdCB0byBzdWl0ZSBpdFxuICAgIGZpcmUoXCJhZnRlcjpoaWdobGlnaHRcIiwgcmVzdWx0KTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogcHJpdmF0ZSBoaWdobGlnaHQgdGhhdCdzIHVzZWQgaW50ZXJuYWxseSBhbmQgZG9lcyBub3QgZmlyZSBjYWxsYmFja3NcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGxhbmd1YWdlTmFtZSAtIHRoZSBsYW5ndWFnZSB0byB1c2UgZm9yIGhpZ2hsaWdodGluZ1xuICAgKiBAcGFyYW0ge3N0cmluZ30gY29kZVRvSGlnaGxpZ2h0IC0gdGhlIGNvZGUgdG8gaGlnaGxpZ2h0XG4gICAqIEBwYXJhbSB7Ym9vbGVhbj99IFtpZ25vcmVJbGxlZ2Fsc10gLSB3aGV0aGVyIHRvIGlnbm9yZSBpbGxlZ2FsIG1hdGNoZXMsIGRlZmF1bHQgaXMgdG8gYmFpbFxuICAgKiBAcGFyYW0ge0NvbXBpbGVkTW9kZT99IFtjb250aW51YXRpb25dIC0gY3VycmVudCBjb250aW51YXRpb24gbW9kZSwgaWYgYW55XG4gICAqIEByZXR1cm5zIHtIaWdobGlnaHRSZXN1bHR9IC0gcmVzdWx0IG9mIHRoZSBoaWdobGlnaHQgb3BlcmF0aW9uXG4gICovXG4gIGZ1bmN0aW9uIF9oaWdobGlnaHQobGFuZ3VhZ2VOYW1lLCBjb2RlVG9IaWdobGlnaHQsIGlnbm9yZUlsbGVnYWxzLCBjb250aW51YXRpb24pIHtcbiAgICBjb25zdCBrZXl3b3JkSGl0cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4ga2V5d29yZCBkYXRhIGlmIGEgbWF0Y2ggaXMgYSBrZXl3b3JkXG4gICAgICogQHBhcmFtIHtDb21waWxlZE1vZGV9IG1vZGUgLSBjdXJyZW50IG1vZGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbWF0Y2hUZXh0IC0gdGhlIHRleHR1YWwgbWF0Y2hcbiAgICAgKiBAcmV0dXJucyB7S2V5d29yZERhdGEgfCBmYWxzZX1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBrZXl3b3JkRGF0YShtb2RlLCBtYXRjaFRleHQpIHtcbiAgICAgIHJldHVybiBtb2RlLmtleXdvcmRzW21hdGNoVGV4dF07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJvY2Vzc0tleXdvcmRzKCkge1xuICAgICAgaWYgKCF0b3Aua2V5d29yZHMpIHtcbiAgICAgICAgZW1pdHRlci5hZGRUZXh0KG1vZGVCdWZmZXIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxldCBsYXN0SW5kZXggPSAwO1xuICAgICAgdG9wLmtleXdvcmRQYXR0ZXJuUmUubGFzdEluZGV4ID0gMDtcbiAgICAgIGxldCBtYXRjaCA9IHRvcC5rZXl3b3JkUGF0dGVyblJlLmV4ZWMobW9kZUJ1ZmZlcik7XG4gICAgICBsZXQgYnVmID0gXCJcIjtcblxuICAgICAgd2hpbGUgKG1hdGNoKSB7XG4gICAgICAgIGJ1ZiArPSBtb2RlQnVmZmVyLnN1YnN0cmluZyhsYXN0SW5kZXgsIG1hdGNoLmluZGV4KTtcbiAgICAgICAgY29uc3Qgd29yZCA9IGxhbmd1YWdlLmNhc2VfaW5zZW5zaXRpdmUgPyBtYXRjaFswXS50b0xvd2VyQ2FzZSgpIDogbWF0Y2hbMF07XG4gICAgICAgIGNvbnN0IGRhdGEgPSBrZXl3b3JkRGF0YSh0b3AsIHdvcmQpO1xuICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgIGNvbnN0IFtraW5kLCBrZXl3b3JkUmVsZXZhbmNlXSA9IGRhdGE7XG4gICAgICAgICAgZW1pdHRlci5hZGRUZXh0KGJ1Zik7XG4gICAgICAgICAgYnVmID0gXCJcIjtcblxuICAgICAgICAgIGtleXdvcmRIaXRzW3dvcmRdID0gKGtleXdvcmRIaXRzW3dvcmRdIHx8IDApICsgMTtcbiAgICAgICAgICBpZiAoa2V5d29yZEhpdHNbd29yZF0gPD0gTUFYX0tFWVdPUkRfSElUUykgcmVsZXZhbmNlICs9IGtleXdvcmRSZWxldmFuY2U7XG4gICAgICAgICAgaWYgKGtpbmQuc3RhcnRzV2l0aChcIl9cIikpIHtcbiAgICAgICAgICAgIC8vIF8gaW1wbGllZCBmb3IgcmVsZXZhbmNlIG9ubHksIGRvIG5vdCBoaWdobGlnaHRcbiAgICAgICAgICAgIC8vIGJ5IGFwcGx5aW5nIGEgY2xhc3MgbmFtZVxuICAgICAgICAgICAgYnVmICs9IG1hdGNoWzBdO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBjc3NDbGFzcyA9IGxhbmd1YWdlLmNsYXNzTmFtZUFsaWFzZXNba2luZF0gfHwga2luZDtcbiAgICAgICAgICAgIGVtaXRLZXl3b3JkKG1hdGNoWzBdLCBjc3NDbGFzcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJ1ZiArPSBtYXRjaFswXTtcbiAgICAgICAgfVxuICAgICAgICBsYXN0SW5kZXggPSB0b3Aua2V5d29yZFBhdHRlcm5SZS5sYXN0SW5kZXg7XG4gICAgICAgIG1hdGNoID0gdG9wLmtleXdvcmRQYXR0ZXJuUmUuZXhlYyhtb2RlQnVmZmVyKTtcbiAgICAgIH1cbiAgICAgIGJ1ZiArPSBtb2RlQnVmZmVyLnN1YnN0cmluZyhsYXN0SW5kZXgpO1xuICAgICAgZW1pdHRlci5hZGRUZXh0KGJ1Zik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJvY2Vzc1N1Ykxhbmd1YWdlKCkge1xuICAgICAgaWYgKG1vZGVCdWZmZXIgPT09IFwiXCIpIHJldHVybjtcbiAgICAgIC8qKiBAdHlwZSBIaWdobGlnaHRSZXN1bHQgKi9cbiAgICAgIGxldCByZXN1bHQgPSBudWxsO1xuXG4gICAgICBpZiAodHlwZW9mIHRvcC5zdWJMYW5ndWFnZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKCFsYW5ndWFnZXNbdG9wLnN1Ykxhbmd1YWdlXSkge1xuICAgICAgICAgIGVtaXR0ZXIuYWRkVGV4dChtb2RlQnVmZmVyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gX2hpZ2hsaWdodCh0b3Auc3ViTGFuZ3VhZ2UsIG1vZGVCdWZmZXIsIHRydWUsIGNvbnRpbnVhdGlvbnNbdG9wLnN1Ykxhbmd1YWdlXSk7XG4gICAgICAgIGNvbnRpbnVhdGlvbnNbdG9wLnN1Ykxhbmd1YWdlXSA9IC8qKiBAdHlwZSB7Q29tcGlsZWRNb2RlfSAqLyAocmVzdWx0Ll90b3ApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gaGlnaGxpZ2h0QXV0byhtb2RlQnVmZmVyLCB0b3Auc3ViTGFuZ3VhZ2UubGVuZ3RoID8gdG9wLnN1Ykxhbmd1YWdlIDogbnVsbCk7XG4gICAgICB9XG5cbiAgICAgIC8vIENvdW50aW5nIGVtYmVkZGVkIGxhbmd1YWdlIHNjb3JlIHRvd2FyZHMgdGhlIGhvc3QgbGFuZ3VhZ2UgbWF5IGJlIGRpc2FibGVkXG4gICAgICAvLyB3aXRoIHplcm9pbmcgdGhlIGNvbnRhaW5pbmcgbW9kZSByZWxldmFuY2UuIFVzZSBjYXNlIGluIHBvaW50IGlzIE1hcmtkb3duIHRoYXRcbiAgICAgIC8vIGFsbG93cyBYTUwgZXZlcnl3aGVyZSBhbmQgbWFrZXMgZXZlcnkgWE1MIHNuaXBwZXQgdG8gaGF2ZSBhIG11Y2ggbGFyZ2VyIE1hcmtkb3duXG4gICAgICAvLyBzY29yZS5cbiAgICAgIGlmICh0b3AucmVsZXZhbmNlID4gMCkge1xuICAgICAgICByZWxldmFuY2UgKz0gcmVzdWx0LnJlbGV2YW5jZTtcbiAgICAgIH1cbiAgICAgIGVtaXR0ZXIuX19hZGRTdWJsYW5ndWFnZShyZXN1bHQuX2VtaXR0ZXIsIHJlc3VsdC5sYW5ndWFnZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJvY2Vzc0J1ZmZlcigpIHtcbiAgICAgIGlmICh0b3Auc3ViTGFuZ3VhZ2UgIT0gbnVsbCkge1xuICAgICAgICBwcm9jZXNzU3ViTGFuZ3VhZ2UoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb2Nlc3NLZXl3b3JkcygpO1xuICAgICAgfVxuICAgICAgbW9kZUJ1ZmZlciA9ICcnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNjb3BlXG4gICAgICovXG4gICAgZnVuY3Rpb24gZW1pdEtleXdvcmQoa2V5d29yZCwgc2NvcGUpIHtcbiAgICAgIGlmIChrZXl3b3JkID09PSBcIlwiKSByZXR1cm47XG5cbiAgICAgIGVtaXR0ZXIuc3RhcnRTY29wZShzY29wZSk7XG4gICAgICBlbWl0dGVyLmFkZFRleHQoa2V5d29yZCk7XG4gICAgICBlbWl0dGVyLmVuZFNjb3BlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtDb21waWxlZFNjb3BlfSBzY29wZVxuICAgICAqIEBwYXJhbSB7UmVnRXhwTWF0Y2hBcnJheX0gbWF0Y2hcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBlbWl0TXVsdGlDbGFzcyhzY29wZSwgbWF0Y2gpIHtcbiAgICAgIGxldCBpID0gMTtcbiAgICAgIGNvbnN0IG1heCA9IG1hdGNoLmxlbmd0aCAtIDE7XG4gICAgICB3aGlsZSAoaSA8PSBtYXgpIHtcbiAgICAgICAgaWYgKCFzY29wZS5fZW1pdFtpXSkgeyBpKys7IGNvbnRpbnVlOyB9XG4gICAgICAgIGNvbnN0IGtsYXNzID0gbGFuZ3VhZ2UuY2xhc3NOYW1lQWxpYXNlc1tzY29wZVtpXV0gfHwgc2NvcGVbaV07XG4gICAgICAgIGNvbnN0IHRleHQgPSBtYXRjaFtpXTtcbiAgICAgICAgaWYgKGtsYXNzKSB7XG4gICAgICAgICAgZW1pdEtleXdvcmQodGV4dCwga2xhc3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1vZGVCdWZmZXIgPSB0ZXh0O1xuICAgICAgICAgIHByb2Nlc3NLZXl3b3JkcygpO1xuICAgICAgICAgIG1vZGVCdWZmZXIgPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGkrKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0NvbXBpbGVkTW9kZX0gbW9kZSAtIG5ldyBtb2RlIHRvIHN0YXJ0XG4gICAgICogQHBhcmFtIHtSZWdFeHBNYXRjaEFycmF5fSBtYXRjaFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHN0YXJ0TmV3TW9kZShtb2RlLCBtYXRjaCkge1xuICAgICAgaWYgKG1vZGUuc2NvcGUgJiYgdHlwZW9mIG1vZGUuc2NvcGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgZW1pdHRlci5vcGVuTm9kZShsYW5ndWFnZS5jbGFzc05hbWVBbGlhc2VzW21vZGUuc2NvcGVdIHx8IG1vZGUuc2NvcGUpO1xuICAgICAgfVxuICAgICAgaWYgKG1vZGUuYmVnaW5TY29wZSkge1xuICAgICAgICAvLyBiZWdpblNjb3BlIGp1c3Qgd3JhcHMgdGhlIGJlZ2luIG1hdGNoIGl0c2VsZiBpbiBhIHNjb3BlXG4gICAgICAgIGlmIChtb2RlLmJlZ2luU2NvcGUuX3dyYXApIHtcbiAgICAgICAgICBlbWl0S2V5d29yZChtb2RlQnVmZmVyLCBsYW5ndWFnZS5jbGFzc05hbWVBbGlhc2VzW21vZGUuYmVnaW5TY29wZS5fd3JhcF0gfHwgbW9kZS5iZWdpblNjb3BlLl93cmFwKTtcbiAgICAgICAgICBtb2RlQnVmZmVyID0gXCJcIjtcbiAgICAgICAgfSBlbHNlIGlmIChtb2RlLmJlZ2luU2NvcGUuX211bHRpKSB7XG4gICAgICAgICAgLy8gYXQgdGhpcyBwb2ludCBtb2RlQnVmZmVyIHNob3VsZCBqdXN0IGJlIHRoZSBtYXRjaFxuICAgICAgICAgIGVtaXRNdWx0aUNsYXNzKG1vZGUuYmVnaW5TY29wZSwgbWF0Y2gpO1xuICAgICAgICAgIG1vZGVCdWZmZXIgPSBcIlwiO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRvcCA9IE9iamVjdC5jcmVhdGUobW9kZSwgeyBwYXJlbnQ6IHsgdmFsdWU6IHRvcCB9IH0pO1xuICAgICAgcmV0dXJuIHRvcDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0NvbXBpbGVkTW9kZSB9IG1vZGUgLSB0aGUgbW9kZSB0byBwb3RlbnRpYWxseSBlbmRcbiAgICAgKiBAcGFyYW0ge1JlZ0V4cE1hdGNoQXJyYXl9IG1hdGNoIC0gdGhlIGxhdGVzdCBtYXRjaFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtYXRjaFBsdXNSZW1haW5kZXIgLSBtYXRjaCBwbHVzIHJlbWFpbmRlciBvZiBjb250ZW50XG4gICAgICogQHJldHVybnMge0NvbXBpbGVkTW9kZSB8IHZvaWR9IC0gdGhlIG5leHQgbW9kZSwgb3IgaWYgdm9pZCBjb250aW51ZSBvbiBpbiBjdXJyZW50IG1vZGVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBlbmRPZk1vZGUobW9kZSwgbWF0Y2gsIG1hdGNoUGx1c1JlbWFpbmRlcikge1xuICAgICAgbGV0IG1hdGNoZWQgPSBzdGFydHNXaXRoKG1vZGUuZW5kUmUsIG1hdGNoUGx1c1JlbWFpbmRlcik7XG5cbiAgICAgIGlmIChtYXRjaGVkKSB7XG4gICAgICAgIGlmIChtb2RlW1wib246ZW5kXCJdKSB7XG4gICAgICAgICAgY29uc3QgcmVzcCA9IG5ldyBSZXNwb25zZShtb2RlKTtcbiAgICAgICAgICBtb2RlW1wib246ZW5kXCJdKG1hdGNoLCByZXNwKTtcbiAgICAgICAgICBpZiAocmVzcC5pc01hdGNoSWdub3JlZCkgbWF0Y2hlZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1hdGNoZWQpIHtcbiAgICAgICAgICB3aGlsZSAobW9kZS5lbmRzUGFyZW50ICYmIG1vZGUucGFyZW50KSB7XG4gICAgICAgICAgICBtb2RlID0gbW9kZS5wYXJlbnQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBtb2RlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBldmVuIGlmIG9uOmVuZCBmaXJlcyBhbiBgaWdub3JlYCBpdCdzIHN0aWxsIHBvc3NpYmxlXG4gICAgICAvLyB0aGF0IHdlIG1pZ2h0IHRyaWdnZXIgdGhlIGVuZCBub2RlIGJlY2F1c2Ugb2YgYSBwYXJlbnQgbW9kZVxuICAgICAgaWYgKG1vZGUuZW5kc1dpdGhQYXJlbnQpIHtcbiAgICAgICAgcmV0dXJuIGVuZE9mTW9kZShtb2RlLnBhcmVudCwgbWF0Y2gsIG1hdGNoUGx1c1JlbWFpbmRlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlIG1hdGNoaW5nIGJ1dCB0aGVuIGlnbm9yaW5nIGEgc2VxdWVuY2Ugb2YgdGV4dFxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxleGVtZSAtIHN0cmluZyBjb250YWluaW5nIGZ1bGwgbWF0Y2ggdGV4dFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGRvSWdub3JlKGxleGVtZSkge1xuICAgICAgaWYgKHRvcC5tYXRjaGVyLnJlZ2V4SW5kZXggPT09IDApIHtcbiAgICAgICAgLy8gbm8gbW9yZSByZWdleGVzIHRvIHBvdGVudGlhbGx5IG1hdGNoIGhlcmUsIHNvIHdlIG1vdmUgdGhlIGN1cnNvciBmb3J3YXJkIG9uZVxuICAgICAgICAvLyBzcGFjZVxuICAgICAgICBtb2RlQnVmZmVyICs9IGxleGVtZVswXTtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBubyBuZWVkIHRvIG1vdmUgdGhlIGN1cnNvciwgd2Ugc3RpbGwgaGF2ZSBhZGRpdGlvbmFsIHJlZ2V4ZXMgdG8gdHJ5IGFuZFxuICAgICAgICAvLyBtYXRjaCBhdCB0aGlzIHZlcnkgc3BvdFxuICAgICAgICByZXN1bWVTY2FuQXRTYW1lUG9zaXRpb24gPSB0cnVlO1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgdGhlIHN0YXJ0IG9mIGEgbmV3IHBvdGVudGlhbCBtb2RlIG1hdGNoXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0VuaGFuY2VkTWF0Y2h9IG1hdGNoIC0gdGhlIGN1cnJlbnQgbWF0Y2hcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBob3cgZmFyIHRvIGFkdmFuY2UgdGhlIHBhcnNlIGN1cnNvclxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGRvQmVnaW5NYXRjaChtYXRjaCkge1xuICAgICAgY29uc3QgbGV4ZW1lID0gbWF0Y2hbMF07XG4gICAgICBjb25zdCBuZXdNb2RlID0gbWF0Y2gucnVsZTtcblxuICAgICAgY29uc3QgcmVzcCA9IG5ldyBSZXNwb25zZShuZXdNb2RlKTtcbiAgICAgIC8vIGZpcnN0IGludGVybmFsIGJlZm9yZSBjYWxsYmFja3MsIHRoZW4gdGhlIHB1YmxpYyBvbmVzXG4gICAgICBjb25zdCBiZWZvcmVDYWxsYmFja3MgPSBbbmV3TW9kZS5fX2JlZm9yZUJlZ2luLCBuZXdNb2RlW1wib246YmVnaW5cIl1dO1xuICAgICAgZm9yIChjb25zdCBjYiBvZiBiZWZvcmVDYWxsYmFja3MpIHtcbiAgICAgICAgaWYgKCFjYikgY29udGludWU7XG4gICAgICAgIGNiKG1hdGNoLCByZXNwKTtcbiAgICAgICAgaWYgKHJlc3AuaXNNYXRjaElnbm9yZWQpIHJldHVybiBkb0lnbm9yZShsZXhlbWUpO1xuICAgICAgfVxuXG4gICAgICBpZiAobmV3TW9kZS5za2lwKSB7XG4gICAgICAgIG1vZGVCdWZmZXIgKz0gbGV4ZW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG5ld01vZGUuZXhjbHVkZUJlZ2luKSB7XG4gICAgICAgICAgbW9kZUJ1ZmZlciArPSBsZXhlbWU7XG4gICAgICAgIH1cbiAgICAgICAgcHJvY2Vzc0J1ZmZlcigpO1xuICAgICAgICBpZiAoIW5ld01vZGUucmV0dXJuQmVnaW4gJiYgIW5ld01vZGUuZXhjbHVkZUJlZ2luKSB7XG4gICAgICAgICAgbW9kZUJ1ZmZlciA9IGxleGVtZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc3RhcnROZXdNb2RlKG5ld01vZGUsIG1hdGNoKTtcbiAgICAgIHJldHVybiBuZXdNb2RlLnJldHVybkJlZ2luID8gMCA6IGxleGVtZS5sZW5ndGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlIHRoZSBwb3RlbnRpYWwgZW5kIG9mIG1vZGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7UmVnRXhwTWF0Y2hBcnJheX0gbWF0Y2ggLSB0aGUgY3VycmVudCBtYXRjaFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGRvRW5kTWF0Y2gobWF0Y2gpIHtcbiAgICAgIGNvbnN0IGxleGVtZSA9IG1hdGNoWzBdO1xuICAgICAgY29uc3QgbWF0Y2hQbHVzUmVtYWluZGVyID0gY29kZVRvSGlnaGxpZ2h0LnN1YnN0cmluZyhtYXRjaC5pbmRleCk7XG5cbiAgICAgIGNvbnN0IGVuZE1vZGUgPSBlbmRPZk1vZGUodG9wLCBtYXRjaCwgbWF0Y2hQbHVzUmVtYWluZGVyKTtcbiAgICAgIGlmICghZW5kTW9kZSkgeyByZXR1cm4gTk9fTUFUQ0g7IH1cblxuICAgICAgY29uc3Qgb3JpZ2luID0gdG9wO1xuICAgICAgaWYgKHRvcC5lbmRTY29wZSAmJiB0b3AuZW5kU2NvcGUuX3dyYXApIHtcbiAgICAgICAgcHJvY2Vzc0J1ZmZlcigpO1xuICAgICAgICBlbWl0S2V5d29yZChsZXhlbWUsIHRvcC5lbmRTY29wZS5fd3JhcCk7XG4gICAgICB9IGVsc2UgaWYgKHRvcC5lbmRTY29wZSAmJiB0b3AuZW5kU2NvcGUuX211bHRpKSB7XG4gICAgICAgIHByb2Nlc3NCdWZmZXIoKTtcbiAgICAgICAgZW1pdE11bHRpQ2xhc3ModG9wLmVuZFNjb3BlLCBtYXRjaCk7XG4gICAgICB9IGVsc2UgaWYgKG9yaWdpbi5za2lwKSB7XG4gICAgICAgIG1vZGVCdWZmZXIgKz0gbGV4ZW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCEob3JpZ2luLnJldHVybkVuZCB8fCBvcmlnaW4uZXhjbHVkZUVuZCkpIHtcbiAgICAgICAgICBtb2RlQnVmZmVyICs9IGxleGVtZTtcbiAgICAgICAgfVxuICAgICAgICBwcm9jZXNzQnVmZmVyKCk7XG4gICAgICAgIGlmIChvcmlnaW4uZXhjbHVkZUVuZCkge1xuICAgICAgICAgIG1vZGVCdWZmZXIgPSBsZXhlbWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGRvIHtcbiAgICAgICAgaWYgKHRvcC5zY29wZSkge1xuICAgICAgICAgIGVtaXR0ZXIuY2xvc2VOb2RlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0b3Auc2tpcCAmJiAhdG9wLnN1Ykxhbmd1YWdlKSB7XG4gICAgICAgICAgcmVsZXZhbmNlICs9IHRvcC5yZWxldmFuY2U7XG4gICAgICAgIH1cbiAgICAgICAgdG9wID0gdG9wLnBhcmVudDtcbiAgICAgIH0gd2hpbGUgKHRvcCAhPT0gZW5kTW9kZS5wYXJlbnQpO1xuICAgICAgaWYgKGVuZE1vZGUuc3RhcnRzKSB7XG4gICAgICAgIHN0YXJ0TmV3TW9kZShlbmRNb2RlLnN0YXJ0cywgbWF0Y2gpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9yaWdpbi5yZXR1cm5FbmQgPyAwIDogbGV4ZW1lLmxlbmd0aDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcm9jZXNzQ29udGludWF0aW9ucygpIHtcbiAgICAgIGNvbnN0IGxpc3QgPSBbXTtcbiAgICAgIGZvciAobGV0IGN1cnJlbnQgPSB0b3A7IGN1cnJlbnQgIT09IGxhbmd1YWdlOyBjdXJyZW50ID0gY3VycmVudC5wYXJlbnQpIHtcbiAgICAgICAgaWYgKGN1cnJlbnQuc2NvcGUpIHtcbiAgICAgICAgICBsaXN0LnVuc2hpZnQoY3VycmVudC5zY29wZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxpc3QuZm9yRWFjaChpdGVtID0+IGVtaXR0ZXIub3Blbk5vZGUoaXRlbSkpO1xuICAgIH1cblxuICAgIC8qKiBAdHlwZSB7e3R5cGU/OiBNYXRjaFR5cGUsIGluZGV4PzogbnVtYmVyLCBydWxlPzogTW9kZX19fSAqL1xuICAgIGxldCBsYXN0TWF0Y2ggPSB7fTtcblxuICAgIC8qKlxuICAgICAqICBQcm9jZXNzIGFuIGluZGl2aWR1YWwgbWF0Y2hcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0QmVmb3JlTWF0Y2ggLSB0ZXh0IHByZWNlZGluZyB0aGUgbWF0Y2ggKHNpbmNlIHRoZSBsYXN0IG1hdGNoKVxuICAgICAqIEBwYXJhbSB7RW5oYW5jZWRNYXRjaH0gW21hdGNoXSAtIHRoZSBtYXRjaCBpdHNlbGZcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBwcm9jZXNzTGV4ZW1lKHRleHRCZWZvcmVNYXRjaCwgbWF0Y2gpIHtcbiAgICAgIGNvbnN0IGxleGVtZSA9IG1hdGNoICYmIG1hdGNoWzBdO1xuXG4gICAgICAvLyBhZGQgbm9uLW1hdGNoZWQgdGV4dCB0byB0aGUgY3VycmVudCBtb2RlIGJ1ZmZlclxuICAgICAgbW9kZUJ1ZmZlciArPSB0ZXh0QmVmb3JlTWF0Y2g7XG5cbiAgICAgIGlmIChsZXhlbWUgPT0gbnVsbCkge1xuICAgICAgICBwcm9jZXNzQnVmZmVyKCk7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuXG4gICAgICAvLyB3ZSd2ZSBmb3VuZCBhIDAgd2lkdGggbWF0Y2ggYW5kIHdlJ3JlIHN0dWNrLCBzbyB3ZSBuZWVkIHRvIGFkdmFuY2VcbiAgICAgIC8vIHRoaXMgaGFwcGVucyB3aGVuIHdlIGhhdmUgYmFkbHkgYmVoYXZlZCBydWxlcyB0aGF0IGhhdmUgb3B0aW9uYWwgbWF0Y2hlcnMgdG8gdGhlIGRlZ3JlZSB0aGF0XG4gICAgICAvLyBzb21ldGltZXMgdGhleSBjYW4gZW5kIHVwIG1hdGNoaW5nIG5vdGhpbmcgYXQgYWxsXG4gICAgICAvLyBSZWY6IGh0dHBzOi8vZ2l0aHViLmNvbS9oaWdobGlnaHRqcy9oaWdobGlnaHQuanMvaXNzdWVzLzIxNDBcbiAgICAgIGlmIChsYXN0TWF0Y2gudHlwZSA9PT0gXCJiZWdpblwiICYmIG1hdGNoLnR5cGUgPT09IFwiZW5kXCIgJiYgbGFzdE1hdGNoLmluZGV4ID09PSBtYXRjaC5pbmRleCAmJiBsZXhlbWUgPT09IFwiXCIpIHtcbiAgICAgICAgLy8gc3BpdCB0aGUgXCJza2lwcGVkXCIgY2hhcmFjdGVyIHRoYXQgb3VyIHJlZ2V4IGNob2tlZCBvbiBiYWNrIGludG8gdGhlIG91dHB1dCBzZXF1ZW5jZVxuICAgICAgICBtb2RlQnVmZmVyICs9IGNvZGVUb0hpZ2hsaWdodC5zbGljZShtYXRjaC5pbmRleCwgbWF0Y2guaW5kZXggKyAxKTtcbiAgICAgICAgaWYgKCFTQUZFX01PREUpIHtcbiAgICAgICAgICAvKiogQHR5cGUge0Fubm90YXRlZEVycm9yfSAqL1xuICAgICAgICAgIGNvbnN0IGVyciA9IG5ldyBFcnJvcihgMCB3aWR0aCBtYXRjaCByZWdleCAoJHtsYW5ndWFnZU5hbWV9KWApO1xuICAgICAgICAgIGVyci5sYW5ndWFnZU5hbWUgPSBsYW5ndWFnZU5hbWU7XG4gICAgICAgICAgZXJyLmJhZFJ1bGUgPSBsYXN0TWF0Y2gucnVsZTtcbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9XG4gICAgICBsYXN0TWF0Y2ggPSBtYXRjaDtcblxuICAgICAgaWYgKG1hdGNoLnR5cGUgPT09IFwiYmVnaW5cIikge1xuICAgICAgICByZXR1cm4gZG9CZWdpbk1hdGNoKG1hdGNoKTtcbiAgICAgIH0gZWxzZSBpZiAobWF0Y2gudHlwZSA9PT0gXCJpbGxlZ2FsXCIgJiYgIWlnbm9yZUlsbGVnYWxzKSB7XG4gICAgICAgIC8vIGlsbGVnYWwgbWF0Y2gsIHdlIGRvIG5vdCBjb250aW51ZSBwcm9jZXNzaW5nXG4gICAgICAgIC8qKiBAdHlwZSB7QW5ub3RhdGVkRXJyb3J9ICovXG4gICAgICAgIGNvbnN0IGVyciA9IG5ldyBFcnJvcignSWxsZWdhbCBsZXhlbWUgXCInICsgbGV4ZW1lICsgJ1wiIGZvciBtb2RlIFwiJyArICh0b3Auc2NvcGUgfHwgJzx1bm5hbWVkPicpICsgJ1wiJyk7XG4gICAgICAgIGVyci5tb2RlID0gdG9wO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9IGVsc2UgaWYgKG1hdGNoLnR5cGUgPT09IFwiZW5kXCIpIHtcbiAgICAgICAgY29uc3QgcHJvY2Vzc2VkID0gZG9FbmRNYXRjaChtYXRjaCk7XG4gICAgICAgIGlmIChwcm9jZXNzZWQgIT09IE5PX01BVENIKSB7XG4gICAgICAgICAgcmV0dXJuIHByb2Nlc3NlZDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBlZGdlIGNhc2UgZm9yIHdoZW4gaWxsZWdhbCBtYXRjaGVzICQgKGVuZCBvZiBsaW5lKSB3aGljaCBpcyB0ZWNobmljYWxseVxuICAgICAgLy8gYSAwIHdpZHRoIG1hdGNoIGJ1dCBub3QgYSBiZWdpbi9lbmQgbWF0Y2ggc28gaXQncyBub3QgY2F1Z2h0IGJ5IHRoZVxuICAgICAgLy8gZmlyc3QgaGFuZGxlciAod2hlbiBpZ25vcmVJbGxlZ2FscyBpcyB0cnVlKVxuICAgICAgaWYgKG1hdGNoLnR5cGUgPT09IFwiaWxsZWdhbFwiICYmIGxleGVtZSA9PT0gXCJcIikge1xuICAgICAgICAvLyBhZHZhbmNlIHNvIHdlIGFyZW4ndCBzdHVjayBpbiBhbiBpbmZpbml0ZSBsb29wXG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfVxuXG4gICAgICAvLyBpbmZpbml0ZSBsb29wcyBhcmUgQkFELCB0aGlzIGlzIGEgbGFzdCBkaXRjaCBjYXRjaCBhbGwuIGlmIHdlIGhhdmUgYVxuICAgICAgLy8gZGVjZW50IG51bWJlciBvZiBpdGVyYXRpb25zIHlldCBvdXIgaW5kZXggKGN1cnNvciBwb3NpdGlvbiBpbiBvdXJcbiAgICAgIC8vIHBhcnNpbmcpIHN0aWxsIDN4IGJlaGluZCBvdXIgaW5kZXggdGhlbiBzb21ldGhpbmcgaXMgdmVyeSB3cm9uZ1xuICAgICAgLy8gc28gd2UgYmFpbFxuICAgICAgaWYgKGl0ZXJhdGlvbnMgPiAxMDAwMDAgJiYgaXRlcmF0aW9ucyA+IG1hdGNoLmluZGV4ICogMykge1xuICAgICAgICBjb25zdCBlcnIgPSBuZXcgRXJyb3IoJ3BvdGVudGlhbCBpbmZpbml0ZSBsb29wLCB3YXkgbW9yZSBpdGVyYXRpb25zIHRoYW4gbWF0Y2hlcycpO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG5cbiAgICAgIC8qXG4gICAgICBXaHkgbWlnaHQgYmUgZmluZCBvdXJzZWx2ZXMgaGVyZT8gIEFuIHBvdGVudGlhbCBlbmQgbWF0Y2ggdGhhdCB3YXNcbiAgICAgIHRyaWdnZXJlZCBidXQgY291bGQgbm90IGJlIGNvbXBsZXRlZC4gIElFLCBgZG9FbmRNYXRjaGAgcmV0dXJuZWQgTk9fTUFUQ0guXG4gICAgICAodGhpcyBjb3VsZCBiZSBiZWNhdXNlIGEgY2FsbGJhY2sgcmVxdWVzdHMgdGhlIG1hdGNoIGJlIGlnbm9yZWQsIGV0YylcblxuICAgICAgVGhpcyBjYXVzZXMgbm8gcmVhbCBoYXJtIG90aGVyIHRoYW4gc3RvcHBpbmcgYSBmZXcgdGltZXMgdG9vIG1hbnkuXG4gICAgICAqL1xuXG4gICAgICBtb2RlQnVmZmVyICs9IGxleGVtZTtcbiAgICAgIHJldHVybiBsZXhlbWUubGVuZ3RoO1xuICAgIH1cblxuICAgIGNvbnN0IGxhbmd1YWdlID0gZ2V0TGFuZ3VhZ2UobGFuZ3VhZ2VOYW1lKTtcbiAgICBpZiAoIWxhbmd1YWdlKSB7XG4gICAgICBlcnJvcihMQU5HVUFHRV9OT1RfRk9VTkQucmVwbGFjZShcInt9XCIsIGxhbmd1YWdlTmFtZSkpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGxhbmd1YWdlOiBcIicgKyBsYW5ndWFnZU5hbWUgKyAnXCInKTtcbiAgICB9XG5cbiAgICBjb25zdCBtZCA9IGNvbXBpbGVMYW5ndWFnZShsYW5ndWFnZSk7XG4gICAgbGV0IHJlc3VsdCA9ICcnO1xuICAgIC8qKiBAdHlwZSB7Q29tcGlsZWRNb2RlfSAqL1xuICAgIGxldCB0b3AgPSBjb250aW51YXRpb24gfHwgbWQ7XG4gICAgLyoqIEB0eXBlIFJlY29yZDxzdHJpbmcsQ29tcGlsZWRNb2RlPiAqL1xuICAgIGNvbnN0IGNvbnRpbnVhdGlvbnMgPSB7fTsgLy8ga2VlcCBjb250aW51YXRpb25zIGZvciBzdWItbGFuZ3VhZ2VzXG4gICAgY29uc3QgZW1pdHRlciA9IG5ldyBvcHRpb25zLl9fZW1pdHRlcihvcHRpb25zKTtcbiAgICBwcm9jZXNzQ29udGludWF0aW9ucygpO1xuICAgIGxldCBtb2RlQnVmZmVyID0gJyc7XG4gICAgbGV0IHJlbGV2YW5jZSA9IDA7XG4gICAgbGV0IGluZGV4ID0gMDtcbiAgICBsZXQgaXRlcmF0aW9ucyA9IDA7XG4gICAgbGV0IHJlc3VtZVNjYW5BdFNhbWVQb3NpdGlvbiA9IGZhbHNlO1xuXG4gICAgdHJ5IHtcbiAgICAgIGlmICghbGFuZ3VhZ2UuX19lbWl0VG9rZW5zKSB7XG4gICAgICAgIHRvcC5tYXRjaGVyLmNvbnNpZGVyQWxsKCk7XG5cbiAgICAgICAgZm9yICg7Oykge1xuICAgICAgICAgIGl0ZXJhdGlvbnMrKztcbiAgICAgICAgICBpZiAocmVzdW1lU2NhbkF0U2FtZVBvc2l0aW9uKSB7XG4gICAgICAgICAgICAvLyBvbmx5IHJlZ2V4ZXMgbm90IG1hdGNoZWQgcHJldmlvdXNseSB3aWxsIG5vdyBiZVxuICAgICAgICAgICAgLy8gY29uc2lkZXJlZCBmb3IgYSBwb3RlbnRpYWwgbWF0Y2hcbiAgICAgICAgICAgIHJlc3VtZVNjYW5BdFNhbWVQb3NpdGlvbiA9IGZhbHNlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0b3AubWF0Y2hlci5jb25zaWRlckFsbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0b3AubWF0Y2hlci5sYXN0SW5kZXggPSBpbmRleDtcblxuICAgICAgICAgIGNvbnN0IG1hdGNoID0gdG9wLm1hdGNoZXIuZXhlYyhjb2RlVG9IaWdobGlnaHQpO1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwibWF0Y2hcIiwgbWF0Y2hbMF0sIG1hdGNoLnJ1bGUgJiYgbWF0Y2gucnVsZS5iZWdpbilcblxuICAgICAgICAgIGlmICghbWF0Y2gpIGJyZWFrO1xuXG4gICAgICAgICAgY29uc3QgYmVmb3JlTWF0Y2ggPSBjb2RlVG9IaWdobGlnaHQuc3Vic3RyaW5nKGluZGV4LCBtYXRjaC5pbmRleCk7XG4gICAgICAgICAgY29uc3QgcHJvY2Vzc2VkQ291bnQgPSBwcm9jZXNzTGV4ZW1lKGJlZm9yZU1hdGNoLCBtYXRjaCk7XG4gICAgICAgICAgaW5kZXggPSBtYXRjaC5pbmRleCArIHByb2Nlc3NlZENvdW50O1xuICAgICAgICB9XG4gICAgICAgIHByb2Nlc3NMZXhlbWUoY29kZVRvSGlnaGxpZ2h0LnN1YnN0cmluZyhpbmRleCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGFuZ3VhZ2UuX19lbWl0VG9rZW5zKGNvZGVUb0hpZ2hsaWdodCwgZW1pdHRlcik7XG4gICAgICB9XG5cbiAgICAgIGVtaXR0ZXIuZmluYWxpemUoKTtcbiAgICAgIHJlc3VsdCA9IGVtaXR0ZXIudG9IVE1MKCk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxhbmd1YWdlOiBsYW5ndWFnZU5hbWUsXG4gICAgICAgIHZhbHVlOiByZXN1bHQsXG4gICAgICAgIHJlbGV2YW5jZSxcbiAgICAgICAgaWxsZWdhbDogZmFsc2UsXG4gICAgICAgIF9lbWl0dGVyOiBlbWl0dGVyLFxuICAgICAgICBfdG9wOiB0b3BcbiAgICAgIH07XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBpZiAoZXJyLm1lc3NhZ2UgJiYgZXJyLm1lc3NhZ2UuaW5jbHVkZXMoJ0lsbGVnYWwnKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxhbmd1YWdlOiBsYW5ndWFnZU5hbWUsXG4gICAgICAgICAgdmFsdWU6IGVzY2FwZShjb2RlVG9IaWdobGlnaHQpLFxuICAgICAgICAgIGlsbGVnYWw6IHRydWUsXG4gICAgICAgICAgcmVsZXZhbmNlOiAwLFxuICAgICAgICAgIF9pbGxlZ2FsQnk6IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgICBjb250ZXh0OiBjb2RlVG9IaWdobGlnaHQuc2xpY2UoaW5kZXggLSAxMDAsIGluZGV4ICsgMTAwKSxcbiAgICAgICAgICAgIG1vZGU6IGVyci5tb2RlLFxuICAgICAgICAgICAgcmVzdWx0U29GYXI6IHJlc3VsdFxuICAgICAgICAgIH0sXG4gICAgICAgICAgX2VtaXR0ZXI6IGVtaXR0ZXJcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAoU0FGRV9NT0RFKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGFuZ3VhZ2U6IGxhbmd1YWdlTmFtZSxcbiAgICAgICAgICB2YWx1ZTogZXNjYXBlKGNvZGVUb0hpZ2hsaWdodCksXG4gICAgICAgICAgaWxsZWdhbDogZmFsc2UsXG4gICAgICAgICAgcmVsZXZhbmNlOiAwLFxuICAgICAgICAgIGVycm9yUmFpc2VkOiBlcnIsXG4gICAgICAgICAgX2VtaXR0ZXI6IGVtaXR0ZXIsXG4gICAgICAgICAgX3RvcDogdG9wXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHJldHVybnMgYSB2YWxpZCBoaWdobGlnaHQgcmVzdWx0LCB3aXRob3V0IGFjdHVhbGx5IGRvaW5nIGFueSBhY3R1YWwgd29yayxcbiAgICogYXV0byBoaWdobGlnaHQgc3RhcnRzIHdpdGggdGhpcyBhbmQgaXQncyBwb3NzaWJsZSBmb3Igc21hbGwgc25pcHBldHMgdGhhdFxuICAgKiBhdXRvLWRldGVjdGlvbiBtYXkgbm90IGZpbmQgYSBiZXR0ZXIgbWF0Y2hcbiAgICogQHBhcmFtIHtzdHJpbmd9IGNvZGVcbiAgICogQHJldHVybnMge0hpZ2hsaWdodFJlc3VsdH1cbiAgICovXG4gIGZ1bmN0aW9uIGp1c3RUZXh0SGlnaGxpZ2h0UmVzdWx0KGNvZGUpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICB2YWx1ZTogZXNjYXBlKGNvZGUpLFxuICAgICAgaWxsZWdhbDogZmFsc2UsXG4gICAgICByZWxldmFuY2U6IDAsXG4gICAgICBfdG9wOiBQTEFJTlRFWFRfTEFOR1VBR0UsXG4gICAgICBfZW1pdHRlcjogbmV3IG9wdGlvbnMuX19lbWl0dGVyKG9wdGlvbnMpXG4gICAgfTtcbiAgICByZXN1bHQuX2VtaXR0ZXIuYWRkVGV4dChjb2RlKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gIEhpZ2hsaWdodGluZyB3aXRoIGxhbmd1YWdlIGRldGVjdGlvbi4gQWNjZXB0cyBhIHN0cmluZyB3aXRoIHRoZSBjb2RlIHRvXG4gIGhpZ2hsaWdodC4gUmV0dXJucyBhbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG5cbiAgLSBsYW5ndWFnZSAoZGV0ZWN0ZWQgbGFuZ3VhZ2UpXG4gIC0gcmVsZXZhbmNlIChpbnQpXG4gIC0gdmFsdWUgKGFuIEhUTUwgc3RyaW5nIHdpdGggaGlnaGxpZ2h0aW5nIG1hcmt1cClcbiAgLSBzZWNvbmRCZXN0IChvYmplY3Qgd2l0aCB0aGUgc2FtZSBzdHJ1Y3R1cmUgZm9yIHNlY29uZC1iZXN0IGhldXJpc3RpY2FsbHlcbiAgICBkZXRlY3RlZCBsYW5ndWFnZSwgbWF5IGJlIGFic2VudClcblxuICAgIEBwYXJhbSB7c3RyaW5nfSBjb2RlXG4gICAgQHBhcmFtIHtBcnJheTxzdHJpbmc+fSBbbGFuZ3VhZ2VTdWJzZXRdXG4gICAgQHJldHVybnMge0F1dG9IaWdobGlnaHRSZXN1bHR9XG4gICovXG4gIGZ1bmN0aW9uIGhpZ2hsaWdodEF1dG8oY29kZSwgbGFuZ3VhZ2VTdWJzZXQpIHtcbiAgICBsYW5ndWFnZVN1YnNldCA9IGxhbmd1YWdlU3Vic2V0IHx8IG9wdGlvbnMubGFuZ3VhZ2VzIHx8IE9iamVjdC5rZXlzKGxhbmd1YWdlcyk7XG4gICAgY29uc3QgcGxhaW50ZXh0ID0ganVzdFRleHRIaWdobGlnaHRSZXN1bHQoY29kZSk7XG5cbiAgICBjb25zdCByZXN1bHRzID0gbGFuZ3VhZ2VTdWJzZXQuZmlsdGVyKGdldExhbmd1YWdlKS5maWx0ZXIoYXV0b0RldGVjdGlvbikubWFwKG5hbWUgPT5cbiAgICAgIF9oaWdobGlnaHQobmFtZSwgY29kZSwgZmFsc2UpXG4gICAgKTtcbiAgICByZXN1bHRzLnVuc2hpZnQocGxhaW50ZXh0KTsgLy8gcGxhaW50ZXh0IGlzIGFsd2F5cyBhbiBvcHRpb25cblxuICAgIGNvbnN0IHNvcnRlZCA9IHJlc3VsdHMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgLy8gc29ydCBiYXNlIG9uIHJlbGV2YW5jZVxuICAgICAgaWYgKGEucmVsZXZhbmNlICE9PSBiLnJlbGV2YW5jZSkgcmV0dXJuIGIucmVsZXZhbmNlIC0gYS5yZWxldmFuY2U7XG5cbiAgICAgIC8vIGFsd2F5cyBhd2FyZCB0aGUgdGllIHRvIHRoZSBiYXNlIGxhbmd1YWdlXG4gICAgICAvLyBpZSBpZiBDKysgYW5kIEFyZHVpbm8gYXJlIHRpZWQsIGl0J3MgbW9yZSBsaWtlbHkgdG8gYmUgQysrXG4gICAgICBpZiAoYS5sYW5ndWFnZSAmJiBiLmxhbmd1YWdlKSB7XG4gICAgICAgIGlmIChnZXRMYW5ndWFnZShhLmxhbmd1YWdlKS5zdXBlcnNldE9mID09PSBiLmxhbmd1YWdlKSB7XG4gICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH0gZWxzZSBpZiAoZ2V0TGFuZ3VhZ2UoYi5sYW5ndWFnZSkuc3VwZXJzZXRPZiA9PT0gYS5sYW5ndWFnZSkge1xuICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBvdGhlcndpc2Ugc2F5IHRoZXkgYXJlIGVxdWFsLCB3aGljaCBoYXMgdGhlIGVmZmVjdCBvZiBzb3J0aW5nIG9uXG4gICAgICAvLyByZWxldmFuY2Ugd2hpbGUgcHJlc2VydmluZyB0aGUgb3JpZ2luYWwgb3JkZXJpbmcgLSB3aGljaCBpcyBob3cgdGllc1xuICAgICAgLy8gaGF2ZSBoaXN0b3JpY2FsbHkgYmVlbiBzZXR0bGVkLCBpZSB0aGUgbGFuZ3VhZ2UgdGhhdCBjb21lcyBmaXJzdCBhbHdheXNcbiAgICAgIC8vIHdpbnMgaW4gdGhlIGNhc2Ugb2YgYSB0aWVcbiAgICAgIHJldHVybiAwO1xuICAgIH0pO1xuXG4gICAgY29uc3QgW2Jlc3QsIHNlY29uZEJlc3RdID0gc29ydGVkO1xuXG4gICAgLyoqIEB0eXBlIHtBdXRvSGlnaGxpZ2h0UmVzdWx0fSAqL1xuICAgIGNvbnN0IHJlc3VsdCA9IGJlc3Q7XG4gICAgcmVzdWx0LnNlY29uZEJlc3QgPSBzZWNvbmRCZXN0O1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgbmV3IGNsYXNzIG5hbWUgZm9yIGJsb2NrIGdpdmVuIHRoZSBsYW5ndWFnZSBuYW1lXG4gICAqXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtjdXJyZW50TGFuZ11cbiAgICogQHBhcmFtIHtzdHJpbmd9IFtyZXN1bHRMYW5nXVxuICAgKi9cbiAgZnVuY3Rpb24gdXBkYXRlQ2xhc3NOYW1lKGVsZW1lbnQsIGN1cnJlbnRMYW5nLCByZXN1bHRMYW5nKSB7XG4gICAgY29uc3QgbGFuZ3VhZ2UgPSAoY3VycmVudExhbmcgJiYgYWxpYXNlc1tjdXJyZW50TGFuZ10pIHx8IHJlc3VsdExhbmc7XG5cbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJobGpzXCIpO1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChgbGFuZ3VhZ2UtJHtsYW5ndWFnZX1gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIGhpZ2hsaWdodGluZyB0byBhIERPTSBub2RlIGNvbnRhaW5pbmcgY29kZS5cbiAgICpcbiAgICogQHBhcmFtIHtIaWdobGlnaHRlZEhUTUxFbGVtZW50fSBlbGVtZW50IC0gdGhlIEhUTUwgZWxlbWVudCB0byBoaWdobGlnaHRcbiAgKi9cbiAgZnVuY3Rpb24gaGlnaGxpZ2h0RWxlbWVudChlbGVtZW50KSB7XG4gICAgLyoqIEB0eXBlIEhUTUxFbGVtZW50ICovXG4gICAgbGV0IG5vZGUgPSBudWxsO1xuICAgIGNvbnN0IGxhbmd1YWdlID0gYmxvY2tMYW5ndWFnZShlbGVtZW50KTtcblxuICAgIGlmIChzaG91bGROb3RIaWdobGlnaHQobGFuZ3VhZ2UpKSByZXR1cm47XG5cbiAgICBmaXJlKFwiYmVmb3JlOmhpZ2hsaWdodEVsZW1lbnRcIixcbiAgICAgIHsgZWw6IGVsZW1lbnQsIGxhbmd1YWdlIH0pO1xuXG4gICAgaWYgKGVsZW1lbnQuZGF0YXNldC5oaWdobGlnaHRlZCkge1xuICAgICAgY29uc29sZS5sb2coXCJFbGVtZW50IHByZXZpb3VzbHkgaGlnaGxpZ2h0ZWQuIFRvIGhpZ2hsaWdodCBhZ2FpbiwgZmlyc3QgdW5zZXQgYGRhdGFzZXQuaGlnaGxpZ2h0ZWRgLlwiLCBlbGVtZW50KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyB3ZSBzaG91bGQgYmUgYWxsIHRleHQsIG5vIGNoaWxkIG5vZGVzICh1bmVzY2FwZWQgSFRNTCkgLSB0aGlzIGlzIHBvc3NpYmx5XG4gICAgLy8gYW4gSFRNTCBpbmplY3Rpb24gYXR0YWNrIC0gaXQncyBsaWtlbHkgdG9vIGxhdGUgaWYgdGhpcyBpcyBhbHJlYWR5IGluXG4gICAgLy8gcHJvZHVjdGlvbiAodGhlIGNvZGUgaGFzIGxpa2VseSBhbHJlYWR5IGRvbmUgaXRzIGRhbWFnZSBieSB0aGUgdGltZVxuICAgIC8vIHdlJ3JlIHNlZWluZyBpdCkuLi4gYnV0IHdlIHllbGwgbG91ZGx5IGFib3V0IHRoaXMgc28gdGhhdCBob3BlZnVsbHkgaXQnc1xuICAgIC8vIG1vcmUgbGlrZWx5IHRvIGJlIGNhdWdodCBpbiBkZXZlbG9wbWVudCBiZWZvcmUgbWFraW5nIGl0IHRvIHByb2R1Y3Rpb25cbiAgICBpZiAoZWxlbWVudC5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAoIW9wdGlvbnMuaWdub3JlVW5lc2NhcGVkSFRNTCkge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJPbmUgb2YgeW91ciBjb2RlIGJsb2NrcyBpbmNsdWRlcyB1bmVzY2FwZWQgSFRNTC4gVGhpcyBpcyBhIHBvdGVudGlhbGx5IHNlcmlvdXMgc2VjdXJpdHkgcmlzay5cIik7XG4gICAgICAgIGNvbnNvbGUud2FybihcImh0dHBzOi8vZ2l0aHViLmNvbS9oaWdobGlnaHRqcy9oaWdobGlnaHQuanMvd2lraS9zZWN1cml0eVwiKTtcbiAgICAgICAgY29uc29sZS53YXJuKFwiVGhlIGVsZW1lbnQgd2l0aCB1bmVzY2FwZWQgSFRNTDpcIik7XG4gICAgICAgIGNvbnNvbGUud2FybihlbGVtZW50KTtcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zLnRocm93VW5lc2NhcGVkSFRNTCkge1xuICAgICAgICBjb25zdCBlcnIgPSBuZXcgSFRNTEluamVjdGlvbkVycm9yKFxuICAgICAgICAgIFwiT25lIG9mIHlvdXIgY29kZSBibG9ja3MgaW5jbHVkZXMgdW5lc2NhcGVkIEhUTUwuXCIsXG4gICAgICAgICAgZWxlbWVudC5pbm5lckhUTUxcbiAgICAgICAgKTtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cblxuICAgIG5vZGUgPSBlbGVtZW50O1xuICAgIGNvbnN0IHRleHQgPSBub2RlLnRleHRDb250ZW50O1xuICAgIGNvbnN0IHJlc3VsdCA9IGxhbmd1YWdlID8gaGlnaGxpZ2h0KHRleHQsIHsgbGFuZ3VhZ2UsIGlnbm9yZUlsbGVnYWxzOiB0cnVlIH0pIDogaGlnaGxpZ2h0QXV0byh0ZXh0KTtcblxuICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gcmVzdWx0LnZhbHVlO1xuICAgIGVsZW1lbnQuZGF0YXNldC5oaWdobGlnaHRlZCA9IFwieWVzXCI7XG4gICAgdXBkYXRlQ2xhc3NOYW1lKGVsZW1lbnQsIGxhbmd1YWdlLCByZXN1bHQubGFuZ3VhZ2UpO1xuICAgIGVsZW1lbnQucmVzdWx0ID0ge1xuICAgICAgbGFuZ3VhZ2U6IHJlc3VsdC5sYW5ndWFnZSxcbiAgICAgIC8vIFRPRE86IHJlbW92ZSB3aXRoIHZlcnNpb24gMTEuMFxuICAgICAgcmU6IHJlc3VsdC5yZWxldmFuY2UsXG4gICAgICByZWxldmFuY2U6IHJlc3VsdC5yZWxldmFuY2VcbiAgICB9O1xuICAgIGlmIChyZXN1bHQuc2Vjb25kQmVzdCkge1xuICAgICAgZWxlbWVudC5zZWNvbmRCZXN0ID0ge1xuICAgICAgICBsYW5ndWFnZTogcmVzdWx0LnNlY29uZEJlc3QubGFuZ3VhZ2UsXG4gICAgICAgIHJlbGV2YW5jZTogcmVzdWx0LnNlY29uZEJlc3QucmVsZXZhbmNlXG4gICAgICB9O1xuICAgIH1cblxuICAgIGZpcmUoXCJhZnRlcjpoaWdobGlnaHRFbGVtZW50XCIsIHsgZWw6IGVsZW1lbnQsIHJlc3VsdCwgdGV4dCB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIGhpZ2hsaWdodC5qcyBnbG9iYWwgb3B0aW9ucyB3aXRoIHRoZSBwYXNzZWQgb3B0aW9uc1xuICAgKlxuICAgKiBAcGFyYW0ge1BhcnRpYWw8SExKU09wdGlvbnM+fSB1c2VyT3B0aW9uc1xuICAgKi9cbiAgZnVuY3Rpb24gY29uZmlndXJlKHVzZXJPcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IGluaGVyaXQob3B0aW9ucywgdXNlck9wdGlvbnMpO1xuICB9XG5cbiAgLy8gVE9ETzogcmVtb3ZlIHYxMiwgZGVwcmVjYXRlZFxuICBjb25zdCBpbml0SGlnaGxpZ2h0aW5nID0gKCkgPT4ge1xuICAgIGhpZ2hsaWdodEFsbCgpO1xuICAgIGRlcHJlY2F0ZWQoXCIxMC42LjBcIiwgXCJpbml0SGlnaGxpZ2h0aW5nKCkgZGVwcmVjYXRlZC4gIFVzZSBoaWdobGlnaHRBbGwoKSBub3cuXCIpO1xuICB9O1xuXG4gIC8vIFRPRE86IHJlbW92ZSB2MTIsIGRlcHJlY2F0ZWRcbiAgZnVuY3Rpb24gaW5pdEhpZ2hsaWdodGluZ09uTG9hZCgpIHtcbiAgICBoaWdobGlnaHRBbGwoKTtcbiAgICBkZXByZWNhdGVkKFwiMTAuNi4wXCIsIFwiaW5pdEhpZ2hsaWdodGluZ09uTG9hZCgpIGRlcHJlY2F0ZWQuICBVc2UgaGlnaGxpZ2h0QWxsKCkgbm93LlwiKTtcbiAgfVxuXG4gIGxldCB3YW50c0hpZ2hsaWdodCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBhdXRvLWhpZ2hsaWdodHMgYWxsIHByZT5jb2RlIGVsZW1lbnRzIG9uIHRoZSBwYWdlXG4gICAqL1xuICBmdW5jdGlvbiBoaWdobGlnaHRBbGwoKSB7XG4gICAgLy8gaWYgd2UgYXJlIGNhbGxlZCB0b28gZWFybHkgaW4gdGhlIGxvYWRpbmcgcHJvY2Vzc1xuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImxvYWRpbmdcIikge1xuICAgICAgd2FudHNIaWdobGlnaHQgPSB0cnVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGJsb2NrcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwob3B0aW9ucy5jc3NTZWxlY3Rvcik7XG4gICAgYmxvY2tzLmZvckVhY2goaGlnaGxpZ2h0RWxlbWVudCk7XG4gIH1cblxuICBmdW5jdGlvbiBib290KCkge1xuICAgIC8vIGlmIGEgaGlnaGxpZ2h0IHdhcyByZXF1ZXN0ZWQgYmVmb3JlIERPTSB3YXMgbG9hZGVkLCBkbyBub3dcbiAgICBpZiAod2FudHNIaWdobGlnaHQpIGhpZ2hsaWdodEFsbCgpO1xuICB9XG5cbiAgLy8gbWFrZSBzdXJlIHdlIGFyZSBpbiB0aGUgYnJvd3NlciBlbnZpcm9ubWVudFxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGJvb3QsIGZhbHNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGxhbmd1YWdlIGdyYW1tYXIgbW9kdWxlXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBsYW5ndWFnZU5hbWVcbiAgICogQHBhcmFtIHtMYW5ndWFnZUZufSBsYW5ndWFnZURlZmluaXRpb25cbiAgICovXG4gIGZ1bmN0aW9uIHJlZ2lzdGVyTGFuZ3VhZ2UobGFuZ3VhZ2VOYW1lLCBsYW5ndWFnZURlZmluaXRpb24pIHtcbiAgICBsZXQgbGFuZyA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIGxhbmcgPSBsYW5ndWFnZURlZmluaXRpb24oaGxqcyk7XG4gICAgfSBjYXRjaCAoZXJyb3IkMSkge1xuICAgICAgZXJyb3IoXCJMYW5ndWFnZSBkZWZpbml0aW9uIGZvciAne30nIGNvdWxkIG5vdCBiZSByZWdpc3RlcmVkLlwiLnJlcGxhY2UoXCJ7fVwiLCBsYW5ndWFnZU5hbWUpKTtcbiAgICAgIC8vIGhhcmQgb3Igc29mdCBlcnJvclxuICAgICAgaWYgKCFTQUZFX01PREUpIHsgdGhyb3cgZXJyb3IkMTsgfSBlbHNlIHsgZXJyb3IoZXJyb3IkMSk7IH1cbiAgICAgIC8vIGxhbmd1YWdlcyB0aGF0IGhhdmUgc2VyaW91cyBlcnJvcnMgYXJlIHJlcGxhY2VkIHdpdGggZXNzZW50aWFsbHkgYVxuICAgICAgLy8gXCJwbGFpbnRleHRcIiBzdGFuZC1pbiBzbyB0aGF0IHRoZSBjb2RlIGJsb2NrcyB3aWxsIHN0aWxsIGdldCBub3JtYWxcbiAgICAgIC8vIGNzcyBjbGFzc2VzIGFwcGxpZWQgdG8gdGhlbSAtIGFuZCBvbmUgYmFkIGxhbmd1YWdlIHdvbid0IGJyZWFrIHRoZVxuICAgICAgLy8gZW50aXJlIGhpZ2hsaWdodGVyXG4gICAgICBsYW5nID0gUExBSU5URVhUX0xBTkdVQUdFO1xuICAgIH1cbiAgICAvLyBnaXZlIGl0IGEgdGVtcG9yYXJ5IG5hbWUgaWYgaXQgZG9lc24ndCBoYXZlIG9uZSBpbiB0aGUgbWV0YS1kYXRhXG4gICAgaWYgKCFsYW5nLm5hbWUpIGxhbmcubmFtZSA9IGxhbmd1YWdlTmFtZTtcbiAgICBsYW5ndWFnZXNbbGFuZ3VhZ2VOYW1lXSA9IGxhbmc7XG4gICAgbGFuZy5yYXdEZWZpbml0aW9uID0gbGFuZ3VhZ2VEZWZpbml0aW9uLmJpbmQobnVsbCwgaGxqcyk7XG5cbiAgICBpZiAobGFuZy5hbGlhc2VzKSB7XG4gICAgICByZWdpc3RlckFsaWFzZXMobGFuZy5hbGlhc2VzLCB7IGxhbmd1YWdlTmFtZSB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgbGFuZ3VhZ2UgZ3JhbW1hciBtb2R1bGVcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGxhbmd1YWdlTmFtZVxuICAgKi9cbiAgZnVuY3Rpb24gdW5yZWdpc3Rlckxhbmd1YWdlKGxhbmd1YWdlTmFtZSkge1xuICAgIGRlbGV0ZSBsYW5ndWFnZXNbbGFuZ3VhZ2VOYW1lXTtcbiAgICBmb3IgKGNvbnN0IGFsaWFzIG9mIE9iamVjdC5rZXlzKGFsaWFzZXMpKSB7XG4gICAgICBpZiAoYWxpYXNlc1thbGlhc10gPT09IGxhbmd1YWdlTmFtZSkge1xuICAgICAgICBkZWxldGUgYWxpYXNlc1thbGlhc107XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gTGlzdCBvZiBsYW5ndWFnZSBpbnRlcm5hbCBuYW1lc1xuICAgKi9cbiAgZnVuY3Rpb24gbGlzdExhbmd1YWdlcygpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMobGFuZ3VhZ2VzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIG5hbWUgb2YgdGhlIGxhbmd1YWdlIHRvIHJldHJpZXZlXG4gICAqIEByZXR1cm5zIHtMYW5ndWFnZSB8IHVuZGVmaW5lZH1cbiAgICovXG4gIGZ1bmN0aW9uIGdldExhbmd1YWdlKG5hbWUpIHtcbiAgICBuYW1lID0gKG5hbWUgfHwgJycpLnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIGxhbmd1YWdlc1tuYW1lXSB8fCBsYW5ndWFnZXNbYWxpYXNlc1tuYW1lXV07XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd8c3RyaW5nW119IGFsaWFzTGlzdCAtIHNpbmdsZSBhbGlhcyBvciBsaXN0IG9mIGFsaWFzZXNcbiAgICogQHBhcmFtIHt7bGFuZ3VhZ2VOYW1lOiBzdHJpbmd9fSBvcHRzXG4gICAqL1xuICBmdW5jdGlvbiByZWdpc3RlckFsaWFzZXMoYWxpYXNMaXN0LCB7IGxhbmd1YWdlTmFtZSB9KSB7XG4gICAgaWYgKHR5cGVvZiBhbGlhc0xpc3QgPT09ICdzdHJpbmcnKSB7XG4gICAgICBhbGlhc0xpc3QgPSBbYWxpYXNMaXN0XTtcbiAgICB9XG4gICAgYWxpYXNMaXN0LmZvckVhY2goYWxpYXMgPT4geyBhbGlhc2VzW2FsaWFzLnRvTG93ZXJDYXNlKCldID0gbGFuZ3VhZ2VOYW1lOyB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIGlmIGEgZ2l2ZW4gbGFuZ3VhZ2UgaGFzIGF1dG8tZGV0ZWN0aW9uIGVuYWJsZWRcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBuYW1lIG9mIHRoZSBsYW5ndWFnZVxuICAgKi9cbiAgZnVuY3Rpb24gYXV0b0RldGVjdGlvbihuYW1lKSB7XG4gICAgY29uc3QgbGFuZyA9IGdldExhbmd1YWdlKG5hbWUpO1xuICAgIHJldHVybiBsYW5nICYmICFsYW5nLmRpc2FibGVBdXRvZGV0ZWN0O1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZ3JhZGVzIHRoZSBvbGQgaGlnaGxpZ2h0QmxvY2sgcGx1Z2lucyB0byB0aGUgbmV3XG4gICAqIGhpZ2hsaWdodEVsZW1lbnQgQVBJXG4gICAqIEBwYXJhbSB7SExKU1BsdWdpbn0gcGx1Z2luXG4gICAqL1xuICBmdW5jdGlvbiB1cGdyYWRlUGx1Z2luQVBJKHBsdWdpbikge1xuICAgIC8vIFRPRE86IHJlbW92ZSB3aXRoIHYxMlxuICAgIGlmIChwbHVnaW5bXCJiZWZvcmU6aGlnaGxpZ2h0QmxvY2tcIl0gJiYgIXBsdWdpbltcImJlZm9yZTpoaWdobGlnaHRFbGVtZW50XCJdKSB7XG4gICAgICBwbHVnaW5bXCJiZWZvcmU6aGlnaGxpZ2h0RWxlbWVudFwiXSA9IChkYXRhKSA9PiB7XG4gICAgICAgIHBsdWdpbltcImJlZm9yZTpoaWdobGlnaHRCbG9ja1wiXShcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHsgYmxvY2s6IGRhdGEuZWwgfSwgZGF0YSlcbiAgICAgICAgKTtcbiAgICAgIH07XG4gICAgfVxuICAgIGlmIChwbHVnaW5bXCJhZnRlcjpoaWdobGlnaHRCbG9ja1wiXSAmJiAhcGx1Z2luW1wiYWZ0ZXI6aGlnaGxpZ2h0RWxlbWVudFwiXSkge1xuICAgICAgcGx1Z2luW1wiYWZ0ZXI6aGlnaGxpZ2h0RWxlbWVudFwiXSA9IChkYXRhKSA9PiB7XG4gICAgICAgIHBsdWdpbltcImFmdGVyOmhpZ2hsaWdodEJsb2NrXCJdKFxuICAgICAgICAgIE9iamVjdC5hc3NpZ24oeyBibG9jazogZGF0YS5lbCB9LCBkYXRhKVxuICAgICAgICApO1xuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtITEpTUGx1Z2lufSBwbHVnaW5cbiAgICovXG4gIGZ1bmN0aW9uIGFkZFBsdWdpbihwbHVnaW4pIHtcbiAgICB1cGdyYWRlUGx1Z2luQVBJKHBsdWdpbik7XG4gICAgcGx1Z2lucy5wdXNoKHBsdWdpbik7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtITEpTUGx1Z2lufSBwbHVnaW5cbiAgICovXG4gIGZ1bmN0aW9uIHJlbW92ZVBsdWdpbihwbHVnaW4pIHtcbiAgICBjb25zdCBpbmRleCA9IHBsdWdpbnMuaW5kZXhPZihwbHVnaW4pO1xuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIHBsdWdpbnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHtQbHVnaW5FdmVudH0gZXZlbnRcbiAgICogQHBhcmFtIHthbnl9IGFyZ3NcbiAgICovXG4gIGZ1bmN0aW9uIGZpcmUoZXZlbnQsIGFyZ3MpIHtcbiAgICBjb25zdCBjYiA9IGV2ZW50O1xuICAgIHBsdWdpbnMuZm9yRWFjaChmdW5jdGlvbihwbHVnaW4pIHtcbiAgICAgIGlmIChwbHVnaW5bY2JdKSB7XG4gICAgICAgIHBsdWdpbltjYl0oYXJncyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogREVQUkVDQVRFRFxuICAgKiBAcGFyYW0ge0hpZ2hsaWdodGVkSFRNTEVsZW1lbnR9IGVsXG4gICAqL1xuICBmdW5jdGlvbiBkZXByZWNhdGVIaWdobGlnaHRCbG9jayhlbCkge1xuICAgIGRlcHJlY2F0ZWQoXCIxMC43LjBcIiwgXCJoaWdobGlnaHRCbG9jayB3aWxsIGJlIHJlbW92ZWQgZW50aXJlbHkgaW4gdjEyLjBcIik7XG4gICAgZGVwcmVjYXRlZChcIjEwLjcuMFwiLCBcIlBsZWFzZSB1c2UgaGlnaGxpZ2h0RWxlbWVudCBub3cuXCIpO1xuXG4gICAgcmV0dXJuIGhpZ2hsaWdodEVsZW1lbnQoZWwpO1xuICB9XG5cbiAgLyogSW50ZXJmYWNlIGRlZmluaXRpb24gKi9cbiAgT2JqZWN0LmFzc2lnbihobGpzLCB7XG4gICAgaGlnaGxpZ2h0LFxuICAgIGhpZ2hsaWdodEF1dG8sXG4gICAgaGlnaGxpZ2h0QWxsLFxuICAgIGhpZ2hsaWdodEVsZW1lbnQsXG4gICAgLy8gVE9ETzogUmVtb3ZlIHdpdGggdjEyIEFQSVxuICAgIGhpZ2hsaWdodEJsb2NrOiBkZXByZWNhdGVIaWdobGlnaHRCbG9jayxcbiAgICBjb25maWd1cmUsXG4gICAgaW5pdEhpZ2hsaWdodGluZyxcbiAgICBpbml0SGlnaGxpZ2h0aW5nT25Mb2FkLFxuICAgIHJlZ2lzdGVyTGFuZ3VhZ2UsXG4gICAgdW5yZWdpc3Rlckxhbmd1YWdlLFxuICAgIGxpc3RMYW5ndWFnZXMsXG4gICAgZ2V0TGFuZ3VhZ2UsXG4gICAgcmVnaXN0ZXJBbGlhc2VzLFxuICAgIGF1dG9EZXRlY3Rpb24sXG4gICAgaW5oZXJpdCxcbiAgICBhZGRQbHVnaW4sXG4gICAgcmVtb3ZlUGx1Z2luXG4gIH0pO1xuXG4gIGhsanMuZGVidWdNb2RlID0gZnVuY3Rpb24oKSB7IFNBRkVfTU9ERSA9IGZhbHNlOyB9O1xuICBobGpzLnNhZmVNb2RlID0gZnVuY3Rpb24oKSB7IFNBRkVfTU9ERSA9IHRydWU7IH07XG4gIGhsanMudmVyc2lvblN0cmluZyA9IHZlcnNpb247XG5cbiAgaGxqcy5yZWdleCA9IHtcbiAgICBjb25jYXQ6IGNvbmNhdCxcbiAgICBsb29rYWhlYWQ6IGxvb2thaGVhZCxcbiAgICBlaXRoZXI6IGVpdGhlcixcbiAgICBvcHRpb25hbDogb3B0aW9uYWwsXG4gICAgYW55TnVtYmVyT2ZUaW1lczogYW55TnVtYmVyT2ZUaW1lc1xuICB9O1xuXG4gIGZvciAoY29uc3Qga2V5IGluIE1PREVTKSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGlmICh0eXBlb2YgTU9ERVNba2V5XSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgZGVlcEZyZWV6ZShNT0RFU1trZXldKTtcbiAgICB9XG4gIH1cblxuICAvLyBtZXJnZSBhbGwgdGhlIG1vZGVzL3JlZ2V4ZXMgaW50byBvdXIgbWFpbiBvYmplY3RcbiAgT2JqZWN0LmFzc2lnbihobGpzLCBNT0RFUyk7XG5cbiAgcmV0dXJuIGhsanM7XG59O1xuXG4vLyBPdGhlciBuYW1lcyBmb3IgdGhlIHZhcmlhYmxlIG1heSBicmVhayBidWlsZCBzY3JpcHRcbmNvbnN0IGhpZ2hsaWdodCA9IEhMSlMoe30pO1xuXG4vLyByZXR1cm5zIGEgbmV3IGluc3RhbmNlIG9mIHRoZSBoaWdobGlnaHRlciB0byBiZSB1c2VkIGZvciBleHRlbnNpb25zXG4vLyBjaGVjayBodHRwczovL2dpdGh1Yi5jb20vd29vb3JtL2xvd2xpZ2h0L2lzc3Vlcy80N1xuaGlnaGxpZ2h0Lm5ld0luc3RhbmNlID0gKCkgPT4gSExKUyh7fSk7XG5cbm1vZHVsZS5leHBvcnRzID0gaGlnaGxpZ2h0O1xuaGlnaGxpZ2h0LkhpZ2hsaWdodEpTID0gaGlnaGxpZ2h0O1xuaGlnaGxpZ2h0LmRlZmF1bHQgPSBoaWdobGlnaHQ7XG4iLCIvKlxuTGFuZ3VhZ2U6IEJhc2hcbkF1dGhvcjogdmFoIDx2YWh0ZW5iZXJnQGdtYWlsLmNvbT5cbkNvbnRyaWJ1dHJvcnM6IEJlbmphbWluIFBhbm5lbGwgPGNvbnRhY3RAc2llcnJhc29mdHdvcmtzLmNvbT5cbldlYnNpdGU6IGh0dHBzOi8vd3d3LmdudS5vcmcvc29mdHdhcmUvYmFzaC9cbkNhdGVnb3J5OiBjb21tb24sIHNjcmlwdGluZ1xuKi9cblxuLyoqIEB0eXBlIExhbmd1YWdlRm4gKi9cbmZ1bmN0aW9uIGJhc2goaGxqcykge1xuICBjb25zdCByZWdleCA9IGhsanMucmVnZXg7XG4gIGNvbnN0IFZBUiA9IHt9O1xuICBjb25zdCBCUkFDRURfVkFSID0ge1xuICAgIGJlZ2luOiAvXFwkXFx7LyxcbiAgICBlbmQ6IC9cXH0vLFxuICAgIGNvbnRhaW5zOiBbXG4gICAgICBcInNlbGZcIixcbiAgICAgIHtcbiAgICAgICAgYmVnaW46IC86LS8sXG4gICAgICAgIGNvbnRhaW5zOiBbIFZBUiBdXG4gICAgICB9IC8vIGRlZmF1bHQgdmFsdWVzXG4gICAgXVxuICB9O1xuICBPYmplY3QuYXNzaWduKFZBUiwge1xuICAgIGNsYXNzTmFtZTogJ3ZhcmlhYmxlJyxcbiAgICB2YXJpYW50czogW1xuICAgICAgeyBiZWdpbjogcmVnZXguY29uY2F0KC9cXCRbXFx3XFxkI0BdW1xcd1xcZF9dKi8sXG4gICAgICAgIC8vIG5lZ2F0aXZlIGxvb2stYWhlYWQgdHJpZXMgdG8gYXZvaWQgbWF0Y2hpbmcgcGF0dGVybnMgdGhhdCBhcmUgbm90XG4gICAgICAgIC8vIFBlcmwgYXQgYWxsIGxpa2UgJGlkZW50JCwgQGlkZW50QCwgZXRjLlxuICAgICAgICBgKD8hW1xcXFx3XFxcXGRdKSg/IVskXSlgKSB9LFxuICAgICAgQlJBQ0VEX1ZBUlxuICAgIF1cbiAgfSk7XG5cbiAgY29uc3QgU1VCU1QgPSB7XG4gICAgY2xhc3NOYW1lOiAnc3Vic3QnLFxuICAgIGJlZ2luOiAvXFwkXFwoLyxcbiAgICBlbmQ6IC9cXCkvLFxuICAgIGNvbnRhaW5zOiBbIGhsanMuQkFDS1NMQVNIX0VTQ0FQRSBdXG4gIH07XG4gIGNvbnN0IENPTU1FTlQgPSBobGpzLmluaGVyaXQoXG4gICAgaGxqcy5DT01NRU5UKCksXG4gICAge1xuICAgICAgbWF0Y2g6IFtcbiAgICAgICAgLyhefFxccykvLFxuICAgICAgICAvIy4qJC9cbiAgICAgIF0sXG4gICAgICBzY29wZToge1xuICAgICAgICAyOiAnY29tbWVudCdcbiAgICAgIH1cbiAgICB9XG4gICk7XG4gIGNvbnN0IEhFUkVfRE9DID0ge1xuICAgIGJlZ2luOiAvPDwtP1xccyooPz1cXHcrKS8sXG4gICAgc3RhcnRzOiB7IGNvbnRhaW5zOiBbXG4gICAgICBobGpzLkVORF9TQU1FX0FTX0JFR0lOKHtcbiAgICAgICAgYmVnaW46IC8oXFx3KykvLFxuICAgICAgICBlbmQ6IC8oXFx3KykvLFxuICAgICAgICBjbGFzc05hbWU6ICdzdHJpbmcnXG4gICAgICB9KVxuICAgIF0gfVxuICB9O1xuICBjb25zdCBRVU9URV9TVFJJTkcgPSB7XG4gICAgY2xhc3NOYW1lOiAnc3RyaW5nJyxcbiAgICBiZWdpbjogL1wiLyxcbiAgICBlbmQ6IC9cIi8sXG4gICAgY29udGFpbnM6IFtcbiAgICAgIGhsanMuQkFDS1NMQVNIX0VTQ0FQRSxcbiAgICAgIFZBUixcbiAgICAgIFNVQlNUXG4gICAgXVxuICB9O1xuICBTVUJTVC5jb250YWlucy5wdXNoKFFVT1RFX1NUUklORyk7XG4gIGNvbnN0IEVTQ0FQRURfUVVPVEUgPSB7XG4gICAgbWF0Y2g6IC9cXFxcXCIvXG4gIH07XG4gIGNvbnN0IEFQT1NfU1RSSU5HID0ge1xuICAgIGNsYXNzTmFtZTogJ3N0cmluZycsXG4gICAgYmVnaW46IC8nLyxcbiAgICBlbmQ6IC8nL1xuICB9O1xuICBjb25zdCBFU0NBUEVEX0FQT1MgPSB7XG4gICAgbWF0Y2g6IC9cXFxcJy9cbiAgfTtcbiAgY29uc3QgQVJJVEhNRVRJQyA9IHtcbiAgICBiZWdpbjogL1xcJD9cXChcXCgvLFxuICAgIGVuZDogL1xcKVxcKS8sXG4gICAgY29udGFpbnM6IFtcbiAgICAgIHtcbiAgICAgICAgYmVnaW46IC9cXGQrI1swLTlhLWZdKy8sXG4gICAgICAgIGNsYXNzTmFtZTogXCJudW1iZXJcIlxuICAgICAgfSxcbiAgICAgIGhsanMuTlVNQkVSX01PREUsXG4gICAgICBWQVJcbiAgICBdXG4gIH07XG4gIGNvbnN0IFNIX0xJS0VfU0hFTExTID0gW1xuICAgIFwiZmlzaFwiLFxuICAgIFwiYmFzaFwiLFxuICAgIFwienNoXCIsXG4gICAgXCJzaFwiLFxuICAgIFwiY3NoXCIsXG4gICAgXCJrc2hcIixcbiAgICBcInRjc2hcIixcbiAgICBcImRhc2hcIixcbiAgICBcInNjc2hcIixcbiAgXTtcbiAgY29uc3QgS05PV05fU0hFQkFORyA9IGhsanMuU0hFQkFORyh7XG4gICAgYmluYXJ5OiBgKCR7U0hfTElLRV9TSEVMTFMuam9pbihcInxcIil9KWAsXG4gICAgcmVsZXZhbmNlOiAxMFxuICB9KTtcbiAgY29uc3QgRlVOQ1RJT04gPSB7XG4gICAgY2xhc3NOYW1lOiAnZnVuY3Rpb24nLFxuICAgIGJlZ2luOiAvXFx3W1xcd1xcZF9dKlxccypcXChcXHMqXFwpXFxzKlxcey8sXG4gICAgcmV0dXJuQmVnaW46IHRydWUsXG4gICAgY29udGFpbnM6IFsgaGxqcy5pbmhlcml0KGhsanMuVElUTEVfTU9ERSwgeyBiZWdpbjogL1xcd1tcXHdcXGRfXSovIH0pIF0sXG4gICAgcmVsZXZhbmNlOiAwXG4gIH07XG5cbiAgY29uc3QgS0VZV09SRFMgPSBbXG4gICAgXCJpZlwiLFxuICAgIFwidGhlblwiLFxuICAgIFwiZWxzZVwiLFxuICAgIFwiZWxpZlwiLFxuICAgIFwiZmlcIixcbiAgICBcImZvclwiLFxuICAgIFwid2hpbGVcIixcbiAgICBcInVudGlsXCIsXG4gICAgXCJpblwiLFxuICAgIFwiZG9cIixcbiAgICBcImRvbmVcIixcbiAgICBcImNhc2VcIixcbiAgICBcImVzYWNcIixcbiAgICBcImZ1bmN0aW9uXCIsXG4gICAgXCJzZWxlY3RcIlxuICBdO1xuXG4gIGNvbnN0IExJVEVSQUxTID0gW1xuICAgIFwidHJ1ZVwiLFxuICAgIFwiZmFsc2VcIlxuICBdO1xuXG4gIC8vIHRvIGNvbnN1bWUgcGF0aHMgdG8gcHJldmVudCBrZXl3b3JkIG1hdGNoZXMgaW5zaWRlIHRoZW1cbiAgY29uc3QgUEFUSF9NT0RFID0geyBtYXRjaDogLyhcXC9bYS16Ll8tXSspKy8gfTtcblxuICAvLyBodHRwOi8vd3d3LmdudS5vcmcvc29mdHdhcmUvYmFzaC9tYW51YWwvaHRtbF9ub2RlL1NoZWxsLUJ1aWx0aW4tQ29tbWFuZHMuaHRtbFxuICBjb25zdCBTSEVMTF9CVUlMVF9JTlMgPSBbXG4gICAgXCJicmVha1wiLFxuICAgIFwiY2RcIixcbiAgICBcImNvbnRpbnVlXCIsXG4gICAgXCJldmFsXCIsXG4gICAgXCJleGVjXCIsXG4gICAgXCJleGl0XCIsXG4gICAgXCJleHBvcnRcIixcbiAgICBcImdldG9wdHNcIixcbiAgICBcImhhc2hcIixcbiAgICBcInB3ZFwiLFxuICAgIFwicmVhZG9ubHlcIixcbiAgICBcInJldHVyblwiLFxuICAgIFwic2hpZnRcIixcbiAgICBcInRlc3RcIixcbiAgICBcInRpbWVzXCIsXG4gICAgXCJ0cmFwXCIsXG4gICAgXCJ1bWFza1wiLFxuICAgIFwidW5zZXRcIlxuICBdO1xuXG4gIGNvbnN0IEJBU0hfQlVJTFRfSU5TID0gW1xuICAgIFwiYWxpYXNcIixcbiAgICBcImJpbmRcIixcbiAgICBcImJ1aWx0aW5cIixcbiAgICBcImNhbGxlclwiLFxuICAgIFwiY29tbWFuZFwiLFxuICAgIFwiZGVjbGFyZVwiLFxuICAgIFwiZWNob1wiLFxuICAgIFwiZW5hYmxlXCIsXG4gICAgXCJoZWxwXCIsXG4gICAgXCJsZXRcIixcbiAgICBcImxvY2FsXCIsXG4gICAgXCJsb2dvdXRcIixcbiAgICBcIm1hcGZpbGVcIixcbiAgICBcInByaW50ZlwiLFxuICAgIFwicmVhZFwiLFxuICAgIFwicmVhZGFycmF5XCIsXG4gICAgXCJzb3VyY2VcIixcbiAgICBcInN1ZG9cIixcbiAgICBcInR5cGVcIixcbiAgICBcInR5cGVzZXRcIixcbiAgICBcInVsaW1pdFwiLFxuICAgIFwidW5hbGlhc1wiXG4gIF07XG5cbiAgY29uc3QgWlNIX0JVSUxUX0lOUyA9IFtcbiAgICBcImF1dG9sb2FkXCIsXG4gICAgXCJiZ1wiLFxuICAgIFwiYmluZGtleVwiLFxuICAgIFwiYnllXCIsXG4gICAgXCJjYXBcIixcbiAgICBcImNoZGlyXCIsXG4gICAgXCJjbG9uZVwiLFxuICAgIFwiY29tcGFyZ3VtZW50c1wiLFxuICAgIFwiY29tcGNhbGxcIixcbiAgICBcImNvbXBjdGxcIixcbiAgICBcImNvbXBkZXNjcmliZVwiLFxuICAgIFwiY29tcGZpbGVzXCIsXG4gICAgXCJjb21wZ3JvdXBzXCIsXG4gICAgXCJjb21wcXVvdGVcIixcbiAgICBcImNvbXB0YWdzXCIsXG4gICAgXCJjb21wdHJ5XCIsXG4gICAgXCJjb21wdmFsdWVzXCIsXG4gICAgXCJkaXJzXCIsXG4gICAgXCJkaXNhYmxlXCIsXG4gICAgXCJkaXNvd25cIixcbiAgICBcImVjaG90Y1wiLFxuICAgIFwiZWNob3RpXCIsXG4gICAgXCJlbXVsYXRlXCIsXG4gICAgXCJmY1wiLFxuICAgIFwiZmdcIixcbiAgICBcImZsb2F0XCIsXG4gICAgXCJmdW5jdGlvbnNcIixcbiAgICBcImdldGNhcFwiLFxuICAgIFwiZ2V0bG5cIixcbiAgICBcImhpc3RvcnlcIixcbiAgICBcImludGVnZXJcIixcbiAgICBcImpvYnNcIixcbiAgICBcImtpbGxcIixcbiAgICBcImxpbWl0XCIsXG4gICAgXCJsb2dcIixcbiAgICBcIm5vZ2xvYlwiLFxuICAgIFwicG9wZFwiLFxuICAgIFwicHJpbnRcIixcbiAgICBcInB1c2hkXCIsXG4gICAgXCJwdXNobG5cIixcbiAgICBcInJlaGFzaFwiLFxuICAgIFwic2NoZWRcIixcbiAgICBcInNldGNhcFwiLFxuICAgIFwic2V0b3B0XCIsXG4gICAgXCJzdGF0XCIsXG4gICAgXCJzdXNwZW5kXCIsXG4gICAgXCJ0dHljdGxcIixcbiAgICBcInVuZnVuY3Rpb25cIixcbiAgICBcInVuaGFzaFwiLFxuICAgIFwidW5saW1pdFwiLFxuICAgIFwidW5zZXRvcHRcIixcbiAgICBcInZhcmVkXCIsXG4gICAgXCJ3YWl0XCIsXG4gICAgXCJ3aGVuY2VcIixcbiAgICBcIndoZXJlXCIsXG4gICAgXCJ3aGljaFwiLFxuICAgIFwiemNvbXBpbGVcIixcbiAgICBcInpmb3JtYXRcIixcbiAgICBcInpmdHBcIixcbiAgICBcInpsZVwiLFxuICAgIFwiem1vZGxvYWRcIixcbiAgICBcInpwYXJzZW9wdHNcIixcbiAgICBcInpwcm9mXCIsXG4gICAgXCJ6cHR5XCIsXG4gICAgXCJ6cmVnZXhwYXJzZVwiLFxuICAgIFwienNvY2tldFwiLFxuICAgIFwienN0eWxlXCIsXG4gICAgXCJ6dGNwXCJcbiAgXTtcblxuICBjb25zdCBHTlVfQ09SRV9VVElMUyA9IFtcbiAgICBcImNoY29uXCIsXG4gICAgXCJjaGdycFwiLFxuICAgIFwiY2hvd25cIixcbiAgICBcImNobW9kXCIsXG4gICAgXCJjcFwiLFxuICAgIFwiZGRcIixcbiAgICBcImRmXCIsXG4gICAgXCJkaXJcIixcbiAgICBcImRpcmNvbG9yc1wiLFxuICAgIFwibG5cIixcbiAgICBcImxzXCIsXG4gICAgXCJta2RpclwiLFxuICAgIFwibWtmaWZvXCIsXG4gICAgXCJta25vZFwiLFxuICAgIFwibWt0ZW1wXCIsXG4gICAgXCJtdlwiLFxuICAgIFwicmVhbHBhdGhcIixcbiAgICBcInJtXCIsXG4gICAgXCJybWRpclwiLFxuICAgIFwic2hyZWRcIixcbiAgICBcInN5bmNcIixcbiAgICBcInRvdWNoXCIsXG4gICAgXCJ0cnVuY2F0ZVwiLFxuICAgIFwidmRpclwiLFxuICAgIFwiYjJzdW1cIixcbiAgICBcImJhc2UzMlwiLFxuICAgIFwiYmFzZTY0XCIsXG4gICAgXCJjYXRcIixcbiAgICBcImNrc3VtXCIsXG4gICAgXCJjb21tXCIsXG4gICAgXCJjc3BsaXRcIixcbiAgICBcImN1dFwiLFxuICAgIFwiZXhwYW5kXCIsXG4gICAgXCJmbXRcIixcbiAgICBcImZvbGRcIixcbiAgICBcImhlYWRcIixcbiAgICBcImpvaW5cIixcbiAgICBcIm1kNXN1bVwiLFxuICAgIFwibmxcIixcbiAgICBcIm51bWZtdFwiLFxuICAgIFwib2RcIixcbiAgICBcInBhc3RlXCIsXG4gICAgXCJwdHhcIixcbiAgICBcInByXCIsXG4gICAgXCJzaGExc3VtXCIsXG4gICAgXCJzaGEyMjRzdW1cIixcbiAgICBcInNoYTI1NnN1bVwiLFxuICAgIFwic2hhMzg0c3VtXCIsXG4gICAgXCJzaGE1MTJzdW1cIixcbiAgICBcInNodWZcIixcbiAgICBcInNvcnRcIixcbiAgICBcInNwbGl0XCIsXG4gICAgXCJzdW1cIixcbiAgICBcInRhY1wiLFxuICAgIFwidGFpbFwiLFxuICAgIFwidHJcIixcbiAgICBcInRzb3J0XCIsXG4gICAgXCJ1bmV4cGFuZFwiLFxuICAgIFwidW5pcVwiLFxuICAgIFwid2NcIixcbiAgICBcImFyY2hcIixcbiAgICBcImJhc2VuYW1lXCIsXG4gICAgXCJjaHJvb3RcIixcbiAgICBcImRhdGVcIixcbiAgICBcImRpcm5hbWVcIixcbiAgICBcImR1XCIsXG4gICAgXCJlY2hvXCIsXG4gICAgXCJlbnZcIixcbiAgICBcImV4cHJcIixcbiAgICBcImZhY3RvclwiLFxuICAgIC8vIFwiZmFsc2VcIiwgLy8ga2V5d29yZCBsaXRlcmFsIGFscmVhZHlcbiAgICBcImdyb3Vwc1wiLFxuICAgIFwiaG9zdGlkXCIsXG4gICAgXCJpZFwiLFxuICAgIFwibGlua1wiLFxuICAgIFwibG9nbmFtZVwiLFxuICAgIFwibmljZVwiLFxuICAgIFwibm9odXBcIixcbiAgICBcIm5wcm9jXCIsXG4gICAgXCJwYXRoY2hrXCIsXG4gICAgXCJwaW5reVwiLFxuICAgIFwicHJpbnRlbnZcIixcbiAgICBcInByaW50ZlwiLFxuICAgIFwicHdkXCIsXG4gICAgXCJyZWFkbGlua1wiLFxuICAgIFwicnVuY29uXCIsXG4gICAgXCJzZXFcIixcbiAgICBcInNsZWVwXCIsXG4gICAgXCJzdGF0XCIsXG4gICAgXCJzdGRidWZcIixcbiAgICBcInN0dHlcIixcbiAgICBcInRlZVwiLFxuICAgIFwidGVzdFwiLFxuICAgIFwidGltZW91dFwiLFxuICAgIC8vIFwidHJ1ZVwiLCAvLyBrZXl3b3JkIGxpdGVyYWwgYWxyZWFkeVxuICAgIFwidHR5XCIsXG4gICAgXCJ1bmFtZVwiLFxuICAgIFwidW5saW5rXCIsXG4gICAgXCJ1cHRpbWVcIixcbiAgICBcInVzZXJzXCIsXG4gICAgXCJ3aG9cIixcbiAgICBcIndob2FtaVwiLFxuICAgIFwieWVzXCJcbiAgXTtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdCYXNoJyxcbiAgICBhbGlhc2VzOiBbXG4gICAgICAnc2gnLFxuICAgICAgJ3pzaCdcbiAgICBdLFxuICAgIGtleXdvcmRzOiB7XG4gICAgICAkcGF0dGVybjogL1xcYlthLXpdW2EtejAtOS5fLV0rXFxiLyxcbiAgICAgIGtleXdvcmQ6IEtFWVdPUkRTLFxuICAgICAgbGl0ZXJhbDogTElURVJBTFMsXG4gICAgICBidWlsdF9pbjogW1xuICAgICAgICAuLi5TSEVMTF9CVUlMVF9JTlMsXG4gICAgICAgIC4uLkJBU0hfQlVJTFRfSU5TLFxuICAgICAgICAvLyBTaGVsbCBtb2RpZmllcnNcbiAgICAgICAgXCJzZXRcIixcbiAgICAgICAgXCJzaG9wdFwiLFxuICAgICAgICAuLi5aU0hfQlVJTFRfSU5TLFxuICAgICAgICAuLi5HTlVfQ09SRV9VVElMU1xuICAgICAgXVxuICAgIH0sXG4gICAgY29udGFpbnM6IFtcbiAgICAgIEtOT1dOX1NIRUJBTkcsIC8vIHRvIGNhdGNoIGtub3duIHNoZWxscyBhbmQgYm9vc3QgcmVsZXZhbmN5XG4gICAgICBobGpzLlNIRUJBTkcoKSwgLy8gdG8gY2F0Y2ggdW5rbm93biBzaGVsbHMgYnV0IHN0aWxsIGhpZ2hsaWdodCB0aGUgc2hlYmFuZ1xuICAgICAgRlVOQ1RJT04sXG4gICAgICBBUklUSE1FVElDLFxuICAgICAgQ09NTUVOVCxcbiAgICAgIEhFUkVfRE9DLFxuICAgICAgUEFUSF9NT0RFLFxuICAgICAgUVVPVEVfU1RSSU5HLFxuICAgICAgRVNDQVBFRF9RVU9URSxcbiAgICAgIEFQT1NfU1RSSU5HLFxuICAgICAgRVNDQVBFRF9BUE9TLFxuICAgICAgVkFSXG4gICAgXVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2g7XG4iLCIvKlxuTGFuZ3VhZ2U6IEhUVFBcbkRlc2NyaXB0aW9uOiBIVFRQIHJlcXVlc3QgYW5kIHJlc3BvbnNlIGhlYWRlcnMgd2l0aCBhdXRvbWF0aWMgYm9keSBoaWdobGlnaHRpbmdcbkF1dGhvcjogSXZhbiBTYWdhbGFldiA8bWFuaWFjQHNvZnR3YXJlbWFuaWFjcy5vcmc+XG5DYXRlZ29yeTogcHJvdG9jb2xzLCB3ZWJcbldlYnNpdGU6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0hUVFAvT3ZlcnZpZXdcbiovXG5cbmZ1bmN0aW9uIGh0dHAoaGxqcykge1xuICBjb25zdCByZWdleCA9IGhsanMucmVnZXg7XG4gIGNvbnN0IFZFUlNJT04gPSAnSFRUUC8oWzMyXXwxXFxcXC5bMDFdKSc7XG4gIGNvbnN0IEhFQURFUl9OQU1FID0gL1tBLVphLXpdW0EtWmEtejAtOS1dKi87XG4gIGNvbnN0IEhFQURFUiA9IHtcbiAgICBjbGFzc05hbWU6ICdhdHRyaWJ1dGUnLFxuICAgIGJlZ2luOiByZWdleC5jb25jYXQoJ14nLCBIRUFERVJfTkFNRSwgJyg/PVxcXFw6XFxcXHMpJyksXG4gICAgc3RhcnRzOiB7IGNvbnRhaW5zOiBbXG4gICAgICB7XG4gICAgICAgIGNsYXNzTmFtZTogXCJwdW5jdHVhdGlvblwiLFxuICAgICAgICBiZWdpbjogLzogLyxcbiAgICAgICAgcmVsZXZhbmNlOiAwLFxuICAgICAgICBzdGFydHM6IHtcbiAgICAgICAgICBlbmQ6ICckJyxcbiAgICAgICAgICByZWxldmFuY2U6IDBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIF0gfVxuICB9O1xuICBjb25zdCBIRUFERVJTX0FORF9CT0RZID0gW1xuICAgIEhFQURFUixcbiAgICB7XG4gICAgICBiZWdpbjogJ1xcXFxuXFxcXG4nLFxuICAgICAgc3RhcnRzOiB7XG4gICAgICAgIHN1Ykxhbmd1YWdlOiBbXSxcbiAgICAgICAgZW5kc1dpdGhQYXJlbnQ6IHRydWVcbiAgICAgIH1cbiAgICB9XG4gIF07XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnSFRUUCcsXG4gICAgYWxpYXNlczogWyAnaHR0cHMnIF0sXG4gICAgaWxsZWdhbDogL1xcUy8sXG4gICAgY29udGFpbnM6IFtcbiAgICAgIC8vIHJlc3BvbnNlXG4gICAgICB7XG4gICAgICAgIGJlZ2luOiAnXig/PScgKyBWRVJTSU9OICsgXCIgXFxcXGR7M30pXCIsXG4gICAgICAgIGVuZDogLyQvLFxuICAgICAgICBjb250YWluczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogXCJtZXRhXCIsXG4gICAgICAgICAgICBiZWdpbjogVkVSU0lPTlxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgY2xhc3NOYW1lOiAnbnVtYmVyJyxcbiAgICAgICAgICAgIGJlZ2luOiAnXFxcXGJcXFxcZHszfVxcXFxiJ1xuICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgc3RhcnRzOiB7XG4gICAgICAgICAgZW5kOiAvXFxiXFxCLyxcbiAgICAgICAgICBpbGxlZ2FsOiAvXFxTLyxcbiAgICAgICAgICBjb250YWluczogSEVBREVSU19BTkRfQk9EWVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLy8gcmVxdWVzdFxuICAgICAge1xuICAgICAgICBiZWdpbjogJyg/PV5bQS1aXSsgKC4qPykgJyArIFZFUlNJT04gKyAnJCknLFxuICAgICAgICBlbmQ6IC8kLyxcbiAgICAgICAgY29udGFpbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjbGFzc05hbWU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgYmVnaW46ICcgJyxcbiAgICAgICAgICAgIGVuZDogJyAnLFxuICAgICAgICAgICAgZXhjbHVkZUJlZ2luOiB0cnVlLFxuICAgICAgICAgICAgZXhjbHVkZUVuZDogdHJ1ZVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgY2xhc3NOYW1lOiBcIm1ldGFcIixcbiAgICAgICAgICAgIGJlZ2luOiBWRVJTSU9OXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjbGFzc05hbWU6ICdrZXl3b3JkJyxcbiAgICAgICAgICAgIGJlZ2luOiAnW0EtWl0rJ1xuICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgc3RhcnRzOiB7XG4gICAgICAgICAgZW5kOiAvXFxiXFxCLyxcbiAgICAgICAgICBpbGxlZ2FsOiAvXFxTLyxcbiAgICAgICAgICBjb250YWluczogSEVBREVSU19BTkRfQk9EWVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLy8gdG8gYWxsb3cgaGVhZGVycyB0byB3b3JrIGV2ZW4gd2l0aG91dCBhIHByZWFtYmxlXG4gICAgICBobGpzLmluaGVyaXQoSEVBREVSLCB7IHJlbGV2YW5jZTogMCB9KVxuICAgIF1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBodHRwO1xuIiwiLypcbkxhbmd1YWdlOiBQSFBcbkF1dGhvcjogVmljdG9yIEthcmFtemluIDxWaWN0b3IuS2FyYW16aW5AZW50ZXJyYS1pbmMuY29tPlxuQ29udHJpYnV0b3JzOiBFdmdlbnkgU3RlcGFuaXNjaGV2IDxpbWJvbGtAZ21haWwuY29tPiwgSXZhbiBTYWdhbGFldiA8bWFuaWFjQHNvZnR3YXJlbWFuaWFjcy5vcmc+XG5XZWJzaXRlOiBodHRwczovL3d3dy5waHAubmV0XG5DYXRlZ29yeTogY29tbW9uXG4qL1xuXG4vKipcbiAqIEBwYXJhbSB7SExKU0FwaX0gaGxqc1xuICogQHJldHVybnMge0xhbmd1YWdlRGV0YWlsfVxuICogKi9cbmZ1bmN0aW9uIHBocChobGpzKSB7XG4gIGNvbnN0IHJlZ2V4ID0gaGxqcy5yZWdleDtcbiAgLy8gbmVnYXRpdmUgbG9vay1haGVhZCB0cmllcyB0byBhdm9pZCBtYXRjaGluZyBwYXR0ZXJucyB0aGF0IGFyZSBub3RcbiAgLy8gUGVybCBhdCBhbGwgbGlrZSAkaWRlbnQkLCBAaWRlbnRALCBldGMuXG4gIGNvbnN0IE5PVF9QRVJMX0VUQyA9IC8oPyFbQS1aYS16MC05XSkoPyFbJF0pLztcbiAgY29uc3QgSURFTlRfUkUgPSByZWdleC5jb25jYXQoXG4gICAgL1thLXpBLVpfXFx4N2YtXFx4ZmZdW2EtekEtWjAtOV9cXHg3Zi1cXHhmZl0qLyxcbiAgICBOT1RfUEVSTF9FVEMpO1xuICAvLyBXaWxsIG5vdCBkZXRlY3QgY2FtZWxDYXNlIGNsYXNzZXNcbiAgY29uc3QgUEFTQ0FMX0NBU0VfQ0xBU1NfTkFNRV9SRSA9IHJlZ2V4LmNvbmNhdChcbiAgICAvKFxcXFw/W0EtWl1bYS16MC05X1xceDdmLVxceGZmXSt8XFxcXD9bQS1aXSsoPz1bQS1aXVthLXowLTlfXFx4N2YtXFx4ZmZdKSl7MSx9LyxcbiAgICBOT1RfUEVSTF9FVEMpO1xuICBjb25zdCBWQVJJQUJMRSA9IHtcbiAgICBzY29wZTogJ3ZhcmlhYmxlJyxcbiAgICBtYXRjaDogJ1xcXFwkKycgKyBJREVOVF9SRSxcbiAgfTtcbiAgY29uc3QgUFJFUFJPQ0VTU09SID0ge1xuICAgIHNjb3BlOiAnbWV0YScsXG4gICAgdmFyaWFudHM6IFtcbiAgICAgIHsgYmVnaW46IC88XFw/cGhwLywgcmVsZXZhbmNlOiAxMCB9LCAvLyBib29zdCBmb3Igb2J2aW91cyBQSFBcbiAgICAgIHsgYmVnaW46IC88XFw/PS8gfSxcbiAgICAgIC8vIGxlc3MgcmVsZXZhbnQgcGVyIFBTUi0xIHdoaWNoIHNheXMgbm90IHRvIHVzZSBzaG9ydC10YWdzXG4gICAgICB7IGJlZ2luOiAvPFxcPy8sIHJlbGV2YW5jZTogMC4xIH0sXG4gICAgICB7IGJlZ2luOiAvXFw/Pi8gfSAvLyBlbmQgcGhwIHRhZ1xuICAgIF1cbiAgfTtcbiAgY29uc3QgU1VCU1QgPSB7XG4gICAgc2NvcGU6ICdzdWJzdCcsXG4gICAgdmFyaWFudHM6IFtcbiAgICAgIHsgYmVnaW46IC9cXCRcXHcrLyB9LFxuICAgICAge1xuICAgICAgICBiZWdpbjogL1xce1xcJC8sXG4gICAgICAgIGVuZDogL1xcfS9cbiAgICAgIH1cbiAgICBdXG4gIH07XG4gIGNvbnN0IFNJTkdMRV9RVU9URUQgPSBobGpzLmluaGVyaXQoaGxqcy5BUE9TX1NUUklOR19NT0RFLCB7IGlsbGVnYWw6IG51bGwsIH0pO1xuICBjb25zdCBET1VCTEVfUVVPVEVEID0gaGxqcy5pbmhlcml0KGhsanMuUVVPVEVfU1RSSU5HX01PREUsIHtcbiAgICBpbGxlZ2FsOiBudWxsLFxuICAgIGNvbnRhaW5zOiBobGpzLlFVT1RFX1NUUklOR19NT0RFLmNvbnRhaW5zLmNvbmNhdChTVUJTVCksXG4gIH0pO1xuXG4gIGNvbnN0IEhFUkVET0MgPSB7XG4gICAgYmVnaW46IC88PDxbIFxcdF0qKD86KFxcdyspfFwiKFxcdyspXCIpXFxuLyxcbiAgICBlbmQ6IC9bIFxcdF0qKFxcdyspXFxiLyxcbiAgICBjb250YWluczogaGxqcy5RVU9URV9TVFJJTkdfTU9ERS5jb250YWlucy5jb25jYXQoU1VCU1QpLFxuICAgICdvbjpiZWdpbic6IChtLCByZXNwKSA9PiB7IHJlc3AuZGF0YS5fYmVnaW5NYXRjaCA9IG1bMV0gfHwgbVsyXTsgfSxcbiAgICAnb246ZW5kJzogKG0sIHJlc3ApID0+IHsgaWYgKHJlc3AuZGF0YS5fYmVnaW5NYXRjaCAhPT0gbVsxXSkgcmVzcC5pZ25vcmVNYXRjaCgpOyB9LFxuICB9O1xuXG4gIGNvbnN0IE5PV0RPQyA9IGhsanMuRU5EX1NBTUVfQVNfQkVHSU4oe1xuICAgIGJlZ2luOiAvPDw8WyBcXHRdKicoXFx3KyknXFxuLyxcbiAgICBlbmQ6IC9bIFxcdF0qKFxcdyspXFxiLyxcbiAgfSk7XG4gIC8vIGxpc3Qgb2YgdmFsaWQgd2hpdGVzcGFjZXMgYmVjYXVzZSBub24tYnJlYWtpbmcgc3BhY2UgbWlnaHQgYmUgcGFydCBvZiBhIElERU5UX1JFXG4gIGNvbnN0IFdISVRFU1BBQ0UgPSAnWyBcXHRcXG5dJztcbiAgY29uc3QgU1RSSU5HID0ge1xuICAgIHNjb3BlOiAnc3RyaW5nJyxcbiAgICB2YXJpYW50czogW1xuICAgICAgRE9VQkxFX1FVT1RFRCxcbiAgICAgIFNJTkdMRV9RVU9URUQsXG4gICAgICBIRVJFRE9DLFxuICAgICAgTk9XRE9DXG4gICAgXVxuICB9O1xuICBjb25zdCBOVU1CRVIgPSB7XG4gICAgc2NvcGU6ICdudW1iZXInLFxuICAgIHZhcmlhbnRzOiBbXG4gICAgICB7IGJlZ2luOiBgXFxcXGIwW2JCXVswMV0rKD86X1swMV0rKSpcXFxcYmAgfSwgLy8gQmluYXJ5IHcvIHVuZGVyc2NvcmUgc3VwcG9ydFxuICAgICAgeyBiZWdpbjogYFxcXFxiMFtvT11bMC03XSsoPzpfWzAtN10rKSpcXFxcYmAgfSwgLy8gT2N0YWxzIHcvIHVuZGVyc2NvcmUgc3VwcG9ydFxuICAgICAgeyBiZWdpbjogYFxcXFxiMFt4WF1bXFxcXGRhLWZBLUZdKyg/Ol9bXFxcXGRhLWZBLUZdKykqXFxcXGJgIH0sIC8vIEhleCB3LyB1bmRlcnNjb3JlIHN1cHBvcnRcbiAgICAgIC8vIERlY2ltYWxzIHcvIHVuZGVyc2NvcmUgc3VwcG9ydCwgd2l0aCBvcHRpb25hbCBmcmFnbWVudHMgYW5kIHNjaWVudGlmaWMgZXhwb25lbnQgKGUpIHN1ZmZpeC5cbiAgICAgIHsgYmVnaW46IGAoPzpcXFxcYlxcXFxkKyg/Ol9cXFxcZCspKihcXFxcLig/OlxcXFxkKyg/Ol9cXFxcZCspKikpP3xcXFxcQlxcXFwuXFxcXGQrKSg/OltlRV1bKy1dP1xcXFxkKyk/YCB9XG4gICAgXSxcbiAgICByZWxldmFuY2U6IDBcbiAgfTtcbiAgY29uc3QgTElURVJBTFMgPSBbXG4gICAgXCJmYWxzZVwiLFxuICAgIFwibnVsbFwiLFxuICAgIFwidHJ1ZVwiXG4gIF07XG4gIGNvbnN0IEtXUyA9IFtcbiAgICAvLyBNYWdpYyBjb25zdGFudHM6XG4gICAgLy8gPGh0dHBzOi8vd3d3LnBocC5uZXQvbWFudWFsL2VuL2xhbmd1YWdlLmNvbnN0YW50cy5wcmVkZWZpbmVkLnBocD5cbiAgICBcIl9fQ0xBU1NfX1wiLFxuICAgIFwiX19ESVJfX1wiLFxuICAgIFwiX19GSUxFX19cIixcbiAgICBcIl9fRlVOQ1RJT05fX1wiLFxuICAgIFwiX19DT01QSUxFUl9IQUxUX09GRlNFVF9fXCIsXG4gICAgXCJfX0xJTkVfX1wiLFxuICAgIFwiX19NRVRIT0RfX1wiLFxuICAgIFwiX19OQU1FU1BBQ0VfX1wiLFxuICAgIFwiX19UUkFJVF9fXCIsXG4gICAgLy8gRnVuY3Rpb24gdGhhdCBsb29rIGxpa2UgbGFuZ3VhZ2UgY29uc3RydWN0IG9yIGxhbmd1YWdlIGNvbnN0cnVjdCB0aGF0IGxvb2sgbGlrZSBmdW5jdGlvbjpcbiAgICAvLyBMaXN0IG9mIGtleXdvcmRzIHRoYXQgbWF5IG5vdCByZXF1aXJlIHBhcmVudGhlc2lzXG4gICAgXCJkaWVcIixcbiAgICBcImVjaG9cIixcbiAgICBcImV4aXRcIixcbiAgICBcImluY2x1ZGVcIixcbiAgICBcImluY2x1ZGVfb25jZVwiLFxuICAgIFwicHJpbnRcIixcbiAgICBcInJlcXVpcmVcIixcbiAgICBcInJlcXVpcmVfb25jZVwiLFxuICAgIC8vIFRoZXNlIGFyZSBub3QgbGFuZ3VhZ2UgY29uc3RydWN0IChmdW5jdGlvbikgYnV0IG9wZXJhdGUgb24gdGhlIGN1cnJlbnRseS1leGVjdXRpbmcgZnVuY3Rpb24gYW5kIGNhbiBhY2Nlc3MgdGhlIGN1cnJlbnQgc3ltYm9sIHRhYmxlXG4gICAgLy8gJ2NvbXBhY3QgZXh0cmFjdCBmdW5jX2dldF9hcmcgZnVuY19nZXRfYXJncyBmdW5jX251bV9hcmdzIGdldF9jYWxsZWRfY2xhc3MgZ2V0X3BhcmVudF9jbGFzcyAnICtcbiAgICAvLyBPdGhlciBrZXl3b3JkczpcbiAgICAvLyA8aHR0cHM6Ly93d3cucGhwLm5ldC9tYW51YWwvZW4vcmVzZXJ2ZWQucGhwPlxuICAgIC8vIDxodHRwczovL3d3dy5waHAubmV0L21hbnVhbC9lbi9sYW5ndWFnZS50eXBlcy50eXBlLWp1Z2dsaW5nLnBocD5cbiAgICBcImFycmF5XCIsXG4gICAgXCJhYnN0cmFjdFwiLFxuICAgIFwiYW5kXCIsXG4gICAgXCJhc1wiLFxuICAgIFwiYmluYXJ5XCIsXG4gICAgXCJib29sXCIsXG4gICAgXCJib29sZWFuXCIsXG4gICAgXCJicmVha1wiLFxuICAgIFwiY2FsbGFibGVcIixcbiAgICBcImNhc2VcIixcbiAgICBcImNhdGNoXCIsXG4gICAgXCJjbGFzc1wiLFxuICAgIFwiY2xvbmVcIixcbiAgICBcImNvbnN0XCIsXG4gICAgXCJjb250aW51ZVwiLFxuICAgIFwiZGVjbGFyZVwiLFxuICAgIFwiZGVmYXVsdFwiLFxuICAgIFwiZG9cIixcbiAgICBcImRvdWJsZVwiLFxuICAgIFwiZWxzZVwiLFxuICAgIFwiZWxzZWlmXCIsXG4gICAgXCJlbXB0eVwiLFxuICAgIFwiZW5kZGVjbGFyZVwiLFxuICAgIFwiZW5kZm9yXCIsXG4gICAgXCJlbmRmb3JlYWNoXCIsXG4gICAgXCJlbmRpZlwiLFxuICAgIFwiZW5kc3dpdGNoXCIsXG4gICAgXCJlbmR3aGlsZVwiLFxuICAgIFwiZW51bVwiLFxuICAgIFwiZXZhbFwiLFxuICAgIFwiZXh0ZW5kc1wiLFxuICAgIFwiZmluYWxcIixcbiAgICBcImZpbmFsbHlcIixcbiAgICBcImZsb2F0XCIsXG4gICAgXCJmb3JcIixcbiAgICBcImZvcmVhY2hcIixcbiAgICBcImZyb21cIixcbiAgICBcImdsb2JhbFwiLFxuICAgIFwiZ290b1wiLFxuICAgIFwiaWZcIixcbiAgICBcImltcGxlbWVudHNcIixcbiAgICBcImluc3RhbmNlb2ZcIixcbiAgICBcImluc3RlYWRvZlwiLFxuICAgIFwiaW50XCIsXG4gICAgXCJpbnRlZ2VyXCIsXG4gICAgXCJpbnRlcmZhY2VcIixcbiAgICBcImlzc2V0XCIsXG4gICAgXCJpdGVyYWJsZVwiLFxuICAgIFwibGlzdFwiLFxuICAgIFwibWF0Y2h8MFwiLFxuICAgIFwibWl4ZWRcIixcbiAgICBcIm5ld1wiLFxuICAgIFwibmV2ZXJcIixcbiAgICBcIm9iamVjdFwiLFxuICAgIFwib3JcIixcbiAgICBcInByaXZhdGVcIixcbiAgICBcInByb3RlY3RlZFwiLFxuICAgIFwicHVibGljXCIsXG4gICAgXCJyZWFkb25seVwiLFxuICAgIFwicmVhbFwiLFxuICAgIFwicmV0dXJuXCIsXG4gICAgXCJzdHJpbmdcIixcbiAgICBcInN3aXRjaFwiLFxuICAgIFwidGhyb3dcIixcbiAgICBcInRyYWl0XCIsXG4gICAgXCJ0cnlcIixcbiAgICBcInVuc2V0XCIsXG4gICAgXCJ1c2VcIixcbiAgICBcInZhclwiLFxuICAgIFwidm9pZFwiLFxuICAgIFwid2hpbGVcIixcbiAgICBcInhvclwiLFxuICAgIFwieWllbGRcIlxuICBdO1xuXG4gIGNvbnN0IEJVSUxUX0lOUyA9IFtcbiAgICAvLyBTdGFuZGFyZCBQSFAgbGlicmFyeTpcbiAgICAvLyA8aHR0cHM6Ly93d3cucGhwLm5ldC9tYW51YWwvZW4vYm9vay5zcGwucGhwPlxuICAgIFwiRXJyb3J8MFwiLFxuICAgIFwiQXBwZW5kSXRlcmF0b3JcIixcbiAgICBcIkFyZ3VtZW50Q291bnRFcnJvclwiLFxuICAgIFwiQXJpdGhtZXRpY0Vycm9yXCIsXG4gICAgXCJBcnJheUl0ZXJhdG9yXCIsXG4gICAgXCJBcnJheU9iamVjdFwiLFxuICAgIFwiQXNzZXJ0aW9uRXJyb3JcIixcbiAgICBcIkJhZEZ1bmN0aW9uQ2FsbEV4Y2VwdGlvblwiLFxuICAgIFwiQmFkTWV0aG9kQ2FsbEV4Y2VwdGlvblwiLFxuICAgIFwiQ2FjaGluZ0l0ZXJhdG9yXCIsXG4gICAgXCJDYWxsYmFja0ZpbHRlckl0ZXJhdG9yXCIsXG4gICAgXCJDb21waWxlRXJyb3JcIixcbiAgICBcIkNvdW50YWJsZVwiLFxuICAgIFwiRGlyZWN0b3J5SXRlcmF0b3JcIixcbiAgICBcIkRpdmlzaW9uQnlaZXJvRXJyb3JcIixcbiAgICBcIkRvbWFpbkV4Y2VwdGlvblwiLFxuICAgIFwiRW1wdHlJdGVyYXRvclwiLFxuICAgIFwiRXJyb3JFeGNlcHRpb25cIixcbiAgICBcIkV4Y2VwdGlvblwiLFxuICAgIFwiRmlsZXN5c3RlbUl0ZXJhdG9yXCIsXG4gICAgXCJGaWx0ZXJJdGVyYXRvclwiLFxuICAgIFwiR2xvYkl0ZXJhdG9yXCIsXG4gICAgXCJJbmZpbml0ZUl0ZXJhdG9yXCIsXG4gICAgXCJJbnZhbGlkQXJndW1lbnRFeGNlcHRpb25cIixcbiAgICBcIkl0ZXJhdG9ySXRlcmF0b3JcIixcbiAgICBcIkxlbmd0aEV4Y2VwdGlvblwiLFxuICAgIFwiTGltaXRJdGVyYXRvclwiLFxuICAgIFwiTG9naWNFeGNlcHRpb25cIixcbiAgICBcIk11bHRpcGxlSXRlcmF0b3JcIixcbiAgICBcIk5vUmV3aW5kSXRlcmF0b3JcIixcbiAgICBcIk91dE9mQm91bmRzRXhjZXB0aW9uXCIsXG4gICAgXCJPdXRPZlJhbmdlRXhjZXB0aW9uXCIsXG4gICAgXCJPdXRlckl0ZXJhdG9yXCIsXG4gICAgXCJPdmVyZmxvd0V4Y2VwdGlvblwiLFxuICAgIFwiUGFyZW50SXRlcmF0b3JcIixcbiAgICBcIlBhcnNlRXJyb3JcIixcbiAgICBcIlJhbmdlRXhjZXB0aW9uXCIsXG4gICAgXCJSZWN1cnNpdmVBcnJheUl0ZXJhdG9yXCIsXG4gICAgXCJSZWN1cnNpdmVDYWNoaW5nSXRlcmF0b3JcIixcbiAgICBcIlJlY3Vyc2l2ZUNhbGxiYWNrRmlsdGVySXRlcmF0b3JcIixcbiAgICBcIlJlY3Vyc2l2ZURpcmVjdG9yeUl0ZXJhdG9yXCIsXG4gICAgXCJSZWN1cnNpdmVGaWx0ZXJJdGVyYXRvclwiLFxuICAgIFwiUmVjdXJzaXZlSXRlcmF0b3JcIixcbiAgICBcIlJlY3Vyc2l2ZUl0ZXJhdG9ySXRlcmF0b3JcIixcbiAgICBcIlJlY3Vyc2l2ZVJlZ2V4SXRlcmF0b3JcIixcbiAgICBcIlJlY3Vyc2l2ZVRyZWVJdGVyYXRvclwiLFxuICAgIFwiUmVnZXhJdGVyYXRvclwiLFxuICAgIFwiUnVudGltZUV4Y2VwdGlvblwiLFxuICAgIFwiU2Vla2FibGVJdGVyYXRvclwiLFxuICAgIFwiU3BsRG91Ymx5TGlua2VkTGlzdFwiLFxuICAgIFwiU3BsRmlsZUluZm9cIixcbiAgICBcIlNwbEZpbGVPYmplY3RcIixcbiAgICBcIlNwbEZpeGVkQXJyYXlcIixcbiAgICBcIlNwbEhlYXBcIixcbiAgICBcIlNwbE1heEhlYXBcIixcbiAgICBcIlNwbE1pbkhlYXBcIixcbiAgICBcIlNwbE9iamVjdFN0b3JhZ2VcIixcbiAgICBcIlNwbE9ic2VydmVyXCIsXG4gICAgXCJTcGxQcmlvcml0eVF1ZXVlXCIsXG4gICAgXCJTcGxRdWV1ZVwiLFxuICAgIFwiU3BsU3RhY2tcIixcbiAgICBcIlNwbFN1YmplY3RcIixcbiAgICBcIlNwbFRlbXBGaWxlT2JqZWN0XCIsXG4gICAgXCJUeXBlRXJyb3JcIixcbiAgICBcIlVuZGVyZmxvd0V4Y2VwdGlvblwiLFxuICAgIFwiVW5leHBlY3RlZFZhbHVlRXhjZXB0aW9uXCIsXG4gICAgXCJVbmhhbmRsZWRNYXRjaEVycm9yXCIsXG4gICAgLy8gUmVzZXJ2ZWQgaW50ZXJmYWNlczpcbiAgICAvLyA8aHR0cHM6Ly93d3cucGhwLm5ldC9tYW51YWwvZW4vcmVzZXJ2ZWQuaW50ZXJmYWNlcy5waHA+XG4gICAgXCJBcnJheUFjY2Vzc1wiLFxuICAgIFwiQmFja2VkRW51bVwiLFxuICAgIFwiQ2xvc3VyZVwiLFxuICAgIFwiRmliZXJcIixcbiAgICBcIkdlbmVyYXRvclwiLFxuICAgIFwiSXRlcmF0b3JcIixcbiAgICBcIkl0ZXJhdG9yQWdncmVnYXRlXCIsXG4gICAgXCJTZXJpYWxpemFibGVcIixcbiAgICBcIlN0cmluZ2FibGVcIixcbiAgICBcIlRocm93YWJsZVwiLFxuICAgIFwiVHJhdmVyc2FibGVcIixcbiAgICBcIlVuaXRFbnVtXCIsXG4gICAgXCJXZWFrUmVmZXJlbmNlXCIsXG4gICAgXCJXZWFrTWFwXCIsXG4gICAgLy8gUmVzZXJ2ZWQgY2xhc3NlczpcbiAgICAvLyA8aHR0cHM6Ly93d3cucGhwLm5ldC9tYW51YWwvZW4vcmVzZXJ2ZWQuY2xhc3Nlcy5waHA+XG4gICAgXCJEaXJlY3RvcnlcIixcbiAgICBcIl9fUEhQX0luY29tcGxldGVfQ2xhc3NcIixcbiAgICBcInBhcmVudFwiLFxuICAgIFwicGhwX3VzZXJfZmlsdGVyXCIsXG4gICAgXCJzZWxmXCIsXG4gICAgXCJzdGF0aWNcIixcbiAgICBcInN0ZENsYXNzXCJcbiAgXTtcblxuICAvKiogRHVhbC1jYXNlIGtleXdvcmRzXG4gICAqXG4gICAqIFtcInRoZW5cIixcIkZJTEVcIl0gPT5cbiAgICogICAgIFtcInRoZW5cIiwgXCJUSEVOXCIsIFwiRklMRVwiLCBcImZpbGVcIl1cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gaXRlbXMgKi9cbiAgY29uc3QgZHVhbENhc2UgPSAoaXRlbXMpID0+IHtcbiAgICAvKiogQHR5cGUgc3RyaW5nW10gKi9cbiAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICBpdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgcmVzdWx0LnB1c2goaXRlbSk7XG4gICAgICBpZiAoaXRlbS50b0xvd2VyQ2FzZSgpID09PSBpdGVtKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGl0ZW0udG9VcHBlckNhc2UoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQucHVzaChpdGVtLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgY29uc3QgS0VZV09SRFMgPSB7XG4gICAga2V5d29yZDogS1dTLFxuICAgIGxpdGVyYWw6IGR1YWxDYXNlKExJVEVSQUxTKSxcbiAgICBidWlsdF9pbjogQlVJTFRfSU5TLFxuICB9O1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBpdGVtcyAqL1xuICBjb25zdCBub3JtYWxpemVLZXl3b3JkcyA9IChpdGVtcykgPT4ge1xuICAgIHJldHVybiBpdGVtcy5tYXAoaXRlbSA9PiB7XG4gICAgICByZXR1cm4gaXRlbS5yZXBsYWNlKC9cXHxcXGQrJC8sIFwiXCIpO1xuICAgIH0pO1xuICB9O1xuXG4gIGNvbnN0IENPTlNUUlVDVE9SX0NBTEwgPSB7IHZhcmlhbnRzOiBbXG4gICAge1xuICAgICAgbWF0Y2g6IFtcbiAgICAgICAgL25ldy8sXG4gICAgICAgIHJlZ2V4LmNvbmNhdChXSElURVNQQUNFLCBcIitcIiksXG4gICAgICAgIC8vIHRvIHByZXZlbnQgYnVpbHQgaW5zIGZyb20gYmVpbmcgY29uZnVzZWQgYXMgdGhlIGNsYXNzIGNvbnN0cnVjdG9yIGNhbGxcbiAgICAgICAgcmVnZXguY29uY2F0KFwiKD8hXCIsIG5vcm1hbGl6ZUtleXdvcmRzKEJVSUxUX0lOUykuam9pbihcIlxcXFxifFwiKSwgXCJcXFxcYilcIiksXG4gICAgICAgIFBBU0NBTF9DQVNFX0NMQVNTX05BTUVfUkUsXG4gICAgICBdLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgMTogXCJrZXl3b3JkXCIsXG4gICAgICAgIDQ6IFwidGl0bGUuY2xhc3NcIixcbiAgICAgIH0sXG4gICAgfVxuICBdIH07XG5cbiAgY29uc3QgQ09OU1RBTlRfUkVGRVJFTkNFID0gcmVnZXguY29uY2F0KElERU5UX1JFLCBcIlxcXFxiKD8hXFxcXCgpXCIpO1xuXG4gIGNvbnN0IExFRlRfQU5EX1JJR0hUX1NJREVfT0ZfRE9VQkxFX0NPTE9OID0geyB2YXJpYW50czogW1xuICAgIHtcbiAgICAgIG1hdGNoOiBbXG4gICAgICAgIHJlZ2V4LmNvbmNhdChcbiAgICAgICAgICAvOjovLFxuICAgICAgICAgIHJlZ2V4Lmxvb2thaGVhZCgvKD8hY2xhc3NcXGIpLylcbiAgICAgICAgKSxcbiAgICAgICAgQ09OU1RBTlRfUkVGRVJFTkNFLFxuICAgICAgXSxcbiAgICAgIHNjb3BlOiB7IDI6IFwidmFyaWFibGUuY29uc3RhbnRcIiwgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIG1hdGNoOiBbXG4gICAgICAgIC86Oi8sXG4gICAgICAgIC9jbGFzcy8sXG4gICAgICBdLFxuICAgICAgc2NvcGU6IHsgMjogXCJ2YXJpYWJsZS5sYW5ndWFnZVwiLCB9LFxuICAgIH0sXG4gICAge1xuICAgICAgbWF0Y2g6IFtcbiAgICAgICAgUEFTQ0FMX0NBU0VfQ0xBU1NfTkFNRV9SRSxcbiAgICAgICAgcmVnZXguY29uY2F0KFxuICAgICAgICAgIC86Oi8sXG4gICAgICAgICAgcmVnZXgubG9va2FoZWFkKC8oPyFjbGFzc1xcYikvKVxuICAgICAgICApLFxuICAgICAgICBDT05TVEFOVF9SRUZFUkVOQ0UsXG4gICAgICBdLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgMTogXCJ0aXRsZS5jbGFzc1wiLFxuICAgICAgICAzOiBcInZhcmlhYmxlLmNvbnN0YW50XCIsXG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgbWF0Y2g6IFtcbiAgICAgICAgUEFTQ0FMX0NBU0VfQ0xBU1NfTkFNRV9SRSxcbiAgICAgICAgcmVnZXguY29uY2F0KFxuICAgICAgICAgIFwiOjpcIixcbiAgICAgICAgICByZWdleC5sb29rYWhlYWQoLyg/IWNsYXNzXFxiKS8pXG4gICAgICAgICksXG4gICAgICBdLFxuICAgICAgc2NvcGU6IHsgMTogXCJ0aXRsZS5jbGFzc1wiLCB9LFxuICAgIH0sXG4gICAge1xuICAgICAgbWF0Y2g6IFtcbiAgICAgICAgUEFTQ0FMX0NBU0VfQ0xBU1NfTkFNRV9SRSxcbiAgICAgICAgLzo6LyxcbiAgICAgICAgL2NsYXNzLyxcbiAgICAgIF0sXG4gICAgICBzY29wZToge1xuICAgICAgICAxOiBcInRpdGxlLmNsYXNzXCIsXG4gICAgICAgIDM6IFwidmFyaWFibGUubGFuZ3VhZ2VcIixcbiAgICAgIH0sXG4gICAgfVxuICBdIH07XG5cbiAgY29uc3QgTkFNRURfQVJHVU1FTlQgPSB7XG4gICAgc2NvcGU6ICdhdHRyJyxcbiAgICBtYXRjaDogcmVnZXguY29uY2F0KElERU5UX1JFLCByZWdleC5sb29rYWhlYWQoJzonKSwgcmVnZXgubG9va2FoZWFkKC8oPyE6OikvKSksXG4gIH07XG4gIGNvbnN0IFBBUkFNU19NT0RFID0ge1xuICAgIHJlbGV2YW5jZTogMCxcbiAgICBiZWdpbjogL1xcKC8sXG4gICAgZW5kOiAvXFwpLyxcbiAgICBrZXl3b3JkczogS0VZV09SRFMsXG4gICAgY29udGFpbnM6IFtcbiAgICAgIE5BTUVEX0FSR1VNRU5ULFxuICAgICAgVkFSSUFCTEUsXG4gICAgICBMRUZUX0FORF9SSUdIVF9TSURFX09GX0RPVUJMRV9DT0xPTixcbiAgICAgIGhsanMuQ19CTE9DS19DT01NRU5UX01PREUsXG4gICAgICBTVFJJTkcsXG4gICAgICBOVU1CRVIsXG4gICAgICBDT05TVFJVQ1RPUl9DQUxMLFxuICAgIF0sXG4gIH07XG4gIGNvbnN0IEZVTkNUSU9OX0lOVk9LRSA9IHtcbiAgICByZWxldmFuY2U6IDAsXG4gICAgbWF0Y2g6IFtcbiAgICAgIC9cXGIvLFxuICAgICAgLy8gdG8gcHJldmVudCBrZXl3b3JkcyBmcm9tIGJlaW5nIGNvbmZ1c2VkIGFzIHRoZSBmdW5jdGlvbiB0aXRsZVxuICAgICAgcmVnZXguY29uY2F0KFwiKD8hZm5cXFxcYnxmdW5jdGlvblxcXFxifFwiLCBub3JtYWxpemVLZXl3b3JkcyhLV1MpLmpvaW4oXCJcXFxcYnxcIiksIFwifFwiLCBub3JtYWxpemVLZXl3b3JkcyhCVUlMVF9JTlMpLmpvaW4oXCJcXFxcYnxcIiksIFwiXFxcXGIpXCIpLFxuICAgICAgSURFTlRfUkUsXG4gICAgICByZWdleC5jb25jYXQoV0hJVEVTUEFDRSwgXCIqXCIpLFxuICAgICAgcmVnZXgubG9va2FoZWFkKC8oPz1cXCgpLylcbiAgICBdLFxuICAgIHNjb3BlOiB7IDM6IFwidGl0bGUuZnVuY3Rpb24uaW52b2tlXCIsIH0sXG4gICAgY29udGFpbnM6IFsgUEFSQU1TX01PREUgXVxuICB9O1xuICBQQVJBTVNfTU9ERS5jb250YWlucy5wdXNoKEZVTkNUSU9OX0lOVk9LRSk7XG5cbiAgY29uc3QgQVRUUklCVVRFX0NPTlRBSU5TID0gW1xuICAgIE5BTUVEX0FSR1VNRU5ULFxuICAgIExFRlRfQU5EX1JJR0hUX1NJREVfT0ZfRE9VQkxFX0NPTE9OLFxuICAgIGhsanMuQ19CTE9DS19DT01NRU5UX01PREUsXG4gICAgU1RSSU5HLFxuICAgIE5VTUJFUixcbiAgICBDT05TVFJVQ1RPUl9DQUxMLFxuICBdO1xuXG4gIGNvbnN0IEFUVFJJQlVURVMgPSB7XG4gICAgYmVnaW46IHJlZ2V4LmNvbmNhdCgvI1xcW1xccyovLCBQQVNDQUxfQ0FTRV9DTEFTU19OQU1FX1JFKSxcbiAgICBiZWdpblNjb3BlOiBcIm1ldGFcIixcbiAgICBlbmQ6IC9dLyxcbiAgICBlbmRTY29wZTogXCJtZXRhXCIsXG4gICAga2V5d29yZHM6IHtcbiAgICAgIGxpdGVyYWw6IExJVEVSQUxTLFxuICAgICAga2V5d29yZDogW1xuICAgICAgICAnbmV3JyxcbiAgICAgICAgJ2FycmF5JyxcbiAgICAgIF1cbiAgICB9LFxuICAgIGNvbnRhaW5zOiBbXG4gICAgICB7XG4gICAgICAgIGJlZ2luOiAvXFxbLyxcbiAgICAgICAgZW5kOiAvXS8sXG4gICAgICAgIGtleXdvcmRzOiB7XG4gICAgICAgICAgbGl0ZXJhbDogTElURVJBTFMsXG4gICAgICAgICAga2V5d29yZDogW1xuICAgICAgICAgICAgJ25ldycsXG4gICAgICAgICAgICAnYXJyYXknLFxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgY29udGFpbnM6IFtcbiAgICAgICAgICAnc2VsZicsXG4gICAgICAgICAgLi4uQVRUUklCVVRFX0NPTlRBSU5TLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAgLi4uQVRUUklCVVRFX0NPTlRBSU5TLFxuICAgICAge1xuICAgICAgICBzY29wZTogJ21ldGEnLFxuICAgICAgICBtYXRjaDogUEFTQ0FMX0NBU0VfQ0xBU1NfTkFNRV9SRVxuICAgICAgfVxuICAgIF1cbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGNhc2VfaW5zZW5zaXRpdmU6IGZhbHNlLFxuICAgIGtleXdvcmRzOiBLRVlXT1JEUyxcbiAgICBjb250YWluczogW1xuICAgICAgQVRUUklCVVRFUyxcbiAgICAgIGhsanMuSEFTSF9DT01NRU5UX01PREUsXG4gICAgICBobGpzLkNPTU1FTlQoJy8vJywgJyQnKSxcbiAgICAgIGhsanMuQ09NTUVOVChcbiAgICAgICAgJy9cXFxcKicsXG4gICAgICAgICdcXFxcKi8nLFxuICAgICAgICB7IGNvbnRhaW5zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc2NvcGU6ICdkb2N0YWcnLFxuICAgICAgICAgICAgbWF0Y2g6ICdAW0EtWmEtel0rJ1xuICAgICAgICAgIH1cbiAgICAgICAgXSB9XG4gICAgICApLFxuICAgICAge1xuICAgICAgICBtYXRjaDogL19faGFsdF9jb21waWxlclxcKFxcKTsvLFxuICAgICAgICBrZXl3b3JkczogJ19faGFsdF9jb21waWxlcicsXG4gICAgICAgIHN0YXJ0czoge1xuICAgICAgICAgIHNjb3BlOiBcImNvbW1lbnRcIixcbiAgICAgICAgICBlbmQ6IGhsanMuTUFUQ0hfTk9USElOR19SRSxcbiAgICAgICAgICBjb250YWluczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBtYXRjaDogL1xcPz4vLFxuICAgICAgICAgICAgICBzY29wZTogXCJtZXRhXCIsXG4gICAgICAgICAgICAgIGVuZHNQYXJlbnQ6IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBQUkVQUk9DRVNTT1IsXG4gICAgICB7XG4gICAgICAgIHNjb3BlOiAndmFyaWFibGUubGFuZ3VhZ2UnLFxuICAgICAgICBtYXRjaDogL1xcJHRoaXNcXGIvXG4gICAgICB9LFxuICAgICAgVkFSSUFCTEUsXG4gICAgICBGVU5DVElPTl9JTlZPS0UsXG4gICAgICBMRUZUX0FORF9SSUdIVF9TSURFX09GX0RPVUJMRV9DT0xPTixcbiAgICAgIHtcbiAgICAgICAgbWF0Y2g6IFtcbiAgICAgICAgICAvY29uc3QvLFxuICAgICAgICAgIC9cXHMvLFxuICAgICAgICAgIElERU5UX1JFLFxuICAgICAgICBdLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgIDE6IFwia2V5d29yZFwiLFxuICAgICAgICAgIDM6IFwidmFyaWFibGUuY29uc3RhbnRcIixcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBDT05TVFJVQ1RPUl9DQUxMLFxuICAgICAge1xuICAgICAgICBzY29wZTogJ2Z1bmN0aW9uJyxcbiAgICAgICAgcmVsZXZhbmNlOiAwLFxuICAgICAgICBiZWdpbktleXdvcmRzOiAnZm4gZnVuY3Rpb24nLFxuICAgICAgICBlbmQ6IC9bO3tdLyxcbiAgICAgICAgZXhjbHVkZUVuZDogdHJ1ZSxcbiAgICAgICAgaWxsZWdhbDogJ1skJVxcXFxbXScsXG4gICAgICAgIGNvbnRhaW5zOiBbXG4gICAgICAgICAgeyBiZWdpbktleXdvcmRzOiAndXNlJywgfSxcbiAgICAgICAgICBobGpzLlVOREVSU0NPUkVfVElUTEVfTU9ERSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBiZWdpbjogJz0+JywgLy8gTm8gbWFya3VwLCBqdXN0IGEgcmVsZXZhbmNlIGJvb3N0ZXJcbiAgICAgICAgICAgIGVuZHNQYXJlbnQ6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNjb3BlOiAncGFyYW1zJyxcbiAgICAgICAgICAgIGJlZ2luOiAnXFxcXCgnLFxuICAgICAgICAgICAgZW5kOiAnXFxcXCknLFxuICAgICAgICAgICAgZXhjbHVkZUJlZ2luOiB0cnVlLFxuICAgICAgICAgICAgZXhjbHVkZUVuZDogdHJ1ZSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBLRVlXT1JEUyxcbiAgICAgICAgICAgIGNvbnRhaW5zOiBbXG4gICAgICAgICAgICAgICdzZWxmJyxcbiAgICAgICAgICAgICAgVkFSSUFCTEUsXG4gICAgICAgICAgICAgIExFRlRfQU5EX1JJR0hUX1NJREVfT0ZfRE9VQkxFX0NPTE9OLFxuICAgICAgICAgICAgICBobGpzLkNfQkxPQ0tfQ09NTUVOVF9NT0RFLFxuICAgICAgICAgICAgICBTVFJJTkcsXG4gICAgICAgICAgICAgIE5VTUJFUlxuICAgICAgICAgICAgXVxuICAgICAgICAgIH0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHNjb3BlOiAnY2xhc3MnLFxuICAgICAgICB2YXJpYW50czogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGJlZ2luS2V5d29yZHM6IFwiZW51bVwiLFxuICAgICAgICAgICAgaWxsZWdhbDogL1soJFwiXS9cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGJlZ2luS2V5d29yZHM6IFwiY2xhc3MgaW50ZXJmYWNlIHRyYWl0XCIsXG4gICAgICAgICAgICBpbGxlZ2FsOiAvWzooJFwiXS9cbiAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIHJlbGV2YW5jZTogMCxcbiAgICAgICAgZW5kOiAvXFx7LyxcbiAgICAgICAgZXhjbHVkZUVuZDogdHJ1ZSxcbiAgICAgICAgY29udGFpbnM6IFtcbiAgICAgICAgICB7IGJlZ2luS2V5d29yZHM6ICdleHRlbmRzIGltcGxlbWVudHMnIH0sXG4gICAgICAgICAgaGxqcy5VTkRFUlNDT1JFX1RJVExFX01PREVcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIC8vIGJvdGggdXNlIGFuZCBuYW1lc3BhY2Ugc3RpbGwgdXNlIFwib2xkIHN0eWxlXCIgcnVsZXMgKHZzIG11bHRpLW1hdGNoKVxuICAgICAgLy8gYmVjYXVzZSB0aGUgbmFtZXNwYWNlIG5hbWUgY2FuIGluY2x1ZGUgYFxcYCBhbmQgd2Ugc3RpbGwgd2FudCBlYWNoXG4gICAgICAvLyBlbGVtZW50IHRvIGJlIHRyZWF0ZWQgYXMgaXRzIG93biAqaW5kaXZpZHVhbCogdGl0bGVcbiAgICAgIHtcbiAgICAgICAgYmVnaW5LZXl3b3JkczogJ25hbWVzcGFjZScsXG4gICAgICAgIHJlbGV2YW5jZTogMCxcbiAgICAgICAgZW5kOiAnOycsXG4gICAgICAgIGlsbGVnYWw6IC9bLiddLyxcbiAgICAgICAgY29udGFpbnM6IFsgaGxqcy5pbmhlcml0KGhsanMuVU5ERVJTQ09SRV9USVRMRV9NT0RFLCB7IHNjb3BlOiBcInRpdGxlLmNsYXNzXCIgfSkgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgYmVnaW5LZXl3b3JkczogJ3VzZScsXG4gICAgICAgIHJlbGV2YW5jZTogMCxcbiAgICAgICAgZW5kOiAnOycsXG4gICAgICAgIGNvbnRhaW5zOiBbXG4gICAgICAgICAgLy8gVE9ETzogdGl0bGUuZnVuY3Rpb24gdnMgdGl0bGUuY2xhc3NcbiAgICAgICAgICB7XG4gICAgICAgICAgICBtYXRjaDogL1xcYihhc3xjb25zdHxmdW5jdGlvbilcXGIvLFxuICAgICAgICAgICAgc2NvcGU6IFwia2V5d29yZFwiXG4gICAgICAgICAgfSxcbiAgICAgICAgICAvLyBUT0RPOiBjb3VsZCBiZSB0aXRsZS5jbGFzcyBvciB0aXRsZS5mdW5jdGlvblxuICAgICAgICAgIGhsanMuVU5ERVJTQ09SRV9USVRMRV9NT0RFXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICBTVFJJTkcsXG4gICAgICBOVU1CRVIsXG4gICAgXVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBocDtcbiIsIi8qXG5MYW5ndWFnZTogUnVzdFxuQXV0aG9yOiBBbmRyZXkgVmxhc292c2tpa2ggPGFuZHJleS52bGFzb3Zza2lraEBnbWFpbC5jb20+XG5Db250cmlidXRvcnM6IFJvbWFuIFNobWF0b3YgPHJvbWFuc2htYXRvdkBnbWFpbC5jb20+LCBLYXNwZXIgQW5kZXJzZW4gPGttYV91bnRydXN0ZWRAcHJvdG9ubWFpbC5jb20+XG5XZWJzaXRlOiBodHRwczovL3d3dy5ydXN0LWxhbmcub3JnXG5DYXRlZ29yeTogY29tbW9uLCBzeXN0ZW1cbiovXG5cbi8qKiBAdHlwZSBMYW5ndWFnZUZuICovXG5cbmZ1bmN0aW9uIHJ1c3QoaGxqcykge1xuICBjb25zdCByZWdleCA9IGhsanMucmVnZXg7XG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIEFkZGVkIHRvIHN1cHBvcnQgdGhlIHIjIGtleXdvcmQsIHdoaWNoIGlzIGEgcmF3IGlkZW50aWZpZXIgaW4gUnVzdC5cbiAgY29uc3QgUkFXX0lERU5USUZJRVIgPSAvKHIjKT8vO1xuICBjb25zdCBVTkRFUlNDT1JFX0lERU5UX1JFID0gcmVnZXguY29uY2F0KFJBV19JREVOVElGSUVSLCBobGpzLlVOREVSU0NPUkVfSURFTlRfUkUpO1xuICBjb25zdCBJREVOVF9SRSA9IHJlZ2V4LmNvbmNhdChSQVdfSURFTlRJRklFUiwgaGxqcy5JREVOVF9SRSk7XG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIGNvbnN0IEZVTkNUSU9OX0lOVk9LRSA9IHtcbiAgICBjbGFzc05hbWU6IFwidGl0bGUuZnVuY3Rpb24uaW52b2tlXCIsXG4gICAgcmVsZXZhbmNlOiAwLFxuICAgIGJlZ2luOiByZWdleC5jb25jYXQoXG4gICAgICAvXFxiLyxcbiAgICAgIC8oPyFsZXR8Zm9yfHdoaWxlfGlmfGVsc2V8bWF0Y2hcXGIpLyxcbiAgICAgIElERU5UX1JFLFxuICAgICAgcmVnZXgubG9va2FoZWFkKC9cXHMqXFwoLykpXG4gIH07XG4gIGNvbnN0IE5VTUJFUl9TVUZGSVggPSAnKFt1aV0oOHwxNnwzMnw2NHwxMjh8c2l6ZSl8ZigzMnw2NCkpXFw/JztcbiAgY29uc3QgS0VZV09SRFMgPSBbXG4gICAgXCJhYnN0cmFjdFwiLFxuICAgIFwiYXNcIixcbiAgICBcImFzeW5jXCIsXG4gICAgXCJhd2FpdFwiLFxuICAgIFwiYmVjb21lXCIsXG4gICAgXCJib3hcIixcbiAgICBcImJyZWFrXCIsXG4gICAgXCJjb25zdFwiLFxuICAgIFwiY29udGludWVcIixcbiAgICBcImNyYXRlXCIsXG4gICAgXCJkb1wiLFxuICAgIFwiZHluXCIsXG4gICAgXCJlbHNlXCIsXG4gICAgXCJlbnVtXCIsXG4gICAgXCJleHRlcm5cIixcbiAgICBcImZhbHNlXCIsXG4gICAgXCJmaW5hbFwiLFxuICAgIFwiZm5cIixcbiAgICBcImZvclwiLFxuICAgIFwiaWZcIixcbiAgICBcImltcGxcIixcbiAgICBcImluXCIsXG4gICAgXCJsZXRcIixcbiAgICBcImxvb3BcIixcbiAgICBcIm1hY3JvXCIsXG4gICAgXCJtYXRjaFwiLFxuICAgIFwibW9kXCIsXG4gICAgXCJtb3ZlXCIsXG4gICAgXCJtdXRcIixcbiAgICBcIm92ZXJyaWRlXCIsXG4gICAgXCJwcml2XCIsXG4gICAgXCJwdWJcIixcbiAgICBcInJlZlwiLFxuICAgIFwicmV0dXJuXCIsXG4gICAgXCJzZWxmXCIsXG4gICAgXCJTZWxmXCIsXG4gICAgXCJzdGF0aWNcIixcbiAgICBcInN0cnVjdFwiLFxuICAgIFwic3VwZXJcIixcbiAgICBcInRyYWl0XCIsXG4gICAgXCJ0cnVlXCIsXG4gICAgXCJ0cnlcIixcbiAgICBcInR5cGVcIixcbiAgICBcInR5cGVvZlwiLFxuICAgIFwidW5pb25cIixcbiAgICBcInVuc2FmZVwiLFxuICAgIFwidW5zaXplZFwiLFxuICAgIFwidXNlXCIsXG4gICAgXCJ2aXJ0dWFsXCIsXG4gICAgXCJ3aGVyZVwiLFxuICAgIFwid2hpbGVcIixcbiAgICBcInlpZWxkXCJcbiAgXTtcbiAgY29uc3QgTElURVJBTFMgPSBbXG4gICAgXCJ0cnVlXCIsXG4gICAgXCJmYWxzZVwiLFxuICAgIFwiU29tZVwiLFxuICAgIFwiTm9uZVwiLFxuICAgIFwiT2tcIixcbiAgICBcIkVyclwiXG4gIF07XG4gIGNvbnN0IEJVSUxUSU5TID0gW1xuICAgIC8vIGZ1bmN0aW9uc1xuICAgICdkcm9wICcsXG4gICAgLy8gdHJhaXRzXG4gICAgXCJDb3B5XCIsXG4gICAgXCJTZW5kXCIsXG4gICAgXCJTaXplZFwiLFxuICAgIFwiU3luY1wiLFxuICAgIFwiRHJvcFwiLFxuICAgIFwiRm5cIixcbiAgICBcIkZuTXV0XCIsXG4gICAgXCJGbk9uY2VcIixcbiAgICBcIlRvT3duZWRcIixcbiAgICBcIkNsb25lXCIsXG4gICAgXCJEZWJ1Z1wiLFxuICAgIFwiUGFydGlhbEVxXCIsXG4gICAgXCJQYXJ0aWFsT3JkXCIsXG4gICAgXCJFcVwiLFxuICAgIFwiT3JkXCIsXG4gICAgXCJBc1JlZlwiLFxuICAgIFwiQXNNdXRcIixcbiAgICBcIkludG9cIixcbiAgICBcIkZyb21cIixcbiAgICBcIkRlZmF1bHRcIixcbiAgICBcIkl0ZXJhdG9yXCIsXG4gICAgXCJFeHRlbmRcIixcbiAgICBcIkludG9JdGVyYXRvclwiLFxuICAgIFwiRG91YmxlRW5kZWRJdGVyYXRvclwiLFxuICAgIFwiRXhhY3RTaXplSXRlcmF0b3JcIixcbiAgICBcIlNsaWNlQ29uY2F0RXh0XCIsXG4gICAgXCJUb1N0cmluZ1wiLFxuICAgIC8vIG1hY3Jvc1xuICAgIFwiYXNzZXJ0IVwiLFxuICAgIFwiYXNzZXJ0X2VxIVwiLFxuICAgIFwiYml0ZmxhZ3MhXCIsXG4gICAgXCJieXRlcyFcIixcbiAgICBcImNmZyFcIixcbiAgICBcImNvbCFcIixcbiAgICBcImNvbmNhdCFcIixcbiAgICBcImNvbmNhdF9pZGVudHMhXCIsXG4gICAgXCJkZWJ1Z19hc3NlcnQhXCIsXG4gICAgXCJkZWJ1Z19hc3NlcnRfZXEhXCIsXG4gICAgXCJlbnYhXCIsXG4gICAgXCJlcHJpbnRsbiFcIixcbiAgICBcInBhbmljIVwiLFxuICAgIFwiZmlsZSFcIixcbiAgICBcImZvcm1hdCFcIixcbiAgICBcImZvcm1hdF9hcmdzIVwiLFxuICAgIFwiaW5jbHVkZV9ieXRlcyFcIixcbiAgICBcImluY2x1ZGVfc3RyIVwiLFxuICAgIFwibGluZSFcIixcbiAgICBcImxvY2FsX2RhdGFfa2V5IVwiLFxuICAgIFwibW9kdWxlX3BhdGghXCIsXG4gICAgXCJvcHRpb25fZW52IVwiLFxuICAgIFwicHJpbnQhXCIsXG4gICAgXCJwcmludGxuIVwiLFxuICAgIFwic2VsZWN0IVwiLFxuICAgIFwic3RyaW5naWZ5IVwiLFxuICAgIFwidHJ5IVwiLFxuICAgIFwidW5pbXBsZW1lbnRlZCFcIixcbiAgICBcInVucmVhY2hhYmxlIVwiLFxuICAgIFwidmVjIVwiLFxuICAgIFwid3JpdGUhXCIsXG4gICAgXCJ3cml0ZWxuIVwiLFxuICAgIFwibWFjcm9fcnVsZXMhXCIsXG4gICAgXCJhc3NlcnRfbmUhXCIsXG4gICAgXCJkZWJ1Z19hc3NlcnRfbmUhXCJcbiAgXTtcbiAgY29uc3QgVFlQRVMgPSBbXG4gICAgXCJpOFwiLFxuICAgIFwiaTE2XCIsXG4gICAgXCJpMzJcIixcbiAgICBcImk2NFwiLFxuICAgIFwiaTEyOFwiLFxuICAgIFwiaXNpemVcIixcbiAgICBcInU4XCIsXG4gICAgXCJ1MTZcIixcbiAgICBcInUzMlwiLFxuICAgIFwidTY0XCIsXG4gICAgXCJ1MTI4XCIsXG4gICAgXCJ1c2l6ZVwiLFxuICAgIFwiZjMyXCIsXG4gICAgXCJmNjRcIixcbiAgICBcInN0clwiLFxuICAgIFwiY2hhclwiLFxuICAgIFwiYm9vbFwiLFxuICAgIFwiQm94XCIsXG4gICAgXCJPcHRpb25cIixcbiAgICBcIlJlc3VsdFwiLFxuICAgIFwiU3RyaW5nXCIsXG4gICAgXCJWZWNcIlxuICBdO1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdSdXN0JyxcbiAgICBhbGlhc2VzOiBbICdycycgXSxcbiAgICBrZXl3b3Jkczoge1xuICAgICAgJHBhdHRlcm46IGhsanMuSURFTlRfUkUgKyAnIT8nLFxuICAgICAgdHlwZTogVFlQRVMsXG4gICAgICBrZXl3b3JkOiBLRVlXT1JEUyxcbiAgICAgIGxpdGVyYWw6IExJVEVSQUxTLFxuICAgICAgYnVpbHRfaW46IEJVSUxUSU5TXG4gICAgfSxcbiAgICBpbGxlZ2FsOiAnPC8nLFxuICAgIGNvbnRhaW5zOiBbXG4gICAgICBobGpzLkNfTElORV9DT01NRU5UX01PREUsXG4gICAgICBobGpzLkNPTU1FTlQoJy9cXFxcKicsICdcXFxcKi8nLCB7IGNvbnRhaW5zOiBbICdzZWxmJyBdIH0pLFxuICAgICAgaGxqcy5pbmhlcml0KGhsanMuUVVPVEVfU1RSSU5HX01PREUsIHtcbiAgICAgICAgYmVnaW46IC9iP1wiLyxcbiAgICAgICAgaWxsZWdhbDogbnVsbFxuICAgICAgfSksXG4gICAgICB7XG4gICAgICAgIGNsYXNzTmFtZTogJ3N0cmluZycsXG4gICAgICAgIHZhcmlhbnRzOiBbXG4gICAgICAgICAgeyBiZWdpbjogL2I/cigjKilcIigufFxcbikqP1wiXFwxKD8hIykvIH0sXG4gICAgICAgICAgeyBiZWdpbjogL2I/J1xcXFw/KHhcXHd7Mn18dVxcd3s0fXxVXFx3ezh9fC4pJy8gfVxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBjbGFzc05hbWU6ICdzeW1ib2wnLFxuICAgICAgICBiZWdpbjogLydbYS16QS1aX11bYS16QS1aMC05X10qL1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgY2xhc3NOYW1lOiAnbnVtYmVyJyxcbiAgICAgICAgdmFyaWFudHM6IFtcbiAgICAgICAgICB7IGJlZ2luOiAnXFxcXGIwYihbMDFfXSspJyArIE5VTUJFUl9TVUZGSVggfSxcbiAgICAgICAgICB7IGJlZ2luOiAnXFxcXGIwbyhbMC03X10rKScgKyBOVU1CRVJfU1VGRklYIH0sXG4gICAgICAgICAgeyBiZWdpbjogJ1xcXFxiMHgoW0EtRmEtZjAtOV9dKyknICsgTlVNQkVSX1NVRkZJWCB9LFxuICAgICAgICAgIHsgYmVnaW46ICdcXFxcYihcXFxcZFtcXFxcZF9dKihcXFxcLlswLTlfXSspPyhbZUVdWystXT9bMC05X10rKT8pJ1xuICAgICAgICAgICAgICAgICAgICsgTlVNQkVSX1NVRkZJWCB9XG4gICAgICAgIF0sXG4gICAgICAgIHJlbGV2YW5jZTogMFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgYmVnaW46IFtcbiAgICAgICAgICAvZm4vLFxuICAgICAgICAgIC9cXHMrLyxcbiAgICAgICAgICBVTkRFUlNDT1JFX0lERU5UX1JFXG4gICAgICAgIF0sXG4gICAgICAgIGNsYXNzTmFtZToge1xuICAgICAgICAgIDE6IFwia2V5d29yZFwiLFxuICAgICAgICAgIDM6IFwidGl0bGUuZnVuY3Rpb25cIlxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBjbGFzc05hbWU6ICdtZXRhJyxcbiAgICAgICAgYmVnaW46ICcjIT9cXFxcWycsXG4gICAgICAgIGVuZDogJ1xcXFxdJyxcbiAgICAgICAgY29udGFpbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjbGFzc05hbWU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgYmVnaW46IC9cIi8sXG4gICAgICAgICAgICBlbmQ6IC9cIi8sXG4gICAgICAgICAgICBjb250YWluczogW1xuICAgICAgICAgICAgICBobGpzLkJBQ0tTTEFTSF9FU0NBUEVcbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGJlZ2luOiBbXG4gICAgICAgICAgL2xldC8sXG4gICAgICAgICAgL1xccysvLFxuICAgICAgICAgIC8oPzptdXRcXHMrKT8vLFxuICAgICAgICAgIFVOREVSU0NPUkVfSURFTlRfUkVcbiAgICAgICAgXSxcbiAgICAgICAgY2xhc3NOYW1lOiB7XG4gICAgICAgICAgMTogXCJrZXl3b3JkXCIsXG4gICAgICAgICAgMzogXCJrZXl3b3JkXCIsXG4gICAgICAgICAgNDogXCJ2YXJpYWJsZVwiXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAvLyBtdXN0IGNvbWUgYmVmb3JlIGltcGwvZm9yIHJ1bGUgbGF0ZXJcbiAgICAgIHtcbiAgICAgICAgYmVnaW46IFtcbiAgICAgICAgICAvZm9yLyxcbiAgICAgICAgICAvXFxzKy8sXG4gICAgICAgICAgVU5ERVJTQ09SRV9JREVOVF9SRSxcbiAgICAgICAgICAvXFxzKy8sXG4gICAgICAgICAgL2luL1xuICAgICAgICBdLFxuICAgICAgICBjbGFzc05hbWU6IHtcbiAgICAgICAgICAxOiBcImtleXdvcmRcIixcbiAgICAgICAgICAzOiBcInZhcmlhYmxlXCIsXG4gICAgICAgICAgNTogXCJrZXl3b3JkXCJcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgYmVnaW46IFtcbiAgICAgICAgICAvdHlwZS8sXG4gICAgICAgICAgL1xccysvLFxuICAgICAgICAgIFVOREVSU0NPUkVfSURFTlRfUkVcbiAgICAgICAgXSxcbiAgICAgICAgY2xhc3NOYW1lOiB7XG4gICAgICAgICAgMTogXCJrZXl3b3JkXCIsXG4gICAgICAgICAgMzogXCJ0aXRsZS5jbGFzc1wiXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGJlZ2luOiBbXG4gICAgICAgICAgLyg/OnRyYWl0fGVudW18c3RydWN0fHVuaW9ufGltcGx8Zm9yKS8sXG4gICAgICAgICAgL1xccysvLFxuICAgICAgICAgIFVOREVSU0NPUkVfSURFTlRfUkVcbiAgICAgICAgXSxcbiAgICAgICAgY2xhc3NOYW1lOiB7XG4gICAgICAgICAgMTogXCJrZXl3b3JkXCIsXG4gICAgICAgICAgMzogXCJ0aXRsZS5jbGFzc1wiXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGJlZ2luOiBobGpzLklERU5UX1JFICsgJzo6JyxcbiAgICAgICAga2V5d29yZHM6IHtcbiAgICAgICAgICBrZXl3b3JkOiBcIlNlbGZcIixcbiAgICAgICAgICBidWlsdF9pbjogQlVJTFRJTlMsXG4gICAgICAgICAgdHlwZTogVFlQRVNcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgY2xhc3NOYW1lOiBcInB1bmN0dWF0aW9uXCIsXG4gICAgICAgIGJlZ2luOiAnLT4nXG4gICAgICB9LFxuICAgICAgRlVOQ1RJT05fSU5WT0tFXG4gICAgXVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJ1c3Q7XG4iLCIvKlxuTGFuZ3VhZ2U6IFNoZWxsIFNlc3Npb25cblJlcXVpcmVzOiBiYXNoLmpzXG5BdXRob3I6IFRTVVlVU0FUTyBLaXRzdW5lIDxtYWtlLmp1c3Qub25AZ21haWwuY29tPlxuQ2F0ZWdvcnk6IGNvbW1vblxuQXVkaXQ6IDIwMjBcbiovXG5cbi8qKiBAdHlwZSBMYW5ndWFnZUZuICovXG5mdW5jdGlvbiBzaGVsbChobGpzKSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ1NoZWxsIFNlc3Npb24nLFxuICAgIGFsaWFzZXM6IFtcbiAgICAgICdjb25zb2xlJyxcbiAgICAgICdzaGVsbHNlc3Npb24nXG4gICAgXSxcbiAgICBjb250YWluczogW1xuICAgICAge1xuICAgICAgICBjbGFzc05hbWU6ICdtZXRhLnByb21wdCcsXG4gICAgICAgIC8vIFdlIGNhbm5vdCBhZGQgXFxzIChzcGFjZXMpIGluIHRoZSByZWd1bGFyIGV4cHJlc3Npb24gb3RoZXJ3aXNlIGl0IHdpbGwgYmUgdG9vIGJyb2FkIGFuZCBwcm9kdWNlIHVuZXhwZWN0ZWQgcmVzdWx0LlxuICAgICAgICAvLyBGb3IgaW5zdGFuY2UsIGluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSwgaXQgd291bGQgbWF0Y2ggXCJlY2hvIC9wYXRoL3RvL2hvbWUgPlwiIGFzIGEgcHJvbXB0OlxuICAgICAgICAvLyBlY2hvIC9wYXRoL3RvL2hvbWUgPiB0LmV4ZVxuICAgICAgICBiZWdpbjogL15cXHN7MCwzfVsvflxcd1xcZFtcXF0oKUAtXSpbPiUkI11bIF0/LyxcbiAgICAgICAgc3RhcnRzOiB7XG4gICAgICAgICAgZW5kOiAvW15cXFxcXSg/PVxccyokKS8sXG4gICAgICAgICAgc3ViTGFuZ3VhZ2U6ICdiYXNoJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgXVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNoZWxsO1xuIiwiLypcbiBMYW5ndWFnZTogU1FMXG4gV2Vic2l0ZTogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU1FMXG4gQ2F0ZWdvcnk6IGNvbW1vbiwgZGF0YWJhc2VcbiAqL1xuXG4vKlxuXG5Hb2FsczpcblxuU1FMIGlzIGludGVuZGVkIHRvIGhpZ2hsaWdodCBiYXNpYy9jb21tb24gU1FMIGtleXdvcmRzIGFuZCBleHByZXNzaW9uc1xuXG4tIElmIHByZXR0eSBtdWNoIGV2ZXJ5IHNpbmdsZSBTUUwgc2VydmVyIGluY2x1ZGVzIHN1cHBvcnRzLCB0aGVuIGl0J3MgYSBjYW5pZGF0ZS5cbi0gSXQgaXMgTk9UIGludGVuZGVkIHRvIGluY2x1ZGUgdG9ucyBvZiB2ZW5kb3Igc3BlY2lmaWMga2V5d29yZHMgKE9yYWNsZSwgTXlTUUwsXG4gIFBvc3RncmVTUUwpIGFsdGhvdWdoIHRoZSBsaXN0IG9mIGRhdGEgdHlwZXMgaXMgcHVycG9zZWx5IGEgYml0IG1vcmUgZXhwYW5zaXZlLlxuLSBGb3IgbW9yZSBzcGVjaWZpYyBTUUwgZ3JhbW1hcnMgcGxlYXNlIHNlZTpcbiAgLSBQb3N0Z3JlU1FMIGFuZCBQTC9wZ1NRTCAtIGNvcmVcbiAgLSBULVNRTCAtIGh0dHBzOi8vZ2l0aHViLmNvbS9oaWdobGlnaHRqcy9oaWdobGlnaHRqcy10c3FsXG4gIC0gc3FsX21vcmUgKGNvcmUpXG5cbiAqL1xuXG5mdW5jdGlvbiBzcWwoaGxqcykge1xuICBjb25zdCByZWdleCA9IGhsanMucmVnZXg7XG4gIGNvbnN0IENPTU1FTlRfTU9ERSA9IGhsanMuQ09NTUVOVCgnLS0nLCAnJCcpO1xuICBjb25zdCBTVFJJTkcgPSB7XG4gICAgY2xhc3NOYW1lOiAnc3RyaW5nJyxcbiAgICB2YXJpYW50czogW1xuICAgICAge1xuICAgICAgICBiZWdpbjogLycvLFxuICAgICAgICBlbmQ6IC8nLyxcbiAgICAgICAgY29udGFpbnM6IFsgeyBiZWdpbjogLycnLyB9IF1cbiAgICAgIH1cbiAgICBdXG4gIH07XG4gIGNvbnN0IFFVT1RFRF9JREVOVElGSUVSID0ge1xuICAgIGJlZ2luOiAvXCIvLFxuICAgIGVuZDogL1wiLyxcbiAgICBjb250YWluczogWyB7IGJlZ2luOiAvXCJcIi8gfSBdXG4gIH07XG5cbiAgY29uc3QgTElURVJBTFMgPSBbXG4gICAgXCJ0cnVlXCIsXG4gICAgXCJmYWxzZVwiLFxuICAgIC8vIE5vdCBzdXJlIGl0J3MgY29ycmVjdCB0byBjYWxsIE5VTEwgbGl0ZXJhbCwgYW5kIGNsYXVzZXMgbGlrZSBJUyBbTk9UXSBOVUxMIGxvb2sgc3RyYW5nZSB0aGF0IHdheS5cbiAgICAvLyBcIm51bGxcIixcbiAgICBcInVua25vd25cIlxuICBdO1xuXG4gIGNvbnN0IE1VTFRJX1dPUkRfVFlQRVMgPSBbXG4gICAgXCJkb3VibGUgcHJlY2lzaW9uXCIsXG4gICAgXCJsYXJnZSBvYmplY3RcIixcbiAgICBcIndpdGggdGltZXpvbmVcIixcbiAgICBcIndpdGhvdXQgdGltZXpvbmVcIlxuICBdO1xuXG4gIGNvbnN0IFRZUEVTID0gW1xuICAgICdiaWdpbnQnLFxuICAgICdiaW5hcnknLFxuICAgICdibG9iJyxcbiAgICAnYm9vbGVhbicsXG4gICAgJ2NoYXInLFxuICAgICdjaGFyYWN0ZXInLFxuICAgICdjbG9iJyxcbiAgICAnZGF0ZScsXG4gICAgJ2RlYycsXG4gICAgJ2RlY2Zsb2F0JyxcbiAgICAnZGVjaW1hbCcsXG4gICAgJ2Zsb2F0JyxcbiAgICAnaW50JyxcbiAgICAnaW50ZWdlcicsXG4gICAgJ2ludGVydmFsJyxcbiAgICAnbmNoYXInLFxuICAgICduY2xvYicsXG4gICAgJ25hdGlvbmFsJyxcbiAgICAnbnVtZXJpYycsXG4gICAgJ3JlYWwnLFxuICAgICdyb3cnLFxuICAgICdzbWFsbGludCcsXG4gICAgJ3RpbWUnLFxuICAgICd0aW1lc3RhbXAnLFxuICAgICd2YXJjaGFyJyxcbiAgICAndmFyeWluZycsIC8vIG1vZGlmaWVyIChjaGFyYWN0ZXIgdmFyeWluZylcbiAgICAndmFyYmluYXJ5J1xuICBdO1xuXG4gIGNvbnN0IE5PTl9SRVNFUlZFRF9XT1JEUyA9IFtcbiAgICBcImFkZFwiLFxuICAgIFwiYXNjXCIsXG4gICAgXCJjb2xsYXRpb25cIixcbiAgICBcImRlc2NcIixcbiAgICBcImZpbmFsXCIsXG4gICAgXCJmaXJzdFwiLFxuICAgIFwibGFzdFwiLFxuICAgIFwidmlld1wiXG4gIF07XG5cbiAgLy8gaHR0cHM6Ly9qYWtld2hlYXQuZ2l0aHViLmlvL3NxbC1vdmVydmlldy9zcWwtMjAxNi1mb3VuZGF0aW9uLWdyYW1tYXIuaHRtbCNyZXNlcnZlZC13b3JkXG4gIGNvbnN0IFJFU0VSVkVEX1dPUkRTID0gW1xuICAgIFwiYWJzXCIsXG4gICAgXCJhY29zXCIsXG4gICAgXCJhbGxcIixcbiAgICBcImFsbG9jYXRlXCIsXG4gICAgXCJhbHRlclwiLFxuICAgIFwiYW5kXCIsXG4gICAgXCJhbnlcIixcbiAgICBcImFyZVwiLFxuICAgIFwiYXJyYXlcIixcbiAgICBcImFycmF5X2FnZ1wiLFxuICAgIFwiYXJyYXlfbWF4X2NhcmRpbmFsaXR5XCIsXG4gICAgXCJhc1wiLFxuICAgIFwiYXNlbnNpdGl2ZVwiLFxuICAgIFwiYXNpblwiLFxuICAgIFwiYXN5bW1ldHJpY1wiLFxuICAgIFwiYXRcIixcbiAgICBcImF0YW5cIixcbiAgICBcImF0b21pY1wiLFxuICAgIFwiYXV0aG9yaXphdGlvblwiLFxuICAgIFwiYXZnXCIsXG4gICAgXCJiZWdpblwiLFxuICAgIFwiYmVnaW5fZnJhbWVcIixcbiAgICBcImJlZ2luX3BhcnRpdGlvblwiLFxuICAgIFwiYmV0d2VlblwiLFxuICAgIFwiYmlnaW50XCIsXG4gICAgXCJiaW5hcnlcIixcbiAgICBcImJsb2JcIixcbiAgICBcImJvb2xlYW5cIixcbiAgICBcImJvdGhcIixcbiAgICBcImJ5XCIsXG4gICAgXCJjYWxsXCIsXG4gICAgXCJjYWxsZWRcIixcbiAgICBcImNhcmRpbmFsaXR5XCIsXG4gICAgXCJjYXNjYWRlZFwiLFxuICAgIFwiY2FzZVwiLFxuICAgIFwiY2FzdFwiLFxuICAgIFwiY2VpbFwiLFxuICAgIFwiY2VpbGluZ1wiLFxuICAgIFwiY2hhclwiLFxuICAgIFwiY2hhcl9sZW5ndGhcIixcbiAgICBcImNoYXJhY3RlclwiLFxuICAgIFwiY2hhcmFjdGVyX2xlbmd0aFwiLFxuICAgIFwiY2hlY2tcIixcbiAgICBcImNsYXNzaWZpZXJcIixcbiAgICBcImNsb2JcIixcbiAgICBcImNsb3NlXCIsXG4gICAgXCJjb2FsZXNjZVwiLFxuICAgIFwiY29sbGF0ZVwiLFxuICAgIFwiY29sbGVjdFwiLFxuICAgIFwiY29sdW1uXCIsXG4gICAgXCJjb21taXRcIixcbiAgICBcImNvbmRpdGlvblwiLFxuICAgIFwiY29ubmVjdFwiLFxuICAgIFwiY29uc3RyYWludFwiLFxuICAgIFwiY29udGFpbnNcIixcbiAgICBcImNvbnZlcnRcIixcbiAgICBcImNvcHlcIixcbiAgICBcImNvcnJcIixcbiAgICBcImNvcnJlc3BvbmRpbmdcIixcbiAgICBcImNvc1wiLFxuICAgIFwiY29zaFwiLFxuICAgIFwiY291bnRcIixcbiAgICBcImNvdmFyX3BvcFwiLFxuICAgIFwiY292YXJfc2FtcFwiLFxuICAgIFwiY3JlYXRlXCIsXG4gICAgXCJjcm9zc1wiLFxuICAgIFwiY3ViZVwiLFxuICAgIFwiY3VtZV9kaXN0XCIsXG4gICAgXCJjdXJyZW50XCIsXG4gICAgXCJjdXJyZW50X2NhdGFsb2dcIixcbiAgICBcImN1cnJlbnRfZGF0ZVwiLFxuICAgIFwiY3VycmVudF9kZWZhdWx0X3RyYW5zZm9ybV9ncm91cFwiLFxuICAgIFwiY3VycmVudF9wYXRoXCIsXG4gICAgXCJjdXJyZW50X3JvbGVcIixcbiAgICBcImN1cnJlbnRfcm93XCIsXG4gICAgXCJjdXJyZW50X3NjaGVtYVwiLFxuICAgIFwiY3VycmVudF90aW1lXCIsXG4gICAgXCJjdXJyZW50X3RpbWVzdGFtcFwiLFxuICAgIFwiY3VycmVudF9wYXRoXCIsXG4gICAgXCJjdXJyZW50X3JvbGVcIixcbiAgICBcImN1cnJlbnRfdHJhbnNmb3JtX2dyb3VwX2Zvcl90eXBlXCIsXG4gICAgXCJjdXJyZW50X3VzZXJcIixcbiAgICBcImN1cnNvclwiLFxuICAgIFwiY3ljbGVcIixcbiAgICBcImRhdGVcIixcbiAgICBcImRheVwiLFxuICAgIFwiZGVhbGxvY2F0ZVwiLFxuICAgIFwiZGVjXCIsXG4gICAgXCJkZWNpbWFsXCIsXG4gICAgXCJkZWNmbG9hdFwiLFxuICAgIFwiZGVjbGFyZVwiLFxuICAgIFwiZGVmYXVsdFwiLFxuICAgIFwiZGVmaW5lXCIsXG4gICAgXCJkZWxldGVcIixcbiAgICBcImRlbnNlX3JhbmtcIixcbiAgICBcImRlcmVmXCIsXG4gICAgXCJkZXNjcmliZVwiLFxuICAgIFwiZGV0ZXJtaW5pc3RpY1wiLFxuICAgIFwiZGlzY29ubmVjdFwiLFxuICAgIFwiZGlzdGluY3RcIixcbiAgICBcImRvdWJsZVwiLFxuICAgIFwiZHJvcFwiLFxuICAgIFwiZHluYW1pY1wiLFxuICAgIFwiZWFjaFwiLFxuICAgIFwiZWxlbWVudFwiLFxuICAgIFwiZWxzZVwiLFxuICAgIFwiZW1wdHlcIixcbiAgICBcImVuZFwiLFxuICAgIFwiZW5kX2ZyYW1lXCIsXG4gICAgXCJlbmRfcGFydGl0aW9uXCIsXG4gICAgXCJlbmQtZXhlY1wiLFxuICAgIFwiZXF1YWxzXCIsXG4gICAgXCJlc2NhcGVcIixcbiAgICBcImV2ZXJ5XCIsXG4gICAgXCJleGNlcHRcIixcbiAgICBcImV4ZWNcIixcbiAgICBcImV4ZWN1dGVcIixcbiAgICBcImV4aXN0c1wiLFxuICAgIFwiZXhwXCIsXG4gICAgXCJleHRlcm5hbFwiLFxuICAgIFwiZXh0cmFjdFwiLFxuICAgIFwiZmFsc2VcIixcbiAgICBcImZldGNoXCIsXG4gICAgXCJmaWx0ZXJcIixcbiAgICBcImZpcnN0X3ZhbHVlXCIsXG4gICAgXCJmbG9hdFwiLFxuICAgIFwiZmxvb3JcIixcbiAgICBcImZvclwiLFxuICAgIFwiZm9yZWlnblwiLFxuICAgIFwiZnJhbWVfcm93XCIsXG4gICAgXCJmcmVlXCIsXG4gICAgXCJmcm9tXCIsXG4gICAgXCJmdWxsXCIsXG4gICAgXCJmdW5jdGlvblwiLFxuICAgIFwiZnVzaW9uXCIsXG4gICAgXCJnZXRcIixcbiAgICBcImdsb2JhbFwiLFxuICAgIFwiZ3JhbnRcIixcbiAgICBcImdyb3VwXCIsXG4gICAgXCJncm91cGluZ1wiLFxuICAgIFwiZ3JvdXBzXCIsXG4gICAgXCJoYXZpbmdcIixcbiAgICBcImhvbGRcIixcbiAgICBcImhvdXJcIixcbiAgICBcImlkZW50aXR5XCIsXG4gICAgXCJpblwiLFxuICAgIFwiaW5kaWNhdG9yXCIsXG4gICAgXCJpbml0aWFsXCIsXG4gICAgXCJpbm5lclwiLFxuICAgIFwiaW5vdXRcIixcbiAgICBcImluc2Vuc2l0aXZlXCIsXG4gICAgXCJpbnNlcnRcIixcbiAgICBcImludFwiLFxuICAgIFwiaW50ZWdlclwiLFxuICAgIFwiaW50ZXJzZWN0XCIsXG4gICAgXCJpbnRlcnNlY3Rpb25cIixcbiAgICBcImludGVydmFsXCIsXG4gICAgXCJpbnRvXCIsXG4gICAgXCJpc1wiLFxuICAgIFwiam9pblwiLFxuICAgIFwianNvbl9hcnJheVwiLFxuICAgIFwianNvbl9hcnJheWFnZ1wiLFxuICAgIFwianNvbl9leGlzdHNcIixcbiAgICBcImpzb25fb2JqZWN0XCIsXG4gICAgXCJqc29uX29iamVjdGFnZ1wiLFxuICAgIFwianNvbl9xdWVyeVwiLFxuICAgIFwianNvbl90YWJsZVwiLFxuICAgIFwianNvbl90YWJsZV9wcmltaXRpdmVcIixcbiAgICBcImpzb25fdmFsdWVcIixcbiAgICBcImxhZ1wiLFxuICAgIFwibGFuZ3VhZ2VcIixcbiAgICBcImxhcmdlXCIsXG4gICAgXCJsYXN0X3ZhbHVlXCIsXG4gICAgXCJsYXRlcmFsXCIsXG4gICAgXCJsZWFkXCIsXG4gICAgXCJsZWFkaW5nXCIsXG4gICAgXCJsZWZ0XCIsXG4gICAgXCJsaWtlXCIsXG4gICAgXCJsaWtlX3JlZ2V4XCIsXG4gICAgXCJsaXN0YWdnXCIsXG4gICAgXCJsblwiLFxuICAgIFwibG9jYWxcIixcbiAgICBcImxvY2FsdGltZVwiLFxuICAgIFwibG9jYWx0aW1lc3RhbXBcIixcbiAgICBcImxvZ1wiLFxuICAgIFwibG9nMTBcIixcbiAgICBcImxvd2VyXCIsXG4gICAgXCJtYXRjaFwiLFxuICAgIFwibWF0Y2hfbnVtYmVyXCIsXG4gICAgXCJtYXRjaF9yZWNvZ25pemVcIixcbiAgICBcIm1hdGNoZXNcIixcbiAgICBcIm1heFwiLFxuICAgIFwibWVtYmVyXCIsXG4gICAgXCJtZXJnZVwiLFxuICAgIFwibWV0aG9kXCIsXG4gICAgXCJtaW5cIixcbiAgICBcIm1pbnV0ZVwiLFxuICAgIFwibW9kXCIsXG4gICAgXCJtb2RpZmllc1wiLFxuICAgIFwibW9kdWxlXCIsXG4gICAgXCJtb250aFwiLFxuICAgIFwibXVsdGlzZXRcIixcbiAgICBcIm5hdGlvbmFsXCIsXG4gICAgXCJuYXR1cmFsXCIsXG4gICAgXCJuY2hhclwiLFxuICAgIFwibmNsb2JcIixcbiAgICBcIm5ld1wiLFxuICAgIFwibm9cIixcbiAgICBcIm5vbmVcIixcbiAgICBcIm5vcm1hbGl6ZVwiLFxuICAgIFwibm90XCIsXG4gICAgXCJudGhfdmFsdWVcIixcbiAgICBcIm50aWxlXCIsXG4gICAgXCJudWxsXCIsXG4gICAgXCJudWxsaWZcIixcbiAgICBcIm51bWVyaWNcIixcbiAgICBcIm9jdGV0X2xlbmd0aFwiLFxuICAgIFwib2NjdXJyZW5jZXNfcmVnZXhcIixcbiAgICBcIm9mXCIsXG4gICAgXCJvZmZzZXRcIixcbiAgICBcIm9sZFwiLFxuICAgIFwib21pdFwiLFxuICAgIFwib25cIixcbiAgICBcIm9uZVwiLFxuICAgIFwib25seVwiLFxuICAgIFwib3BlblwiLFxuICAgIFwib3JcIixcbiAgICBcIm9yZGVyXCIsXG4gICAgXCJvdXRcIixcbiAgICBcIm91dGVyXCIsXG4gICAgXCJvdmVyXCIsXG4gICAgXCJvdmVybGFwc1wiLFxuICAgIFwib3ZlcmxheVwiLFxuICAgIFwicGFyYW1ldGVyXCIsXG4gICAgXCJwYXJ0aXRpb25cIixcbiAgICBcInBhdHRlcm5cIixcbiAgICBcInBlclwiLFxuICAgIFwicGVyY2VudFwiLFxuICAgIFwicGVyY2VudF9yYW5rXCIsXG4gICAgXCJwZXJjZW50aWxlX2NvbnRcIixcbiAgICBcInBlcmNlbnRpbGVfZGlzY1wiLFxuICAgIFwicGVyaW9kXCIsXG4gICAgXCJwb3J0aW9uXCIsXG4gICAgXCJwb3NpdGlvblwiLFxuICAgIFwicG9zaXRpb25fcmVnZXhcIixcbiAgICBcInBvd2VyXCIsXG4gICAgXCJwcmVjZWRlc1wiLFxuICAgIFwicHJlY2lzaW9uXCIsXG4gICAgXCJwcmVwYXJlXCIsXG4gICAgXCJwcmltYXJ5XCIsXG4gICAgXCJwcm9jZWR1cmVcIixcbiAgICBcInB0ZlwiLFxuICAgIFwicmFuZ2VcIixcbiAgICBcInJhbmtcIixcbiAgICBcInJlYWRzXCIsXG4gICAgXCJyZWFsXCIsXG4gICAgXCJyZWN1cnNpdmVcIixcbiAgICBcInJlZlwiLFxuICAgIFwicmVmZXJlbmNlc1wiLFxuICAgIFwicmVmZXJlbmNpbmdcIixcbiAgICBcInJlZ3JfYXZneFwiLFxuICAgIFwicmVncl9hdmd5XCIsXG4gICAgXCJyZWdyX2NvdW50XCIsXG4gICAgXCJyZWdyX2ludGVyY2VwdFwiLFxuICAgIFwicmVncl9yMlwiLFxuICAgIFwicmVncl9zbG9wZVwiLFxuICAgIFwicmVncl9zeHhcIixcbiAgICBcInJlZ3Jfc3h5XCIsXG4gICAgXCJyZWdyX3N5eVwiLFxuICAgIFwicmVsZWFzZVwiLFxuICAgIFwicmVzdWx0XCIsXG4gICAgXCJyZXR1cm5cIixcbiAgICBcInJldHVybnNcIixcbiAgICBcInJldm9rZVwiLFxuICAgIFwicmlnaHRcIixcbiAgICBcInJvbGxiYWNrXCIsXG4gICAgXCJyb2xsdXBcIixcbiAgICBcInJvd1wiLFxuICAgIFwicm93X251bWJlclwiLFxuICAgIFwicm93c1wiLFxuICAgIFwicnVubmluZ1wiLFxuICAgIFwic2F2ZXBvaW50XCIsXG4gICAgXCJzY29wZVwiLFxuICAgIFwic2Nyb2xsXCIsXG4gICAgXCJzZWFyY2hcIixcbiAgICBcInNlY29uZFwiLFxuICAgIFwic2Vla1wiLFxuICAgIFwic2VsZWN0XCIsXG4gICAgXCJzZW5zaXRpdmVcIixcbiAgICBcInNlc3Npb25fdXNlclwiLFxuICAgIFwic2V0XCIsXG4gICAgXCJzaG93XCIsXG4gICAgXCJzaW1pbGFyXCIsXG4gICAgXCJzaW5cIixcbiAgICBcInNpbmhcIixcbiAgICBcInNraXBcIixcbiAgICBcInNtYWxsaW50XCIsXG4gICAgXCJzb21lXCIsXG4gICAgXCJzcGVjaWZpY1wiLFxuICAgIFwic3BlY2lmaWN0eXBlXCIsXG4gICAgXCJzcWxcIixcbiAgICBcInNxbGV4Y2VwdGlvblwiLFxuICAgIFwic3Fsc3RhdGVcIixcbiAgICBcInNxbHdhcm5pbmdcIixcbiAgICBcInNxcnRcIixcbiAgICBcInN0YXJ0XCIsXG4gICAgXCJzdGF0aWNcIixcbiAgICBcInN0ZGRldl9wb3BcIixcbiAgICBcInN0ZGRldl9zYW1wXCIsXG4gICAgXCJzdWJtdWx0aXNldFwiLFxuICAgIFwic3Vic2V0XCIsXG4gICAgXCJzdWJzdHJpbmdcIixcbiAgICBcInN1YnN0cmluZ19yZWdleFwiLFxuICAgIFwic3VjY2VlZHNcIixcbiAgICBcInN1bVwiLFxuICAgIFwic3ltbWV0cmljXCIsXG4gICAgXCJzeXN0ZW1cIixcbiAgICBcInN5c3RlbV90aW1lXCIsXG4gICAgXCJzeXN0ZW1fdXNlclwiLFxuICAgIFwidGFibGVcIixcbiAgICBcInRhYmxlc2FtcGxlXCIsXG4gICAgXCJ0YW5cIixcbiAgICBcInRhbmhcIixcbiAgICBcInRoZW5cIixcbiAgICBcInRpbWVcIixcbiAgICBcInRpbWVzdGFtcFwiLFxuICAgIFwidGltZXpvbmVfaG91clwiLFxuICAgIFwidGltZXpvbmVfbWludXRlXCIsXG4gICAgXCJ0b1wiLFxuICAgIFwidHJhaWxpbmdcIixcbiAgICBcInRyYW5zbGF0ZVwiLFxuICAgIFwidHJhbnNsYXRlX3JlZ2V4XCIsXG4gICAgXCJ0cmFuc2xhdGlvblwiLFxuICAgIFwidHJlYXRcIixcbiAgICBcInRyaWdnZXJcIixcbiAgICBcInRyaW1cIixcbiAgICBcInRyaW1fYXJyYXlcIixcbiAgICBcInRydWVcIixcbiAgICBcInRydW5jYXRlXCIsXG4gICAgXCJ1ZXNjYXBlXCIsXG4gICAgXCJ1bmlvblwiLFxuICAgIFwidW5pcXVlXCIsXG4gICAgXCJ1bmtub3duXCIsXG4gICAgXCJ1bm5lc3RcIixcbiAgICBcInVwZGF0ZVwiLFxuICAgIFwidXBwZXJcIixcbiAgICBcInVzZXJcIixcbiAgICBcInVzaW5nXCIsXG4gICAgXCJ2YWx1ZVwiLFxuICAgIFwidmFsdWVzXCIsXG4gICAgXCJ2YWx1ZV9vZlwiLFxuICAgIFwidmFyX3BvcFwiLFxuICAgIFwidmFyX3NhbXBcIixcbiAgICBcInZhcmJpbmFyeVwiLFxuICAgIFwidmFyY2hhclwiLFxuICAgIFwidmFyeWluZ1wiLFxuICAgIFwidmVyc2lvbmluZ1wiLFxuICAgIFwid2hlblwiLFxuICAgIFwid2hlbmV2ZXJcIixcbiAgICBcIndoZXJlXCIsXG4gICAgXCJ3aWR0aF9idWNrZXRcIixcbiAgICBcIndpbmRvd1wiLFxuICAgIFwid2l0aFwiLFxuICAgIFwid2l0aGluXCIsXG4gICAgXCJ3aXRob3V0XCIsXG4gICAgXCJ5ZWFyXCIsXG4gIF07XG5cbiAgLy8gdGhlc2UgYXJlIHJlc2VydmVkIHdvcmRzIHdlIGhhdmUgaWRlbnRpZmllZCB0byBiZSBmdW5jdGlvbnNcbiAgLy8gYW5kIHNob3VsZCBvbmx5IGJlIGhpZ2hsaWdodGVkIGluIGEgZGlzcGF0Y2gtbGlrZSBjb250ZXh0XG4gIC8vIGllLCBhcnJheV9hZ2coLi4uKSwgZXRjLlxuICBjb25zdCBSRVNFUlZFRF9GVU5DVElPTlMgPSBbXG4gICAgXCJhYnNcIixcbiAgICBcImFjb3NcIixcbiAgICBcImFycmF5X2FnZ1wiLFxuICAgIFwiYXNpblwiLFxuICAgIFwiYXRhblwiLFxuICAgIFwiYXZnXCIsXG4gICAgXCJjYXN0XCIsXG4gICAgXCJjZWlsXCIsXG4gICAgXCJjZWlsaW5nXCIsXG4gICAgXCJjb2FsZXNjZVwiLFxuICAgIFwiY29yclwiLFxuICAgIFwiY29zXCIsXG4gICAgXCJjb3NoXCIsXG4gICAgXCJjb3VudFwiLFxuICAgIFwiY292YXJfcG9wXCIsXG4gICAgXCJjb3Zhcl9zYW1wXCIsXG4gICAgXCJjdW1lX2Rpc3RcIixcbiAgICBcImRlbnNlX3JhbmtcIixcbiAgICBcImRlcmVmXCIsXG4gICAgXCJlbGVtZW50XCIsXG4gICAgXCJleHBcIixcbiAgICBcImV4dHJhY3RcIixcbiAgICBcImZpcnN0X3ZhbHVlXCIsXG4gICAgXCJmbG9vclwiLFxuICAgIFwianNvbl9hcnJheVwiLFxuICAgIFwianNvbl9hcnJheWFnZ1wiLFxuICAgIFwianNvbl9leGlzdHNcIixcbiAgICBcImpzb25fb2JqZWN0XCIsXG4gICAgXCJqc29uX29iamVjdGFnZ1wiLFxuICAgIFwianNvbl9xdWVyeVwiLFxuICAgIFwianNvbl90YWJsZVwiLFxuICAgIFwianNvbl90YWJsZV9wcmltaXRpdmVcIixcbiAgICBcImpzb25fdmFsdWVcIixcbiAgICBcImxhZ1wiLFxuICAgIFwibGFzdF92YWx1ZVwiLFxuICAgIFwibGVhZFwiLFxuICAgIFwibGlzdGFnZ1wiLFxuICAgIFwibG5cIixcbiAgICBcImxvZ1wiLFxuICAgIFwibG9nMTBcIixcbiAgICBcImxvd2VyXCIsXG4gICAgXCJtYXhcIixcbiAgICBcIm1pblwiLFxuICAgIFwibW9kXCIsXG4gICAgXCJudGhfdmFsdWVcIixcbiAgICBcIm50aWxlXCIsXG4gICAgXCJudWxsaWZcIixcbiAgICBcInBlcmNlbnRfcmFua1wiLFxuICAgIFwicGVyY2VudGlsZV9jb250XCIsXG4gICAgXCJwZXJjZW50aWxlX2Rpc2NcIixcbiAgICBcInBvc2l0aW9uXCIsXG4gICAgXCJwb3NpdGlvbl9yZWdleFwiLFxuICAgIFwicG93ZXJcIixcbiAgICBcInJhbmtcIixcbiAgICBcInJlZ3JfYXZneFwiLFxuICAgIFwicmVncl9hdmd5XCIsXG4gICAgXCJyZWdyX2NvdW50XCIsXG4gICAgXCJyZWdyX2ludGVyY2VwdFwiLFxuICAgIFwicmVncl9yMlwiLFxuICAgIFwicmVncl9zbG9wZVwiLFxuICAgIFwicmVncl9zeHhcIixcbiAgICBcInJlZ3Jfc3h5XCIsXG4gICAgXCJyZWdyX3N5eVwiLFxuICAgIFwicm93X251bWJlclwiLFxuICAgIFwic2luXCIsXG4gICAgXCJzaW5oXCIsXG4gICAgXCJzcXJ0XCIsXG4gICAgXCJzdGRkZXZfcG9wXCIsXG4gICAgXCJzdGRkZXZfc2FtcFwiLFxuICAgIFwic3Vic3RyaW5nXCIsXG4gICAgXCJzdWJzdHJpbmdfcmVnZXhcIixcbiAgICBcInN1bVwiLFxuICAgIFwidGFuXCIsXG4gICAgXCJ0YW5oXCIsXG4gICAgXCJ0cmFuc2xhdGVcIixcbiAgICBcInRyYW5zbGF0ZV9yZWdleFwiLFxuICAgIFwidHJlYXRcIixcbiAgICBcInRyaW1cIixcbiAgICBcInRyaW1fYXJyYXlcIixcbiAgICBcInVubmVzdFwiLFxuICAgIFwidXBwZXJcIixcbiAgICBcInZhbHVlX29mXCIsXG4gICAgXCJ2YXJfcG9wXCIsXG4gICAgXCJ2YXJfc2FtcFwiLFxuICAgIFwid2lkdGhfYnVja2V0XCIsXG4gIF07XG5cbiAgLy8gdGhlc2UgZnVuY3Rpb25zIGNhblxuICBjb25zdCBQT1NTSUJMRV9XSVRIT1VUX1BBUkVOUyA9IFtcbiAgICBcImN1cnJlbnRfY2F0YWxvZ1wiLFxuICAgIFwiY3VycmVudF9kYXRlXCIsXG4gICAgXCJjdXJyZW50X2RlZmF1bHRfdHJhbnNmb3JtX2dyb3VwXCIsXG4gICAgXCJjdXJyZW50X3BhdGhcIixcbiAgICBcImN1cnJlbnRfcm9sZVwiLFxuICAgIFwiY3VycmVudF9zY2hlbWFcIixcbiAgICBcImN1cnJlbnRfdHJhbnNmb3JtX2dyb3VwX2Zvcl90eXBlXCIsXG4gICAgXCJjdXJyZW50X3VzZXJcIixcbiAgICBcInNlc3Npb25fdXNlclwiLFxuICAgIFwic3lzdGVtX3RpbWVcIixcbiAgICBcInN5c3RlbV91c2VyXCIsXG4gICAgXCJjdXJyZW50X3RpbWVcIixcbiAgICBcImxvY2FsdGltZVwiLFxuICAgIFwiY3VycmVudF90aW1lc3RhbXBcIixcbiAgICBcImxvY2FsdGltZXN0YW1wXCJcbiAgXTtcblxuICAvLyB0aG9zZSBleGlzdCB0byBib29zdCByZWxldmFuY2UgbWFraW5nIHRoZXNlIHZlcnlcbiAgLy8gXCJTUUwgbGlrZVwiIGtleXdvcmQgY29tYm9zIHdvcnRoICsxIGV4dHJhIHJlbGV2YW5jZVxuICBjb25zdCBDT01CT1MgPSBbXG4gICAgXCJjcmVhdGUgdGFibGVcIixcbiAgICBcImluc2VydCBpbnRvXCIsXG4gICAgXCJwcmltYXJ5IGtleVwiLFxuICAgIFwiZm9yZWlnbiBrZXlcIixcbiAgICBcIm5vdCBudWxsXCIsXG4gICAgXCJhbHRlciB0YWJsZVwiLFxuICAgIFwiYWRkIGNvbnN0cmFpbnRcIixcbiAgICBcImdyb3VwaW5nIHNldHNcIixcbiAgICBcIm9uIG92ZXJmbG93XCIsXG4gICAgXCJjaGFyYWN0ZXIgc2V0XCIsXG4gICAgXCJyZXNwZWN0IG51bGxzXCIsXG4gICAgXCJpZ25vcmUgbnVsbHNcIixcbiAgICBcIm51bGxzIGZpcnN0XCIsXG4gICAgXCJudWxscyBsYXN0XCIsXG4gICAgXCJkZXB0aCBmaXJzdFwiLFxuICAgIFwiYnJlYWR0aCBmaXJzdFwiXG4gIF07XG5cbiAgY29uc3QgRlVOQ1RJT05TID0gUkVTRVJWRURfRlVOQ1RJT05TO1xuXG4gIGNvbnN0IEtFWVdPUkRTID0gW1xuICAgIC4uLlJFU0VSVkVEX1dPUkRTLFxuICAgIC4uLk5PTl9SRVNFUlZFRF9XT1JEU1xuICBdLmZpbHRlcigoa2V5d29yZCkgPT4ge1xuICAgIHJldHVybiAhUkVTRVJWRURfRlVOQ1RJT05TLmluY2x1ZGVzKGtleXdvcmQpO1xuICB9KTtcblxuICBjb25zdCBWQVJJQUJMRSA9IHtcbiAgICBjbGFzc05hbWU6IFwidmFyaWFibGVcIixcbiAgICBiZWdpbjogL0BbYS16MC05XVthLXowLTlfXSovLFxuICB9O1xuXG4gIGNvbnN0IE9QRVJBVE9SID0ge1xuICAgIGNsYXNzTmFtZTogXCJvcGVyYXRvclwiLFxuICAgIGJlZ2luOiAvWy0rKi89JV5+XXwmJj98XFx8XFx8P3whPT98PCg/Oj0+P3w8fD4pP3w+Wz49XT8vLFxuICAgIHJlbGV2YW5jZTogMCxcbiAgfTtcblxuICBjb25zdCBGVU5DVElPTl9DQUxMID0ge1xuICAgIGJlZ2luOiByZWdleC5jb25jYXQoL1xcYi8sIHJlZ2V4LmVpdGhlciguLi5GVU5DVElPTlMpLCAvXFxzKlxcKC8pLFxuICAgIHJlbGV2YW5jZTogMCxcbiAgICBrZXl3b3JkczogeyBidWlsdF9pbjogRlVOQ1RJT05TIH1cbiAgfTtcblxuICAvLyBrZXl3b3JkcyB3aXRoIGxlc3MgdGhhbiAzIGxldHRlcnMgYXJlIHJlZHVjZWQgaW4gcmVsZXZhbmN5XG4gIGZ1bmN0aW9uIHJlZHVjZVJlbGV2YW5jeShsaXN0LCB7XG4gICAgZXhjZXB0aW9ucywgd2hlblxuICB9ID0ge30pIHtcbiAgICBjb25zdCBxdWFsaWZ5Rm4gPSB3aGVuO1xuICAgIGV4Y2VwdGlvbnMgPSBleGNlcHRpb25zIHx8IFtdO1xuICAgIHJldHVybiBsaXN0Lm1hcCgoaXRlbSkgPT4ge1xuICAgICAgaWYgKGl0ZW0ubWF0Y2goL1xcfFxcZCskLykgfHwgZXhjZXB0aW9ucy5pbmNsdWRlcyhpdGVtKSkge1xuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgIH0gZWxzZSBpZiAocXVhbGlmeUZuKGl0ZW0pKSB7XG4gICAgICAgIHJldHVybiBgJHtpdGVtfXwwYDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnU1FMJyxcbiAgICBjYXNlX2luc2Vuc2l0aXZlOiB0cnVlLFxuICAgIC8vIGRvZXMgbm90IGluY2x1ZGUge30gb3IgSFRNTCB0YWdzIGA8L2BcbiAgICBpbGxlZ2FsOiAvW3t9XXw8XFwvLyxcbiAgICBrZXl3b3Jkczoge1xuICAgICAgJHBhdHRlcm46IC9cXGJbXFx3XFwuXSsvLFxuICAgICAga2V5d29yZDpcbiAgICAgICAgcmVkdWNlUmVsZXZhbmN5KEtFWVdPUkRTLCB7IHdoZW46ICh4KSA9PiB4Lmxlbmd0aCA8IDMgfSksXG4gICAgICBsaXRlcmFsOiBMSVRFUkFMUyxcbiAgICAgIHR5cGU6IFRZUEVTLFxuICAgICAgYnVpbHRfaW46IFBPU1NJQkxFX1dJVEhPVVRfUEFSRU5TXG4gICAgfSxcbiAgICBjb250YWluczogW1xuICAgICAge1xuICAgICAgICBiZWdpbjogcmVnZXguZWl0aGVyKC4uLkNPTUJPUyksXG4gICAgICAgIHJlbGV2YW5jZTogMCxcbiAgICAgICAga2V5d29yZHM6IHtcbiAgICAgICAgICAkcGF0dGVybjogL1tcXHdcXC5dKy8sXG4gICAgICAgICAga2V5d29yZDogS0VZV09SRFMuY29uY2F0KENPTUJPUyksXG4gICAgICAgICAgbGl0ZXJhbDogTElURVJBTFMsXG4gICAgICAgICAgdHlwZTogVFlQRVNcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGNsYXNzTmFtZTogXCJ0eXBlXCIsXG4gICAgICAgIGJlZ2luOiByZWdleC5laXRoZXIoLi4uTVVMVElfV09SRF9UWVBFUylcbiAgICAgIH0sXG4gICAgICBGVU5DVElPTl9DQUxMLFxuICAgICAgVkFSSUFCTEUsXG4gICAgICBTVFJJTkcsXG4gICAgICBRVU9URURfSURFTlRJRklFUixcbiAgICAgIGhsanMuQ19OVU1CRVJfTU9ERSxcbiAgICAgIGhsanMuQ19CTE9DS19DT01NRU5UX01PREUsXG4gICAgICBDT01NRU5UX01PREUsXG4gICAgICBPUEVSQVRPUlxuICAgIF1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzcWw7XG4iLCIvKlxuTGFuZ3VhZ2U6IEhUTUwsIFhNTFxuV2Vic2l0ZTogaHR0cHM6Ly93d3cudzMub3JnL1hNTC9cbkNhdGVnb3J5OiBjb21tb24sIHdlYlxuQXVkaXQ6IDIwMjBcbiovXG5cbi8qKiBAdHlwZSBMYW5ndWFnZUZuICovXG5mdW5jdGlvbiB4bWwoaGxqcykge1xuICBjb25zdCByZWdleCA9IGhsanMucmVnZXg7XG4gIC8vIFhNTCBuYW1lcyBjYW4gaGF2ZSB0aGUgZm9sbG93aW5nIGFkZGl0aW9uYWwgbGV0dGVyczogaHR0cHM6Ly93d3cudzMub3JnL1RSL3htbC8jTlQtTmFtZUNoYXJcbiAgLy8gT1RIRVJfTkFNRV9DSEFSUyA9IC9bOlxcLS4wLTlcXHUwMEI3XFx1MDMwMC1cXHUwMzZGXFx1MjAzRi1cXHUyMDQwXS87XG4gIC8vIEVsZW1lbnQgbmFtZXMgc3RhcnQgd2l0aCBOQU1FX1NUQVJUX0NIQVIgZm9sbG93ZWQgYnkgb3B0aW9uYWwgb3RoZXIgVW5pY29kZSBsZXR0ZXJzLCBBU0NJSSBkaWdpdHMsIGh5cGhlbnMsIHVuZGVyc2NvcmVzLCBhbmQgcGVyaW9kc1xuICAvLyBjb25zdCBUQUdfTkFNRV9SRSA9IHJlZ2V4LmNvbmNhdCgvW0EtWl9hLXpcXHUwMEMwLVxcdTAwRDZcXHUwMEQ4LVxcdTAwRjZcXHUwMEY4LVxcdTAyRkZcXHUwMzcwLVxcdTAzN0RcXHUwMzdGLVxcdTFGRkZcXHUyMDBDLVxcdTIwMERcXHUyMDcwLVxcdTIxOEZcXHUyQzAwLVxcdTJGRUZcXHUzMDAxLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRkRdLywgcmVnZXgub3B0aW9uYWwoL1tBLVpfYS16XFx1MDBDMC1cXHUwMEQ2XFx1MDBEOC1cXHUwMEY2XFx1MDBGOC1cXHUwMkZGXFx1MDM3MC1cXHUwMzdEXFx1MDM3Ri1cXHUxRkZGXFx1MjAwQy1cXHUyMDBEXFx1MjA3MC1cXHUyMThGXFx1MkMwMC1cXHUyRkVGXFx1MzAwMS1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkZEXFwtLjAtOVxcdTAwQjdcXHUwMzAwLVxcdTAzNkZcXHUyMDNGLVxcdTIwNDBdKjovKSwgL1tBLVpfYS16XFx1MDBDMC1cXHUwMEQ2XFx1MDBEOC1cXHUwMEY2XFx1MDBGOC1cXHUwMkZGXFx1MDM3MC1cXHUwMzdEXFx1MDM3Ri1cXHUxRkZGXFx1MjAwQy1cXHUyMDBEXFx1MjA3MC1cXHUyMThGXFx1MkMwMC1cXHUyRkVGXFx1MzAwMS1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkZEXFwtLjAtOVxcdTAwQjdcXHUwMzAwLVxcdTAzNkZcXHUyMDNGLVxcdTIwNDBdKi8pOztcbiAgLy8gY29uc3QgWE1MX0lERU5UX1JFID0gL1tBLVpfYS16OlxcdTAwQzAtXFx1MDBENlxcdTAwRDgtXFx1MDBGNlxcdTAwRjgtXFx1MDJGRlxcdTAzNzAtXFx1MDM3RFxcdTAzN0YtXFx1MUZGRlxcdTIwMEMtXFx1MjAwRFxcdTIwNzAtXFx1MjE4RlxcdTJDMDAtXFx1MkZFRlxcdTMwMDEtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZGRFxcLS4wLTlcXHUwMEI3XFx1MDMwMC1cXHUwMzZGXFx1MjAzRi1cXHUyMDQwXSsvO1xuICAvLyBjb25zdCBUQUdfTkFNRV9SRSA9IHJlZ2V4LmNvbmNhdCgvW0EtWl9hLXpcXHUwMEMwLVxcdTAwRDZcXHUwMEQ4LVxcdTAwRjZcXHUwMEY4LVxcdTAyRkZcXHUwMzcwLVxcdTAzN0RcXHUwMzdGLVxcdTFGRkZcXHUyMDBDLVxcdTIwMERcXHUyMDcwLVxcdTIxOEZcXHUyQzAwLVxcdTJGRUZcXHUzMDAxLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRkRdLywgcmVnZXgub3B0aW9uYWwoL1tBLVpfYS16XFx1MDBDMC1cXHUwMEQ2XFx1MDBEOC1cXHUwMEY2XFx1MDBGOC1cXHUwMkZGXFx1MDM3MC1cXHUwMzdEXFx1MDM3Ri1cXHUxRkZGXFx1MjAwQy1cXHUyMDBEXFx1MjA3MC1cXHUyMThGXFx1MkMwMC1cXHUyRkVGXFx1MzAwMS1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkZEXFwtLjAtOVxcdTAwQjdcXHUwMzAwLVxcdTAzNkZcXHUyMDNGLVxcdTIwNDBdKjovKSwgL1tBLVpfYS16XFx1MDBDMC1cXHUwMEQ2XFx1MDBEOC1cXHUwMEY2XFx1MDBGOC1cXHUwMkZGXFx1MDM3MC1cXHUwMzdEXFx1MDM3Ri1cXHUxRkZGXFx1MjAwQy1cXHUyMDBEXFx1MjA3MC1cXHUyMThGXFx1MkMwMC1cXHUyRkVGXFx1MzAwMS1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkZEXFwtLjAtOVxcdTAwQjdcXHUwMzAwLVxcdTAzNkZcXHUyMDNGLVxcdTIwNDBdKi8pO1xuICAvLyBob3dldmVyLCB0byBjYXRlciBmb3IgcGVyZm9ybWFuY2UgYW5kIG1vcmUgVW5pY29kZSBzdXBwb3J0IHJlbHkgc2ltcGx5IG9uIHRoZSBVbmljb2RlIGxldHRlciBjbGFzc1xuICBjb25zdCBUQUdfTkFNRV9SRSA9IHJlZ2V4LmNvbmNhdCgvW1xccHtMfV9dL3UsIHJlZ2V4Lm9wdGlvbmFsKC9bXFxwe0x9MC05Xy4tXSo6L3UpLCAvW1xccHtMfTAtOV8uLV0qL3UpO1xuICBjb25zdCBYTUxfSURFTlRfUkUgPSAvW1xccHtMfTAtOS5fOi1dKy91O1xuICBjb25zdCBYTUxfRU5USVRJRVMgPSB7XG4gICAgY2xhc3NOYW1lOiAnc3ltYm9sJyxcbiAgICBiZWdpbjogLyZbYS16XSs7fCYjWzAtOV0rO3wmI3hbYS1mMC05XSs7L1xuICB9O1xuICBjb25zdCBYTUxfTUVUQV9LRVlXT1JEUyA9IHtcbiAgICBiZWdpbjogL1xccy8sXG4gICAgY29udGFpbnM6IFtcbiAgICAgIHtcbiAgICAgICAgY2xhc3NOYW1lOiAna2V5d29yZCcsXG4gICAgICAgIGJlZ2luOiAvIz9bYS16X11bYS16MS05Xy1dKy8sXG4gICAgICAgIGlsbGVnYWw6IC9cXG4vXG4gICAgICB9XG4gICAgXVxuICB9O1xuICBjb25zdCBYTUxfTUVUQV9QQVJfS0VZV09SRFMgPSBobGpzLmluaGVyaXQoWE1MX01FVEFfS0VZV09SRFMsIHtcbiAgICBiZWdpbjogL1xcKC8sXG4gICAgZW5kOiAvXFwpL1xuICB9KTtcbiAgY29uc3QgQVBPU19NRVRBX1NUUklOR19NT0RFID0gaGxqcy5pbmhlcml0KGhsanMuQVBPU19TVFJJTkdfTU9ERSwgeyBjbGFzc05hbWU6ICdzdHJpbmcnIH0pO1xuICBjb25zdCBRVU9URV9NRVRBX1NUUklOR19NT0RFID0gaGxqcy5pbmhlcml0KGhsanMuUVVPVEVfU1RSSU5HX01PREUsIHsgY2xhc3NOYW1lOiAnc3RyaW5nJyB9KTtcbiAgY29uc3QgVEFHX0lOVEVSTkFMUyA9IHtcbiAgICBlbmRzV2l0aFBhcmVudDogdHJ1ZSxcbiAgICBpbGxlZ2FsOiAvPC8sXG4gICAgcmVsZXZhbmNlOiAwLFxuICAgIGNvbnRhaW5zOiBbXG4gICAgICB7XG4gICAgICAgIGNsYXNzTmFtZTogJ2F0dHInLFxuICAgICAgICBiZWdpbjogWE1MX0lERU5UX1JFLFxuICAgICAgICByZWxldmFuY2U6IDBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGJlZ2luOiAvPVxccyovLFxuICAgICAgICByZWxldmFuY2U6IDAsXG4gICAgICAgIGNvbnRhaW5zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgY2xhc3NOYW1lOiAnc3RyaW5nJyxcbiAgICAgICAgICAgIGVuZHNQYXJlbnQ6IHRydWUsXG4gICAgICAgICAgICB2YXJpYW50czogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmVnaW46IC9cIi8sXG4gICAgICAgICAgICAgICAgZW5kOiAvXCIvLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5zOiBbIFhNTF9FTlRJVElFUyBdXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBiZWdpbjogLycvLFxuICAgICAgICAgICAgICAgIGVuZDogLycvLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5zOiBbIFhNTF9FTlRJVElFUyBdXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHsgYmVnaW46IC9bXlxcc1wiJz08PmBdKy8gfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfVxuICAgIF1cbiAgfTtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnSFRNTCwgWE1MJyxcbiAgICBhbGlhc2VzOiBbXG4gICAgICAnaHRtbCcsXG4gICAgICAneGh0bWwnLFxuICAgICAgJ3JzcycsXG4gICAgICAnYXRvbScsXG4gICAgICAneGpiJyxcbiAgICAgICd4c2QnLFxuICAgICAgJ3hzbCcsXG4gICAgICAncGxpc3QnLFxuICAgICAgJ3dzZicsXG4gICAgICAnc3ZnJ1xuICAgIF0sXG4gICAgY2FzZV9pbnNlbnNpdGl2ZTogdHJ1ZSxcbiAgICB1bmljb2RlUmVnZXg6IHRydWUsXG4gICAgY29udGFpbnM6IFtcbiAgICAgIHtcbiAgICAgICAgY2xhc3NOYW1lOiAnbWV0YScsXG4gICAgICAgIGJlZ2luOiAvPCFbYS16XS8sXG4gICAgICAgIGVuZDogLz4vLFxuICAgICAgICByZWxldmFuY2U6IDEwLFxuICAgICAgICBjb250YWluczogW1xuICAgICAgICAgIFhNTF9NRVRBX0tFWVdPUkRTLFxuICAgICAgICAgIFFVT1RFX01FVEFfU1RSSU5HX01PREUsXG4gICAgICAgICAgQVBPU19NRVRBX1NUUklOR19NT0RFLFxuICAgICAgICAgIFhNTF9NRVRBX1BBUl9LRVlXT1JEUyxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBiZWdpbjogL1xcWy8sXG4gICAgICAgICAgICBlbmQ6IC9cXF0vLFxuICAgICAgICAgICAgY29udGFpbnM6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ21ldGEnLFxuICAgICAgICAgICAgICAgIGJlZ2luOiAvPCFbYS16XS8sXG4gICAgICAgICAgICAgICAgZW5kOiAvPi8sXG4gICAgICAgICAgICAgICAgY29udGFpbnM6IFtcbiAgICAgICAgICAgICAgICAgIFhNTF9NRVRBX0tFWVdPUkRTLFxuICAgICAgICAgICAgICAgICAgWE1MX01FVEFfUEFSX0tFWVdPUkRTLFxuICAgICAgICAgICAgICAgICAgUVVPVEVfTUVUQV9TVFJJTkdfTU9ERSxcbiAgICAgICAgICAgICAgICAgIEFQT1NfTUVUQV9TVFJJTkdfTU9ERVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIGhsanMuQ09NTUVOVChcbiAgICAgICAgLzwhLS0vLFxuICAgICAgICAvLS0+LyxcbiAgICAgICAgeyByZWxldmFuY2U6IDEwIH1cbiAgICAgICksXG4gICAgICB7XG4gICAgICAgIGJlZ2luOiAvPCFcXFtDREFUQVxcWy8sXG4gICAgICAgIGVuZDogL1xcXVxcXT4vLFxuICAgICAgICByZWxldmFuY2U6IDEwXG4gICAgICB9LFxuICAgICAgWE1MX0VOVElUSUVTLFxuICAgICAgLy8geG1sIHByb2Nlc3NpbmcgaW5zdHJ1Y3Rpb25zXG4gICAgICB7XG4gICAgICAgIGNsYXNzTmFtZTogJ21ldGEnLFxuICAgICAgICBlbmQ6IC9cXD8+LyxcbiAgICAgICAgdmFyaWFudHM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBiZWdpbjogLzxcXD94bWwvLFxuICAgICAgICAgICAgcmVsZXZhbmNlOiAxMCxcbiAgICAgICAgICAgIGNvbnRhaW5zOiBbXG4gICAgICAgICAgICAgIFFVT1RFX01FVEFfU1RSSU5HX01PREVcbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGJlZ2luOiAvPFxcP1thLXpdW2EtejAtOV0rLyxcbiAgICAgICAgICB9XG4gICAgICAgIF1cblxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgY2xhc3NOYW1lOiAndGFnJyxcbiAgICAgICAgLypcbiAgICAgICAgVGhlIGxvb2thaGVhZCBwYXR0ZXJuICg/PS4uLikgZW5zdXJlcyB0aGF0ICdiZWdpbicgb25seSBtYXRjaGVzXG4gICAgICAgICc8c3R5bGUnIGFzIGEgc2luZ2xlIHdvcmQsIGZvbGxvd2VkIGJ5IGEgd2hpdGVzcGFjZSBvciBhblxuICAgICAgICBlbmRpbmcgYnJhY2tldC5cbiAgICAgICAgKi9cbiAgICAgICAgYmVnaW46IC88c3R5bGUoPz1cXHN8PikvLFxuICAgICAgICBlbmQ6IC8+LyxcbiAgICAgICAga2V5d29yZHM6IHsgbmFtZTogJ3N0eWxlJyB9LFxuICAgICAgICBjb250YWluczogWyBUQUdfSU5URVJOQUxTIF0sXG4gICAgICAgIHN0YXJ0czoge1xuICAgICAgICAgIGVuZDogLzxcXC9zdHlsZT4vLFxuICAgICAgICAgIHJldHVybkVuZDogdHJ1ZSxcbiAgICAgICAgICBzdWJMYW5ndWFnZTogW1xuICAgICAgICAgICAgJ2NzcycsXG4gICAgICAgICAgICAneG1sJ1xuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgY2xhc3NOYW1lOiAndGFnJyxcbiAgICAgICAgLy8gU2VlIHRoZSBjb21tZW50IGluIHRoZSA8c3R5bGUgdGFnIGFib3V0IHRoZSBsb29rYWhlYWQgcGF0dGVyblxuICAgICAgICBiZWdpbjogLzxzY3JpcHQoPz1cXHN8PikvLFxuICAgICAgICBlbmQ6IC8+LyxcbiAgICAgICAga2V5d29yZHM6IHsgbmFtZTogJ3NjcmlwdCcgfSxcbiAgICAgICAgY29udGFpbnM6IFsgVEFHX0lOVEVSTkFMUyBdLFxuICAgICAgICBzdGFydHM6IHtcbiAgICAgICAgICBlbmQ6IC88XFwvc2NyaXB0Pi8sXG4gICAgICAgICAgcmV0dXJuRW5kOiB0cnVlLFxuICAgICAgICAgIHN1Ykxhbmd1YWdlOiBbXG4gICAgICAgICAgICAnamF2YXNjcmlwdCcsXG4gICAgICAgICAgICAnaGFuZGxlYmFycycsXG4gICAgICAgICAgICAneG1sJ1xuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIC8vIHdlIG5lZWQgdGhpcyBmb3Igbm93IGZvciBqU1hcbiAgICAgIHtcbiAgICAgICAgY2xhc3NOYW1lOiAndGFnJyxcbiAgICAgICAgYmVnaW46IC88Pnw8XFwvPi9cbiAgICAgIH0sXG4gICAgICAvLyBvcGVuIHRhZ1xuICAgICAge1xuICAgICAgICBjbGFzc05hbWU6ICd0YWcnLFxuICAgICAgICBiZWdpbjogcmVnZXguY29uY2F0KFxuICAgICAgICAgIC88LyxcbiAgICAgICAgICByZWdleC5sb29rYWhlYWQocmVnZXguY29uY2F0KFxuICAgICAgICAgICAgVEFHX05BTUVfUkUsXG4gICAgICAgICAgICAvLyA8dGFnLz5cbiAgICAgICAgICAgIC8vIDx0YWc+XG4gICAgICAgICAgICAvLyA8dGFnIC4uLlxuICAgICAgICAgICAgcmVnZXguZWl0aGVyKC9cXC8+LywgLz4vLCAvXFxzLylcbiAgICAgICAgICApKVxuICAgICAgICApLFxuICAgICAgICBlbmQ6IC9cXC8/Pi8sXG4gICAgICAgIGNvbnRhaW5zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgY2xhc3NOYW1lOiAnbmFtZScsXG4gICAgICAgICAgICBiZWdpbjogVEFHX05BTUVfUkUsXG4gICAgICAgICAgICByZWxldmFuY2U6IDAsXG4gICAgICAgICAgICBzdGFydHM6IFRBR19JTlRFUk5BTFNcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICAvLyBjbG9zZSB0YWdcbiAgICAgIHtcbiAgICAgICAgY2xhc3NOYW1lOiAndGFnJyxcbiAgICAgICAgYmVnaW46IHJlZ2V4LmNvbmNhdChcbiAgICAgICAgICAvPFxcLy8sXG4gICAgICAgICAgcmVnZXgubG9va2FoZWFkKHJlZ2V4LmNvbmNhdChcbiAgICAgICAgICAgIFRBR19OQU1FX1JFLCAvPi9cbiAgICAgICAgICApKVxuICAgICAgICApLFxuICAgICAgICBjb250YWluczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ25hbWUnLFxuICAgICAgICAgICAgYmVnaW46IFRBR19OQU1FX1JFLFxuICAgICAgICAgICAgcmVsZXZhbmNlOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBiZWdpbjogLz4vLFxuICAgICAgICAgICAgcmVsZXZhbmNlOiAwLFxuICAgICAgICAgICAgZW5kc1BhcmVudDogdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfVxuICAgIF1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4bWw7XG4iLCIvKlxuTGFuZ3VhZ2U6IFlBTUxcbkRlc2NyaXB0aW9uOiBZZXQgQW5vdGhlciBNYXJrZG93biBMYW5ndWFnZVxuQXV0aG9yOiBTdGVmYW4gV2llbmVydCA8c3R3aWVuZXJ0QGdtYWlsLmNvbT5cbkNvbnRyaWJ1dG9yczogQ2FybCBCYXh0ZXIgPGNhcmxAY2JheC50ZWNoPlxuUmVxdWlyZXM6IHJ1YnkuanNcbldlYnNpdGU6IGh0dHBzOi8veWFtbC5vcmdcbkNhdGVnb3J5OiBjb21tb24sIGNvbmZpZ1xuKi9cbmZ1bmN0aW9uIHlhbWwoaGxqcykge1xuICBjb25zdCBMSVRFUkFMUyA9ICd0cnVlIGZhbHNlIHllcyBubyBudWxsJztcblxuICAvLyBZQU1MIHNwZWMgYWxsb3dzIG5vbi1yZXNlcnZlZCBVUkkgY2hhcmFjdGVycyBpbiB0YWdzLlxuICBjb25zdCBVUklfQ0hBUkFDVEVSUyA9ICdbXFxcXHcjOy8/OkAmPSskLC5+KlxcJygpW1xcXFxdXSsnO1xuXG4gIC8vIERlZmluZSBrZXlzIGFzIHN0YXJ0aW5nIHdpdGggYSB3b3JkIGNoYXJhY3RlclxuICAvLyAuLi5jb250YWluaW5nIHdvcmQgY2hhcnMsIHNwYWNlcywgY29sb25zLCBmb3J3YXJkLXNsYXNoZXMsIGh5cGhlbnMgYW5kIHBlcmlvZHNcbiAgLy8gLi4uYW5kIGVuZGluZyB3aXRoIGEgY29sb24gZm9sbG93ZWQgaW1tZWRpYXRlbHkgYnkgYSBzcGFjZSwgdGFiIG9yIG5ld2xpbmUuXG4gIC8vIFRoZSBZQU1MIHNwZWMgYWxsb3dzIGZvciBtdWNoIG1vcmUgdGhhbiB0aGlzLCBidXQgdGhpcyBjb3ZlcnMgbW9zdCB1c2UtY2FzZXMuXG4gIGNvbnN0IEtFWSA9IHtcbiAgICBjbGFzc05hbWU6ICdhdHRyJyxcbiAgICB2YXJpYW50czogW1xuICAgICAgLy8gYWRkZWQgYnJhY2tldHMgc3VwcG9ydCBcbiAgICAgIHsgYmVnaW46IC9cXHdbXFx3IDooKVxcLi8tXSo6KD89WyBcXHRdfCQpLyB9LFxuICAgICAgeyAvLyBkb3VibGUgcXVvdGVkIGtleXMgLSB3aXRoIGJyYWNrZXRzXG4gICAgICAgIGJlZ2luOiAvXCJcXHdbXFx3IDooKVxcLi8tXSpcIjooPz1bIFxcdF18JCkvIH0sXG4gICAgICB7IC8vIHNpbmdsZSBxdW90ZWQga2V5cyAtIHdpdGggYnJhY2tldHNcbiAgICAgICAgYmVnaW46IC8nXFx3W1xcdyA6KClcXC4vLV0qJzooPz1bIFxcdF18JCkvIH0sXG4gICAgXVxuICB9O1xuXG4gIGNvbnN0IFRFTVBMQVRFX1ZBUklBQkxFUyA9IHtcbiAgICBjbGFzc05hbWU6ICd0ZW1wbGF0ZS12YXJpYWJsZScsXG4gICAgdmFyaWFudHM6IFtcbiAgICAgIHsgLy8gamluamEgdGVtcGxhdGVzIEFuc2libGVcbiAgICAgICAgYmVnaW46IC9cXHtcXHsvLFxuICAgICAgICBlbmQ6IC9cXH1cXH0vXG4gICAgICB9LFxuICAgICAgeyAvLyBSdWJ5IGkxOG5cbiAgICAgICAgYmVnaW46IC8lXFx7LyxcbiAgICAgICAgZW5kOiAvXFx9L1xuICAgICAgfVxuICAgIF1cbiAgfTtcbiAgY29uc3QgU1RSSU5HID0ge1xuICAgIGNsYXNzTmFtZTogJ3N0cmluZycsXG4gICAgcmVsZXZhbmNlOiAwLFxuICAgIHZhcmlhbnRzOiBbXG4gICAgICB7XG4gICAgICAgIGJlZ2luOiAvJy8sXG4gICAgICAgIGVuZDogLycvXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBiZWdpbjogL1wiLyxcbiAgICAgICAgZW5kOiAvXCIvXG4gICAgICB9LFxuICAgICAgeyBiZWdpbjogL1xcUysvIH1cbiAgICBdLFxuICAgIGNvbnRhaW5zOiBbXG4gICAgICBobGpzLkJBQ0tTTEFTSF9FU0NBUEUsXG4gICAgICBURU1QTEFURV9WQVJJQUJMRVNcbiAgICBdXG4gIH07XG5cbiAgLy8gU3RyaW5ncyBpbnNpZGUgb2YgdmFsdWUgY29udGFpbmVycyAob2JqZWN0cykgY2FuJ3QgY29udGFpbiBicmFjZXMsXG4gIC8vIGJyYWNrZXRzLCBvciBjb21tYXNcbiAgY29uc3QgQ09OVEFJTkVSX1NUUklORyA9IGhsanMuaW5oZXJpdChTVFJJTkcsIHsgdmFyaWFudHM6IFtcbiAgICB7XG4gICAgICBiZWdpbjogLycvLFxuICAgICAgZW5kOiAvJy9cbiAgICB9LFxuICAgIHtcbiAgICAgIGJlZ2luOiAvXCIvLFxuICAgICAgZW5kOiAvXCIvXG4gICAgfSxcbiAgICB7IGJlZ2luOiAvW15cXHMse31bXFxdXSsvIH1cbiAgXSB9KTtcblxuICBjb25zdCBEQVRFX1JFID0gJ1swLTldezR9KC1bMC05XVswLTldKXswLDJ9JztcbiAgY29uc3QgVElNRV9SRSA9ICcoW1R0IFxcXFx0XVswLTldWzAtOV0/KDpbMC05XVswLTldKXsyfSk/JztcbiAgY29uc3QgRlJBQ1RJT05fUkUgPSAnKFxcXFwuWzAtOV0qKT8nO1xuICBjb25zdCBaT05FX1JFID0gJyhbIFxcXFx0XSkqKFp8Wy0rXVswLTldWzAtOV0/KDpbMC05XVswLTldKT8pPyc7XG4gIGNvbnN0IFRJTUVTVEFNUCA9IHtcbiAgICBjbGFzc05hbWU6ICdudW1iZXInLFxuICAgIGJlZ2luOiAnXFxcXGInICsgREFURV9SRSArIFRJTUVfUkUgKyBGUkFDVElPTl9SRSArIFpPTkVfUkUgKyAnXFxcXGInXG4gIH07XG5cbiAgY29uc3QgVkFMVUVfQ09OVEFJTkVSID0ge1xuICAgIGVuZDogJywnLFxuICAgIGVuZHNXaXRoUGFyZW50OiB0cnVlLFxuICAgIGV4Y2x1ZGVFbmQ6IHRydWUsXG4gICAga2V5d29yZHM6IExJVEVSQUxTLFxuICAgIHJlbGV2YW5jZTogMFxuICB9O1xuICBjb25zdCBPQkpFQ1QgPSB7XG4gICAgYmVnaW46IC9cXHsvLFxuICAgIGVuZDogL1xcfS8sXG4gICAgY29udGFpbnM6IFsgVkFMVUVfQ09OVEFJTkVSIF0sXG4gICAgaWxsZWdhbDogJ1xcXFxuJyxcbiAgICByZWxldmFuY2U6IDBcbiAgfTtcbiAgY29uc3QgQVJSQVkgPSB7XG4gICAgYmVnaW46ICdcXFxcWycsXG4gICAgZW5kOiAnXFxcXF0nLFxuICAgIGNvbnRhaW5zOiBbIFZBTFVFX0NPTlRBSU5FUiBdLFxuICAgIGlsbGVnYWw6ICdcXFxcbicsXG4gICAgcmVsZXZhbmNlOiAwXG4gIH07XG5cbiAgY29uc3QgTU9ERVMgPSBbXG4gICAgS0VZLFxuICAgIHtcbiAgICAgIGNsYXNzTmFtZTogJ21ldGEnLFxuICAgICAgYmVnaW46ICdeLS0tXFxcXHMqJCcsXG4gICAgICByZWxldmFuY2U6IDEwXG4gICAgfSxcbiAgICB7IC8vIG11bHRpIGxpbmUgc3RyaW5nXG4gICAgICAvLyBCbG9ja3Mgc3RhcnQgd2l0aCBhIHwgb3IgPiBmb2xsb3dlZCBieSBhIG5ld2xpbmVcbiAgICAgIC8vXG4gICAgICAvLyBJbmRlbnRhdGlvbiBvZiBzdWJzZXF1ZW50IGxpbmVzIG11c3QgYmUgdGhlIHNhbWUgdG9cbiAgICAgIC8vIGJlIGNvbnNpZGVyZWQgcGFydCBvZiB0aGUgYmxvY2tcbiAgICAgIGNsYXNzTmFtZTogJ3N0cmluZycsXG4gICAgICBiZWdpbjogJ1tcXFxcfD5dKFsxLTldP1srLV0pP1sgXSpcXFxcbiggKylbXiBdW15cXFxcbl0qXFxcXG4oXFxcXDJbXlxcXFxuXStcXFxcbj8pKidcbiAgICB9LFxuICAgIHsgLy8gUnVieS9SYWlscyBlcmJcbiAgICAgIGJlZ2luOiAnPCVbJT0tXT8nLFxuICAgICAgZW5kOiAnWyUtXT8lPicsXG4gICAgICBzdWJMYW5ndWFnZTogJ3J1YnknLFxuICAgICAgZXhjbHVkZUJlZ2luOiB0cnVlLFxuICAgICAgZXhjbHVkZUVuZDogdHJ1ZSxcbiAgICAgIHJlbGV2YW5jZTogMFxuICAgIH0sXG4gICAgeyAvLyBuYW1lZCB0YWdzXG4gICAgICBjbGFzc05hbWU6ICd0eXBlJyxcbiAgICAgIGJlZ2luOiAnIVxcXFx3KyEnICsgVVJJX0NIQVJBQ1RFUlNcbiAgICB9LFxuICAgIC8vIGh0dHBzOi8veWFtbC5vcmcvc3BlYy8xLjIvc3BlYy5odG1sI2lkMjc4NDA2NFxuICAgIHsgLy8gdmVyYmF0aW0gdGFnc1xuICAgICAgY2xhc3NOYW1lOiAndHlwZScsXG4gICAgICBiZWdpbjogJyE8JyArIFVSSV9DSEFSQUNURVJTICsgXCI+XCJcbiAgICB9LFxuICAgIHsgLy8gcHJpbWFyeSB0YWdzXG4gICAgICBjbGFzc05hbWU6ICd0eXBlJyxcbiAgICAgIGJlZ2luOiAnIScgKyBVUklfQ0hBUkFDVEVSU1xuICAgIH0sXG4gICAgeyAvLyBzZWNvbmRhcnkgdGFnc1xuICAgICAgY2xhc3NOYW1lOiAndHlwZScsXG4gICAgICBiZWdpbjogJyEhJyArIFVSSV9DSEFSQUNURVJTXG4gICAgfSxcbiAgICB7IC8vIGZyYWdtZW50IGlkICZyZWZcbiAgICAgIGNsYXNzTmFtZTogJ21ldGEnLFxuICAgICAgYmVnaW46ICcmJyArIGhsanMuVU5ERVJTQ09SRV9JREVOVF9SRSArICckJ1xuICAgIH0sXG4gICAgeyAvLyBmcmFnbWVudCByZWZlcmVuY2UgKnJlZlxuICAgICAgY2xhc3NOYW1lOiAnbWV0YScsXG4gICAgICBiZWdpbjogJ1xcXFwqJyArIGhsanMuVU5ERVJTQ09SRV9JREVOVF9SRSArICckJ1xuICAgIH0sXG4gICAgeyAvLyBhcnJheSBsaXN0aW5nXG4gICAgICBjbGFzc05hbWU6ICdidWxsZXQnLFxuICAgICAgLy8gVE9ETzogcmVtb3ZlIHwkIGhhY2sgd2hlbiB3ZSBoYXZlIHByb3BlciBsb29rLWFoZWFkIHN1cHBvcnRcbiAgICAgIGJlZ2luOiAnLSg/PVsgXXwkKScsXG4gICAgICByZWxldmFuY2U6IDBcbiAgICB9LFxuICAgIGhsanMuSEFTSF9DT01NRU5UX01PREUsXG4gICAge1xuICAgICAgYmVnaW5LZXl3b3JkczogTElURVJBTFMsXG4gICAgICBrZXl3b3JkczogeyBsaXRlcmFsOiBMSVRFUkFMUyB9XG4gICAgfSxcbiAgICBUSU1FU1RBTVAsXG4gICAgLy8gbnVtYmVycyBhcmUgYW55IHZhbGlkIEMtc3R5bGUgbnVtYmVyIHRoYXRcbiAgICAvLyBzaXQgaXNvbGF0ZWQgZnJvbSBvdGhlciB3b3Jkc1xuICAgIHtcbiAgICAgIGNsYXNzTmFtZTogJ251bWJlcicsXG4gICAgICBiZWdpbjogaGxqcy5DX05VTUJFUl9SRSArICdcXFxcYicsXG4gICAgICByZWxldmFuY2U6IDBcbiAgICB9LFxuICAgIE9CSkVDVCxcbiAgICBBUlJBWSxcbiAgICBTVFJJTkdcbiAgXTtcblxuICBjb25zdCBWQUxVRV9NT0RFUyA9IFsgLi4uTU9ERVMgXTtcbiAgVkFMVUVfTU9ERVMucG9wKCk7XG4gIFZBTFVFX01PREVTLnB1c2goQ09OVEFJTkVSX1NUUklORyk7XG4gIFZBTFVFX0NPTlRBSU5FUi5jb250YWlucyA9IFZBTFVFX01PREVTO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ1lBTUwnLFxuICAgIGNhc2VfaW5zZW5zaXRpdmU6IHRydWUsXG4gICAgYWxpYXNlczogWyAneW1sJyBdLFxuICAgIGNvbnRhaW5zOiBNT0RFU1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHlhbWw7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwicmVxdWlyZSgnLi4vY3NzL2FwcC5zY3NzJyk7XG5cbmNvbnN0IGhsanMgPSByZXF1aXJlKCdoaWdobGlnaHQuanMvbGliL2NvcmUnKTtcbmhsanMucmVnaXN0ZXJMYW5ndWFnZSgneG1sJywgcmVxdWlyZSgnaGlnaGxpZ2h0LmpzL2xpYi9sYW5ndWFnZXMveG1sJykpO1xuaGxqcy5yZWdpc3Rlckxhbmd1YWdlKCdwaHAnLCByZXF1aXJlKCdoaWdobGlnaHQuanMvbGliL2xhbmd1YWdlcy9waHAnKSk7XG5obGpzLnJlZ2lzdGVyTGFuZ3VhZ2UoJ2h0dHAnLCByZXF1aXJlKCdoaWdobGlnaHQuanMvbGliL2xhbmd1YWdlcy9odHRwJykpO1xuaGxqcy5yZWdpc3Rlckxhbmd1YWdlKCdzaGVsbCcsIHJlcXVpcmUoJ2hpZ2hsaWdodC5qcy9saWIvbGFuZ3VhZ2VzL3NoZWxsJykpO1xuaGxqcy5yZWdpc3Rlckxhbmd1YWdlKCdiYXNoJywgcmVxdWlyZSgnaGlnaGxpZ2h0LmpzL2xpYi9sYW5ndWFnZXMvYmFzaCcpKTtcbmhsanMucmVnaXN0ZXJMYW5ndWFnZSgncnVzdCcsIHJlcXVpcmUoJ2hpZ2hsaWdodC5qcy9saWIvbGFuZ3VhZ2VzL3J1c3QnKSk7XG5obGpzLnJlZ2lzdGVyTGFuZ3VhZ2UoJ3NxbCcsIHJlcXVpcmUoJ2hpZ2hsaWdodC5qcy9saWIvbGFuZ3VhZ2VzL3NxbCcpKTtcbmhsanMucmVnaXN0ZXJMYW5ndWFnZSgneWFtbCcsIHJlcXVpcmUoJ2hpZ2hsaWdodC5qcy9saWIvbGFuZ3VhZ2VzL3lhbWwnKSk7XG5cbmhsanMuaGlnaGxpZ2h0QWxsKCk7Il0sIm5hbWVzIjpbInJlcXVpcmUiLCJobGpzIiwicmVnaXN0ZXJMYW5ndWFnZSIsImhpZ2hsaWdodEFsbCJdLCJzb3VyY2VSb290IjoiIn0=