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

    // primitives
    number: $ => /-?\d+(\.\d+)?/,
    double_quote: $ => "\"",
    single_quote: $ => "'",
    empty_string: $ => choice("\"\s*\"", "'\s*'"),

    // document
    _statement: $ => choice(
      $.alias,
      $.bind,
      $.set,
      $.fallback
    ),

    fallback: $ => /[^\s]+/,

    // alias
    alias: $ => seq(
      $.alias_function,
      choice(
        field("name", $.alias_name),
        seq($.single_quote, field("name", $.alias_name), $.single_quote),
        seq($.double_quote, field("name", $.alias_name), $.double_quote),
      ),
      field("definition", $.expression)
    ),
    alias_function: $ => choice("alias", "tempalias"),
    alias_name: $ => /[^\s"']+/,

    // bind
    bind: $ => seq(
      $.bind_function,
      choice(
        field("key", $.bind_key),
        seq($.single_quote, field("key", $.bind_key), $.single_quote),
        seq($.double_quote, field("key", $.bind_key), $.double_quote),
      ),
      field("definition", $.expression)
    ),
    bind_function: $ => "bind",
    bind_key: $ => /[a-z0-9]+/,

    // set
    set: $ => seq(
      $.set_function,
      choice(
        field("name", $.set_name),
        seq($.single_quote, field("name", $.set_name), $.single_quote),
        seq($.double_quote, field("name", $.set_name), $.double_quote),
      ),
      field("definition", $.value_expression)
    ),
    set_function: $ => choice("set", "set_tp"), // todo: set_calc
    set_name: $ => /[^\s"']+/,

    // value
    value_expression: $ => choice(
      $.empty_string,
      $.number,
      $.variable_ref,
      $.macro_ref,
      seq($.single_quote, $.value_string, $.single_quote),
      seq($.double_quote, $.value_string, $.double_quote),
    ),
    value_string: $ => repeat1(choice(
      $.number,
      $.variable_ref,
      $.macro_ref,
      $.color_def,
      $.punctuation,
    )),

    // expression
    expression: $ => choice(
      $.empty_string,
      seq($.single_quote, repeat1($.expression_content), $.single_quote),
      seq($.double_quote, repeat1($.expression_content), $.double_quote),
    ),

    expression_content: $ => choice(
      $.conditional_expression,
      $.simple_expression,
    ),

    simple_expression: $ => choice(
      $.number,
      $.variable_ref,
      $.macro_ref,
      $.punctuation,
    ),

    // ------------------------------------------------------------
    // Conditional expressions
    conditional_expression: $ => prec.right(seq(
      $.if_key,
      $.condition,
      optional($.then_key),
      $.simple_expression,
      optional($.else_key),
    )),

    if_key: $ => token(/if/i),
    then_key: $ => token(/then/i),
    else_key: $ => token(/else/i),

    condition: $ => choice(
      $.parenthesized_condition,
      $.binary_expression,
      $.value_expression
    ),

    binary_expression: $ => prec.left(seq(
      $.value_expression,
      $.operator,
      $.value_expression,
      optional($.operator),
    )),

    parenthesized_condition: $ => seq("(", $.condition, ")"),

    // -------------------

    newline: $ => /\r?\n/,
    conditional: $ => /if|if_exists|then|else/i,

    operator: $ => choice("+", "-", "/", "*", ">", "<", "|", "=", "==", "!=", "!", /or|and|isin/i),
    punctuation: $ => choice("(", ")", "[", "]", "{", "}"),
    color_def: $ => seq("&c", /[0-9a-f]{3}/i),
    variable_ref: $ => seq("$", /[a-z0-9.:_-]+/i),
    macro_ref: $ => seq("%", /[a-z0-9]+/i),
    stringlike: $ =>  /[^\s]+/,

    // string: $ => /"[^"]*"/,

    function: $ => choice(
      // $.alias_function,
      // $.bind_function,
      // $.set_function,
      // "echo",
      // "quit",
      // "wait",
      // "say",
      "+fire",
      "weapon",
    )
  }
});
