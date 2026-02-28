import { useState } from 'react';

function App() {
  const [selectedFrame, setSelectedFrame] = useState<number | null>(null);
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-white">
      <header className="py-8 border-b border-gray-100">
        <h1 className="text-4xl font-bold text-center text-gray-800">
          BracketClick Photo Booth
        </h1>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-180px)]">
          <div className="flex flex-col space-y-6">
            <div className="rounded-full px-8 py-4" style={{ backgroundColor: '#4285F4' }}>
              <p className="text-base text-white text-center font-normal">
                Make <span className="font-semibold">&lt; &gt;</span> gestures with both hands to start the countdown.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Choose Frame</h2>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((frame) => (
                  <button
                    key={frame}
                    onClick={() => setSelectedFrame(frame)}
                    className={`aspect-video rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedFrame === frame
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                    }`}
                    aria-label={`Select frame ${frame}`}
                  >
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      Frame {frame}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <label htmlFor="email" className="block text-lg font-semibold text-gray-800 mb-3">
                Enter Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>

            <div className="flex-1 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 border border-gray-200 shadow-sm flex items-center justify-center">
              <p className="text-2xl font-semibold text-gray-800">Waiting…</p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-full aspect-video bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 border-2 border-gray-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm">Camera feed will appear here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
