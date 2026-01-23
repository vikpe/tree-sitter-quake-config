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
    [$._statement, $.alias_declaration_simple],
    [$._statement, $.bind_declaration_simple],
  ],

  rules: {
    source_file: $ => repeat($._statement),
    comment: $ => token(seq('//', /.*/)),

    // document
    _statement: $ => choice(
      $.terminator,
      $._statement_complex,
      $._statement_simple,
    ),

    _statement_complex: $ => choice(
      $.alias_declaration_complex,
      $.bind_declaration_complex,
      $.function_call_complex,
      $.if_statement,
    ),

    _statement_simple: $ => choice(
      $.alias_declaration_simple,
      $.bind_declaration_simple,
      $.function_call_simple,
    ),

    _newline: $ => /\r?\n/,
    _whitespace: $ => /[ \t]+/,
    _double_quote: $ => token("\""),
    _single_quote: $ => token("'"),

    // alias
    alias_function: $ => choice("alias", "temp_alias"),
    alias_name: $ => /[^"\s]+/,

    alias_declaration_simple: $ => seq(
      field("function", $.alias_function),
      $._whitespace,
      field("name", $.alias_name),
      $._whitespace,
      field("body", $._statement_simple),
    ),

    alias_declaration_complex: $ => seq(
      field("function", $.alias_function),
      $._whitespace,
      choice(
        seq($._double_quote, field("name", $.alias_name), $._double_quote),
        field("name", $.alias_name),
      ),
      $._whitespace,
      field("body", choice($._statement, $.expression)),
    ),

    // bind
    bind_function: $ => token("bind"),
    bind_key: $ => choice($.keyname, $.keyname_fallback),

    keyname: $ => token(choice(
      /mouse[1-8]/i,
      /[\da-z]/i,
      /f[1-9]/i,
      /f1[0-5]/i,
      /space/i,
    )),
    keyname_fallback: $ => /[^\s"]+/,

    bind_declaration_complex: $ => seq(
      field("function", $.bind_function),
      $._bind_key_expr,
      field("expression", choice($._statement, $.expression)),
    ),

    bind_declaration_simple: $ => seq(
      field("function", $.bind_function),
      $._bind_key_expr,
      field("expression", $._statement_simple),
    ),

    _bind_key_expr: $ => seq(
      $._whitespace,
      choice(
        field("key", $.bind_key),
        seq($._double_quote, field("key", $.bind_key), $._double_quote),
      ),
      $._whitespace,
    ),

    // primitives
    terminator: $ => token(";"),
    alpha_num: $ => token(/[a-z0-9_.]/i),
    number: $ => token(/-?\d+(\.\d+)?/),

    // variable references
    variable_ref: $ => choice(
      $.function_param_ref,
      $.user_variable_ref,
      $.qizmo_macro_ref,
      $.ezquake_macro_ref,
    ),
    function_param_ref: $ => token(/%[0-9]/),
    user_variable_ref: $ => token(/\$[a-z0-9_]+/i),
    qizmo_macro_ref: $ => token(/%[abc]/i),
    ezquake_macro_ref: $ => seq("$", choice("ammo", "armor", "armortype", "bestammo", "bestweapon", "health")),

    single_quoted_string: $ => seq(
      $._single_quote,
      repeat(choice(
        $.variable_ref,
        $.number,
        $.alpha_num,
      )),
      $._single_quote,
    ),

    expression: $ => seq(
      $._double_quote,
      repeat(choice(
          $._statement_simple,
          //$.if_fallback,
      )),
      $._double_quote,
    ),

    if_statement: $ => prec.right(seq(
      $.if_keyword,
      seq("(", $.binary_expression, ")"),
      $.then_keyword,
      repeat(choice(
        $.bind_declaration_simple,
        $.function_call_simple,
        // $.variable_ref,
        // $.if_fallback,
      )),
      optional($.else_keyword),
    )),

    if_fallback: $ => /[^; ]+/,

    if_keyword: $ => "if",
    then_keyword: $ => "then",
    else_keyword: $ => "else",

    binary_expression: $ => seq(
      $.value_expression,
      $.operator,
      $.value_expression,
    ),

    value_expression: $ => choice(
      $.single_quoted_string,
      $.number,
      $.variable_ref,
    ),

    operator: $ => token(choice("+", "-", "/", "*", ">", "<", "|", "==", "=", "!=", "!", "=~", "!~", / or | and | !isin | isin /i)),

    function_call_simple: $ => seq(
      field("name", $.function_name),
      optional(field("args", repeat($.arg_simple))),
    ),
    arg_simple: $ => choice(
      $.user_variable_ref,
    ),

    function_call_complex: $ => prec.left(seq(
      field("name", $.function_name),
      $._whitespace,
      field("args", repeat($.arg_complex)),
    )),
    arg_complex: $ => choice(
      $.user_variable_ref,
      $.function_call_complex,
    ),

    function_name: $ => token(choice(
      "echo",
      "connect",
      "disconnect",
      "volume",
      "place",
      "reconnect",
      "say",
      "unbindall",
      "wait",
      "quit",
    )),
  }
});
