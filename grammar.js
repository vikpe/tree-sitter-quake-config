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
    // [$._inline_statement, $.if_statement],
  ],

  rules: {
    config: $ => seq(
      repeat($._block_statement),
      optional($._inline_statement),
    ),
    _fallback: $ => field("content", $.fallback_token),
    fallback_token: $ => prec.left(repeat1(token(/[^\s;]/))),

    // primitives
    comment: $ => token(seq('//', /.*/)),
    number: $ => token(/-?\d+(\.\d+)?/),
    _semicolon: $ => token(";"),
    _whitespace: $ => token(/\s+/),
    non_whitespace: $ => token(/[^\s]/),
    _horizontal_whitespace: $ => token(/[\t ]+/),
    _newline: $ => token(/\r?\n/),
    _single_quote: $ => token("'"),
    _double_quote: $ => token("\""),

    // statements
    _block_statement: $ => seq(
      optional($._inline_statement),
      $._block_statement_terminator,
    ),
    _block_statement_terminator: $ => choice($._semicolon, $._newline),
    _inline_statement: $ => prec.left(choice(
      $.alias,
      $.bind,
      $.function_call,
      $.variable_declaration,
      $.if_statement,
      $.plus_command,
      repeat1($._fallback),
    )),

    // alias
    alias: $ => prec.right(seq(
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
        field("value", choice($._inline_statement, $.expression)),
      )),
    )),
    alias_name: $ => token(seq(/[^\s;"]/, repeat(/[^\s;]/))),
    alias_name_within_quotes: $ => token(repeat1(/[^\s;"]/)),

    // bind
    bind: $ => prec.left(seq(
      field("function", $.bind_function),
      $._horizontal_whitespace,
      choice(
        field("key", $.bind_key),
        seq($._double_quote, field("key", $.bind_key), $._double_quote),
      ),
      $._horizontal_whitespace,
      field("value", choice($._inline_statement, $.expression)),
    )),
    bind_key: $ => choice($.keyname, $.keyname_fallback),

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
        $.variable_ref,
        $.label_like,
        $.number,
      )),
    ),

    variable_name: $ => choice(
      repeat1(token(/[a-z\d_.:-]/i)),
    ),

    // function call
    function_call: $ => prec.left(seq(
      field("name", $.function_name),
      repeat(seq(
        $._horizontal_whitespace,
        field("arg", choice(
          $.double_quoted_string,
          $.single_quoted_string,
          $.variable_ref,
          $.label_like,
          $.number,
          token(/[^\s;]+/), // fallback
        )),
      ))
    )),

    // if statement
    if_statement: $ => prec.right(seq(
      $.if_keyword,
      $.logical_condition,
      $.then_keyword,
      $._horizontal_whitespace,
      $._inline_statement,
      optional(seq(
        $._horizontal_whitespace,
        $.else_keyword,
        $._horizontal_whitespace,
        $._inline_statement,
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
      $.double_quoted_string,
      $.single_quoted_string,
      $.label_like,
      $.variable_ref,
      $.number,
    ),

    operator: $ => token(choice("+", "-", "/", "<=", ">=", "*", ">", "<", "|", "==", "=", "!=", "!", "=~", "!~", / or | and | !isin | isin /i)),

    // expression
    expression: $ => choice(
      seq($._double_quote, $._double_quote), // empty string
      seq(
        $._double_quote,
        seq(
          repeat(choice(
            seq($._expression_statement, $._semicolon),
            $._expression_statement,
            $._newline,
            $._semicolon,
          )),
        ),
        $._double_quote,
      )
    ),
    _expression_statement: $ => prec.left(choice(
      $.expr_alias,
      $.expr_bind,
      $.expr_function_call,
      $.expr_if_statement,
      $._fallback,
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

    expr_function_call: $ => prec.left(seq(
      field("name", $.function_name),
      repeat(seq(
        $._horizontal_whitespace,
        field("arg", choice(
          $.single_quoted_string,
          $.variable_ref,
          $.label_like,
          $.number,
          token(/[^\s; "]+/), // fallback
        )),
      )),
    )),

    expr_if_statement: $ => prec.right(seq(
      $.if_keyword,
      $.logical_condition,
      $.then_keyword,
      $._whitespace,
      // $._expression_statement,
      repeat1(/[^\s;"]/),
      optional(seq(
        $._whitespace,
        $.else_keyword,
        $._whitespace,
        choice(
          $.expr_if_statement,
          repeat1(/[^\s;"]/),
        ),
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

    function_name: $ => token(choice(
      "break",
      "color",
      "connect",
      "demo_jump",
      "demo_setspeed",
      "disconnect",
      "echo",
      "fov",
      "impulse",
      "messagemode",
      "messagemode2",
      "place",
      "quit",
      "ready",
      "reconnect",
      "say",
      "say_team",
      "screenshot",
      "sensitivity",
      "setinfo",
      "spectator",
      "team",
      "toggleconsole",
      "togglemenu",
      "unalias",
      "unaliasall",
      "unbind",
      "unbindall",
      "volume",
      "wait",
    )),
  }
});
