export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#18181b] to-[#020617]">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Rings */}
        <div className="relative w-16 h-16">
          <span className="absolute inset-0 rounded-full border-4 border-indigo-500/30 animate-ping" />
          <span className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>

        {/* Text */}
        <p className="text-gray-400 tracking-wider text-sm animate-pulse">
          Loading bookings...
        </p>
      </div>
    </div>
  );
}
