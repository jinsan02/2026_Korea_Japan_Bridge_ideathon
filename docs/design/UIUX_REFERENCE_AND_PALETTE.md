# AI Door UI/UX reference and palette

## Direction

The visual system should communicate the product loop before it communicates
the model: **solve together → practise → solve independently**. The interface
uses a calm public-service structure, senior-sized controls, and a warm pink
identity. Rose White is the dominant surface, every reader-facing word is
black, and pale pink appears only when the interface asks for attention or an
action.

Concept image: [ai-door-light-pink-ui-concept.png](./ai-door-light-pink-ui-concept.png)

Rendered workflows:

- [Korean workflow](./ai-door-workflow-ko.jpg)
- [Japanese workflow](./ai-door-workflow-ja.jpg)

## Reference review

- [Document Scanner App – Figma resource](https://figmaelements.com/document-scanner-app/): reference for the short capture and document-preview flow. Do not copy its storage/folder dashboard because AI Door is an action-and-learning service, not a file manager.
- [ProScan document scanner UI kit](https://www.behance.net/gallery/164607807/ProScan-Document-PDF-Scanner-App-UI-Kit): reference for camera framing and scan confirmation only.
- [Figma accessibility guidance](https://help.figma.com/hc/en-us/articles/35063862380311-Accessibility-at-Figma): use enhanced contrast and verify screen-reader/keyboard behaviour.
- [Android touch-target guidance](https://support.google.com/accessibility/android/answer/7101858?hl=en): interactive targets should be at least 48dp; AI Door keeps the stricter existing 56px minimum.
- [Design principles for older adults](https://pmc.ncbi.nlm.nih.gov/articles/PMC4777049/): favour strong contrast, distinct surfaces, simple layouts, and warm colours with sufficient luminance separation.

These are references, not templates to reproduce. AI Door's unique screen
sequence and learning-loop hierarchy remain primary.

## Approved palette

| Token | Name | Hex | Use |
|---|---|---:|---|
| Main surface | Rose White | `#FFF8FB` | app, header, footer, card and document background |
| Text | Black | `#000000` | every heading, body label, caption and button label |
| Button | Light Pink | `#F7C6D9` | primary action and high-attention action card only |
| Pressed/highlight | Blush Mist | `#FCE7F0` | hover, pressed, selected and learning emphasis only |
| Structural accent | Deep Rose | `#9E2F61` | borders, focus ring, connectors and icons; never text |
| Strong structural accent | Mulberry Rose | `#7A1F49` | optional icon or border contrast; never text |

Contrast checks:

- Black `#000000` on Rose White `#FFF8FB`: approximately `20.1:1`
- Black `#000000` on Light Pink `#F7C6D9`: approximately `15.0:1`
- Black `#000000` on Blush Mist `#FCE7F0`: approximately `17.7:1`
- Light Pink and Blush Mist never carry essential meaning without a word,
  border, icon, or selected-state label.

## Screen hierarchy

### Home

1. Learning promise and three-stage journey
2. One dominant “solve together” action
3. Practice and tutorial as paired secondary actions
4. History as a quiet utility action
5. Privacy warning, language, and model settings

### Guided solve

1. Current step and total steps
2. One task at a time
3. Evidence location immediately below the instruction
4. Large “understood” and “I don't know” actions

### Practice

1. Clearly label the page as a synthetic practice document
2. Let the user answer before revealing help
3. Fixed three-stage hints: location → keyword → answer with evidence
4. No percentage score, rank, cognitive label, or gamified pressure

## Implementation constraints

- Body copy remains 20px and the smallest copy remains 17px.
- All interactive controls remain at least 56px high.
- All reader-facing text is black, including links and primary button labels.
- Rose White is the default surface; Light Pink and Blush Mist are limited to
  actions, hover/pressed states, selections, and short emphasis areas.
- Pink never communicates state by itself; use icon and text together.
- No gradients, glassmorphism, dense analytics dashboards, or hidden navigation.
- Preserve all existing evidence, privacy, fixture disclosure, and learning-loop tests.
