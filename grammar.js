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
    /[\t ]/,   // horizontal whitespace
    $.comment  // single-line comments
  ],

  conflicts: $ => [
    // [$.bind, $.function_name],
    // [$.alias, $.function_name],
    // [$.variable_declaration, $.function_name],
  ],

  rules: {
    config: $ => repeat(
      choice(
        seq($._statement, choice($._terminator, $._newline)),
        $._terminator,
        $._newline,
      )
    ),
    _fallback: $ => token(/[^\s;]/),

    // primitives
    comment: $ => token(seq('//', /.*/)),
    number: $ => token(/-?\d+(\.\d+)?/),
    _terminator: $ => token(";"),
    _whitespace: $ => token(/\s+/),
    non_whitespace: $ => token(/[^\s]/),
    _horizontal_whitespace: $ => token(/[\t ]+/),
    _newline: $ => token(/\r?\n/),
    _single_quote: $ => token("'"),
    _double_quote: $ => token("\""),

    // statements
    _statement: $ => prec.left(choice(
      $.alias,
      $.bind,
      $.variable_declaration,
      $.function_call,
      $.if_statement,
      $.plus_command,
      repeat1($._fallback),
    )),

    // alias
    alias: $ => seq(
      field("function", $.alias_function),
      $._horizontal_whitespace,
      choice(
        field("name", $.alias_name),
        seq(
          $._double_quote,
          field("name", $.alias_name_within_quotes),
          repeat($._double_quote),
        ),
      ),
      optional(seq(
        $._horizontal_whitespace,
        field("value", choice(
          $._statement,
          $.expression,
        )),
      )),
    ),
    alias_name: $ => token(seq(/[^\s;"]/, repeat(/[^\s;]/))),
    alias_name_within_quotes: $ => token(repeat1(/[^\s;"]/)),

    // bind
    bind_key: $ => choice($.keyname, $.keyname_fallback),

    bind: $ => prec.left(seq(
      field("function", $.bind_function),
      $._horizontal_whitespace,
      choice(
        field("key", $.bind_key),
        seq($._double_quote, field("key", $.bind_key), $._double_quote),
      ),
      $._horizontal_whitespace,
      field("value", choice(
        $._statement,
        $.expression,
      )),
    )),

    // set
    variable_declaration: $ => seq(
      field("function", $.variable_function),
      $._horizontal_whitespace,
      choice(
        field("name", $.variable_name),
        seq($._double_quote, field("key", $.variable_name), $._double_quote),
      ),
      $._horizontal_whitespace,
      field("value", choice(
        $.double_quoted_string,
        $.single_quoted_string,
        $.label_like,
        $.number,
      )),
    ),

    variable_name: $ => choice(
      repeat1(token(/[a-z_.:-]/i)),
    ),

    // function call
    function_call: $ => seq(
      field("name", $.function_name),
      optional(seq(
        $._horizontal_whitespace,
        field("args", $.function_args),
      )),
    ),

    function_args: $ => repeat1(choice(
      $.double_quoted_string,
      $.single_quoted_string,
      $.variable_ref,
      $.label_like,
      $.number,
      token(/[^\n;]/), // fallback
    )),

    // if statement
    if_statement: $ => prec.right(seq(
      $.if_keyword,
      $.logical_condition,
      $.then_keyword,
      $._horizontal_whitespace,
      $._statement,
      optional(seq(
        $.else_keyword,
        $._horizontal_whitespace,
        $._statement,
      )),
    )),

    if_keyword: $ => token("if"),
    logical_condition: $ => seq("(", $.binary_expression, ")"),
    then_keyword: $ => token("then"),
    else_keyword: $ => token("else"),

    binary_expression: $ => seq(
      $._value_expression,
      $.operator,
      $._value_expression,
    ),

    _value_expression: $ => choice(
      $.single_quoted_string,
      $.label_like,
      $.variable_ref,
      $.number,
    ),

    operator: $ => token(choice("+", "-", "/", "*", ">", "<", "|", "==", "=", "!=", "!", "=~", "!~", / or | and | !isin | isin /i)),

    // expression
    expression: $ => choice(
      seq($._double_quote, $._double_quote), // empty string
      seq(
        $._double_quote,
        repeat(choice(
          seq($._terminator, $._expression_statement),
          $._expression_statement,
        )),
        $._double_quote,
      )
    ),
    _expression_statement: $ => prec.left(choice(
      $.expr_alias,
      $.expr_bind,
      $.expr_function_call,
      $.expr_if_statement,
      repeat1(choice($._fallback, $._newline)),
    )),

    expr_alias: $ => seq(
      field("function", $.alias_function),
      $._whitespace,
      field("name", $.alias_name),
      $._whitespace,
      field("command", $._expression_statement),
    ),

    expr_bind: $ => seq(
      field("function", $.bind_function),
      $._whitespace,
      field("key", $.bind_key),
      $._whitespace,
      field("command", $._expression_statement),
    ),

    expr_function_call: $ => seq(
      field("name", $.function_name),
      optional(seq(
        $._horizontal_whitespace,
        field("args", $.expr_function_args),
      )),
    ),

    expr_function_args: $ => repeat1(choice(
      $.single_quoted_string,
      $.variable_ref,
      $.label_like,
      $.number,
      token(/[^\n;"]/), // fallback
    )),

    expr_if_statement: $ => prec.right(seq(
      $.if_keyword,
      $.logical_condition,
      $.then_keyword,
      $._whitespace,
      $._expression_statement,
      optional(seq(
        $._whitespace,
        $.else_keyword,
        $._whitespace,
        $._expression_statement,
      )),
    )),

    // strings
    single_quoted_string: $ => seq(
      $._single_quote,
      repeat(choice(
        $.variable_ref,
        $.label_like,
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
        $.label_like,
        $.char,
      )),
      $._double_quote,
    ),

    label_like: $ => token(/[a-z\d_\-:.!]+/i),

    char: $ => token(/[^"'\s]/),

    variable_ref: $ => choice(
      $.ezquake_variable_ref,
      $.qizmo_macro_ref,
      $.function_param_ref,
      $.user_variable_ref,
    ),
    function_param_ref: $ => token(/%[0-9]/),
    qizmo_macro_ref: $ => token(/%[abc]/i),
    user_variable_ref: $ => token(seq("$", /[a-z0-9_.]+/i)),
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
        "back",
        "fire",
        "forward",
        "moveleft",
        "moveright",
        "showscores",
      ),
    )),

    alias_function: $ => choice("alias", "temp_alias"),
    bind_function: $ => token("bind"),
    variable_function: $ => choice("set", "set_tp"),

    function_name: $ => prec.right(choice(
      $.alias_function,
      $.bind_function,
      $.variable_function,
      "color",
      "connect",
      "disconnect",
      "echo",
      "fov",
      "impulse",
      "place",
      "quit",
      "reconnect",
      "say",
      "sensitivity",
      "team",
      "unbind",
      "unbindall",
      "volume",
      "wait",
    )),
  }
});
