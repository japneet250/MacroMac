// MacroMac Scraper — McMaster Campus Nutrition
// Run from project root: npm run scrape
// Requires: npm install (cheerio + node-fetch already in package.json)

import fetch from 'node-fetch'
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'https://macnutrition.mcmaster.ca'

const MENUS = [
  { id: '2b63bb56-eb6e-43ff-8c91-c57938ad7af7', location: 'Bistro 2 Go', section: 'All Day Menu' },
  { id: '27e35faf-51f4-4890-86c4-e9205afb519b', location: 'Bistro 2 Go', section: 'Breakfast Menu' },
  { id: '3f72f1f2-ff49-443c-b011-3c536a01b31e', location: 'Bistro 2 Go', section: 'Prepped Grab and Go' },
  { id: '71f42897-4c57-4e78-a54c-2c3910b0069f', location: 'Café One', section: 'Bakery Items' },
  { id: 'd2cd137f-df46-44b0-9f46-89b30279f02d', location: 'Café One', section: 'Hot Grab and Go' },
  { id: 'c5c87358-22bf-4066-bbcc-3d79cd592a36', location: 'Café One', section: 'Prepped Grab and Go' },
  { id: 'fd862e99-46b9-4b04-a821-494348802c18', location: 'Centro', section: 'Bakery Items' },
  { id: '3e035aed-1f80-4c16-9a22-dda376a39fce', location: 'Centro', section: 'Centro Brunch' },
  { id: '72c4d0d3-6c5f-4a31-be7c-8bf24e466645', location: 'Centro', section: 'Centro Perk' },
  { id: '9204eed7-d87a-4864-b3a1-a21f204c814d', location: 'Centro', section: 'Crave' },
  { id: '9821a3d8-d52b-4673-ba85-a0676bc50384', location: 'Centro', section: 'Pas Noodle' },
  { id: '6e751380-ed57-4740-bfe0-9196bf0b6c7e', location: 'Centro', section: 'Perogi House' },
  { id: '50f20cb1-2ccc-4aae-a74f-0aed15446da5', location: 'Centro', section: 'Prepped Grab and Go' },
  { id: 'ab1069ca-a8fe-445c-9b8f-fae64cb36991', location: 'Centro', section: 'SMPL Rotational Menu' },
  { id: 'b653cb4c-ddce-4c31-9a35-5b8c892d8ef2', location: 'Centro', section: 'Steeltown Grille' },
  { id: '8df0c9fb-6a01-4077-b4ab-c165026dbaf2', location: 'Centro', section: 'Taste of Home' },
  { id: '1f9b0d73-0fb1-4fc9-88e9-5ab1952732c6', location: 'Centro', section: 'Chicken House' },
  { id: '563aed03-33d7-4001-8227-c4e9302659be', location: 'Centro', section: 'Smash House' },
  { id: 'aaab3334-5c8a-4c82-a5b3-629699597575', location: 'Centro', section: 'Waffle House' },
  { id: '5f552e62-3bd5-46ac-a1f3-644be25bbeda', location: 'Eco Bean - MUMC', section: 'Bakery Items' },
  { id: '82f4b766-a72d-42b1-8487-b4ce33793c70', location: 'Eco Bean - MUMC', section: 'Breakfast' },
  { id: 'b509867b-04a8-49fb-93b5-563d99ecb868', location: 'IAHS Café', section: 'Bakery Items' },
  { id: '97cedc7f-915c-433f-b60e-eb2a2bdcfca8', location: 'IAHS Café', section: "Capaletti's" },
  { id: '16fb6001-3ca2-4662-9689-138be93674f9', location: 'IAHS Café', section: 'Grab & Go' },
  { id: '1d455721-c2df-40a0-99bf-61e8e0664dc2', location: 'IAHS Café', section: 'Prepped Grab and Go' },
  { id: 'e364c529-9475-4079-8c25-82d45fc45a71', location: 'La Piazza', section: 'Bakery Items' },
  { id: 'f3a07995-75ee-40e1-9d49-ff29eb858cb4', location: 'La Piazza', section: 'Global Delights' },
  { id: '22a71a04-1545-4846-914f-d6ed475da911', location: 'La Piazza', section: 'Guacamole' },
  { id: 'a1711813-c227-4599-8c57-37476ec1098a', location: 'La Piazza', section: 'Hammertown' },
  { id: '58687867-5369-4ae4-8905-980d4d0252b1', location: 'La Piazza', section: 'Hot Grab and Go' },
  { id: 'ed676861-d51d-4076-8672-d15f8d794fde', location: 'La Piazza', section: 'Local Grille' },
  { id: 'b4471734-30b0-45a7-9c19-7071bb283b99', location: 'La Piazza', section: 'Noodle Bar' },
  { id: 'c4136d26-1ab5-4f0e-8b3e-1d685ad24057', location: 'La Piazza', section: 'Prepped' },
  { id: '121decb6-ffd8-4739-8bc6-bc45a3f1dbfc', location: 'La Piazza', section: 'Ramadan Pop-Up' },
  { id: '619d3b8f-22fd-4b6d-b211-27d7be615ca3', location: 'La Piazza', section: 'Tazij' },
  { id: 'fc0b5f45-d458-4fff-8e21-4284918e21bb', location: 'Reactor Café', section: 'All Day Menu' },
  { id: '0818d9ce-bb69-4cf3-87e9-73559ae1825c', location: 'Reactor Café', section: 'Baked Goods' },
  { id: 'b61ce7d0-c40f-44e2-92f9-5033214877b5', location: 'Reactor Café', section: 'Prepped Grab and Go' },
  { id: 'fa0aae74-2368-455b-911c-5c1fe8217b3d', location: 'Bistro @ MKR', section: 'Breakfast Classics' },
  { id: '76bd0359-74dc-4b8a-8ef5-b0347e400cc8', location: 'Bistro @ MKR', section: 'BYO Flatbread Pizza' },
  { id: 'f2fbac74-96f4-462b-96d9-58e519dae42a', location: 'Bistro @ MKR', section: 'BYO Tex Mex' },
  { id: 'b27f0bc9-9984-464a-8db6-68dc24bc7f78', location: 'Bistro @ MKR', section: 'Classics' },
  { id: '41848d0b-fb4f-407c-a8cc-2b3284d03d67', location: 'Bistro @ MKR', section: 'IL Forno' },
  { id: '43d561b0-f0a2-4db0-9c20-ee4d44065992', location: 'Bistro @ MKR', section: 'SMPL' },
  { id: 'd6e97c3f-4063-43f0-9a73-157afce3e296', location: 'Bistro @ MKR', section: 'The Wok' },
]

const HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'X-Requested-With': 'XMLHttpRequest',
  'Referer': `${BASE_URL}/Nutrition/ServiceMenuReport/Today`,
  'Origin': BASE_URL,
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': '*/*',
  'Accept-Language': 'en-CA,en;q=0.9',
}

// Nutrition cell order from the HTML:
// [0]Cal [1]Fat [2]SatFat [3]Cholesterol [4]Sodium [5]Carbs [6]Fibre [7]Sugars [8]PROTEIN
function parseNutrition($, row) {
  const cells = []
  $(row).find('td.nutCellOdd, td.nutCellEven').each((_, td) => {
    cells.push(parseFloat($(td).text().trim().replace(/,/g, '')) || 0)
  })
  return {
    calories: cells[0] ?? null,
    fat:      cells[1] ?? null,
    sodium:   cells[4] ?? null,
    carbs:    cells[5] ?? null,
    fibre:    cells[6] ?? null,
    sugars:   cells[7] ?? null,
    protein:  cells[8] ?? null,
  }
}

async function fetchSection(menu) {
  const res = await fetch(
    `${BASE_URL}/Nutrition/ServiceMenuReport/GetReport/${menu.id}`,
    { method: 'POST', headers: HEADERS, body: 'allergens=&tags=' }
  )
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const $ = cheerio.load(await res.text())
  const items = []
  let course = 'Main'

  $('tr').each((_, row) => {
    const header = $(row).find('td.courseHeader')
    if (header.length) { course = header.text().trim(); return }

    const desc = $(row).find('td.description')
    if (!desc.length) return

    const name = desc.text().trim()
    if (!name) return

    const price = parseFloat($(row).find('td.itemPrice').text().trim()) || null
    items.push({ name, location: menu.location, section: menu.section, course, price, ...parseNutrition($, row) })
  })

  return items
}

async function fetchTagged(menuId, tag) {
  const res = await fetch(
    `${BASE_URL}/Nutrition/ServiceMenuReport/FilterReport/${menuId}`,
    { method: 'POST', headers: HEADERS, body: `allergens=&tags=${encodeURIComponent(tag)}` }
  )
  if (!res.ok) return new Set()
  const $ = cheerio.load(await res.text())
  const names = new Set()
  $('td.description').each((_, el) => names.add($(el).text().trim()))
  return names
}

async function scrapeAll() {
  console.log('🚀 MacroMac Scraper — McMaster Campus Nutrition')
  console.log(`📅 ${new Date().toLocaleString()} | ${MENUS.length} sections to scrape\n`)

  const allMeals = []
  let ok = 0, fail = 0

  for (const menu of MENUS) {
    try {
      process.stdout.write(`  ${menu.location} — ${menu.section}... `)
      const items = await fetchSection(menu)

      if (items.length === 0) {
        console.log('(empty today)')
      } else {
        const [halalSet, vegSet, veganSet, gfSet] = await Promise.all([
          fetchTagged(menu.id, 'Halal'),
          fetchTagged(menu.id, 'Vegetarian'),
          fetchTagged(menu.id, 'Vegan'),
          fetchTagged(menu.id, 'Gluten Free'),
        ])
        for (const item of items) {
          item.halal       = halalSet.has(item.name)
          item.vegetarian  = vegSet.has(item.name)
          item.vegan       = veganSet.has(item.name)
          item.glutenFree  = gfSet.has(item.name)
          allMeals.push(item)
        }
        console.log(`✅ ${items.length} items`)
        ok++
      }
      await new Promise(r => setTimeout(r, 400))
    } catch (err) {
      console.log(`❌ ${err.message}`)
      fail++
    }
  }

  // Save to project root as meals.json
  const output = { scrapedAt: new Date().toISOString(), totalItems: allMeals.length, meals: allMeals }
  const outPath = path.join(__dirname, '..', 'meals.json')
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2))

  console.log(`\n✅ Done — ${allMeals.length} meals saved to meals.json`)
  console.log(`   ${ok} sections succeeded, ${fail} failed\n`)

  // Top 5 by value
  const top5 = allMeals
    .filter(m => m.protein && m.price)
    .sort((a, b) => (b.protein / b.price) - (a.protein / a.price))
    .slice(0, 5)

  console.log('🏆 Top 5 by protein/dollar today:')
  top5.forEach((m, i) => {
    console.log(`  ${i + 1}. ${m.name} @ ${m.location}`)
    console.log(`     $${m.price} | ${m.protein}g protein | ${m.calories} cal | ${(m.protein / m.price).toFixed(1)}g/$`)
  })
}

scrapeAll()
