import { useState } from 'react';
import { categories } from '../data/categoryRegistry';
import { getAllProblems } from '../data/practiceProblems';
import ProblemList from '../components/practice/ProblemList';

export default function PracticePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');

  const allProblems = getAllProblems();
  const filtered = allProblems.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (difficulty !== 'all' && p.difficulty !== difficulty) return false;
    return true;
  });

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-zinc-800 flex items-center justify-center">
            <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Practice Problems</h1>
            <p className="text-gray-400 text-sm">Curated problems for each algorithm category</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.slug} value={cat.slug}>{cat.name}</option>
          ))}
        </select>

        <select
          value={difficulty}
          onChange={e => setDifficulty(e.target.value)}
          className="px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all"
        >
          <option value="all">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <div className="flex items-center ml-auto">
          <span className="text-sm text-gray-500 font-medium">{filtered.length} problems</span>
        </div>
      </div>

      <ProblemList problems={filtered} />
    </div>
  );
}
