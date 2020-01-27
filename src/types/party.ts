import { MonsterType } from './monsters';

export interface Party {
    averageCharacterLevel: number;
    monsters: ScenarioMonsterData[]
    bosses: ScenarioBossData[];
}

export interface ScenarioMonsterData {
    /** Local ID of this monster, unique for both bosses and monsters within the current scenario. */
    id: number;

    /** ID number of the physical token used to represent the monster. */
    tokenId: number;

    /** Type of monster, matching a monsterId from the monster DB. */
    monsterId: string;

    /** Level of the monster. */
    level: number;

    /** Type of the monster, either "normal" or "elite". */
    type: MonsterType;

    /** Current health. If missing, uses monster default from the DB. */
    health?: number;
}

export interface ScenarioBossData {
    /** Local ID of this boss, unique for both bosses and monsters within the current scenario. */
    id: number;

    /** Type of boss, matching a bossId from the boss DB. */
    monsterId: string;

    /** Current health. If missing, uses boss default from the DB. */
    health?: number;
}