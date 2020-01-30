import { Component, OnInit } from '@angular/core';
import { DbService } from '../services/db.service';
import { MonsterData, BossData } from '../../types/monsters';
import { Party } from '../../types/party';
import { Observable } from 'rxjs';
import { Monster } from '../db/monsters';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss']
})
export class DisplayComponent implements OnInit {

  public party: Party;

  // TODO(mdierker): see if there's a better way to do this.
  public monsterClassList: MonsterData[];
  public monstersByClass: Map<MonsterData, Monster[]> = new Map();

  private monsterIdMap: Map<number, Monster> = new Map();
  private party_: Observable<Party>;
  private partyMonsters_: Observable<Monster[]>;

  constructor(private db: DbService) {
  }

  ngOnInit() {
    this.party_ = this.db.getParty();
    this.party_.subscribe(party => this.party = party);
    this.partyMonsters_ = this.db.getPartyMonsters();
    this.partyMonsters_.subscribe(partyMonsters => this.onPartyMonstersUpdate(partyMonsters));
  }

  onPartyUpdate(party: Party) {
    this.party = party;

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
      const sortedMonsters = monsters.sort((m1, m2) => m1.compareTo(m2));
      monstersByClass.set(monsters[0].getGenericMonsterData(), sortedMonsters);
    }
    this.monstersByClass = monstersByClass;
    this.monsterClassList = Array.from(this.monstersByClass.keys());
  }

}
