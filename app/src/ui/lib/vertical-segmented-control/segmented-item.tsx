import classNames from 'classnames'
import * as React from 'react'

interface ISegmentedItemProps {
  /**
   * The title for the segmented item. This should be kept short.
   */
  readonly title: string

  /**
   * An optional description which explains the consequences of
   * selecting this item.
   */
  readonly description?: string | JSX.Element

  /**
   * If true, allows the title text to wrap to multiple lines instead of being
   * truncated with an ellipsis.
   */
  readonly expandText?: boolean
}

export class SegmentedItem extends React.Component<ISegmentedItemProps> {
  private renderDescription() {
    if (!this.props.description) {
      return null
    }

    return <p>{this.props.description}</p>
  }

  public render() {
    const classes = classNames('title', {
      'expand-text': this.props.expandText,
    })

    return (
      <>
        <div className={classes}>{this.props.title}</div>
        {this.renderDescription()}
      </>
    )
  }
}
