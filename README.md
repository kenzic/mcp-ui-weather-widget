# MCP-UI Demo

## Install Repo

1. Clone `git clone git@github.com:kenzic/mcp-ui-weather-widget.git`
2. Install `cd mcp-ui-weather-widget && pnpm install`
3. Start `pnpm start`

## Setup MCP server to work with Goose

1. Download Goose https://block.github.io/goose/
2. Open and go to "Extensions" tab
3. Add custom extension
4. Give name, set "Type" to "HTTP" and endpoint to `http://localhost:3000/mcp` and sufficiently high timeout (like 3000)
5. If everything is working, you should be able to prompt in the chat, "What's the weather in NYC" and it will display the UI widget.
