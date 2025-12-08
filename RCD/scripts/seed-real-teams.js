#!/usr/bin/env node
/*
 Seed real users, managers, teams, and players via live APIs.
 - Registers managers and players (email/password/username)
 - Creates teams using manager tokens
 - Submits join requests from players and approves them by managers

 Usage:
   node scripts/seed-real-teams.js --teams 8 --players 4 --host http://localhost:8080

 Notes:
 - Host should point to the web service (Next.js) exposing the API routes
 - Output lists created accounts with plaintext passwords for testing
*/

if (typeof fetch !== 'function') {
  throw new Error('Global fetch not available. Use Node 18+ to run this script.');
}
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
  .option('teams', { type: 'number', default: 8 })
  .option('players', { type: 'number', default: 4 })
  .option('host', { type: 'string', default: 'http://localhost:8080' })
  .argv;

const HOST = argv.host.replace(/\/$/, '');
const TEAM_COUNT = Math.max(2, Math.min(64, argv.teams));
const PLAYERS_PER_TEAM = Math.max(1, Math.min(10, argv.players));

function randomWord(exclude) {
  const words = [
    'Atlas','Nova','Apex','Vertex','Orion','Zephyr','Pulse','Echo','Quantum','Phoenix',
    'Titan','Vortex','Nimbus','Solstice','Paradox','Nebula','Helix','Falcon','Aurora','Spectre'
  ];
  const filtered = exclude ? words.filter(w => w !== exclude) : words;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function teamName(i) {
  const a = randomWord();
  const b = randomWord(a);
  return `${a} ${b} ${i+1}`;
}

function tagFromName(name) {
  return name.split(' ').map(s => s[0]).join('').slice(0,4).toUpperCase();
}

function passSuffix() {
  return Math.random().toString(36).slice(2,8);
}

function shortBase(name) {
  return name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,12) || 'team';
}

function makeUsername(base, role, index) {
  const slug = Math.random().toString(36).slice(2,5);
  const candidate = `${base}_${role}${index}_${slug}`;
  return candidate.slice(0, 30);
}

async function register(email, password, username) {
  const maxRetries = 3;
  let attempt = 0;
  let lastErr;
  while (attempt < maxRetries) {
    attempt++;
    const res = await fetch(`${HOST}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username })
    });
    if (res.ok) return res.json();
    lastErr = new Error(`register failed: ${res.status}`);
    await new Promise(r => setTimeout(r, 300 * attempt));
  }
  throw lastErr;
}

async function login(email, password) {
  const res = await fetch(`${HOST}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error(`login failed: ${res.status}`);
  return res.json(); // { token, user }
}

async function createTeam(token, name, tag) {
  const res = await fetch(`${HOST}/api/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, tag })
  });
  if (!res.ok) throw new Error(`createTeam failed: ${res.status}`);
  return res.json();
}

async function requestJoin(token, teamId) {
  const res = await fetch(`${HOST}/api/teams/${teamId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message: 'Please let me join!' })
  });
  if (!res.ok) throw new Error(`requestJoin failed: ${res.status}`);
  return res.json(); // joinRequest
}

async function listManagerRequests(token) {
  const res = await fetch(`${HOST}/api/teams/manager/requests`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`managerRequests failed: ${res.status}`);
  return res.json();
}

async function approveRequest(token, teamId, requestId) {
  const res = await fetch(`${HOST}/api/teams/${teamId}/requests/${requestId}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`approve failed: ${res.status}`);
  return res.json();
}

(async () => {
  const output = [];
  const ts = Date.now();
  for (let i = 0; i < TEAM_COUNT; i++) {
    const name = teamName(i);
    const tag = tagFromName(name);
    const managerEmail = `${name.toLowerCase().replace(/\s+/g,'')}.manager.${ts}.${i+1}@example.com`;
    const managerUser = makeUsername(shortBase(name), 'manager', i+1);
    const managerPass = `Mgr_${passSuffix()}_A1!`;

    const { token: mgrToken, user: mgrUser } = await register(managerEmail, managerPass, managerUser);
    const team = await createTeam(mgrToken, name, tag);

    const players = [];
    for (let p = 0; p < PLAYERS_PER_TEAM; p++) {
      const playerEmail = `${name.toLowerCase().replace(/\s+/g,'')}.p${p+1}.${ts}.${i+1}@example.com`;
      const playerUser = makeUsername(shortBase(name), 'player', p+1);
      const playerPass = `Plr_${passSuffix()}_B2!`;
      let plToken, plUser;
      try {
        const regResult = await register(playerEmail, playerPass, playerUser);
        plToken = regResult.token;
        plUser = regResult.user;
      } catch (err) {
        throw new Error(`Player registration failed for email: ${playerEmail}, username: ${playerUser}. Error: ${err && err.message ? err.message : err}`);
      }
      // request join
      const jr = await requestJoin(plToken, team.id);
      players.push({ email: playerEmail, username: playerUser, password: playerPass, id: plUser.id, requestId: jr.id });

    // Approve all pending requests for this team
    for (const pl of players) {
      await approveRequest(mgrToken, team.id, pl.requestId);
    }

    output.push({
      team: { id: team.id, name, tag },
      manager: { email: managerEmail, username: managerUser, password: managerPass, id: mgrUser.id },
      players,
    });
  }

  console.log(JSON.stringify({ ok: true, host: HOST, teams: output }, null, 2));
})().catch(err => {
  console.error(err);
  process.exit(1);
});
