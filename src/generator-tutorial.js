import preact from 'preact';

export let tutorial_steps = [
    {
        title: 'Welcome!',
        text: <div>
            <p>Hi there and welcome to datarequests.org. We think it's great that you want to exercise your right to privacy and we want to help you as much as we can.</p>
            <p>We have prepared a little tour to help you get going. If you don't need a tour, you will be able to skip it in the next step but we need to ask you a few questions first.</p>
            <p>datarequests.org is designed from the ground up to respect your privacy. Everything is done exclusively on your own computer, we can never see your data. If you want to, you can enable the following features that we think will make your life easier.</p>
            <p>
                TODO: Privacy controls (see #23)
            </p>
        </div>,
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
        title: 'Select a recipient',
        text: <p>First, you will need to select the company you want to send a request to. In our database, we already have the contact data for many companies. You can either use the search bar to prefill the data from our database or manually enter it below.</p>,
        selector: '#aa-search-input',
        allowClicksThruHole: true,
        position: 'bottom-right'
    },
    {
        title: 'Choose a request type',
        text: <div>
            <p>Next up, we need to know what kind of a request you want to send.</p>
            <p>If you want to know what information a company has on you, go for an <em>access request</em>. An <em>erasure request</em> allows you to get a company to delete the personal data they have on you. And finally, use a <em>rectification request</em> if a company has incorrect data on you and you want them to correct that.</p>
        </div>,
        position: 'bottom-left',
        selector: '.request-type-chooser',
        allowClicksThruHole: true
    },
    {
        title: 'Enter your identification data',
        text: <div>
            <p>The company needs to be able to identify you, so you have to specify some data that will help them do so. Feel free to err on the side of entering less—they will just ask if they need more details.</p>
            <p>We have some experience with what data companies request. The fields you see by default are usually a good start. If we know that some fields definitely need to be filled in, they are marked with an *.</p>
            <p>If you want to add more data, just select the kind of field you want to add and use the button at the bottom.</p>
        </div>,
        selector: '#id_data',
        position: 'right',
        allowClicksThruHole: true
    },
    {
        title: 'Sign your request',
        text: <p>A good letter needs a signature! Don't worry: We've got you covered. Just keep your mouse pressed and draw into the white rectangle.</p>,
        selector: '#signature',
        position: 'right',
        allowClicksThruHole: true
    },
    {
        title: 'You\'re done!',
        text: <div>
            <p>That's it already. You can see a preview of your request on the right.</p>
            <p>Use the button above the letter to download it as a PDF file and send it to the company.</p>
        </div>,
        selector: '#generator-right-col',
        position: 'left',
        allowClicksThruHole: true
    },
    {
        title: 'On to the next one!',
        text: <div>
            <p>And with that, we're done with the tutorial. Thanks for staying with us. We hope we have explained everything well.</p>
            <p>Now that you've generated your first GDPR request, it's time for the next one, don't you think?</p>
            <p>Always remember: You have a right to privacy. Use it.</p>
        </div>,
        selector: '#new-request-button',
        position: 'bottom-right',
        allowClicksThruHole: true
    }
];

export let tutorial_steps_no_overlay = [ '#aa-search-input' ];
