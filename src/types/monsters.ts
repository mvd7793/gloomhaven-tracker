/**
 * Top level interface for Monster stats.
 */
export interface MonsterData {
    /** lowercase_underscore format name of the monster. */
    id: string;

    /** Display name of the monster. */
    displayName: string;

    /** Level --> stats for a monster. */
    levelStats: {[level: number]: MonsterLevelStats};
}

/**
 * Stats for monsters at a specific level.
 */
export interface MonsterLevelStats {
    normal: MonsterStats,
    elite: MonsterStats,
}

export interface MonsterStats {
    health: number;
    move: number;
    attack: number;
    range: number;
    attributes: string[];
}

/**
 * Enum tracking the valid options for MonsterLevelStats.
 */
export enum MonsterType {
    NORMAL = "normal",
    ELITE = "elite",
}

export interface BossData {
    /** lowercase_underscore format name of the boss. */
    id: string;

    /** Display name of the boss. */
    displayName: string;

    /** Level --> stats r a boss. */
    levelStats: {number: BossStats};
}

export interface BossStats {
    /** Health is in the form "##xC", where C is average character level. */
    health: string;
    move: number;
    // Note... this can be different for some bosses.
    attack: number;
    range: number;
    special1: string[];
    special2: string[];
    immunities: string[];
    notes: '';
}