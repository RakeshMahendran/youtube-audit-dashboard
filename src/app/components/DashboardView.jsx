"use client";
import React from "react";

const DashboardView = ({ data }) => {
  const { channel, performance, content, location, demographics } = data;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{channel?.title}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p><strong>📍 Country:</strong> {channel?.country}</p>
          <p><strong>👥 Subscribers:</strong> {channel?.subscribers.toLocaleString()}</p>
          <p><strong>📈 Avg Views:</strong> {performance?.average_views.toLocaleString()}</p>
          <p><strong>📊 Avg Reach:</strong> {performance?.average_estimated_reach.toLocaleString()}</p>
        </div>
        <div>
          <p><strong>🧠 Language:</strong> {content?.language.language}</p>
          <p><strong>🗺 Location:</strong> {location?.likely_city_or_state}</p>
          <p><strong>👨‍👩‍👧‍👦 Gender Split:</strong> {demographics?.gender_split.male} male / {demographics?.gender_split.female} female</p>
          <p><strong>🎯 Age 18–24:</strong> {demographics?.age_split["18_24"]}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;