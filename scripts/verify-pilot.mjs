import assert from 'node:assert/strict';
import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync(new URL('../src/data/pilot-free-fire.json',import.meta.url),'utf8'));
const allowedRanks=new Map([[1,50],[2,35],[3,25]]);
const unique=new Set();
const byUid=new Map();
const teamsByUid=new Map();
assert.equal(data.competitions.length,10);
assert.equal(data.standings.length,132);
assert.equal(data.podiums.length,33);
assert.equal(new Set(data.standings.map(s=>s.competition_id+':'+s.division)).size,11);
assert.equal(data.athletes.length,78);
assert.equal(data.team_memberships.length,137);
assert.equal(data.achievement_attributions.length,98);
for(const podium of data.podiums){
  assert.equal(podium.achievement_delta,allowedRanks.get(podium.rank),'wrong podium reward');
  assert.ok(data.standings.some(s=>s.id===podium.id),'orphaned podium');
}
for(const a of data.achievement_attributions){
  assert.equal(a.achievement_delta,allowedRanks.get(a.rank));
  assert.equal(a.status,'PROVISIONAL_ROSTER_MATCH');
  const key=a.uid_fingerprint+':'+a.competition_id+':'+a.division;
  assert.ok(!unique.has(key),'duplicate individual award for same event/division');unique.add(key);
  const stats=byUid.get(a.uid_fingerprint)||{score:0,podiums:0,titles:0};
  stats.score+=a.achievement_delta;stats.podiums++;stats.titles+=a.rank===1?1:0;
  byUid.set(a.uid_fingerprint,stats);
  const t=teamsByUid.get(a.uid_fingerprint)||new Set();t.add(a.team_at_event);teamsByUid.set(a.uid_fingerprint,t);
  assert.ok(data.team_memberships.some(m=>m.awarded&&m.uid_fingerprint===a.uid_fingerprint&&m.result_id===a.result_id));
}
for(const a of data.athletes){
  const rec=byUid.get(a.uid_fingerprint);assert.ok(rec);
  assert.equal(a.elo_points,1200+rec.score);
  assert.equal(a.matches_played,rec.podiums);
  assert.equal(a.wins,rec.titles);
  assert.equal(a.seed_status,'PROVISIONAL_ROSTER_MATCH');
  assert.equal(a.primary_game,'Free Fire');
  assert.equal(a.whatsapp,'');
  assert.match(a.uid_fingerprint,/^[0-9a-f]{64}$/);
  assert.ok(!/\d{7,14}/.test(a.game_id),'raw UID exposed in display');
}
const multiTeam=[...teamsByUid.values()].filter(t=>t.size>1).length;
assert.equal(multiTeam,11);
// EXPLICITLY exclude ambiguous event results from individual ranking.
for(const podium of data.podiums.filter(p=>p.roster_status==='REQUIRES_REVIEW')) {
 assert.ok(!data.achievement_attributions.some(a=>a.result_id===podium.id));
}
// Privacy sanity check: no spreadsheet private fields in the bundled athlete records.
const all=JSON.stringify(data).toLowerCase();
for(const field of ['nomor whatsapp','nomor rekening','ktp','bukti pembayaran','nama lengkap player','no wa']){
 assert.ok(!all.includes('"'+field+'"'),'unexpected private field '+field);
}
console.log(`VALIDATED ${data.competitions.length} competitions, ${data.standings.length} final standings, ${data.podiums.length} podiums, ${data.achievement_attributions.length} individual tags, ${multiTeam} multi-team athletes.`);
