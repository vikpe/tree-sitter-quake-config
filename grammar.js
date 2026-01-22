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
      $.alias_declaration,
    ),

    // alias
    alias_declaration: $ => seq(
      field("function", $.alias_function),
      field("name", $.alias_name),
      field("body", $.alias_body),
    ),
    alias_function: $ => choice("alias", "temp_alias"),
    alias_name: $ => choice(
      seq($.double_quote, /[^"]+/, $.double_quote),
      /[^" \n]+/,
    ),
    alias_body: $ => choice(
      $.single_quoted_string,
      $.double_quoted_string,
    ),

    // set
    // variable_declaration: $ => seq(
    //   field("function", $.variable_function),
    //   choice(
    //     field("name", $.variable_name),
    //     seq($.single_quote, field("name", $.variable_name), $.single_quote),
    //     seq($.double_quote, field("name", $.variable_name), $.double_quote),
    //   ),
    //   field("expression", $.expression)
    // ),
    // variable_function: $ => choice("set", "set_tp"), // todo: set_calc
    // variable_name: $ => /[^\s"']+/,

    // // bind
    // bind_declaration: $ => seq(
    //   field("function", $.bind_function),
    //   field("key", $.bind_key),
    //   field("expression", $.expression),
    // ),
    // bind_function: $ => "bind",
    // bind_key: $ => choice(
    //   seq($.double_quote, /[^"]+/, $.double_quote),
    //   /[^" \n]+/,
    // ),

    // command
    // command: $ => choice(
    //   $.terminator,
    //   repeat1($.instruction),
    //   seq(
    //     $.double_quote,
    //     repeat(choice($.terminator, $.instruction)),
    //     $.double_quote
    //   ),
    // ),
    terminator: $ => ";",

    // primitives
    number: $ => /-?\d+(\.\d+)?/,
    double_quote: $ => "\"",
    single_quote: $ => "'",

    // variable references
    variable_ref: $ => choice(
      $.function_param_ref,
      $.user_variable_ref,
      $.qizmo_macro_ref,
      $.ezquake_macro_ref,
    ),
    function_param_ref: $ => seq('%', /[0-9]/),
    user_variable_ref: $ => seq("$", /[a-z0-9_]+/i),
    qizmo_macro_ref: $ => seq('%', choice('a','b','c','A','B','C')),
    ezquake_macro_ref: $ => seq("$", choice("ammo", "armor", "armortype", "bestammo", "bestweapon", "health")),

    label_like: $ => /[a-z0-9_().><]+/i,

    single_quoted_string: $ => seq(
      $.single_quote,
      repeat(choice(
        $.variable_ref,
        $.number,
        $.label_like,
      )),
      $.single_quote
    ),

    double_quoted_string: $ => seq(
      $.double_quote,
      repeat(choice(
        $.if_statement,
        $.single_quoted_string,
        $.variable_ref,
        $.number,
        $.terminator,
      )),
      $.double_quote,
    ),

    else_clause: $ => seq("else", $.if_statement),

    if_statement: $ => seq(
      /if/i,
      "(",
      $.binary_expression,
      ")",
      optional("then"),
      $.label_like,
      optional($.else_clause),
    ),

    binary_expression: $ => seq(
      $.value_expression,
      $.operator,
      $.value_expression,
    ),

    value_expression: $ => choice(
      $.single_quoted_string,
      $.number,
      $.variable_ref
    ),

    operator: $ => choice("+", "-", "/", "*", ">", "<", "|", "=", "==", "!=", "!", /or|and|isin/i),
  }
});
