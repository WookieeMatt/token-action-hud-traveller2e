/**
 * Module-based constants
 */
export const MODULE = {
    ID: 'token-action-hud-traveller2e'
}

/**
 * Core module
 */
export const CORE_MODULE = {
    ID: 'token-action-hud-core'
}

/**
 * Core module version required by the system module.
 * No longer used
 */
export const REQUIRED_CORE_MODULE_VERSION = '2.0'

/**
 * Action types
 */
export const ACTION_TYPE = {
    attributes: 'tokenActionHud.traveller.attributes',
    equipment: 'MGT2.TravellerSheet.Equipment',
    utility: 'tokenActionHud.traveller.utility'
}

/**
 * Groups
 */
export const GROUP = {
    attributes: { id: 'attributes', name: 'tokenActionHud.traveller.attributes', type: 'system' },
    characteristics: { id: 'characteristics', name: 'tokenActionHud.traveller.characteristics', type: 'system' },
    skills: { id: 'skills', name: 'MGT2.TravellerSheet.Skills', type: 'system' },
    attacks: { id: 'attacks', name: 'MGT2.TravellerSheet.Attacks', type: 'system' },
    equipment: { id: 'equipment', name: 'MGT2.TravellerSheet.Equipment', type: 'system' },
    inUse: { id: 'inUse', name: 'tokenActionHud.traveller.inUse', type: 'system' },
    carried: { id: 'carried', name: 'tokenActionHud.traveller.carried', type: 'system' },
    owned: { id: 'owned', name: 'tokenActionHud.traveller.owned', type: 'system' },
    utility: { id: 'utility', name: 'tokenActionHud.traveller.utility', type: 'system' }
}
