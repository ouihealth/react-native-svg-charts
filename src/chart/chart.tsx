import * as array from 'd3-array'
import * as scale from 'd3-scale'
import * as shape from 'd3-shape'
import React, { PureComponent } from 'react'
import { type LayoutChangeEvent, type StyleProp, View, type ViewStyle } from 'react-native'
import Svg, { type PathProps } from 'react-native-svg'
import Path from '../animated-path'
import type { GridProps } from '../grid'
import type { AccessorFunction } from '../types'

export interface ChartProps<T> {
    data: T[]
    children?: React.ReactNode
    style?: StyleProp<ViewStyle> | undefined
    animate?: boolean | undefined
    animationDuration?: number | undefined
    svg?: Partial<PathProps> | undefined
    width?: number | undefined
    height?: number | undefined
    curve?: shape.CurveFactory | undefined
    contentInset?:
        | {
              top?: number | undefined
              left?: number | undefined
              right?: number | undefined
              bottom?: number | undefined
          }
        | undefined
    gridMin?: number | undefined
    gridMax?: number | undefined
    gridProps?: GridProps<any> | undefined
    numberOfTicks?: number | undefined
    xAccessor?: AccessorFunction<T, number> | undefined
    yAccessor?: AccessorFunction<T, number> | undefined
    yMin?: number | undefined
    yMax?: number | undefined
    xMin?: number | undefined
    xMax?: number | undefined
    clampX?: boolean
    clampY?: boolean
}

class Chart<T, ExtraProps> extends PureComponent<ChartProps<T> & ExtraProps> {
    static defaultProps = {
        svg: {},
        width: 100,
        height: 100,
        curve: shape.curveLinear,
        contentInset: {},
        numberOfTicks: 10,
        xAccessor: ({ index }) => index,
        yAccessor: ({ item }) => item,
    }

    state = {
        width: 0,
        height: 0,
    }

    _onLayout(event: LayoutChangeEvent) {
        const {
            nativeEvent: {
                layout: { height, width },
            },
        } = event
        this.setState({ height, width })
    }

    createPaths(_data: {
        data: Array<{ x: number; y: number }>
        x: (value: number) => number
        y: (value: number) => number
    }): Record<string, string> {
        throw 'Extending "Chart" requires you to override "createPaths'
    }

    render() {
        const {
            data,
            xAccessor,
            yAccessor,
            style,
            animate,
            animationDuration,
            numberOfTicks,
            contentInset: { top = 0, bottom = 0, left = 0, right = 0 },
            gridMax,
            gridMin,
            clampX,
            clampY,
            svg,
            children,
        } = this.props

        const { width, height } = this.state

        if (data.length === 0) {
            return <View style={style} />
        }

        const mappedData = data.map((item, index) => ({
            y: yAccessor({ item, index }),
            x: xAccessor({ item, index }),
        }))

        const yValues = mappedData.map((item) => item.y)
        const xValues = mappedData.map((item) => item.x)

        const yExtent = array.extent([...yValues, gridMin, gridMax])
        const xExtent = array.extent([...xValues])

        const { yMin = yExtent[0], yMax = yExtent[1], xMin = xExtent[0], xMax = xExtent[1] } = this.props

        //invert range to support svg coordinate system
        const y = scale
            .scaleLinear()
            .domain([yMin, yMax])
            .range([height - bottom, top])
            .clamp(clampY)

        const x = scale
            .scaleLinear()
            .domain([xMin, xMax])
            .range([left, width - right])
            .clamp(clampX)

        const paths = this.createPaths({
            data: mappedData,
            x,
            y,
        })

        const ticks = y.ticks(numberOfTicks)

        const extraProps = {
            x,
            y,
            data,
            ticks,
            width,
            height,
            ...paths,
        }

        return (
            <View style={style}>
                <View style={{ flex: 1 }} onLayout={(event) => this._onLayout(event)}>
                    {height > 0 && width > 0 && (
                        <Svg style={{ height, width }}>
                            {React.Children.map(children, (child) => {
                                // @ts-expect-error
                                if (child && child.props.belowChart) {
                                    // @ts-expect-error
                                    return React.cloneElement(child, extraProps)
                                }
                                return null
                            })}
                            <Path
                                fill={'none'}
                                {...svg}
                                d={paths.path}
                                animate={animate}
                                animationDuration={animationDuration}
                            />
                            {React.Children.map(children, (child) => {
                                // @ts-expect-error
                                if (child && !child.props.belowChart) {
                                    // @ts-expect-error
                                    return React.cloneElement(child, extraProps)
                                }
                                return null
                            })}
                        </Svg>
                    )}
                </View>
            </View>
        )
    }
}

export default Chart
