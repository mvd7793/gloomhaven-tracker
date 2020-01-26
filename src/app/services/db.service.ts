import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { MonsterData, BossData } from '../../types/monsters';
import { MONSTERS_COLLECTION, BOSS_COLLECTION as BOSSES_COLLECTION, PARTY_COLLECTION as PARTIES_COLLECTION, DEFAULT_PARTY } from '../config/db';
import { Party } from '../../types/party';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  constructor(private af: AngularFirestore) { }

  getAllMonsters(): Observable<MonsterData[]> {
    return this.af.collection<MonsterData>(MONSTERS_COLLECTION).valueChanges();
  }

  getAllBosses(): Observable<BossData[]> {
    return this.af.collection<BossData>(BOSSES_COLLECTION).valueChanges();
  }

  getParty(): Observable<Party> {
    return this.af.collection(PARTIES_COLLECTION).doc<Party>(DEFAULT_PARTY).valueChanges();
  }
}
