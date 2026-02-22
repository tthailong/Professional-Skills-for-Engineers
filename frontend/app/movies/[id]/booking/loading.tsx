export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-rose-50 to-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full border-4 border-rose-200 border-t-rose-600 animate-spin"></div>
        <p className="text-rose-600 font-semibold tracking-wide">
          Loading booking experience...
        </p>
      </div>
    </div>
  );
}
