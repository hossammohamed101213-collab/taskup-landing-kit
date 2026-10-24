#!/usr/bin/env python3
"""
Rename the whole site (brand name, code identifiers, number prefixes, contact details) in one go.

Examples
  python3 rebrand.py --src site --out my-site --name "Nova" --word-a "no" --word-b "va" --slug nova \
      --domain nova.app --prefix NV --cprefix CM --whatsapp 201112223334 --phone "+20 11 1222 3334"

  python3 rebrand.py --src single-file/taskup-single-file.html --out nova-single.html --name "Nova" ...

What it changes (text files only, vendor/ is skipped):
  TaskUp / taskup / taskup.app        -> brand name / identifier slug / your domain
  <b>task</b><span>up</span>          -> <b>word-a</b><span>word-b</span>  (the two-colour logo)
  TU- (requests), CP- (complaints)    -> your prefixes (regexes and placeholders included)
  201000000000 and +20 10 0000 0000   -> your WhatsApp number / displayed phone

It does NOT rewrite the marketing copy (cards, FAQ, portal demo data, plan perks). That part is the
content of your new service: see PROMPT.md section 3 (content) and content/CONTENT-INVENTORY.md (every string).
"""
import argparse, pathlib, re, shutil, sys

TEXT = {".html", ".js", ".mjs", ".css", ".md", ".txt", ".json"}


def main():
    a = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    a.add_argument("--src", required=True, help="site folder or a single .html file")
    a.add_argument("--out", required=True, help="output folder / file (must not exist)")
    a.add_argument("--name", required=True, help='brand name as displayed, e.g. "Nova"')
    a.add_argument("--word-a", required=True, help="first (cool-gradient) half of the two-colour logo, e.g. no")
    a.add_argument("--word-b", required=True, help="second (warm-gradient) half of the logo, e.g. va")
    a.add_argument("--slug", required=True, help="lowercase identifier, letters/digits only, e.g. nova")
    a.add_argument("--domain", required=True, help="domain used in e-mail addresses, e.g. nova.app")
    a.add_argument("--prefix", default="TU", help="request-number prefix, 2-4 capital letters (default TU)")
    a.add_argument("--cprefix", default="CP", help="complaint-number prefix, 2-4 capital letters (default CP)")
    a.add_argument("--whatsapp", default="201000000000", help="WhatsApp number, digits only with country code")
    a.add_argument("--phone", default="+20 10 0000 0000", help="phone text shown in the footer")
    o = a.parse_args()

    if not re.fullmatch(r"[a-z][a-z0-9]{1,20}", o.slug): sys.exit("--slug must be lowercase letters/digits, starting with a letter")
    for k in ("prefix", "cprefix"):
        if not re.fullmatch(r"[A-Z]{2,4}", getattr(o, k)): sys.exit(f"--{k} must be 2-4 capital letters")
    if o.prefix == o.cprefix: sys.exit("--prefix and --cprefix must differ")
    if not re.fullmatch(r"\d{8,15}", o.whatsapp): sys.exit("--whatsapp must be digits only, with country code")
    for k in ("name", "word_a", "word_b", "phone"):
        if re.search(r"[\"'\\<>&`$]", getattr(o, k)): sys.exit(f"--{k.replace('_', '-')} may not contain quotes, backslashes or < > & ` $")

    src, out = pathlib.Path(o.src), pathlib.Path(o.out)
    if out.exists(): sys.exit(f"{out} already exists")
    if src.is_dir(): shutil.copytree(src, out)
    else: out.write_bytes(src.read_bytes())
    files = [out] if out.is_file() else [p for p in out.rglob("*") if p.is_file()]

    def rewrite(t):
        t = t.replace("taskup.app", o.domain)
        t = t.replace("<b>task</b><span>up</span>", f"<b>{o.word_a}</b><span>{o.word_b}</span>")
        t = t.replace("TaskUp", o.name).replace("taskup", o.slug)
        t = re.sub(r"(?<![A-Za-z0-9_$.])TU(?![A-Za-z0-9_$])", o.prefix, t)
        t = re.sub(r"(?<![A-Za-z0-9_$.])CP(?=-)", o.cprefix, t)      # CP-… strings only, never the JS variable CP
        t = t.replace("^CP", "^" + o.cprefix)
        t = t.replace("201000000000", o.whatsapp).replace("+20 10 0000 0000", o.phone)
        return t

    n = 0
    for p in files:
        if "vendor" in p.parts or p.suffix.lower() not in TEXT: continue
        s = p.read_text(encoding="utf-8"); t = rewrite(s)
        if t != s: p.write_text(t, encoding="utf-8"); n += 1
    print(f"done: {n} files rewritten -> {out}")
    print("next: write the new content (PROMPT.md section 3), then run the checklist (PROMPT.md section 4).")


if __name__ == "__main__":
    main()
