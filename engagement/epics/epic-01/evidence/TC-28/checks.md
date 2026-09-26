# TC-28 — raw bytes — text the ERP holds, compared with the database

Executed 2026-09-26T21:31:00.846Z → 2026-09-26T21:31:05.327Z · result **FAIL**

| Check | Result | Observed |
|---|---|---|
| "QA-R1" / "Line one\nLine two": stored byte-for-byte or listed | pass | stored part "QA-R1" description "Line one\nLine two" |
| "QA-R2" / "  padded  ": stored byte-for-byte or listed | FAIL | stored part "QA-R2" description "padded" |
| "QA-R3" / "Capacitor 10 µF ±10 % 1 kΩ": stored byte-for-byte or listed | pass | stored part "QA-R3" description "Capacitor 10 µF ±10 % 1 kΩ" |
| "QA-R4 " / "part number with a trailing space": stored byte-for-byte or listed | FAIL | stored part "QA-R4" description "part number with a trailing space" |
| "QA-R5" / "CRLF a\nb": stored byte-for-byte or listed | pass | stored part "QA-R5" description "CRLF a\nb" |
| "QA-R6" / "tab\there": stored byte-for-byte or listed | pass | stored part "QA-R6" description "tab\there" |

## Notes

- the workbook holds, read back: ["QA-R1","Line one\nLine two"] ["QA-R2","  padded  "] ["QA-R3","Capacitor 10 µF ±10 % 1 kΩ"] ["QA-R4 ","part number with a trailing space"] ["QA-R5","CRLF a\nb"] ["QA-R6","tab\there"]

HTTP exchanges: 3 (http-log.json).
