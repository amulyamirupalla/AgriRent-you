const Equipment  = require('./models/Equipment')
const Fertilizer = require('./models/Fertilizer')
const Feedback   = require('./models/Feedback')

const equipmentSeed = [
  // Land Preparation
  { name: 'Heavy Duty Cultivator',   category: 'Land Preparation', price: 900, emoji: '🚜', image: '/equipment/cultivator.png', hp: '60 HP',  available: true,  rating: 4.8, reviews: 120, owner: 'Rajesh Kumar',  phone: '+91 98765 43210', place: 'Ludhiana, Punjab' },
  { name: 'Disc Plough',             category: 'Land Preparation', price: 450, emoji: '💿', image: '/equipment/plough.png', hp: '—',      available: true,  rating: 4.2, reviews: 29,  owner: 'Vijay Pratap',  phone: '+91 66554 43322', place: 'Meerut, Uttar Pradesh' },
  // Sowing and Planting
  { name: 'Seed Drill Machine',      category: 'Sowing and Planting', price: 650, emoji: '🔩', image: '/equipment/seed_drill.png', hp: '45 HP',  available: false, rating: 4.4, reviews: 38,  owner: 'Ramesh Chen',   phone: '+91 32109 87654', place: 'Bhopal, MP' },
  { name: 'Mini Rice Transplanter',  category: 'Sowing and Planting', price: 950, emoji: '🌱', image: '/equipment/transplanter.png', hp: '—',      available: true,  rating: 4.7, reviews: 45,  owner: 'Anjali Devi',   phone: '+91 54321 09876', place: 'Thanjavur, TN' },
  // Irrigation
  { name: 'Solar Water Pump',        category: 'Irrigation', price: 300, emoji: '💧', image: '/equipment/water_pump.png', hp: '5 HP', available: true, rating: 4.6, reviews: 200, owner: 'Kishore Reddy', phone: '+91 88877 66655', place: 'Anantapur, AP' },
  { name: 'Drip Irrigation Kit Set', category: 'Irrigation', price: 200, emoji: '🚿', image: '/equipment/drip_irrigation.png', hp: '—', available: true, rating: 4.9, reviews: 15, owner: 'Pooja Sharma', phone: '+91 77766 55544', place: 'Nashik, Maharashtra' },
  // Crop Protection
  { name: 'Power Sprayer Drone',     category: 'Crop Protection', price: 1500, emoji: '🚁', image: '/equipment/sprayer_drone.png', hp: '—', available: true, rating: 4.8, reviews: 310, owner: 'Vikram Reddy', phone: '+91 65432 10987', place: 'Guntur, AP' },
  { name: 'Knapsack Sprayer',        category: 'Crop Protection', price: 150, emoji: '🎒', image: '/equipment/knapsack_sprayer.png', hp: '—', available: true, rating: 4.1, reviews: 88, owner: 'Santosh Yadav', phone: '+91 55544 33322', place: 'Patna, Bihar' },
  // Crop Maintenance
  { name: 'Rotary Weeder',           category: 'Crop Maintenance', price: 400, emoji: '⚙️', image: '/equipment/weeder.png', hp: '10 HP', available: true, rating: 4.5, reviews: 67, owner: 'Sunil Gavaskar', phone: '+91 44433 22211', place: 'Pune, Maharashtra' },
  // Harvesting
  { name: 'John Deere Harvester',    category: 'Harvesting', price: 3500, emoji: '🌾', image: '/equipment/harvester.png', hp: '120 HP', available: true, rating: 4.9, reviews: 87, owner: 'Amit Singh', phone: '+91 87654 32109', place: 'Karnal, Haryana' },
  { name: 'Kubota Paddy Thresher',   category: 'Harvesting', price: 2200, emoji: '🌾', image: '/equipment/thresher.png', hp: '90 HP', available: true, rating: 4.8, reviews: 72, owner: 'Gurnam Singh', phone: '+91 43210 98765', place: 'Patiala, Punjab' },
  // Post-Harvest Processing
  { name: 'Maize Sheller Machine',   category: 'Post-Harvest Processing', price: 800, emoji: '🌽', image: '/equipment/maize_sheller.png', hp: '20 HP', available: true, rating: 4.6, reviews: 105, owner: 'Rahul Desai', phone: '+91 99988 77766', place: 'Ahmedabad, Gujarat' },
  { name: 'Chaff Cutter Machine',    category: 'Post-Harvest Processing', price: 350, emoji: '✂️', image: '/equipment/chaff_cutter.png', hp: '5 HP', available: false, rating: 4.3, reviews: 44, owner: 'Sita Ram', phone: '+91 88776 65544', place: 'Ranchi, Jharkhand' },
  // Transport
  { name: 'Mahindra Tractor Trailer',category: 'Transport', price: 1200, emoji: '🚜', image: '/equipment/tractor_trailer.png', hp: '75 HP', available: true, rating: 4.8, reviews: 350, owner: 'Mohan Lal', phone: '+91 99887 76655', place: 'Nagpur, Maharashtra' }
]

const fertilizerSeed = [
  { name: 'Urea (46% N)', category: 'Nitrogen', emoji: '🌿', price: '₹280/50kg', priceNum: 280, color: '#e8f5ee', badge: '#1a4d2e', desc: 'High-nitrogen fertilizer ideal for leafy growth. Boosts vegetative development in paddy, wheat, and sugarcane.', usage: 'Apply 50–60 kg/acre before sowing or as top dressing.', available: true },
  { name: 'DAP (Di-Ammonium Phosphate)', category: 'Phosphate', emoji: '🌾', price: '₹1,350/50kg', priceNum: 1350, color: '#fef3c7', badge: '#92400e', desc: 'Rich in phosphorus and nitrogen. Supports root development and flowering in all crops.', usage: 'Apply 25–30 kg/acre as basal dose before sowing.', available: true },
  { name: 'Potash (MOP)', category: 'Potassium', emoji: '🍅', price: '₹900/50kg', priceNum: 900, color: '#fce7f3', badge: '#9d174d', desc: 'Muriate of Potash improves fruit quality, disease resistance, and water regulation in crops.', usage: 'Broadcast 20–25 kg/acre and incorporate into soil.', available: true },
  { name: 'NPK 19:19:19', category: 'NPK Complex', emoji: '⚗️', price: '₹1,600/50kg', priceNum: 1600, color: '#e0f2fe', badge: '#075985', desc: 'Balanced complex fertilizer for all-round nutrition during vegetative and reproductive stages.', usage: 'Apply via fertigation or soil application at 25 kg/acre.', available: true },
  { name: 'Vermicompost', category: 'Organic', emoji: '🪱', price: '₹350/30kg', priceNum: 350, color: '#f5f3ff', badge: '#5b21b6', desc: 'Rich organic fertilizer from earthworm castings. Improves soil texture, microbial life, and crop health.', usage: 'Mix 2–3 tons/acre into the topsoil before planting.', available: false },
  { name: 'Sulphur (Wettable)', category: 'Micronutrient', emoji: '💛', price: '₹480/25kg', priceNum: 480, color: '#fffbeb', badge: '#b45309', desc: 'Controls fungal diseases and provides sulphur nutrition to oilseed and pulse crops.', usage: 'Spray 2–3 g/litre of water on foliage or mix with soil.', available: true },
  { name: 'Zinc Sulphate (ZnSO4)', category: 'Micronutrient', emoji: '🔵', price: '₹520/25kg', priceNum: 520, color: '#dbeafe', badge: '#1d4ed8', desc: 'Corrects zinc deficiency in paddy and maize. Enhances enzyme activity and chlorophyll formation.', usage: 'Soil application: 25 kg/acre or foliar spray 0.5%.', available: true },
  { name: 'Neem Cake', category: 'Organic', emoji: '🌳', price: '₹200/25kg', priceNum: 200, color: '#dcfce7', badge: '#166534', desc: 'Natural pest repellent and soil enricher extracted from neem seeds. Safe for all crops.', usage: 'Incorporate 100–150 kg/acre in soil before sowing.', available: true },
]

const feedbackSeed = [
  { name: 'MIRUPALLA AMULYA', role: 'Owner', avatar: '👨‍🌾', rating: 5, comment: 'Excellent service! Booked a tractor within minutes and it arrived on time. The equipment was in great condition. Highly recommend AGRO RENT to all farmers.', service: 'Equipment Rental' },
  { name: 'VENAGANTI SUVIKSHA', role: 'Owner', avatar: '👩‍🌾', rating: 4, comment: 'Very good platform. Found the fertilizer section very useful. Prices are reasonable. Could improve the mobile experience a bit.', service: 'Fertilizer Purchase' },
  { name: 'NEDURU AJAY', role: 'Farmer', avatar: '👨‍🌾', rating: 5, comment: 'As an equipment owner, AGRO RENT has been fantastic for my business. I get consistent rental requests every week. Payments are always on time.', service: 'Overall Platform' },
  { name: 'K.DAMODER(DD)', role: 'Owner', avatar: '👩‍🌾', rating: 5, comment: 'The booking process is so simple! I booked a harvester online and it showed up at my farm the next morning. Amazing support team as well.', service: 'Booking Management' },
  { name: 'SOLETI SHIVA', role: 'Farmer', avatar: '👨‍🌾', rating: 3, comment: 'Good service overall. Had a minor issue with equipment availability but the support team resolved it quickly. Will continue using the platform.', service: 'Customer Support' },
  { name: 'SATHI PANDU', role: 'Farmer', avatar: '👩‍💼', rating: 5, comment: 'Listing my equipment on AGRO RENT was the best decision. My tractor now earns when it sits idle. The management dashboard is very easy to use.', service: 'Overall Platform' },
]

module.exports = async function seed() {
  try {
    const fertCount = await Fertilizer.countDocuments()
    const fbCount   = await Feedback.countDocuments()

    // Always reset Equipment to ensure new categories are cleanly seeded
    const eqCount = await Equipment.countDocuments()
    if (eqCount === 0) {
      await Equipment.insertMany(equipmentSeed)
      console.log('🌱 Equipment seeded with new comprehensive categories')
    }
    if (fertCount === 0) {
      await Fertilizer.insertMany(fertilizerSeed)
      console.log('🌱 Fertilizers seeded')
    }
    if (fbCount === 0) {
      await Feedback.insertMany(feedbackSeed)
      console.log('🌱 Feedback seeded')
    }
  } catch (err) {
    console.error('Seed error:', err.message)
  }
}
