'use client';

import React from 'react';
import { CinematicEngine } from '@/components/CinematicEngine';
import { Chapter } from '@/components/CinematicEngine/types';
import { AboutUs } from '@/components/AboutUs';
import { Announcements } from '@/components/Announcements';
import { Events } from '@/components/Events';
import { ContributorsSection } from '@/components/Contributors';
import { JoinUs } from '@/components/JoinUs';

// Configuration Object for Chapters
// Reordering, adding, or removing items here automatically adapts the engine scroll ranges.
const CHAPTERS_CONFIG = [
  { 
    id: 'chapter-1', 
    title: 'Karnataka Awakens', 
    videoSrc: '/videos/chapter-1-karnataka-awakens.mp4',
    audioSrc: '/audio/chapter-1.mp3',
    audioVolume: 0.7 
  },
];

// Dynamically distribute progress intervals across configuration items
const chapters: Chapter[] = CHAPTERS_CONFIG.map((chap, index, arr) => {
  const step = 1 / arr.length;
  return {
    ...chap,
    startProgress: index * step,
    endProgress: (index + 1) * step,
  };
});

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: '#000' }}>
      {/* Cinematic scroll scrubber container */}
      <CinematicEngine chapters={chapters} hasCinematicVideos={true} />

      {/* Subsequent Website Sections */}
      <AboutUs />

      <Announcements />

      <Events />

      <ContributorsSection />

      <JoinUs />

      <style jsx>{`
        .page-section {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #080808;
          border-top: 1px solid #151515;
          padding: 4rem 2rem;
          box-sizing: border-box;
        }

        .page-section:nth-of-type(even) {
          background: #0c0c0c;
        }

        .section-content {
          max-width: 800px;
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
          font-family: system-ui, -apple-system, sans-serif;
        }

        .section-content h2 {
          font-size: 2.5rem;
          color: #ffffff;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
        }

        .section-content p {
          font-size: 1.1rem;
          line-height: 1.8;
          font-weight: 300;
        }
      `}</style>
    </main>
  );
}
