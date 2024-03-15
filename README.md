# Adapt AI Chat Extension

An adapt extension that renders a chatbot sytle window on top of a content object via which a user can converse with an AI Tutor.

## Requirements

This extension requires the [adapt-odi-openAI](https://github.com/theodi/adapt-odi-openAI) extension to work.

## Installation

### Via Authoring Tool

1. Install the plugin via the plugin management interface

### Into framework

1. Clone or download the repository to your local machine.
2. Copy the `adapt-odi-aichat` folder to your Adapt project's `src/extensions/` directory.

## Configuration

Before using the extension, you need to configure which content objects it is available from.

### Via Adapt Authoring Tool

1. In the Adapt authoring tool, navigate to configuration settings of the contentObject
2. Find the AI Chat extension
3. Enable it

### Directly in config.json

Alternatively, you can configure the extension directly in your course's `contentObjects.json` file. Here's an example configuration:

```json
    "_aichat": {
      "_isEnabled": true
    },
```

## Usage

Once the extension is installed and configured, it will appear withing contentObjects when rendered.

## License

This project is licensed under the [MIT License](LICENSE).