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
    // [$.setting_name, $.command]
  ],

  rules: {
    source_file: $ => repeat($._statement),
    comment: $ => token(seq('//', /.*/)),

    // document
    _statement: $ => choice(
      $.command,
      $.setting,
      $.set,
      $.alias,
      $.bind,
    ),

    command: $ => $.command_name,

    set: $ => seq($.set_function, $.set_key, $.set_value),
    set_function: $ => choice("set", "set_tp"),
    set_key: $ => $.label,
    set_value: $ => $.value,

    setting: $ => seq(
      $.setting_name,
      $.setting_value
    ),
    setting_name: $ => $.command_name,
    setting_value: $ => $.value,

    alias: $ => seq($.alias_function, $.alias_key, $.alias_value),
    alias_function: $ => choice("alias", "tempalias"),
    alias_key: $ => $.label,
    alias_value: $ => $.value,

    bind: $ => seq($.bind_function, $.bind_key, $.bind_value),
    bind_function: $ => choice("bind", "tempbind"),
    bind_key: $ => $.label,
    bind_value: $ => $.value,

    // primitives
    string: $ => /"[^"]*"/,
    number: $ => /-?\d+(\.\d+)?/,
    label: $ => /[a-z0-9_]+/i,
    variable: $ => seq("$", $.label),

    command_name: $ => /[a-z][a-z0-9_]*/i,

    value: $ => choice($.number, $.string, $.label, $.variable),
    quoted_value: $ => seq("\"", $.value, "\"")
  }
});
