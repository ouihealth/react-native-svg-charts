import React, { type ElementRef, Component } from 'react'
import { InteractionManager } from 'react-native'
import { Path, type PathProps } from 'react-native-svg'
import * as interpolate from 'd3-interpolate-path'

export interface AnimatedPathProps extends PathProps {
    animate?: boolean | undefined
    animationDuration?: number | undefined
    renderPlaceholder?: (() => any) | undefined
}

class AnimatedPath extends Component<AnimatedPathProps, { d: AnimatedPathProps['d'] }> {
    static defaultProps = {
        animate: false,
        animationDuration: 300,
        renderPlaceholder: () => null,
    }

    component: ElementRef<typeof Path>
    newD?: string
    interpolator?: (t: number) => string
    animation?: number
    handle?: number

    constructor(props: AnimatedPathProps) {
        super(props)

        this.state = { d: props.d }
    }

    componentDidUpdate(props: AnimatedPathProps) {
        const { d: newD, animate } = this.props
        const { d: oldD } = props

        this.newD = newD

        if (newD === oldD) {
            return
        }

        if (!animate || newD === null || oldD === null) {
            return
        }

        this.newD = newD
        this.interpolator = interpolate.interpolatePath(oldD, newD)

        this._animate()
    }

    componentWillUnmount() {
        cancelAnimationFrame(this.animation)
        this._clearInteraction()
    }

    _animate(start?: number) {
        cancelAnimationFrame(this.animation)
        this.animation = requestAnimationFrame((timestamp) => {
            if (!start) {
                this._clearInteraction()
                this.handle = InteractionManager.createInteractionHandle()

                start = timestamp
            }

            // Get the delta on how far long in our animation we are.
            const delta = (timestamp - start) / this.props.animationDuration

            // If we're above 1 then our animation should be complete.
            if (delta > 1) {
                // Just to be safe set our final value to the new graph path.
                this.component.setNativeProps({ d: this.newD })
                // Stop our animation loop.
                this._clearInteraction()
                return
            }

            const d = this.interpolator(delta)
            this.component.setNativeProps({ d })
            // console.log(this.interpolator)
            // this.tween && console.log(this.tween.tween(delta))
            // Tween the SVG path value according to what delta we're currently at.

            // Update our state with the new tween value and then jump back into
            // this loop.
            this.setState(this.state, () => {
                this._animate(start)
            })
        })
    }

    _clearInteraction() {
        if (this.handle) {
            InteractionManager.clearInteractionHandle(this.handle)
            this.handle = null
        }
    }

    render() {
        return (
            <Path
                ref={(ref) => (this.component = ref)}
                {...this.props}
                d={this.props.animate ? this.state.d : this.props.d}
            />
        )
    }
}

export default AnimatedPath
