import React from 'react';
import { Trans } from '@lingui/macro';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

const COOLDOWN_REDUCTION_MS = 1500;

class CrusadersMight extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  effectiveHolyShockReductionMs = 0;
  wastedHolyShockReductionMs = 0;
  effectiveLightOfDawnReductionMs = 0;
  wastedLightOfDawnReductionMs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CRUSADERS_MIGHT_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CRUSADER_STRIKE.id) {
      return;
    }

    const holyShockisOnCooldown = this.spellUsable.isOnCooldown(SPELLS.HOLY_SHOCK_CAST.id);
    if (holyShockisOnCooldown) {
      const reductionMs = this.spellUsable.reduceCooldown(SPELLS.HOLY_SHOCK_CAST.id, COOLDOWN_REDUCTION_MS);
      this.effectiveHolyShockReductionMs += reductionMs;
      this.wastedHolyShockReductionMs += COOLDOWN_REDUCTION_MS - reductionMs;
    } else {
      this.wastedHolyShockReductionMs += COOLDOWN_REDUCTION_MS;
    }
    const lightOfDawnisOnCooldown = this.spellUsable.isOnCooldown(SPELLS.LIGHT_OF_DAWN_CAST.id);
    if (lightOfDawnisOnCooldown) {
      const reductionMs = this.spellUsable.reduceCooldown(SPELLS.LIGHT_OF_DAWN_CAST.id, COOLDOWN_REDUCTION_MS);
      this.effectiveLightOfDawnReductionMs += reductionMs;
      this.wastedLightOfDawnReductionMs += COOLDOWN_REDUCTION_MS - reductionMs;
    } else {
      this.wastedLightOfDawnReductionMs += COOLDOWN_REDUCTION_MS;
    }
  }

  statistic() {
    const formatSeconds = seconds => <Trans>{seconds}s</Trans>;

    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL(75)}
        icon={<SpellIcon id={SPELLS.CRUSADERS_MIGHT_TALENT.id} />}
        value={(
          <>
            {formatSeconds((this.effectiveHolyShockReductionMs / 1000).toFixed(1))}{' '}
            <SpellIcon
              id={SPELLS.HOLY_SHOCK_CAST.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
            {' '}
            {formatSeconds((this.effectiveLightOfDawnReductionMs / 1000).toFixed(1))}{' '}
            <SpellIcon
              id={SPELLS.LIGHT_OF_DAWN_CAST.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
          </>
        )}
        label={<Trans>Cooldown reduction</Trans>}
      />
    );
  }
}

export default CrusadersMight;
