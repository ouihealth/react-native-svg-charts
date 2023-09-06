// Type definitions for react-native-svg-charts 5.0
// Project: https://github.com/JesperLekland/react-native-svg-charts
// Definitions by: Krzysztof Miemiec <https://github.com/krzysztof-miemiec>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.8

import type { Series } from 'd3-shape'
import * as React from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import type { TextProps } from 'react-native-svg'

export interface AccessorFunctionProps<T> {
    index: number
    item: T
}

export type AccessorFunction<T, U> = (props: AccessorFunctionProps<T>) => U
export type SortFunction<T> = (a: T, b: T) => number
export type OffsetFunction = (series: Series<number, number>, order: number[]) => void
export type OrderFunction = (series: Series<number, number>) => number[]

export interface AxisProps<T> {
    style?: StyleProp<ViewStyle> | undefined
    data: T[]
    spacingInner?: number | undefined
    spacingOuter?: number | undefined
    formatLabel?: ((value: any, index: number) => number | string) | undefined
    numberOfTicks?: number | undefined
    svg?: Partial<TextProps> | undefined
    min?: number | undefined
    max?: number | undefined
    children?: React.ReactNode
}
