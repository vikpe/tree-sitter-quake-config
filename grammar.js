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

  conflicts: $ => [],

  rules: {
    source_file: $ => repeat(seq(
      $._statement,
      optional($.newline)
    )),
    comment: $ => token(seq('//', /.*/)),
    newline: $ => /\r?\n/,

    // document
    _statement: $ => seq(
      choice(
        $.bind,
        $.command,
      ),
      choice($.newline, $.terminator)
    ),

    command: $ => seq(
      field("name", $.unquoted_string),
      field("args", repeat($.command_argument)),
    ),

    bind: $ => seq(
      $.function,
      $.bind_expr,
      $.command_argument
    ),
    bind_expr: $ => choice(
      seq($.single_quote, $.bind_key, $.single_quote),
      seq($.double_quote, $.bind_key, $.double_quote),
      $.bind_key
    ),
    bind_key: $ => /[a-z0-9][a-z0-9_]*/i,

    // primitives
    terminator: $ => ";",
    double_quote: $ => "\"",
    single_quote: $ => "'",
    quote: $ => choice($.single_quote, $.double_quote),
    string: $ => /"[^"]*"/,
    unquoted_string: $ => /[^\s^;"]+/,

    conditional: $ => choice("if", "then", "else", "isin"),
    command_prefix: $ => choice("+", "-", "/"),
    operator: $ => choice("+", "-", "/", "*", ">", "<", "|", "="),
    bracket: $ => choice("(", ")", "[", "]", "{", "}"),

    number: $ => /-?\d+(\.\d+)?/,
    variable_name: $ => /[a-z0-9.:_-]+/i,

    command_argument: $ => choice(
      $.function,
      $.value,
      $.expression,
    ),

    expression: $ => seq(
      $.double_quote,
      field("content", repeat(choice(
        $.expression_content,
        $.single_quoted_string,
      ))),
      $.double_quote,
    ),

    expression_content: $ => choice(
      $.conditional,
      $.terminator,
      $.operator,
      $.value,
      $.bracket,
      $.function
    ),

    single_quoted_string: $ => seq(
      $.single_quote,
      field("content", repeat($.expression_content)),
      $.single_quote,
    ),


    ref: $ => choice($.variable_ref, $.macro_ref),
    variable_ref: $ => seq("$", $.variable_name),
    macro_ref: $ => seq("%", /[a-z0-9]+/i),

    value: $ => choice(
      $.ref,
      $.number,
      $.variable_name
    ),

    function: $ => choice(
      "bind",
      "quit",
      "wait"
    )
  }
});
