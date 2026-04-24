import fs from 'fs'
import path from 'path'

// Fallback sample data if meals.json doesn't exist yet
const FALLBACK = [
  { name: "Butter Chicken", location: "Centro", section: "Taste of Home", price: 8.99, calories: 291, protein: 35, fat: 13.8, sodium: 110, carbs: 4.1, halal: false, vegetarian: false, vegan: false, glutenFree: false },
  { name: "Carne Asada", location: "Centro", section: "Taste of Home", price: 8.99, calories: 247, protein: 26, fat: 9.75, sodium: 902, carbs: 9.4, halal: false, vegetarian: false, vegan: false, glutenFree: false },
  { name: "Sesame Sizzle Chicken", location: "Centro", section: "Taste of Home", price: 8.79, calories: 505, protein: 44, fat: 22.3, sodium: 256, carbs: 26.2, halal: false, vegetarian: false, vegan: false, glutenFree: false },
  { name: "Korean Fried Chicken", location: "Centro", section: "Taste of Home", price: 8.99, calories: 430, protein: 28, fat: 30.4, sodium: 1037, carbs: 11.9, halal: false, vegetarian: false, vegan: false, glutenFree: false },
  { name: "Centro Jerk Tofu", location: "Centro", section: "Taste of Home", price: 6.00, calories: 303, protein: 17, fat: 6.6, sodium: 74, carbs: 46.9, halal: true, vegetarian: true, vegan: true, glutenFree: false },
  { name: "Chicken Tikka Masala", location: "Centro", section: "Taste of Home", price: 8.99, calories: 549, protein: 25, fat: 23.2, sodium: 2349, carbs: 58.5, halal: false, vegetarian: false, vegan: false, glutenFree: false },
  { name: "Tandoori Chicken Leg", location: "Centro", section: "Taste of Home", price: 8.99, calories: 543, protein: 35, fat: 40.0, sodium: 584, carbs: 1.9, halal: false, vegetarian: false, vegan: false, glutenFree: true },
  { name: "Kimchi Tofu Noodle Bowl", location: "Centro", section: "Taste of Home", price: 9.95, calories: 575, protein: 26, fat: 12.5, sodium: 2871, carbs: 81.3, halal: true, vegetarian: true, vegan: true, glutenFree: false },
  { name: "General Tso Chicken", location: "Centro", section: "Taste of Home", price: 8.99, calories: 599, protein: 28, fat: 32.1, sodium: 271, carbs: 46.6, halal: false, vegetarian: false, vegan: false, glutenFree: false },
  { name: "Smoky Bbq Pork Ribs", location: "Centro", section: "Taste of Home", price: 11.99, calories: 688, protein: 34, fat: 50.4, sodium: 72, carbs: 22.4, halal: false, vegetarian: false, vegan: false, glutenFree: true },
  { name: "Smpl Chicken Biryani", location: "Centro", section: "Taste of Home", price: 8.99, calories: 692, protein: 35, fat: 45.0, sodium: 639, carbs: 25.2, halal: false, vegetarian: false, vegan: false, glutenFree: false },
]

export async function getMeals() {
  try {
    const filePath = path.join(process.cwd(), 'meals.json')
    if (!fs.existsSync(filePath)) {
      console.warn('meals.json not found — using fallback data. Run: npm run scrape')
      return FALLBACK
    }
    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw)
    // Handle both array format and {meals: [...]} format from scraper
    const meals = Array.isArray(data) ? data : data.meals
    return meals.filter(m => m.price && m.calories && m.protein)
  } catch (err) {
    console.error('Error loading meals.json:', err)
    return FALLBACK
  }
}
