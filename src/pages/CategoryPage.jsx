import { useParams, Link } from 'react-router-dom';
import { getCategoryBySlug } from '../data/categoryRegistry';
import { getAlgorithmsByCategory } from '../data/algorithmRegistry';
import { getProblemsByCategory } from '../data/practiceProblems';
import ProblemList from '../components/practice/ProblemList';

export default function CategoryPage() {
  const { slug } = useParams();
  const category = getCategoryBySlug(slug);
  const algorithms = getAlgorithmsByCategory(slug);
  const problems = getProblemsByCategory(slug);

  if (!category) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Category not found.</p>
      </div>
    );
  }

  const implemented = algorithms.filter(a => a.implemented).length;
  const progress = algorithms.length > 0 ? (implemented / algorithms.length) * 100 : 0;

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500/20 to-rose-500/20 border border-zinc-800 flex items-center justify-center">
            <span className="text-2xl">{category.icon}</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold theme-text-primary">{category.name}</h1>
            <p className="theme-text-tertiary text-sm">{category.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden max-w-xs">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-amber-500 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 font-medium">{implemented}/{algorithms.length} visualized</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
        {algorithms.map((algo, index) => (
          <Link
            key={algo.slug}
            to={`/algo/${algo.slug}`}
            className={`group p-4 rounded-xl border transition-all card-hover animate-fade-in opacity-0 ${
              algo.implemented
                ? 'glass glass-border hover:border-teal-500/30'
                : 'glass glass-border opacity-60 hover:opacity-100'
            }`}
            style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'forwards' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${algo.implemented ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
                  <h3 className="text-sm font-semibold theme-text-secondary group-hover:text-teal-500 transition-colors truncate">
                    {algo.name}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 ml-4">{algo.description}</p>
              </div>
              {!algo.implemented && (
                <span className="text-[10px] text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full flex-shrink-0 font-medium">Soon</span>
              )}
            </div>

            <div className="flex gap-4 mt-3 ml-4 text-xs">
              <div>
                <span className="text-gray-600">Time </span>
                <span className="text-amber-400 font-mono">{algo.timeComplexity?.average || 'N/A'}</span>
              </div>
              <div>
                <span className="text-zinc-600">Space </span>
                <span className="text-teal-400 font-mono">{algo.spaceComplexity || 'N/A'}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {problems.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <h2 className="text-xl font-bold theme-text-primary mb-4">Practice Problems</h2>
          <ProblemList problems={problems} />
        </div>
      )}
    </div>
  );
}
