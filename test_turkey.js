const fs = require('fs');
const turkeyData = require('turkey-city-regions');

const allData = turkeyData.getAllData;

const citiesMap = new Map();

for (const item of allData) {
  const cityName = item.il;
  const districtName = item.ilce;
  
  if (!citiesMap.has(cityName)) {
    citiesMap.set(cityName, new Set());
  }
  
  citiesMap.get(cityName).add(districtName);
}

const formattedData = Array.from(citiesMap.keys()).map((cityName, index) => {
  return {
    id: (index + 1).toString(),
    name: cityName,
    districts: Array.from(citiesMap.get(cityName)).map((dName, dIndex) => ({
      id: `${index + 1}-${dIndex + 1}`,
      name: dName
    }))
  };
});

fs.writeFileSync('src/utils/turkeyData.json', JSON.stringify(formattedData, null, 2));
console.log("Extraction complete. Found", formattedData.length, "cities.");
