import React, { PureComponent } from 'react'
import { type LayoutChangeEvent, Text, type TextStyle, View } from 'react-native'
import * as d3Scale from 'd3-scale'
import * as array from 'd3-array'
import Svg, { G, Text as SVGText } from 'react-native-svg'
import type { AccessorFunction, AxisProps } from './types'

export interface XAxisProps<T> extends AxisProps<T> {
    contentInset?:
        | {
              left?: number | undefined
              right?: number | undefined
          }
        | undefined
    xAccessor?: AccessorFunction<T, number> | undefined
}

class XAxis<T> extends PureComponent<XAxisProps<T>> {
    static defaultProps = {
        data: [],
        spacingInner: 0.05,
        spacingOuter: 0.05,
        contentInset: {},
        svg: {},
        xAccessor: ({ index }) => index,
        formatLabel: (value: any) => value,
    } satisfies XAxisProps<unknown>

    state = {
        width: 0,
        height: 0,
    }

    _onLayout(event: LayoutChangeEvent) {
        const {
            nativeEvent: {
                layout: { width, height },
            },
        } = event

        if (width !== this.state.width) {
            this.setState({ width, height })
        }
    }

    _getX(domain: number[]) {
        const {
            contentInset: { left = 0, right = 0 },
        } = this.props

        const { width } = this.state

        const x = d3Scale
            .scaleLinear()
            .domain(domain)
            .range([left, width - right])

        return x
    }

    render() {
        const { style, data, xAccessor, formatLabel, numberOfTicks, svg, children, min, max } = this.props

        const { height, width } = this.state

        if (data.length === 0) {
            return <View style={style} />
        }

        const values = data.map((item, index) => xAccessor({ item, index }))
        const extent = array.extent(values)
        const domain = [min || extent[0], max || extent[1]]

        const x = this._getX(domain)
        const ticks = numberOfTicks ? x.ticks(numberOfTicks) : values

        const extraProps = {
            x,
            ticks,
            width,
            height,
            formatLabel,
        }

        return (
            <View style={style}>
                <View style={{ flexGrow: 1 }} onLayout={(event) => this._onLayout(event)}>
                    {/*invisible text to allow for parent resizing*/}
                    <Text
                        style={
                            {
                                opacity: 0,
                                fontSize: svg.fontSize,
                                fontFamily: svg.fontFamily,
                                fontWeight: svg.fontWeight,
                            } as TextStyle
                        }
                    >
                        {formatLabel(ticks[0], 0)}
                    </Text>
                    {height > 0 && width > 0 && (
                        <Svg
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                height,
                                width,
                            }}
                        >
                            <G>
                                {React.Children.map(children, (child) => {
                                    // @ts-expect-error
                                    return React.cloneElement(child, extraProps)
                                })}
                                {
                                    // don't render labels if width isn't measured yet,
                                    // causes rendering issues
                                    width > 0 &&
                                        ticks.map((value, index) => {
                                            // @ts-ignore
                                            const { svg: valueSvg = {} } = data[index] || {}

                                            return (
                                                <SVGText
                                                    textAnchor={'middle'}
                                                    originX={x(value)}
                                                    alignmentBaseline={'hanging'}
                                                    {...svg}
                                                    {...valueSvg}
                                                    key={index}
                                                    x={x(value)}
                                                >
                                                    {formatLabel(value, index)}
                                                </SVGText>
                                            )
                                        })
                                }
                            </G>
                        </Svg>
                    )}
                </View>
            </View>
        )
    }
}

export default XAxis
