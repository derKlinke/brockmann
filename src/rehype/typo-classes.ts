const headingTags = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

export function rehypeTypoClasses(): (tree: unknown) => void {
    return (tree: unknown): void => {
        visitElements(tree, (node: any, parent: any) => {
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

function normalizeClassName(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === "string");
    }

    if (typeof value === "string") {
        return value.split(/\s+/u).filter(Boolean);
    }

    return [];
}

function visitElements(node: any, visitor: (node: any, parent: any) => void, parent?: any): void {
    if (!node || typeof node !== "object") return;

    if (node.type === "element") {
        visitor(node, parent);
    }

    if (!Array.isArray(node.children)) return;

    for (const child of node.children) {
        visitElements(child, visitor, node);
    }
}
