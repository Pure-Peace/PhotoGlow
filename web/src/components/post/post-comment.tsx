'use client'

import { Heart, Pen, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CommentData } from '@photoglow/shared/types/post'
import { UserAvatar } from '../ui/user-avatar'
import { useAuthStore } from '@/stores/auth'
import { AuthButton } from '../auth/auth-button'
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { CommentInputProps } from '@photoglow/shared/types/comment'
import { PostContext } from './post-main'
import { TimeFormatter } from '../ui/date'
import { Linkify } from '../linkify/linkify'
import { useEditor } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import History from '@tiptap/extension-history'
import Placeholder from '@tiptap/extension-placeholder'
import {
  MentionTopicExtension,
  MentionUserExtension,
} from '../text-editor/extension-mention'
import { TextEditorMain } from '../text-editor/text-editor-main'

export function CommentInput({
  comment,
  className,
  onCommentSubmitted,
}: CommentInputProps) {
  const { accessToken, isLoggedIn } = useAuthStore()
  const { post } = useContext(PostContext)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editorContent, setEditorContent] = useState('')

  const getReplyToName = () => {
    if (!comment) return ''
    return `@${comment.author.username}`
  }

  const editorConfig = {
    extensions: [
      Document,
      Paragraph,
      Text,
      History,
      Placeholder.configure({
        placeholder: comment
          ? `Reply to ${getReplyToName()}...`
          : 'Add a comment...',
      }),
      MentionUserExtension,
      MentionTopicExtension,
    ],
    editorProps: {
      attributes: {
        class:
          'focus:outline-none min-h-[40px] max-h-[120px] overflow-y-auto text-sm py-2',
      },
    },
    content: '',
  }

  const editor = useEditor({
    ...editorConfig,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // Move cursor to end when initializing with reply content
      if (comment && editor.getText() === `@${comment.author.username} `) {
        editor.commands.focus('end')
      }
      // Update content state when editor content changes
      setEditorContent(editor.getText())
    },
  })

  const handleSubmit = async () => {
    if (!editor?.getText().trim() || !accessToken) return
    setIsSubmitting(true)
    try {
      let parentId: string | undefined = undefined

      if (comment) {
        if (comment.level === 0) {
          parentId = comment.id
        } else if (comment.level === 1) {
          parentId = comment.parentId || undefined
        }
      }

      await api.createComment(accessToken, post.id, editor.getText(), parentId)
      editor.commands.clearContent()
      setEditorContent('')
      toast.success('Comment posted successfully')
      onCommentSubmitted?.()
    } catch (error) {
      console.error('Failed to post comment:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to post comment'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn('bg-background flex items-center gap-3', className)}>
      {isLoggedIn ? (
        <>
          <div className="bg-muted flex-1 rounded-md px-3">
            <TextEditorMain
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              editor={editor!}
              className="min-h-[40px]"
              placeholder={
                comment ? `Reply to ${getReplyToName()}...` : 'Add a comment...'
              }
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary font-medium"
            onClick={handleSubmit}
            disabled={!editorContent.trim() || isSubmitting}
          >
            {comment ? 'Reply' : 'Post'}
          </Button>
        </>
      ) : (
        <AuthButton className="w-full" variant="outline">
          <Pen className="mr-2 size-4" />
          <span>Login to comment</span>
        </AuthButton>
      )}
    </div>
  )
}

export function LikeButton({ comment }: { comment: CommentData }) {
  const [isLiking, setIsLiking] = useState(false)
  const [liked, setLiked] = useState(comment.hasLiked)
  const [likeCount, setLikeCount] = useState(comment.likes)

  const { accessToken } = useAuthStore()

  useEffect(() => {
    setLiked(comment.hasLiked)
    setLikeCount(comment.likes)
  }, [comment.hasLiked, comment.likes])

  const handleLike = async () => {
    if (!accessToken) {
      toast.error('Please login to continue')
      return
    }

    if (isLiking) return
    setIsLiking(true)

    try {
      const newLiked = await api.likeComment(accessToken, comment.id, !liked)
      setLiked(newLiked)
      setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1))
    } catch (error) {
      setLiked(comment.hasLiked)
      setLikeCount(comment.likes)
      console.error('Failed to like comment:', error)
      toast.error('Failed to like comment')
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <div className="text-muted-foreground flex flex-col items-center justify-center gap-1">
      <button
        className={cn(
          'transition-colors',
          liked ? 'text-rose-600' : 'hover:text-rose-600',
          isLiking && 'cursor-not-allowed opacity-50'
        )}
        onClick={handleLike}
        disabled={isLiking}
      >
        <Heart className={cn('size-5', liked && 'fill-current')} />
        {likeCount > 0 && <span className="text-xs">{likeCount}</span>}
      </button>
    </div>
  )
}

export function Comment({
  comment: initialComment,
  setParentComments,
  setParentComment,
}: {
  comment: CommentData
  setParentComments?: Dispatch<SetStateAction<CommentData[] | null>>
  setParentComment?: Dispatch<SetStateAction<CommentData>>
}) {
  const { user, accessToken } = useAuthStore()
  const { post, setPost } = useContext(PostContext)

  const [isReplying, setIsReplying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [childComments, setChildComments] = useState<CommentData[] | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [comment, setComment] = useState<CommentData>(initialComment)
  const [isDeleted, setIsDeleted] = useState(false)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const COMMENTS_PER_PAGE = 5

  const isOwnComment = user?.id === comment.author.id

  let parentId: string | undefined

  // set parentId based on comment level
  if (comment.level === 0) {
    parentId = comment.id
  } else if (comment.level === 1) {
    parentId = comment.parentId || undefined
  }

  const loadChildComments = async (shouldAppend = false) => {
    setLoading(true)
    try {
      const comments = await api.getComments(post.id, {
        accessToken: accessToken || undefined,
        parentId,
        limit: COMMENTS_PER_PAGE,
        offset: shouldAppend ? offset : 0,
      })

      // if this is a comment that is a reply to a reply, set the parent comments
      if (comment.level >= 1) {
        if (!setParentComments) {
          throw new Error(
            'setParentComments is required, this should never happen'
          )
        }
        setParentComments(comments)
      } else {
        setChildComments((prev) =>
          shouldAppend && prev ? [...prev, ...comments] : comments
        )
        setOffset((prev) =>
          shouldAppend ? prev + COMMENTS_PER_PAGE : COMMENTS_PER_PAGE
        )
        setHasMore(comments.length === COMMENTS_PER_PAGE)
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
      toast.error('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const onShowMoreCommentsClick = () => {
    if (isExpanded) {
      setIsExpanded(false)
      setOffset(0)
      setHasMore(true)
      setChildComments(null)
      return
    }

    // update comments if not expanded
    loadChildComments()
    setIsExpanded(true)
  }

  const loadMoreComments = () => {
    loadChildComments(true)
  }

  const onChildCommentSubmitted = () => {
    setIsReplying(false)
    // update post
    setPost((prev) => ({
      ...prev,
      interactions: {
        ...prev.interactions,
        comments: {
          ...prev.interactions.comments,
          count: prev.interactions.comments.count + 1,
        },
      },
    }))

    // update comment
    setComment((prev) => ({
      ...prev,
      repliesCount: prev.repliesCount + 1,
    }))

    // load child comments
    loadChildComments()
    // expand comments
    setIsExpanded(true)
  }

  const onThisCommentDeleted = () => {
    // update post
    setPost((prev) => ({
      ...prev,
      comments: prev.comments?.filter((c) => c.id !== comment.id),
      interactions: {
        ...prev.interactions,
        comments: {
          ...prev.interactions.comments,
          count: prev.interactions.comments.count - 1,
        },
      },
    }))

    if (comment.level === 0 && setParentComment) {
      setParentComment?.((prev) => ({
        ...prev,
        repliesCount: prev?.repliesCount ? prev.repliesCount - 1 : 0,
      }))
    }

    // if this is a child comment, trigger the parent comment to update
    if (comment.level > 0) {
      loadChildComments()
    }

    setIsDeleted(true)
  }

  if (isDeleted && comment.repliesCount === 0) return null

  return (
    <div className="group flex gap-3">
      {/* avatar */}
      <Link href={`/@${comment.author.username}`}>
        <UserAvatar
          name={comment.author.displayName}
          avatar={comment.author.avatar}
          className="cursor-pointer hover:opacity-90"
        />
      </Link>

      <div className="flex-1">
        {/* content section */}
        <div className="flex">
          {/* left column */}
          <div className="flex-1">
            {/* header */}
            <Link
              href={`/@${comment.author.username}`}
              className="cursor-pointer text-sm font-semibold hover:underline"
            >
              {comment.author.displayName}
            </Link>

            {/* content */}
            <p className="mb-1 text-base leading-relaxed">
              {comment.replyTo && (
                <>
                  <span className="text-muted-foreground mr-1 text-xs">
                    Replying to
                  </span>
                  <Link
                    href={`/@${comment.replyTo}`}
                    className="text-primary mr-2 text-sm hover:underline"
                  >
                    {comment.replyTo}:
                  </Link>
                </>
              )}
              <Linkify>{comment.content}</Linkify>
            </p>

            {/* footer */}
            <div className="text-muted-foreground mb-2 flex items-center gap-6 text-xs">
              <span className="text-muted-foreground">
                <TimeFormatter dateString={comment.createdAt} />
              </span>

              <button
                className="hover:text-foreground transition-colors"
                onClick={() => setIsReplying(!isReplying)}
              >
                {isReplying ? 'Cancel' : 'Reply'}
              </button>

              {isOwnComment && (
                <DeleteComment
                  comment={comment}
                  onDelete={onThisCommentDeleted}
                />
              )}
            </div>
          </div>

          {/* like button */}
          <LikeButton comment={comment} />
        </div>

        {/* input area */}
        {isReplying && (
          <div className="mt-2">
            <CommentInput
              comment={comment}
              onCommentSubmitted={onChildCommentSubmitted}
            />
          </div>
        )}

        {/* more comments */}
        {comment.level === 0 && comment.repliesCount > 0 && (
          <div className="space-y-2">
            <button
              onClick={onShowMoreCommentsClick}
              disabled={loading}
              className="text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {loading && !isExpanded
                ? 'Loading...'
                : isExpanded
                  ? 'Hide replies'
                  : `View ${comment.repliesCount} ${
                      comment.repliesCount === 1 ? 'reply' : 'replies'
                    }`}
            </button>

            {/* child comments */}
            {isExpanded && childComments && childComments.length > 0 && (
              <div className="space-y-4 border-l pl-4">
                {childComments.map((childComment) => (
                  <Comment
                    key={childComment.id}
                    comment={childComment}
                    setParentComments={setChildComments}
                    setParentComment={setComment}
                  />
                ))}
                {hasMore && (
                  <button
                    onClick={loadMoreComments}
                    disabled={loading}
                    className="text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Load more replies'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function DeleteComment({
  comment,
  onDelete,
}: {
  comment: CommentData
  onDelete?: () => void
}) {
  const { accessToken } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!accessToken) {
      toast.error('Please login to continue')
      return
    }

    try {
      setLoading(true)
      await api.deleteComment(accessToken, comment.id)
      toast.success('Comment deleted successfully')
      onDelete?.()
    } catch (error) {
      console.error('Failed to delete comment:', error)
      toast.error('Failed to delete comment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="hover:text-foreground transition-colors">
          Delete
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Comment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this comment? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={loading} onClick={handleDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function CommentsList() {
  const { post } = useContext(PostContext)

  if (!post.comments?.length) {
    return (
      <div className="flex min-h-[20vh] flex-col items-center justify-center gap-6 px-4 2xl:min-h-[30vh]">
        <MessageSquare className="size-10 md:size-12" />
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-lg font-semibold md:text-xl">No comments yet</h3>
          <p className="text-sm md:text-base">
            Be the first one to share your thoughts!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-8 p-4 pt-4 xl:p-8 xl:pt-4')}>
      {post.comments.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </div>
  )
}

export function CommentHeader() {
  const { post, isDialogMode } = useContext(PostContext)

  return (
    <div
      className={cn(
        'bg-background/80 supports-[backdrop-filter]:bg-background/50 top-0 z-50 p-5 text-sm font-bold backdrop-blur-md md:text-base',
        isDialogMode && 'xl:sticky'
      )}
    >
      Comments ({post.interactions.comments.count})
    </div>
  )
}

export function CommentSection() {
  return (
    <div className="flex-1">
      <CommentHeader />
      <CommentsList />
    </div>
  )
}
