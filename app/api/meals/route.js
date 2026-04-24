import { getMeals } from '@/lib/meals'

export async function GET() {
  const meals = await getMeals()
  return Response.json({ meals, count: meals.length, updatedAt: new Date().toISOString() })
}
