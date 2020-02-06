import { ScenarioMonsterData } from '../../types/party';
import { MonsterStats, MonsterData, MonsterType } from '../../types/monsters';
import { StatusEffect } from '../../types/status';

export class Monster {
    /** Serializable data specific to this instance of the monster. */
    private scenarioData: ScenarioMonsterData;

    /** Stats specific to this level of monster. */
    private monsterStats: MonsterStats;

    constructor(scenarioData: ScenarioMonsterData, private monsterData: MonsterData) {
        this.onNewScenarioData(scenarioData);
    }

    getMonsterId() {
        return this.scenarioData.monsterId;
    }

    getTokenId() {
        return this.scenarioData.tokenId;
    }

    getScenarioId() {
        return this.scenarioData.id;
    }

    getHealth() {
        if (this.scenarioData.health !== undefined) {
            return this.scenarioData.health;
        }
        return this.monsterStats.health;
    }

    getMaxHealth() {
        // Returning the max in case a single monster gets some sort of buff that bumps it above max health.
        if (this.scenarioData.health !== undefined) {
            return Math.max(this.monsterStats.health, this.scenarioData.health);
        }
        return this.monsterStats.health;
    }

    getType(): MonsterType {
        return this.scenarioData.type;
    }

    getDisplayName() {
        return this.monsterData.displayName;
    }

    getStatuses(): StatusEffect[] {
        return this.scenarioData.statuses
            .map(statusId => StatusEffect.getEffectById(statusId));
    }

    hasStatus(status: StatusEffect): boolean {
        return this.scenarioData.statuses.includes(status.id);
    }

    setStatus(status: StatusEffect, active: boolean) {
        if (active && !this.scenarioData.statuses.includes(status.id)) {
            this.scenarioData.statuses.push(status.id);
        } else if (!active && this.scenarioData.statuses.includes(status.id)) {
            this.scenarioData.statuses.splice(this.scenarioData.statuses.indexOf(status.id), 1);
        }
    }

    /**
     * Returns the generic data about this type of monster.
     */
    getGenericMonsterData() {
        return this.monsterData;
    }

    isDead(): boolean {
        return this.getHealth() <= 0;
    }

    compareTo(other: Monster) {
        if (this.isDead() !== other.isDead()) {
            return this.isDead() ? 1 : -1;
        }
        if (this.scenarioData.type !== other.scenarioData.type) {
            return this.scenarioData.type.localeCompare(other.scenarioData.type);
        }
        return this.scenarioData.tokenId - other.scenarioData.tokenId;

    }

    setHealth(health: number) {
        this.scenarioData.health = health;
    }

    /**
     * Returns the data that should be persisted to Firebase for this monster.
     */
    getSaveData(): ScenarioMonsterData {
        return this.scenarioData;
    }

    async onNewScenarioData(data: ScenarioMonsterData) {
        this.scenarioData = data;
        this.monsterStats = this.monsterData.levelStats[data.level][data.type];
    }
}