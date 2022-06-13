import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { gameManager } from 'src/app/game/businesslogic/GameManager';
import { EntityValueFunction } from 'src/app/game/model/Entity';
import { Monster } from 'src/app/game/model/Monster';
import { MonsterEntity } from 'src/app/game/model/MonsterEntity';
import { MonsterStat } from 'src/app/game/model/MonsterStat';
import { MonsterType } from 'src/app/game/model/MonsterType';
import { DialogComponent } from 'src/app/ui/dialog/dialog';
import { ghsUnit, ghsUnitUnit } from 'src/app/ui/helper/Static';
import { PopupComponent } from 'src/app/ui/popup/popup';

@Component({
  selector: 'ghs-monster-stats',
  templateUrl: './stats.html',
  styleUrls: [ './stats.scss', '../../../dialog/dialog.scss' ]
})
export class MonsterStatsComponent extends DialogComponent {

  @Input() monster!: Monster;
  MonsterType = MonsterType;

  stats: MonsterStat | undefined = undefined;
  eliteStats: MonsterStat | undefined = undefined;
  statOverview: boolean = false;

  @ViewChild('normalButton', { read: ElementRef }) normalButton!: ElementRef;
  @ViewChild('eliteButton', { read: ElementRef }) eliteButton!: ElementRef;

  levels: number[] = [ 0, 1, 2, 3, 4, 5, 6, 7 ];

  override ngOnInit(): void {
    super.ngOnInit();
    this.setStats();
  }

  setStats() {
    if (this.monster.boss) {
      if (!this.monster.stats.some((monsterStat: MonsterStat) => {
        return monsterStat.level == this.monster.level && monsterStat.type == MonsterType.boss;
      })) {
        throw Error("Could not find '" + MonsterType.boss + "' stats for monster.")
      }

      this.stats = this.monster.stats.filter((monsterStat: MonsterStat) => {
        return monsterStat.level == this.monster.level && monsterStat.type == MonsterType.boss;
      })[ 0 ];
    } else {
      if (!this.monster.stats.some((monsterStat: MonsterStat) => {
        return monsterStat.level == this.monster.level && monsterStat.type == MonsterType.normal;
      })) {
        console.warn(this.monster);
        throw Error("Could not find '" + MonsterType.normal + "' stats for monster: " + this.monster.name + " level: " + this.monster.level)
      }

      if (!this.monster.stats.some((monsterStat: MonsterStat) => {
        return monsterStat.level == this.monster.level && monsterStat.type == MonsterType.elite;
      })) {
        throw Error("Could not find '" + MonsterType.elite + "' stats for monster: " + this.monster.name + " level: " + this.monster.level)
      }

      this.stats = this.monster.stats.filter((monsterStat: MonsterStat) => {
        return monsterStat.level == this.monster.level && monsterStat.type == MonsterType.normal;
      })[ 0 ];

      this.eliteStats = this.monster.stats.filter((monsterStat: MonsterStat) => {
        return monsterStat.level == this.monster.level && monsterStat.type == MonsterType.elite;
      })[ 0 ];
    }
  }

  statsForType(type: MonsterType): MonsterStat {
    if (!this.monster.stats.some((monsterStat: MonsterStat) => {
      return monsterStat.level == this.monster.level && monsterStat.type == type;
    })) {
      throw Error("Could not find '" + type + "' stats for monster: " + this.monster.name + " level: " + this.monster.level);
    }

    let stat: MonsterStat = this.monster.stats.filter((monsterStat: MonsterStat) => {
      return monsterStat.level == this.monster.level && monsterStat.type == type;
    })[ 0 ];

    return stat;
  }

  addMonsterEntity(number: number, type: MonsterType) {
    gameManager.stateManager.before();
    let parent: ElementRef | undefined = undefined;

    if (type == MonsterType.normal) {
      parent = this.normalButton;
    } else if (type == MonsterType.elite) {
      parent = this.eliteButton;
    }
    gameManager.stateManager.after();
  }

  setLevel(value: number) {
    if (value != this.monster.level) {
      gameManager.stateManager.before();
      this.monster.level = value;

      this.setStats();
      this.monster.entities.forEach((monsterEntity: MonsterEntity) => {
        let stat = this.stats;
        if (monsterEntity.type == MonsterType.elite) {
          stat = this.eliteStats;
        }

        if (stat == undefined) {
          throw Error("Could not find '" + monsterEntity.type + "' stats for monster: " + this.monster.name + " level: " + this.monster.level);
        }

        monsterEntity.level = this.monster.level;

        let maxHealth: number;
        if (typeof stat.health === "number") {
          maxHealth = stat.health;
        } else {
          maxHealth = EntityValueFunction(stat.health);
        }

        if (monsterEntity.health == monsterEntity.maxHealth) {
          monsterEntity.health = maxHealth;
        }

        monsterEntity.maxHealth = maxHealth;
        if (monsterEntity.health > monsterEntity.maxHealth) {
          monsterEntity.health = monsterEntity.maxHealth;
        }
      });
      gameManager.stateManager.after();
    }
  }

  hexSize(): number {
    let size = ghsUnit() * 0.5;
    if (ghsUnitUnit() == 'vw') {
      size = window.innerWidth / 100 * ghsUnit() * 0.5;
    }
    return size;
  }

  override close(): void {
    super.close();
    this.statOverview = false;
  }

}

@Component({
  selector: 'ghs-monster-stats-popup',
  templateUrl: './statspopup.html',
  styleUrls: [ './statspopup.scss', '../../../popup/popup.scss' ]
})
export class MonsterStatsPopupComponent extends PopupComponent {

  @Input() monster!: Monster;

  levels: number[] = [ 0, 1, 2, 3, 4, 5, 6, 7 ];

  getMonsterForLevel(level: number): Monster {
    let monster: Monster = new Monster(this.monster);
    monster.level = level;
    return monster;
  }
}