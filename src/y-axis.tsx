import React, { PureComponent, type ReactElement } from 'react'
import { type LayoutChangeEvent, type StyleProp, Text, type TextStyle, View, type ViewStyle } from 'react-native'
import { Svg, G, Text as SVGText } from 'react-native-svg'
import * as d3Scale from 'd3-scale'
import * as array from 'd3-array'
import type { AccessorFunction, AxisProps } from './types'

export interface YAxisProps<T> extends AxisProps<T> {
    style?: StyleProp<ViewStyle> | undefined
    contentInset?:
        | {
              top?: number | undefined
              bottom?: number | undefined
          }
        | undefined
    yAccessor?: AccessorFunction<T, any> | undefined
}

class YAxis<T> extends PureComponent<YAxisProps<T>> {
    static defaultProps = {
        data: [],
        numberOfTicks: 10,
        spacingInner: 0.05,
        spacingOuter: 0.05,
        contentInset: {},
        svg: {},
        formatLabel: (value: any) => value && value.toString(),
        yAccessor: ({ item }) => item,
    } satisfies YAxisProps<unknown>

    state = {
        height: 0,
        width: 0,
    }

    _onLayout(event: LayoutChangeEvent) {
        const {
            nativeEvent: {
                layout: { height, width },
            },
        } = event
        this.setState({ height, width })
    }

    getY(domain: number[]) {
        const {
            contentInset: { top = 0, bottom = 0 },
        } = this.props

        const { height } = this.state

        const y = d3Scale
            .scaleLinear()
            .domain(domain)
            .range([height - bottom, top])

        return y
    }

    render() {
        const { style, data, yAccessor, numberOfTicks, formatLabel, svg, children } = this.props

        const { height, width } = this.state

        if (data.length === 0) {
            return <View style={style} />
        }

        const values = data.map((item, index) => yAccessor({ item, index }))

        const extent = array.extent(values)

        const { min = extent[0], max = extent[1] } = this.props

        const domain = [min, max]

        //invert range to support svg coordinate system
        const y = this.getY(domain)

        const ticks = y.ticks(numberOfTicks)

        const longestValue = ticks
            .map((value, index) => formatLabel(value, index))
            .reduce((prev, curr) => (prev.toString().length > curr.toString().length ? prev : curr), 0)

        const extraProps = {
            y,
            ticks,
            width,
            height,
            formatLabel,
        }

        return (
            <View style={[style]}>
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
                        {longestValue}
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
                                    return React.cloneElement(child as ReactElement<any>, extraProps)
                                })}
                                {
                                    // don't render labels if width isn't measured yet,
                                    // causes rendering issues
                                    height > 0 &&
                                        ticks.map((value, index) => {
                                            return (
                                                <SVGText
                                                    originY={y(value)}
                                                    textAnchor={'middle'}
                                                    x={'50%'}
                                                    alignmentBaseline={'middle'}
                                                    {...svg}
                                                    key={y(value)}
                                                    y={y(value)}
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

export default YAxis
