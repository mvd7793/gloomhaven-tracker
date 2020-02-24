import { Component, OnInit, Input } from '@angular/core';
import { Monster } from '../db/monsters';
import { DbService } from '../services/db.service';
import { StatusEffect } from '../../types/status';

@Component({
  selector: 'party-monster-cell',
  templateUrl: './party-monster-cell.component.html',
  styleUrls: ['./party-monster-cell.component.scss']
})
export class PartyMonsterCellComponent implements OnInit {

  @Input()
  public monster: Monster;

  public allStatuses: StatusEffect[];
  public statusesVisible = false;

  constructor(private db: DbService) { }

  ngOnInit() {
    this.allStatuses = StatusEffect.getAllStatuses();
  }

  changeHealth(amount: number) {
    this.monster.setHealth(this.monster.getHealth() + amount);
    this.db.saveMonster(this.monster);
  }

  toggleStatusesVisible() {
    this.statusesVisible = !this.statusesVisible;
  }

  toggleStatus(status: StatusEffect) {
    if (this.monster.hasStatus(status)) {
      this.monster.setStatus(status, false);
    } else {
      this.monster.setStatus(status, true);
    }
    this.db.saveMonster(this.monster);
    this.statusesVisible = false;
  }

}
