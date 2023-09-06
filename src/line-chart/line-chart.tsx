import * as shape from 'd3-shape'
import Chart from '../chart/chart'

class LineChart extends Chart<number, {}> {
    static defaultProps = Chart.defaultProps

    createPaths({
        data,
        x,
        y,
    }: {
        data: Array<{ x: number; y: number }>
        x: (value: number) => number
        y: (value: number) => number
    }): Record<string, string> {
        const { curve } = this.props

        const line = shape
            .line<(typeof data)[number]>()
            .x((d) => x(d.x))
            .y((d) => y(d.y))
            .defined((item) => typeof item.y === 'number')
            .curve(curve)(data)

        return {
            path: line,
            line,
        }
    }
}

export default LineChart
