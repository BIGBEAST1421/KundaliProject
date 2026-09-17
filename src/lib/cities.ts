/** Curated birth-place list with exact coordinates for instant autocomplete. */
export interface City {
  c: string;
  s: string;
  co: string;
  lat: number;
  lon: number;
}

export const CITIES: readonly City[] = [
  { c: "Bareilly", s: "Uttar Pradesh", co: "India", lat: 28.367, lon: 79.4304 },
  { c: "Rae Bareli", s: "Uttar Pradesh", co: "India", lat: 26.2309, lon: 81.2325 },
  { c: "Lucknow", s: "Uttar Pradesh", co: "India", lat: 26.8467, lon: 80.9462 },
  { c: "Kanpur", s: "Uttar Pradesh", co: "India", lat: 26.4499, lon: 80.3319 },
  { c: "Agra", s: "Uttar Pradesh", co: "India", lat: 27.1767, lon: 78.0081 },
  { c: "Varanasi", s: "Uttar Pradesh", co: "India", lat: 25.3176, lon: 82.9739 },
  { c: "Prayagraj", s: "Uttar Pradesh", co: "India", lat: 25.4358, lon: 81.8463 },
  { c: "Meerut", s: "Uttar Pradesh", co: "India", lat: 28.9845, lon: 77.7064 },
  { c: "Noida", s: "Uttar Pradesh", co: "India", lat: 28.5355, lon: 77.391 },
  { c: "Ghaziabad", s: "Uttar Pradesh", co: "India", lat: 28.6692, lon: 77.4538 },
  { c: "Gorakhpur", s: "Uttar Pradesh", co: "India", lat: 26.7606, lon: 83.3732 },
  { c: "Aligarh", s: "Uttar Pradesh", co: "India", lat: 27.8974, lon: 78.088 },
  { c: "Moradabad", s: "Uttar Pradesh", co: "India", lat: 28.8386, lon: 78.7733 },
  { c: "Mathura", s: "Uttar Pradesh", co: "India", lat: 27.4924, lon: 77.6737 },
  { c: "Shahjahanpur", s: "Uttar Pradesh", co: "India", lat: 27.8832, lon: 79.9053 },
  { c: "Rampur", s: "Uttar Pradesh", co: "India", lat: 28.8159, lon: 79.0254 },
  { c: "Jhansi", s: "Uttar Pradesh", co: "India", lat: 25.4484, lon: 78.5685 },
  { c: "Ayodhya", s: "Uttar Pradesh", co: "India", lat: 26.7922, lon: 82.1998 },
  { c: "Hapur", s: "Uttar Pradesh", co: "India", lat: 28.7293, lon: 77.7756 },
  { c: "Firozabad", s: "Uttar Pradesh", co: "India", lat: 27.1592, lon: 78.3957 },
  { c: "Muzaffarnagar", s: "Uttar Pradesh", co: "India", lat: 29.4726, lon: 77.7085 },
  { c: "Saharanpur", s: "Uttar Pradesh", co: "India", lat: 29.964, lon: 77.546 },
  { c: "Bulandshahr", s: "Uttar Pradesh", co: "India", lat: 28.4072, lon: 77.8497 },
  { c: "Etawah", s: "Uttar Pradesh", co: "India", lat: 26.7892, lon: 79.022 },
  { c: "Lakhimpur", s: "Uttar Pradesh", co: "India", lat: 27.9484, lon: 80.7812 },
  { c: "Delhi", s: "Delhi", co: "India", lat: 28.7041, lon: 77.1025 },
  { c: "New Delhi", s: "Delhi", co: "India", lat: 28.6139, lon: 77.209 },
  { c: "Mumbai", s: "Maharashtra", co: "India", lat: 19.076, lon: 72.8777 },
  { c: "Pune", s: "Maharashtra", co: "India", lat: 18.5204, lon: 73.8567 },
  { c: "Nagpur", s: "Maharashtra", co: "India", lat: 21.1458, lon: 79.0882 },
  { c: "Nashik", s: "Maharashtra", co: "India", lat: 19.9975, lon: 73.7898 },
  { c: "Thane", s: "Maharashtra", co: "India", lat: 19.2183, lon: 72.9781 },
  { c: "Bengaluru", s: "Karnataka", co: "India", lat: 12.9716, lon: 77.5946 },
  { c: "Bangalore", s: "Karnataka", co: "India", lat: 12.9716, lon: 77.5946 },
  { c: "Mysuru", s: "Karnataka", co: "India", lat: 12.2958, lon: 76.6394 },
  { c: "Hubli", s: "Karnataka", co: "India", lat: 15.3647, lon: 75.124 },
  { c: "Mangaluru", s: "Karnataka", co: "India", lat: 12.9141, lon: 74.856 },
  { c: "Chennai", s: "Tamil Nadu", co: "India", lat: 13.0827, lon: 80.2707 },
  { c: "Coimbatore", s: "Tamil Nadu", co: "India", lat: 11.0168, lon: 76.9558 },
  { c: "Madurai", s: "Tamil Nadu", co: "India", lat: 9.9252, lon: 78.1198 },
  { c: "Salem", s: "Tamil Nadu", co: "India", lat: 11.6643, lon: 78.146 },
  { c: "Jaipur", s: "Rajasthan", co: "India", lat: 26.9124, lon: 75.7873 },
  { c: "Jodhpur", s: "Rajasthan", co: "India", lat: 26.2389, lon: 73.0243 },
  { c: "Udaipur", s: "Rajasthan", co: "India", lat: 24.5854, lon: 73.7125 },
  { c: "Kota", s: "Rajasthan", co: "India", lat: 25.2138, lon: 75.8648 },
  { c: "Ajmer", s: "Rajasthan", co: "India", lat: 26.4499, lon: 74.6399 },
  { c: "Bikaner", s: "Rajasthan", co: "India", lat: 28.0229, lon: 73.3119 },
  { c: "Ahmedabad", s: "Gujarat", co: "India", lat: 23.0225, lon: 72.5714 },
  { c: "Surat", s: "Gujarat", co: "India", lat: 21.1702, lon: 72.8311 },
  { c: "Vadodara", s: "Gujarat", co: "India", lat: 22.3072, lon: 73.1812 },
  { c: "Rajkot", s: "Gujarat", co: "India", lat: 22.3039, lon: 70.8022 },
  { c: "Bhopal", s: "Madhya Pradesh", co: "India", lat: 23.2599, lon: 77.4126 },
  { c: "Indore", s: "Madhya Pradesh", co: "India", lat: 22.7196, lon: 75.8577 },
  { c: "Gwalior", s: "Madhya Pradesh", co: "India", lat: 26.2183, lon: 78.1828 },
  { c: "Jabalpur", s: "Madhya Pradesh", co: "India", lat: 23.1815, lon: 79.9864 },
  { c: "Kolkata", s: "West Bengal", co: "India", lat: 22.5726, lon: 88.3639 },
  { c: "Siliguri", s: "West Bengal", co: "India", lat: 26.7271, lon: 88.3953 },
  { c: "Patna", s: "Bihar", co: "India", lat: 25.5941, lon: 85.1376 },
  { c: "Gaya", s: "Bihar", co: "India", lat: 24.7955, lon: 85.0002 },
  { c: "Muzaffarpur", s: "Bihar", co: "India", lat: 26.1197, lon: 85.391 },
  { c: "Hyderabad", s: "Telangana", co: "India", lat: 17.385, lon: 78.4867 },
  { c: "Warangal", s: "Telangana", co: "India", lat: 17.9689, lon: 79.5941 },
  { c: "Visakhapatnam", s: "Andhra Pradesh", co: "India", lat: 17.6868, lon: 83.2185 },
  { c: "Vijayawada", s: "Andhra Pradesh", co: "India", lat: 16.5062, lon: 80.648 },
  { c: "Tirupati", s: "Andhra Pradesh", co: "India", lat: 13.6288, lon: 79.4192 },
  { c: "Thiruvananthapuram", s: "Kerala", co: "India", lat: 8.5241, lon: 76.9366 },
  { c: "Kochi", s: "Kerala", co: "India", lat: 9.9312, lon: 76.2673 },
  { c: "Kozhikode", s: "Kerala", co: "India", lat: 11.2588, lon: 75.7804 },
  { c: "Ludhiana", s: "Punjab", co: "India", lat: 30.901, lon: 75.8573 },
  { c: "Amritsar", s: "Punjab", co: "India", lat: 31.634, lon: 74.8723 },
  { c: "Jalandhar", s: "Punjab", co: "India", lat: 31.326, lon: 75.5762 },
  { c: "Gurugram", s: "Haryana", co: "India", lat: 28.4595, lon: 77.0266 },
  { c: "Faridabad", s: "Haryana", co: "India", lat: 28.4089, lon: 77.3178 },
  { c: "Panipat", s: "Haryana", co: "India", lat: 29.3909, lon: 76.9635 },
  { c: "Rohtak", s: "Haryana", co: "India", lat: 28.8955, lon: 76.6066 },
  { c: "Hisar", s: "Haryana", co: "India", lat: 29.1492, lon: 75.7217 },
  { c: "Dehradun", s: "Uttarakhand", co: "India", lat: 30.3165, lon: 78.0322 },
  { c: "Haridwar", s: "Uttarakhand", co: "India", lat: 29.9457, lon: 78.1642 },
  { c: "Rishikesh", s: "Uttarakhand", co: "India", lat: 30.0869, lon: 78.2676 },
  { c: "Ranchi", s: "Jharkhand", co: "India", lat: 23.3441, lon: 85.3096 },
  { c: "Jamshedpur", s: "Jharkhand", co: "India", lat: 22.8046, lon: 86.2029 },
  { c: "Bhubaneswar", s: "Odisha", co: "India", lat: 20.2961, lon: 85.8245 },
  { c: "Raipur", s: "Chhattisgarh", co: "India", lat: 21.2514, lon: 81.6296 },
  { c: "Guwahati", s: "Assam", co: "India", lat: 26.1445, lon: 91.7362 },
  { c: "Srinagar", s: "Jammu & Kashmir", co: "India", lat: 34.0837, lon: 74.7973 },
  { c: "Jammu", s: "Jammu & Kashmir", co: "India", lat: 32.7266, lon: 74.857 },
  { c: "Shimla", s: "Himachal Pradesh", co: "India", lat: 31.1048, lon: 77.1734 },
  { c: "Panaji", s: "Goa", co: "India", lat: 15.4909, lon: 73.8278 },
  { c: "London", s: "England", co: "United Kingdom", lat: 51.5074, lon: -0.1278 },
  { c: "New York", s: "New York", co: "United States", lat: 40.7128, lon: -74.006 },
  { c: "Dubai", s: "Dubai", co: "UAE", lat: 25.2048, lon: 55.2708 },
  { c: "Singapore", s: "Singapore", co: "Singapore", lat: 1.3521, lon: 103.8198 },
  { c: "Toronto", s: "Ontario", co: "Canada", lat: 43.6532, lon: -79.3832 },
  { c: "Sydney", s: "New South Wales", co: "Australia", lat: -33.8688, lon: 151.2093 },
];

export interface CityMatch extends City {
  score: number;
}

/** Fuzzy-ish ranked search: exact > prefix > contains > state match. Top 8. */
export function searchCities(query: string, limit = 8): CityMatch[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  const seen = new Set<string>();
  const out: CityMatch[] = [];
  for (const city of CITIES) {
    const key = city.c + "|" + city.s;
    if (seen.has(key)) continue;
    const name = city.c.toLowerCase();
    let score = 0;
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 90;
    else if (name.includes(q)) score = 70;
    else if (city.s.toLowerCase().includes(q)) score = 30;
    if (score > 0) {
      seen.add(key);
      out.push({ ...city, score });
    }
  }
  return out.sort((a, b) => b.score - a.score || a.c.localeCompare(b.c)).slice(0, limit);
}
