import express from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { createUIResource } from "@mcp-ui/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import {
  getCityCoordinates,
  getWeather,
  renderWeatherWidget,
} from "./utils.js";

const app = express();
const port = 3000;

app.use(
  cors({
    origin: "*",
    exposedHeaders: ["Mcp-Session-Id"],
    allowedHeaders: ["Content-Type", "mcp-session-id"],
  })
);
app.use(express.json());

// Map to store transports by session ID, as shown in the documentation.
const transports = {};

// Handle POST requests for client-to-server communication.
app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  let transport;

  if (sessionId && transports[sessionId]) {
    // A session already exists; reuse the existing transport.
    transport = transports[sessionId];
  } else if (!sessionId && isInitializeRequest(req.body)) {
    // This is a new initialization request. Create a new transport.
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sid) => {
        transports[sid] = transport;
        console.log(`MCP Session initialized: ${sid}`);
      },
    });

    // Clean up the transport from our map when the session closes.
    transport.onclose = () => {
      if (transport.sessionId) {
        console.log(`MCP Session closed: ${transport.sessionId}`);
        delete transports[transport.sessionId];
      }
    };

    // Create a new server instance for this specific session.
    const server = new McpServer({
      name: "Weather MCP UI",
      version: "1.0.0",
    });

    server.tool(
      "get_weather",
      "Display weather for a given city",
      {
        city: z.string().describe("City to get the weather for"),
      },
      async (input) => {
        const { city } = input;
        const uiResource = createUIResource({
          uri: "ui://weather",
          content: {
            type: "externalUrl",
            iframeUrl: `http://localhost:3000/widget/weather?city=${city}`,
          },
          encoding: "text",
          uiMetadata: {
            "preferred-frame-size": ["368px", "368px"],
          },
        });

        return {
          content: [uiResource],
        };
      }
    );

    // Connect the server instance to the transport for this session.
    await server.connect(transport);
  } else {
    return res.status(400).json({
      error: { message: "Bad Request: No valid session ID provided" },
    });
  }

  // Handle the client's request using the session's transport.
  await transport.handleRequest(req, res, req.body);
});

// A separate, reusable handler for GET and DELETE requests.
const handleSessionRequest = async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  if (!sessionId || !transports[sessionId]) {
    return res.status(404).send("Session not found");
  }

  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
};

// GET handles the long-lived stream for server-to-client messages.
app.get("/mcp", handleSessionRequest);

// DELETE handles explicit session termination from the client.
app.delete("/mcp", handleSessionRequest);

app.get("/widget/weather", async (req, res) => {
  const { city } = req.query;
  const { latitude, longitude } = await getCityCoordinates(city);
  const weather = await getWeather(latitude, longitude);

  // Note: The focus of this demo is the MCP-UI server (`get_weather`)
  // Probably not the best way to render the weather widget, but keeps it simple.
  res.send(renderWeatherWidget(weather));
});

app.listen(port, () => {
  console.log(`TypeScript MCP server listening at http://localhost:${port}`);
});
