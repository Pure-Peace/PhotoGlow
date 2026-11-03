import {
  UploadProgress,
  UploadMediaResponse,
} from '@photoglow/shared/types/api'
import { authorizationHeader, buildUrl, respError } from '../../lib/utils'

// Get pending media drafts for the current user
async function getUserMediaDrafts(
  accessToken: string
): Promise<UploadMediaResponse[]> {
  const res = await fetch(buildUrl('media/my/drafts'), {
    headers: {
      ...authorizationHeader(accessToken),
    },
    credentials: 'include',
    cache: 'no-store',
  })

  if (!res.ok) {
    throw await respError(res)
  }

  return res.json()
}

async function uploadMedia(
  accessToken: string,
  media: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadMediaResponse> {
  const formData = new FormData()
  formData.append('media', media)

  const xhr = new XMLHttpRequest()
  xhr.withCredentials = true

  const mediaType = media.type.startsWith('image/') ? 'image' : 'video'

  // Create a promise to handle the upload
  const uploadPromise = new Promise<UploadMediaResponse>((resolve, reject) => {
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100)
        onProgress({
          progress,
          bytesUploaded: event.loaded,
          totalBytes: event.total,
        })
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          resolve({
            url: response.url,
            draftId: response.draftId,
            mediaType,
          })
        } catch (error) {
          console.error('Failed to parse upload response:', error)
          reject(new Error('Failed to parse upload response'))
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'))
    })

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'))
    })
  })

  // Start the upload
  xhr.open('POST', buildUrl('media/upload'))
  xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
  xhr.send(formData)

  // Return the promise
  return uploadPromise
}

// Helper function to abort ongoing upload
function abortUpload(xhr: XMLHttpRequest) {
  xhr.abort()
}

export { getUserMediaDrafts, uploadMedia, abortUpload }
