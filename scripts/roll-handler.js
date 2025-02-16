export let RollHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    /**
     * Extends Token Action HUD Core's RollHandler class and handles action events triggered when an action is clicked
     */
    RollHandler = class RollHandler extends coreModule.api.RollHandler {
        /**
         * Handle action click
         * Called by Token Action HUD Core when an action is left or right-clicked
         * @override
         * @param {object} event        The event
         * @param {string} encodedValue The encoded value
         */
        async handleActionClick (event, encodedValue) {
            const [actionTypeId, actionId] = encodedValue.split('|')

            const knownCharacters = ['agent']

            // If single actor is selected
            if (this.actor) {
                await this.#handleAction(this.actor, actionTypeId, actionId)
                return
            }

            const controlledTokens = canvas.tokens.controlled
                .filter((token) => knownCharacters.includes(token.actor?.type))

            // If multiple actors are selected
            for (const token of controlledTokens) {
                const actor = token.actor
                await this.#handleAction(actor, actionTypeId, actionId)
            }
        }

        /**
         * Handle action hover
         * Called by Token Action HUD Core when an action is hovered on or off
         * @override
         * @param {object} event        The event
         * @param {string} encodedValue The encoded value
         */
        async handleActionHover (event, encodedValue) { }

        /**
         * Handle group click
         * Called by Token Action HUD Core when a group is right-clicked while the HUD is locked
         * @override
         * @param {object} event The event
         * @param {object} group The group
         */
        async handleGroupClick (event, group) { }

        /**
         * Handle action
         * @private
         * @param {object} event        The event
         * @param {object} actor        The actor
         * @param {string} actionTypeId The action type id
         * @param {string} actionId     The actionId
         */
        async #handleAction (actor, actionTypeId, actionId) {
            switch (actionTypeId) {
                case 'attributes':
                    await this.#handleAttributessAction(actor, actionId)
                    break
                case 'skills':
                    await this.#handleSkillsAction(actor, actionId)
                    break
                default:
                    await this.#handleItemsAction(actor, actionId)
                    break
            }
        }

        /**
         * Handle Attribute action
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #handleAttributessAction (actor, actionId) {
            let rollMod = 0
            try {
                rollMod = await foundry.applications.api.DialogV2.prompt({
                    window: { title: coreModule.api.Utils.i18n('tokenActionHud.op.addBonus') },
                    content: '<input name="mod" type="number" value="0" min="-5" max="5" step="1" autofocus>',
                    ok: {
                        label: coreModule.api.Utils.i18n('tokenActionHud.op.roll'),
                        callback: (_event, button, _dialog) => button.form.elements.mod.valueAsNumber
                    }
                })
            } catch {
                rollMod = 0
            }

            const attribute = actor.system.attributes[actionId]
            const attributeName = coreModule.api.Utils.i18n(`op.att${actionId.replace(/^./, actionId[0].toUpperCase())}`)
            let formula = `${attribute.value === 0 ? 2 : attribute.value}d20${attribute.value === 0 ? 'kl' : 'kh'}`
            if (rollMod > 0) {
                if (attribute.value === 0) {
                    rollMod -= 1
                    formula = `${rollMod}d20kh`
                } else {
                    const newMod = Number(formula.charAt(0)) + rollMod
                    formula = `${newMod}${formula.slice(1)}`
                }
            } else if (rollMod < 0) {
                if (attribute.value === 0) {
                    const newMod = Number(formula.charAt(0)) - rollMod
                    formula = `${newMod}${formula.slice(1)}`
                } else {
                    const currentMod = Number(formula.charAt(0))
                    rollMod = -rollMod
                    if (currentMod === 1) {
                        rollMod += 1
                    } else {
                        rollMod -= currentMod - 1
                    }
                    formula = `${rollMod}d20kl`
                }
            }

            await new Roll(formula).toMessage({
                speaker: ChatMessage.getSpeaker(),
                flavor: `${coreModule.api.Utils.i18n('tokenActionHud.op.rolling')} ${attributeName}`
            })
        }

        /**
         * Handle Skill action
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #handleSkillsAction(actor, actionId) {
            if (actionId === 'initiative' && actor.inCombat) {
                await actor.rollInitiative()
                return
            }

            const rollData = actor.system.skills[actionId]
            await new Roll(rollData.formula).toMessage({
                speaker: ChatMessage.getSpeaker(),
                flavor: `${coreModule.api.Utils.i18n('tokenActionHud.op.rolling')} ${rollData.label}`
            })
        }

        /**
         * Handle Item action
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #handleItemsAction(actor, actionId) {
            const item = actor.items.get(actionId)
            item.roll()
        }
    }
})
