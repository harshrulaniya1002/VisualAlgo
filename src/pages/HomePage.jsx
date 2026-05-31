import { Link } from 'react-router-dom';
import { categories } from '../data/categoryRegistry';
import { algorithmsByCategory } from '../data/algorithmRegistry';
import SortingHeroAnimation from '../components/home/SortingHeroAnimation';

const CATEGORY_GRADIENTS = {
  blue: 'from-blue-500/20 to-blue-600/5',
  green: 'from-green-500/20 to-green-600/5',
  cyan: 'from-cyan-500/20 to-cyan-600/5',
  teal: 'from-teal-500/20 to-teal-600/5',
  indigo: 'from-indigo-500/20 to-indigo-600/5',
  violet: 'from-violet-500/20 to-violet-600/5',
  emerald: 'from-emerald-500/20 to-emerald-600/5',
  lime: 'from-lime-500/20 to-lime-600/5',
  amber: 'from-amber-500/20 to-amber-600/5',
  orange: 'from-orange-500/20 to-orange-600/5',
  red: 'from-red-500/20 to-red-600/5',
  rose: 'from-rose-500/20 to-rose-600/5',
  sky: 'from-sky-500/20 to-sky-600/5',
  purple: 'from-purple-500/20 to-purple-600/5',
  yellow: 'from-yellow-500/20 to-yellow-600/5',
  fuchsia: 'from-fuchsia-500/20 to-fuchsia-600/5',
  pink: 'from-pink-500/20 to-pink-600/5',
  slate: 'from-slate-500/20 to-slate-600/5',
  stone: 'from-stone-500/20 to-stone-600/5',
  zinc: 'from-zinc-500/20 to-zinc-600/5',
  neutral: 'from-neutral-500/20 to-neutral-600/5',
  gray: 'from-gray-500/20 to-gray-600/5',
};

const CATEGORY_ACCENTS = {
  blue: 'text-blue-400 group-hover:text-blue-300',
  green: 'text-green-400 group-hover:text-green-300',
  cyan: 'text-cyan-400 group-hover:text-cyan-300',
  teal: 'text-teal-400 group-hover:text-teal-300',
  indigo: 'text-indigo-400 group-hover:text-indigo-300',
  violet: 'text-violet-400 group-hover:text-violet-300',
  emerald: 'text-emerald-400 group-hover:text-emerald-300',
  lime: 'text-lime-400 group-hover:text-lime-300',
  amber: 'text-amber-400 group-hover:text-amber-300',
  orange: 'text-orange-400 group-hover:text-orange-300',
  red: 'text-red-400 group-hover:text-red-300',
  rose: 'text-rose-400 group-hover:text-rose-300',
  sky: 'text-sky-400 group-hover:text-sky-300',
  purple: 'text-purple-400 group-hover:text-purple-300',
  yellow: 'text-yellow-400 group-hover:text-yellow-300',
  fuchsia: 'text-fuchsia-400 group-hover:text-fuchsia-300',
  pink: 'text-pink-400 group-hover:text-pink-300',
  slate: 'text-slate-400 group-hover:text-slate-300',
  stone: 'text-stone-400 group-hover:text-stone-300',
  zinc: 'text-zinc-400 group-hover:text-zinc-300',
  neutral: 'text-neutral-400 group-hover:text-neutral-300',
  gray: 'text-gray-400 group-hover:text-gray-300',
};

const BAR_COLORS = {
  blue: 'bg-blue-500', green: 'bg-green-500', cyan: 'bg-cyan-500', teal: 'bg-teal-500',
  indigo: 'bg-indigo-500', violet: 'bg-violet-500', emerald: 'bg-emerald-500', lime: 'bg-lime-500',
  amber: 'bg-amber-500', orange: 'bg-orange-500', red: 'bg-red-500', rose: 'bg-rose-500',
  sky: 'bg-sky-500', purple: 'bg-purple-500', yellow: 'bg-yellow-500', fuchsia: 'bg-fuchsia-500',
  pink: 'bg-pink-500', slate: 'bg-slate-500', stone: 'bg-stone-500', zinc: 'bg-zinc-500',
  neutral: 'bg-neutral-500', gray: 'bg-gray-500',
};

export default function HomePage() {
  const totalAlgorithms = Object.values(algorithmsByCategory).flat().length;
  const implementedCount = Object.values(algorithmsByCategory).flat().filter(a => a.implemented).length;

  return (
    <div className="p-8 max-w-7xl mx-auto bg-dot-pattern min-h-full">
      <div className="text-center mb-16 animate-fade-in">
        <div className="inline-block mb-6">
          <div className="relative">
            <div className="rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 p-4 shadow-lg shadow-teal-500/10 animate-aurora-glow border theme-border">
              <SortingHeroAnimation />
            </div>
          </div>
        </div>

        <h1 className="text-6xl font-extrabold mb-4 tracking-tight">
          <span className="text-gradient">Visual</span><span className="text-zinc-900 dark:text-white">Algo</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Master Data Structures & Algorithms through interactive, step-by-step visualizations.
          <br className="hidden sm:block" />
          Understand the logic, see the execution, build real intuition.
        </p>

        <div className="flex justify-center gap-12 mt-10">
          {[
            { value: `${totalAlgorithms}+`, label: 'Algorithms', color: 'text-teal-400' },
            { value: categories.length, label: 'Categories', color: 'text-amber-400' },
            { value: implementedCount, label: 'Visualized', color: 'text-rose-400' },
          ].map((stat, i) => (
            <div key={stat.label} className={`text-center animate-fade-in stagger-${i + 1}`}>
              <div className={`text-4xl font-bold ${stat.color} tabular-nums`}>{stat.value}</div>
              <div className="text-sm text-zinc-500 mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat, index) => {
          const algos = algorithmsByCategory[cat.slug] || [];
          const implemented = algos.filter(a => a.implemented).length;
          const progress = algos.length > 0 ? (implemented / algos.length) * 100 : 0;

          return (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className={`group relative p-5 rounded-2xl glass-card card-hover animate-fade-in opacity-0`}
              style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'forwards' }}
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${CATEGORY_GRADIENTS[cat.color] || CATEGORY_GRADIENTS.blue} opacity-50 pointer-events-none`} />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <h3 className={`text-base font-semibold ${CATEGORY_ACCENTS[cat.color] || 'text-gray-200'} transition-colors`}>
                    {cat.name}
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed mb-4">{cat.description}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500 font-medium">{algos.length} algorithms</span>
                  {implemented > 0 && (
                    <span className="text-xs text-emerald-400 font-medium">{implemented} ready</span>
                  )}
                </div>
                <div className="h-1 theme-bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${BAR_COLORS[cat.color] || 'bg-blue-500'} rounded-full transition-all duration-700 opacity-80`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
