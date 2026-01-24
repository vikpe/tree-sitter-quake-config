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
    // [$._statement, $.expr_alias_declaration],
    // [$._statement, $.expr_bind_declaration],
  ],

  rules: {
    source_file: $ => repeat(seq(
      $._statement,
      $._statement_terminator
    )),

    // primitives
    comment: $ => token(seq('//', /.*/)),
    number: $ => token(/-?\d+(\.\d+)?/),
    _terminator: $ => token(";"),
    _newline: $ => token(/\r?\n/),
    _whitespace: $ => token(/[ \t]+/),
    _single_quote: $ => token("'"),
    _double_quote: $ => token("\""),
    _statement_terminator: $ => choice($._terminator, $._newline),

    // top level statements
    _statement: $ => choice(
      $.alias_declaration,
      $.bind_declaration,
      $.function_call,
      $.if_statement,
      $.plus_command,
      $.unknown_statement
    ),
    unknown_statement: $ => seq(repeat1(/[^;\r\n]/)),

    // alias
    alias_function: $ => choice("alias", "temp_alias"),
    alias_name: $ => token(/[^"\s]+/),

    alias_declaration: $ => seq(
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

    bind_declaration: $ => seq(
      field("function", $.bind_function),
      choice(
        field("key", $.bind_key),
        seq($._double_quote, field("key", $.bind_key), $._double_quote),
      ),
      field("expression", choice($._statement, $.expression)),
    ),

    // function call
    function_call: $ => seq(
      field("name", $.function_name),
      field("args", repeat($.function_arg)),
    ),
    function_arg: $ => choice(
      $._value_expression,
      $.double_quoted_string,
    ),

    // if statement
    if_statement: $ => prec.right(seq(
      $.if_keyword,
      seq("(", $.binary_expression, ")"),
      $.then_keyword,
      $._statement,
      optional(seq($.else_keyword, $._statement)),
    )),

    if_keyword: $ => token("if"),
    then_keyword: $ => token("then"),
    else_keyword: $ => token("else"),

    binary_expression: $ => seq(
      $._value_expression,
      $.operator,
      $._value_expression,
    ),

    operator: $ => token(choice("+", "-", "/", "*", ">", "<", "|", "==", "=", "!=", "!", "=~", "!~", / or | and | !isin | isin /i)),

    // expression
    expression: $ => seq(
       $._double_quote,
      repeat(seq(
          $.expression_statement,
          $._statement_terminator
      )),
      $._double_quote,
    ),
    expression_statement: $ => choice(
      $.expr_alias_declaration,
      $.expr_bind_declaration,
      $.expr_function_call,
      // $.if_statement,
      // $.plus_command,
      $.unknown_expression_statement,
    ),
    unknown_expression_statement: $ => seq(repeat1(/[^;"\r\n]/)),

    expr_alias_declaration: $ => seq(
      field("function", $.alias_function),
       $._whitespace,
      field("name", $.alias_name),
       $._whitespace,
      field("body", $.expression_statement),
    ),

    expr_bind_declaration: $ => seq(
      field("function", $.bind_function),
      field("key", $.bind_key),
      field("expression", $.expression_statement),
    ),

    expr_function_call: $ => seq(
      field("name", $.function_name),
      field("args", repeat($.expr_function_arg)),
    ),
    expr_function_arg: $ => choice(
      $._value_expression,
      token(/[^']/),
    ),



    // variable references
    _value_expression: $ => choice(
      $.single_quoted_string,
      $.number,
      $.variable_ref,
    ),

    single_quoted_string: $ => seq(
      $._single_quote,
      repeat(choice(
        $.variable_ref,
        $.number,
        token(/[^']/),
      )),
      $._single_quote,
    ),

    double_quoted_string: $ => seq(
      $._double_quote,
      repeat(choice(
        $.single_quoted_string,
        $.variable_ref,
        $.number,
        token(/[^"]/),
      )),
      $._double_quote,
    ),

    variable_ref: $ => choice(
      $.ezquake_variable_ref,
      $.qizmo_macro_ref,
      $.function_param_ref,
      $.user_variable_ref,
    ),
    function_param_ref: $ => token(/%[0-9]/),
    qizmo_macro_ref: $ => token(/%[abc]/i),
    user_variable_ref: $ => seq("$", /[a-z0-9_]*/i),
    ezquake_variable_ref: $ => token(choice("$ammo", "$armor", "$armortype", "$bestammo", "$bestweapon", "$health")),

    // keywords
    keyname: $ => token(choice(
      /mouse[1-8]/i,
      /[\da-z]/i,
      /f[1-9]/i,
      /f1[0-5]/i,
      /space/i,
    )),
    keyname_fallback: $ => token(/[^\s"]+/),

    plus_command: $ => token(seq(
      choice("+", "-"),
      choice(
        "attack",
        "forward",
        "back",
        "fire",
        "moveleft",
        "moveright",
        "showscores",
      ),
    )),

    function_name: $ => token(choice(
      "echo",
      "connect",
      "disconnect",
      "volume",
      "place",
      "impulse",
      "reconnect",
      "say",
      "unbind",
      "unbindall",
      "wait",
      "quit",
    )),
  }
});
