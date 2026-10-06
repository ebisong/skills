#!/usr/bin/env bash
# Writes <out>/<skill>.zip for every folder in skills/ that has a SKILL.md.
# Each zip holds the skill folder at its root, which is the layout Claude's
# "Upload a skill" expects. Uses python3 so it needs no zip binary.
# Stops if a skill contains a symlink: zipping follows links, so a link to a
# file outside the skill would publish that file's contents.
#   bash scripts/zip-skills.sh dist
set -euo pipefail

out="$(mkdir -p "${1:?usage: zip-skills.sh <out-dir>}" && cd "$1" && pwd)"
cd "$(dirname "$0")/../skills"

for dir in */; do
  name="${dir%/}"
  [ -f "$name/SKILL.md" ] || continue
  links="$(find "$name" -type l)"
  if [ -L "$name" ] || [ -n "$links" ]; then
    echo "Refusing to zip $name: it contains a symlink: ${links:-$name}" >&2
    exit 1
  fi
  rm -f "$out/$name.zip"
  python3 -m zipfile -c "$out/$name.zip" "$name"
  echo "$out/$name.zip"
done
