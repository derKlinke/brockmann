import * as React from "react";

import {
    createTypoConfig,
    DEFAULT_LOWERCASE_HEADINGS,
    DEFAULT_TYPO_BASE_SIZE,
    DEFAULT_TYPO_R,
    getTypoVarMap,
    type TypoHeadingLevel,
} from "./system";

type TypoTag = "article" | "aside" | "div" | "footer" | "header" | "nav" | "section";

export interface TypoRootProps extends React.HTMLAttributes<HTMLElement> {
    as?: TypoTag;
    baseSize?: number;
    r?: number;
    lowercaseHeadings?: boolean;
    injectVars?: boolean;
}

export interface TypoHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    level: TypoHeadingLevel;
    snapToGridBottom?: boolean;
}

export interface TypoBodyProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export interface TypoCaptionProps extends React.HTMLAttributes<HTMLElement> {
    as?: "div" | "figcaption" | "p" | "span";
    align?: "end" | "start";
}

export interface TypoMetaProps extends React.HTMLAttributes<HTMLElement> {
    as?: "div" | "dt" | "p" | "span";
}

export interface TypoPreProps extends React.HTMLAttributes<HTMLPreElement> {}

export interface TypoCodeBlockProps extends React.HTMLAttributes<HTMLElement> {
    language?: string;
    label?: string;
    copyValue?: string;
    preClassName?: string;
    codeClassName?: string;
    captionClassName?: string;
}

export interface TypoListProps extends React.HTMLAttributes<HTMLElement> {
    ordered?: boolean;
}

export interface TypoListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {}

export interface TypoEditorialLinkProps
    extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    active?: boolean;
}

export interface TypoLinkListProps extends React.HTMLAttributes<HTMLElement> {}

export interface TypoLinkListItemProps
    extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    active?: boolean;
    indicator?: React.ReactNode;
    itemClassName?: string;
    contentClassName?: string;
    indicatorClassName?: string;
}

export interface SpacerProps extends React.HTMLAttributes<HTMLElement> {
    as?: TypoTag;
    multiple?: number;
}

export interface TypoFigureProps extends React.HTMLAttributes<HTMLElement> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    caption?: string;
    imageClassName?: string;
    captionClassName?: string;
    loading?: "eager" | "lazy";
}

export const TypoRoot = React.forwardRef<HTMLElement, TypoRootProps>(function TypoRoot(
    {
        as = "div",
        baseSize = DEFAULT_TYPO_BASE_SIZE,
        r = DEFAULT_TYPO_R,
        lowercaseHeadings = DEFAULT_LOWERCASE_HEADINGS,
        injectVars = true,
        className = "",
        style,
        ...rest
    },
    ref
): React.ReactElement {
    const Tag = as as React.ElementType;
    const config = createTypoConfig({ baseSize, r, lowercaseHeadings });
    const mergedStyle = injectVars
        ? ({
              ...getTypoVarMap(config),
              ...style,
          } as React.CSSProperties)
        : style;

    return (
        <Tag
            ref={ref as React.Ref<HTMLElement>}
            className={joinClassNames("typo-root", className)}
            data-typo-root
            style={mergedStyle}
            {...rest}
        />
    );
});

export const TypoHeading = React.forwardRef<HTMLHeadingElement, TypoHeadingProps>(
    function TypoHeading({ level, className = "", snapToGridBottom = false, ...rest }, ref) {
        const Tag = `h${level}` as React.ElementType;

        return (
            <Tag
                ref={ref as React.Ref<HTMLHeadingElement>}
                className={joinClassNames(
                    "typo-heading",
                    `typo-heading-${level}`,
                    snapToGridBottom ? "typo-heading-snap-grid-bottom" : "",
                    className
                )}
                {...rest}
            />
        );
    }
);

export const TypoH1 = React.forwardRef<HTMLHeadingElement, Omit<TypoHeadingProps, "level">>(
    function TypoH1(props, ref): React.ReactElement {
        return <TypoHeading ref={ref} level={1} {...props} />;
    }
);

export const TypoH2 = React.forwardRef<HTMLHeadingElement, Omit<TypoHeadingProps, "level">>(
    function TypoH2(props, ref): React.ReactElement {
        return <TypoHeading ref={ref} level={2} {...props} />;
    }
);

export const TypoH3 = React.forwardRef<HTMLHeadingElement, Omit<TypoHeadingProps, "level">>(
    function TypoH3(props, ref): React.ReactElement {
        return <TypoHeading ref={ref} level={3} {...props} />;
    }
);

export const TypoH4 = React.forwardRef<HTMLHeadingElement, Omit<TypoHeadingProps, "level">>(
    function TypoH4(props, ref): React.ReactElement {
        return <TypoHeading ref={ref} level={4} {...props} />;
    }
);

export const TypoH5 = React.forwardRef<HTMLHeadingElement, Omit<TypoHeadingProps, "level">>(
    function TypoH5(props, ref): React.ReactElement {
        return <TypoHeading ref={ref} level={5} {...props} />;
    }
);

export const TypoH6 = React.forwardRef<HTMLHeadingElement, Omit<TypoHeadingProps, "level">>(
    function TypoH6(props, ref): React.ReactElement {
        return <TypoHeading ref={ref} level={6} {...props} />;
    }
);

export const TypoBody = React.forwardRef<HTMLParagraphElement, TypoBodyProps>(
    function TypoBody({ className = "", ...rest }, ref): React.ReactElement {
        return (
            <p
                ref={ref}
                className={joinClassNames("typo-body", className)}
                {...rest}
            />
        );
    }
);

export const TypoCaption = React.forwardRef<HTMLElement, TypoCaptionProps>(function TypoCaption(
    { as = "p", align = "start", className = "", ...rest },
    ref
): React.ReactElement {
    const Tag = as as React.ElementType;

    return (
        <Tag
            ref={ref as React.Ref<HTMLElement>}
            className={joinClassNames(
                "typo-caption",
                align === "end" ? "typo-caption-align-end" : "",
                className
            )}
            {...rest}
        />
    );
});

export const TypoMeta = React.forwardRef<HTMLElement, TypoMetaProps>(function TypoMeta(
    { as = "p", className = "", ...rest },
    ref
): React.ReactElement {
    const Tag = as as React.ElementType;

    return (
        <Tag
            ref={ref as React.Ref<HTMLElement>}
            className={joinClassNames("typo-caption", "typo-meta", className)}
            {...rest}
        />
    );
});

export const TypoList = React.forwardRef<HTMLElement, TypoListProps>(
    function TypoList({ ordered = false, className = "", ...rest }, ref): React.ReactElement {
        const Tag = (ordered ? "ol" : "ul") as React.ElementType;

        return (
            <Tag
                ref={ref as React.Ref<HTMLElement>}
                className={joinClassNames("typo-list", ordered ? "typo-list-ordered" : "", className)}
                {...rest}
            />
        );
    }
);

export const TypoListItem = React.forwardRef<HTMLLIElement, TypoListItemProps>(
    function TypoListItem({ className = "", ...rest }, ref): React.ReactElement {
        return (
            <li
                ref={ref}
                className={joinClassNames("typo-list-item", className)}
                {...rest}
            />
        );
    }
);

export const TypoPre = React.forwardRef<HTMLPreElement, TypoPreProps>(function TypoPre(
    { className = "", ...rest },
    ref
): React.ReactElement {
    return <pre ref={ref} className={joinClassNames("typo-pre", className)} {...rest} />;
});

export const TypoCodeBlock = React.forwardRef<HTMLElement, TypoCodeBlockProps>(
    function TypoCodeBlock(
        {
            language,
            label,
            copyValue,
            className = "",
            preClassName = "",
            codeClassName = "",
            captionClassName = "",
            children,
            ...rest
        },
        ref
    ): React.ReactElement {
        const rawCode = copyValue ?? flattenTextContent(children);

        return (
            <figure
                ref={ref as React.Ref<HTMLElement>}
                className={joinClassNames("typo-figure", "typo-code-block", className)}
                data-code-raw={rawCode || undefined}
                data-code-language={language}
                {...rest}
            >
                <div className="typo-code-block-toolbar">
                    {language ? (
                        <span className="typo-code-block-language" aria-hidden="true">
                            {language}
                        </span>
                    ) : null}
                    <button
                        type="button"
                        className="typo-code-block-copy"
                        data-code-copy-button
                        aria-label={language ? `Copy ${language} code` : "Copy code"}
                    >
                        [ copy ]
                    </button>
                </div>
                <pre
                    className={joinClassNames("typo-code-block-pre", preClassName)}
                    data-code-language={language}
                >
                    <code
                        className={joinClassNames(
                            "typo-code-block-code",
                            language ? `language-${language}` : "",
                            codeClassName
                        )}
                    >
                        {children}
                    </code>
                </pre>
                {label ? (
                    <figcaption
                        className={joinClassNames(
                            "typo-caption",
                            "typo-figure-caption",
                            "typo-code-block-caption",
                            captionClassName
                        )}
                    >
                        {label}
                    </figcaption>
                ) : null}
            </figure>
        );
    }
);

export const TypoEditorialLink = React.forwardRef<HTMLAnchorElement, TypoEditorialLinkProps>(
    function TypoEditorialLink(
        { active = false, className = "", ...rest },
        ref
    ): React.ReactElement {
        return (
            <a
                ref={ref}
                className={joinClassNames(
                    "typo-editorial-link",
                    active ? "typo-editorial-link-active" : "",
                    className
                )}
                data-active={active ? "true" : undefined}
                {...rest}
            />
        );
    }
);

export const TypoLinkList = React.forwardRef<HTMLElement, TypoLinkListProps>(
    function TypoLinkList({ className = "", ...rest }, ref): React.ReactElement {
        return (
            <ul
                ref={ref as React.Ref<HTMLElement>}
                className={joinClassNames("typo-link-list", className)}
                {...rest}
            />
        );
    }
);

export const TypoLinkListItem = React.forwardRef<HTMLAnchorElement, TypoLinkListItemProps>(
    function TypoLinkListItem(
        {
            active = false,
            indicator = "[↗]",
            className = "",
            itemClassName = "",
            contentClassName = "",
            indicatorClassName = "",
            children,
            ...rest
        },
        ref
    ): React.ReactElement {
        return (
            <li className={joinClassNames("typo-link-list-item", itemClassName)}>
                <a
                    ref={ref}
                    className={joinClassNames(
                        "typo-link-list-link",
                        active ? "typo-link-list-link-active" : "",
                        className
                    )}
                    data-active={active ? "true" : undefined}
                    {...rest}
                >
                    <span className={joinClassNames("typo-link-list-copy", contentClassName)}>
                        {children}
                    </span>
                    <span
                        className={joinClassNames("typo-link-list-indicator", indicatorClassName)}
                        aria-hidden="true"
                    >
                        {indicator}
                    </span>
                </a>
            </li>
        );
    }
);

export const Spacer = React.forwardRef<HTMLElement, SpacerProps>(function Spacer(
    { as = "div", multiple = 1, className = "", style, ...rest },
    ref
): React.ReactElement {
    const Tag = as as React.ElementType;
    const mergedStyle = {
        ...style,
        "--brockmann-spacer-multiple": `${multiple}`,
    } as React.CSSProperties;

    return (
        <Tag
            ref={ref as React.Ref<HTMLElement>}
            aria-hidden={rest["aria-hidden"] ?? true}
            className={joinClassNames("brockmann-spacer", className)}
            style={mergedStyle}
            {...rest}
        />
    );
});

export const TypoFigure = React.forwardRef<HTMLElement, TypoFigureProps>(
    function TypoFigure(
        {
            src,
            alt,
            width,
            height,
            caption,
            className = "",
            imageClassName = "",
            captionClassName = "",
            loading = "lazy",
            ...rest
        },
        ref
    ): React.ReactElement {
        return (
            <figure
                ref={ref as React.Ref<HTMLElement>}
                className={joinClassNames("typo-figure", className)}
                {...rest}
            >
                <img
                    className={joinClassNames("typo-figure-image", imageClassName)}
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    loading={loading}
                />
                {caption ? (
                    <figcaption
                        className={joinClassNames(
                            "typo-caption",
                            "typo-caption-align-end",
                            "typo-figure-caption",
                            captionClassName
                        )}
                    >
                        {caption}
                    </figcaption>
                ) : null}
            </figure>
        );
    }
);

function joinClassNames(...values: Array<string | undefined>): string {
    return values.filter(Boolean).join(" ");
}

function flattenTextContent(node: React.ReactNode): string {
    if (node == null || typeof node === "boolean") return "";
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) {
        return node.map((child) => flattenTextContent(child)).join("");
    }

    if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
        return flattenTextContent(node.props.children);
    }

    return "";
}
