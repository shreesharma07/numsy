# <img src="../../assets/icons/terminal.svg" width="28" alt="" /> CLI

[Docs](../README.md) › Using Numsy › CLI

```bash
npm install -g numsy     # or run any command with: npx numsy …
numsy --help
```

## Commands

| Command | Input | Does |
| --- | --- | --- |
| `numsy validate [numbers…]` | args, `--input <file>`, or stdin (one per line) | Validates each value |
| `numsy extract [text…]` | args, `--input <file>`, or stdin | Finds every number in free text |
| `numsy process <file>` | `.csv` / `.xlsx` | Detects the phone column, validates, de-dupes, exports |
| `numsy dashboard` | — | Starts the [local dashboard & REST API](rest-api.md) on `localhost:6789` (aliases `serve`, `ui`) |
| `numsy formats` | — | Lists output formats |

## Options

### Output

| Option | Default | Description |
| --- | --- | --- |
| `-f, --format <list>` | `table` | `table` `json` `csv` `md` `xlsx` `txt`, comma-separated for several |
| `-o, --output <path>` | — | Write to this file; format inferred from the extension if `-f` is omitted |
| `-d, --out-dir <dir>` | cwd | Directory for generated files |
| `-n, --name <base>` | `<input>-numsy` | Base filename for generated files |
| `--only <set>` | `all` | `all` · `valid` · `invalid` · `unique` · `duplicates` |
| `--number-style <s>` | `plain` | `plain` (9876501234) · `e164` (+919876501234) · `spaced` (+91 98765 01234) |
| `--country-code` | off | Shorthand for `--number-style e164` |
| `--columns <c>` | `full` | `full` keeps every column, `numbers` keeps only the name and number |
| `--header-name <h>` | key name | Rename the number column in exports, e.g. `Mobile` |
| `--no-header` | header on | Leave the header row out of CSV and Excel output |
| `--max-rows <n>` | `0` (all) | Export at most `n` rows |
| `--no-pretty` | pretty | Compact JSON |
| `--limit <n>` | `50` | Max rows in the terminal table (`0` = all) |

### Filters

| Option | Applies to | Description |
| --- | --- | --- |
| `--dedupe` | all | Drop repeat occurrences of a number, keeping the first |
| `--keep <first\|last>` | all | Drop repeats, keeping the first or the last occurrence |
| `--loose` | all | Accept dummy patterns such as `9999999999`; only the shape is checked |
| `--first-only` | process | Keep only the first valid number of each cell |
| `--skip-empty` | process | Leave rows with an empty phone cell out of the invalid set |

### Input & behaviour

| Option | Applies to | Description |
| --- | --- | --- |
| `-i, --input <file>` | validate, extract | Read input from a text file |
| `-c, --column <name>` | process | Phone column (auto-detected by default) |
| `--name-column <c>` | process | Contact-name column (auto-detected); `none` disables it |
| `--normalize` | process | Rename known headers, e.g. `Mobile Number` → `phone` |
| `--bundle` | process | Also write the classic ZIP report |
| `--fail-on-invalid` | all | Exit `2` when any number is invalid |
| `-q, --quiet` | all | Print only the requested output |
| `--no-color` | all | Disable colour (also `NO_COLOR`) |

### Dashboard

| Option | Default | Description |
| --- | --- | --- |
| `-p, --port <n>` | `6789` | Port; the next free one is used when busy. `PORT` also works |
| `--host <addr>` | `127.0.0.1` | Interface to listen on; the default accepts this machine only |
| `--open` | off | Open the dashboard in your browser |

## Where output goes

| You pass | Result |
| --- | --- |
| nothing | Table on stdout |
| `-f json` (text formats) | Printed to stdout, ready to pipe |
| `-f xlsx` | Written to `<name>.xlsx` (binary is never printed) |
| `-o out.csv` | Written to that file |
| `-f json,csv -o report` | `report.json` + `report.csv` |
| `-d reports -n clean -f json,md` | `reports/clean.json` + `reports/clean.md` |

Data goes to **stdout**, status lines go to **stderr**. The terminal table always shows the full result; `--columns`, `--header-name`, `--no-header` and `--max-rows` shape the exported formats.

## What each format contains

| Format | Content |
| --- | --- |
| `json` | `{ title, generatedAt, summary, rows, … }`, plus `analytics` and `unique` for `process` |
| `csv` | Rows with a header line (unless `--no-header`). Formula-like cells are neutralised |
| `md` | `# Title`, a `## Summary` table and a `## Rows (n)` table, one blank line between blocks |
| `xlsx` | Summary sheet + All rows / Valid / Invalid / Unique / Duplicates sheets |
| `txt` | One number per line (valid by default; follows `--only`) |

## Exit codes

| Code | Meaning |
| :-: | --- |
| `0` | Success |
| `1` | Usage or processing error |
| `2` | `--fail-on-invalid` and invalid numbers were found |

## Recipes

```bash
# Validate a list from a file and keep only good, distinct numbers
numsy validate -i numbers.txt --dedupe --only valid -f txt > clean.txt

# Clean a contact sheet into every format at once
numsy process contacts.xlsx -f json,csv,md,xlsx -d reports -n contacts-clean

# De-duplicated valid numbers as two columns: Name, Mobile
numsy process leads.csv --dedupe --only valid --columns numbers --header-name Mobile -o clean.csv

# First 500 unique numbers in +91 format, no header row
numsy process leads.xlsx --only unique --number-style e164 --no-header --max-rows 500 -o top.csv

# Fail a CI job when a data file contains bad numbers
numsy process data/customers.csv --fail-on-invalid -q -f txt > /dev/null

# Open the local dashboard
numsy dashboard --open
```
