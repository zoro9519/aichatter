import Adapt from 'core/js/adapt';
import { templates } from 'core/js/reactHelpers';
import React from 'react';
import ReactDOM from 'react-dom';

class AIChatView extends Backbone.View {
  initialize() {
    // Initialize Backbone model to store chat messages
    this.chatMessages = new Backbone.Collection();
    this.conversations = new Backbone.Collection();

    // Bind the context for event listeners
    _.bindAll(this, 'handleResponse', 'handleSubmit');

    // Listen to events triggered by Adapt
    this.listenTo(Adapt, 'aiChat:response', this.handleResponse);
    this.listenTo(Adapt, 'openai:conversationsUpdated', this.updateConversations);
    this.listenTo(Adapt, 'aiChat:conversationLoaded', this.conversationLoaded);

    // Render the component
    this.render();
  }

  // Render the current conversation, also used to switch conversations
  render() {
    const aichat = this.model.get('_aichat');
    const props = {
      conversations: this.conversations.toJSON(),
      chatMessages: this.chatMessages.toJSON(), // Pass chat messages as props
      handleSubmit: this.handleSubmit,
      newConversation: this.newConversation,
      loadConversation: this.loadConversation,
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

  // Submit a message to the current conversation and trigger the controller to deal with it and get a response
  handleSubmit(message) {
    this.chatMessages.add({ message, type: 'user' })
    this.chatMessages.each(message => {
      message.set('rendered', true);
    });
    Adapt.trigger('aiChat:newMessage', message);
  }

  // Triggered when the AI has responsed and we call render to render the updated conversaion.
  handleResponse(message) {
    // Add the AI's response to the chat messages collection
    this.chatMessages.add({ message, type: 'assistant', rendered: false });
    this.render();
  }

  // Called when the controller has fetched the conversaion history
  updateConversations(conversations) {
    conversations.forEach(conversation => {
        if (conversation.id && conversation.messages.length > 0) {
            const id = conversation.id;
            const title = conversation.messages[0].content.substring(0, 24); // Get first 24 characters of the first message content as title
            this.conversations.push({ id, title });
        }
    });
    this.render();
  }

  // Call a trigger to cause the controller to create a new conversaion
  newConversation() {
    Adapt.trigger('aiChat:newConversation');
  }

  // Call a trigger to cause the controller to load a different conversaion
  loadConversation(id) {
    Adapt.trigger('aiChat:loadConversation', id);
  }

  // Called when the new conversaion has loaded so we can render it.
  conversationLoaded(conversation) {
    // Remove all messages from this.chatMessages
    this.chatMessages.reset();

    // Iterate over the conversation and add all the messages to chatMessages
    conversation.messages.forEach(({ content, role }) => {
        this.chatMessages.add({ message: content, type: role, rendered: true });
    });

    // Render the updated chatMessages
    this.render();
  }

}

AIChatView.template = 'aichat';

export default AIChatView;