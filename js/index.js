import Adapt from 'core/js/adapt';
import AIChatView from './chatView';
import AIChatModel from './chatModel';
import data from 'core/js/data';

class AIChat extends Backbone.Controller {
    initialize() {
        this.listenTo(Adapt, 'pageView:postReady', this.onRender);
        this.listenTo(Adapt, 'openai:ready', this.render);
        this.listenTo(Adapt, 'aiChat:newMessage', this.handleSubmit);
        this.model = new AIChatModel();
    }

    onRender(view) {
        const model = view.model;
        this.parentModel = view.model;
        this.parentView = view;
    }

    render() {
        if (!this.checkIsEnabled(this.parentModel)) {
            return;
        }
        this.addAIChatView(this.parentModel,this.parentView);
        this.addBlockListener();
        this.prepareAI();
    }

    prepareAI() {
        const openaiodi = Adapt.openaiodi;

        const conversation = openaiodi.createConversation();
        this.model.set('conversation', conversation);
    }

    addBlockListener() {
        const blocks = document.querySelectorAll('.block');
        const options = {
            root: null, // viewport
            threshold: 0.5, // 50% of the block is in view
        };
        // Callback function to handle intersection changes
        const handleIntersection = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const adaptId = entry.target.getAttribute('data-adapt-id');
                    const model = data.findById(adaptId);
                    console.log('Block in view: ', this.getDisplayTitle(model));
                    console.log(this.getBodyText(model));
                }
            });
        };
        // Create the IntersectionObserver
        const observer = new IntersectionObserver(handleIntersection, options);
        // Observe each block
        blocks.forEach(block => {
            observer.observe(block);
        });
    }

    // Function to recursively find the displayTitle in the block or its children
    getDisplayTitle(model) {
        // Check if the displayTitle is present in the current model
        const displayTitle = model.get('displayTitle');
        if (displayTitle) {
            return displayTitle; // Return the displayTitle if found
        } else {
        // If displayTitle is not found in the current model, check its children
        const children = model.get('_children');
        if (children && children.length > 0) {
            // Iterate over the children
            for (const child of children) {
                // Recursively call the function to find the displayTitle in the child
                const childDisplayTitle = this.getDisplayTitle(child);
                // If displayTitle is found in the child, return it
                if (childDisplayTitle) {
                    return childDisplayTitle;
                }
            }
        }
        // If displayTitle is not found in the block or its children, return null
        return null;
        }
    }

    // Function to recursively find and concatenate the body text from the block and all its children
    getBodyText(model) {
        let allBodyText = '';

        // Check if the body text is present in the current model
        const bodyHtml = model.get('body');
        if (bodyHtml) {
            // If body text is found in the current model, parse HTML and extract text content
            const parser = new DOMParser();
            const doc = parser.parseFromString(bodyHtml, 'text/html');
            const bodyText = this.extractTextFromNode(doc.body);
            allBodyText += bodyText + "\n\n";
        }

        // Check if the model has children
        const children = model.get('_children');
        if (children && children.length > 0) {
            // Iterate over the children
            for (const child of children) {
                // Recursively call the function to find and concatenate the body text in the child
                allBodyText += this.getBodyText(child) + "\n\n";
            }
        }

        return allBodyText.trim();
    }

    // Function to extract text content from a node, handling lists
    extractTextFromNode(node) {
        let text = '';

        for (const child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
                text += child.textContent;
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                switch (child.tagName.toLowerCase()) {
                case 'ul':
                    text += `\n`;
                    for (const listItem of child.querySelectorAll('li')) {
                    text += `- ${this.extractTextFromNode(listItem)}\n`;
                    }
                    break;
                case 'ol':
                    text += `\n`;
                    let index = 1;
                    for (const listItem of child.querySelectorAll('li')) {
                    text += `${index}. ${this.extractTextFromNode(listItem)}\n`;
                    index++;
                    }
                    break;
                default:
                    text += this.extractTextFromNode(child);
                    break;
                }
            }
        }

        return text;
    }

    checkIsEnabled(model) {
        const _model = model.get('_aichat');
        if (!_model || !_model._isEnabled) return false;
        return true;
    }

    async handleSubmit(message) {
        const conversation =  this.model.get('conversation');
        conversation.addMessage({ role: 'user', content: message })
        const assistantReply = await conversation.getResponse();
        conversation.addMessage({ role: 'system', content: assistantReply })
        Adapt.trigger('aiChat:response',assistantReply);
    }

    addAIChatView(model,view) {
        const aiChatModel = model.get('_aichat');
        const aiChatView = new AIChatView({ model });
        view.$el.append(aiChatView.el);
        view.$el.addClass('has-aiChat');
    }

}

Adapt.aichat = new AIChat();

export default Adapt.aichat;