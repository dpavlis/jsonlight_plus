(() => {
  function ctl(hljs) {
    const IDENT = /[A-Za-z_][0-9A-Za-z_]*/;

    const TYPE_LIST =
      "(integer|long|decimal|boolean|void|double|string|date|variant|list|map|byte)";
    const TYPE_RE = new RegExp(`\\b${TYPE_LIST}\\b`);

    const CONTROL_WORDS =
      "(?:if|else|foreach|for|while|break|continue|return|switch|case|default|do|function)";
    const LITERAL_WORDS = "(?:true|false|null|OK|SKIP|ALL)";

    const NUMBER = {
      className: "number",
      variants: [
        { begin: /\b\d+L\b/i },
        { begin: /\b\d+\.\d+D\b/i },
        hljs.C_NUMBER_MODE
      ]
    };

    const STRING = {
      className: "string",
      variants: [
        hljs.QUOTE_STRING_MODE,
        hljs.APOS_STRING_MODE,
        { begin: '"""', end: '"""', contains: [hljs.BACKSLASH_ESCAPE] }
      ]
    };

    const LITERALS = {
      className: "literal",
      begin: new RegExp(`\\b${LITERAL_WORDS}\\b`)
    };

    const CONTROL_KEYWORDS = {
      className: "keyword.control",
      begin: new RegExp(`\\b${CONTROL_WORDS}\\b`)
    };

    const TYPE_KEYWORDS = { className: "type", begin: TYPE_RE };

    const PROPERTY_PATH_NUMBER = {
      begin: /\.(\d+)\./,
      returnBegin: true,
      relevance: 0,
      contains: [
        { className: "punctuation", begin: /\./, relevance: 0 },
        { className: "number", begin: /\d+/, relevance: 0 },
        { className: "punctuation", begin: /\./, relevance: 0 }
      ]
    };

    // $in.<port>.<name> / $out.<port>.<name>  with colored prefix ($in.0.) vs field (name)
    const PORT_FIELD_ACCESS = {
      variants: [
        {
          // $in.0.paidAmount / $out.1.someName
          begin: /\$(in|out)\.\d+\.[A-Za-z_][0-9A-Za-z_]*/,
          returnBegin: true,
          relevance: 5,
          contains: [
            {
              match: /\$(in|out)\.\d+\./,
              scope: "variable.special",
              relevance: 0
            },
            {
              match: IDENT,
              scope: "variable",
              relevance: 0
            }
          ]
        },
        {
          // $in.0.12 / $out.3.7
          begin: /\$(in|out)\.\d+\.\d+\b/,
          returnBegin: true,
          relevance: 3,
          contains: [
            {
              match: /\$(in|out)\.\d+\./,
              scope: "variable.special",
              relevance: 0
            },
            {
              match: /\d+\b/,
              scope: "number",
              relevance: 0
            }
          ]
        }
      ]
    };

    // Also allow highlighting prefix alone if it appears by itself
    const PORT_PREFIX = {
      match: /\$(in|out)\.\d+\./,
      scope: "variable.special",
      relevance: 0
    };

    const SPECIAL_VARIABLE = {
      match: /\$(out|in)\b/,
      scope: "variable.special",
      relevance: 0
    };

    const FUNCTION_SIGNATURE = {
      begin: new RegExp(`\\bfunction\\b\\s+${TYPE_LIST}\\s+${IDENT.source}`),
      returnBegin: true,
      contains: [
        { className: "keyword", begin: /\bfunction\b/ },
        { className: "type", begin: TYPE_RE },
        { className: "title.function", begin: IDENT }
      ]
    };

    const TYPED_VAR_DECL = {
      begin: new RegExp(`${TYPE_LIST}\\b\\s+${IDENT.source}`),
      returnBegin: true,
      contains: [
        { className: "type", begin: TYPE_RE },
        { className: "variable", begin: IDENT }
      ]
    };

    // Function calls: upperCase(...), trim(...), str2decimal(...)
    const FUNCTION_CALL = {
      match: new RegExp(
        String.raw`\b(?!${CONTROL_WORDS}\b)(?!${TYPE_LIST}\b)(?!${LITERAL_WORDS}\b)${IDENT.source}(?=\s*\()`
      ),
      scope: "title.function",
      relevance: 0
    };

    return {
      name: "CTL",
      aliases: ["ctl"],
      contains: [
        hljs.C_LINE_COMMENT_MODE,
        hljs.C_BLOCK_COMMENT_MODE,

        FUNCTION_SIGNATURE,
        TYPED_VAR_DECL,

        STRING,
        NUMBER,
        LITERALS,

        // $in/$out prefix handling (must be before generic identifiers)
        PORT_FIELD_ACCESS,
        PORT_PREFIX,
        SPECIAL_VARIABLE,

        PROPERTY_PATH_NUMBER,

        CONTROL_KEYWORDS,
        TYPE_KEYWORDS,

        FUNCTION_CALL,

        { className: "symbol", begin: /->/ },
        { className: "punctuation", begin: /[\[\]{}(),.]/ },

        { className: "variable", begin: IDENT } // fallback last
      ]
    };
  }

  if (typeof hljs !== "undefined" && hljs.registerLanguage) {
    hljs.registerLanguage("ctl", ctl);
  }
})();