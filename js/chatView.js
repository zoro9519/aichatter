import Adapt from 'core/js/adapt';
import { templates } from 'core/js/reactHelpers';
import React from 'react';
import ReactDOM from 'react-dom';

class AIChatView extends Backbone.View {
  initialize() {
    // Initialize Backbone model to store chat messages
    this.chatMessages = new Backbone.Collection();

    // Bind the context for event listeners
    _.bindAll(this, 'handleResponse', 'handleSubmit');

    // Listen to events triggered by Adapt
    this.listenTo(Adapt, 'aiChat:response', this.handleResponse);

    // Render the component
    this.render();
  }

  render() {
    const aichat = this.model.get('_aichat');
    const props = {
      chatMessages: this.chatMessages.toJSON(), // Pass chat messages as props
      handleSubmit: this.handleSubmit,
      openChatText: 'Open AI Assistant',
      displayTitle: 'AI Assistant Tutor',
      body: '',
      submitButtonText: 'Submit',
      closeButtonText: 'Close',
      placeholder: 'Hello!, How can I help?'
    };

    // Render the React component
    ReactDOM.render(<templates.aichat {...props} />, this.el);
  }

  handleSubmit(message) {
    this.chatMessages.add({ message, type: 'user' })
    this.chatMessages.each(message => {
      message.set('rendered', true);
    });
    Adapt.trigger('aiChat:newMessage', message);
    console.log('Message:', message);
  }

  handleResponse(message) {
    // Add the AI's response to the chat messages collection
    this.chatMessages.add({ message, type: 'assistant', rendered: false });
    console.log(this.chatMessages.toJSON());
    this.render();
  }
}

AIChatView.template = 'aichat';

export default AIChatView;