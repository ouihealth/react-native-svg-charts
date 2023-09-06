import * as array from 'd3-array'
import * as scale from 'd3-scale'
import React, { PureComponent } from 'react'
import { type LayoutChangeEvent, View } from 'react-native'
import Svg from 'react-native-svg'
import Path from '../animated-path'
import type { AccessorFunction } from '../types'
import Chart, { type ChartProps } from './chart'

class ChartGrouped extends PureComponent<
    ChartProps<{ data: Array<number | object | Array<unknown>>; svg: object }> & {
        xAccessor?: AccessorFunction<number | object, number> | undefined
        yAccessor?: AccessorFunction<number | object, number> | undefined
    }
> {
    static defaultProps = Chart.defaultProps

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
        data: Array<Array<{ x: number; y: number }>>
        x: (value: number) => number
        y: (value: number) => number
    }): Record<string, string[]> {
        throw 'Extending "ChartGrouped" requires you to override "createPaths'
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

        const mappedData = data.map((dataArray) =>
            dataArray.data.map((item, index) => ({
                y: yAccessor({ item, index }),
                x: xAccessor({ item, index }),
            }))
        )

        const yValues = array.merge<(typeof mappedData)[number][number]>(mappedData).map((item) => item.y)
        const xValues = array.merge<(typeof mappedData)[number][number]>(mappedData).map((item) => item.x)

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
                            {paths.path.map((path, index) => {
                                const { svg: pathSvg } = data[index]
                                const key = path + '-' + index
                                return (
                                    <Path
                                        key={key}
                                        fill={'none'}
                                        {...svg}
                                        {...pathSvg}
                                        d={path}
                                        animate={animate}
                                        animationDuration={animationDuration}
                                    />
                                )
                            })}
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

export default ChartGrouped
