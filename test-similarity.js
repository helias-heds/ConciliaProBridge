import { compareTwoStrings } from "string-similarity";

// Testes de similaridade
const tests = [
  ["JOHN SMITH", "JOHN SMTH"],
  ["MARIA SANTOS", "MARIA S SANTOS"],
  ["JOSE SILVA", "JOSE SILVA"],
  ["KATANA BARBERSHOP LLC", "KATANA BARBERSHOP LLC"],
  ["JULIO C VELOZ SARMIENTO", "JULIO VELOZ"],
  ["JOSE FLOREANO SOLIS", "DIEGO FLOREANO SOLIS"],
  ["MIGUEL PEREA MENDEZ", "MIGUEL PEREA"],
  ["abc", "xyz"],
];

console.log("\n🧪 Testing Name Similarity (50% threshold):\n");

tests.forEach(([name1, name2]) => {
  const similarity = compareTwoStrings(name1.toLowerCase(), name2.toLowerCase());
  const percent = Math.round(similarity * 100);
  const pass = percent >= 50 ? "✅ PASS" : "❌ FAIL";
  
  console.log(`${pass} ${percent}% - "${name1}" vs "${name2}"`);
});
