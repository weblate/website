import preact from 'preact';
import t from 'i18n';

export let tutorial_steps = [
    {
        title: t('welcome', 'tutorial'),
        text: t('welcome-text', 'tutorial'),
        selector: 'main',
        position: 'center',
        isFixed: true,
        style: {
            skip: {
                display: 'none'
            },
            close: {
                display: 'none'
            },
            hole: {
                'max-height': '0'
            }
        }
    },
    {
        title: t('select-recipient', 'tutorial'),
        text: t('select-recipient-text', 'tutorial'),
        selector: '#aa-search-input',
        allowClicksThruHole: true,
        position: 'bottom-right'
    },
    {
        title: t('choose-type', 'tutorial'),
        text: t('choose-type-text', 'tutorial'),
        position: 'bottom-left',
        selector: '.request-type-chooser',
        allowClicksThruHole: true
    },
    {
        title: t('enter-id-data', 'tutorial'),
        text: t('enter-id-data-text', 'tutorial'),
        selector: '#id_data',
        position: 'right',
        allowClicksThruHole: true
    },
    {
        title: t('sign', 'tutorial'),
        text: t('sign-text', 'tutorial'),
        selector: '#signature',
        position: 'right',
        allowClicksThruHole: true
    },
    {
        title: t('youre-done', 'tutorial'),
        text: t('youre-done-text', 'tutorial'),
        selector: '#generator-right-col',
        position: 'left',
        allowClicksThruHole: true
    },
    {
        title: t('next-request', 'tutorial'),
        text: t('next-request-text', 'tutorial'),
        selector: '#new-request-button',
        position: 'bottom-right',
        allowClicksThruHole: true
    }
];

export let tutorial_steps_no_overlay = [ '#aa-search-input' ];
