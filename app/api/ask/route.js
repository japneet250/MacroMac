import { getMeals } from '@/lib/meals'

// Smart rule-based AI fallback — works with zero API key
function smartFallback(question, meals) {
  const q = question.toLowerCase()

  // Parse budget from question
  const budgetMatch = q.match(/\$?(\d+)\s*(dollar|bucks?)?/)
  const budget = budgetMatch ? parseFloat(budgetMatch[1]) : null

  // Parse protein from question
  const proteinMatch = q.match(/(\d+)\s*g?\s*protein/)
  const protein = proteinMatch ? parseFloat(proteinMatch[1]) : null

  // Parse calories from question
  const calMatch = q.match(/(\d+)\s*(cal|calories)/)
  const maxCal = calMatch ? parseFloat(calMatch[1]) : null

  // Detect dietary preferences
  const wantsHalal = q.includes('halal')
  const wantsVeg = q.includes('veg') || q.includes('vegetarian')
  const wantsVegan = q.includes('vegan')
  const wantsGF = q.includes('gluten')
  const wantsHighProtein = q.includes('protein') || q.includes('gains') || q.includes('muscle')
  const wantsCheap = q.includes('cheap') || q.includes('budget') || q.includes('affordable') || q.includes('broke')
  const wantsLowCal = q.includes('low cal') || q.includes('diet') || q.includes('light')

  // Filter meals
  let filtered = meals.filter(m => m.price && m.calories && m.protein)
  if (budget) filtered = filtered.filter(m => m.price <= budget)
  if (protein) filtered = filtered.filter(m => m.protein >= protein)
  if (maxCal) filtered = filtered.filter(m => m.calories <= maxCal)
  if (wantsHalal) filtered = filtered.filter(m => m.halal)
  if (wantsVegan) filtered = filtered.filter(m => m.vegan)
  else if (wantsVeg) filtered = filtered.filter(m => m.vegetarian)
  if (wantsGF) filtered = filtered.filter(m => m.glutenFree)

  if (filtered.length === 0) {
    return "I couldn't find meals matching all your criteria. Try loosening your budget or calorie limit using the filters above!"
  }

  // Sort based on intent
  if (wantsHighProtein) {
    filtered.sort((a, b) => (b.protein / b.price) - (a.protein / a.price))
  } else if (wantsCheap) {
    filtered.sort((a, b) => a.price - b.price)
  } else if (wantsLowCal) {
    filtered.sort((a, b) => a.calories - b.calories)
  } else {
    filtered.sort((a, b) => (b.protein / b.price) - (a.protein / a.price))
  }

  const top = filtered.slice(0, 3)
  const recs = top.map((m, i) =>
    `${i + 1}. ${m.name} @ ${m.location} — $${m.price}, ${m.protein}g protein, ${m.calories} cal`
  ).join('\n')

  const context = budget ? ` under $${budget}` : ''
  const proteinCtx = protein ? ` with ${protein}g+ protein` : ''
  const tagCtx = wantsHalal ? ' (halal)' : wantsVegan ? ' (vegan)' : wantsVeg ? ' (vegetarian)' : ''

  return `Here are your best options${context}${proteinCtx}${tagCtx}:\n\n${recs}\n\nUse the filters above to explore more!`
}

export async function POST(request) {
  try {
    const { question } = await request.json()
    if (!question?.trim()) {
      return Response.json({ error: 'No question provided' }, { status: 400 })
    }

    const meals = await getMeals()

    // Try Claude API first if key exists
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey && apiKey !== 'your_api_key_here') {
      try {
        const { default: Anthropic } = await import('@anthropic-ai/sdk')
        const client = new Anthropic({ apiKey })

        const menuSummary = meals.slice(0, 80).map(m =>
          `${m.name} @ ${m.location}: $${m.price}, ${m.calories}cal, ${m.protein}g protein` +
          `${m.halal ? ', halal' : ''}${m.vegetarian ? ', vegetarian' : ''}${m.vegan ? ', vegan' : ''}`
        ).join('\n')

        const message = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 250,
          system: `You are MacroMac, a friendly AI for McMaster students finding campus meals. Be casual and concise. Always recommend specific meals by name. Today's menu:\n\n${menuSummary}\n\nKeep responses under 80 words. No markdown.`,
          messages: [{ role: 'user', content: question }],
        })

        const text = message.content.find(b => b.type === 'text')?.text
        if (text) return Response.json({ answer: text })
      } catch (err) {
        console.warn('Claude API failed, using fallback:', err.message)
      }
    }

    // Smart rule-based fallback — always works, no API key needed
    const answer = smartFallback(question, meals)
    return Response.json({ answer })

  } catch (err) {
    console.error('AI route error:', err)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
