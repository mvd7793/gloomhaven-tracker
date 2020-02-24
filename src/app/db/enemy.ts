import { StatusEffect } from '../../types/status';
import { ScenarioEnemyData } from '../../types/party';

export interface Enemy {
    /** Returns a globally unique ID for the enemy. */
    getScenarioId(): string;

    /** Returns a class ID that can be used for grouping by class. */
    getClassId(): string;

    /** Returns the enemy's current health. */
    getHealth(): number;

    /** Sets an enemy's current health. */
    setHealth(health: number);

    /** Returns the enemy's max health. */
    getMaxHealth(): number;

    /** Returns the enemy's class display name. */
    getDisplayName(): string;

    /** Returns the active statuses currently affecting an enemy. */
    getStatuses(): StatusEffect[];

    /** True if the given status is currently affecting the enemy. */
    hasStatus(status: StatusEffect): boolean;

    /** Activates or deactivates a status on an enemy. */
    setStatus(status: StatusEffect, active: boolean);

    isDead(): boolean;

    onNewScenarioData(data: ScenarioEnemyData);
}
