import { ScenarioMonsterData } from '../../types/party';
import { DbService } from '../services/db.service';
import { MonsterStats, MonsterData, MonsterType } from '../../types/monsters';
import { Observable } from 'rxjs';

export class Monster {
    /** Serializable data specific to this instance of the monster. */
    private scenarioData: ScenarioMonsterData;

    /** General data for this type of monster. */
    private monsterData: MonsterData;
    /** Stats specific to this level of monster. */
    private monsterStats: MonsterStats;

    constructor(scenarioData: ScenarioMonsterData, private db: DbService) {
        this.scenarioData = scenarioData;
        this.onNewScenarioData(scenarioData);
    }

    getMonsterId() {
        return this.scenarioData.monsterId;
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

    // TODO(mdierker): Use this.
    saveData(): ScenarioMonsterData {
        return this.scenarioData;
    }

    async onNewScenarioData(data: ScenarioMonsterData) {
        const monsterData = await this.db.getMonsterDataById(data.monsterId);

        this.scenarioData = data;
        this.monsterData = monsterData;
        this.monsterStats = monsterData.levelStats[data.level][data.type];
    }
}