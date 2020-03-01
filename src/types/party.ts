import { MonsterType } from './monsters';

export interface Party {
    averageCharacterLevel: number;
    monsters: ScenarioMonsterData[];
    bosses: ScenarioBossData[];
    numCharacters: number;
    scenarioLevel: number;
}

export interface ScenarioEnemyData {
    /** Local ID of this monster, unique for both bosses and monsters within the current scenario. */
    id: string;

    /** Level of the monster. */
    level: number;

    /** Current health. If missing, uses monster default from the DB. */
    health?: number;

    /** Array of active status IDs. */
    statuses: string[];
}

export interface ScenarioMonsterData extends ScenarioEnemyData {
    /** ID number of the physical token used to represent the monster. */
    tokenId: number;

    /** Type of monster, matching a monsterClass from the monster DB. */
    monsterClass: string;

    /** Type of the monster, either "normal" or "elite". */
    type: MonsterType;
}

export interface ScenarioBossData extends ScenarioEnemyData {
    /** Type of boss, matching a bossClass from the boss DB. */
    bossClass: string;
}
