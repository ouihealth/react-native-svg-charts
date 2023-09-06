import React from 'react'
import { G, Line, type LineProps } from 'react-native-svg'

export type GridDirection = 'VERTICAL' | 'HORIZONTAL' | 'BOTH'

export interface GridProps<T> {
    direction?: GridDirection | undefined
    belowChart?: boolean | undefined
    svg?: Partial<LineProps> | undefined
    ticks?: T[] | undefined
    x?: ((t: T) => number) | undefined
    y?: ((t: T) => number) | undefined
}

function Horizontal<T>({ ticks = [], y, svg }: Omit<GridProps<T>, 'x'>) {
    return (
        <G>
            {ticks.map((tick) => (
                <Line
                    key={tick as string}
                    x1={'0%'}
                    x2={'100%'}
                    y1={y(tick)}
                    y2={y(tick)}
                    strokeWidth={1}
                    stroke={'rgba(0,0,0,0.2)'}
                    {...svg}
                />
            ))}
        </G>
    )
}

function Vertical<T>({ ticks = [], x, svg }: Omit<GridProps<T>, 'y'>) {
    return (
        <G>
            {ticks.map((tick, index) => (
                <Line
                    key={index}
                    y1={'0%'}
                    y2={'100%'}
                    x1={x(tick)}
                    x2={x(tick)}
                    strokeWidth={1}
                    stroke={'rgba(0,0,0,0.2)'}
                    {...svg}
                />
            ))}
        </G>
    )
}

function Both<T>(props: GridProps<T>) {
    return (
        <G>
            <Horizontal {...props} />
            <Vertical {...props} />
        </G>
    )
}

const Direction: Record<GridDirection, GridDirection> = {
    VERTICAL: 'VERTICAL',
    HORIZONTAL: 'HORIZONTAL',
    BOTH: 'BOTH',
}

function Grid<T>({ direction, ...props }: GridProps<T>) {
    if (direction === Direction.VERTICAL) {
        return <Vertical {...props} />
    } else if (direction === Direction.HORIZONTAL) {
        return <Horizontal {...props} />
    } else if (direction === Direction.BOTH) {
        return <Both {...props} />
    }

    return null
}

Grid.Direction = Direction

Grid.defaultProps = {
    direction: Direction.HORIZONTAL,
    belowChart: true,
}

export default Grid
