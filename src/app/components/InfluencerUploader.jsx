"use client";
import React, { useState } from "react";

const APPS_SCRIPT_WEBHOOK = "https://script.google.com/macros/s/AKfycbwP88F4_lmSzUm_O97dSe0MIAJlxQkxR0xnxxysbNCcDXXBoEJ0LGM9Gbg3zcFlgSgRZw/exec";

const InfluencerUploader = () => {
  const [sheetUrl, setSheetUrl] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Extracts the sheet ID from any valid Sheets URL
  const extractSheetId = (url) => {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  // Reads the published CSV from Google Sheets and extracts usernames (from Column A)
  const fetchUsernamesFromSheet = async (sheetId) => {
    const res = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`);
    const text = await res.text();
    const rows = text.trim().split("\n");
    const usernames = rows.map((row) => row.split(",")[0]); // Column A
    return usernames.slice(1); // Skip header row
  };

  const handleProcess = async () => {
    setLoading(true);
    setStatus("🔄 Reading usernames from sheet...");

    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      setStatus("❌ Invalid Google Sheet URL");
      setLoading(false);
      return;
    }

    try {
      const usernames = await fetchUsernamesFromSheet(sheetId);

      if (usernames.length === 0) {
        setStatus("⚠️ No usernames found in Sheet1 column A.");
        setLoading(false);
        return;
      }

      for (const username of usernames) {
        // ✅ POST call to /api/analyze
        const res = await fetch("https://ytubeinstadata.onrender.com/api/analyze-youtube", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });

        const data = await res.json();
        if (!data?.channel) continue;

        const row = [
          data.channel.title,
          data.channel.subscribers,
          data.performance.average_views,
          data.performance.engagement_rate,
          data.content.language.language,
          data.location.likely_city_or_state,
          data.demographics.gender_split.male,
          data.demographics.age_split["18_24"],
          new Date().toLocaleString(),
        ];

        // ✅ Send to Google Apps Script to append the row
        await fetch(APPS_SCRIPT_WEBHOOK, {
          method: "POST",
          body: JSON.stringify({ sheetId, row }),
          headers: { "Content-Type": "application/json" },
        });
      }

      setStatus("✅ All influencers processed and updated!");
    } catch (err) {
      console.error("Error:", err);
      setStatus("❌ Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">YouTube Sheet Uploader</h1>

      <input
        type="text"
        value={sheetUrl}
        onChange={(e) => setSheetUrl(e.target.value)}
        placeholder="Paste public Google Sheets URL"
        className="p-2 border rounded w-full max-w-md mb-4"
      />

      <button
        onClick={handleProcess}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Processing..." : "Analyze & Update Sheet"}
      </button>

      <p className="mt-4 text-center text-gray-700">{status}</p>
    </div>
  );
};

export default InfluencerUploader;
