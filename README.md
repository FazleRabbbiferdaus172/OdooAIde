# OdooAide: Your In-Browser Odoo AI Co-pilot

**Submission for the Google Chrome Built-in AI Challenge 2025.**

OdooAide is a Chrome extension that acts as an intelligent co-pilot for Odoo developers. It integrates directly into the Odoo web interface, leveraging the on-device `window.ai` (Gemini Nano) API to provide context-aware code assistance, explanations, and modifications.



---

## The Problem

> Odoo development involves an inefficient workflow for quick changes. The native Ace editor in Odoo offers limited assistance, and developers on SaaS instances can't access the underlying code. This forces a slow "developer shuffle":
>
> 1.  Inspect a UI element in the Odoo web app.
> 2.  Switch to a local code editor to find the correct file.
> 3.  Make a change and save.
> 4.  Switch back to the browser to reload and see the result.
>
> This process is slow and breaks a developer's concentration.

## The Solution

> OdooAide solves this by bringing an AI co-pilot *to* the browser.
>
> It uses the `chrome.sidePanel` API for its chat interface and the `chrome.scripting` API to automatically extract Odoo code (e.g., XML from the Ace editor) from the active page. This code is fed as context to the on-device `window.ai` model.
>
> An Odoo developer can now ask for modifications, see a diff, and **apply the AI's suggestions directly back to the page** with a single click—all without ever leaving the Odoo interface.

---

## Key Features

* **Context-Aware Code Extraction:** Automatically finds and reads code from Odoo's live Ace editor.
* **Streaming AI Chat:** A responsive chat interface that streams answers from the `window.ai` (Gemini Nano) model, so the app never feels "stuck."
* **Markdown & Code Rendering:** Uses `react-markdown` and `prism-react-renderer` to beautifully display explanations and code blocks.
* **Sanitized Output:** Leverages `rehype-sanitize` to ensure all AI-generated HTML is safe to render.
* **"Apply Code" Functionality:** Injects AI-suggested code modifications directly back into the page's Ace editor.
* **Diff Viewer:** A "Show Diff" button allows developers to compare the original code with the AI's suggestion using `react-diff-viewer`.

---

## APIs Used

* **`window.ai (Gemini Nano)`:** Powers all generative AI features, running fast and securely on-device.
* **`chrome.sidePanel`:** Provides the main UI for the chat interface.
* **`chrome.scripting`:** Used to extract code from the Odoo page (`executeScript`) and apply changes back to it.
* **`chrome.runtime`:** Manages all communication between the content scripts, side panel, and background.

---

## 🚀 How to Test OdooAide

### 1. Prerequisites

* A running Odoo instance (a [Odoo Runbot](https://runbot.odoo.com/) instance or a local one).
* **Developer Mode** must be enabled on your Odoo instance (click the "bug" icon).
* A Google Chrome version that supports the Prompt API (e.g., Chrome Canary or Dev).

### 2. Enable Chrome AI Flags

1.  Go to `chrome://flags` in your address bar.
2.  Find and **Enable** the **#prompt-api-for-gemini-nano** flag.
3.  Relaunch Chrome.

### 3. Load the Extension

1.  Download this repository as a ZIP file and unzip it.
2.  Go to `chrome://extensions`.
3.  Turn on **"Developer mode"** (top-right toggle).
4.  Click **"Load unpacked"** and select the unzipped project folder.

### 4. Run the Demo (The "Golden Path")

1.  Log in to your Odoo instance.
2.  Navigate to any view (e.g., a Sales Order form).
3.  Enter developer mode (the "bug" icon) and click **"Edit View: Form"** (or "Edit View: List," etc.). This will open the Odoo Ace editor.
4.  Click the **OdooAide extension icon** in your toolbar to open the side panel.
5.  The extension will automatically detect and load the XML from the Ace editor.
6.  In the chat, ask the AI to make a change, such as:
    * `"remove the header from this list view"`
    * `"add a new 'tracking_number' field after the 'partner_id' field"`
7.  The AI will stream back an explanation and a code block.
8.  Click the **"Show Diff"** button to compare the original code with the AI's suggestion.
9.  Click the **"Apply"** button. The code in the Odoo Ace editor will **automatically update** with the AI's changes.

---

## 🔮 Future Work

This project is a strong proof-of-concept. The next steps to expand its capabilities are:

* **RAG System:** Implement a RAG (Retrieval-Augmented Generation) system to provide the AI with Odoo documentation, making it a true domain expert.
* **Vector Database:** Use **RxDB** to store Odoo knowledge vectors in-browser for a fast, offline-first RAG.
* **Context Menus:** Add "Right-click to Explain/Modify" functionality using the `chrome.contextMenus` API.

---

## 🛠️ Developer Quick Start (Building from Source)

### 1. Install dependencies:

```bash
npm install
```

### 2. Start development server:

```
npm run dev
```
(This will watch for changes and rebuild the dist folder automatically)

### 3. Load the extension:
- Go to chrome://extensions/
- Enable "Developer mode"
- Click "Load unpacked" and select the dist directory.

### Build for production:
```bash

npm run build
```