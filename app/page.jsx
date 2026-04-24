import { getMeals } from '@/lib/meals'
import MacroMacApp from '@/components/MacroMacApp'

export default async function Home() {
  const meals = await getMeals()
  return <MacroMacApp meals={meals} />
}
