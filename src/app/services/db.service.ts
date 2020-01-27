import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, ReplaySubject } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { MonsterData, BossData, MonsterType, MonsterStats } from '../../types/monsters';
import { MONSTERS_COLLECTION, BOSS_COLLECTION as BOSSES_COLLECTION, PARTY_COLLECTION as PARTIES_COLLECTION, DEFAULT_PARTY } from '../config/db';
import { Party, ScenarioMonsterData } from '../../types/party';
import { Monster } from '../db/monsters';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private monsterDataMap: ReplaySubject<Map<String, MonsterData>> = new ReplaySubject(1);
  private monsterIdMap: Map<number, Monster> = new Map();

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

  getPartyMonsters(): Observable<Monster[]> {
    return this.getParty().pipe(map(party => {
      for (const scenarioData of party.monsters) {
        if (this.monsterIdMap.has(scenarioData.id)) {
          this.monsterIdMap.get(scenarioData.id).onNewScenarioData(scenarioData);
        } else {
          // TODO(mdierker): Make this suck less!!
          this.getMonsterDataById(scenarioData.monsterId).then(monsterData => {
            const monster = new Monster(scenarioData, monsterData);
            this.monsterIdMap.set(monsterData.id, monster);
          });
        }
      }
      return Array.from(this.monsterIdMap.values());
    }));
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
    return this.af.collection(PARTIES_COLLECTION).doc<Party>(DEFAULT_PARTY).valueChanges().pipe(map(party => {
      console.log('party', party);
      
      return party;
    }));
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
