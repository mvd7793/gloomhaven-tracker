import { Component, OnInit } from '@angular/core';
import { DbService } from './services/db.service';
import { Observable } from 'rxjs';
import { Monster } from './db/monster';
import { MonsterData, MonsterType, EnemyData } from '../types/monsters';
import { max } from 'rxjs/operators';
import { ScenarioMonsterData, Party, ScenarioBossData } from '../types/party';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/public_api';
import { StatusEffect } from '../types/status';

@Component({
  selector: 'party-manager',
  templateUrl: './party-manager.component.html',
  styleUrls: ['./party-manager.component.scss']
})
export class PartyManagerComponent implements OnInit {

  private partyEnemies$: Observable<Monster[]>;
  private partyEnemies: Monster[] = [];

  public monstersByClass: Map<MonsterData, Monster[]> = new Map();

  public allEnemyData: Observable<EnemyData[]>;
  public createEnemyData = {} as CreateEnemyData;
  public party: Party;

  constructor(private db: DbService) { }

  ngOnInit() {
    this.partyEnemies$ = this.db.getPartyEnemies();
    this.partyEnemies$.subscribe(partyEnemies => this.onPartyEnemiesUpdate(partyEnemies));
    this.allEnemyData = this.db.getAllEnemies();
    this.db.getParty().subscribe(party => {
      this.party = party;
      if (!this.createEnemyData.level) {
        this.createEnemyData.level = this.party.scenarioLevel;
      }
    });

    this.initializeChromecast();
  }

  createEnemies() {
    const newMonsters = [];
    for (let i = 0; i < this.createEnemyData.numMonsters; i++) {
      if (this.createEnemyData.isBoss) {
        const data: ScenarioBossData = {
          id: '', // Generated in the service
          bossClass: this.createEnemyData.bossClass,
          level: this.createEnemyData.level,
          statuses: [],
        };
        newMonsters.push(data);
      } else {
        const data: ScenarioMonsterData = {
          id: '', // Generated in the service
          tokenId: this.getNextTokenId(this.createEnemyData.monsterClass),
          monsterClass: this.createEnemyData.monsterClass,
          level: this.createEnemyData.level,
          type: this.createEnemyData.elite ? MonsterType.ELITE : MonsterType.NORMAL,
          statuses: [],
        };
        newMonsters.push(data);
      }
    }
    this.db.createPartyEnemies(newMonsters);
    this.createEnemyData = {
      level: this.party.scenarioLevel,
    } as CreateEnemyData;
  }

  onCreateEnemySelected(evt: TypeaheadMatch) {
    this.db.getMonsterDataById(evt.item.id).subscribe(monsterData => {
      if (monsterData) {
        this.createEnemyData.monsterClass = evt.item.id;
        this.createEnemyData.isBoss = false;
      } else {
        this.createEnemyData.bossClass = evt.item.id;
        this.createEnemyData.isBoss = true;
      }
    });
  }

  deleteAllMonsters() {
    if (confirm('Are you sure you wish to delete all monsters? THIS WILL CLEAR ALL HEALTH TRACKING.')) {
      if (confirm('Are you *absolutely sure* you want to irrevocably delete everything?')) {
        this.db.deletePartyEnemies();
      }
    }
  }

  /**
   * Returns the next unused token for the given monster type.
   */
  private getNextTokenId(enemyClass: string): number {
    const usedNumbers = new Set(this.partyEnemies
      .filter(monster => monster.getClassId() === enemyClass)
      .map(monster => monster.getTokenId()));
    // Return the next available number starting from 1 since tokens begin at 1.
    let maxUnusedNum = 1;
    while (usedNumbers.has(maxUnusedNum)) {
      maxUnusedNum++;
    }
    return maxUnusedNum;
  }

  private onPartyEnemiesUpdate(partyEnemies: Monster[]) {
    this.partyEnemies = partyEnemies;
    const monstersByClassId: Map<string, Monster[]> = new Map();
    for (const monster of partyEnemies) {
      if (monstersByClassId.has(monster.getClassId())) {
        monstersByClassId.get(monster.getClassId()).push(monster);
      } else {
        monstersByClassId.set(monster.getClassId(), [monster]);
      }
    }

    const monstersByClass: Map<MonsterData, Monster[]> = new Map();
    for (const [enemyClass, monsters] of monstersByClassId.entries()) {
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

interface CreateEnemyData {
  monsterClass: string;
  bossClass: string;

  numMonsters: number;
  level: number;
  elite: boolean;

  // UI-only
  isBoss: boolean;
  // Included for autocomplete component.
  enemyName: string;
}
