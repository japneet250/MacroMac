const LIBCAL_URL = 'https://hospitality-mcmaster.libcal.com/widget/hours/grid?iid=4258&format=json&weeks=1&systemTime=0'

const LOCATION_MAP = {
  'Centro': 'Centro',
  'Centro (Commons)': 'Centro',
  'La Piazza': 'La Piazza',
  'La Piazza (MUSC)': 'La Piazza',
  'Bistro 2 Go': 'Bistro 2 Go',
  'Bistro-2-Go (MKR)': 'Bistro 2 Go',
  'The Bistro @ MKR': 'Bistro @ MKR',
  'Bistro @ MKR': 'Bistro @ MKR',
  'IAHS Café': 'IAHS Café',
  'IAHS Cafe': 'IAHS Café',
  'Reactor Café': 'Reactor Café',
  'Reactor Café (Thode)': 'Reactor Café',
  'Reactor Cafe': 'Reactor Café',
  'Café One': 'Café One',
  'Café One (MDCL)': 'Café One',
  'Cafe One': 'Café One',
  'Eco Bean': 'Eco Bean - MUMC',
  'Ecobean (HSC)': 'Eco Bean - MUMC',
  'Eco Bean - MUMC': 'Eco Bean - MUMC',
  'Café on Bay': 'Café on Bay',
  'E-Café (ETB)': 'E-Café',
}


export async function GET() {
  try {
    const res = await fetch(LIBCAL_URL, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 }
    })
    if (!res.ok) throw new Error(`LibCal returned ${res.status}`)

    const data = await res.json()
    const today = new Date()
    const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    const todayName = weekdays[today.getDay()]
    const hoursMap = {}

    for (const loc of data.locations || []) {
      const todayData = loc.weeks?.[0]?.[todayName]
      if (!todayData) continue
      const mappedName = LOCATION_MAP[loc.name] || loc.name
      const rendered = todayData.rendered || 'Closed'
      const currentlyOpen = todayData.times?.currently_open || false
      const hours = rendered === 'Closed' ? null : rendered

      hoursMap[mappedName] = {
        isOpen: currentlyOpen,
        hours,
        display: currentlyOpen
          ? `Open · ${hours}`
          : hours
            ? `Closed · Today: ${hours}`
            : 'Closed today'
      }
    }

    return Response.json({ hours: hoursMap, fetchedAt: new Date().toISOString() })
  } catch (err) {
    return Response.json({ hours: {}, error: err.message }, { status: 200 })
  }
}
