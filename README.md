# jp-kuhinje.com

A static website (HTML, CSS and JS) with no build step. Upload the contents of this folder to the hosting web root.

## Fill in before going live
- **Phone number:** `index.html`, search for `+385000000000` (it appears twice in the contact section).
- **E-mail:** `info@jp-kuhinje.com` is used in `index.html` and `assets/js/main.js` (`TO`).
- **Social links:** in the footer, replace the generic Instagram and Facebook URLs.
- **Form:** by default it opens the visitor's e-mail app. To receive enquiries directly, put a
  Formspree, Web3Forms or Netlify Forms URL in `FORM_ENDPOINT` in `assets/js/main.js`.
- **Editions (Essential, Signature, Bespoke):** the contents are suggestions. Adjust them to the real offer.

## Languages
Croatian and English. Each text has two versions: `<span data-l="hr">` and `<span data-l="en">`.
The site picks the language from the browser, and the HR/EN toggle remembers the visitor's choice.
