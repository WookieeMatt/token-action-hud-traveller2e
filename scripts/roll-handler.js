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
        async handleActionClick(event, encodedValue) {
            const [actionTypeId, actionId] = encodedValue.split('|')

            const knownCharacters = ['traveller']

            // If single actor is selected
            if (this.actor) {
                await this.#handleAction(event, this.actor, actionTypeId, actionId)
                return
            }

            const controlledTokens = canvas.tokens.controlled
                .filter((token) => knownCharacters.includes(token.actor?.type))

            // If multiple actors are selected
            for (const token of controlledTokens) {
                const actor = token.actor
                await this.#handleAction(event, actor, actionTypeId, actionId)
            }
        }

        /**
         * Handle action hover
         * Called by Token Action HUD Core when an action is hovered on or off
         * @override
         * @param {object} event        The event
         * @param {string} encodedValue The encoded value
         */
        async handleActionHover(event, encodedValue) { }

        /**
         * Handle group click
         * Called by Token Action HUD Core when a group is right-clicked while the HUD is locked
         * @override
         * @param {object} event The event
         * @param {object} group The group
         */
        async handleGroupClick(event, group) { }

        /**
         * Handle action
         * @private
         * @param {object} event        The event
         * @param {object} actor        The actor
         * @param {string} actionTypeId The action type id
         * @param {string} actionId     The actionId
         */
        async #handleAction(event, actor, actionTypeId, actionId) {
            switch (actionTypeId) {
                case 'characteristics':
                    await this.#handleCharacteristicsAction(event, actor, actionId);
                    break
                case 'skills':
                    await this.#handleSkillsAction(event, actor, actionId)
                    break
                case 'attacks':
                    this.#handleAttacksAction(actor, actionId)
                    break
                case 'inUse':
                case 'carried':
                case 'owned':
                    await this.#handleEquipmentsAction(event, actor, actionId)
                    break
                case 'utility':
                    await this.#handleUtilityAction(event, actor, actionId)
                    break
                default:
                    break
            }
        }

        async #handleCharacteristicsAction(event, actor, actionId) {
            const mockEvent = {
                shiftKey: event.shiftKey,
                ctrlKey: event.ctrlKey,
                currentTarget: {
                    dataset: {
                        cha: actionId,
                        label: actionId,
                        roll: `2D6+@${actionId}`,
                    }
                },
                preventDefault: () => { }
            }

            actor.sheet._onRollWrapper(mockEvent, actor)
        }

        async #handleSkillsAction(event, actor, actionId) {
            const skill = actor.system.skills[actionId]
            const label = `${skill.default} ${skill.trained ? '+' : '-'} '${skill.trained ? skill.value : -3}`

            const mockEvent = {
                shiftKey: event.shiftKey,
                ctrlKey: event.ctrlKey,
                currentTarget: {
                    dataset: {
                        label,
                        skill: actionId,
                        roll: '2D6',
                        rollType: 'skill'
                    }
                },
                preventDefault: () => { }
            }

            actor.sheet._onRollWrapper(mockEvent, actor)
        }

        async #handleAttacksAction(actor, actionId) {
            const item = actor.items.get(actionId)
            await item.roll()
        }

        async #handleEquipmentsAction(event, actor, actionId) {
            const item = actor.items.get(actionId)
            let status = undefined

            switch (item.system.status) {
                case 'equipped':
                    if (event.button === 2)
                        status = 'carried'
                    break
                case 'carried':
                    if (event.button === 0)
                        status = 'equipped'
                    else
                        status = 'owned'
                    break
                case 'owned':
                    if (event.button === 0)
                        status = 'carried'
                    break
                default:
                    break
            }

            if (status)
                actor.sheet._setItemStatus(actor, item, status)
        }

        async #handleUtilityAction(_event, actor, actionId) {
            switch (actionId) {
                case 'initiative':
                    await actor.rollInitiative()
                    break
                default:
                    break
            }
        }
    }
})
