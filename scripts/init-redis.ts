// scripts/init-redis.ts
import { createClient } from "redis";
import { penduduk, kartuKeluarga, anggotaKeluarga, kelahiran, kematian, kedatangan, perpindahan, pengguna } from "../lib/dummy-data.js"; // pakai .js untuk ESM
import { getRedisData, getRedisKeys, setRedisData } from "../lib/redis-service.js"; // pakai .js

async function initRedis() {
  const client = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
  client.on("error", (err) => console.error("Redis client error:", err));

  try {
    await client.connect();
    console.log("Connected to Redis");

    // Clear existing data
    const keys = await client.keys("*");
    for (const key of keys) await client.del(key);

    // ===== Add penduduk, KK, anggota =====
    for (const p of penduduk) await client.set(`penduduk:${p.id_pend}`, JSON.stringify(p));
    for (const kk of kartuKeluarga) await client.set(`kk:${kk.id_kk}`, JSON.stringify(kk));
    for (const a of anggotaKeluarga) await client.set(`anggota:${a.id_anggota}`, JSON.stringify(a));

    // ===== Auto update penduduk dengan id_kk =====
    const pendudukKeys = await client.keys("penduduk:*");
    const pendudukList = await Promise.all(pendudukKeys.map(k => client.get(k).then(JSON.parse)));

    const anggotaMap = new Map();
    anggotaKeluarga.forEach(a => anggotaMap.set(a.id_pend, { id_kk: a.id_kk, hubungan: a.hubungan }));

    const kkMap = new Map();
    kartuKeluarga.forEach(kk => kkMap.set(kk.id_kk, { no_kk: kk.no_kk || "-", kepala: kk.kepala || "-" }));

    for (const p of pendudukList) {
      const anggota = anggotaMap.get(p.id_pend);
      if (!anggota) continue;
      const kk = kkMap.get(anggota.id_kk);

      const updated = { ...p, id_kk: anggota.id_kk, hub_keluarga: anggota.hubungan, no_kk: kk?.no_kk || "-", kepala: kk?.kepala || "-" };
      await client.set(`penduduk:${p.id_pend}`, JSON.stringify(updated));
      console.log(`✅ Updated penduduk ${p.nama} (ID: ${p.id_pend})`);
    }

    // ===== Add other data =====
    for (const k of kelahiran) await client.set(`kelahiran:${k.id_lahir}`, JSON.stringify(k));
    for (const k of kematian) await client.set(`kematian:${k.id_mendu}`, JSON.stringify(k));
    for (const k of kedatangan) await client.set(`kedatangan:${k.id_datang}`, JSON.stringify(k));
    for (const p of perpindahan) await client.set(`perpindahan:${p.id_pindah}`, JSON.stringify(p));
    for (const p of pengguna) {
      const level = p.level === "admin" ? "admin" : "guest";
      await client.set(`pengguna:${p.id_pengguna}`, JSON.stringify({ ...p, level }));
    }

    console.log("Redis initialization & migration complete!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.disconnect();
    console.log("Redis disconnected");
  }
}

// Jalankan
initRedis().catch(console.error);
