#!/usr/bin/env bash
set -e

PROMPT=""
OUT_PATH=""
ASPECT="1:1"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --out|-o)
      OUT_PATH="$2"
      shift 2
      ;;
    --aspect|-a)
      ASPECT="$2"
      shift 2
      ;;
    *)
      if [ -z "$PROMPT" ]; then
        PROMPT="$1"
      else
        PROMPT="$PROMPT $1"
      fi
      shift
      ;;
  esac
done

if [ -z "$PROMPT" ]; then
  echo "Uso: $0 \"<prompt>\" [--out <ruta_destino>] [--aspect <1:1|16:9|4:3>]"
  exit 1
fi

# Load GEMINI_API_KEY from .env if not in environment
if [ -z "$GEMINI_API_KEY" ] && [ -f ".env" ]; then
  ENV_KEY=$(grep -E '^GEMINI_API_KEY=' .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
  if [ -n "$ENV_KEY" ]; then
    export GEMINI_API_KEY="$ENV_KEY"
  fi
fi

if [ -z "$GEMINI_API_KEY" ] && [ -z "$NANOBANANA_GEMINI_API_KEY" ]; then
  echo "⚠️ Advertencia: No se encontró GEMINI_API_KEY ni NANOBANANA_GEMINI_API_KEY."
  echo "Por favor exporta tu clave: export GEMINI_API_KEY=\"tu-api-key\" o añádela a .env"
fi

OUTPUT_DIR="./nanobanana-output"
mkdir -p "$OUTPUT_DIR"

if command -v gemini &>/dev/null; then
  echo "🎨 Generando imagen con Nano Banana (Gemini CLI)..."
  gemini --yolo "/generate '$PROMPT' --aspect='$ASPECT'"

  LATEST_IMG=$(find "$OUTPUT_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" \) -printf '%T@ %p\n' 2>/dev/null | sort -nr | head -n1 | cut -d' ' -f2-)

  if [ -n "$LATEST_IMG" ]; then
    echo "✅ Imagen generada: $LATEST_IMG"
    if [ -n "$OUT_PATH" ]; then
      mkdir -p "$(dirname "$OUT_PATH")"
      cp "$LATEST_IMG" "$OUT_PATH"
      echo "📁 Guardada en: $OUT_PATH"
    fi
  fi
else
  echo "ℹ️ La CLI 'gemini' no está instalada actualmente en el sistema."
  echo "Para instalarla y habilitar el comando completo:"
  echo "  npm install -g @google/gemini-cli"
  echo "  gemini extensions install https://github.com/gemini-cli-extensions/nanobanana"
fi

