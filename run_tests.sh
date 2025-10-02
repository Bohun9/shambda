#!/bin/bash

TEST_DIR="./tests"

if ! npm run build; then
    exit 1
fi

for test_file in "$TEST_DIR"/*.lam; do
    temp_stdout=$(mktemp)
    temp_stderr=$(mktemp)
    compiled_script=$(mktemp)

    expected_stdout=$(grep '.*//@stdout:' "$test_file" | sed 's|.*//@stdout:||')
    expected_stderr=$(grep '.*//@stderr:' "$test_file" | sed 's|.*//@stderr:||')

    (npm --silent start -- "$test_file" "$compiled_script" && bash "$compiled_script") > "$temp_stdout" 2> "$temp_stderr"

    stdout=$(cat "$temp_stdout")
    stderr=$(cat "$temp_stderr")

    if [[ "$stdout" == "$expected_stdout" && "$stderr" == "$expected_stderr" ]]; then
        echo "✅ $test_file passed"
    else
        echo "❌ $test_file failed"
        if [[ "$stdout" != "$expected_stdout" ]]; then
            echo "expected stdout:"
            echo "$expected_stdout"
            echo "actual stdout:"
            echo "$stdout"
        fi
        if [[ "$stderr" != "$expected_stderr" ]]; then
            echo "expected stderr:"
            echo "$expected_stderr"
            echo "actual stderr:"
            echo "$stderr"
        fi
    fi

    rm "$temp_stdout"
    rm "$temp_stderr"
    rm "$compiled_script"
done
