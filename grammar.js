/**
 * @file tree-sitter grammar for Quake config files
 * @author Viktor Persson <viktor.persson@arcsin.se>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "quake_config",

  extras: $ => [
    /\s/,      // whitespace
    $.comment  // single-line comments
  ],

  conflicts: $ => [
     [$.assignment, $.command]
  ],

  rules: {
    source_file: $ => repeat($._statement),

      // Comments
      comment: $ => token(seq('//', /.*/)),

      _statement: $ => choice(
        $.setting,
        $.assignment,
        $.alias,
        $.command,
        $.bind,
    ),

    setting: $ => seq(
      $.setting_name,
      $.value
    ),
    setting_name: $ => /[a-zA-Z][a-zA-Z0-9_]*/,

    // Assignment statements: set, set_tp, or simple identifier=value
    assignment: $ => seq(
      optional(choice('set', 'set_tp')),
      $.identifier,
      $.value
    ),

    // Binds
    bind: $ => seq(
      'bind',
      $.bind_key,
      $.value
    ),
    bind_key: $ => /[a-zA-Z][a-zA-Z0-9_]*/,

    // Alias statements
    alias: $ => seq(
      'alias',
      $.identifier,
      $.value
    ),

    // Standalone commands
    command: $ => $.identifier,

    // Identifiers: letters, numbers, underscores, starting with letter or _
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,


    // Values can be:
    // - unquoted words (right, left, 12)
    // - quoted strings ("right")
    // - variables ($var)
    // - quoted variables ("$var")
    value: $ => choice(
      $.quoted_variable,
      $.variable,
      $.string,
      $.number,
      $.identifier
    ),

    string: $ => /"[^"]*"/,
    number: $ => /-?\d+(\.\d+)?/,
    variable: $ => /\$[a-zA-Z_][a-zA-Z0-9_]*/,
    macro: $ => /\%[a-zA-Z][a-zA-Z0-9_]*/,
    quoted_variable: $ => /"\$[a-zA-Z_][a-zA-Z0-9_]+"/
  }
});
