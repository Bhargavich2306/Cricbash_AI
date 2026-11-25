# Sports IQ — Fixes 1–3

This folder contains a targeted update to the existing Sports IQ project.

## Changes
1. Historical-results scraping ignores today/future dates, so a future fixture cannot be labelled ENDED by the historical scraper.
2. Backend emits a normalized `statusLabel` (UPCOMING/LIVE/ENDED); the match cards use it. When numerical scores are unavailable, completed-match cards show the provider's result text when available, otherwise `Score not available`. No scores are invented.
3. The official ICC fixture link now uses the verified Fixtures & Results page: https://www.icc-cricket.com/fixtures-results

## Important limits
- Numerical scores can only be shown when the cricket data provider returns them. The historical-results table does not itself provide score arrays, and this patch does not fabricate scores.
- The ticket panel is a presentation/demo estimate, not a real ticket seller or payment processor. The official fixtures page may provide match details but does not guarantee ticket sales.
- These files were syntax-checked locally; the live API and the user's local website have not been tested from this environment.

## Apply
1. Back up the current project folder.
2. Replace `app.py`, `script.js`, and `index.html` with these files. Keep `style.css`, `enhancements.js`, `requirements.txt`, and your `.env` unchanged.
3. Restart Flask with `Ctrl+C`, then `python app.py`.
4. Refresh the site and inspect future fixtures, past results, and the ticket button.
