"use client";

import { useState } from "react";
import { Navigation } from "../components/ui/Navigation";

export default function BuildAndBuy() {
  const [currentStep, setCurrentStep] = useState<'setup' | 'building' | 'cards' | 'purchase' | 'done'>('setup');
  const [teamName, setTeamName] = useState("");

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50">
        <Navigation 
          logo="Roster Frame"
          links={[
            { href: '/build-and-buy', label: 'Build & Buy' },
            { href: '/marketplace', label: 'Marketplace' },
            { href: '/collection', label: 'Collection' },
          ]}
        />
        
        <main className="container mx-auto px-4 py-8">
          <div className="h-16 md:h-20"></div>
          
          <h1 className="text-2xl font-bold text-amber-900 mb-4">Build Your Roster Frame</h1>
          <p>Current Step: {currentStep}</p>
          <p>Team Name: {teamName || 'Not set'}</p>
          
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter team name"
            className="px-4 py-2 border rounded"
          />
        </main>
      </div>
    </>
  );
}