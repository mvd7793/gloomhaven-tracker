import { Component, OnInit, Input } from '@angular/core';
import { Monster } from '../db/monster';

@Component({
  selector: 'monster-cell',
  templateUrl: './monster-cell.component.html',
  styleUrls: ['./monster-cell.component.scss']
})
export class MonsterCellComponent implements OnInit {

  @Input()
  monster: Monster;

  constructor() { }

  ngOnInit() {
  }

}
