---
name: nano-banana
description: >-
  Generate and edit images using Nano Banana (Gemini CLI / Google Imagen).
  Handles product photos, user avatars, icons, banners, diagrams, illustrations,
  and image editing. Use this skill whenever the user asks to create, generate,
  make, draw, design, or edit images or visual assets in this project.
---

# Nano Banana Image Generation

Generate and edit professional images using Google's Nano Banana extension via Gemini CLI or direct API integration.

## When to Use This Skill

ALWAYS use this skill when the user:
- Asks to generate, create, make, draw, or design an image (e.g. product photos, avatar pictures, test assets).
- Wants thumbnails, banners, icons, diagrams, or textures.
- Requests image editing, modifying existing pictures, removing backgrounds, or restoring old photos.
- Needs sample/seed images for SanviPop (`img/products/` or `img/users/`).

---

## Prerequisites & Setup

### 1. Configure the Gemini API Key
Obtain an API key from Google AI Studio and configure it in your environment:
```bash
export GEMINI_API_KEY="your-gemini-api-key"
# or
export NANOBANANA_GEMINI_API_KEY="your-gemini-api-key"
```

You can also include it in the project `.env` file:
```env
GEMINI_API_KEY=your-gemini-api-key
```

### 2. Verify / Install Gemini CLI
Check if the Gemini CLI is available:
```bash
which gemini
```

If not installed:
```bash
npm install -g @google/gemini-cli
```

### 3. Verify / Install the Nano Banana Extension
Verify if the extension is already installed:
```bash
gemini extensions list | grep nanobanana
```

If missing, install it:
```bash
gemini extensions install https://github.com/gemini-cli-extensions/nanobanana
```

---

## Available Commands

> **Important:** Always include `--yolo` flag to automatically execute without manual confirmation prompts.

| Task | Command Syntax | Description |
|---|---|---|
| **Text to Image** | `gemini --yolo "/generate 'prompt'"` | Standard image generation |
| **Edit Image** | `gemini --yolo "/edit path/to/image.png 'instruction'"` | Modify or transform an existing image |
| **Restore Image** | `gemini --yolo "/restore old_photo.jpg 'fix imperfections'"` | Enhance and repair damaged/low-res photos |
| **Icons & Logos** | `gemini --yolo "/icon 'description'"` | App icons, badges, UI elements |
| **Diagrams** | `gemini --yolo "/diagram 'description'"` | Architecture flowcharts and diagrams |
| **Patterns** | `gemini --yolo "/pattern 'description'"` | Seamless repeating textures |
| **Story / Comics** | `gemini --yolo "/story 'description'"` | Sequential visual storytelling |
| **Natural Language**| `gemini --yolo "/nanobanana prompt"` | Open-ended prompt interpreter |

---

## Common Options

- `--yolo`: **Required.** Auto-approves all tool actions without interactive confirmation.
- `--count=N`: Generates `N` variations (1 to 8).
- `--preview`: Opens the generated images automatically.
- `--styles="style1,style2"`: Applies specific artistic styles (e.g., `"realistic,cinematic"`).
- `--aspect="16:9"` / `"1:1"` / `"4:3"`: Controls aspect ratio.
- `--format=grid|separate`: Determines file arrangement.

---

## Standard Dimensions & Aspect Ratios

| Use Case | Dimensions / Aspect | Notes |
|---|---|---|
| **Product Photo (SanviPop)** | 1:1 (Square) or 4:3 | Best for marketplace listings |
| **User Avatar** | 1:1 (Square) | Best for user profile photos |
| **Banner / Header** | 16:9 or 1200x630 | Social preview and web banners |
| **Vertical Story** | 9:16 (1080x1920) | Mobile-first vertical format |

---

## Model Selection

- **Default:** `gemini-2.5-flash-image` (Fast and cost-effective)
- **High Quality (Pro):**
  ```bash
  export NANOBANANA_MODEL=gemini-3-pro-image-preview
  ```

---

## SanviPop Project Integration

In this project, images are served from `img/`:
- Product photos: `img/products/`
- User avatars: `img/users/`

### Workflow for Generating Product / User Assets:
1. Generate the image using Nano Banana:
   ```bash
   gemini --yolo "/generate 'vintage analog camera on wooden table, soft studio lighting, high resolution product photography' --aspect='1:1'"
   ```
2. The generated image will be located in `./nanobanana-output/`.
3. Copy or rename the resulting image to the target folder:
   ```bash
   cp nanobanana-output/<filename>.jpg img/products/vintage-camera.jpg
   ```

### Helper Script
You can also use the bundled helper script:
```bash
./.agents/skills/nano-banana/scripts/generate_image.sh "mountain bike red color, clean background" --out img/products/bike.jpg
```

---

## Prompt Engineering Tips

1. **Be specific with subject and lighting:** Describe the subject, background, lighting (e.g. "studio lighting", "natural daylight"), and perspective.
2. **Specify style:** Include keywords such as "commercial product photography", "clean white background", "flat icon design", "editorial portrait".
3. **Prevent unwanted text:** Append `"no text, clean background"` to avoid random AI-generated letters on product images.

