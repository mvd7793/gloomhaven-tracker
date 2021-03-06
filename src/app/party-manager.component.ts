import { Component, OnInit } from '@angular/core';
import { DbService } from './services/db.service';
import { Observable } from 'rxjs';
import { Monster } from './db/monsters';
import { MonsterData, MonsterType } from '../types/monsters';
import { max } from 'rxjs/operators';
import { ScenarioMonsterData, Party } from '../types/party';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/public_api';
import { StatusEffect } from '../types/status';

@Component({
  selector: 'party-manager',
  templateUrl: './party-manager.component.html',
  styleUrls: ['./party-manager.component.scss']
})
export class PartyManagerComponent implements OnInit {

  private partyMonsters$: Observable<Monster[]>;
  private partyMonsters: Monster[] = [];

  public monstersByClass: Map<MonsterData, Monster[]> = new Map();

  public allMonsterData: Observable<MonsterData[]>;
  public createMonsterData = {} as CreateMonsterData;
  public party: Party;

  constructor(private db: DbService) { }

  ngOnInit() {
    this.partyMonsters$ = this.db.getPartyMonsters();
    this.partyMonsters$.subscribe(partyMonsters => this.onPartyMonstersUpdate(partyMonsters));
    this.allMonsterData = this.db.getAllMonsters();
    this.db.getParty().subscribe(party => {
      this.party = party;
      if (!this.createMonsterData.level) {
        this.createMonsterData.level = this.party.scenarioLevel;
      }
    });

    this.initializeChromecast();
  }

  createMonsters() {
    const newMonsters = [];
    for (let i = 0; i < this.createMonsterData.numMonsters; i++) {
      const scenarioData: ScenarioMonsterData = {
        id: '', // Generated in the service
        tokenId: this.getNextTokenId(this.createMonsterData.monsterId),
        monsterId: this.createMonsterData.monsterId,
        level: this.createMonsterData.level,
        type: this.createMonsterData.elite ? MonsterType.ELITE : MonsterType.NORMAL,
        statuses: [],
      };
      newMonsters.push(scenarioData);
    }
    this.db.createPartyMonsters(newMonsters);
    this.createMonsterData = {
      level: this.party.scenarioLevel,
    } as CreateMonsterData;
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

  /**
   * Returns the next unused token for the given monster type.
   */
  private getNextTokenId(monsterId: string): number {
    const usedNumbers = new Set(this.partyMonsters
      .filter(monster => monster.getMonsterId() === monsterId)
      .map(monster => monster.getTokenId()));
    // Return the next available number starting from 1 since tokens begin at 1.
    let maxUnusedNum = 1;
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
  }

  private initializeChromecast() {
    window['__onGCastApiAvailable'] = function(isAvailable) {
      if (isAvailable) {
        // @ts-ignore
        cast.framework.CastContext.getInstance().setOptions({
          receiverApplicationId: '948CAC63',
          // @ts-ignore
          autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
        });
      }
    };
  }
}

interface CreateMonsterData {
  monsterId: string;
  monsterName: string;
  numMonsters: number;
  level: number;
  elite: boolean;
}
