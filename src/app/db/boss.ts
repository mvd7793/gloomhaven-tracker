import { ScenarioMonsterData, ScenarioBossData, Party } from '../../types/party';
import { MonsterStats, MonsterData, MonsterType, BossStats, BossData } from '../../types/monsters';
import { StatusEffect } from '../../types/status';
import { Enemy } from './enemy';

const BOSS_HEALTH_CHARACTER_REGEX = /(\d+)xC/;

export class Boss implements Enemy {
    /** Serializable data specific to this instance of the boss. */
    private scenarioData: ScenarioBossData;

    /** Stats specific to this level of boss. */
    private bossStats: BossStats;

    constructor(scenarioData: ScenarioBossData, private bossData: BossData, private party: Party) {
        this.onNewScenarioData(scenarioData);
    }

    getClassId() {
        return this.scenarioData.bossClass;
    }

    getScenarioId() {
        return this.scenarioData.id;
    }

    getHealth() {
        if (this.scenarioData.health !== undefined) {
            return this.scenarioData.health;
        }
        return this.getMaxHealth();
    }

    getMaxHealth() {
        // Returning the max in case a single monster gets some sort of buff that bumps it above max health.
        if (this.scenarioData.health !== undefined) {
            return Math.max(this.getBaseMaxHealth(), this.scenarioData.health);
        }
        return this.getBaseMaxHealth();
    }

    private getBaseMaxHealth(): number {
        const match = this.bossStats.health.match(BOSS_HEALTH_CHARACTER_REGEX);
        if (match.length === 2) {
            return this.party.numCharacters * parseInt(match.groups[1], 10);
        }
    }

    getDisplayName() {
        return this.bossData.displayName;
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

    isDead(): boolean {
        return this.getHealth() <= 0;
    }

    compareTo(other: Boss) {
        if (this.isDead() !== other.isDead()) {
            return this.isDead() ? 1 : -1;
        }
        if (this.getClassId() !== other.getClassId()) {
            return this.getClassId().localeCompare(other.getClassId());
        }
        // There can be multiple instances of a boss, but they don't have a tokenId.
        return this.scenarioData.id.localeCompare(other.scenarioData.id);
    }

    setHealth(health: number) {
        this.scenarioData.health = health;
    }

    /**
     * Returns the data that should be persisted to Firebase for this monster.
     */
    getSaveData(): ScenarioBossData {
        return this.scenarioData;
    }

    async onNewScenarioData(data: ScenarioBossData) {
        this.scenarioData = data;
        this.bossStats = this.bossData.levelStats[data.level];
    }

    async onNewParty(party: Party) {
        this.party = party;
    }
}