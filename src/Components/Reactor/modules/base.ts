import { reactorModules } from './index';
import { createReactorModule, generateLetterContent } from '../../../Utility/reactor';
import { ErrorException } from '../../../Utility/errors';
import { objFilter, objMap } from '../../../Utility/common';
import { getGeneratedMessage } from '../../../store/proceedings';
import type { ReactorModuleWithDataId, ReactorModuleData } from '../../../types/reactor';

export interface BaseModuleData extends ReactorModuleData {
    issue: {
        flags: {
            allow_sharing_data_with_controller: boolean;
            // TODO: Introduce `not:<flag>` flags in letter-generator.
            'not:allow_sharing_data_with_controller': boolean;
        };
        variables: Record<string, never>;
    };
}
declare module '../../../types/reactor' {
    interface ReactorModuleDataMapping {
        base: BaseModuleData;
    }
}

const defaultModuleData: BaseModuleData = {
    includeIssue: false,
    issue: {
        flags: { allow_sharing_data_with_controller: false, 'not:allow_sharing_data_with_controller': true },
        variables: {},
    },
    additionalData: [],
};

export const module = createReactorModule('base', {
    steps: [
        {
            id: 'start',
            type: 'options',
            body: 'Has the company fully complied with your request?',
            options: [
                { text: 'yes', targetStepId: 'base::company-complied' },
                {
                    text: 'no',
                    targetStepId: ({ proceeding }) =>
                        getGeneratedMessage(proceeding, 'admonition')
                            ? 'base::response-or-complaint'
                            : 'base::select-issue',
                },
            ],
        },

        {
            id: 'company-complied',
            type: 'options',
            body: "TODO: Make sure that's actually the case.",
            options: [],
        },
        {
            id: 'response-or-complaint',
            type: 'options',
            body: 'You have already sent an admonition to the company. Do you want to send a free text response or lodge a complaint with the supervisory authorities now?',
            options: [
                { text: 'Write a free text response to the company.', targetStepId: 'custom-text::start' },
                {
                    text: 'Generate a complaint.',
                    targetStepId: 'base::complaint-intro',
                    onChoose: ({ reactorState }) => reactorState.setType('complaint'),
                },
            ],
        },

        {
            id: 'issue-done',
            type: 'condition',
            condition: ({ reactorState }) => reactorState.type === 'complaint',
            trueStepId: 'base::complaint-next-issue',
            falseStepId: 'base::select-issue',
        },
        {
            // Modules should never go to `base::select-issue` directly. Instead, use `base::issue-done`. This is
            // necessary for generating complaints.
            id: 'select-issue',
            type: 'options',
            body: ({ reactorState }) =>
                reactorState.type === 'admonition'
                    ? Object.keys(reactorState.activeModules()).length > 0
                        ? 'Anything else?'
                        : 'Which of these options applies?'
                    : 'Do you want to mention any additional issues in your complaint?',
            options: [
                // These are filled by hooks from the individual modules.

                // TODO: Disable those already selected by the user. Or do we want to allow them to go through again and
                // change their answers?
                // TODO: Definitely exclude the "imported" ones for complaints.

                {
                    text: ({ reactorState }) => `Generate ${reactorState.type} based on your answers.`,
                    targetStepId: ({ reactorState }) =>
                        reactorState.type === 'admonition' ? 'base::generate-letter' : 'base::complaint-choose-sva',
                    hideIf: ({ reactorState }) => Object.keys(reactorState.activeModules()).length < 1,
                },
                {
                    text: 'None. Quit wizard and mark request as completed.',
                    targetStepId: 'base::nevermind',
                    hideIf: ({ reactorState }) => Object.keys(reactorState.activeModules()).length > 0,
                },
            ],
        },

        // TODO: Skip straight to base::select-issue if there are no issues we can include in complaint.
        {
            id: 'complaint-intro',
            type: 'options',
            body: 'We’ll go through each of the issues you raised in your previous response to the controller.',
            options: [{ text: 'Next', targetStepId: 'base::complaint-next-issue' }],
            onEnter: ({ proceeding, reactorState }) => {
                const admonition = getGeneratedMessage(proceeding, 'admonition');
                if (!admonition)
                    // TODO: For debugging, we obviously need the proceeding. But this also contains very sensitive
                    // data, so the user shouldn't submit that without redacting it. Not sure what to do here.
                    throw new ErrorException('Tried to generate complaint without prior admonition.', { proceeding });
                const admonitionModuleData = admonition.reactorData;
                if (!admonitionModuleData || Object.values(admonitionModuleData).length < 1)
                    throw new ErrorException('Tried to generate complaint based on admonition without data.', {
                        proceeding,
                    });

                const complaintModuleData = objMap(admonitionModuleData, ([moduleId, moduleData]) => {
                    const module = reactorModules.find((m) => m.id === moduleId);
                    if (!module)
                        throw new ErrorException(
                            'Tried to generate complaint based on admonition with non-existent module.',
                            { admonitionModuleData }
                        );

                    return [
                        moduleId as keyof typeof complaintModuleData,
                        {
                            ...moduleData,
                            includeIssue: false,
                            fromAdmonition:
                                moduleData?.includeIssue === true &&
                                (typeof module.offerToIncludeInComplaintIf === 'function'
                                    ? module.offerToIncludeInComplaintIf({
                                          // :(
                                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                          moduleData: moduleData as any,
                                      })
                                    : module.offerToIncludeInComplaintIf),
                            resolved: false,
                        },
                    ];
                }) as unknown as typeof reactorState['moduleData'];
                reactorState.overrideModuleData(complaintModuleData);
            },
        },
        {
            id: 'complaint-next-issue',
            type: 'condition',
            condition: ({ reactorState }) => {
                const issues = Object.keys(
                    objFilter(reactorState.moduleData, ([, m]) => m?.fromAdmonition === true)
                ) as ReactorModuleWithDataId[];
                const nextIssueIndex = issues.findIndex((i) => i === reactorState.currentIssueForComplaint) + 1;
                reactorState.setCurrentIssueForComplaint(
                    nextIssueIndex < issues.length ? issues[nextIssueIndex] : undefined
                );

                return nextIssueIndex < issues.length;
            },
            trueStepId: 'base::complaint-issue-resolved',
            falseStepId: 'base::select-issue',
        },
        {
            id: 'complaint-issue-resolved',
            type: 'options',
            body: ({ reactorState }) =>
                `In your admonition, you said that TODO ${reactorState.currentIssueForComplaint}. Has that issue been resolved? And do you want to include it in your complaint?`,
            options: [
                {
                    text: 'Issue resolved, include in complaint.',
                    targetStepId: 'base::complaint-next-issue',
                    onChoose: ({ reactorState }) => {
                        reactorState.setIncludeIssue(reactorState.currentIssueForComplaint!, true);
                        reactorState.setResolved(reactorState.currentIssueForComplaint!, true);
                    },
                },
                {
                    text: 'Issue persists, include in complaint.',
                    targetStepId: 'base::complaint-issue-changed',
                    onChoose: ({ reactorState }) => {
                        reactorState.setIncludeIssue(reactorState.currentIssueForComplaint!, true);
                        reactorState.setResolved(reactorState.currentIssueForComplaint!, false);
                    },
                },
                { text: 'Ignore issue in complaint.', targetStepId: 'base::complaint-next-issue' },
            ],
        },
        {
            id: 'complaint-issue-changed',
            type: 'options',
            body: 'If the situation regarding this issue changed since your admonition to the controller, you need to answer the questions again. Otherwise, we can just use your previous answers.',
            options: [
                { text: 'Use previous answers.', targetStepId: 'base::complaint-next-issue' },
                {
                    text: 'Go through questions again.',
                    targetStepId: ({ reactorState }) => `${reactorState.currentIssueForComplaint}::start`,
                },
            ],
        },
        {
            id: 'complaint-choose-sva',
            type: 'sva-finder',
            body: 'TODO',
            nextStepId: 'base::complaint-id-data',
        },
        {
            id: 'complaint-id-data',
            type: 'dynamic-inputs',
            body: 'How do you want the supervisory authority to contact you?',
            storeIn: 'id_data',
            nextStepId: 'base::complaint-share-data',
        },
        {
            id: 'complaint-share-data',
            type: 'options',
            body: 'Can the supervisory authority share your details with the company? Note that most authorities say that they usually cannot process your individual complaint unless you allow this. They will however still view it as a suggestion to look into the company.',
            options: [
                {
                    text: 'yes',
                    targetStepId: 'base::generate-letter',
                    onChoose: ({ reactorState }) => {
                        reactorState.setIssueFlag('base', 'allow_sharing_data_with_controller', true);
                        reactorState.setIssueFlag('base', 'not:allow_sharing_data_with_controller', false);
                    },
                },
                {
                    text: 'no',
                    targetStepId: 'base::generate-letter',
                    onChoose: ({ reactorState }) => {
                        reactorState.setIssueFlag('base', 'allow_sharing_data_with_controller', false);
                        reactorState.setIssueFlag('base', 'not:allow_sharing_data_with_controller', true);
                    },
                },
            ],
        },

        {
            id: 'generate-letter',
            type: 'letter',
            body: ({ reactorState }) =>
                `Here’s your generated ${
                    reactorState.type
                }. Please read over it and edit the text if necessary. Afterwards, you’ll need to send it to the ${
                    reactorState.type === 'complaint' ? 'supervisory authority' : 'company'
                }.`,
            onEnter: (callbackState) => {
                // TODO: Set subject.
                callbackState.generatorState.setCustomLetterProperty('content', generateLetterContent(callbackState));
                callbackState.generatorState.renderLetter();
            },
        },
        {
            id: 'nevermind',
            type: 'options',
            body: 'TODO: Quit wizard and mark request as completed.',
            options: [],
        },

        {
            id: 'dead-end',
            type: 'options',
            body: 'In this case, we cannot proceed with the problem you selected. But you can continue with another reason, if applicable.',
            options: [
                {
                    text: 'Check if there is another problem with the company’s response.',
                    targetStepId: 'base::issue-done',
                },
            ],
        },
    ],

    defaultModuleData,
    offerToIncludeInComplaintIf: false,
});
