'use client'
import { useState, useMemo } from 'react'

export default function MacroMacApp({ meals }) {
  // Filter state
  const [budget, setBudget] = useState(15)
  const [minProtein, setMinProtein] = useState(20)
  const [maxCalories, setMaxCalories] = useState(700)
  const [location, setLocation] = useState('all')
  const [tags, setTags] = useState({ halal: false, vegetarian: false, vegan: false, glutenFree: false })
  const [sort, setSort] = useState('value')
  const [searched, setSearched] = useState(false)

  // AI state
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiAnswer, setAiAnswer] = useState('Ask me anything — "best high protein lunch under $12" or "halal options under 600 cal"')
  const [aiLoading, setAiLoading] = useState(false)

  // Unique locations from data
  const locations = useMemo(() => {
    const locs = [...new Set(meals.map(m => m.location))].sort()
    return locs
  }, [meals])

  // Scoring function
  const valueScore = (m) => Math.round((m.protein / m.price) * 10)

  // Filter + sort
  const results = useMemo(() => {
    if (!searched) return []
    let filtered = meals.filter(m => {
      if (m.price > budget) return false
      if (m.protein < minProtein) return false
      if (m.calories > maxCalories) return false
      if (location !== 'all' && m.location !== location) return false
      if (tags.halal && !m.halal) return false
      if (tags.vegetarian && !m.vegetarian) return false
      if (tags.vegan && !m.vegan) return false
      if (tags.glutenFree && !m.glutenFree) return false
      return true
    })

    filtered.sort((a, b) => {
      if (sort === 'value') return valueScore(b) - valueScore(a)
      if (sort === 'protein') return b.protein - a.protein
      if (sort === 'price') return a.price - b.price
      if (sort === 'calories') return a.calories - b.calories
      return 0
    })

    return filtered
  }, [searched, meals, budget, minProtein, maxCalories, location, tags, sort])

  const toggleTag = (t) => setTags(prev => ({ ...prev, [t]: !prev[t] }))

  const askAI = async () => {
    if (!aiQuestion.trim() || aiLoading) return
    setAiLoading(true)
    setAiAnswer('')
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: aiQuestion }),
      })
      const data = await res.json()
      setAiAnswer(data.answer || data.error || 'Something went wrong.')
    } catch {
      setAiAnswer('AI unavailable right now. Use the filters below!')
    }
    setAiLoading(false)
    setAiQuestion('')
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '1.5rem 1rem', paddingBottom: '3rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '0.25rem' }}>
        <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Macro<span style={{ color: 'var(--accent)' }}>Mac</span>
        </h1>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '2rem', fontWeight: 300 }}>
        Find the best meals on McMaster campus — filtered by your macros & budget
      </p>

      {/* AI Assistant */}
      <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '1.2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.5rem' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', fontWeight: 700 }}>
            AI Meal Assistant
          </span>
        </div>
        <p style={{ fontSize: '0.85rem', color: aiAnswer ? '#aaa' : 'var(--muted)', lineHeight: 1.6, marginBottom: '0.75rem', minHeight: 40 }}>
          {aiLoading ? '...' : aiAnswer}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={aiQuestion}
            onChange={e => setAiQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && askAI()}
            placeholder="What should I eat today?"
            disabled={aiLoading}
            style={{
              flex: 1, background: '#111', border: '0.5px solid var(--border)', borderRadius: 8,
              padding: '8px 12px', color: 'var(--text)', fontFamily: 'inherit', fontSize: 13, outline: 'none'
            }}
          />
          <button
            onClick={askAI}
            disabled={aiLoading}
            style={{
              background: 'var(--accent)', color: '#0f0f0f', border: 'none', borderRadius: 8,
              padding: '8px 14px', fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', whiteSpace: 'nowrap', opacity: aiLoading ? 0.6 : 1
            }}
          >
            Ask ↗
          </button>
        </div>
      </div>

      {/* Controls */}
      <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

          <SliderControl label="Max budget" value={budget} setValue={setBudget} min={5} max={25} step={1} prefix="$" />
          <SliderControl label="Min protein (g)" value={minProtein} setValue={setMinProtein} min={0} max={60} step={5} suffix="g" />
          <SliderControl label="Max calories" value={maxCalories} setValue={setMaxCalories} min={200} max={1200} step={50} />

          <div>
            <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', fontWeight: 500, display: 'block', marginBottom: 8 }}>
              Location
            </label>
            <select value={location} onChange={e => setLocation(e.target.value)}>
              <option value="all">All campus</option>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Diet tags */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: '0.75rem' }}>
          {[
            { key: 'halal', label: 'Halal' },
            { key: 'vegetarian', label: 'Vegetarian' },
            { key: 'vegan', label: 'Vegan' },
            { key: 'glutenFree', label: 'Gluten Free' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggleTag(key)}
              style={{
                padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 500,
                border: tags[key] ? '0.5px solid var(--accent)' : '0.5px solid var(--border)',
                background: tags[key] ? 'var(--accent)' : '#111',
                color: tags[key] ? '#0f0f0f' : 'var(--muted)',
                cursor: 'pointer', transition: 'all 0.15s'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setSearched(true)}
          style={{
            width: '100%', marginTop: '1rem', padding: '14px',
            background: 'var(--accent)', color: '#0f0f0f', border: 'none', borderRadius: 12,
            fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700,
            cursor: 'pointer', letterSpacing: '0.01em', transition: 'opacity 0.15s'
          }}
        >
          Find My Meals
        </button>
      </div>

      {/* Results */}
      {searched && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span className="font-display" style={{ fontSize: '1rem', fontWeight: 700 }}>
              {results.length > 0 ? 'Top Meals' : 'No results'}
            </span>
            <span style={{ fontSize: 12, background: 'var(--surface)', border: '0.5px solid var(--border)', padding: '3px 10px', borderRadius: 100, color: 'var(--muted)' }}>
              {results.length} found
            </span>
          </div>

          {/* Sort buttons */}
          {results.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
              {[
                { key: 'value', label: 'Best value' },
                { key: 'protein', label: 'Most protein' },
                { key: 'price', label: 'Cheapest' },
                { key: 'calories', label: 'Lowest cal' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  style={{
                    padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    border: sort === key ? '0.5px solid var(--accent)' : '0.5px solid var(--border)',
                    background: sort === key ? 'var(--surface)' : '#111',
                    color: sort === key ? 'var(--accent)' : 'var(--muted)',
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤷</div>
              <p style={{ fontSize: '0.9rem' }}>No meals match your filters. Try loosening your budget or calorie limit.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {results.map((meal, i) => (
                <MealCard key={`${meal.name}-${meal.location}-${i}`} meal={meal} isTop={i === 0} score={valueScore(meal)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '2rem', fontSize: 11, color: '#333', textAlign: 'center' }}>
        {/* Data sourced from{' '}
        <a href="https://macnutrition.mcmaster.ca" target="_blank" rel="noopener noreferrer" style={{ color: '#444' }}>
          macnutrition.mcmaster.ca
        </a> */}
        {' '}· Updated daily · Built for Mac students By a Mac Student 🦅
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </main>
  )
}

function SliderControl({ label, value, setValue, min, max, step, prefix = '', suffix = '' }) {
  return (
    <div>
      <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', fontWeight: 500, display: 'block', marginBottom: 8 }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input type="range" min={min} max={max} step={step} value={value} onChange={e => setValue(Number(e.target.value))} style={{ flex: 1 }} />
        <span className="font-display" style={{ fontSize: '1rem', fontWeight: 700, minWidth: 52, color: 'var(--accent)', textAlign: 'right' }}>
          {prefix}{value}{suffix}
        </span>
      </div>
    </div>
  )
}

function MealCard({ meal, isTop, score }) {
  const badges = []
  if (meal.halal) badges.push({ label: 'Halal', bg: '#052a1a', color: '#4ade80', border: '#166534' })
  if (meal.vegetarian) badges.push({ label: 'Veg', bg: '#1a2e05', color: '#a3e635', border: '#3f6212' })
  if (meal.vegan) badges.push({ label: 'Vegan', bg: '#1a2e05', color: '#a3e635', border: '#3f6212' })
  if (meal.glutenFree) badges.push({ label: 'GF', bg: '#1a1a2e', color: '#a5b4fc', border: '#3730a3' })

  return (
    <div style={{
      background: 'var(--surface)', border: `0.5px solid ${isTop ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 14, padding: '1.1rem 1.25rem', position: 'relative', overflow: 'hidden', transition: 'border-color 0.15s'
    }}>
      {isTop && (
        <div style={{
          position: 'absolute', top: 0, right: 0, background: 'var(--accent)', color: '#0f0f0f',
          fontSize: 10, fontWeight: 700, padding: '3px 10px', borderBottomLeftRadius: 10,
          letterSpacing: '0.06em', textTransform: 'uppercase'
        }}>
          Top Pick
        </div>
      )}

      <div className="font-display" style={{ fontWeight: 700, fontSize: '1rem', paddingRight: 70, marginBottom: 2 }}>
        {meal.name}
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: '0.9rem' }}>
        {meal.location} · {meal.section}
      </div>

      <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
        <Stat label="Price" value={`$${meal.price.toFixed(2)}`} color="var(--accent)" />
        <Stat label="Protein" value={`${meal.protein}g`} color="var(--protein)" />
        <Stat label="Calories" value={meal.calories} color="var(--calories)" />
        <div style={{ marginLeft: 'auto', background: '#0f0f0f', border: '0.5px solid var(--border)', borderRadius: 100, padding: '4px 10px', textAlign: 'center' }}>
          <div className="font-display" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)' }}>{score}</div>
          <div style={{ fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: '0.06em' }}>value</div>
        </div>
      </div>

      {badges.length > 0 && (
        <div style={{ display: 'flex', gap: 5, marginTop: '0.75rem', flexWrap: 'wrap' }}>
          {badges.map((b, i) => (
            <span key={i} style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 100, fontWeight: 500,
              background: b.bg, color: b.color, border: `0.5px solid ${b.border}`
            }}>
              {b.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <div className="font-display" style={{ fontSize: '1.05rem', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  )
}
