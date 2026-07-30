export default function Loading() {
  return (
    <main className="flex-grow pt-24 px-gutter max-w-container-max mx-auto w-full min-h-[calc(100vh-160px)]">
      <div className="mb-8">
        <div className="h-10 w-64 bg-white/10 rounded animate-pulse mb-3"></div>
        <div className="h-5 w-96 bg-white/5 rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="flex flex-col animate-pulse">
            <div className="aspect-[2/3] bg-white/10 rounded-xl mb-4"></div>
            <div className="h-5 bg-white/10 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-white/5 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    </main>
  );
}
