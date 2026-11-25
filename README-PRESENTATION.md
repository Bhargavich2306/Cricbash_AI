# Sports IQ presentation update

## Included
- Preserves the existing frontend JavaScript as `script.js`.
- Adds cricket coaching/ground searches through Google Maps using a typed area or PIN code.
- Adds a feedback form backed by `POST /api/feedback`. Feedback is written to `feedback.json` when the host filesystem allows writes. Render free instances may have ephemeral storage, so do not promise long-term persistence after redeploys.
- Ticket button opens a search for ticket providers instead of claiming to process a real booking. Confirm all match details and use official/authorized sellers only.
- Fixes boolean parsing for API strings such as `"false"`.

## Run locally
1. Put these files in your Sports-IQ project folder. Keep your `.env` file private and do not upload it to GitHub.
2. Install dependencies: `pip install -r requirements.txt`
3. Start: `python app.py`
4. Open `http://127.0.0.1:5000`.

## Important
- Live scores and player lists depend on your Cricket API key/plan and actual provider responses. If the API returns no score/lineup data, Sports IQ must show unavailable rather than inventing data.
- Ticket search is not a booking or payment integration.
- The old demo payment markup remains in the HTML but the booking button now opens a provider search.


## Feedback ratings and public feedback wall
- Visitors choose a 1–5 star rating when submitting feedback.
- The page loads the latest saved feedback from `GET /api/feedback`, shows the average rating, total reviews, stars, category, message, and date, and includes a refresh button.
- Feedback is public on the website; visitors are warned not to enter private information. Do not add names, emails, or other personal details unless you intentionally build a private admin workflow.
- Feedback is stored in `feedback.json` next to `app.py`. This local-file storage is suitable for a local demo but may not persist reliably on Render after restarts/redeploys. Use a persistent database or persistent disk for production.
- Older feedback entries created before star ratings were added remain visible but show no rating rather than receiving an invented score.

## Updated community layout
- The cricket grounds/coaching search is now a full-width, higher-contrast panel with a cricket-themed highlight strip.
- The feedback form includes a star picker and the community feedback wall below it.
