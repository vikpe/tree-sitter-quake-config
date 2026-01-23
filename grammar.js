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
    // [$._statement, $.alias_declaration_sub],
    // [$._statement, $.bind_declaration_sub],
  ],

  rules: {
    source_file: $ => repeat($._statement),
    comment: $ => token(seq('//', /.*/)),

    // document
    _statement: $ => choice(
      $.terminator,
      $.alias_declaration,
      $.bind_declaration,
      $.function_call,
      $.if_statement,
    ),

    _statement_sub: $ => choice(
      $.terminator,
      $.alias_declaration_sub,
      $.bind_declaration_sub,
      $.function_call_sub,
      $.if_statement,
    ),

    // primitives
    _newline: $ => /\r?\n/,
    _whitespace: $ => /[ \t]+/,
    _double_quote: $ => token("\""),
    _single_quote: $ => token("'"),

    // alias
    alias_function: $ => choice("alias", "temp_alias"),
    alias_name: $ => /[^"\s]+/,

    alias_declaration: $ => seq(
      field("function", $.alias_function),
      choice(
        seq($._double_quote, field("name", $.alias_name), $._double_quote),
        field("name", $.alias_name),
      ),
      field("body", choice($._statement, $.expression)),
    ),

    alias_declaration_sub: $ => seq(
      field("function", $.alias_function),
      field("name", $.alias_name),
      field("body", $._statement_sub),
    ),

    // bind
    bind_function: $ => token("bind"),
    bind_key: $ => choice($.keyname, $.keyname_fallback),

    bind_declaration: $ => seq(
      field("function", $.bind_function),
      choice(
        field("key", $.bind_key),
        seq($._double_quote, field("key", $.bind_key), $._double_quote),
      ),
      field("expression", choice($._statement, $.expression)),
    ),

    bind_declaration_sub: $ => seq(
      field("function", $.bind_function),
      field("key", $.bind_key),
      field("expression", $._statement_sub),
    ),

    // expression
    expression: $ => seq(
      $._double_quote,
      repeat(choice(
        $._statement_sub,
          //$.if_fallback,
      )),
      $._double_quote,
    ),

    // function call
    function_call: $ => prec.left(seq(
      field("name", $.function_name),
      field("args", repeat($.function_arg)),
    )),
    function_arg: $ => choice(
      $.user_variable_ref,
      $.function_call,
    ),

    function_call_sub: $ => seq(
      field("name", $.function_name),
      field("args", repeat($.function_arg_sub)),
    ),
    function_arg_sub: $ => choice(
      $.user_variable_ref,
      /[a-z]+/i
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

    // if statement
    if_statement: $ => prec.right(seq(
      $.if_keyword,
      seq("(", $.binary_expression, ")"),
      $.then_keyword,
      repeat(choice(
        $._statement_sub,
        // $.variable_ref,
        // $.if_fallback,
      )),
      optional($.else_keyword),
    )),

    if_fallback: $ => token(/[^; ]+/),

    if_keyword: $ => token("if"),
    then_keyword: $ => token("then"),
    else_keyword: $ => token("else"),

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




    // keywords
    keyname: $ => token(choice(
      /mouse[1-8]/i,
      /[\da-z]/i,
      /f[1-9]/i,
      /f1[0-5]/i,
      /space/i,
    )),
    keyname_fallback: $ => /[^\s"]+/,

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
