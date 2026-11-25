SPORTS IQ — Requested Changes Patch

Included:
- app.py: analyze/commentary endpoints now report Ollama connection/model failures as API failures instead of false success.
- index.html: removes the fake ticket price/category/quantity/demo-payment UI and replaces it with selected match, venue, date, status, and a link to official ICC fixtures.
- index.html: adds a feedback form connected to the existing /api/feedback GET/POST endpoints.
- script.js: shows useful analysis/commentary error text and syncs the match information panel with the selected fixture.

Install:
1. Stop Flask with Ctrl+C.
2. Back up app.py, index.html, and script.js.
3. Replace those three files with the included files.
4. Keep .env and other project files unchanged.
5. Start with: python app.py
6. Refresh the page with Ctrl+F5.

Important:
- This is based on the latest app.py and frontend files uploaded in the conversation. If your local index.html/script.js have additional edits made after those uploads, merge those edits before replacing them.
- AI analysis/commentary requires Ollama to be running at http://localhost:11434 and the configured model (llama3.2) to be installed. The page will now display the actual failure message.
- The ticket link opens the official ICC fixtures/results page; it does not guarantee that every fixture has a direct ticket-sale page.
- Player squads are shown only when CricketData returns squad/scorecard data. A rate-limited or unavailable API cannot provide a verified XI.
- Feedback is saved locally to feedback.json by the Flask backend; on ephemeral hosting, local file storage may not persist after redeploy/restart.
