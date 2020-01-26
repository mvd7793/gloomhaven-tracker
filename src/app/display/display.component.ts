import { Component, OnInit } from '@angular/core';
import { DbService } from '../services/db.service';
import { MonsterData, BossData } from '../../types/monsters';
import { Party } from '../../types/party';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss']
})
export class DisplayComponent implements OnInit {

  allMonsters: MonsterData[] = [];
  allBosses: BossData[] = [];
  party: Party = null;

  constructor(private db: DbService) {

  }

  ngOnInit() {
    this.db.getAllMonsters().subscribe(allMonsters => this.allMonsters = allMonsters);
    this.db.getAllBosses().subscribe(allBosses => this.allBosses = allBosses);
    this.db.getParty().subscribe(party => this.party = party);
  }

}
