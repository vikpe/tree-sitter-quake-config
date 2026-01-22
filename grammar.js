/**
 * @file tree-sitter grammar for Quake configs
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
    // [$.value_expression, $.simple_expression],
  ],

  rules: {
    source_file: $ => repeat($._statement),
    comment: $ => token(seq('//', /.*/)),

    // document
    _statement: $ => choice(
      $.terminator,
      $.declaration,
      $.expression,
    ),

    command: $ => choice(
      $.declaration,
      $.terminator,
    ),

    expression: $ => /[xyz]+/i,

    declaration: $ => choice(
      $.alias_declaration,
    ),

    // alias
    alias_declaration: $ => seq(
      field("function", $.alias_function),
      field("name", $.alias_name),
      field("command", $.command),
    ),
    alias_function: $ => choice("alias", "temp_alias"),
    alias_name: $ => choice(
      seq($.double_quote, /[^"]+/, $.double_quote),
      /[^" \n]+/,
    ),

    nested_alias_declaration: $ => seq(

    ),

    nested_alias: $ => alias($.alias_declaration, "nested_alias"),

    // command
    command: $ => choice(
      $.terminator,
      repeat1($.instruction),
      seq(
        $.double_quote,
        repeat(choice($.terminator, $.instruction)),
        $.double_quote
      ),
    ),
    terminator: $ => ";",
    instruction: $ => choice(
      /[a-z0-9!_'{}]+/i,
    ),

    // primitives
    number: $ => /-?\d+(\.\d+)?/,
    double_quote: $ => "\"",
    single_quote: $ => "'",
    single_quoted_string: $ => seq($.single_quote, repeat(/[^']+/), $.single_quote),
    double_quoted_string: $ => seq(
      $.double_quote,
      repeat(choice(/[^"'\n]+/, $.single_quoted_string)),
      $.double_quote
    ),
  }
});
