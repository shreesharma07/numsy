/** FAQ entries. Answers may contain `inline code` and **bold**. */
export const faq: { q: string; a: string }[] = [
  {
    q: 'Which numbers count as valid?',
    a: 'After sanitizing (removing spaces, dashes, brackets and a `+91`, `0091` or leading `0` prefix), a number must be exactly **10 digits** and **start with 6, 7, 8 or 9**. Obvious junk is rejected too: all-same digits (`9999999999`), straight sequences (`9876543210`) and repeating blocks (`9898989898`). Landlines are out of scope.',
  },
  {
    q: 'Can I process .xls files?',
    a: 'Use **.xlsx** or **.csv**. Legacy binary `.xls` (Excel 97–2003) is not supported — open it in Excel, LibreOffice or Google Sheets and save it as .xlsx or .csv first.',
  },
  {
    q: 'Does my data leave my machine?',
    a: 'No. The library, the CLI and `numsy serve` all run locally — there are no external API calls or telemetry. The playground on this site also runs entirely in your browser.',
  },
  {
    q: 'How do I use it in CI?',
    a: 'Add `--fail-on-invalid`: the command exits with code `2` when any invalid number is found, failing the job. Pair it with `-q` for quiet logs, e.g. `npx @numsy/numsy process data/leads.csv -q --fail-on-invalid`.',
  },
  {
    q: 'How does it find the phone column?',
    a: 'Numsy inspects headers (phone, mobile, contact…) and sample values to pick the most likely column. Override it with `-c, --column <name>` or `analyzeFile(path, { phoneColumn })`. Add `--normalize` to rename known headers such as `Mobile Number` to `phone` in the output.',
  },
  {
    q: 'What about cells with several numbers?',
    a: 'They are split on commas, semicolons, slashes, pipes, new lines and “or” / “and”; each part is validated and every valid number becomes its own output row.',
  },
];
