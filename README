# directus-extension-ai-field

Generate content with Claude, GPT, or Gemini directly inside any Directus field — no copy-pasting, no switching tabs.

![Field Settings](docs/field-settings.png)

## Why I built this

Every time I needed AI-generated content in Directus, I was switching between the CMS and ChatGPT, copying results back manually. This extension puts the generate button right where the content goes.

![Generate Button](docs/generate-button.png)

## What it does

- Adds a **✦ Generate** button to any string or text field
- Supports Claude (Anthropic), GPT (OpenAI), and Gemini (Google)
- Tone control — formal, casual, technical, or default
- Custom prompt template per field using `{{value}}` as a reference
- Works as a Directus bundle extension (interface + endpoint)

## Installation

```bash
cd your-directus-project/extensions
git clone https://github.com/mohammedwahba2/directus-extension-ai-field
cd directus-extension-ai-field
npm install
npm run build
```

Restart Directus after installation.

## Configuration

Add your API keys to your Directus `.env`:

```bash
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
```

You only need the key for the provider you plan to use.

## Usage

1. Go to **Settings → Data Model**
2. Open any collection and add a new field
3. Set type to **String** or **Text**
4. Under interface, choose **AI Field**
5. Pick your provider, tone, and prompt template
6. Save — the **✦ Generate** button will appear on every item

## Options

| Option | Description | Default |
|---|---|---|
| Provider | Claude, GPT, or Gemini | Claude |
| Tone | default, formal, casual, technical | default |
| Prompt Template | Use `{{value}}` to reference current field | `Write content for: {{value}}` |
| Max Tokens | Max length of generated content | 500 |

## Requirements

- Directus 11+
- Node.js 22+
- API key for at least one provider