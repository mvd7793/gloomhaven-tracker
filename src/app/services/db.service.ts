import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, ReplaySubject } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { MonsterData, BossData, MonsterType, MonsterStats } from '../../types/monsters';
import { MONSTERS_COLLECTION, BOSS_COLLECTION as BOSSES_COLLECTION, PARTY_COLLECTION as PARTIES_COLLECTION, DEFAULT_PARTY } from '../config/db';
import { Party, ScenarioMonsterData } from '../../types/party';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private monsterMap: ReplaySubject<Map<String, MonsterData>> = new ReplaySubject(1);

  constructor(private af: AngularFirestore) {
    this.initMonsterMap();
  }

  getAllMonsters(): Observable<MonsterData[]> {
    return this.monsterMap.pipe(map(monsterMap => Array.from(monsterMap.values())));
  }

  /**
   * Returns *snapshot* of generic monster stats.
   * 
   * This is a snapshot because it doesn't make sense to handle synchronizing base stats that don't change.
   * If base stats change somehow in the future, this will need to refresh.
   * 
   * @param data from the current scenario
   */
  getMonsterDataById(monsterId: string): Promise<MonsterData> {
    return this.monsterMap.pipe(first(), map(monsterMap => {
      if (!monsterMap.has(monsterId)) {
        console.error('Invalid monster specified: ', monsterId);
        return null;
      }
      return monsterMap.get(monsterId);
    })).toPromise();
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
    //       monsterId: "bandit_guard",
    //       level: 1,
    //       type: MonsterType.NORMAL
    //     },
    //     {
    //       id: 1,
    //       monsterId: "bandit_guard",
    //       level: 1,
    //       type: MonsterType.NORMAL,
    //       health: 4
    //     },
    //     {
    //       id: 3,
    //       monsterId: "bandit_guard",
    //       level: 1,
    //       type: MonsterType.ELITE,
    //       health: 7
    //     },
    //     {
    //       id: 2,
    //       monsterId: "living_bones",
    //       level: 1,
    //       type: MonsterType.NORMAL
    //     },
    //     {
    //       id: 4,
    //       monsterId: "living_bones",
    //       level: 1,
    //       type: MonsterType.NORMAL
    //     }
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
        this.monsterMap.next(monsterMap);
      });
  }
}
