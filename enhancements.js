/* Sports IQ presentation add-ons. Keeps the original script.js intact. */
(function () {
  "use strict";
  const byId = (id) => document.getElementById(id);

  function openMapSearch(kind) {
    const input = byId("nearbyLocation");
    const location = input ? input.value.trim() : "";
    if (!location) {
      if (input) { input.focus(); input.setCustomValidity("Enter an area or PIN code first."); input.reportValidity(); }
      return;
    }
    input.setCustomValidity("");
    const query = `${kind} near ${location}`;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, "_blank", "noopener,noreferrer");
  }

  const nearbyForm = byId("nearbyForm");
  if (nearbyForm) nearbyForm.addEventListener("submit", (event) => { event.preventDefault(); openMapSearch("cricket coaching centres"); });
  const groundsButton = byId("groundsSearch");
  if (groundsButton) groundsButton.addEventListener("click", () => openMapSearch("cricket grounds"));

  const feedbackForm = byId("feedbackForm");
  if (feedbackForm) feedbackForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = byId("feedbackStatus");
    const message = byId("feedbackMessage").value.trim();
    const category = byId("feedbackCategory").value;
    const ratingInput = feedbackForm.querySelector('input[name="rating"]:checked');
    const rating = ratingInput ? Number(ratingInput.value) : 0;
    if (!rating) { status.textContent = "Please choose a star rating first."; return; }
    if (message.length < 3) { status.textContent = "Please write at least 3 characters."; return; }
    status.textContent = "Submitting feedback…";
    try {
      const response = await fetch("/api/feedback", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, message, rating })
      });
      const result = await response.json();
      if (!response.ok || result.status !== "success") throw new Error(result.message || "Could not save feedback.");
      status.textContent = result.message || "Thanks! Feedback submitted.";
      feedbackForm.reset();
      await loadFeedback();
    } catch (error) {
      status.textContent = `${error.message} If you're presenting without the backend, explain that feedback saving needs the Flask endpoint.`;
    }
  });

  // Public community feedback wall: render text safely with textContent (never innerHTML).
  function starText(rating) {
    const n = Math.max(0, Math.min(5, Number(rating) || 0));
    return "★".repeat(n) + "☆".repeat(5 - n);
  }
  function formatFeedbackDate(value) {
    if (!value) return "Date not provided";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  }
  async function loadFeedback() {
    const list = byId("feedbackList");
    if (!list) return;
    list.replaceChildren();
    const loading = document.createElement("p");
    loading.className = "addon-note";
    loading.textContent = "Loading community feedback…";
    list.appendChild(loading);
    try {
      const response = await fetch("/api/feedback", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || data.status !== "success") throw new Error("Feedback could not be loaded.");
      list.replaceChildren();
      const average = byId("averageRating");
      const averageStars = byId("averageStars");
      const count = byId("feedbackCount");
      if (average) average.textContent = data.average_rating == null ? "—" : `${data.average_rating}/5`;
      if (averageStars) averageStars.textContent = starText(data.average_rating == null ? 0 : Math.round(data.average_rating));
      if (count) count.textContent = `${data.count} ${data.count === 1 ? "review" : "reviews"}`;
      if (!data.feedback || data.feedback.length === 0) {
        const empty = document.createElement("p");
        empty.className = "addon-note";
        empty.textContent = "No feedback yet. Be the first to rate Sports-IQ!";
        list.appendChild(empty);
        return;
      }
      data.feedback.forEach((item) => {
        const card = document.createElement("article");
        card.className = "feedback-item";
        const head = document.createElement("div");
        head.className = "feedback-item-head";
        const category = document.createElement("h3");
        category.textContent = item.category || "Feedback";
        const stars = document.createElement("span");
        stars.className = "feedback-stars";
        stars.setAttribute("aria-label", `${item.rating || 0} out of 5 stars`);
        stars.textContent = starText(item.rating);
        head.append(category, stars);
        const messageNode = document.createElement("p");
        messageNode.textContent = item.message || "(No message provided)";
        const date = document.createElement("time");
        date.textContent = formatFeedbackDate(item.created_at);
        card.append(head, messageNode, date);
        list.appendChild(card);
      });
    } catch (error) {
      list.replaceChildren();
      const message = document.createElement("p");
      message.className = "addon-note";
      message.textContent = "Could not load feedback from the server. Check that the Flask app is running and that /api/feedback is available.";
      list.appendChild(message);
      console.warn(error);
    }
  }
  const refreshFeedback = byId("refreshFeedback");
  if (refreshFeedback) refreshFeedback.addEventListener("click", loadFeedback);
  loadFeedback();

  // Populate the ticket selector from real matches returned by the backend.
  // Never show invented fixtures/venues as if they were confirmed events.
  function syncTicketMatches() {
    const select = byId("ticketMatch");
    if (!select) return;
    let actualMatches = [];
    try {
      if (typeof matches !== "undefined" && Array.isArray(matches)) actualMatches = matches;
    } catch (_) { actualMatches = []; }
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    const upcoming = actualMatches.filter(m => m && m.id && m.date && m.date >= todayString && m.matchEnded !== true);
    const previousValue = select.value;
    select.replaceChildren();
    if (!upcoming.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No verified upcoming matches available";
      select.appendChild(option);
      select.disabled = true;
      const venue = byId("ticketVenue");
      if (venue) venue.textContent = "Venue unavailable";
      return;
    }
    select.disabled = false;
    upcoming.forEach(m => {
      const option = document.createElement("option");
      option.value = String(m.id);
      option.textContent = `${m.team1 || "Team 1"} vs ${m.team2 || "Team 2"} — ${m.date}`;
      select.appendChild(option);
    });
    if (upcoming.some(m => String(m.id) === previousValue)) select.value = previousValue;
    window.updateTicketVenue();
  }

  window.updateTicketVenue = function () {
    const select = byId("ticketMatch");
    const venue = byId("ticketVenue");
    if (!select || !venue) return;
    let selected = null;
    try { if (typeof matches !== "undefined") selected = matches.find(m => String(m.id) === String(select.value)); } catch (_) {}
    venue.textContent = selected && selected.venue ? selected.venue : "Venue not provided by the match data source";
  };

  const matchList = byId("matchList");
  if (matchList && typeof MutationObserver !== "undefined") {
    new MutationObserver(syncTicketMatches).observe(matchList, { childList: true, subtree: true });
  }
  syncTicketMatches();

  // Replace the simulated payment flow with a transparent search for ticket providers.
  // This does not claim to reserve seats or process payment.
  window.showPaymentPage = function () {
    const select = byId("ticketMatch");
    if (!select || select.disabled || !select.value || select.selectedIndex < 0) {
      const message = byId("ticketBookingMessage");
      if (message) { message.style.display = "block"; message.textContent = "No verified upcoming match is available to search for right now."; }
      return;
    }
    const matchLabel = select.options[select.selectedIndex].textContent.trim();
    const venue = (byId("ticketVenue")?.textContent || "").trim();
    const query = `${matchLabel} ${venue} official cricket tickets`;
    const message = byId("ticketBookingMessage");
    if (message) {
      message.style.display = "block";
      message.textContent = "Opening ticket-provider search. Confirm the match, date, venue, and seller before paying; Sports IQ does not process bookings.";
    }
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank", "noopener,noreferrer");
  };
})();
