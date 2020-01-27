import { Component, OnInit } from '@angular/core';
import { DbService } from './services/db.service';
import { Observable } from 'rxjs';
import { Monster } from './db/monsters';
import { MonsterData } from '../types/monsters';

@Component({
  selector: 'party-manager',
  templateUrl: './party-manager.component.html',
  styleUrls: ['./party-manager.component.scss']
})
export class PartyManagerComponent implements OnInit {

  private partyMonsters_: Observable<Monster[]>;

  // TODO(mdierker): Figure out how to fix this.
  public monsterClassList: MonsterData[];
  public monstersByClass: Map<MonsterData, Monster[]> = new Map();

  constructor(private db: DbService) { }

  ngOnInit() {
    this.partyMonsters_ = this.db.getPartyMonsters();
    this.partyMonsters_.subscribe(partyMonsters => this.onPartyMonstersUpdate(partyMonsters));
  }

  private onPartyMonstersUpdate(partyMonsters: Monster[]) {
    const monstersByClassId: Map<string, Monster[]> = new Map();
    for (const monster of partyMonsters) {
      if (monstersByClassId.has(monster.getMonsterId())) {
        monstersByClassId.get(monster.getMonsterId()).push(monster);
      } else {
        monstersByClassId.set(monster.getMonsterId(), [monster]);
      }
    }

    const monstersByClass: Map<MonsterData, Monster[]> = new Map();
    for (const [monsterId, monsters] of monstersByClassId.entries()) {
      const monsterData = this.db.getMonsterDataById(monsterId);
      const sortedMonsters = monsters.sort((m1, m2) => m1.getTokenId() - m2.getTokenId());
      monstersByClass.set(monsterData, sortedMonsters);
    }
    this.monstersByClass = monstersByClass;
    console.log('by class', this.monstersByClass);
    this.monsterClassList = Array.from(this.monstersByClass.keys());
  }

}
