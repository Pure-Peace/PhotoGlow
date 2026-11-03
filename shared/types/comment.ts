import type { CommentData, Post } from './post'

export interface CommentProps {
  post: Post
  isDialogMode?: boolean
}

export interface CommentContentProps {
  post: Post
  comment: CommentData
  onCommentSubmitted?: () => void
}

export interface CommentHeaderProps {
  totalComments: number
  isDialogMode?: boolean
}

export interface CommentListProps {
  post: Post
  comments?: Array<CommentData>
  className?: string
  updateComments?: () => void
}

export interface CommentInputProps {
  comment?: CommentData
  className?: string
  onCommentSubmitted?: () => void
}

export interface ViewRepliesSectionProps {
  post: Post
  parentComment: CommentData
  forceExpand?: boolean
  onReplySubmitted?: () => void
}
