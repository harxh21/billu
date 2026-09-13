export default function LoadingSpinner({ size = 24 }) {
  return (
    <div className="flex items-center justify-center py-8">
      <div
        className="animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
