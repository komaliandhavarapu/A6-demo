# OpenWithLove — Blue Gingham Anniversary Scrapbook

A customizable, page-by-page anniversary scrapbook inspired by the uploaded blue gingham reference video. It includes an invitation cover, anniversary title, camera-and-denim-pocket LOVE collage based on the reference screenshot, envelope-covered love letter that opens to reveal the writing, “My Constant Forever” page with three photos hanging from a string, togetherness milestone, calendar memory, and “You & Me” final page.

## Personalize every order

1. Open `config.js` in VS Code.
2. Edit names/phrases/headings, the anniversary date, letter, captions, and calendar month/year/day.
3. Replace the sample images in `assets/photos/` or update the `photos` paths in `config.js`. Five sample couple photos (`photo1.jpg` through `photo5.jpg`) are included and assigned to every photo frame; some repeat.
4. The included sample music is `assets/music/birthday.mp3`. Replace it with music you have permission to use and update `musicPath` in `config.js` if the filename changes.
5. Open `index.html` in a browser to preview. If local browser restrictions affect audio, serve the folder with VS Code Live Server.

Missing image files leave a clean photo placeholder rather than displaying broken-image icons or file paths. Replace the sample photos and music before customer delivery. If you obtained any media through Google Search, check the original source's license and terms; appearing in search results does not grant reuse permission.

The love-letter page now displays a closed envelope from the start. Tap “OPEN THE ENVELOPE” to animate the envelope away, unfold the paper, and reveal the editable letter text. The LOVE collage uses a CSS-drawn instant camera and a denim pocket with star patches/earbuds, matching the reference composition more closely.

## Controls

- Tap YES on the cover to open the book.
- Use Previous/Next or the page dots to navigate.
- Swipe left/right on mobile; use keyboard arrows on desktop.
- Tap “OPEN THE LETTER” on the letter page.
- Persistent play/pause button remains available on every page. Browsers generally require the visitor to click to begin playback.

## Notes

This is a recreation of the visible design language and sequence, not a verified pixel-perfect copy of the source website. Fonts are loaded from Google Fonts when online; system fallbacks are provided.


## Customer calendar date
In `config.js`, set `calendarDate` to the customer's anniversary date in `YYYY-MM-DD` format, for example `2025-11-08`. The calendar automatically displays the correct month and year and highlights that day. If `calendarDate` is blank, the older `calendarMonth`, `calendarYear`, and `calendarHighlightDay` settings are used as a fallback.

The Togetherness, calendar, and final-page photos are styled as Polaroid prints. Replace the corresponding paths in `config.js` and put the images in `assets/photos/`.


### Reference background update
The outer background keeps the blue-and-white gingham checks and now includes persistent blue floral stickers and a teddy-bear decoration around the scrapbook on every screen. The original cover flowers, bow and teddy remain. All page content, photo paths, calendar configuration, responsive styles and the persistent play/pause music control are preserved.
