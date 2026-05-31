const DIFFICULTY_COLORS = {
  Easy: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20',
  Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-500/20',
  Hard: 'text-red-400 bg-red-400/10 border-red-500/20',
};

function ProblemCard({ problem, index }) {
  return (
    <a
      href={problem.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 glass glass-border rounded-xl theme-hover-bg transition-all card-hover group animate-fade-in opacity-0"
      style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium theme-text-secondary group-hover:text-teal-500 transition-colors truncate">
              {problem.name}
            </h4>
            <svg className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{problem.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-gray-600 font-medium">{problem.platform}</span>
            {problem.number && (
              <span className="text-[10px] text-gray-600 font-mono">#{problem.number}</span>
            )}
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border flex-shrink-0 ${DIFFICULTY_COLORS[problem.difficulty] || 'text-gray-400 bg-gray-700 border-gray-600'}`}>
          {problem.difficulty}
        </span>
      </div>
    </a>
  );
}

export default function ProblemList({ problems = [], title }) {
  if (problems.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <svg className="w-10 h-10 mx-auto mb-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-sm">No practice problems available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {title && (
        <h3 className="text-sm font-semibold theme-text-secondary mb-3">{title}</h3>
      )}
      {problems.map((problem, i) => (
        <ProblemCard key={i} problem={problem} index={i} />
      ))}
    </div>
  );
}
