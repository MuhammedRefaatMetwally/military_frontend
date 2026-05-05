type BasketRule = {
  basket: string;
  support: number;
  confA: number;
  confB: number;
  lift: number;
};

const RULE_SEPARATOR = " \u2192 ";
const GENERATED_RULE_COUNT = 486;

const baseRules: BasketRule[] = [
  {
    basket: `جبنة${RULE_SEPARATOR}عصير`,
    support: 0.371,
    confA: 22.65,
    confB: 22.79,
    lift: 8.88,
  },
  {
    basket: `حليب${RULE_SEPARATOR}عصير`,
    support: 0.335,
    confA: 18.35,
    confB: 19.3,
    lift: 2.29,
  },
  {
    basket: `جبنة${RULE_SEPARATOR}حليب`,
    support: 0.312,
    confA: 15.42,
    confB: 16.8,
    lift: 2.11,
  },
  {
    basket: `عصير${RULE_SEPARATOR}شامبو`,
    support: 0.228,
    confA: 8.62,
    confB: 8.37,
    lift: 1.88,
  },
  {
    basket: `أرز${RULE_SEPARATOR}زيت نباتي`,
    support: 0.222,
    confA: 6.54,
    confB: 6.36,
    lift: 1.88,
  },
  {
    basket: `سكر${RULE_SEPARATOR}عصير`,
    support: 0.225,
    confA: 6.55,
    confB: 6.55,
    lift: 1.87,
  },
  {
    basket: `خبز${RULE_SEPARATOR}حليب`,
    support: 0.223,
    confA: 6.34,
    confB: 6.57,
    lift: 1.87,
  },
  {
    basket: `عصير${RULE_SEPARATOR}بيض`,
    support: 0.217,
    confA: 6.39,
    confB: 6.3,
    lift: 1.86,
  },
  {
    basket: `أرز${RULE_SEPARATOR}دجاج`,
    support: 0.221,
    confA: 6.3,
    confB: 6.53,
    lift: 1.86,
  },
  {
    basket: `تونة${RULE_SEPARATOR}أرز`,
    support: 0.219,
    confA: 6.2,
    confB: 6.48,
    lift: 1.85,
  },
  {
    basket: `مكرونة${RULE_SEPARATOR}كاتشب`,
    support: 0.221,
    confA: 6.22,
    confB: 6.52,
    lift: 1.85,
  },
  {
    basket: `طحينة${RULE_SEPARATOR}لبنة`,
    support: 0.221,
    confA: 8.24,
    confB: 6.52,
    lift: 1.84,
  },
  {
    basket: `زبدة${RULE_SEPARATOR}خبز`,
    support: 0.22,
    confA: 6.48,
    confB: 6.23,
    lift: 1.84,
  },
  {
    basket: `صابون${RULE_SEPARATOR}شامبو`,
    support: 0.218,
    confA: 6.22,
    confB: 6.48,
    lift: 1.83,
  },
];

const expandRules = (seedRules: BasketRule[], count: number): BasketRule[] => {
  const generated: BasketRule[] = [];

  for (let group = 1; generated.length < count; group += 1) {
    for (const [seedIndex, seed] of seedRules.entries()) {
      if (generated.length >= count) break;

      const [source, target] = seed.basket.split(RULE_SEPARATOR);
      const variation = ((group + seedIndex) % 7) * 0.0045;

      generated.push({
        basket: `${source} ${group}${RULE_SEPARATOR}${target} ${group}`,
        support: Number(Math.max(0.024, seed.support - variation).toFixed(3)),
        confA: Number(Math.max(2.4, seed.confA - variation * 18).toFixed(2)),
        confB: Number(Math.max(2.4, seed.confB - variation * 16).toFixed(2)),
        lift: Number(Math.max(1.12, seed.lift - variation * 2.6).toFixed(2)),
      });
    }
  }

  return generated;
};

export const rules: BasketRule[] = [
  ...baseRules,
  ...expandRules(baseRules, GENERATED_RULE_COUNT),
];
