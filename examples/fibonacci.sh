#!/bin/bash
source ./runtime.sh
fn4() {
    local _env=$1
    local y=$2
    _env=$("extend_env" "$_env" "$y")
    _5=$("get_env_data" "$_env" 1)
    _6=$("get_env_data" "$_env" 1)
    _fun=$("extract_fun" "$_5")
    _app_env=$("extract_env" "$_5")
    _7=$("$_fun" "$_app_env" "$_6")
    _fun=$("extract_fun" "$_7")
    _app_env=$("extract_env" "$_7")
    _8=$("$_fun" "$_app_env" "$y")
    echo "$_8"
}
fn2() {
    local _env=$1
    local x=$2
    _env=$("extend_env" "$_env" "$x")
    _3=$("get_env_data" "$_env" 0)
    _9=$("make_closure" "fn4" "$_env")
    _fun=$("extract_fun" "$_3")
    _app_env=$("extract_env" "$_3")
    _10=$("$_fun" "$_app_env" "$_9")
    echo "$_10"
}
fn14() {
    local _env=$1
    local y=$2
    _env=$("extend_env" "$_env" "$y")
    _15=$("get_env_data" "$_env" 1)
    _16=$("get_env_data" "$_env" 1)
    _fun=$("extract_fun" "$_15")
    _app_env=$("extract_env" "$_15")
    _17=$("$_fun" "$_app_env" "$_16")
    _fun=$("extract_fun" "$_17")
    _app_env=$("extract_env" "$_17")
    _18=$("$_fun" "$_app_env" "$y")
    echo "$_18"
}
fn12() {
    local _env=$1
    local x=$2
    _env=$("extend_env" "$_env" "$x")
    _13=$("get_env_data" "$_env" 0)
    _19=$("make_closure" "fn14" "$_env")
    _fun=$("extract_fun" "$_13")
    _app_env=$("extract_env" "$_13")
    _20=$("$_fun" "$_app_env" "$_19")
    echo "$_20"
}
fn1() {
    local _env=$1
    local f=$2
    _env=$("extend_env" "$_env" "$f")
    _11=$("make_closure" "fn2" "$_env")
    _21=$("make_closure" "fn12" "$_env")
    _fun=$("extract_fun" "$_11")
    _app_env=$("extract_env" "$_11")
    _22=$("$_fun" "$_app_env" "$_21")
    echo "$_22"
}
fn25() {
    local _env=$1
    local n=$2
    _env=$("extend_env" "$_env" "$n")
    _26=$(("$n" <= 1))
    if (( "$_26" != 0 )); then
        _34="$n"
    else
        _27=$("get_env_data" "$_env" 0)
        _28=$(("$n" - 1))
        _fun=$("extract_fun" "$_27")
        _app_env=$("extract_env" "$_27")
        _29=$("$_fun" "$_app_env" "$_28")
        _30=$("get_env_data" "$_env" 0)
        _31=$(("$n" - 2))
        _fun=$("extract_fun" "$_30")
        _app_env=$("extract_env" "$_30")
        _32=$("$_fun" "$_app_env" "$_31")
        _33=$(("$_29" + "$_32"))
        _34="$_33"
    fi
    echo "$_34"
}
fn24() {
    local _env=$1
    local fib=$2
    _env=$("extend_env" "$_env" "$fib")
    _35=$("make_closure" "fn25" "$_env")
    echo "$_35"
}
fn0() {
    local _env=$1
    local _dummy_arg=$2
    _env=$("extend_env" "$_env" "$_dummy_arg")
    _23=$("make_closure" "fn1" "$_env")
    _36=$("make_closure" "fn24" "$_env")
    _fun=$("extract_fun" "$_23")
    _app_env=$("extract_env" "$_23")
    _37=$("$_fun" "$_app_env" "$_36")
    _fun=$("extract_fun" "$_37")
    _app_env=$("extract_env" "$_37")
    _38=$("$_fun" "$_app_env" 8)
    echo "$_38"
}
fn0
