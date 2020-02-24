const { Firestore } = require('@google-cloud/firestore');
const fs = require('fs');

const firestore = new Firestore({
    keyFilename: 'keys/glo2mhaven-tracker-firebase-adminsdk.json'
});

async function importMonsters() {
    const monstersData = JSON.parse(fs.readFileSync('scripts/monster_stats.json'));
    const batch = firestore.batch();
    for (const [monsterName, monsterData] of Object.entries(monstersData['monsters'])) {
        const monsterClass = monsterName.toLowerCase().replace(' ', '_');
        const levelObj = {};
        monsterData['level'].forEach(levelData => {
            levelObj[levelData['level']] = {
                normal: levelData['normal'],
                elite: levelData['elite'],
            };
        });
        const stats = {
            id: monsterClass,
            displayName: monsterName,
            levelStats: levelObj
        };
        batch.create(firestore.collection('monsters').doc(monsterClass), stats);
    }
    for (const [bossName, bossData] of Object.entries(monstersData['bosses'])) {
    const bossClass = bossName.toLowerCase().replace(/ /g, '_');
        const levelObj = {};
        bossData['level'].forEach(levelData => {
            levelObj[levelData['level']] = levelData;
        });
        const stats = {
            id: bossClass,
            displayName: bossName,
            levelStats: levelObj
        };
        batch.create(firestore.collection('bosses').doc(bossClass), stats);
    }
    await batch.commit();
    console.log('Monsters and bosses imported');

};

importMonsters();