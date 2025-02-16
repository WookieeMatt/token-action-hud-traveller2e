// System Module Imports
import { Utils } from './utils.js'

export let ActionHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    /**
     * Extends Token Action HUD Core's ActionHandler class and builds system-defined actions for the HUD
     */
    ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {
        /**
         * Build system actions
         * Called by Token Action HUD Core
         * @override
         * @param {array} groupIds
         */
        async buildSystemActions(groupIds) {
            // Set actor and token variables
            this.actors = (!this.actor) ? this._getActors() : [this.actor]
            this.actorType = this.actor?.type

            this.displayUnequipped = Utils.getSetting('displayUnequipped')

            // Set items variable
            if (this.actor) {
                let items = this.actor.items
                items = coreModule.api.Utils.sortItemsByName(items)
                this.items = items
            }

            if (this.actorType === 'traveller') {
                this.#buildCharacterActions()
            } else if (!this.actor) {
                this.#buildMultipleTokenActions()
            }
        }

        /**
         * Build character actions
         * @private
         */
        #buildCharacterActions() {
            this.buildAttributes()
            this.buildAttacks()
            this.buildEquipment()
            this.buildUtility()
        }

        async buildAttributes() {
            const buildCharacteristics = async () => {
                const characteristics = []

                for (const [id, characteristic] of Object.entries(this.actor.system.characteristics)) {
                    if (!characteristic.show)
                        continue

                    const characteristicName = coreModule.api.Utils.i18n(`MGT2.Characteristics.${id}`)

                    // Add tooltip to characteristics
                    const tooltip = {
                        content: '' + characteristic.dm + '',
                        direction: 'LEFT'
                    }
                    characteristics.push({
                        name: characteristicName,
                        id,
                        tooltip,
                        encodedValue: ['characteristics', id].join(this.delimiter)
                    })
                }

                await this.addActions(characteristics, { id: 'characteristics', type: 'system' })
            }

            const buildSkills = async () => {
                const skills = []

                for (const [id, _] of Object.entries(this.actor.system.skills)) {
                    if (id === 'untrained' && coreModule.api.Utils.i18n(`MGT2.Skills.${id}`) === 'Untrained')
                        continue

                    let skillName = coreModule.api.Utils.i18n(`MGT2.Skills.${id}`)
                    if (skillName === `MGT2.Skills.${id}`)
                        skillName = id

                    // Add tooltip to skills
                    const tooltip = {
                        content: '' + skillName + '',
                        direction: 'LEFT'
                    }
                    skills.push({
                        name: skillName,
                        id,
                        tooltip,
                        encodedValue: ['skills', id].join(this.delimiter)
                    })
                }

                await this.addActions(skills, { id: 'skills', type: 'system' })
            }

            await buildCharacteristics()
            await buildSkills()
        }

        async buildAttacks() {
            const attacks = []

            for (const [id, item] of this.items.entries()) {
                const status = item.system.status
                const type = item.type
                if (status !== 'equipped' || type !== 'weapon') {
                    continue
                }

                const tooltip = {
                    content: '' + item.name + '',
                    direction: 'LEFT'
                }

                attacks.push({
                    name: item.name,
                    id,
                    img: item.img,
                    tooltip,
                    encodedValue: ['attacks', id].join(this.delimiter)
                })
            }

            await this.addActions(attacks.sort((a, b) => a.name.localeCompare(b.name)), { id: 'attacks', type: 'system' })
        }

        async buildEquipment() {
            const buildInUse = async () => {
                const items = []

                for (const [id, item] of this.items.entries()) {
                    const status = item.system.status
                    if (status !== 'equipped') {
                        continue
                    }

                    // Add tooltip to items in use
                    const tooltip = {
                        content: '' + item.name + '',
                        direction: 'LEFT'
                    }

                    items.push({
                        name: item.name,
                        id,
                        img: item.img,
                        tooltip,
                        encodedValue: ['inUse', id].join(this.delimiter)
                    })
                }

                await this.addActions(items.sort((a, b) => a.name.localeCompare(b.name)), { id: 'inUse', type: 'system' })
            }

            const buildCarried = async () => {
                const items = []

                for (const [id, item] of this.items.entries()) {
                    const status = item.system.status
                    if (status !== 'carried') {
                        continue
                    }

                    // Add tooltip to carried items
                    const tooltip = {
                        content: '' + item.name + '',
                        direction: 'LEFT'
                    }

                    items.push({
                        name: item.name,
                        id,
                        img: item.img,
                        tooltip,
                        encodedValue: ['carried', id].join(this.delimiter)
                    })
                }

                await this.addActions(items.sort((a, b) => a.name.localeCompare(b.name)), { id: 'carried', type: 'system' })
            }

            const buildOwned = async () => {
                const items = []

                for (const [id, item] of this.items.entries()) {
                    const status = item.system.status
                    if (status !== 'owned') {
                        continue
                    }

                    // Add tooltip to owned items
                    const tooltip = {
                        content: '' + item.name + '',
                        direction: 'LEFT'
                    }

                    items.push({
                        name: item.name,
                        id,
                        img: item.img,
                        tooltip,
                        encodedValue: ['owned', id].join(this.delimiter)
                    })
                }

                await this.addActions(items.sort((a, b) => a.name.localeCompare(b.name)), { id: 'owned', type: 'system' })
            }

            await buildInUse()
            await buildCarried()
            await buildOwned()
        }

        async buildUtility() {
            const utilities = [
                {
                    name: coreModule.api.Utils.i18n('tokenActionHud.traveller.initiative'),
                    id: 'initiative',
                    tooltip: {
                        content: '' + coreModule.api.Utils.i18n('tokenActionHud.traveller.initiative') + '',
                        direction: 'LEFT'
                    },
                    encodedValue: ['utility', 'initiative'].join(this.delimiter)
                }
            ]

            await this.addActions(utilities, { id: 'utility', type: 'system' })
        }

        /**
         * Build multiple token actions
         * @private
         * @returns {object}
         */
        #buildMultipleTokenActions() {
        }
    }
})
