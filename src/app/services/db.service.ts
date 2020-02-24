import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, ReplaySubject, of, forkJoin } from 'rxjs';
import { map, first, flatMap } from 'rxjs/operators';
import { MonsterData, BossData, MonsterType, MonsterStats } from '../../types/monsters';
import { MONSTERS_COLLECTION, BOSS_COLLECTION as BOSSES_COLLECTION, PARTY_COLLECTION as PARTIES_COLLECTION, DEFAULT_PARTY, PARTY_MONSTERS_COLLECTION, PARTY_COLLECTION } from '../config/db';
import { Party, ScenarioMonsterData } from '../../types/party';
import { Monster } from '../db/monsters';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private monsterDataMap: ReplaySubject<Map<String, MonsterData>> = new ReplaySubject(1);
  private monsterIdMap: Map<string, Monster> = new Map();

  constructor(private af: AngularFirestore) {
    this.initMonsterMap();
  }

  getAllMonsters(): Observable<MonsterData[]> {
    return this.monsterDataMap.pipe(map(monsterMap => Array.from(monsterMap.values())));
  }

  /**
   * Returns *snapshot* of generic monster stats.
   * 
   * This is a snapshot because it doesn't make sense to handle synchronizing base stats that don't change.
   * If base stats change somehow in the future, this will need to refresh.
   * 
   * @param data from the current scenario
   */
  getMonsterDataById(monsterId: string): Observable<MonsterData> {
    return this.monsterDataMap.pipe(first(), map(monsterMap => {
      if (!monsterMap.has(monsterId)) {
        console.error('Invalid monster specified: ', monsterId);
        return null;
      }
      return monsterMap.get(monsterId);
    }));
  }

  createPartyMonsters(newMonsters: ScenarioMonsterData[]) {
    const batch = this.af.firestore.batch();
    for (const newMonster of newMonsters) {
      newMonster.id = this.af.createId();
      batch.set(
        this.af.collection(PARTIES_COLLECTION).doc(DEFAULT_PARTY)
          .collection(PARTY_MONSTERS_COLLECTION).doc(newMonster.id).ref,
        newMonster);
    }
    batch.commit();
  }

  /**
   * Returns wrapper objects for Monsters in a given party, including 
   * both scenario-specific data and generic MonsterData.
   */
  getPartyMonsters(): Observable<Monster[]> {
    return this.af.collection(PARTY_COLLECTION)
      .doc(DEFAULT_PARTY)
      .collection<ScenarioMonsterData>(PARTY_MONSTERS_COLLECTION)
      .valueChanges()
      .pipe(flatMap(scenarioMonsters => {
        // Preemptively return an empty list as forkJoin([]) never fires.
        if (scenarioMonsters.length === 0) {
          return of([]);
        }
        const monsterObservables: Observable<Monster>[] = [];
        for (const scenarioData of scenarioMonsters) {
          monsterObservables.push(this.getMonsterForScenarioData(scenarioData));
        }
        return forkJoin(monsterObservables);
      }));
  }

  deletePartyMonsters() {
    const partyMonstersCollection = this.af.collection(PARTY_COLLECTION)
      .doc(DEFAULT_PARTY)
      .collection<ScenarioMonsterData>(PARTY_MONSTERS_COLLECTION);
    return partyMonstersCollection
      .snapshotChanges()
      .pipe(first())
      .subscribe(monsterDocs => {
        monsterDocs.forEach(monsterDoc => {
          partyMonstersCollection.doc(monsterDoc.payload.doc.id).delete();
        });
      });
  }

  /**
   * Returns a Monster wrapper for the given ScenarioMonsterData.
   */
  private getMonsterForScenarioData(scenarioData: ScenarioMonsterData): Observable<Monster> {
    // Monster objects that already exist should simply receive new ScenarioData.
    if (this.monsterIdMap.has(scenarioData.id)) {
      this.monsterIdMap.get(scenarioData.id).onNewScenarioData(scenarioData);
      return of(this.monsterIdMap.get(scenarioData.id));
    } else {
      return this.getMonsterDataById(scenarioData.monsterId).pipe(map(monsterData => {
        const monster = new Monster(scenarioData, monsterData);
        this.monsterIdMap.set(scenarioData.id, monster);
        return monster;
      }));
    }
  }

  saveMonster(monster: Monster) {
    const saveData = monster.getSaveData();
    const monsterDoc = this.af.collection(PARTIES_COLLECTION)
      .doc(DEFAULT_PARTY)
      .collection(PARTY_MONSTERS_COLLECTION)
      .doc(saveData.id);
    // Remove dead monsters
    if (monster.isDead()) {
      monsterDoc.delete();
    } else {
      monsterDoc.set(saveData);
    }
  }

  getAllBosses(): Observable<BossData[]> {
    return this.af.collection<BossData>(BOSSES_COLLECTION).valueChanges();
  }

  getParty(): Observable<Party> {
    // const party: Party = {
    //   averageCharacterLevel: 1,
    //   monsters: [
    //     {
    //       id: 0,
    //       tokenId: 0,
    //       monsterId: "bandit_guard",
    //       level: 1,
    //       type: MonsterType.NORMAL
    //     },
    //     {
    //       id: 1,
    //       tokenId: 4,
    //       monsterId: "bandit_guard",
    //       level: 1,
    //       type: MonsterType.NORMAL,
    //       health: 4
    //     },
    //     {
    //       id: 3,
    //       tokenId: 2,
    //       monsterId: "bandit_guard",
    //       level: 1,
    //       type: MonsterType.ELITE,
    //       health: 7
    //     },
    //     {
    //       id: 2,
    //       tokenId: 1,
    //       monsterId: "living_bones",
    //       level: 1,
    //       type: MonsterType.NORMAL
    //     },
    //     {
    //       id: 4,
    //       tokenId: 2,
    //       monsterId: "living_bones",
    //       level: 1,
    //       type: MonsterType.NORMAL
    //     },
    //     {
    //       id: 5,
    //       tokenId: 0,
    //       monsterId: "bandit_archer",
    //       level: 1,
    //       type: MonsterType.NORMAL
    //     },
    //     {
    //       id: 6,
    //       tokenId: 0,
    //       monsterId: "bandit_archer",
    //       level: 1,
    //       type: MonsterType.ELITE
    //     },
    //     {
    //       id: 7,
    //       tokenId: 0,
    //       monsterId: "bandit_archer",
    //       level: 1,
    //       health: 3,
    //       type: MonsterType.NORMAL
    //     },
    //     {
    //       id: 8,
    //       tokenId: 0,
    //       monsterId: "bandit_archer",
    //       level: 1,
    //       health: 0,
    //       type: MonsterType.NORMAL
    //     },
    //     {
    //       id: 9,
    //       tokenId: 0,
    //       monsterId: "bandit_archer",
    //       level: 1,
    //       type: MonsterType.NORMAL
    //     },
    //   ],
    //   bosses: []
    // };
    // this.af.collection(PARTIES_COLLECTION).doc<Party>(DEFAULT_PARTY).set(party);
    return this.af.collection(PARTIES_COLLECTION).doc<Party>(DEFAULT_PARTY).valueChanges();
  }

  /**
   * Initializes local storage for all monster stats.
   */
  private initMonsterMap() {
    this.af.collection<MonsterData>(MONSTERS_COLLECTION).get()
      .subscribe(monsterDocs => {
        const monsterMap = new Map<String, MonsterData>(
          monsterDocs.docs.map(monsterDoc => {
            const monsterData = monsterDoc.data() as MonsterData;
            return [monsterData.id, monsterData];
          })
        );
        this.monsterDataMap.next(monsterMap);
      });
  }
}
