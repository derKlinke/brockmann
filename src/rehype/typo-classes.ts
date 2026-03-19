const headingTags = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

export function rehypeTypoClasses(): (tree: unknown) => void {
    return (tree: unknown): void => {
        visitElements(tree, (node: any, parent: any, index: number) => {
            if (!node || typeof node.tagName !== "string") return;

            if (headingTags.has(node.tagName) && !hasClass(node, "markdown-section-label")) {
                const level = Number(node.tagName.slice(1));
                addClasses(node, ["typo-heading", `typo-heading-${level}`]);
                node.properties ||= {};
                node.properties["data-heading-level"] = level;
            }

            if (node.tagName === "p") {
                addClasses(node, ["typo-body"]);
            }

            if (node.tagName === "code" && parent?.tagName !== "pre") {
                addClasses(node, ["typo-inline-code"]);
            }

            if (node.tagName === "ul") {
                addClasses(node, ["typo-list"]);
            }

            if (node.tagName === "ol") {
                addClasses(node, ["typo-list", "typo-list-ordered"]);
            }

            if (node.tagName === "li") {
                addClasses(node, ["typo-list-item"]);
            }

            if (node.tagName === "figure") {
                addClasses(node, ["typo-figure"]);
            }

            if (node.tagName === "img" && parent?.tagName === "figure") {
                addClasses(node, ["typo-figure-image"]);
            }

            if (node.tagName === "figcaption") {
                addClasses(node, ["typo-figure-caption"]);
            }

            if (node.tagName === "pre") {
                const codeNode = Array.isArray(node.children)
                    ? node.children.find((child: any) => child?.type === "element" && child.tagName === "code")
                    : null;
                const language = getCodeLanguage(node, codeNode);
                const rawCode = extractTextContent(codeNode ?? node);
                const copyButtonNode = {
                    type: "element",
                    tagName: "button",
                    properties: {
                        type: "button",
                        className: ["typo-code-block-copy"],
                        class: "typo-code-block-copy",
                        "data-code-copy-button": "",
                        "aria-label": language ? `Copy ${language} code` : "Copy code",
                    },
                    children: [{ type: "text", value: "[ copy ]" }],
                };
                const languageNode = language
                    ? {
                          type: "element",
                          tagName: "span",
                          properties: {
                              className: ["typo-code-block-language"],
                              class: "typo-code-block-language",
                              "aria-hidden": "true",
                          },
                          children: [{ type: "text", value: language }],
                      }
                    : null;
                const toolbarNode = {
                    type: "element",
                    tagName: "div",
                    properties: {
                        className: ["typo-code-block-toolbar"],
                        class: "typo-code-block-toolbar",
                    },
                    children: languageNode ? [languageNode, copyButtonNode] : [copyButtonNode],
                };

                addClasses(node, ["typo-code-block-pre"]);
                if (language) {
                    setDataAttribute(node, "data-code-language", language);
                }

                if (codeNode) {
                    addClasses(codeNode, ["typo-code-block-code"]);
                    if (language) {
                        setDataAttribute(codeNode, "data-code-language", language);
                    }
                }

                if (parent?.tagName !== "figure" && Array.isArray(parent?.children)) {
                    const figureNode = {
                        type: "element",
                        tagName: "figure",
                        properties: {
                            className: ["typo-figure", "typo-code-block"],
                            class: "typo-figure typo-code-block",
                            ...(rawCode ? { "data-code-raw": rawCode } : {}),
                            ...(language ? { "data-code-language": language } : {}),
                        },
                        children: [toolbarNode, node],
                    };
                    parent.children[index] = figureNode;
                } else if (parent?.tagName === "figure") {
                    addClasses(parent, ["typo-code-block"]);
                    if (rawCode) {
                        setDataAttribute(parent, "data-code-raw", rawCode);
                    }
                    if (language) {
                        setDataAttribute(parent, "data-code-language", language);
                    }
                    if (Array.isArray(parent.children)) {
                        const hasCopyButton = parent.children.some(
                            (child: any) =>
                                child?.type === "element" &&
                                child.tagName === "div" &&
                                hasClass(child, "typo-code-block-toolbar")
                        );
                        if (!hasCopyButton) {
                            parent.children.unshift(toolbarNode);
                        }
                    }
                }
            }

            if (node.properties?.id === "refs") {
                addClasses(node, ["typo-list", "markdown-reference-list"]);
            }

            if (hasClass(node, "csl-entry")) {
                addClasses(node, ["typo-list-item", "markdown-reference-entry"]);
            }
        });
    };
}

function addClasses(node: any, classes: string[]): void {
    const existing = normalizeClassName(node.properties?.className ?? node.properties?.class);
    const merged = [...new Set([...existing, ...classes])];

    node.properties ||= {};
    node.properties.className = merged;
    node.properties.class = merged.join(" ");
}

function hasClass(node: any, className: string): boolean {
    return normalizeClassName(node?.properties?.className ?? node?.properties?.class).includes(
        className
    );
}

function setDataAttribute(node: any, name: string, value: string): void {
    node.properties ||= {};
    node.properties[name] = value;
}

function getCodeLanguage(...nodes: Array<any>): string | null {
    for (const node of nodes) {
        const language = extractLanguage(node);
        if (language) return language;
    }

    return null;
}

function extractLanguage(node: any): string | null {
    const classes = normalizeClassName(node?.properties?.className ?? node?.properties?.class);

    for (const className of classes) {
        if (className.startsWith("language-") && className.length > "language-".length) {
            return className.slice("language-".length);
        }
    }

    return null;
}

function extractTextContent(node: any): string {
    if (!node || typeof node !== "object") return "";

    if (node.type === "text" && typeof node.value === "string") {
        return node.value;
    }

    if (!Array.isArray(node.children)) return "";

    return node.children.map((child: any) => extractTextContent(child)).join("");
}

function normalizeClassName(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === "string");
    }

    if (typeof value === "string") {
        return value.split(/\s+/u).filter(Boolean);
    }

    return [];
}

function visitElements(
    node: any,
    visitor: (node: any, parent: any, index: number) => void,
    parent?: any,
    index = -1
): void {
    if (!node || typeof node !== "object") return;

    if (node.type === "element") {
        visitor(node, parent, index);
    }

    if (!Array.isArray(node.children)) return;

    for (let childIndex = 0; childIndex < node.children.length; childIndex += 1) {
        visitElements(node.children[childIndex], visitor, node, childIndex);
    }
}
