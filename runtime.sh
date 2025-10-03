#!/bin/bash

# Closures are represented as S-expressions:
#   (f env)   where env = v1 v2 ... vn
# Example: (add 1 (mul 2 3))

make_closure() {
    local f=$1
    local env=$2
    echo "($f $env)"
}

extend_env() {
    local env=$1
    local v=$2
    if [[ -z "$env" ]]; then
        echo "$v"
    else
        echo "$env $v"
    fi
}

extract_fun() {
    local closure=$1
    closure="${closure:1}"
    echo "${closure%% *}"
}

extract_env() {
    local closure=$1
    closure="${closure:0:-1}"
    echo "${closure#* }"
}

get_env_data() {
    local env=$1
    local n=$2
    local depth=0
    local c
    local token

    printf "%s " "$env" | while IFS= read -r -n1 c; do
        if [[ "$c" == "(" ]]; then
            depth=$((depth + 1))
        elif [[ "$c" == ")" ]]; then
            depth=$((depth - 1))
        fi

        if [[ "$c" == " " && depth -eq 0 ]]; then
            if [[ n -eq 0 ]]; then
                echo "$token"
                break
            fi
            n=$((n - 1))
            token=
        else
            token="${token}${c}"
        fi
    done
}
