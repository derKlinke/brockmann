import * as React from "react";

import {
    createTypoConfig,
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
}

export interface TypoHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    level: TypoHeadingLevel;
    snapToGridBottom?: boolean;
}

export interface TypoBodyProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export interface TypoListProps extends React.HTMLAttributes<HTMLElement> {
    ordered?: boolean;
}

export interface TypoListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {}

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

export function TypoRoot({
    as = "div",
    baseSize = DEFAULT_TYPO_BASE_SIZE,
    r = DEFAULT_TYPO_R,
    className = "",
    style,
    ...rest
}: TypoRootProps): React.ReactElement {
    const Tag = as as React.ElementType;
    const config = createTypoConfig({ baseSize, r });
    const mergedStyle = {
        ...getTypoVarMap(config),
        ...style,
    } as React.CSSProperties;

    return (
        <Tag
            className={joinClassNames("typo-root", className)}
            data-typo-root
            style={mergedStyle}
            {...rest}
        />
    );
}

export function TypoHeading({
    level,
    className = "",
    snapToGridBottom = false,
    ...rest
}: TypoHeadingProps): React.ReactElement {
    const Tag = `h${level}` as React.ElementType;

    return (
        <Tag
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

export function TypoH1(props: Omit<TypoHeadingProps, "level">): React.ReactElement {
    return <TypoHeading level={1} {...props} />;
}

export function TypoH2(props: Omit<TypoHeadingProps, "level">): React.ReactElement {
    return <TypoHeading level={2} {...props} />;
}

export function TypoH3(props: Omit<TypoHeadingProps, "level">): React.ReactElement {
    return <TypoHeading level={3} {...props} />;
}

export function TypoH4(props: Omit<TypoHeadingProps, "level">): React.ReactElement {
    return <TypoHeading level={4} {...props} />;
}

export function TypoH5(props: Omit<TypoHeadingProps, "level">): React.ReactElement {
    return <TypoHeading level={5} {...props} />;
}

export function TypoH6(props: Omit<TypoHeadingProps, "level">): React.ReactElement {
    return <TypoHeading level={6} {...props} />;
}

export function TypoBody({ className = "", ...rest }: TypoBodyProps): React.ReactElement {
    return <p className={joinClassNames("typo-body", className)} {...rest} />;
}

export function TypoList({
    ordered = false,
    className = "",
    ...rest
}: TypoListProps): React.ReactElement {
    const Tag = (ordered ? "ol" : "ul") as React.ElementType;

    return (
        <Tag
            className={joinClassNames("typo-list", ordered ? "typo-list-ordered" : "", className)}
            {...rest}
        />
    );
}

export function TypoListItem({ className = "", ...rest }: TypoListItemProps): React.ReactElement {
    return <li className={joinClassNames("typo-list-item", className)} {...rest} />;
}

export function TypoFigure({
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
}: TypoFigureProps): React.ReactElement {
    return (
        <figure className={joinClassNames("typo-figure", className)} {...rest}>
            <img
                className={joinClassNames("typo-figure-image", imageClassName)}
                src={src}
                alt={alt}
                width={width}
                height={height}
                loading={loading}
            />
            {caption ? (
                <figcaption className={joinClassNames("typo-figure-caption", captionClassName)}>
                    {caption}
                </figcaption>
            ) : null}
        </figure>
    );
}

function joinClassNames(...values: Array<string | undefined>): string {
    return values.filter(Boolean).join(" ");
}
