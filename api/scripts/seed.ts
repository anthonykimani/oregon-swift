import "reflect-metadata";
import AppDataSource from "../service/configs/ormconfig";
import { Zone } from "../service/models/zone.entity";
import { ServiceType } from "../service/models/service-type.entity";
import { RateMatrix } from "../service/models/rate-matrix.entity";

const PORTLAND_CENTER = { lat: 45.515, lng: -122.678 };

const radialZones = [
  { name: "Portland Core", state: "OR", radiusMiles: 5, color: "#173420" },
  { name: "Portland Metro", state: "OR", radiusMiles: 15, color: "#F3BC24" },
  { name: "Greater Portland", state: "OR", radiusMiles: 30, color: "#4A90D9" },
];

function getRate(fromIdx: number, toIdx: number, basePriceCents: number): number {
  const diff = Math.abs(fromIdx - toIdx);
  if (diff === 0) return basePriceCents;
  if (diff === 1) return Math.round(basePriceCents * 1.4);
  return Math.round(basePriceCents * 2.0);
}

async function main() {
  await AppDataSource.initialize();

  const zoneRepo = AppDataSource.getRepository(Zone);
  const sTypeRepo = AppDataSource.getRepository(ServiceType);
  const rateRepo = AppDataSource.getRepository(RateMatrix);

  // Clear old rate matrix entries
  await AppDataSource.query('DELETE FROM rate_matrix');

  // Remove old polygon zones that aren't in our radial list
  const newNames = radialZones.map((z) => z.name);
  await AppDataSource.query(`DELETE FROM zones WHERE name NOT IN ('${newNames.join("','")}')`);
  console.log(`Removed old polygon zones`);

  // --- Zones ---
  for (const z of radialZones) {
    const existing = await zoneRepo.findOne({ where: { name: z.name } });
    if (!existing) {
      const zone = new Zone();
      zone.name = z.name;
      zone.state = z.state;
      zone.zoneType = "radial";
      zone.centerLat = PORTLAND_CENTER.lat;
      zone.centerLng = PORTLAND_CENTER.lng;
      zone.radiusMiles = z.radiusMiles;
      zone.color = z.color;
      zone.active = true;
      await zoneRepo.save(zone);
      console.log(`Created zone: ${z.name}`);
    } else {
      existing.zoneType = "radial";
      existing.centerLat = PORTLAND_CENTER.lat;
      existing.centerLng = PORTLAND_CENTER.lng;
      existing.radiusMiles = z.radiusMiles;
      existing.color = z.color;
      await zoneRepo.save(existing);
      console.log(`Updated zone: ${z.name}`);
    }
  }

  // --- Service types ---
  const serviceTypes = [
    { name: "Standard", slaHours: 24, requiresSignature: false, requiresPhoto: true, basePriceCents: 1500 },
    { name: "Express", slaHours: 4, requiresSignature: true, requiresPhoto: true, basePriceCents: 3500 },
    { name: "Same Day", slaHours: 8, requiresSignature: true, requiresPhoto: true, basePriceCents: 2500 },
    { name: "Overnight", slaHours: 12, requiresSignature: true, requiresPhoto: true, basePriceCents: 2000 },
  ];

  const savedServiceTypes: ServiceType[] = [];

  for (const st of serviceTypes) {
    const existing = await sTypeRepo.findOne({ where: { name: st.name } });
    if (!existing) {
      const sType = new ServiceType();
      sType.name = st.name;
      sType.slaHours = st.slaHours;
      sType.requiresSignature = st.requiresSignature;
      sType.requiresPhoto = st.requiresPhoto;
      sType.basePriceCents = st.basePriceCents;
      sType.active = true;
      const saved = await sTypeRepo.save(sType);
      savedServiceTypes.push(saved);
      console.log(`Created service type: ${st.name}`);
    } else {
      if (!existing.basePriceCents) {
        existing.basePriceCents = st.basePriceCents;
        await sTypeRepo.save(existing);
        console.log(`Updated base price for: ${st.name}`);
      }
      savedServiceTypes.push(existing);
    }
  }

  // --- RateMatrix ---
  const allZones = await zoneRepo.find({ where: { active: true } });
  // order by radiusMiles ascending to match index (0=Core, 1=Metro, 2=Greater)
  allZones.sort((a, b) => (a.radiusMiles || 0) - (b.radiusMiles || 0));

  let rateCount = 0;
  for (const st of savedServiceTypes) {
    for (let fi = 0; fi < allZones.length; fi++) {
      for (let ti = 0; ti < allZones.length; ti++) {
        const fromZone = allZones[fi];
        const toZone = allZones[ti];
        const priceCents = getRate(fi, ti, st.basePriceCents || 1500);

        const existing = await rateRepo.findOne({
          where: { fromZoneId: fromZone.id, toZoneId: toZone.id, serviceTypeId: st.id },
        });
        if (!existing) {
          const rate = new RateMatrix();
          rate.fromZoneId = fromZone.id;
          rate.toZoneId = toZone.id;
          rate.serviceTypeId = st.id;
          rate.priceCents = priceCents;
          await rateRepo.save(rate);
          rateCount++;
        }
      }
    }
  }
  console.log(`Seeded ${rateCount} new rate matrix rows`);

  await AppDataSource.destroy();
  console.log("Seed complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
