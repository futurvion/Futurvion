export type ToolDefinition = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  available: boolean;
  featured: boolean;
  route: string;
  tags: string[];
};

export const toolRegistry: ToolDefinition[] = [
  {
    id: "qr-code-generator",
    name: "QR Code Generator",
    slug: "qr-generator",
    description:
      "Generate custom QR codes instantly for URLs, text, contact information, Wi-Fi credentials, and more.",
    category: "Productivity",
    icon: "qr",
    available: true,
    featured: true,
    route: "/tools/qr-generator",
    tags: ["qr", "productivity", "wifi", "links", "contacts"],
  },
];

export const availableTools = toolRegistry.filter((tool) => tool.available);
