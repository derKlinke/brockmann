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
} from "./shared";

type GridTag = "article" | "aside" | "div" | "footer" | "header" | "nav" | "section";

export interface GridProps extends React.HTMLAttributes<HTMLElement>, GridContainerOptions {
    as?: GridTag;
}

export interface GridItemProps extends React.HTMLAttributes<HTMLElement>, GridItemOptions {
    as?: GridTag;
}

export const GridBase = React.forwardRef<HTMLElement, GridProps>(function GridBase(
    {
        as = "div",
        className = "",
        shellClassName = "",
        columns,
        rowsOnly = false,
        subgrid = false,
        debug = false,
        style,
        ...rest
    },
    ref
): React.ReactElement {
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
        ...getGridContainerStyle({ columns: resolvedColumns, subgrid }),
        ...style,
    } as React.CSSProperties;

    return (
        <Tag
            ref={ref as React.Ref<HTMLElement>}
            className={gridClassName}
            style={gridStyle}
            {...getGridContainerDataAttributes({ rowsOnly, debug })}
            {...rest}
        />
    );
});

export const GridItem = React.forwardRef<HTMLElement, GridItemProps>(function GridItem(
    { as = "div", className = "", columnStart, columnSpan, rowStart, rowSpan, style, ...rest },
    ref
): React.ReactElement {
    const Tag = as as React.ElementType;
    const itemStyle = {
        ...getGridItemStyle({ columnStart, columnSpan, rowStart, rowSpan }),
        ...style,
    } as React.CSSProperties;

    return (
        <Tag
            ref={ref as React.Ref<HTMLElement>}
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
});

type GridComponent = React.ForwardRefExoticComponent<
    GridProps & React.RefAttributes<HTMLElement>
> & {
    Item: React.ForwardRefExoticComponent<GridItemProps & React.RefAttributes<HTMLElement>>;
};

export const Grid = Object.assign(GridBase, { Item: GridItem }) as GridComponent;
