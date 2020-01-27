import { Injectable } from '@angular/core';
import { DbService } from './db.service';

@Injectable({
  providedIn: 'root'
})
export class ScenarioService {

  constructor(private db: DbService) { }

  // getMonsters(): Observable<Monster[]> {
  //   return null;
  // }
}
