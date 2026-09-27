#!/usr/bin/env bash
# TEA House — image optimization pipeline (WebP + responsive srcset + JPEG fallback)
#
# Usage:  bash tools/optimize-images.sh
# Deps:   ImageMagick 7 with libwebp (verified: libwebp 1.5.0)
#
# Output lands next to each source in img/ as <name>-<width>.webp, with the
# original .jpg/.png retained as the legacy fallback. Idempotent: re-running
# overwrites. Nothing is upscaled beyond the source's native width.
set -euo pipefail

cd "$(dirname "$0")/.."

WEBP_Q=78
JPEG_Q=80
# width sets, per asset class
HERO_WIDTHS=(640 1024 1600 1920)
CARD_WIDTHS=(400 600)
SMALL_WIDTHS=(100)

have() { command -v magick >/dev/null 2>&1 || command -v convert >/dev/null 2>&1; }
have || { echo "ImageMagick not found" >&2; exit 1; }
IM=$(command -v magick || command -v convert)

# encode_webp <src> <dst> <geometry>
encode_webp() {
  "$IM" "$1" -auto-orient -strip -resize "$3" -quality "$WEBP_Q" -define webp:method=6 "$2"
}

# encode_jpeg <src> <dst> <geometry>
encode_jpeg() {
  "$IM" "$1" -auto-orient -strip -resize "$3" -interlace Plane -sampling-factor 4:2:0 -quality "$JPEG_Q" "$2"
}

# build_set <src> <basename> <ext> <widths...>
build_set() {
  local src="$1" name="$2" ext="$3"; shift 3
  local native
  native=$("$IM" identify -format "%w" "$src")
  for w in "$@"; do
    # never upscale
    if [ "$w" -gt "$native" ]; then continue; fi
    encode_webp "$src" "img/${name}-${w}.webp" "${w}x"
    if [ "$ext" = "jpg" ]; then
      encode_jpeg "$src" "img/${name}-${w}.jpg" "${w}x"
    fi
    printf '  %s-%s.webp\n' "$name" "$w"
  done
}

echo "==> hero / full-bleed (1920x1080)"
for n in carousel-1 carousel-2 video-bg testimonial-bg; do
  build_set "img/${n}.jpg" "$n" jpg "${HERO_WIDTHS[@]}"
done

echo "==> product + article cards (600x400 / 600x600)"
for n in product-1 product-2 product-3 product-4 store-product-1 store-product-2 store-product-3 article; do
  build_set "img/${n}.jpg" "$n" jpg "${CARD_WIDTHS[@]}"
done

echo "==> brand story (400x500)"
for n in about-1 about-2 about-3 about-4; do
  build_set "img/${n}.jpg" "$n" jpg 400
done

echo "==> brand story small (300x200)"
for n in about-5 about-6; do
  build_set "img/${n}.jpg" "$n" jpg 300
done

echo "==> avatars (100x100, 2x for retina)"
for n in testimonial-1 testimonial-2 testimonial-3; do
  build_set "img/${n}.jpg" "$n" jpg "${SMALL_WIDTHS[@]}"
done

echo "==> alpha assets (WebP keeps alpha; PNG stays the fallback)"
"$IM" img/product-bg.png -strip -quality "$WEBP_Q" -define webp:method=6 img/product-bg.webp
"$IM" img/logo.png -strip -resize 340x -quality 90 img/logo@2x.webp
echo "  product-bg.webp  logo@2x.webp"

echo
# Report: source bytes vs. the 1x WebP a modern browser actually downloads.
# SOURCES is an explicit list so generated derivatives are never double-counted.
echo "==> before / after (source bytes -> 1x WebP actually served)"
SOURCES=(
  carousel-1 carousel-2 video-bg testimonial-bg
  product-1 product-2 product-3 product-4
  store-product-1 store-product-2 store-product-3
  article about-1 about-2 about-3 about-4 about-5 about-6
  testimonial-1 testimonial-2 testimonial-3
  product-bg
)
tot_before=0; tot_after=0
for stem in "${SOURCES[@]}"; do
  src=$(ls img/${stem}.jpg img/${stem}.png 2>/dev/null | head -1 || true)
  [ -n "$src" ] || continue
  b=$(stat -c%s "$src"); tot_before=$((tot_before + b))
  best=$(ls img/${stem}-*.webp 2>/dev/null | sort -t- -k2 -n | head -1 || true)
  [ -z "$best" ] && best="img/${stem}.webp"
  [ -e "$best" ] || best="$src"
  a=$(stat -c%s "$best"); tot_after=$((tot_after + a))
  printf '  %-22s %8s -> %8s  (%s)\n' "$(basename "$src")" "$b" "$a" "$(basename "$best")"
done
printf '\n  %-22s %8s -> %8s  (-%s%%)\n' "TOTAL (1x serves)" "$tot_before" "$tot_after" \
  "$(( (tot_before - tot_after) * 100 / tot_before ))"
