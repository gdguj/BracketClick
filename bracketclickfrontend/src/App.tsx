import { useState } from 'react';

/**
 * Main App Component - BracketClick Photo Booth UI
 *
 * This component provides the user interface for a photo booth application.
 * Users can select a frame, enter their email, and prepare to take photos
 * using hand gesture recognition.
 */
function App() {
  // State to track which frame (1, 2, or 3) the user has selected
  const [selectedFrame, setSelectedFrame] = useState<number | null>(null);

  // State for the email input field value
  const [email, setEmail] = useState('');

  // State to store the email after user confirms by pressing Enter
  const [savedEmail, setSavedEmail] = useState('');

  /**
   * Handle email confirmation when user presses Enter key
   * Saves the email to savedEmail state if the input is not empty
   */
  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && email.trim()) {
      setSavedEmail(email);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header section with app title */}
      <header className="py-8 border-b border-gray-100">
        <h1 className="text-4xl font-bold text-center text-gray-800">
          BracketClick Photo Booth
        </h1>
      </header>

      {/* Main content area */}
      <main className="container mx-auto px-6 py-8">
        {/* Two-column layout: controls on left, camera preview on right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-180px)]">
          {/* Left column: User controls and options */}
          <div className="flex flex-col space-y-6">
            {/* Instruction banner explaining gesture controls */}
            <div className="rounded-full px-8 py-4" style={{ backgroundColor: '#4285F4' }}>
              <p className="text-base text-white text-center font-normal">
                Make <span className="font-semibold">&lt; &gt;</span> gestures with both hands to start the countdown.
              </p>
            </div>

            {/* Frame selection section */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Choose Frame</h2>
              {/* Grid layout displaying 3 frame options */}
              <div className="grid grid-cols-3 gap-4">
                {/* Map through frames 1, 2, and 3 to create selection buttons */}
                {[1, 2, 3].map((frame) => (
                  <button
                    key={frame}
                    onClick={() => setSelectedFrame(frame)}
                    // Dynamic styling: selected frame gets blue border and background
                    className={`aspect-video rounded-lg border-2 transition-all hover:scale-105 overflow-hidden ${
                      selectedFrame === frame
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                    }`}
                    aria-label={`Select frame ${frame}`}
                  >
                    {/* Display frame preview image (Frame1.svg for frame 1, frame2.svg and frame3.svg for others) */}
                    <img
                      src={`/frames/${frame === 1 ? 'Frame1' : `frame${frame}`}.svg`}
                      alt={`Frame ${frame}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Email input section */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <label htmlFor="email" className="block text-lg font-semibold text-gray-800 mb-3">
                Enter Email
              </label>
              {/* Email input field with Enter key handler to save email */}
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleEmailKeyDown}
                placeholder="example@email.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>

            {/* Status display section showing waiting state and saved email */}
            <div className="flex-1 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 border border-gray-200 shadow-sm flex flex-col items-center justify-center relative">
              <p className="text-2xl font-semibold text-gray-800">Waiting…</p>
              {/* Display saved email at bottom of status box if one exists */}
              {savedEmail && (
                <p className="absolute bottom-4 text-xs text-gray-400">{savedEmail}</p>
              )}
            </div>
          </div>

          {/* Right column: Camera preview area — stream from Flask backend */}
          <div className="flex items-center justify-center">
            <div className="relative w-full aspect-video bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
              <img
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/video_feed`}
                alt="Camera feed"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;