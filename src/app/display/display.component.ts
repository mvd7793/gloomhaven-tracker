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

  constructor(private db: DbService) {
  }

  ngOnInit() {
    this.party_ = this.db.getParty();
    this.party_.subscribe(party => this.onPartyUpdate(party));
  }

  onPartyUpdate(party: Party) {
    this.party = party;

    this.onMonsterUpdate(party);


  }

  /**
   * Take new MonsterData and update or create Monster wrapper objects.
   */
  private onMonsterUpdate(party: Party) {
    for (const monsterData of this.party.monsters) {
      console.log(monsterData, this.monsterIdMap);
      if (this.monsterIdMap.has(monsterData.id)) {
        this.monsterIdMap.get(monsterData.id).onNewScenarioData(monsterData);
      } else {
        const monster = new Monster(monsterData, this.db);
        this.monsterIdMap.set(monsterData.id, monster);
      }
    }

    this.updateMonsterUiList();
  }

  private async updateMonsterUiList() {
    const monsterList = this.monsterIdMap.values();
    const monstersByMonsterId: Map<string, Monster[]> = new Map();

    for (const monster of monsterList) {
      if (monstersByMonsterId.has(monster.getMonsterId())) {
        const existingMonsters = monstersByMonsterId.get(monster.getMonsterId());
        existingMonsters.push(monster);
        monstersByMonsterId.set(monster.getMonsterId(), existingMonsters);
      } else {
        monstersByMonsterId.set(monster.getMonsterId(), [monster]);
      }
    }

    const monstersByClass: Map<MonsterData, Monster[]> = new Map();
    for (const [monsterId, monsters] of monstersByMonsterId.entries()) {
      const monsterData = await this.db.getMonsterDataById(monsterId);
      monstersByClass.set(monsterData, monsters);
    }
    this.monstersByClass = monstersByClass;
    this.monsterClassList = Array.from(this.monstersByClass.keys());
  }

}
