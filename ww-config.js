import { ICON_OPTIONS, DEFAULT_ICON } from './src/icons/index.js';

export default {
    type: 'wwObject',
    css({ content }) {
        return [
            { property: '--jai-size', value: content.size },
            { property: '--jai-color', value: content.color },
        ];
    },
    options: {
        sizable: true,
    },
    editor: {
        label: { en: 'Animated icon' },
        icon: 'sparkles',
        customSettingsPropertiesOrder: ['icon', 'trigger', 'hostSelector', 'active', 'playOnMount', 'speed', 'ariaLabel'],
        customStylePropertiesOrder: [
            {
                label: 'Icon',
                isCollapsible: true,
                properties: ['size', 'color', 'strokeWidth'],
            },
        ],
    },
    triggerEvents: [
        {
            name: 'animationStart',
            label: { en: 'On animation start' },
            event: { state: 'animate' },
            default: { enabled: false },
        },
        {
            name: 'animationEnd',
            label: { en: 'On animation end' },
            event: { state: 'normal' },
            default: { enabled: false },
        },
    ],
    actions: [
        { label: { en: 'Play (go and come back)' }, action: 'play' },
        { label: { en: 'Start (go to the animated pose)' }, action: 'start' },
        { label: { en: 'Stop (back to rest)' }, action: 'stop' },
    ],
    properties: {
        icon: {
            label: { en: 'Icon' },
            type: 'TextSelect',
            section: 'settings',
            options: { options: ICON_OPTIONS },
            defaultValue: DEFAULT_ICON,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: `Icon name. Valid values: ${ICON_OPTIONS.map(o => o.value).join(' | ')}`,
            },
            /* wwEditor:end */
        },
        trigger: {
            label: { en: 'Play on' },
            type: 'TextSelect',
            section: 'settings',
            options: {
                options: [
                    { value: 'click', label: { en: 'Click on parent button' } },
                    { value: 'hover', label: { en: 'Hover on parent button' } },
                    { value: 'state', label: { en: 'State (Active)' } },
                    { value: 'manual', label: { en: 'Manual (actions only)' } },
                ],
            },
            defaultValue: 'click',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'click | hover | state | manual',
            },
            propertyHelp: {
                tooltip:
                    'Click / Hover listen to the nearest button, link or menu item around the icon (or the Host selector), so no workflow is needed. State follows Active. Manual only plays from workflow actions.',
            },
            /* wwEditor:end */
        },
        hostSelector: {
            label: { en: 'Host selector' },
            type: 'Text',
            section: 'settings',
            defaultValue: '',
            bindable: true,
            hidden: content => !['click', 'hover', undefined].includes(content?.trigger),
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'CSS selector of the ancestor that plays the icon. Empty = nearest button, link or menu item.',
            },
            propertyHelp: {
                tooltip:
                    'Empty: the nearest button, link, [role=button] or [role=menuitem] around the icon, else its parent element. Set a selector (e.g. .menu-item) to use another ancestor.',
            },
            /* wwEditor:end */
        },
        active: {
            label: { en: 'Active' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            hidden: content => content?.trigger !== 'state',
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'true = animated pose, false = rest. The icon moves between them on every change.',
            },
            /* wwEditor:end */
        },
        playOnMount: {
            label: { en: 'Play on mount' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'true = the icon plays once each time it appears (page load, popup opening, conditional rendering, new list item).',
            },
            propertyHelp: {
                tooltip:
                    'Plays once when the element is mounted, whatever Play on is. An element only hidden with display: none is not remounted when shown again.',
            },
            /* wwEditor:end */
        },
        speed: {
            label: { en: 'Speed' },
            type: 'Number',
            section: 'settings',
            options: { min: 0.25, max: 4, step: 0.25 },
            defaultValue: 1,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'number',
                tooltip: 'Playback speed multiplier (1 = original timing).',
            },
            /* wwEditor:end */
        },
        ariaLabel: {
            label: { en: 'Aria label' },
            type: 'Text',
            section: 'settings',
            defaultValue: '',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Leave empty when the icon sits in a button that has its own name (the icon is then hidden from screen readers).',
            },
            /* wwEditor:end */
        },
        size: {
            label: { en: 'Size' },
            type: 'Length',
            section: 'style',
            options: {
                unitChoices: [
                    { value: 'px', label: 'px', min: 8, max: 128 },
                    { value: 'em', label: 'em', min: 0.5, max: 8 },
                    { value: 'rem', label: 'rem', min: 0.5, max: 8 },
                ],
                noRange: true,
                useVar: true,
            },
            defaultValue: '1em',
            bindable: true,
            responsive: true,
            states: true,
            classes: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'CSS length, e.g. "20px" or "1em". The element width / height in the style panel win over it.',
            },
            /* wwEditor:end */
        },
        color: {
            label: { en: 'Color' },
            type: 'Color',
            section: 'style',
            options: { nullable: true },
            bindable: true,
            responsive: true,
            states: true,
            classes: true,
            /* wwEditor:start */
            bindingValidation: {
                cssSupports: 'color',
                type: 'string',
                tooltip: 'Empty = the text color around the icon (currentColor).',
            },
            /* wwEditor:end */
        },
        strokeWidth: {
            label: { en: 'Stroke width' },
            type: 'Number',
            section: 'style',
            options: { min: 0.5, max: 4, step: 0.25 },
            defaultValue: 2,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'number',
                tooltip: 'Line thickness on the 24×24 grid (Lucide default: 2).',
            },
            /* wwEditor:end */
        },
    },
};
