const effectIdMap: Map<string, StatusEffect> = new Map();

export class StatusEffect {
    public static ADD_TARGET: StatusEffect = new StatusEffect("add_target", 'Add Target');
    public static BLESS: StatusEffect = new StatusEffect('bless', 'Blessed');
    public static CURSE: StatusEffect = new StatusEffect('curse', 'Cursed');
    public static DISARM: StatusEffect = new StatusEffect('disarm', 'Disarmed');
    public static IMMOBILIZE: StatusEffect = new StatusEffect('immobilize', 'Immobilized');
    public static INVISIBILITY: StatusEffect = new StatusEffect('invisibility', 'Invisible');
    public static MUDDLE: StatusEffect = new StatusEffect('muddle', 'Muddled');
    public static PIERCE: StatusEffect = new StatusEffect('pierce', 'Pierce');
    public static POISON: StatusEffect = new StatusEffect('poison', 'Poisoned');
    public static PULL: StatusEffect = new StatusEffect('pull', 'Pull');
    public static PUSH: StatusEffect = new StatusEffect('push', 'Push');
    public static STRENGTH: StatusEffect = new StatusEffect('strength', 'Strength');
    public static STUN: StatusEffect = new StatusEffect('stun', 'Stunned');
    public static WOUND: StatusEffect = new StatusEffect('wound', 'Wounded');

    private constructor(public id: string, public displayName: string) {
        effectIdMap.set(id, this);
    }

    public static getEffectById(id: string): StatusEffect {
        return effectIdMap.get(id);
    }

    public static getAllStatuses(): StatusEffect[] {
        return Array.from(effectIdMap.values());
    }

    public getImgPath(): string {
        return `assets/statuses/${this.id}.png`;
    }
}