import { GROUP } from './constants.js'

/**
 * Default layout and groups
 */
export let DEFAULTS = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    const groups = GROUP
    Object.values(groups).forEach((group) => {
        group.name = coreModule.api.Utils.i18n(group.name)
        group.listName = `Group: ${coreModule.api.Utils.i18n(group.listName ?? group.name)}`
    })

    const groupsArray = Object.values(groups)
    // This is the group hierarchy
    DEFAULTS = {
        layout: [
            {
                nestId: 'attributes',
                id: 'attributes',
                name: coreModule.api.Utils.i18n('tokenActionHud.traveller.attributes'),
                groups: [
                    { ...groups.characteristics, nestId: 'attributes_characteristics' },
                    { ...groups.skills, nestId: 'attributes_skills' }
                ]
            },
            {
                nestId: 'attacks',
                id: 'attacks',
                name: coreModule.api.Utils.i18n('MGT2.TravellerSheet.Attacks'),
                groups: [
                    { ...groups.attacks, nestId: 'attacks_attacks' }
                ]
            },
            {
                nestId: 'equipment',
                id: 'equipment',
                name: coreModule.api.Utils.i18n('MGT2.TravellerSheet.Equipment'),
                groups: [
                    { ...groups.inUse, nestId: 'equipment_inUse' },
                    { ...groups.carried, nestId: 'equipment_carried' },
                    { ...groups.owned, nestId: 'equipment_owned' }
                ]
            },
            {
                nestId: 'utility',
                id: 'utility',
                name: coreModule.api.Utils.i18n('tokenActionHud.traveller.utility'),
                groups: [
                    { ...groups.utility, nestId: 'utility_utility' }
                ]
            }
        ],
        groups: groupsArray
    }
})
