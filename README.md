# Ozan's Memory

A modern memory management application built with React and TypeScript. This application allows you to manage entities and their relationships in a visual and intuitive way.

## Features

- 🔍 **Smart Search**: Search across entity names, types, and observations
- 🏷️ **Entity Type Filtering**: Filter entities by their type
- 🔗 **Relationship Visualization**: See connections between entities
- 📝 **Markdown Support**: Add and edit entities using markdown format
- 🎨 **Beautiful UI**: Modern design with gradient themes
- 🔄 **Collapsible Cards**: Expand/collapse entity details for better organization
- 🏃 **Navigation History**: Navigate through relations with back button support
- ✏️ **Entity Type Management**: Rename entity types on the fly

## Tech Stack

- React 19
- TypeScript
- Webpack
- Express.js (for backend API)
- JSONL file format for data storage

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/memory-manager.git
cd memory-manager
```

2. Install dependencies:
```bash
npm install
```

3. Create a memory.jsonl file in your documents folder:
```bash
touch ~/Documents/Memory/memory.jsonl
```

## Usage

Start the application:
```bash
npm start
```

This will start both the Express server (port 3001) and the React development server (port 3000).

## Markdown Format

You can add entities using the following markdown format:

```markdown
## Entity Name [Entity Type]

- Observation 1
- Observation 2

-> Related Entity: Relation Type
```

## Entity Types

The application supports various entity types with custom gradient colors:

- **Person**: Blue-Purple gradient
- **Company**: Pink-Red gradient
- **Application**: Light Blue-Turquoise gradient
- **Sports Team**: Coral-Turquoise gradient
- **Project**: Pink-Yellow gradient
- **Others**: Light Blue-Pink gradient (default)

## Configuration

The memory file path is configured in `src/App.tsx`. Default path:
```
/Users/yourusername/Documents/Memory/memory.jsonl
```

## Development

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run server`: Start Express server only

## License

MIT