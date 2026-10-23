# <img src="../../assets/icons/terminal.svg" width="28" alt="" /> CLI

[Docs](../README.md) › Using Numsy › CLI

```bash
npm install -g @numsy/numsy     # or run any command with: npx @numsy/numsy …
numsy --help
```

## Commands

| Command | Input | Does |
| --- | --- | --- |
| `numsy validate [numbers…]` | args, `--input <file>`, or stdin (one per line) | Validates each value |
| `numsy extract [text…]` | args, `--input <file>`, or stdin | Finds every number in free text |
| `numsy process <file>` | `.csv` / `.xlsx` | Detects the phone column, validates, de-dupes, exports |
| `numsy serve` | — | Starts the [web UI & REST API](rest-api.md) |
| `numsy formats` | — | Lists output formats |

## Options

### Output

| Option | Default | Description |
| --- | --- | --- |
| `-f, --format <list>` | `table` | `table` `json` `csv` `md` `xlsx` `txt`, comma-separated for several |
| `-o, --output <path>` | — | Write to this file; format inferred from the extension if `-f` is omitted |
| `-d, --out-dir <dir>` | cwd | Directory for generated files |
| `-n, --name <base>` | `<input>-numsy` | Base filename for generated files |
| `--only <set>` | `all` | `all` · `valid` · `invalid` · `unique` |
| `--country-code` | off | Print valid numbers as `+91XXXXXXXXXX` |
| `--no-pretty` | pretty | Compact JSON |
| `--limit <n>` | `50` | Max rows in the terminal table (`0` = all) |

### Input & behaviour

| Option | Applies to | Description |
| --- | --- | --- |
| `-i, --input <file>` | validate, extract | Read input from a text file |
| `-c, --column <name>` | process | Phone column (auto-detected by default) |
| `--normalize` | process | Rename known headers, e.g. `Mobile Number` → `phone` |
| `--bundle` | process | Also write the classic ZIP report |
| `--fail-on-invalid` | all | Exit `2` when any number is invalid |
| `-q, --quiet` | all | Print only the requested output |
| `--no-color` | all | Disable colour (also `NO_COLOR`) |
| `-p, --port <n>` | serve | Port, default `3000` |

## Where output goes

| You pass | Result |
| --- | --- |
| nothing | Table on stdout |
| `-f json` (text formats) | Printed to stdout, ready to pipe |
| `-f xlsx` | Written to `<name>.xlsx` (binary is never printed) |
| `-o out.csv` | Written to that file |
| `-f json,csv -o report` | `report.json` + `report.csv` |
| `-d reports -n clean -f json,md` | `reports/clean.json` + `reports/clean.md` |

Data goes to **stdout**, status lines go to **stderr**.

## What each format contains

| Format | Content |
| --- | --- |
| `json` | `{ title, generatedAt, summary, rows, … }`, plus `analytics` and `unique` for `process` |
| `csv` | Rows with a header line. Formula-like cells are neutralised |
| `md` | Title, summary table, rows table |
| `xlsx` | Summary sheet + All rows / Valid / Invalid / Unique sheets |
| `txt` | One number per line (valid by default; follows `--only`) |

## Exit codes

| Code | Meaning |
| :-: | --- |
| `0` | Success |
| `1` | Usage or processing error |
| `2` | `--fail-on-invalid` and invalid numbers were found |

## Recipes

```bash
# Validate a list from a file and keep only good numbers
numsy validate -i numbers.txt --only valid -f txt > clean.txt

# Clean a contact sheet into every format at once
numsy process contacts.xlsx -f json,csv,md,xlsx -d reports -n contacts-clean

# Unique numbers in international format
numsy process leads.csv --only unique --country-code -o unique.csv

# Fail a CI job when a data file contains bad numbers
numsy process data/customers.csv --fail-on-invalid -q -f txt > /dev/null
```
