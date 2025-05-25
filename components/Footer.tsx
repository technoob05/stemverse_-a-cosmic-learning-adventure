import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-6 px-4 bg-[var(--bg-secondary)] border-t border-[var(--card-border)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-2xl mr-2 cosmic-title text-glow">🌠</span>
              <h3 className="text-xl font-bold cosmic-title text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">STEMverse</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              A cosmic learning adventure through mathematics, ecology, and coding. Explore planets, solve challenges, and earn rewards.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">
                  Space Hub
                </a>
              </li>
              <li>
                <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">
                  Mathos Planet
                </a>
              </li>
              <li>
                <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">
                  Veridia Planet
                </a>
              </li>
              <li>
                <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">
                  Cyberia Planet
                </a>
              </li>
            </ul>
          </div>
          
          {/* Credits */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">About</h4>
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              Created for educational purposes using modern web technologies.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-[var(--card-border)] flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} STEMverse - A Cosmic Learning Adventure
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-2 md:mt-0">
            Powered by React, Tailwind CSS, and the Gemini API
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 