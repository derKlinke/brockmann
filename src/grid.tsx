import * as React from "react";

import {
    getGridContainerClassName,
    getGridContainerDataAttributes,
    getGridContainerStyle,
    getGridItemClassName,
    getGridItemStyle,
    resolveGridColumns,
    type GridContainerOptions,
    type GridItemOptions,
} from "./grid-shared";

type GridTag = "article" | "aside" | "div" | "footer" | "header" | "nav" | "section";

export interface GridProps extends React.HTMLAttributes<HTMLElement>, GridContainerOptions {
    as?: GridTag;
}

export interface GridItemProps extends React.HTMLAttributes<HTMLElement>, GridItemOptions {
    as?: GridTag;
}

export function GridBase({
    as = "div",
    className = "",
    shellClassName = "",
    columns,
    rowsOnly = false,
    subgrid = false,
    debug = false,
    style,
    ...rest
}: GridProps): React.ReactElement {
    const Tag = as as React.ElementType;
    const resolvedColumns = resolveGridColumns(columns, rowsOnly);
    const gridClassName = getGridContainerClassName({
        className,
        shellClassName,
        columns: resolvedColumns,
        rowsOnly,
        subgrid,
    });
    const gridStyle = {
        ...getGridContainerStyle({ columns: resolvedColumns }),
        ...style,
    } as React.CSSProperties;

    return (
        <Tag
            className={gridClassName}
            style={gridStyle}
            {...getGridContainerDataAttributes({ rowsOnly, debug })}
            {...rest}
        />
    );
}

export function GridItem({
    as = "div",
    className = "",
    columnStart,
    columnSpan,
    rowStart,
    rowSpan,
    style,
    ...rest
}: GridItemProps): React.ReactElement {
    const Tag = as as React.ElementType;
    const itemStyle = {
        ...getGridItemStyle({ columnStart, columnSpan, rowStart, rowSpan }),
        ...style,
    } as React.CSSProperties;

    return (
        <Tag
            className={getGridItemClassName({
                className,
                columnStart,
                columnSpan,
                rowStart,
                rowSpan,
            })}
            style={itemStyle}
            {...rest}
        />
    );
}

type GridComponent = typeof GridBase & {
    Item: typeof GridItem;
};

export const Grid = Object.assign(GridBase, { Item: GridItem }) as GridComponent;
