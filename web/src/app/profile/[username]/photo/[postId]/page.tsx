import { api } from '@/api'
import { PostPageContent } from '@/components/post/post-page'

interface PostPageProps {
  params: Promise<{ postId: string }>
}

export async function generateMetadata({ params }: PostPageProps) {
  const { postId } = await params
  try {
    const post = await api.getPost(postId)

    return {
      title: `${post.title} | ${post.author.username}'s Photo | PhotoGlow`,
      description: `Check out ${post.author.username}'s photos on PhotoGlow`,
    }
  } catch (error) {
    return {
      title: 'Photo Not Found | PhotoGlow',
      description: 'This photo does not exist or has been removed',
    }
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params
  return <PostPageContent postId={postId} />
}
