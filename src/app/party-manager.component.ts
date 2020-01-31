import { Component, OnInit } from '@angular/core';
import { DbService } from './services/db.service';
import { Observable } from 'rxjs';
import { Monster } from './db/monsters';
import { MonsterData, MonsterType } from '../types/monsters';
import { max } from 'rxjs/operators';
import { ScenarioMonsterData } from '../types/party';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/public_api';

@Component({
  selector: 'party-manager',
  templateUrl: './party-manager.component.html',
  styleUrls: ['./party-manager.component.scss']
})
export class PartyManagerComponent implements OnInit {

  private partyMonsters$: Observable<Monster[]>;
  private partyMonsters: Monster[] = [];

  // TODO(mdierker): Figure out how to fix this.
  public monsterClassList: MonsterData[];
  public monstersByClass: Map<MonsterData, Monster[]> = new Map();

  public allMonsterData: Observable<MonsterData[]>;
  public createMonsterData = {} as CreateMonsterData;

  constructor(private db: DbService) { }

  ngOnInit() {
    this.partyMonsters$ = this.db.getPartyMonsters();
    this.partyMonsters$.subscribe(partyMonsters => this.onPartyMonstersUpdate(partyMonsters));
    this.allMonsterData = this.db.getAllMonsters();
  }

  createMonsters() {
    const newMonsters = [];
    let tokenId = this.getNextTokenId(this.createMonsterData.monsterId);
    for (let i = 0; i < this.createMonsterData.numMonsters; i++) {
      const scenarioData: ScenarioMonsterData = {
        id: '', // Generated in the service
        tokenId: tokenId++,
        monsterId: this.createMonsterData.monsterId,
        level: this.createMonsterData.level,
        type: this.createMonsterData.elite ? MonsterType.ELITE : MonsterType.NORMAL,
      };
      newMonsters.push(scenarioData);
    }
    this.db.createPartyMonsters(newMonsters);
    this.createMonsterData = {} as CreateMonsterData;
  }

  onCreateMonsterSelected(evt: TypeaheadMatch) {
    this.createMonsterData.monsterId = evt.item.id;
  }

  deleteAllMonsters() {
    if (confirm('Are you sure you wish to delete all monsters? THIS WILL CLEAR ALL HEALTH TRACKING.')) {
      if (confirm('Are you *absolutely sure* you want to irrevocably delete everything?')) {
        this.db.deletePartyMonsters();
      }
    }
  }

  changeHealth(monster: Monster, amount: number) {
    monster.setHealth(monster.getHealth() + amount);
    this.db.saveMonster(monster);
  }

  /**
   * Returns the next unused token for the given monster type. 
   */
  private getNextTokenId(monsterId: string): number {
    const usedNumbers = new Set(this.partyMonsters
      .filter(monster => monster.getMonsterId() == monsterId)
      .map(monster => monster.getTokenId()));
    // Return the next available number starting from 0 since tokens begin at 0.
    let maxUnusedNum = 0;
    while (usedNumbers.has(maxUnusedNum)) {
      maxUnusedNum++;
    }
    return maxUnusedNum;
  }

  private onPartyMonstersUpdate(partyMonsters: Monster[]) {
    this.partyMonsters = partyMonsters;
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
      const sortedMonsters = monsters.sort((m1, m2) => m1.getTokenId() - m2.getTokenId());
      monstersByClass.set(monsters[0].getGenericMonsterData(), sortedMonsters);
    }
    this.monstersByClass = monstersByClass;
    this.monsterClassList = Array.from(this.monstersByClass.keys());
  }
}

interface CreateMonsterData {
  monsterId: string;
  monsterName: string;
  numMonsters: number;
  level: number;
  elite: boolean;
}
