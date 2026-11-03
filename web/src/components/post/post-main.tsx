'use client'

import {
  DialogDescription,
  DialogTitle,
  Dialog,
  DialogContent,
  DialogPortal,
  DialogOverlay,
} from '@radix-ui/react-dialog'
import {
  ArrowLeft,
  Bookmark,
  Heart,
  MoreHorizontal,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Share2,
  Eye,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import {
  useState,
  useContext,
  createContext,
  useEffect,
  Dispatch,
  SetStateAction,
  useCallback,
} from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

import { Button } from '@/components/ui/button'
import { FollowButton } from '@/components/profile/follow-button'
import type { Post } from '@photoglow/shared/types/post'
import { CommentSection, CommentInput } from '@/components/post/post-comment'
import { PortalReceiver, usePortal } from '@/components/common/portal'
import { cn, shareRoute } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useMediaQuery } from 'react-responsive'
import { api } from '@/api'
import { UserAvatar } from '@/components/ui/user-avatar'
import { defaultPost, usePostDialogStore } from '@/stores/post-dialog'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'sonner'
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { TimeFormatter } from '../ui/date'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Linkify } from '../linkify/linkify'
import { PostEditDialog } from './post-edit-dialog'

export type PostContextType = {
  post: Post
  setPost: Dispatch<SetStateAction<Post>>
  isDialogMode?: boolean

  commentOffset: number
  setCommentOffset: Dispatch<SetStateAction<number>>

  isLoading: boolean
  setIsLoading: Dispatch<SetStateAction<boolean>>

  hasMore: boolean
  setHasMore: Dispatch<SetStateAction<boolean>>
}

// Create a context for the current post
export const PostContext = createContext<PostContextType>({
  post: defaultPost(),
  setPost: () => {},
  isDialogMode: false,

  commentOffset: 0,
  setCommentOffset: () => {},

  isLoading: false,
  setIsLoading: () => {},

  hasMore: true,
  setHasMore: () => {},
})

export type DialogCloseButtonProps = {
  className?: string
  iconClassName?: string
}

export function DialogCloseButton({
  className,
  iconClassName,
}: DialogCloseButtonProps) {
  const { closeDialog } = usePostDialogStore()

  return (
    <Button
      variant="outline"
      size="icon"
      className={className}
      onClick={() => closeDialog()}
    >
      <ArrowLeft className={iconClassName} />
      <span className="sr-only">Close</span>
    </Button>
  )
}

export function BackwardButton({
  className,
  iconClassName,
}: {
  className?: string
  iconClassName?: string
}) {
  const router = useRouter()

  return (
    <Button
      variant="outline"
      size="icon"
      className={className}
      onClick={() => {
        if (window.history.length > 1) {
          router.back()
        } else {
          router.push('/')
        }
      }}
    >
      <ArrowLeft className={iconClassName} />
      <span className="sr-only">Back</span>
    </Button>
  )
}

export function MoreButton({
  className,
  iconClassName,
}: {
  className?: string
  iconClassName?: string
}) {
  const { accessToken, user } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { post, setPost } = useContext(PostContext)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const isAuthor = post && user && post.author.id === user.id

  const handleDelete = async () => {
    if (!post || !accessToken) return

    setIsLoading(true)
    try {
      await api.deletePost(accessToken, post.id)
      toast.success('Post deleted successfully')
      router.push('/')
    } catch (error) {
      console.error('Failed to delete post:', error)
      toast.error('Failed to delete post')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReport = async () => {
    if (!post || !accessToken) {
      toast.error('Please login to report content')
      return
    }

    setIsLoading(true)
    try {
      await api.reportContent(
        accessToken,
        'post',
        post.id,
        'inappropriate content'
      )
      toast.success('Post reported successfully')
    } catch (error) {
      console.error('Failed to report post:', error)
      toast.error('Failed to report post')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = () => {
    if (!post) return

    shareRoute(`/@${post.author.username}/photo/${post.id}`)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={className}
            disabled={isLoading}
          >
            <MoreHorizontal className={iconClassName} />
            <span className="sr-only">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleShare}>Share</DropdownMenuItem>

          {isAuthor && (
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              Edit
            </DropdownMenuItem>
          )}

          {isAuthor ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={(e) => e.preventDefault()}
                >
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your post and remove it from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <DropdownMenuItem onClick={handleReport}>Report</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {post && (
        <PostEditDialog
          post={post}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSuccess={() => {
            setIsEditDialogOpen(false)
            // Refresh post data
            if (post.id && accessToken) {
              api.getPost(post.id, accessToken).then((updatedPost) => {
                setPost(updatedPost)
              })
            }
          }}
        />
      )}
    </>
  )
}

export function PostTopControlBarPortal() {
  const Portal = usePortal()
  const isLargeScreen = useMediaQuery({ query: '(min-width: 80rem)' })

  return (
    <Portal
      container={(get) =>
        isLargeScreen ? get('photo-topbar-desktop') : get('photo-topbar-mobile')
      }
    >
      <PostTopControlBar />
    </Portal>
  )
}

export function PostTopControlBar() {
  const { isDialogMode } = useContext(PostContext)
  const buttonBase = cn(
    'bg-background/80',
    'hover:bg-background/90',
    'backdrop-blur-sm',
    'transition-all',
    'duration-200',
    'border-0',
    'shadow-sm',
    'hover:shadow-md',
    'rounded-full',
    'md:border',
    'md:border-border/50',
    'h-8 w-8',
    'md:h-10 md:w-10',
    'flex items-center justify-center'
  )
  const buttonPosition = cn('top-3', 'md:top-4', 'xl:top-6', 'xl:absolute')
  const buttonIcon = cn('size-4', 'md:size-5', 'text-foreground/80')
  const leftPosition = 'left-3 md:left-4 xl:left-6'
  const rightPosition = 'right-3 md:right-4 xl:right-6'

  return (
    <div
      className={cn(
        'sticky top-0 z-50',
        'w-full px-0 py-1 md:py-2',
        'flex items-center justify-between',
        'backdrop-blur-sm',
        'md:shadow-none',
        'xl:absolute xl:bg-transparent xl:backdrop-blur-none'
      )}
    >
      {isDialogMode ? (
        <DialogCloseButton
          className={cn(buttonBase, buttonPosition, leftPosition)}
          iconClassName={buttonIcon}
        />
      ) : (
        <BackwardButton
          className={cn(buttonBase, buttonPosition, leftPosition)}
          iconClassName={buttonIcon}
        />
      )}

      <MoreButton
        className={cn(buttonBase, buttonPosition, rightPosition)}
        iconClassName={buttonIcon}
      />
    </div>
  )
}

export type ImageViewerProps = {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  alt: string
}

export function ImageViewer({
  isOpen,
  onClose,
  imageUrl,
  alt,
}: ImageViewerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <VisuallyHidden>
        <DialogTitle>Image Viewer</DialogTitle>
        <DialogDescription>
          This is the image viewer for the photo
        </DialogDescription>
      </VisuallyHidden>

      <DialogPortal data-slot="dialog-portal">
        <DialogOverlay
          data-slot="dialog-overlay"
          className="bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 backdrop-blur-3xl"
        />
        <DialogContent
          data-slot="dialog-content"
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed inset-0 z-50 flex overflow-auto duration-150"
        >
          {/* Close button */}
          <Button
            variant="outline"
            size="icon"
            className="bg-background/80 hover:bg-background absolute top-4 right-4 z-50 rounded-full"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>

          <TransformWrapper>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="absolute z-60 flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => zoomOut()}
                    className="bg-background/20 hover:bg-background/50"
                  >
                    <ZoomOut className="size-4" />
                    <span className="sr-only">Zoom Out</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => zoomIn()}
                    className="bg-background/20 hover:bg-background/50"
                  >
                    <ZoomIn className="size-4" />
                    <span className="sr-only">Zoom In</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => resetTransform()}
                    className="bg-background/20 hover:bg-background/50"
                  >
                    <RotateCcw className="size-4" />
                    <span className="sr-only">Reset Zoom</span>
                  </Button>
                </div>

                <TransformComponent>
                  <div className="group/viewer relative h-[100vh] w-[100vw]">
                    <Image
                      src={imageUrl}
                      alt={alt}
                      fill
                      className="object-contain"
                      quality={100}
                      priority
                      placeholder="empty"
                    />
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}

export function PostImageSection() {
  const { post } = useContext(PostContext)
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(post.media.length)
  const [viewerOpen, setViewerOpen] = useState(false)
  const { isDialogMode } = useContext(PostContext)
  useEffect(() => {
    if (!api) {
      return
    }

    setCurrent(api.selectedScrollSnap())

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  useEffect(() => {
    setCount(post.media.length)
  }, [post.media, post.media.length])

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-3xl xl:h-full xl:flex-1',
        !isDialogMode && 'xl:bg-muted/50'
      )}
    >
      {/* desktop photo section controls */}
      <PortalReceiver
        portalKey="photo-topbar-desktop"
        className="hidden xl:block"
      />

      {/* photo section image */}
      <div className="h-[35vh] w-full md:h-[50vh] xl:h-full">
        <Carousel setApi={setApi} className="grid h-full w-full">
          <CarouselContent className="h-full">
            {post.media.map((item, index) => (
              <CarouselItem key={index} className="h-full">
                <div className="relative h-full w-full">
                  <Image
                    src={item.url}
                    alt={`${post.title} - Image ${index + 1}`}
                    fill
                    className="cursor-zoom-in object-contain"
                    onClick={() => setViewerOpen(true)}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* carousel control buttons */}
          {post.media.length > 1 && (
            <>
              <CarouselPrevious
                variant="outline"
                size="icon"
                className="left-4 hidden lg:flex"
              />
              <CarouselNext
                variant="outline"
                size="icon"
                className="right-4 hidden lg:flex"
              />
            </>
          )}
        </Carousel>

        {/* image viewer */}
        <ImageViewer
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          imageUrl={post.media[current]?.url}
          alt={`${post.title} - Image ${current + 1}`}
        />

        {/* bottom photo index */}
        {count > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 py-2">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                className={cn(
                  'h-2 w-2 rounded-full transition-all',
                  current === index
                    ? 'w-4 bg-black'
                    : 'bg-black/50 hover:bg-black/70'
                )}
                onClick={() => api?.scrollTo(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function PostHeader() {
  const { post } = useContext(PostContext)

  return (
    <div className="mb-4 flex items-center justify-between">
      {/* author info */}
      <div className="flex items-center gap-3">
        {/* author avatar */}
        <Link href={`/@${post.author.username}`}>
          <UserAvatar
            name={post.author.displayName}
            avatar={post.author.avatar}
            className="size-10 cursor-pointer hover:opacity-90 md:size-12"
          />
        </Link>

        {/* author and post date */}
        <div>
          <Link
            href={`/@${post.author.username}`}
            className="cursor-pointer text-sm font-medium hover:underline md:text-base"
          >
            {post.author.displayName}
          </Link>
          <p className="text-muted-foreground text-xs">
            <TimeFormatter dateString={post.createdAt} />
          </p>
        </div>
      </div>

      {/* follow button */}
      <FollowButton relationship={post.author.relationship} withIcon />
    </div>
  )
}

export function PostDetails() {
  const { post, isDialogMode } = useContext(PostContext)

  const TitleComponent = isDialogMode ? DialogTitle : 'h1'

  return (
    <div className="border-b p-4 xl:px-8 xl:pt-8">
      {/*post header */}
      <PostHeader />

      {/* title */}
      <TitleComponent className="mb-3 text-base font-medium md:text-lg">
        {post.title}
      </TitleComponent>

      {/* content */}
      <Linkify as="p" className="text-primary text-sm leading-relaxed md:text-base">
        {post.content}
      </Linkify>

      {/* visibility */}
      <div className="text-muted-foreground/80 mt-6 flex items-center gap-1 text-xs">
        <Eye className="size-3 md:size-4" />
        <span>
          {post.visibility?.charAt(0) + post.visibility?.slice(1).toLowerCase()}
        </span>
      </div>

      {/* interaction buttons */}
      <InteractionButtons />
    </div>
  )
}

export function ScrollLoader({
  active,
  className,
  children,
}: {
  active: boolean
  className?: string
  children: React.ReactNode
}) {
  const {
    post,
    setPost,
    commentOffset,
    setCommentOffset,
    isLoading,
    hasMore,
    setIsLoading,
    setHasMore,
  } = useContext(PostContext)
  const { accessToken } = useAuthStore()
  const COMMENTS_PER_PAGE = 10

  const loadMoreComments = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const newComments = await api.getComments(post.id, {
        accessToken: accessToken || undefined,
        limit: COMMENTS_PER_PAGE,
        offset: commentOffset + COMMENTS_PER_PAGE,
      })

      if (newComments.length < COMMENTS_PER_PAGE) {
        setHasMore(false)
      }

      setCommentOffset(commentOffset + COMMENTS_PER_PAGE)
      setPost((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), ...newComments],
      }))
    } catch (error) {
      console.error('Failed to load more comments:', error)
      toast.error('Failed to load more comments')
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, post.id, commentOffset, isLoading, hasMore])

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollHeight, scrollTop, clientHeight } = e.currentTarget
      // Load more when user scrolls to bottom (with 20px threshold)
      if (scrollHeight - scrollTop - clientHeight < 20) {
        loadMoreComments()
      }
    },
    [loadMoreComments]
  )

  return (
    <div className={className} onScroll={active ? handleScroll : undefined}>
      {children}
      {active && (
        <>
          {/* loading indicator */}
          {isLoading && (
            <div className="flex justify-center py-4">
              <div className="text-muted-foreground">
                Loading more comments...
              </div>
            </div>
          )}
          {/* end of comments indicator */}
          {!hasMore && post.comments && post.comments.length > 0 && (
            <div className="text-muted-foreground py-4 text-center">
              No more comments to load
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function ContentSection({ isLargeScreen }: { isLargeScreen: boolean }) {
  return (
    <div className={cn('bg-background flex w-full flex-col xl:w-lg 2xl:w-xl')}>
      <ScrollLoader
        active={isLargeScreen}
        className="flex-1 xl:overflow-y-auto"
      >
        <PostDetails />

        {/* comments */}
        <CommentSection />
      </ScrollLoader>

      {/* desktop comment input container */}
      <PortalReceiver
        portalKey="photo-comment-input-desktop"
        className="hidden xl:block"
      />
    </div>
  )
}

export function CommentInputPortal(
  props: React.ComponentProps<typeof CommentInput>
) {
  const Portal = usePortal()
  const isLargeScreen = useMediaQuery({ query: '(min-width: 80rem)' })

  return (
    <Portal
      container={(get) =>
        isLargeScreen
          ? get('photo-comment-input-desktop')
          : get('photo-comment-input-mobile')
      }
    >
      <CommentInput className="p-4" {...props} />
    </Portal>
  )
}

export function InteractionButtons() {
  const { post } = useContext(PostContext)

  const {
    interactions: { likes, saves },
  } = post

  const { accessToken } = useAuthStore()
  const [likeLoading, setLikeLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [liked, setLiked] = useState(likes.hasLiked)
  const [saved, setSaved] = useState(saves.hasSaved)
  const [likeCount, setLikeCount] = useState(likes.count)
  const [saveCount, setSaveCount] = useState(saves.count)

  // Sync state with post data when it changes
  useEffect(() => {
    setLiked(likes.hasLiked)
    setLikeCount(likes.count)
    setSaved(saves.hasSaved)
    setSaveCount(saves.count)
  }, [likes.hasLiked, likes.count, saves.hasSaved, saves.count])

  if (!post) return null

  const handleAuthRequired = () => {
    toast.error('Please login to continue')
  }

  const handleLike = async () => {
    if (likeLoading) return
    if (!accessToken) {
      handleAuthRequired()
      return
    }

    setLikeLoading(true)
    try {
      const res = await api.likePost(accessToken, post.id, !liked)
      // Update local state
      setLiked(res)
      setLikeCount((prev) => (res ? prev + 1 : prev - 1))
      // Update post object for consistency
      likes.hasLiked = res
      likes.count = res ? likeCount + 1 : likeCount - 1
    } catch (error) {
      console.error('Failed to like/unlike:', error)
      toast.error('Failed to like post')
      // Revert local state on error
      setLiked(likes.hasLiked)
      setLikeCount(likes.count)
    } finally {
      setLikeLoading(false)
    }
  }

  const handleSave = async () => {
    if (saveLoading) return
    if (!accessToken) {
      handleAuthRequired()
      return
    }

    setSaveLoading(true)
    try {
      const res = await api.savePost(accessToken, post.id, !saved)
      // Update local state
      setSaved(res)
      setSaveCount((prev) => (res ? prev + 1 : prev - 1))
      // Update post object for consistency
      saves.hasSaved = res
      saves.count = res ? saveCount + 1 : saveCount - 1
    } catch (error) {
      console.error('Failed to save/unsave:', error)
      toast.error('Failed to save post')
      // Revert local state on error
      setSaved(saves.hasSaved)
      setSaveCount(saves.count)
    } finally {
      setSaveLoading(false)
    }
  }

  const handleShare = () => {
    shareRoute(`/@${post.author.username}/photo/${post.id}`)
  }

  return (
    <div className="mt-2 flex">
      {/* interaction buttons area */}
      <div className="text-foreground/80 flex flex-1 items-center gap-6 text-sm font-bold">
        {/* like button */}
        <button
          className={cn(
            'flex items-center gap-2 transition-colors',
            liked ? 'text-rose-600' : 'hover:text-rose-600',
            likeLoading && 'cursor-not-allowed opacity-50'
          )}
          onClick={handleLike}
          disabled={likeLoading}
        >
          <Heart className={cn('size-4', liked && 'fill-current')} />
          {likeCount}
        </button>

        {/* save button */}
        <button
          className={cn(
            'flex items-center gap-2 transition-colors',
            saved ? 'text-blue-500' : 'hover:text-blue-600',
            saveLoading && 'cursor-not-allowed opacity-50'
          )}
          onClick={handleSave}
          disabled={saveLoading}
        >
          <Bookmark className={cn('size-4', saved && 'fill-current')} />
          {saveCount}
        </button>
      </div>

      {/* more button */}
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={handleShare}
      >
        <Share2 className="size-6" />
      </Button>
    </div>
  )
}

export type PostMainProps = {
  post: Post
  isDialogMode?: boolean
}

export function PostMain({ post: initialPost, isDialogMode }: PostMainProps) {
  const { accessToken } = useAuthStore()
  const [post, setPost] = useState(initialPost)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [commentOffset, setCommentOffset] = useState(0)

  const isLargeScreen = useMediaQuery({ query: '(min-width: 80rem)' })

  const updatePostComments = () => {
    api
      .getComments(post.id, {
        accessToken: accessToken || undefined,
        limit: 10,
        offset: 0,
      })
      .then((comments) => {
        setPost((prev) => ({
          ...prev,
          comments,
        }))
      })
      .catch((error) => {
        console.error('Failed to get comments:', error)
        toast.error('Failed to get comments')
      })
  }

  const onCommentSubmitted = () => {
    updatePostComments()
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
  }

  // if post is passed by dialog, comments are initially undefined, so we need to fetch them
  useEffect(() => {
    if (!post.comments) {
      updatePostComments()
    }
  }, [post.comments, post])

  return (
    <PostContext.Provider
      value={{
        post,
        setPost,
        isDialogMode,
        commentOffset,
        setCommentOffset,
        isLoading,
        setIsLoading,
        hasMore,
        setHasMore,
      }}
    >
      <div
        className={cn(
          'flex w-full flex-col',
          isDialogMode
            ? 'h-[100dvh] md:h-full md:max-h-screen'
            : 'h-[calc(100dvh-7rem)] md:h-[calc(100dvh-3.5rem)] md:max-h-[calc(screen-3.5rem)]'
        )}
      >
        {/* main content area: mobile overall scrollable, PC horizontal layout */}
        <ScrollLoader
          active={!isLargeScreen}
          className="flex flex-1 flex-col overflow-y-auto xl:flex-row xl:overflow-hidden"
        >
          {/* mobile photo section controls */}
          <PortalReceiver
            portalKey="photo-topbar-mobile"
            className="xl:hidden"
          />
          <PostImageSection />

          {/* content area: PC independent scroll, mobile as part of overall scroll */}
          <ContentSection isLargeScreen={isLargeScreen} />
        </ScrollLoader>

        {/* mobile comment input container */}
        <PortalReceiver
          portalKey="photo-comment-input-mobile"
          className="xl:hidden"
        />

        {/* comment input portal */}
        <CommentInputPortal onCommentSubmitted={onCommentSubmitted} />

        {/* top control bar portal */}
        <PostTopControlBarPortal />
      </div>
    </PostContext.Provider>
  )
}
