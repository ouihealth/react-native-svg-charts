import * as shape from 'd3-shape'
import Chart from './chart/chart'

class AreaChart<T> extends Chart<T, { start: number }> {
    static defaultProps = {
        ...Chart.defaultProps,
        start: 0,
    }

    createPaths({
        data,
        x,
        y,
    }: {
        data: Array<{ x: number; y: number }>
        x: (value: number) => number
        y: (value: number) => number
    }): Record<string, string> {
        const { curve, start } = this.props

        const area = shape
            .area<(typeof data)[number]>()
            .x((d) => x(d.x))
            .y0(y(start))
            .y1((d) => y(d.y))
            .defined((item) => typeof item.y === 'number')
            .curve(curve)(data)

        const line = shape
            .line<(typeof data)[number]>()
            .x((d) => x(d.x))
            .y((d) => y(d.y))
            .defined((item) => typeof item.y === 'number')
            .curve(curve)(data)

        return {
            path: area,
            area,
            line,
        }
    }
}

export default AreaChart
