import { IntermediateRepresentation } from 'linkifyjs'
import LinkifyComponent from 'linkify-react'

import 'linkify-plugin-mention'
import 'linkify-plugin-hashtag'

import Link from 'next/link'

export const hashtag = ({ content }: IntermediateRepresentation) => {
  return (
    <Link
      href={`/explore/${content.replace(/#/g, '')}`}
      className="break-words text-blue-500"
    >
      {content}
    </Link>
  )
}

export const mention = ({ content }: IntermediateRepresentation) => {
  return (
    <Link
      href={`/@${content.replace(/@/g, '')}`}
      className="break-words text-blue-500"
    >
      {content}
    </Link>
  )
}

export const linkifyOptions = {
  render: {
    hashtag,
    mention,
  },
}

export function Linkify({
  ...props
}: React.ComponentProps<typeof LinkifyComponent> & { className?: string }) {
  return <LinkifyComponent options={linkifyOptions} {...props} />
}
