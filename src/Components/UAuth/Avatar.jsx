import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

export default function Avatar({ url, size, onUpload, onDelete, defaultUrl = '/user.svg' }) {
  const [avatarUrl, setAvatarUrl] = useState(defaultUrl)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!url) {
      // no avatar set in DB → show default
      setAvatarUrl(defaultUrl)
      return
    }

    // If the DB value is a full URL (Google, etc.), just use it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      setAvatarUrl(url)
      return
    }

    // Otherwise treat it as a Supabase Storage path
    downloadImage(url)
  }, [url, defaultUrl])

  async function downloadImage(path) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path)
      if (error) {
        throw error
      }
      const url = URL.createObjectURL(data)
      setAvatarUrl(url)
    } catch (error) {
      console.log('Error downloading image: ', error.message)

      setAvatarUrl(defaultUrl)
    }
  }

  async function uploadAvatar(event) {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      onUpload(event, filePath)
    } catch (error) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  async function deleteAvatar() {
      if (url && !url.startsWith('http')) {
        // Only attempt to delete from storage if it's a storage path
        const { error } = await supabase.storage.from('avatars').remove([url])
        if (error) {
          console.log('Error deleting image: ', error.message)
          return
        }
      }

      setAvatarUrl(defaultUrl)
      onDelete()
    }

  return (
    <div>
      <img
        src={avatarUrl}
        alt="Avatar"
        className="avatar image"
        style={{ height: size, width: size, borderRadius: '50%' }}
      />

      <div style={{ width: size }}>
        <label className="button primary block" htmlFor="single">
          {uploading ? 'Uploading ...' : 'Upload'}
        </label>
        <button
          className="button danger block"
          type="button"
          onClick={deleteAvatar}
        >
          Delete
        </button>

        <input
          style={{ visibility: 'hidden', position: 'absolute' }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>
    </div>
  )
}