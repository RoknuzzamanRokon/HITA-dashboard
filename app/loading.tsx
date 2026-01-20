export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        {/* Loading Spinner */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-spin">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading...</h2>
        <p className="text-gray-500">
          Please wait while we prepare your content
        </p>

        {/* Loading Animation Dots */}
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
