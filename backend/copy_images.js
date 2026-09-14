const fs = require('fs')
const path = require('path')

const srcDir = `C:\\Users\\amuly\\.gemini\\antigravity\\brain\\2b7f3006-1d5b-4aed-b96e-e026e22a7c49`
const destDir = `c:\\AGRIRENT(org)\\frontend\\public\\equipment`

// Ensure dest dir exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true })
}

const files = fs.readdirSync(srcDir)

const prefixes = [
  'cultivator', 'plough', 'seed_drill', 'transplanter', 'water_pump', 
  'drip_irrigation', 'sprayer_drone', 'knapsack_sprayer', 'weeder', 
  'harvester', 'thresher', 'maize_sheller', 'chaff_cutter', 'tractor_trailer'
]

prefixes.forEach(prefix => {
  const match = files.find(f => f.startsWith(prefix + '_') && f.endsWith('.png'))
  if (match) {
    const srcPath = path.join(srcDir, match)
    const destPath = path.join(destDir, prefix + '.png')
    console.log(`Copying ${match} -> ${prefix}.png`)
    fs.copyFileSync(srcPath, destPath)
  } else {
    console.log(`No match found for prefix: ${prefix}`)
  }
})

console.log('Copy complete.')
