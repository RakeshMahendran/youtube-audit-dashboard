"use client";
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import DashboardView from "./DashboardView";

const APPS_SCRIPT_WEBHOOK = "https://script.google.com/macros/s/AKfycbwP88F4_lmSzUm_O97dSe0MIAJlxQkxR0xnxxysbNCcDXXBoEJ0LGM9Gbg3zcFlgSgRZw/exec";

const InfluencerUploader = () => {
  const [sheetUrl, setSheetUrl] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernames, setUsernames] = useState([]);
  const [analysisResults, setAnalysisResults] = useState({});
  const [activeUser, setActiveUser] = useState(null);

  const extractSheetId = (url) => {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const fetchUsernamesFromSheet = async (sheetId) => {
    const res = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`);
    const text = await res.text();
    const rows = text.trim().split("\n");
    const usernames = rows.map((row) => row.split(",")[0]);
    return usernames.slice(1);
  };

  const analyzeAllUsers = async (usernames, sheetId) => {
    const results = await Promise.all(
      usernames.map(async (username) => {
        try {
          const res = await fetch("http://localhost:5000/api/analyze-youtube", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
          });
          const data = await res.json();

          if (data?.channel) {
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

            await fetch(APPS_SCRIPT_WEBHOOK, {
              method: "POST",
              mode: "no-cors",
              body: JSON.stringify({ sheetId, row }),
              headers: {
                "Content-Type": "application/json",
              },
            });
          }

          return [username, data];
        } catch (error) {
          return [username, null];
        }
      })
    );

    return Object.fromEntries(results);
  };

  const handleProcess = async () => {
    setLoading(true);
    setStatus("🔄 Analyzing all usernames from sheet...");
  
    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      setStatus("❌ Invalid Google Sheet URL");
      setLoading(false);
      return;
    }
  
    try {
      const usernames = await fetchUsernamesFromSheet(sheetId);
      setUsernames(usernames);
  
      for (const username of usernames) {
        const res = await fetch("http://localhost:5000/api/analyze-youtube", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });
  
        const data = await res.json();
  
        setAnalysisResults((prev) => ({
          ...prev,
          [username]: data,
        }));
  
        if (data?.channel) {
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
  
          await fetch(APPS_SCRIPT_WEBHOOK, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify({ sheetId, row }),
            headers: {
              "Content-Type": "application/json",
            },
          });
        }
      }
  
      setStatus("✅ All influencers analyzed and sheet updated!");
    } catch (err) {
      console.error("Error:", err);
      setStatus("❌ Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-100 p-4 border-r">
        <h2 className="text-lg font-semibold mb-4">Influencers</h2>
        <Sidebar
          usernames={usernames}
          activeUser={activeUser}
          onSelectUser={setActiveUser}
        />
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-2">YouTube Sheet Analyzer</h1>

          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="Paste public Google Sheets URL"
              className="p-2 border rounded w-full"
            />
            <button
              onClick={handleProcess}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {loading ? "Processing..." : "Analyze All"}
            </button>
          </div>
          <p className="text-gray-700 text-sm">{status}</p>
        </div>

        {activeUser && analysisResults[activeUser] ? (
          <DashboardView data={analysisResults[activeUser]} />
        ) : (
          <p>Select an influencer from the sidebar to view their insights.</p>
        )}
      </main>
    </div>
  );
};

export default InfluencerUploader;