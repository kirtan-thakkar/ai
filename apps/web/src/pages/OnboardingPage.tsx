import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { 
  Heart, 
  Slash, 
  ArrowRight,
  Search,
  Sparkles
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const [taxonomies, setTaxonomies] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInterests, setSelectedInterests] = useState<Record<string, { preference: 'like' | 'avoid', weight: number, value: string, category: string }>>({});
  const [searchFilter, setSearchFilter] = useState('');
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTaxonomy = async () => {
      try {
        const res = await authApi.getTaxonomies();
        setTaxonomies(res.data);

        // Pre-fill if already existing
        const meRes = await authApi.getInterests();
        if (meRes.data?.interests) {
          const map: any = {};
          meRes.data.interests.forEach((item: any) => {
            map[item.id || item.value] = item;
          });
          setSelectedInterests(map);
        }
      } catch (err) {
        console.error('Taxonomy load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTaxonomy();
  }, []);

  const setPreference = (item: any, pref: 'like' | 'avoid' | 'neutral') => {
    const key = item.id || item.value;
    const copy = { ...selectedInterests };

    if (pref === 'neutral') {
      delete copy[key];
    } else {
      copy[key] = {
        category: item.category || 'interest',
        value: item.value || item.name,
        preference: pref,
        weight: pref === 'like' ? 0.85 : 0.15
      };
    }
    setSelectedInterests(copy);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = Object.entries(selectedInterests).map(([id, data]) => ({
        id,
        category: data.category,
        value: data.value,
        preference: data.preference,
        weight: data.weight,
        source: 'onboarding'
      }));

      await authApi.saveInterests(payload);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving onboarding interests:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-[#f24c27] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#888896] mono">Loading knowledge taxonomy...</p>
      </div>
    );
  }

  const selectedCount = Object.keys(selectedInterests).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      
      {/* Header (Ahmedabad OS Style) */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-white">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f24c27] animate-pulse" />
          <span className="tracked-caps text-[#f24c27]">Taste Calibration</span>
          <span className="text-white/20">|</span>
          <span className="text-[#a0a0ab] font-light">Knowledge Representation Taxonomy (F-02)</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Personalize Your Taste Profile</h1>
        <p className="text-xs sm:text-sm text-[#888896] max-w-lg mx-auto font-light leading-relaxed">
          Select what you love (and what you'd like to avoid). We use semantic taxonomies to seed your initial Bayesian recommendation priors.
        </p>
      </div>

      {/* Search Bar (EvoAir Floating Pill) */}
      <div className="relative max-w-md mx-auto">
        <Search className="w-4 h-4 text-[#666675] absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filter genres, franchises, or topics..."
          className="w-full evocuir-glass-pill pl-11 pr-4 py-3 text-xs text-white placeholder-[#555562] focus:outline-none focus:border-[#f24c27] bg-[#0c0c12] transition"
        />
      </div>

      {/* Hierarchical Categories */}
      <div className="space-y-6">
        {taxonomies?.categories?.map((cat: any) => (
          <div key={cat.id} className="evo-card p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f24c27]" />
              <span>{cat.name}</span>
            </h2>

            <div className="space-y-4">
              {cat.children?.map((subCat: any) => (
                <div key={subCat.id} className="space-y-2">
                  <h3 className="tracked-caps text-[#777785]">
                    {subCat.name}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {subCat.children
                      ?.filter((item: any) => 
                        !searchFilter || 
                        item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        item.value?.toLowerCase().includes(searchFilter.toLowerCase())
                      )
                      .map((item: any) => {
                        const key = item.id || item.value;
                        const currentPref = selectedInterests[key]?.preference;

                        return (
                          <div
                            key={key}
                            className={`flex items-center justify-between p-3 rounded-2xl border text-xs transition ${
                              currentPref === 'like'
                                ? 'bg-[#f24c27]/10 border-[#f24c27]/40 text-white'
                                : currentPref === 'avoid'
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                                : 'bento-box text-[#a0a0ab]'
                            }`}
                          >
                            <span className="font-medium truncate pr-2">{item.name}</span>

                            <div className="flex items-center gap-1 shrink-0">
                              {/* Like button */}
                              <button
                                type="button"
                                onClick={() => setPreference(item, currentPref === 'like' ? 'neutral' : 'like')}
                                className={`w-7 h-7 rounded-full flex items-center justify-center border transition ${
                                  currentPref === 'like'
                                    ? 'bg-[#f24c27] text-white border-[#f24c27] shadow-sm'
                                    : 'evocuir-glass-pill text-[#777785] hover:text-[#f24c27]'
                                }`}
                                title="Love this"
                              >
                                <Heart className={`w-3.5 h-3.5 ${currentPref === 'like' ? 'fill-current' : ''}`} />
                              </button>

                              {/* Avoid button */}
                              <button
                                type="button"
                                onClick={() => setPreference(item, currentPref === 'avoid' ? 'neutral' : 'avoid')}
                                className={`w-7 h-7 rounded-full flex items-center justify-center border transition ${
                                  currentPref === 'avoid'
                                    ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                                    : 'evocuir-glass-pill text-[#777785] hover:text-rose-400'
                                }`}
                                title="Avoid this"
                              >
                                <Slash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Save Footer (Ahmedabad OS Floating Pill) */}
      <div className="sticky bottom-6 evocuir-glass-nav p-4 flex items-center justify-between shadow-2xl backdrop-blur-2xl">
        <div className="text-xs text-[#888896] pl-2">
          <span className="font-bold text-white mono text-sm">{selectedCount}</span> preferences selected
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-evo-accent !text-xs !py-2.5 !px-6 shadow-lg disabled:opacity-50"
        >
          <span>{saving ? 'Saving...' : 'Finish & Open Dashboard'}</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};
