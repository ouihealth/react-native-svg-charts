import * as shape from 'd3-shape'
import ChartGrouped from '../chart/chart-grouped'

class LineChartGrouped extends ChartGrouped {
    static defaultProps = ChartGrouped.defaultProps

    createPaths({
        data,
        x,
        y,
    }: {
        data: Array<Array<{ x: number; y: number }>>
        x: (value: number) => number
        y: (value: number) => number
    }): Record<string, string[]> {
        const { curve } = this.props

        const lines = data.map((line) =>
            shape
                .line<(typeof line)[number]>()
                .x((d) => x(d.x))
                .y((d) => y(d.y))
                .defined((item) => typeof item.y === 'number')
                .curve(curve)(line)
        )

        return {
            path: lines,
            lines,
        }
    }
}

export default LineChartGrouped
